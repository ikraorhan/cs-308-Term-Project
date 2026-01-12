"""
Tests for Discount Management and Email Notification System
"""
from django.test import TestCase, override_settings
from django.core import mail
from rest_framework.test import APIClient
from rest_framework import status
from decimal import Decimal
from product_manager_api.models import Product, Wishlist


class DiscountManagementTests(TestCase):
    """Test discount application and email notification system"""
    
    def setUp(self):
        """Set up test data"""
        self.client = APIClient()
        
        # Create test products
        self.product1 = Product.objects.create(
            name="Test Dog Food",
            model="TDF-001",
            serial_number="SN-TEST-001",
            description="Test product for discount",
            quantity_in_stock=50,
            price=Decimal('100.00'),
            warranty_status="1 year warranty",
            distributor="Test Distributor",
            category="Food",
            cost=Decimal('50.00')
        )
        
        self.product2 = Product.objects.create(
            name="Test Cat Toy",
            model="TCT-001",
            serial_number="SN-TEST-002",
            description="Test product 2",
            quantity_in_stock=30,
            price=Decimal('50.00'),
            warranty_status="6 months warranty",
            distributor="Test Distributor",
            category="Toys",
            cost=Decimal('25.00')
        )
        
        # Create wishlist items
        self.wishlist1 = Wishlist.objects.create(
            user_id="test-user-1",
            user_email="test1@example.com",
            product_id=self.product1.id,
            product_name=self.product1.name
        )
        
        self.wishlist2 = Wishlist.objects.create(
            user_id="test-user-2",
            user_email="test2@example.com",
            product_id=self.product1.id,
            product_name=self.product1.name
        )
    
    @override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend')
    def test_apply_discount_success(self):
        """Test applying discount to a product successfully"""
        url = '/sales/discount/apply/'
        data = {
            'product_ids': [self.product1.id],
            'discount_rate': 20.0
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('updated_products', response.data)
        self.assertEqual(len(response.data['updated_products']), 1)
        
        # Check product price was updated
        self.product1.refresh_from_db()
        self.assertEqual(self.product1.discount_rate, Decimal('20.00'))
        self.assertEqual(self.product1.original_price, Decimal('100.00'))
        self.assertEqual(self.product1.price, Decimal('80.00'))  # 100 - 20%
    
    @override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend')
    def test_apply_discount_sends_emails(self):
        """Test that discount application sends emails to wishlist users"""
        # Clear mail outbox
        mail.outbox = []
        
        url = '/sales/discount/apply/'
        data = {
            'product_ids': [self.product1.id],
            'discount_rate': 30.0
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Check emails were sent
        self.assertEqual(len(mail.outbox), 2)  # 2 wishlist users
        
        # Check email content (order may vary, so check both)
        email_recipients = [email.to[0] for email in mail.outbox]
        self.assertIn('test1@example.com', email_recipients)
        self.assertIn('test2@example.com', email_recipients)
        
        # Check email content for any email
        any_email = mail.outbox[0]
        self.assertIn('Special Discount', any_email.subject)
        self.assertIn(self.product1.name, any_email.body)
        
        # Check email contains discount information
        self.assertIn('30', any_email.body)  # Check for discount rate (30.0% or 30%)
        self.assertIn('%', any_email.body)  # Check for percentage sign
        self.assertIn('Original Price', any_email.body)
        self.assertIn('New Price', any_email.body)
    
    @override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend')
    def test_apply_discount_multiple_products(self):
        """Test applying discount to multiple products"""
        url = '/sales/discount/apply/'
        data = {
            'product_ids': [self.product1.id, self.product2.id],
            'discount_rate': 15.0
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['updated_products']), 2)
        
        # Check both products were updated
        self.product1.refresh_from_db()
        self.product2.refresh_from_db()
        self.assertEqual(self.product1.discount_rate, Decimal('15.00'))
        self.assertEqual(self.product2.discount_rate, Decimal('15.00'))
    
    def test_apply_discount_invalid_rate(self):
        """Test applying discount with invalid rate (negative or >100)"""
        url = '/sales/discount/apply/'
        
        # Test negative rate
        data = {
            'product_ids': [self.product1.id],
            'discount_rate': -10.0
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
        # Test rate > 100
        data = {
            'product_ids': [self.product1.id],
            'discount_rate': 150.0
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_apply_discount_no_product_ids(self):
        """Test applying discount without product IDs"""
        url = '/sales/discount/apply/'
        data = {
            'discount_rate': 20.0
        }
        
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    @override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend')
    def test_apply_discount_no_wishlist_users(self):
        """Test applying discount when no users have product in wishlist"""
        # Clear mail outbox
        mail.outbox = []
        
        url = '/sales/discount/apply/'
        data = {
            'product_ids': [self.product2.id],  # No wishlist items for product2
            'discount_rate': 25.0
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['notified_users_count'], 0)
        self.assertEqual(len(mail.outbox), 0)  # No emails sent
    
    def test_remove_discount(self):
        """Test removing discount from a product"""
        # First apply discount
        self.product1.discount_rate = Decimal('20.00')
        self.product1.original_price = Decimal('100.00')
        self.product1.price = Decimal('80.00')
        self.product1.save()
        
        url = '/sales/discount/remove/'
        data = {
            'product_ids': [self.product1.id]
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Check discount was removed
        self.product1.refresh_from_db()
        self.assertEqual(self.product1.discount_rate, Decimal('0.00'))
        self.assertIsNone(self.product1.original_price)
        self.assertEqual(self.product1.price, Decimal('100.00'))  # Restored to original
    
    def test_wishlist_add(self):
        """Test adding product to wishlist"""
        url = '/wishlist/add/'
        data = {
            'user_id': 'test-user-3',
            'user_email': 'test3@example.com',
            'product_id': self.product2.id
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Wishlist.objects.filter(
            user_id='test-user-3',
            product_id=self.product2.id
        ).exists())
    
    def test_wishlist_remove(self):
        """Test removing product from wishlist"""
        url = '/wishlist/remove/'
        data = {
            'user_id': self.wishlist1.user_id,
            'product_id': self.wishlist1.product_id
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(Wishlist.objects.filter(
            user_id=self.wishlist1.user_id,
            product_id=self.wishlist1.product_id
        ).exists())
    
    def test_get_discounted_products(self):
        """Test getting list of discounted products"""
        # Apply discount to product1
        self.product1.discount_rate = Decimal('25.00')
        self.product1.original_price = Decimal('100.00')
        self.product1.price = Decimal('75.00')
        self.product1.save()
        
        url = '/sales/discount/products/'
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('discounted_products', response.data)
        self.assertEqual(len(response.data['discounted_products']), 1)
        self.assertEqual(response.data['discounted_products'][0]['id'], self.product1.id)
        self.assertEqual(float(response.data['discounted_products'][0]['discount_rate']), 25.0)

