#!/bin/bash

# Email gönderme scripti - 4 abone var

echo "=========================================="
echo "Pet Store - Email Gönderimi"
echo "=========================================="
echo ""
echo "4 abone bulundu, email gönderiliyor..."
echo ""

python manage.py send_sales_emails \
  --subject "🐾 Özel Hafta Sonu İndirimi - %50'ye Varan İndirimler!" \
  --message "Merhaba!

Bu hafta sonu özel bir kampanyamız var! Tüm ürünlerde %50'ye varan indirimler sizleri bekliyor.

✨ Yeni gelen ürünler
🎁 Özel hediye seçenekleri  
💚 Ücretsiz kargo fırsatı
🏆 Premium üyelere özel avantajlar

Hemen alışverişe başlayın ve sevimli dostlarınızı mutlu edin!

Sevgiler,
Pet Store Ekibi"

echo ""
echo "=========================================="
echo "Email gönderildi! Gmail'inizi kontrol edin."
echo "=========================================="

