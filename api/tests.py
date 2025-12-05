from django.test import TestCase
from product_manager_api.models import Product
from django.core.exceptions import ValidationError
from decimal import Decimal


class ProductModelTestCase(TestCase):
    """Product model test cases"""

    def setUp(self):
        """Test verilerini hazırla"""
        self.product_data = {
            'name': 'Premium Dog Food',
            'model': 'DF-2024',
            'serial_number': 'SN-001-TEST',
            'description': 'High quality dog food with salmon',
            'quantity_in_stock': 100,
            'price': Decimal('299.99'),
            'warranty_status': '1 Year Warranty',
            'distributor': 'Pet Supplies Co.',
            'category': 'Dog Food'
        }

    def test_create_product_successfully(self):
        """Test Case 1: Ürün başarıyla oluşturulabilmeli"""
        product = Product.objects.create(**self.product_data)
        
        self.assertEqual(product.name, 'Premium Dog Food')
        self.assertEqual(product.model, 'DF-2024')
        self.assertEqual(product.serial_number, 'SN-001-TEST')
        self.assertEqual(product.price, Decimal('299.99'))
        self.assertEqual(product.quantity_in_stock, 100)
        self.assertIsNotNone(product.id)
        print("✅ Test 1 Passed: Product created successfully")

    def test_serial_number_must_be_unique(self):
        """Test Case 2: Serial number unique olmalı (duplicate olamaz)"""
        Product.objects.create(**self.product_data)
        
        # Aynı serial number ile ikinci ürün oluşturmaya çalış
        duplicate_product = Product(**self.product_data)
        duplicate_product.name = "Different Product"
        
        with self.assertRaises(Exception):  # IntegrityError bekleniyor
            duplicate_product.save()
        
        print("✅ Test 2 Passed: Serial number uniqueness enforced")

    def test_quantity_cannot_be_negative(self):
        """Test Case 3: Stok miktarı negatif olamaz"""
        self.product_data['quantity_in_stock'] = -10
        product = Product(**self.product_data)
        
        with self.assertRaises(ValidationError):
            product.full_clean()  # Validatorları çalıştır
        
        print("✅ Test 3 Passed: Negative quantity rejected")

    def test_price_cannot_be_negative(self):
        """Test Case 4: Fiyat negatif olamaz"""
        self.product_data['price'] = Decimal('-50.00')
        product = Product(**self.product_data)
        
        with self.assertRaises(ValidationError):
            product.full_clean()  # Validatorları çalıştır
        
        print("✅ Test 4 Passed: Negative price rejected")

    def test_cost_auto_calculation(self):
        """Test Case 5: Cost otomatik olarak price'ın %50'si olmalı"""
        product = Product.objects.create(**self.product_data)
        
        expected_cost = self.product_data['price'] * Decimal('0.5')
        self.assertEqual(product.cost, expected_cost)
        self.assertEqual(product.cost, Decimal('149.995'))
        
        print("✅ Test 5 Passed: Cost auto-calculated correctly")

    def test_product_string_representation(self):
        """Bonus Test: Product __str__ metodu doğru çalışmalı"""
        product = Product.objects.create(**self.product_data)
        expected_str = "Premium Dog Food (DF-2024)"
        self.assertEqual(str(product), expected_str)
        print("✅ Bonus Test Passed: String representation correct")
