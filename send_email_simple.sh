#!/bin/bash

# Basit email gönderme scripti

echo "Email gönderiliyor..."
echo ""

python manage.py send_sales_emails \
  --subject "Pet Store - Test Email" \
  --message "Merhaba! Bu bir test emailidir. Sistem çalışıyor!" \
  --limit 1

echo ""
echo "Tamamlandı!"

