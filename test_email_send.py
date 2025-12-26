#!/usr/bin/env python
"""
Email gönderme testi - hata mesajlarını gösterir
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mysite.settings')
django.setup()

from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth.models import User

print("="*60)
print("EMAIL GÖNDERME TESTİ")
print("="*60)

# Email ayarlarını göster
print("\n1. Email Ayarları:")
print("-" * 60)
print(f"EMAIL_BACKEND: {settings.EMAIL_BACKEND}")
print(f"EMAIL_HOST: {settings.EMAIL_HOST}")
print(f"EMAIL_PORT: {settings.EMAIL_PORT}")
print(f"EMAIL_USE_TLS: {settings.EMAIL_USE_TLS}")
print(f"EMAIL_HOST_USER: {settings.EMAIL_HOST_USER}")
print(f"EMAIL_HOST_PASSWORD: {'*' * 10 if settings.EMAIL_HOST_PASSWORD else 'YOK'}")
print(f"DEFAULT_FROM_EMAIL: {settings.DEFAULT_FROM_EMAIL}")

# Test email gönder
print("\n2. Test Email Gönderme:")
print("-" * 60)
try:
    send_mail(
        subject='Test Email - Pet Store',
        message='Bu bir test emailidir. Eğer bunu görüyorsanız sistem çalışıyor!',
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=['almiraaygun@gmail.com'],
        fail_silently=False,
    )
    print("✓ Email başarıyla gönderildi!")
    print("  Gmail'inizi kontrol edin (Spam klasörüne de bakın)")
except Exception as e:
    print(f"✗ HATA: {e}")
    print(f"  Hata tipi: {type(e).__name__}")
    import traceback
    print("\nDetaylı hata:")
    traceback.print_exc()
    
    print("\n" + "="*60)
    print("ÇÖZÜM ÖNERİLERİ:")
    print("="*60)
    print("1. Gmail App Password kontrol edin")
    print("2. Gmail'de 'Less secure app access' açık mı kontrol edin")
    print("3. EMAIL_HOST_PASSWORD doğru mu kontrol edin")
    print("4. İnternet bağlantınızı kontrol edin")

print("\n" + "="*60)

