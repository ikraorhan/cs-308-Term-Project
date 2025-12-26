# Sales Email Automation - Demo Guide

Bu dokümantasyon, Sales Email Automation sisteminin hocaya gösterilmesi için hazırlanmıştır.

## 🎯 Sistem Özellikleri

1. ✅ Kullanıcılar Profile sayfasından sales email'lere abone olabilir
2. ✅ Management command ile toplu email gönderimi
3. ✅ Profesyonel HTML email template'leri
4. ✅ Kişiselleştirilmiş email içeriği
5. ✅ Hata yönetimi ve raporlama

## 📋 Demo Senaryosu

### Adım 1: Kullanıcı Abone Olma

1. **Frontend'e gidin**: `http://localhost:5173/profile`
2. **Login olun** (herhangi bir kullanıcı ile)
3. **"Preferences & notifications"** bölümüne gidin
4. **"Sales & promotional emails"** toggle'ını **AÇIN** (ON yapın)
5. Toggle değiştiğinde backend'e otomatik kaydedilir

**Görsel olarak gösterilecek:**
- Profile sayfasında "Sales & promotional emails" tercihi görünür
- Toggle açıldığında backend'e kaydedilir

### Adım 2: Email Gönderme (Terminal)

Terminal'de şu komutu çalıştırın:

```bash
cd /Users/almiraaygun/cs-308-Term-Project/cs-308-Term-Project-4
python manage.py send_sales_emails \
  --subject "🐾 Özel Hafta Sonu İndirimi - %50'ye Varan İndirimler!" \
  --message "Merhaba!

Bu hafta sonu özel bir kampanyamız var! Tüm ürünlerde %50'ye varan indirimler sizleri bekliyor.

✨ Yeni gelen ürünler
🎁 Özel hediye seçenekleri  
💚 Ücretsiz kargo fırsatı

Hemen alışverişe başlayın ve sevimli dostlarınızı mutlu edin!

Sevgiler,
Pet Store Ekibi"
```

**Beklenen Çıktı:**
```
Found 1 user(s) to email (out of 1 total subscribers)
✓ Sent to user@example.com (username)

Email sending completed!
  Successfully sent: 1
  Failed: 0
  Total: 1
```

### Adım 3: Email Kontrolü

1. Abone olan kullanıcının email adresine gidin (Gmail, vs.)
2. Gelen kutuda profesyonel HTML email'i görün
3. Email'de:
   - Pet Store branding (🐾 ikonu)
   - Kişiselleştirilmiş selamlama
   - Mesaj içeriği
   - "Shop Now" butonu
   - Unsubscribe linki

## 🧪 Test Senaryoları

### Test 1: Dry-Run (Email Göndermeden Test)

```bash
python manage.py send_sales_emails \
  --subject "Test Email" \
  --message "Bu bir test mesajıdır" \
  --dry-run
```

**Beklenen Çıktı:**
```
Found 1 user(s) to email (out of 1 total subscribers)
DRY RUN MODE - No emails will be sent
  - Would send to: user@example.com (username)
```

### Test 2: Limit ile Test (Sadece 1 Kullanıcıya)

```bash
python manage.py send_sales_emails \
  --subject "Test Email" \
  --message "Bu bir test mesajıdır" \
  --limit 1
```

### Test 3: Özel HTML Mesaj

```bash
python manage.py send_sales_emails \
  --subject "Yeni Ürünler" \
  --message "Check out our new products!" \
  --html-message "<h1>Yeni Ürünler!</h1><p>Sevimli dostlarınız için harika ürünler!</p>"
```

## 📊 Sistem Mimarisi

### Backend Bileşenleri

1. **Model**: `UserProfile.receive_sales_emails` (BooleanField)
2. **API Endpoint**: `PUT /api/user/profile/` - Tercih güncelleme
3. **Management Command**: `send_sales_emails` - Email gönderme
4. **Utility Function**: `api/utils.py::create_sales_email_html()` - HTML template

### Frontend Bileşenleri

1. **Profile.jsx**: Preferences bölümünde toggle
2. **API Integration**: `authAPI.updateProfile()` ile backend'e kayıt

### Email Ayarları

- **SMTP Server**: Gmail (smtp.gmail.com:587)
- **From Email**: almiraaygun@gmail.com
- **Template**: Responsive HTML template (api/utils.py)

## 🔍 Kod İnceleme Noktaları

### 1. Model (api/models.py)
```python
receive_sales_emails = models.BooleanField(
    default=False, 
    help_text='Whether the user wants to receive sales/promotional emails'
)
```

### 2. Management Command (api/management/commands/send_sales_emails.py)
- Abone olan kullanıcıları filtreler
- Her kullanıcıya kişiselleştirilmiş email gönderir
- Hata yönetimi ve raporlama yapar

### 3. Frontend Integration (components/Profile.jsx)
- Toggle değiştiğinde otomatik backend'e kaydeder
- State yönetimi ve error handling

## 📝 Önemli Notlar

1. **Migration**: `0007_userprofile_receive_sales_emails.py` çalıştırılmış olmalı
2. **Email Settings**: Gmail SMTP ayarları `settings.py`'de yapılandırılmış
3. **Backend**: Django server çalışıyor olmalı (`python manage.py runserver`)
4. **Frontend**: React app çalışıyor olmalı (`npm run dev`)

## 🎬 Demo Sırası (Önerilen)

1. **Frontend'i göster**: Profile sayfasında toggle'ı aç/kapat
2. **Backend API'yi göster**: Network tab'da PUT request'i göster
3. **Terminal'de komut çalıştır**: Email gönderme komutunu göster
4. **Email'i göster**: Gmail'de gelen email'i göster
5. **Kod incelemesi**: Önemli dosyaları aç ve açıkla

## ✅ Checklist (Demo Öncesi)

- [ ] Migration çalıştırıldı (`python manage.py migrate`)
- [ ] En az 1 kullanıcı abone oldu (Profile'da toggle açık)
- [ ] Backend server çalışıyor
- [ ] Frontend server çalışıyor
- [ ] Email ayarları doğru (Gmail SMTP)
- [ ] Test email gönderildi ve kontrol edildi

## 🚀 Hızlı Başlangıç

```bash
# 1. Migration çalıştır
python manage.py migrate

# 2. Backend başlat
python manage.py runserver

# 3. Frontend başlat (başka terminal)
npm run dev

# 4. Profile'a git ve toggle'ı aç
# http://localhost:5173/profile

# 5. Email gönder
python manage.py send_sales_emails \
  --subject "Test Email" \
  --message "Sistem çalışıyor!" \
  --limit 1
```

---

**Hazırlayan**: CS 308 Term Project Team  
**Tarih**: Aralık 2024

