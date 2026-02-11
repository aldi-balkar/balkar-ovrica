# 📇 Cara Mengaktifkan Google People API (Opsional)

Fitur autocomplete guest dari Google Contacts memerlukan Google People API. Jika tidak diaktifkan, user masih bisa menambahkan guest dengan **mengetik email secara manual**.

---

## ⚠️ Catatan Penting

**Google People API bersifat OPSIONAL.** User tetap bisa menambahkan guests dengan cara:
1. Ketik email lengkap di field "Add guests"
2. Tekan **Enter** untuk menambahkan
3. Guest akan ditambahkan ke list

---

## 🔧 Cara Mengaktifkan (Jika Ingin Autocomplete dari Google Contacts)

### 1️⃣ Aktifkan Google People API

1. Buka **https://console.cloud.google.com**
2. Login dengan akun Google (aldibalkar23@gmail.com)
3. Pilih project **"aldibalkar-api"**
4. Di sidebar kiri, klik **"APIs & Services"** → **"Library"**
5. Search: **"Google People API"**
6. Klik pada **"Google People API"**
7. Klik tombol **"ENABLE"**
8. Tunggu beberapa detik sampai status menjadi "Enabled" ✅

---

### 2️⃣ Update OAuth Consent Screen Scopes

1. Di sidebar kiri, klik **"OAuth consent screen"**
2. Scroll ke bawah, klik tombol **"EDIT APP"**
3. Klik **"SAVE AND CONTINUE"** pada App information
4. Di bagian **Scopes**, klik **"ADD OR REMOVE SCOPES"**
5. Cari dan centang scope baru:
   - ✅ `.../auth/userinfo.email` (sudah ada)
   - ✅ `.../auth/userinfo.profile` (sudah ada)
   - ✅ `.../auth/calendar` (sudah ada)
   - ✅ `.../auth/contacts.readonly` ⬅️ **TAMBAHKAN INI**
6. Klik **"UPDATE"**
7. Klik **"SAVE AND CONTINUE"** sampai selesai

---

### 3️⃣ Logout dan Login Ulang

Setelah mengaktifkan API dan menambah scope:

1. Buka website http://localhost:3000
2. **Logout** dari aplikasi (klik tombol Sign Out)
3. **Login kembali** (klik Sign In)
4. Google akan meminta permission baru untuk "See and download your contacts"
5. Klik **"Allow"**

---

## ✨ Hasil

Setelah mengaktifkan:
- ✅ Ketik "bagas" → Muncul autocomplete dari Google Contacts
- ✅ Klik nama yang muncul → Guest langsung ditambahkan
- ✅ Tetap bisa ketik email manual jika perlu

Jika tidak diaktifkan:
- ⚠️ Autocomplete tidak muncul
- ✅ Tetap bisa mengetik email manual + Enter
- ✅ Fitur add guest tetap bekerja normal

---

## 🎯 Kesimpulan

**Tidak wajib!** Aplikasi tetap berfungsi penuh tanpa Google People API. Aktivasi hanya untuk kemudahan autocomplete saja.
