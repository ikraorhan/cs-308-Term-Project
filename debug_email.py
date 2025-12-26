#!/usr/bin/env python
"""
Email gönderme sorununu debug etmek için script
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mysite.settings')
django.setup()

from django.contrib.auth.models import User
from api.models import UserProfile
from django.core.mail import send_mail
from django.conf import settings

def debug_email():
    print("="*60)
    print("EMAIL DEBUG SCRIPT")
    print("="*60)
    
    # 1. Kullanıcı kontrolü
    print("\n1. Kullanıcı Kontrolü:")
    print("-" * 60)
    user = User.objects.filter(email="almiraaygun@gmail.com").first()
    if user:
        print(f"✓ Kullanıcı bulundu: {user.username}")
        try:
            profile = user.profile
            print(f"✓ Profile bulundu")
            print(f"  - receive_sales_emails: {profile.receive_sales_emails}")
            print(f"  - is_active: {user.is_active}")
            print(f"  - email: {user.email}")
        except:
            print("✗ Profile bulunamadı!")
    else:
        print("✗ Kullanıcı bulunamadı!")
        print("  Abone olan kullanıcılar:")
        subscribers = User.objects.filter(profile__receive_sales_emails=True, is_active=True)
        for u in subscribers:
            print(f"  - {u.email} ({u.username})")
    
    # 2. Email ayarları kontrolü
    print("\n2. Email Ayarları:")
    print("-" * 60)
    print(f"EMAIL_BACKEND: {settings.EMAIL_BACKEND}")
    print(f"EMAIL_HOST: {settings.EMAIL_HOST}")
    print(f"EMAIL_PORT: {settings.EMAIL_PORT}")
    print(f"EMAIL_USE_TLS: {settings.EMAIL_USE_TLS}")
    print(f"EMAIL_HOST_USER: {settings.EMAIL_HOST_USER}")
    print(f"EMAIL_HOST_PASSWORD: {'*' * len(settings.EMAIL_HOST_PASSWORD) if settings.EMAIL_HOST_PASSWORD else 'YOK'}")
    print(f"DEFAULT_FROM_EMAIL: {settings.DEFAULT_FROM_EMAIL}")
    
    # 3. Test email gönderme
    print("\n3. Test Email Gönderme:")
    print("-" * 60)
    try:
        send_mail(
            subject='Test Email - Pet Store',
            message='Bu bir test emailidir. Eğer bunu görüyorsanız sistem çalışıyor!',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=['almiraaygun@gmail.com'],
            fail_silently=False,
        )
        print("✓ Test email gönderildi!")
        print("  Gmail'inizi kontrol edin (Spam klasörüne de bakın)")
    except Exception as e:
        print(f"✗ Email gönderme hatası: {e}")
        print(f"  Hata tipi: {type(e).__name__}")
        import traceback
        traceback.print_exc()
    
    # 4. Management command test
    print("\n4. Management Command Test:")
    print("-" * 60)
    from api.management.commands.send_sales_emails import Command
    cmd = Command()
    
    # Abone olan kullanıcıları bul
    from django.contrib.auth.models import User
    users = User.objects.filter(
        profile__receive_sales_emails=True,
        is_active=True
    ).select_related('profile')
    
    users_to_email = [u for u in users if u.email and u.email.strip()]
    
    print(f"Abone olan kullanıcı sayısı: {len(users_to_email)}")
    for u in users_to_email:
        print(f"  - {u.email} ({u.username})")
    
    print("\n" + "="*60)
    print("DEBUG TAMAMLANDI")
    print("="*60)

if __name__ == "__main__":
    debug_email()

