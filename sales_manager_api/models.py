from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from product_manager_api.models import Product

class Campaign(models.Model):
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('scheduled', 'Scheduled'),
        ('ended', 'Ended'),
        ('cancelled', 'Cancelled'),
    ]

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    discount_percentage = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(100)],
        help_text="Discount percentage (1-100)"
    )
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')
    products = models.ManyToManyField(Product, related_name='campaigns', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-start_date']

    def __str__(self):
        return self.title
