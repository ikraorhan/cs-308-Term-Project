from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from api.permissions import IsSalesManager
from .models import Campaign
from .serializers import CampaignSerializer, ProductPriceSerializer
from product_manager_api.models import Product, Order, OrderItem
from django.db.models import Sum, Count, F
from django.db.models.functions import TruncDate
from django.utils import timezone
from datetime import timedelta

@api_view(['GET'])
@permission_classes([IsSalesManager])
def dashboard_stats(request):
    """
    Get aggregated statistics for the Sales Manager Dashboard.
    """
    try:
        # 1. Total Revenue (from delivered orders)
        total_revenue = Order.objects.filter(status='delivered').aggregate(Sum('total_price'))['total_price__sum'] or 0

        # 2. Total Orders
        total_orders = Order.objects.count()

        # 3. Active Campaigns
        active_campaigns = Campaign.objects.filter(status='active').count()

        # 4. Revenue over last 30 days
        last_30_days = timezone.now().date() - timedelta(days=30)
        
        # Fetch relevant orders and aggregate in Python to avoid SQLite date truncation issues
        recent_orders = Order.objects.filter(
            status='delivered',
            order_date__gte=last_30_days
        ).values('order_date', 'total_price')
        
        revenue_map = {}
        for order in recent_orders:
            # order_date should be a date object or string
            d_val = order['order_date']
            if hasattr(d_val, 'strftime'):
                d_str = d_val.strftime('%Y-%m-%d')
            else:
                d_str = str(d_val)
                
            revenue_map[d_str] = revenue_map.get(d_str, 0) + float(order['total_price'])
            
        chart_data = [
            {"date": d, "revenue": revenue_map[d]} 
            for d in sorted(revenue_map.keys())
        ]

        # 5. Top Selling Products
        # Aggregate quantity from OrderItems
        top_products = OrderItem.objects.values('product_name').annotate(
            total_quantity=Sum('quantity'),
            total_revenue=Sum(F('quantity') * F('price'))
        ).order_by('-total_quantity')[:5]

        return Response({
            "total_revenue": total_revenue,
            "total_orders": total_orders,
            "active_campaigns": active_campaigns,
            "revenue_chart": chart_data,
            "top_products": list(top_products)
        })
    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET', 'POST'])
@permission_classes([IsSalesManager])
def campaign_list_create(request):
    if request.method == 'GET':
        campaigns = Campaign.objects.all()
        serializer = CampaignSerializer(campaigns, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = CampaignSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsSalesManager])
def campaign_detail(request, pk):
    try:
        campaign = Campaign.objects.get(pk=pk)
    except Campaign.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = CampaignSerializer(campaign)
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = CampaignSerializer(campaign, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        campaign.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['PUT'])
@permission_classes([IsSalesManager])
def update_product_price(request, product_id):
    try:
        product = Product.objects.get(id=product_id)
    except Product.DoesNotExist:
        return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)
    
    serializer = ProductPriceSerializer(product, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        
        # Check if we should update cost based on new price (business rule from Product model: cost = 0.5 * price if not set)
        if 'price' in request.data and not product.cost:
             product.cost = product.price * 0.5
             product.save()

        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
