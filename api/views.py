from django.core.mail import EmailMessage
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
import io


def generate_invoice_pdf(order):
    """Order bilgisinden PDF dosyası oluşturan fonksiyon."""
    buffer = io.BytesIO()
    p = canvas.Canvas(buffer, pagesize=letter)

    # Başlık
    p.setFont("Helvetica-Bold", 18)
    p.drawString(50, 750, "Pet Store Invoice")

    # Order bilgileri
    p.setFont("Helvetica", 12)
    p.drawString(50, 720, f"Order ID: {order.id}")
    p.drawString(50, 700, f"Customer: {order.user.email}")
    p.drawString(50, 680, f"Date: {order.created_at.strftime('%Y-%m-%d')}")

    # Ürün listesi
    y = 640
    p.drawString(50, y, "Products:")
    y -= 20

    total = 0

    for item in order.items.all():
        line = f"{item.product.name}   x{item.quantity}   = {item.product.price * item.quantity} TL"
        p.drawString(60, y, line)
        y -= 20

        total += item.product.price * item.quantity

    # Total fiyat
    p.drawString(50, y - 10, f"Total: {total} TL")

    p.showPage()
    p.save()

    buffer.seek(0)
    return buffer


def send_invoice_email(order):
    """Sipariş oluşturulduğunda müşteriye PDF faturayı email ile gönderen fonksiyon."""
    pdf_buffer = generate_invoice_pdf(order)

    email = EmailMessage(
        subject=f"Your Pet Store Invoice - Order #{order.id}",
        body="Thank you for your order! Your invoice is attached.",
        from_email="petstore.orders@gmail.com",   # Gmail SMTP ayarı gerekiyor
        to=[order.user.email],
    )

    # PDF ekle
    email.attach(
        filename=f"invoice_{order.id}.pdf",
        content=pdf_buffer.getvalue(),
        mimetype="application/pdf"
    )

    # Email gönder
    email.send()

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status

from .models import Order, OrderItem
from .views import generate_invoice_pdf, send_invoice_email

@api_view(['POST'])
@permission_classes([AllowAny])
def create_order(request):
    """
    Create a new order, save items, generate invoice PDF
    and send email to the user.
    """
    try:
        user = request.user if request.user.is_authenticated else None
        
        data = request.data
        items = data.get("items", [])
        delivery_address = data.get("delivery_address", "")

        if not items:
            return Response({"error": "No items in order"}, status=400)

        # Create Order
        order = Order.objects.create(
            user=user,
            delivery_address=delivery_address
        )

        # Create Order Items
        for item in items:
            OrderItem.objects.create(
                order=order,
                product_name=item["product_name"],
                quantity=item["quantity"],
                price=item["price"],
            )

        # Send invoice email
        send_invoice_email(order)

        return Response({
            "message": "Order created successfully",
            "order_id": order.id
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({"error": str(e)}, status=500)   