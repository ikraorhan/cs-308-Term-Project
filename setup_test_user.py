#!/usr/bin/env python
"""
Django script to setup test user for email automation
Bu script mevcut superuser'ı email test için hazırlar
"""

import os
import django

# Django setup
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mysite.settings')
django.setup()

from django.contrib.auth.models import User
from api.models import UserProfile

def setup_test_user():
    """Mevcut superuser'ı email test için hazırla"""
    
    # İlk superuser'ı bul
    try:
        superuser = User.objects.filter(is_superuser=True).first()
        
        if not superuser:
            print("❌ Hiç superuser bulunamadı!")
            print("Önce bir superuser oluşturun: python manage.py createsuperuser")
            return
        
        print(f"✓ Superuser bulundu: {superuser.username}")
        
        # Email'i güncelle
        old_email = superuser.email
        superuser.email = "almiraaygun@gmail.com"
        superuser.save()
        print(f"✓ Email güncellendi: {old_email} -> {superuser.email}")
        
        # Profile'ı al veya oluştur
        profile, created = UserProfile.objects.get_or_create(user=superuser)
        
        # receive_sales_emails'ı True yap
        profile.receive_sales_emails = True
        profile.save()
        
        if created:
            print(f"✓ Yeni profile oluşturuldu ve receive_sales_emails = True yapıldı")
        else:
            print(f"✓ Profile güncellendi: receive_sales_emails = True")
        
        print("\n" + "="*50)
        print("✅ Hazır! Artık email gönderebilirsiniz:")
        print("="*50)
        print(f"Kullanıcı: {superuser.username}")
        print(f"Email: {superuser.email}")
        print(f"Abone: {profile.receive_sales_emails}")
        print("\nEmail göndermek için:")
        print("python manage.py send_sales_emails \\")
        print("  --subject 'Test Email' \\")
        print("  --message 'Bu bir test' \\")
        print("  --limit 1")
        print("="*50)
        
    except Exception as e:
        print(f"❌ Hata: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    setup_test_user()

