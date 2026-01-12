from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
from decimal import Decimal


class Product(models.Model):
    name = models.CharField(max_length=200)
    model = models.CharField(max_length=100)
    serial_number = models.CharField(max_length=100, unique=True)
    description = models.TextField()
    quantity_in_stock = models.IntegerField(validators=[MinValueValidator(0)], default=0)
    price = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    warranty_status = models.CharField(max_length=200, blank=True)
    distributor = models.CharField(max_length=200, blank=True)
    category = models.CharField(max_length=100)
    cost = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    image_url = models.CharField(max_length=500, blank=True, null=True)
    # Discount fields
    original_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, help_text="Original price before discount")
    discount_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0, validators=[MinValueValidator(0), MaxValueValidator(100)], help_text="Discount percentage (0-100)")
    discount_start_date = models.DateTimeField(null=True, blank=True, help_text="When discount starts")
    discount_end_date = models.DateTimeField(null=True, blank=True, help_text="When discount ends")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} ({self.model})"
    
    def save(self, *args, **kwargs):
        if not self.cost and self.price:
            self.cost = self.price * 0.5
        
        # IMPORTANT: Save original_price BEFORE calculating discount
        # If discount is being applied and original_price is not set, save current price as original
        if self.discount_rate > 0:
            if not self.original_price:
                # First time applying discount - save current price as original
                self.original_price = self.price
            # Calculate discounted price from original_price (use Decimal for all operations)
            discount_amount = (self.original_price * self.discount_rate) / Decimal('100')
            self.price = self.original_price - discount_amount
        elif self.discount_rate == 0:
            # Remove discount - restore original price
            if self.original_price:
                self.price = self.original_price
                self.original_price = None
        
        super().save(*args, **kwargs)
    
    @property
    def is_on_discount(self):
        """Check if product is currently on discount"""
        if self.discount_rate <= 0:
            return False
        now = timezone.now()
        if self.discount_start_date and now < self.discount_start_date:
            return False
        if self.discount_end_date and now > self.discount_end_date:
            return False
        return True
    
    @property
    def current_price(self):
        """Get current price (discounted if applicable)"""
        if self.is_on_discount and self.original_price:
            discount_amount = (self.original_price * self.discount_rate) / Decimal('100')
            return self.original_price - discount_amount
        return self.price


class Order(models.Model):
    STATUS_CHOICES = [
        ('processing', 'Processing'),
        ('in-transit', 'In Transit'),
        ('delivered', 'Delivered'),
    ]
    
    delivery_id = models.CharField(max_length=50, unique=True, db_index=True)
    customer_id = models.CharField(max_length=50, db_index=True)
    customer_name = models.CharField(max_length=200)
    customer_email = models.EmailField()
    # Product details moved to OrderItem
    total_price = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    delivery_address = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='processing', db_index=True)
    order_date = models.DateField()
    delivery_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-order_date', '-created_at']
        indexes = [
            models.Index(fields=['status', 'order_date']),
            models.Index(fields=['customer_id', 'order_date']),
        ]
    
    def __str__(self):
        return f"Order {self.delivery_id} - {self.customer_name} ({self.status})"
    
    def mark_as_delivered(self):
        if self.status != 'delivered':
            self.status = 'delivered'
            if not self.delivery_date:
                self.delivery_date = timezone.now().date()
            self.save()


class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    product_id = models.IntegerField()
    product_name = models.CharField(max_length=200)
    quantity = models.IntegerField(validators=[MinValueValidator(1)])
    price = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    
    def __str__(self):
        return f"{self.quantity} x {self.product_name} in Order {self.order.delivery_id}"


class Review(models.Model):
    """Product reviews/comments that require approval"""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    
    product_id = models.IntegerField(db_index=True)
    product_name = models.CharField(max_length=200)
    user_id = models.CharField(max_length=50, db_index=True)
    user_name = models.CharField(max_length=200)
    user_email = models.EmailField()
    rating = models.IntegerField(
        help_text='Rating from 1 to 5',
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    comment = models.TextField()
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending',
        db_index=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['product_id', 'status']),
            models.Index(fields=['user_id', 'product_id']),
        ]
    
    def __str__(self):
        return f"Review for {self.product_name} by {self.user_name} ({self.status})"


class Wishlist(models.Model):
    """User wishlist - products users want to buy"""
    user_id = models.CharField(max_length=50, db_index=True)
    user_email = models.EmailField(db_index=True)
    product_id = models.IntegerField(db_index=True)
    product_name = models.CharField(max_length=200)
    added_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-added_at']
        unique_together = [['user_id', 'product_id']]  # Prevent duplicate entries
        indexes = [
            models.Index(fields=['user_id', 'product_id']),
            models.Index(fields=['product_id']),
        ]
    
    def __str__(self):
        return f"{self.user_email} - {self.product_name}"

