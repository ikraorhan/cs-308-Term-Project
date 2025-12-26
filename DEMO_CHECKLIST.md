# 📋 Demo Checklist - Sales Email Automation

Hocaya göstermeden önce kontrol edilmesi gerekenler.

## ✅ Ön Hazırlık

### 1. Backend Kontrolleri
- [ ] Django server çalışıyor (`python manage.py runserver`)
- [ ] Migration'lar çalıştırıldı (`python manage.py migrate`)
- [ ] Email ayarları doğru (Gmail SMTP settings.py'de)
- [ ] En az 1 test kullanıcısı var ve email adresi geçerli

### 2. Frontend Kontrolleri
- [ ] React server çalışıyor (`npm run dev`)
- [ ] Profile sayfası açılıyor (`http://localhost:5173/profile`)
- [ ] "Sales & promotional emails" toggle görünüyor
- [ ] Toggle açıldığında backend'e kaydediliyor (Network tab'da kontrol)

### 3. Test Email Kontrolleri
- [ ] En az 1 kullanıcı abone oldu (toggle açık)
- [ ] Test email gönderildi ve başarılı oldu
- [ ] Gmail'de email görünüyor
- [ ] HTML template düzgün render ediliyor

## 🎬 Demo Senaryosu

### Adım 1: Frontend Gösterimi (2-3 dakika)
- [ ] Profile sayfasını aç
- [ ] "Preferences & notifications" bölümüne git
- [ ] "Sales & promotional emails" toggle'ını göster
- [ ] Toggle'ı aç/kapat (backend'e kaydedildiğini göster)
- [ ] Browser DevTools'da Network tab'ı aç
- [ ] PUT request'i göster (`/api/user/profile/`)

### Adım 2: Backend Gösterimi (3-4 dakika)
- [ ] Terminal'i aç
- [ ] Dry-run komutunu çalıştır:
  ```bash
  python manage.py send_sales_emails \
    --subject "Test Email" \
    --message "Bu bir test" \
    --dry-run
  ```
- [ ] Abone olan kullanıcıları göster
- [ ] Gerçek email gönderme komutunu çalıştır:
  ```bash
  python manage.py send_sales_emails \
    --subject "🐾 Özel İndirim!" \
    --message "Tüm ürünlerde %50 indirim!" \
    --limit 1
  ```
- [ ] Başarı mesajını göster

### Adım 3: Email Gösterimi (1-2 dakika)
- [ ] Gmail'i aç
- [ ] Gelen email'i göster
- [ ] HTML template'i göster (responsive design, branding, vs.)
- [ ] Kişiselleştirilmiş içeriği göster

### Adım 4: Kod İncelemesi (2-3 dakika)
- [ ] `api/models.py` - `receive_sales_emails` field'ını göster
- [ ] `api/management/commands/send_sales_emails.py` - Command'ı göster
- [ ] `api/utils.py` - HTML template fonksiyonunu göster
- [ ] `components/Profile.jsx` - Frontend integration'ı göster

## 📝 Sorulabilecek Sorular ve Cevaplar

### Q: Sistem nasıl çalışıyor?
**A:** 
1. Kullanıcılar Profile sayfasında toggle ile abone olur
2. Backend'de `UserProfile.receive_sales_emails` field'ı güncellenir
3. Admin management command ile email gönderir
4. Sistem abone olan tüm kullanıcılara kişiselleştirilmiş HTML email gönderir

### Q: Email template nasıl oluşturuluyor?
**A:** `api/utils.py` içindeki `create_sales_email_html()` fonksiyonu profesyonel HTML template oluşturur. Responsive design, Pet Store branding, ve kişiselleştirilmiş içerik içerir.

### Q: Hata yönetimi nasıl yapılıyor?
**A:** Management command içinde try-except blokları var. Geçersiz email adresleri için hata yakalanır ve raporlanır, diğer email'ler gönderilmeye devam eder.

### Q: Kaç kullanıcıya email gönderilebilir?
**A:** Sınırsız. Sistem tüm abone olan aktif kullanıcılara email gönderir. Test için `--limit` parametresi kullanılabilir.

### Q: Email göndermeden test edebilir miyiz?
**A:** Evet, `--dry-run` parametresi ile email göndermeden kimlere gönderileceğini görebiliriz.

## 🚨 Olası Sorunlar ve Çözümleri

### Problem: Email gönderilmiyor
**Çözüm:**
- Gmail SMTP ayarlarını kontrol et
- App password kullanılıyor mu kontrol et
- `settings.py`'de email ayarlarını kontrol et

### Problem: Toggle görünmüyor
**Çözüm:**
- Migration çalıştırıldı mı kontrol et
- Browser cache'i temizle (hard refresh: Cmd+Shift+R)
- localStorage'ı temizle

### Problem: Backend'e kaydedilmiyor
**Çözüm:**
- Network tab'da PUT request'i kontrol et
- Backend server çalışıyor mu kontrol et
- Console'da hata var mı kontrol et

## 📊 Demo Süresi

- **Toplam**: ~10-12 dakika
- Frontend: 2-3 dakika
- Backend: 3-4 dakika
- Email: 1-2 dakika
- Kod: 2-3 dakika
- Sorular: 2-3 dakika

## 🎯 Demo Sonu

Demo sonunda şunları vurgula:
- ✅ Sistem tamamen çalışıyor
- ✅ Frontend ve Backend entegrasyonu başarılı
- ✅ Email gönderimi çalışıyor
- ✅ Hata yönetimi mevcut
- ✅ Profesyonel HTML template'ler

---

**Hazırlayan**: CS 308 Term Project Team  
**Tarih**: Aralık 2024

