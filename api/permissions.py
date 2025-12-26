"""
Custom permission classes for role-based access control.
These permissions ensure that sensitive operations are only accessible
to users with appropriate roles.
"""
from rest_framework.permissions import BasePermission, IsAuthenticated


class IsCustomer(BasePermission):
    """
    Permission for customer-level access.
    Customers can view products, manage their cart, place orders, and write reviews.
    """
    message = "You must be logged in as a customer to perform this action."
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return True  # Any authenticated user is at least a customer


class IsProductManager(BasePermission):
    """
    Permission for Product Manager role.
    Product Managers can:
    - Manage products (add, edit, delete, set prices)
    - Manage stock levels
    - Approve/reject reviews and comments
    - View product-related reports
    """
    message = "You must be a Product Manager to perform this action."
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Superusers have all permissions
        if request.user.is_superuser:
            return True
        
        # Check user profile role
        try:
            profile = request.user.profile
            return profile.is_product_manager()
        except Exception:
            return False


class IsSalesManager(BasePermission):
    """
    Permission for Sales Manager role.
    Sales Managers can:
    - Set discounts and prices
    - View sales reports and revenue
    - Manage invoices
    - View order analytics
    """
    message = "You must be a Sales Manager to perform this action."
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Superusers have all permissions
        if request.user.is_superuser:
            return True
        
        # Check user profile role
        try:
            profile = request.user.profile
            return profile.is_sales_manager()
        except Exception:
            return False


class IsAdmin(BasePermission):
    """
    Permission for Administrator role.
    Admins have full access to all system features.
    """
    message = "You must be an Administrator to perform this action."
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Superusers are always admins
        if request.user.is_superuser:
            return True
        
        # Check user profile role
        try:
            profile = request.user.profile
            return profile.is_admin()
        except Exception:
            return False


class IsProductManagerOrReadOnly(BasePermission):
    """
    Allow read-only access for anyone, but write access only for Product Managers.
    Useful for product listing endpoints where customers can view but not modify.
    """
    message = "You must be a Product Manager to modify products."
    
    def has_permission(self, request, view):
        # Allow safe methods (GET, HEAD, OPTIONS) for everyone
        if request.method in ('GET', 'HEAD', 'OPTIONS'):
            return True
        
        # For write operations, require Product Manager role
        if not request.user or not request.user.is_authenticated:
            return False
        
        if request.user.is_superuser:
            return True
        
        try:
            profile = request.user.profile
            return profile.is_product_manager()
        except Exception:
            return False


class IsSalesManagerOrReadOnly(BasePermission):
    """
    Allow read-only access for authenticated users, but write access only for Sales Managers.
    """
    message = "You must be a Sales Manager to modify this resource."
    
    def has_permission(self, request, view):
        if request.method in ('GET', 'HEAD', 'OPTIONS'):
            # Still require authentication for reading sensitive sales data
            return request.user and request.user.is_authenticated
        
        if not request.user or not request.user.is_authenticated:
            return False
        
        if request.user.is_superuser:
            return True
        
        try:
            profile = request.user.profile
            return profile.is_sales_manager()
        except Exception:
            return False


class IsOwnerOrAdmin(BasePermission):
    """
    Object-level permission to only allow owners of an object or admins to access it.
    Useful for user-specific data like orders, cart items, etc.
    """
    message = "You can only access your own data."
    
    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Admins can access anything
        if request.user.is_superuser:
            return True
        
        try:
            if request.user.profile.is_admin():
                return True
        except Exception:
            pass
        
        # Check if user owns the object
        # Handle different object types
        if hasattr(obj, 'user'):
            return obj.user == request.user
        if hasattr(obj, 'customer_email'):
            return obj.customer_email == request.user.email
        
        return False

