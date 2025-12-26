#!/usr/bin/env python
"""
Abone olan kullanıcıları kontrol et
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mysite.settings')
django.setup()

from django.contrib.auth.models import User
from api.models import UserProfile

print("="*60)
print("ABONE OLAN KULLANICILAR")
print("="*60)

# Abone olan kullanıcıları bul
subscribers = User.objects.filter(
    profile__receive_sales_emails=True,
    is_active=True
).select_related('profile')

users_to_email = [u for u in subscribers if u.email and u.email.strip()]

if not users_to_email:
    print("\n❌ Abone olan kullanıcı bulunamadı!")
    print("\nÇözüm:")
    print("1. Profile sayfasına gidin")
    print("2. 'Sales & promotional emails' toggle'ını açın")
    print("VEYA")
    print("python setup_test_user.py çalıştırın")
else:
    print(f"\n✓ {len(users_to_email)} abone bulundu:\n")
    for user in users_to_email:
        print(f"  - {user.email} ({user.username})")
        print(f"    Abone: {user.profile.receive_sales_emails}")
        print(f"    Aktif: {user.is_active}")
        print()

print("="*60)

