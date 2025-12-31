from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse
from .models import Product, Order

class Step4OrderTests(APITestCase):
    def setUp(self):
        # Create a test product
        self.product = Product.objects.create(
            name="Test Product A",
            model="TP-001",
            serial_number="SN-TEST-001",
            description="A test product",
            quantity_in_stock=10,
            price=100.00,
            category="Test Category"
        )
        self.create_order_url = reverse('create_order')

    def test_create_order_success(self):
        """Test creating a valid order successfully."""
        data = {
            "customer_name": "Test User",
            "customer_email": "test@example.com",
            "product_name": self.product.name,
            "product_id": self.product.id,
            "quantity": 2,
            "total_price": 200.00,
            "delivery_address": "123 Test St"
        }
        response = self.client.post(self.create_order_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('order', response.data)
        self.assertEqual(response.data['order']['customer_name'], "Test User")

    def test_create_order_stock_deduction(self):
        """Test that stock is correctly deducted after an order."""
        initial_stock = self.product.quantity_in_stock
        order_quantity = 3
        
        data = {
            "customer_name": "Stock Tester",
            "customer_email": "stock@example.com",
            "product_name": self.product.name,
            "product_id": self.product.id,
            "quantity": order_quantity,
            "total_price": 300.00,
            "delivery_address": "Stock Lane"
        }
        
        response = self.client.post(self.create_order_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Refresh product from DB
        self.product.refresh_from_db()
        expected_stock = initial_stock - order_quantity
        self.assertEqual(self.product.quantity_in_stock, expected_stock)

    def test_create_order_insufficient_stock(self):
        """Test that ordering more than available stock fails."""
        excessive_quantity = self.product.quantity_in_stock + 1
        
        data = {
            "customer_name": "Greedy User",
            "customer_email": "greedy@example.com",
            "product_name": self.product.name,
            "product_id": self.product.id,
            "quantity": excessive_quantity,
            "total_price": 1000.00,
            "delivery_address": "Nowhere"
        }
        
        response = self.client.post(self.create_order_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)

    def test_create_order_missing_fields(self):
        """Test that missing required fields returns 400."""
        # Missing 'quantity' and 'total_price'
        data = {
            "customer_name": "Incomplete User",
            "customer_email": "incomplete@example.com",
            "product_name": self.product.name,
            "delivery_address": "Unknown"
        }
        
        response = self.client.post(self.create_order_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_order_initial_status(self):
        """Test that a new order has 'processing' status by default."""
        data = {
            "customer_name": "Status Tester",
            "customer_email": "status@example.com",
            "product_name": self.product.name,
            "product_id": self.product.id,
            "quantity": 1,
            "total_price": 100.00,
            "delivery_address": "Status St"
        }
        
        response = self.client.post(self.create_order_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['order']['status'], 'processing')
