# Pet Store - Login & Signup

React.js ile mock data kullanarak yapılmış Login ve Signup sayfaları.

## Kurulum

1. **Dependencies yükle:**
```bash
npm install
```

2. **Development server'ı başlat:**
```bash
npm run dev
```

3. **Tarayıcıda aç:**
```
http://localhost:5173
```

## Test Senaryoları

### 1. Login Testi

1. Tarayıcıda `/login` sayfasına gidin
2. Demo bilgilerle giriş yapın:
   - **Email:** `admin@petstore.com`
   - **Password:** `admin123`
3. "Login" butonuna tıklayın
4. Başarılı login sonrası `/products` sayfasına yönlendirilmelisiniz

### 2. Signup Testi

1. `/signup` sayfasına gidin
2. Formu doldurun:
   - Full Name
   - Email (yeni bir email kullanın)
   - Tax ID
   - Address
   - Password (minimum 6 karakter)
   - Confirm Password
3. "Sign Up" butonuna tıklayın
4. Yeni kullanıcı oluşturulup `/products` sayfasına yönlendirilmelisiniz

### 3. Hata Senaryoları

- **Yanlış şifre:** Hata mesajı gösterilmeli
- **Kayıtlı email ile signup:** "Email already registered" hatası
- **Şifreler eşleşmiyor:** "Passwords do not match" hatası
- **Kısa şifre (6 karakterden az):** "Password must be at least 6 characters" hatası

### 4. Logout Testi

1. Login olduktan sonra menüdeki "Logout" butonuna tıklayın
2. `/login` sayfasına yönlendirilmelisiniz
3. localStorage temizlenmeli

## Mock Data

- Kullanıcılar `localStorage.mock_users` içinde saklanır
- İlk açılışta 2 varsayılan kullanıcı oluşturulur
- Yeni kayıtlar aynı localStorage'a eklenir

## Demo Kullanıcılar

1. **Admin:**
   - Email: `admin@petstore.com`
   - Password: `admin123`

2. **Test User:**
   - Email: `user@example.com`
   - Password: `password123`

---

## 📧 Sales Email Automation

### Özellikler

- ✅ Kullanıcılar Profile sayfasından sales email'lere abone olabilir
- ✅ Management command ile toplu email gönderimi
- ✅ Profesyonel HTML email template'leri
- ✅ Kişiselleştirilmiş email içeriği
- ✅ Hata yönetimi ve raporlama

### Hızlı Başlangıç

1. **Migration çalıştır:**
```bash
python manage.py migrate
```

2. **Kullanıcı abone olur:**
   - Profile sayfasına git (`/profile`)
   - "Sales & promotional emails" toggle'ını aç

3. **Email gönder:**
```bash
python manage.py send_sales_emails \
  --subject "Özel İndirim!" \
  --message "Tüm ürünlerde %50 indirim!"
```

### Demo ve Test

Detaylı demo rehberi için: **[DEMO_SALES_EMAIL.md](./DEMO_SALES_EMAIL.md)**

Hızlı test scripti:
```bash
./test_sales_email.sh
```

### Dokümantasyon

- **Demo Rehberi**: [DEMO_SALES_EMAIL.md](./DEMO_SALES_EMAIL.md)
- **Teknik Detaylar**: [SALES_EMAIL_AUTOMATION.md](./SALES_EMAIL_AUTOMATION.md)

---

# cs-308-Term-Project
