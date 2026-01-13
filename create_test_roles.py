
import os
import django
import sys

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mysite.settings')
django.setup()

from django.contrib.auth.models import User
from api.models import UserProfile

def create_user_with_role(username, email, password, role, is_admin=False):
    user, created = User.objects.get_or_create(username=username, email=email)
    user.set_password(password)
    
    if is_admin:
        user.is_staff = True
        user.is_superuser = True
    else:
        user.is_staff = False
        user.is_superuser = False
    
    user.save()
    
    # Update profile
    profile, _ = UserProfile.objects.get_or_create(user=user)
    profile.role = role
    profile.save()
    
    status = "Created" if created else "Updated"
    print(f"User '{username}' ({role}) - {status}")
    print(f"  Email: {email}")
    print(f"  Password: {password}")
    print("-" * 30)

def main():
    print("Creating/Updating Test Users with Roles...\n")
    
    # Admin (Superuser) - Access to everything
    create_user_with_role('admin_user', 'admin@example.com', 'pass1234', 'admin', is_admin=True)
    
    # Product Manager
    create_user_with_role('pm_user', 'pm@example.com', 'pass1234', 'product_manager')
    
    # Sales Manager
    create_user_with_role('sales_user', 'sales@example.com', 'pass1234', 'sales_manager')
    
    # Support Manager
    create_user_with_role('support_user', 'support@example.com', 'pass1234', 'support_manager')
    
    # Customer (Standard User)
    create_user_with_role('customer_user', 'customer@example.com', 'pass1234', 'customer')

    print("\nDone! You can now login with these users to verify role-based access.")

if __name__ == '__main__':
    main()
