"""
Product Manager API Views
Handles product management, stock management, order management, and comment approval
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny  # TODO: Add proper authentication
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
import json

# Mock data - Doğru ürünler (index.js'den)
MOCK_PRODUCTS = [
    {"id": 1, "name": "Cat Food – Adult Salmon 1.5kg", "description": "High protein salmon food for adult cats.", "price": 150, "image_url": "/images/Cat Food – Adult Salmon 1.5kg.jpg", "category": "Food", "quantity_in_stock": 25},
    {"id": 2, "name": "Cat Food – Kitten Chicken 2kg", "description": "Balanced nutrition chicken food for kittens.", "price": 180, "image_url": "/images/Cat Food – Kitten Chicken 2kg.jpg", "category": "Food", "quantity_in_stock": 20},
    {"id": 3, "name": "Dog Food – Adult Lamb 3kg", "description": "Lamb dry food for adult dogs.", "price": 250, "image_url": "/images/Dog Food – Adult Lamb 3kg.jpg", "category": "Food", "quantity_in_stock": 30},
    {"id": 4, "name": "Dog Food – Puppy Chicken 3kg", "description": "Easy to digest chicken food for puppies.", "price": 230, "image_url": "/images/Dog Food – Puppy Chicken 3kg.jpg", "category": "Food", "quantity_in_stock": 18},
    {"id": 5, "name": "Adjustable Cat Collar with Bell", "description": "Comfortable adjustable collar with bell for cats. Available in multiple colors.", "price": 45, "image_url": "/images/Adjustable Cat Collar with Bell.jpg", "category": "Collars & Leashes", "quantity_in_stock": 15},
    {"id": 6, "name": "Small Breed Dog Nylon Collar", "description": "Durable nylon collar for small breed dogs. Lightweight and comfortable.", "price": 55, "image_url": "/images/Small Breed Dog Nylon Collar.jpg", "category": "Collars & Leashes", "quantity_in_stock": 12},
    {"id": 7, "name": "Automatic Retractable Leash 5m", "description": "5-meter retractable leash with ergonomic handle and safety lock.", "price": 120, "image_url": "/images/Automatic Retractable Leash 5m.jpg", "category": "Collars & Leashes", "quantity_in_stock": 8},
    {"id": 8, "name": "Chest Harness for Medium Dogs", "description": "Comfortable chest harness that distributes pressure evenly. Perfect for walks.", "price": 95, "image_url": "/images/Chest Harness for Medium Dogs.jpg", "category": "Collars & Leashes", "quantity_in_stock": 10},
    {"id": 9, "name": "Stainless Steel Food Bowl (Cat/Small Dog)", "description": "Durable stainless steel bowl, easy to clean and hygienic.", "price": 35, "image_url": "/images/Stainless Steel Food Bowl (Cat:Small Dog).jpg", "category": "Food & Water Bowls", "quantity_in_stock": 22},
    {"id": 10, "name": "Dual Compartment Plastic Food-Water Bowl", "description": "Two-compartment bowl for food and water. Space-saving design.", "price": 40, "image_url": "/images/Dual Compartment Plastic Food-Water Bowl.jpg", "category": "Food & Water Bowls", "quantity_in_stock": 16},
    {"id": 11, "name": "Non-Slip Ceramic Cat Bowl", "description": "Ceramic bowl with non-slip base. Elegant design for your cat.", "price": 50, "image_url": "/images/Non-Slip Ceramic Cat Bowl.jpg", "category": "Food & Water Bowls", "quantity_in_stock": 14},
    {"id": 12, "name": "Automatic Water Dispenser 1.5L", "description": "Automatic water dispenser with 1.5L capacity. Keeps water fresh and clean.", "price": 180, "image_url": "/images/Automatic Water Dispenser 1.5L.jpg", "category": "Food & Water Bowls", "quantity_in_stock": 6},
    {"id": 13, "name": "Cat Fishing Rod with Feather", "description": "Interactive fishing rod toy with feathers. Perfect for playtime with your cat.", "price": 65, "image_url": "/images/Cat Fishing Rod with Feather.jpg", "category": "Toys", "quantity_in_stock": 20},
    {"id": 14, "name": "Cat Ball with Bell (3-Pack)", "description": "Set of 3 jingle balls for cats. Stimulates play and exercise.", "price": 30, "image_url": "/images/Cat Ball with Bell (3-Pack).jpg", "category": "Toys", "quantity_in_stock": 25},
    {"id": 15, "name": "Plush Dog Toy (Bite Resistant)", "description": "Durable plush toy for dogs. Resistant to chewing and tearing.", "price": 75, "image_url": "/images/Plush Dog Toy (Bite Resistant).jpg", "category": "Toys", "quantity_in_stock": 18},
    {"id": 16, "name": "Rope Tug Toy for Dogs", "description": "Strong rope toy for tug-of-war games. Promotes bonding and exercise.", "price": 55, "image_url": "/images/Rope Tug Toy for Dogs.jpg", "category": "Toys", "quantity_in_stock": 15},
    {"id": 17, "name": "Clumping Cat Litter 10L", "description": "Highly absorbent clumping cat litter. Easy to clean and odor control.", "price": 85, "image_url": "/images/Clumping Cat Litter 10L.jpg", "category": "Grooming & Hygiene", "quantity_in_stock": 30},
    {"id": 18, "name": "Dog Shampoo (Sensitive Skin)", "description": "Gentle shampoo for dogs with sensitive skin. Hypoallergenic formula.", "price": 60, "image_url": "/images/Dog Shampoo (Sensitive Skin).jpg", "category": "Grooming & Hygiene", "quantity_in_stock": 12},
    {"id": 19, "name": "Fur Comb (Cat/Dog)", "description": "Professional grooming comb for removing loose fur and preventing matting.", "price": 45, "image_url": "/images/Fur Comb (Cat:Dog).jpg", "category": "Grooming & Hygiene", "quantity_in_stock": 20},
    {"id": 20, "name": "Pet Cleaning Wipes (50 Pack)", "description": "Gentle cleaning wipes for paws, face, and body. Aloe vera enriched.", "price": 35, "image_url": "/images/Pet Cleaning Wipes (50 Pack).jpg", "category": "Grooming & Hygiene", "quantity_in_stock": 28},
    {"id": 21, "name": "Cat Treat – Salmon Cubes 60g", "description": "Delicious salmon-flavored treats for cats. High protein, low calorie.", "price": 25, "image_url": "/images/Cat Treat – Salmon Cubes 60g.jpg", "category": "Treats & Snacks", "quantity_in_stock": 35},
    {"id": 22, "name": "Cat Treat – Cheese Flavored Crunch 50g", "description": "Crunchy cheese-flavored treats. Irresistible for your cat.", "price": 22, "image_url": "/images/Cat Treat – Cheese Flavored Crunch 50g.jpg", "category": "Treats & Snacks", "quantity_in_stock": 32},
    {"id": 23, "name": "Dog Treat Biscuit – Chicken 200g", "description": "Tasty chicken-flavored biscuits for dogs. Training rewards or snacks.", "price": 40, "image_url": "/images/Dog Treat Biscuit – Chicken 200g.jpg", "category": "Treats & Snacks", "quantity_in_stock": 24},
    {"id": 24, "name": "Dog Chew Bone – Mini (5-Pack)", "description": "Set of 5 mini chew bones. Promotes dental health and satisfies chewing needs.", "price": 50, "image_url": "/images/Dog Chew Bone – Mini (5-Pack).jpg", "category": "Treats & Snacks", "quantity_in_stock": 18},
]

MOCK_ORDERS = [
    {
        "delivery_id": "DEL-001",
        "customer_id": "CUST-001",
        "customer_name": "John Doe",
        "customer_email": "john@example.com",
        "product_id": 1,
        "product_name": "Premium Dog Food",
        "quantity": 2,
        "total_price": 179.98,
        "delivery_address": "123 Main St, Istanbul, Turkey",
        "status": "processing",
        "order_date": "2024-01-15",
        "delivery_date": None
    },
    {
        "delivery_id": "DEL-002",
        "customer_id": "CUST-002",
        "customer_name": "Jane Smith",
        "customer_email": "jane@example.com",
        "product_id": 2,
        "product_name": "Cat Litter Box",
        "quantity": 1,
        "total_price": 45.99,
        "delivery_address": "456 Oak Ave, Ankara, Turkey",
        "status": "in-transit",
        "order_date": "2024-01-14",
        "delivery_date": "2024-01-20"
    },
    {
        "delivery_id": "DEL-003",
        "customer_id": "CUST-003",
        "customer_name": "Bob Wilson",
        "customer_email": "bob@example.com",
        "product_id": 3,
        "product_name": "Bird Cage - Large",
        "quantity": 1,
        "total_price": 129.99,
        "delivery_address": "789 Pine Rd, Izmir, Turkey",
        "status": "delivered",
        "order_date": "2024-01-10",
        "delivery_date": "2024-01-18"
    },
]

MOCK_COMMENTS = [
    {
        "id": 1,
        "product_id": 1,
        "product_name": "Premium Dog Food",
        "customer_name": "John Doe",
        "customer_email": "john@example.com",
        "rating": 5,
        "comment": "Great product! My dog loves it.",
        "status": "pending",
        "submitted_date": "2024-01-16"
    },
    {
        "id": 2,
        "product_id": 2,
        "product_name": "Cat Litter Box",
        "customer_name": "Jane Smith",
        "customer_email": "jane@example.com",
        "rating": 4,
        "comment": "Good quality, easy to clean.",
        "status": "approved",
        "submitted_date": "2024-01-15"
    },
    {
        "id": 3,
        "product_id": 3,
        "product_name": "Bird Cage - Large",
        "customer_name": "Bob Wilson",
        "customer_email": "bob@example.com",
        "rating": 5,
        "comment": "Perfect size for my parrot!",
        "status": "pending",
        "submitted_date": "2024-01-17"
    },
]

MOCK_CATEGORIES = ["Food", "Accessories", "Housing", "Toys", "Health"]

# Product Management
@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def product_list_create(request):
    """Get all products or create a new product"""
    if request.method == 'GET':
        # Use mock data (doğru ürünler burada)
        sort_option = request.query_params.get('sort', '').strip().lower()
        # IMPORTANT: Use deep copy or reference directly, but don't override stock from DB
        # Since we're using mock data for stock management, return MOCK_PRODUCTS directly
        # Deep copy to avoid mutating the original list when sorting
        import copy
        products = copy.deepcopy(MOCK_PRODUCTS)
        
        # NOTE: We're NOT syncing from DB anymore because we manage stock in MOCK_PRODUCTS
        # If DB has stock values, we ignore them and use MOCK_PRODUCTS values
        # This ensures create_order updates are reflected in GET requests
        
        # Apply sorting
        if sort_option == 'price':
            products.sort(key=lambda p: (float(p.get('price', 0)), p.get('name', '').lower()))
        elif sort_option == 'popularity':
            products.sort(key=lambda p: (-int(p.get('quantity_in_stock', 0)), p.get('name', '').lower()))
        
        return Response({
            'products': products,
            'count': len(products)
        }, status=status.HTTP_200_OK)
    
    elif request.method == 'POST':
        # Create new product
        new_product = {
            'id': len(MOCK_PRODUCTS) + 1,
            **request.data
        }
        MOCK_PRODUCTS.append(new_product)
        return Response(new_product, status=status.HTTP_201_CREATED)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([AllowAny])
def product_detail(request, product_id):
    """Get, update, or delete a specific product"""
    product = next((p for p in MOCK_PRODUCTS if p['id'] == product_id), None)
    
    if not product:
        return Response(
            {'error': 'Product not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    if request.method == 'GET':
        return Response(product, status=status.HTTP_200_OK)
    
    elif request.method == 'PUT':
        # Update product
        product.update(request.data)
        return Response(product, status=status.HTTP_200_OK)
    
    elif request.method == 'DELETE':
        MOCK_PRODUCTS.remove(product)
        return Response(
            {'message': 'Product deleted successfully'},
            status=status.HTTP_200_OK
        )

# Category Management
@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def category_list_create(request):
    """Get all categories or create a new category"""
    if request.method == 'GET':
        return Response({
            'categories': MOCK_CATEGORIES,
            'count': len(MOCK_CATEGORIES)
        }, status=status.HTTP_200_OK)
    
    elif request.method == 'POST':
        category = request.data.get('name')
        if category and category not in MOCK_CATEGORIES:
            MOCK_CATEGORIES.append(category)
            return Response(
                {'message': 'Category created', 'category': category},
                status=status.HTTP_201_CREATED
            )
        return Response(
            {'error': 'Category already exists or invalid name'},
            status=status.HTTP_400_BAD_REQUEST
        )

@api_view(['DELETE'])
@permission_classes([AllowAny])
def category_delete(request, category_name):
    """Delete a category"""
    if category_name in MOCK_CATEGORIES:
        MOCK_CATEGORIES.remove(category_name)
        return Response(
            {'message': 'Category deleted successfully'},
            status=status.HTTP_200_OK
        )
    return Response(
        {'error': 'Category not found'},
        status=status.HTTP_404_NOT_FOUND
    )

# Stock Management
@api_view(['GET'])
@permission_classes([AllowAny])
def stock_list(request):
    """Get stock status for all products"""
    stock_data = [
        {
            'product_id': p['id'],
            'product_name': p['name'],
            'quantity_in_stock': p['quantity_in_stock'],
            'low_stock': p['quantity_in_stock'] < 20,
            'out_of_stock': p['quantity_in_stock'] == 0
        }
        for p in MOCK_PRODUCTS
    ]
    return Response({'stock': stock_data}, status=status.HTTP_200_OK)

@api_view(['PUT'])
@permission_classes([AllowAny])
def stock_update(request, product_id):
    """Update stock quantity for a product"""
    product = next((p for p in MOCK_PRODUCTS if p['id'] == product_id), None)
    
    if not product:
        return Response(
            {'error': 'Product not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    new_quantity = request.data.get('quantity_in_stock')
    if new_quantity is not None:
        product['quantity_in_stock'] = int(new_quantity)
        return Response(product, status=status.HTTP_200_OK)
    
    return Response(
        {'error': 'Invalid quantity'},
        status=status.HTTP_400_BAD_REQUEST
    )

# Order/Delivery Management
@api_view(['GET'])
@permission_classes([AllowAny])
def order_list(request):
    """Get all orders/deliveries"""
    status_filter = request.query_params.get('status')
    
    orders = MOCK_ORDERS.copy()
    if status_filter:
        orders = [o for o in orders if o['status'] == status_filter]
    
    return Response({
        'orders': orders,
        'count': len(orders)
    }, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([AllowAny])
def order_detail(request, delivery_id):
    """Get specific order details"""
    order = next((o for o in MOCK_ORDERS if o['delivery_id'] == delivery_id), None)
    
    if not order:
        return Response(
            {'error': 'Order not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    return Response(order, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([AllowAny])
def order_history(request):
    """Get order history for a specific user by email"""
    email = request.query_params.get('email')
    
    if not email:
        return Response(
            {'error': 'Email parameter is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        from .models import Order
        USE_ORDER_DB = True
    except ImportError:
        USE_ORDER_DB = False
        Order = None
    
    if USE_ORDER_DB and Order:
        # Use database
        orders_query = Order.objects.filter(customer_email=email).order_by('-order_date', '-created_at')
        
        orders_data = [{
            'delivery_id': o.delivery_id,
            'customer_id': o.customer_id,
            'customer_name': o.customer_name,
            'customer_email': o.customer_email,
            'product_id': o.product_id,
            'product_name': o.product_name,
            'quantity': o.quantity,
            'total_price': float(o.total_price),
            'delivery_address': o.delivery_address,
            'status': o.status,
            'order_date': o.order_date.strftime('%Y-%m-%d'),
            'delivery_date': o.delivery_date.strftime('%Y-%m-%d') if o.delivery_date else None,
            'created_at': o.created_at.isoformat() if hasattr(o, 'created_at') else None,
        } for o in orders_query]
    else:
        # Use mock data
        orders_data = [
            {
                'delivery_id': o.get('delivery_id', ''),
                'customer_id': o.get('customer_id', ''),
                'customer_name': o.get('customer_name', ''),
                'customer_email': o.get('customer_email', ''),
                'product_id': o.get('product_id', 0),
                'product_name': o.get('product_name', ''),
                'quantity': o.get('quantity', 0),
                'total_price': float(o.get('total_price', 0)),
                'delivery_address': o.get('delivery_address', ''),
                'status': o.get('status', 'processing'),
                'order_date': o.get('order_date', ''),
                'delivery_date': o.get('delivery_date'),
            }
            for o in MOCK_ORDERS if o.get('customer_email', '').lower() == email.lower()
        ]
    
    return Response({
        'orders': orders_data,
        'count': len(orders_data)
    }, status=status.HTTP_200_OK)

@api_view(['PUT'])
@permission_classes([AllowAny])
def order_update_status(request, delivery_id):
    """Update order status (processing, in-transit, delivered)"""
    order = next((o for o in MOCK_ORDERS if o['delivery_id'] == delivery_id), None)
    
    if not order:
        return Response(
            {'error': 'Order not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    new_status = request.data.get('status')
    valid_statuses = ['processing', 'in-transit', 'delivered']
    
    if new_status in valid_statuses:
        order['status'] = new_status
        if new_status == 'delivered' and not order.get('delivery_date'):
            from datetime import datetime
            order['delivery_date'] = datetime.now().strftime('%Y-%m-%d')
        return Response(order, status=status.HTTP_200_OK)
    
    return Response(
        {'error': f'Invalid status. Must be one of: {valid_statuses}'},
        status=status.HTTP_400_BAD_REQUEST
    )

# Comment Approval
# Import Review and Order models
try:
    from .models import Review, Order
    USE_DATABASE = True
except ImportError:
    USE_DATABASE = False
    Review = None
    Order = None

@api_view(['POST'])
@permission_classes([AllowAny])
def review_create(request):
    """Create a new review/comment"""
    if not USE_DATABASE or not Review:
        # Fallback to mock data
        new_review = {
            'id': len(MOCK_COMMENTS) + 1,
            **request.data,
            'status': 'pending',
            'submitted_date': timezone.now().strftime('%Y-%m-%d')
        }
        MOCK_COMMENTS.append(new_review)
        return Response(new_review, status=status.HTTP_201_CREATED)
    
    try:
        review = Review.objects.create(
            product_id=request.data.get('product_id') or request.data.get('productId'),
            product_name=request.data.get('product_name') or request.data.get('productName', ''),
            user_id=str(request.data.get('user_id') or request.data.get('userId', '')),
            user_name=request.data.get('user_name') or request.data.get('userName', ''),
            user_email=request.data.get('user_email') or request.data.get('userEmail', ''),
            rating=request.data.get('rating', 5),
            comment=request.data.get('comment', ''),
            status='pending'
        )
        
        return Response({
            'id': review.id,
            'product_id': review.product_id,
            'product_name': review.product_name,
            'user_id': review.user_id,
            'user_name': review.user_name,
            'user_email': review.user_email,
            'rating': review.rating,
            'comment': review.comment,
            'status': review.status,
            'created_at': review.created_at.isoformat(),
        }, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response(
            {'error': f'Error creating review: {str(e)}'},
            status=status.HTTP_400_BAD_REQUEST
        )

@api_view(['GET'])
@permission_classes([AllowAny])
def comment_list(request):
    """Get all comments (pending and approved)"""
    status_filter = request.query_params.get('status')
    
    if USE_DATABASE and Review:
        reviews_query = Review.objects.all()
        if status_filter:
            reviews_query = reviews_query.filter(status=status_filter)
        
        comments = [{
            'id': r.id,
            'product_id': r.product_id,
            'product_name': r.product_name,
            'productName': r.product_name,
            'user_id': r.user_id,
            'user_name': r.user_name,
            'userName': r.user_name,
            'user_email': r.user_email,
            'userEmail': r.user_email,
            'rating': r.rating,
            'comment': r.comment,
            'status': r.status,
            'date': r.created_at.isoformat(),
            'created_at': r.created_at.isoformat(),
        } for r in reviews_query]
        
        pending_count = Review.objects.filter(status='pending').count()
    else:
        # Fallback to mock data
        comments = MOCK_COMMENTS.copy()
        if status_filter:
            comments = [c for c in comments if c['status'] == status_filter]
        pending_count = len([c for c in MOCK_COMMENTS if c['status'] == 'pending'])
    
    return Response({
        'comments': comments,
        'count': len(comments),
        'pending_count': pending_count
    }, status=status.HTTP_200_OK)

@api_view(['PUT'])
@permission_classes([AllowAny])
def comment_approve(request, comment_id):
    """Approve or reject a comment"""
    if USE_DATABASE and Review:
        try:
            review = Review.objects.get(id=comment_id)
        except Review.DoesNotExist:
            return Response(
                {'error': 'Comment not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        action = request.data.get('action')
        
        if action == 'approve':
            review.status = 'approved'
            review.save()
            return Response({
                'message': 'Comment approved',
                'comment': {
                    'id': review.id,
                    'product_id': review.product_id,
                    'product_name': review.product_name,
                    'user_name': review.user_name,
                    'user_email': review.user_email,
                    'rating': review.rating,
                    'comment': review.comment,
                    'status': review.status,
                    'created_at': review.created_at.isoformat(),
                }
            }, status=status.HTTP_200_OK)
        
        elif action == 'reject':
            review.status = 'rejected'
            review.save()
            return Response({
                'message': 'Comment rejected',
                'comment': {
                    'id': review.id,
                    'product_id': review.product_id,
                    'product_name': review.product_name,
                    'user_name': review.user_name,
                    'user_email': review.user_email,
                    'rating': review.rating,
                    'comment': review.comment,
                    'status': review.status,
                    'created_at': review.created_at.isoformat(),
                }
            }, status=status.HTTP_200_OK)
        
        return Response(
            {'error': 'Invalid action. Use "approve" or "reject"'},
            status=status.HTTP_400_BAD_REQUEST
        )
    else:
        # Fallback to mock data
        comment = next((c for c in MOCK_COMMENTS if c['id'] == comment_id), None)
        
        if not comment:
            return Response(
                {'error': 'Comment not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        action = request.data.get('action')
        
        if action == 'approve':
            comment['status'] = 'approved'
            return Response({
                'message': 'Comment approved',
                'comment': comment
            }, status=status.HTTP_200_OK)
        
        elif action == 'reject':
            comment['status'] = 'rejected'
            return Response({
                'message': 'Comment rejected',
                'comment': comment
            }, status=status.HTTP_200_OK)
        
        return Response(
            {'error': 'Invalid action. Use "approve" or "reject"'},
            status=status.HTTP_400_BAD_REQUEST
        )

# Dashboard Stats
@api_view(['GET'])
@permission_classes([AllowAny])
def dashboard_stats(request):
    """Get dashboard statistics"""
    return Response({
        'total_products': len(MOCK_PRODUCTS),
        'low_stock_products': len([p for p in MOCK_PRODUCTS if p['quantity_in_stock'] < 20 and p['quantity_in_stock'] > 0]),
        'out_of_stock_products': len([p for p in MOCK_PRODUCTS if p['quantity_in_stock'] == 0]),
        'total_orders': len(MOCK_ORDERS),
        'processing_orders': len([o for o in MOCK_ORDERS if o['status'] == 'processing']),
        'in_transit_orders': len([o for o in MOCK_ORDERS if o['status'] == 'in-transit']),
        'delivered_orders': len([o for o in MOCK_ORDERS if o['status'] == 'delivered']),
        'pending_comments': Review.objects.filter(status='pending').count() if (USE_DATABASE and Review) else len([c for c in MOCK_COMMENTS if c['status'] == 'pending']),
        'total_categories': len(MOCK_CATEGORIES)
    }, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([AllowAny])
def delivery_dashboard_stats(request):
    """Return delivery department dashboard statistics"""
    from django.db.models import Sum
    from datetime import timedelta
    
    # Try to use database Order model, fallback to MOCK_ORDERS
    try:
        from .models import Order
        USE_ORDER_DB = True
    except ImportError:
        USE_ORDER_DB = False
        Order = None
    
    if USE_ORDER_DB and Order:
        # Use database
        total_orders = Order.objects.count()
        processing_orders = Order.objects.filter(status='processing').count()
        in_transit_orders = Order.objects.filter(status='in-transit').count()
        delivered_orders = Order.objects.filter(status='delivered').count()
        
        today = timezone.now().date()
        today_orders = Order.objects.filter(order_date=today).count()
        pending_deliveries = processing_orders + in_transit_orders
        
        delivered_revenue = Order.objects.filter(status='delivered').aggregate(
            total=Sum('total_price')
        )['total'] or 0
        
        delivered_with_date = Order.objects.filter(
            status='delivered',
            delivery_date__isnull=False
        )
        
        avg_delivery_days = None
        if delivered_with_date.exists():
            total_days = 0
            count = 0
            for order in delivered_with_date:
                if order.delivery_date and order.order_date:
                    days = (order.delivery_date - order.order_date).days
                    if days >= 0:
                        total_days += days
                        count += 1
            if count > 0:
                avg_delivery_days = round(total_days / count, 1)
        
        seven_days_ago = today - timedelta(days=7)
        recent_orders = Order.objects.filter(order_date__gte=seven_days_ago).count()
        
        two_days_ago = today - timedelta(days=2)
        urgent_orders = Order.objects.filter(
            status='processing',
            order_date__lt=two_days_ago
        ).count()
    else:
        # Use mock data
        total_orders = len(MOCK_ORDERS)
        processing_orders = len([o for o in MOCK_ORDERS if o.get('status') == 'processing'])
        in_transit_orders = len([o for o in MOCK_ORDERS if o.get('status') == 'in-transit'])
        delivered_orders = len([o for o in MOCK_ORDERS if o.get('status') == 'delivered'])
        pending_deliveries = processing_orders + in_transit_orders
        
        today = timezone.now().date()
        today_str = today.strftime('%Y-%m-%d')
        today_orders = len([o for o in MOCK_ORDERS if o.get('order_date') == today_str])
        
        delivered_revenue = sum(float(o.get('total_price', 0)) for o in MOCK_ORDERS if o.get('status') == 'delivered')
        
        # Calculate average delivery days from mock data
        delivered_with_dates = [o for o in MOCK_ORDERS if o.get('status') == 'delivered' and o.get('delivery_date') and o.get('order_date')]
        avg_delivery_days = None
        if delivered_with_dates:
            total_days = 0
            for order in delivered_with_dates:
                try:
                    from datetime import datetime
                    order_date = datetime.strptime(order['order_date'], '%Y-%m-%d').date()
                    delivery_date = datetime.strptime(order['delivery_date'], '%Y-%m-%d').date()
                    days = (delivery_date - order_date).days
                    if days >= 0:
                        total_days += days
                except:
                    pass
            if len(delivered_with_dates) > 0:
                avg_delivery_days = round(total_days / len(delivered_with_dates), 1)
        
        seven_days_ago = today - timedelta(days=7)
        from datetime import datetime as dt
        recent_orders = len([o for o in MOCK_ORDERS if o.get('order_date') and dt.strptime(o['order_date'], '%Y-%m-%d').date() >= seven_days_ago])
        
        two_days_ago = today - timedelta(days=2)
        urgent_orders = len([o for o in MOCK_ORDERS if o.get('status') == 'processing' and o.get('order_date') and dt.strptime(o['order_date'], '%Y-%m-%d').date() < two_days_ago])
    
    data = {
        "total_orders": total_orders,
        "processing_orders": processing_orders,
        "in_transit_orders": in_transit_orders,
        "delivered_orders": delivered_orders,
        "pending_deliveries": pending_deliveries,
        "today_orders": today_orders,
        "recent_orders": recent_orders,
        "urgent_orders": urgent_orders,
        "delivered_revenue": float(delivered_revenue),
        "avg_delivery_days": avg_delivery_days,
    }
    
    return Response(data, status=status.HTTP_200_OK)

# =============================
# Create Order (Frontend Checkout)
# =============================
from api.views import send_invoice_email
from datetime import datetime, date
import uuid

@api_view(['POST'])
@permission_classes([AllowAny])
def create_order(request):
    """Create a new order from checkout"""
    data = request.data

    required_fields = ["customer_name", "customer_email", "product_name", 
                       "quantity", "total_price", "delivery_address"]

    # missing field check
    for field in required_fields:
        if field not in data:
            return Response(
                {"error": f"Missing field: {field}"},
                status=status.HTTP_400_BAD_REQUEST
            )

    # Create delivery/order id
    delivery_id = f"DEL-{uuid.uuid4().hex[:6].upper()}"
    customer_id = f"CUST-{uuid.uuid4().hex[:6].upper()}"
    order_date = date.today()

    # ========== ADIM 1: STOK KONTROLÜ VE DÜŞÜMÜ (MOCK DATA) ==========
    product_id = data.get("product_id", 0)
    quantity = data.get("quantity", 1)
    
    # Mock data'dan ürünü bul ve stok düşür
    if product_id and product_id > 0:
        product_found = None
        for product in MOCK_PRODUCTS:
            if product["id"] == product_id:
                product_found = product
                break
        
        if product_found:
            # Stok yetersiz mi kontrol et
            if product_found["quantity_in_stock"] < quantity:
                return Response(
                    {
                        "error": f"Insufficient stock. Available: {product_found['quantity_in_stock']}, Requested: {quantity}"
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Mock data'da stoku düşür
            old_stock = product_found["quantity_in_stock"]
            product_found["quantity_in_stock"] -= quantity
            print(f"✅ Stock updated (MOCK): Product ID {product_id} ({product_found['name']}), {old_stock} -> {product_found['quantity_in_stock']}")
        else:
            print(f"⚠️ Product with ID {product_id} not found in MOCK_PRODUCTS")

    # Try to save to database first
    if USE_DATABASE and Order:
        try:
            order = Order.objects.create(
                delivery_id=delivery_id,
                customer_id=customer_id,
                customer_name=data["customer_name"],
                customer_email=data["customer_email"],
                product_id=data.get("product_id", 0),
                product_name=data["product_name"],
                quantity=data["quantity"],
                total_price=data["total_price"],
                delivery_address=data["delivery_address"],
                status="processing",
                order_date=order_date,
                delivery_date=None
            )
            
            # Convert to dict for response
            new_order = {
                "delivery_id": order.delivery_id,
                "customer_id": order.customer_id,
                "customer_name": order.customer_name,
                "customer_email": order.customer_email,
                "product_id": order.product_id,
                "product_name": order.product_name,
                "quantity": order.quantity,
                "total_price": float(order.total_price),
                "delivery_address": order.delivery_address,
                "status": order.status,
                "order_date": order.order_date.strftime("%Y-%m-%d") if order.order_date else None,
                "delivery_date": order.delivery_date.strftime("%Y-%m-%d") if order.delivery_date else None,
            }
            
            # Send email invoice
            try:
                send_invoice_email(new_order)
            except Exception as e:
                print("Email error:", e)
            
            return Response(
                {"message": "Order created successfully", "order": new_order},
                status=status.HTTP_201_CREATED
            )
        except Exception as e:
            print(f"Database error creating order: {e}")
            # Fall through to mock data
    
    # Fallback to mock data
    new_order = {
        "delivery_id": delivery_id,
        "customer_id": customer_id,
        "customer_name": data["customer_name"],
        "customer_email": data["customer_email"],
        "product_id": data.get("product_id", None),
        "product_name": data["product_name"],
        "quantity": data["quantity"],
        "total_price": data["total_price"],
        "delivery_address": data["delivery_address"],
        "status": "processing",
        "order_date": order_date.strftime("%Y-%m-%d"),
        "delivery_date": None
    }

    # Add order to mock DB
    MOCK_ORDERS.append(new_order)

    # Send email invoice
    try:
        send_invoice_email(new_order)
    except Exception as e:
        print("Email error:", e)

    return Response(
        {"message": "Order created successfully", "order": new_order},
        status=status.HTTP_201_CREATED
    )

# =============================
# Order History (User Orders)
# =============================
@api_view(['GET'])
@permission_classes([AllowAny])
def user_order_history(request):
    """Get order history for the current user by email"""
    user_email = request.query_params.get('email')
    
    if not user_email:
        return Response(
            {"error": "Email parameter is required"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Try to get orders from database first
    if USE_DATABASE and Order:
        try:
            orders = Order.objects.filter(customer_email=user_email).order_by('-order_date', '-created_at')
            orders_data = [{
                'delivery_id': order.delivery_id,
                'customer_id': order.customer_id,
                'customer_name': order.customer_name,
                'customer_email': order.customer_email,
                'product_id': order.product_id,
                'product_name': order.product_name,
                'quantity': order.quantity,
                'total_price': float(order.total_price),
                'delivery_address': order.delivery_address,
                'status': order.status,
                'order_date': order.order_date.strftime('%Y-%m-%d') if order.order_date else None,
                'delivery_date': order.delivery_date.strftime('%Y-%m-%d') if order.delivery_date else None,
                'created_at': order.created_at.isoformat() if order.created_at else None,
            } for order in orders]
            
            return Response({
                'orders': orders_data,
                'count': len(orders_data)
            }, status=status.HTTP_200_OK)
        except Exception as e:
            print(f"Database error: {e}")
            # Fall through to mock data
    
    # Fallback to mock data
    user_orders = [o for o in MOCK_ORDERS if o.get('customer_email', '').lower() == user_email.lower()]
    
    return Response({
        'orders': user_orders,
        'count': len(user_orders)
    }, status=status.HTTP_200_OK)
