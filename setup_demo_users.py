#!/usr/bin/env python
"""
Demo için kullanıcıları hazırlama scripti
almira.aygun@sabanciuniv.edu ve mert.secen@sabanciuniv.edu için
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mysite.settings')
django.setup()

from django.contrib.auth.models import User
from api.models import UserProfile

def setup_demo_users():
    """Demo için kullanıcıları hazırla"""
    
    demo_emails = [
        "almira.aygun@sabanciuniv.edu",
        "mert.secen@sabanciuniv.edu"
    ]
    
    print("="*60)
    print("DEMO KULLANICILARI HAZIRLAMA")
    print("="*60)
    
    for email in demo_emails:
        print(f"\n📧 {email} için:")
        print("-" * 60)
        
        # Kullanıcıyı bul veya oluştur
        username = email.split('@')[0].replace('.', '_')
        
        user, created = User.objects.get_or_create(
            username=username,
            defaults={
                'email': email,
                'first_name': email.split('@')[0].split('.')[0].capitalize(),
                'last_name': email.split('@')[0].split('.')[1].capitalize() if '.' in email.split('@')[0] else '',
                'is_active': True,
            }
        )
        
        if not created:
            # Mevcut kullanıcının email'ini güncelle
            user.email = email
            user.is_active = True
            user.save()
            print(f"✓ Mevcut kullanıcı güncellendi: {user.username}")
        else:
            user.set_password('demo123')  # Demo için basit şifre
            user.save()
            print(f"✓ Yeni kullanıcı oluşturuldu: {user.username}")
            print(f"  Şifre: demo123")
        
        # Profile'ı hazırla
        profile, profile_created = UserProfile.objects.get_or_create(user=user)
        profile.receive_sales_emails = True
        profile.save()
        
        if profile_created:
            print(f"✓ Yeni profile oluşturuldu")
        else:
            print(f"✓ Profile güncellendi")
        
        print(f"  - Email: {user.email}")
        print(f"  - Abone: {profile.receive_sales_emails}")
        print(f"  - Aktif: {user.is_active}")
    
    print("\n" + "="*60)
    print("✅ TÜM KULLANICILAR HAZIR!")
    print("="*60)
    print("\nEmail göndermek için:")
    print("python manage.py send_sales_emails \\")
    print("  --subject '🐾 Pet Store - Demo Email' \\")
    print("  --message 'Merhaba! Bu bir demo emailidir.'")
    print("\nVeya sadece bu kullanıcılara göndermek için:")
    print("(Tüm abone olan kullanıcılara gönderilecek)")
    print("="*60)

if __name__ == "__main__":
    setup_demo_users()

