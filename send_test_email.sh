#!/bin/bash

# Test Email Script - almiraaygun@gmail.com için
# Bu script demo için hazırlanmıştır

echo "=========================================="
echo "Sales Email Test - almiraaygun@gmail.com"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}1. Dry-run test (email gönderilmeyecek)...${NC}"
python manage.py send_sales_emails \
  --subject "Test Email - Pet Store" \
  --message "Merhaba! Bu bir test emailidir. Sistem çalışıyor!" \
  --dry-run

echo ""
read -p "Gerçek email göndermek istiyor musunuz? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}2. Email gönderiliyor...${NC}"
    python manage.py send_sales_emails \
      --subject "🐾 Pet Store - Test Email" \
      --message "Merhaba!

Bu bir test emailidir. Sales Email Automation sistemi başarıyla çalışıyor!

✨ Özellikler:
- Profesyonel HTML template
- Kişiselleştirilmiş içerik
- Responsive design

Sevgiler,
Pet Store Ekibi" \
      --limit 1
    
    echo ""
    echo -e "${GREEN}✓ Email gönderildi!${NC}"
    echo ""
    echo -e "${YELLOW}almiraaygun@gmail.com adresini kontrol edin!${NC}"
else
    echo -e "${YELLOW}Email gönderimi atlandı${NC}"
fi

echo ""
echo "=========================================="
echo "Test tamamlandı!"
echo "=========================================="

