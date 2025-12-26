#!/bin/bash

# Güzel bir demo email gönderme scripti

echo "=========================================="
echo "Pet Store - Güzel Email Gönderimi"
echo "=========================================="
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
Pet Store Ekibi" \
  --limit 2

echo ""
echo "=========================================="
echo "Email gönderildi! Gmail'inizi kontrol edin."
echo "=========================================="

