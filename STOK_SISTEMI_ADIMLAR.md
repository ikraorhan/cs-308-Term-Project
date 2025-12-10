# Stok Sistemi - Adım Adım Plan

## 📊 Mevcut Durum Analizi

### ✅ Zaten Var:
1. **Product Model**: `quantity_in_stock` field'ı var
2. **Frontend Stok Gösterimi**: 
   - ProductCard'da "In Stock: X" gösteriliyor ✅
   - ProductDetail'de "In Stock: X" gösteriliyor ✅
   - Stok 0 ise "Out of Stock" gösteriliyor ✅

### ❌ Eksik:
1. **Backend'de Stok Düşümü**: `create_order` fonksiyonunda stok düşümü YOK
2. **Frontend product_id**: Kontrol etmemiz gerekiyor

---

## 🎯 Hedef

1. Ürün seçildiğinde → Stok gösterilsin ✅ (Zaten var)
2. Satın alma yapıldığında → Stok düşsün ❌ (Eklenecek)

---

## 📝 Adım Adım Plan

### Adım 1: Backend'de Stok Düşümü Ekle
**Dosya**: `product_manager_api/views.py` → `create_order` fonksiyonu

**Yapılacaklar:**
- `product_id` ve `quantity` al
- Product'ı DB'den bul
- Stok kontrolü yap (yeterli mi?)
- Stoku düşür
- Siparişi oluştur

### Adım 2: Frontend'de product_id Kontrol Et
**Dosya**: `components/PaymentMockFlow.jsx`

**Yapılacaklar:**
- `product_id` gönderildiğinden emin ol
- Debug log ekle (kontrol için)

### Adım 3: Test Et
- Backend server başlat
- Ürün stok miktarını not al
- Sepete ekle → Checkout
- Stok düştü mü kontrol et

---

## ✅ Tamamlandı!

### Adım 1: Backend Stok Düşümü ✅
**Dosya**: `product_manager_api/views.py` → `create_order` fonksiyonu

**Eklenen kod:**
- `product_id` ve `quantity` alınıyor
- Product DB'den bulunuyor
- Stok kontrolü yapılıyor (yetersizse hata dönüyor)
- Stok düşürülüyor ve kaydediliyor
- Console log eklendi (debug için)

### Adım 2: Frontend product_id Kontrolü ✅
**Dosya**: `components/PaymentMockFlow.jsx`

**Yapılan:**
- `product_id` zaten gönderiliyor ✅
- Debug log eklendi (console'da görebilirsin)

### Adım 3: Frontend Stok Gösterimi ✅
**Zaten var:**
- ProductCard'da "In Stock: X" gösteriliyor ✅
- ProductDetail'de "In Stock: X" gösteriliyor ✅

---

## 🧪 Test Et

### 1. Backend Server'ı Başlat
```bash
python manage.py runserver
```

### 2. Test Senaryosu
1. **Bir ürünün stok miktarını not al** (örn: 20)
2. **Sepete ekle** (örn: 2 adet)
3. **Checkout → Ödeme yap**
4. **Browser Console'da kontrol et:**
   ```
   📦 Order Data: {
     product_id: 2,
     quantity: 2,
     ...
   }
   ```
5. **Backend Terminal'de kontrol et:**
   ```
   ✅ Stock updated: Product ID 2, 20 -> 18
   ```
6. **Ürün detay sayfasına git ve sayfayı yenile (F5)**
7. **Stok 18 olmalı** (20 - 2 = 18)

---

## 🎯 Özet

✅ **Stok gösterimi**: Zaten var (ProductCard, ProductDetail)  
✅ **Stok düşümü**: Eklendi (Backend create_order)  
✅ **Debug log**: Eklendi (Console'da görebilirsin)

Şimdi test edebilirsin! 🚀

