"""
Django Admin configuration for Product Manager API
"""
from django.contrib import admin
from .models import Product, Order, Review, OrderItem

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    # Tüm gerekli kolonlar: ID, name, model, serial_number, description, quantity_in_stock, price, warranty_status, distributor
    list_display = (
        'id', 
        'name', 
        'model', 
        'serial_number',
        'description',
        'quantity_in_stock', 
        'price',
        'warranty_status',
        'distributor',
        'category',
        'created_at'
    )
    list_filter = ('category', 'warranty_status', 'distributor', 'created_at')
    search_fields = ('name', 'model', 'serial_number', 'description', 'warranty_status', 'distributor', 'category')
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'model', 'serial_number', 'description', 'category')
        }),
        ('Pricing & Stock', {
            'fields': ('price', 'cost', 'quantity_in_stock')
        }),
        ('Additional Information', {
            'fields': ('warranty_status', 'distributor')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

class OrderItemInline(admin.TabularInline):
    """Inline admin for OrderItem"""
    model = OrderItem
    extra = 0
    readonly_fields = ('created_at',)
    fields = ('product_id', 'product_name', 'quantity', 'price', 'created_at')
    can_delete = False

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('delivery_id', 'customer_name', 'get_items_summary', 'total_price', 'status', 'order_date')
    list_filter = ('status', 'order_date', 'delivery_date')
    search_fields = ('delivery_id', 'customer_name', 'customer_email', 'product_name', 'delivery_address')
    readonly_fields = ('created_at', 'updated_at')
    inlines = [OrderItemInline]
    fieldsets = (
        ('Order Information', {
            'fields': ('delivery_id', 'status', 'order_date', 'delivery_date')
        }),
        ('Customer Information', {
            'fields': ('customer_id', 'customer_name', 'customer_email', 'delivery_address')
        }),
        ('Legacy Product Information (deprecated - use OrderItems below)', {
            'fields': ('product_id', 'product_name', 'quantity', 'total_price'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_items_summary(self, obj):
        """Display summary of order items"""
        items = obj.items.all()
        if items.exists():
            return ', '.join([f"{item.product_name} (×{item.quantity})" for item in items])
        elif obj.product_name:
            return f"{obj.product_name} (×{obj.quantity})" if obj.quantity else obj.product_name
        return "No items"
    get_items_summary.short_description = 'Products'

@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ('id', 'order', 'product_id', 'product_name', 'quantity', 'price', 'created_at')
    list_filter = ('created_at', 'order__status')
    search_fields = ('product_name', 'order__delivery_id', 'order__customer_name', 'order__customer_email')
    readonly_fields = ('created_at',)
    list_select_related = ('order',)

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('id', 'product_name', 'user_name', 'rating', 'status', 'created_at')
    list_filter = ('status', 'rating', 'created_at')
    search_fields = ('product_name', 'user_name', 'user_email', 'comment')
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        ('Comment Information', {
            'fields': ('product_id', 'product_name', 'rating', 'comment', 'status')
        }),
        ('User Information', {
            'fields': ('user_id', 'user_name', 'user_email')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    actions = ['approve_comments', 'reject_comments']
    
    def approve_comments(self, request, queryset):
        queryset.update(status='approved')
        self.message_user(request, f'{queryset.count()} comment(s) approved.')
    approve_comments.short_description = 'Approve selected comments'
    
    def reject_comments(self, request, queryset):
        queryset.update(status='rejected')
        self.message_user(request, f'{queryset.count()} comment(s) rejected.')
    reject_comments.short_description = 'Reject selected comments'

