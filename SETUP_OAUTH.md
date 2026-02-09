# 🔑 Cara Setup Login dengan Google (OAuth)

Panduan super simpel untuk mengaktifkan fitur **Tambah/Edit/Hapus Meeting** langsung dari website Ovrica.

---

## 📋 Yang Perlu Kamu Lakukan (5 Langkah Mudah)

### 1️⃣ Buka Google Cloud Console

1. Buka browser, pergi ke: **https://console.cloud.google.com**
2. Login dengan akun Google kamu (aldibalkar23@gmail.com)
3. Pilih project **"aldibalkar-api"** (yang sudah kamu buat sebelumnya)

---

### 2️⃣ Aktifkan OAuth Consent Screen

1. Di sidebar kiri, cari menu **"APIs & Services"** → **"OAuth consent screen"**
2. Pilih **"External"** (untuk user biasa)
3. Klik **"CREATE"**
4. Isi form:
   - **App name**: `Balkar Ovrica`
   - **User support email**: `aldibalkar23@gmail.com`
   - **Developer contact**: `aldibalkar23@gmail.com`
5. Klik **"SAVE AND CONTINUE"**
6. Di bagian **Scopes**, klik **"ADD OR REMOVE SCOPES"**
7. Cari dan centang:
   - ✅ `../auth/userinfo.email`
   - ✅ `../auth/userinfo.profile`
   - ✅ `../auth/calendar` (penting!)
8. Klik **"UPDATE"** → **"SAVE AND CONTINUE"**
9. Di **Test users**, klik **"ADD USERS"**
10. Tambahkan email: `aldibalkar23@gmail.com`
11. Klik **"SAVE AND CONTINUE"** sampai selesai

---

### 3️⃣ Buat OAuth Client ID

1. Di sidebar kiri, klik **"Credentials"**
2. Klik tombol **"+ CREATE CREDENTIALS"** di atas
3. Pilih **"OAuth client ID"**
4. Pilih **Application type**: **"Web application"**
5. Isi:
   - **Name**: `Ovrica Web App`
   - **Authorized JavaScript origins**:
     - Klik **"+ ADD URI"**
     - Isi: `http://localhost:3000`
   - **Authorized redirect URIs**:
     - Klik **"+ ADD URI"**
     - Isi: `http://localhost:3000/api/auth/callback/google`
6. Klik **"CREATE"**

---

### 4️⃣ Copy Client ID dan Secret

Setelah klik CREATE, akan muncul popup dengan:
- **Client ID**: `123456789-abcdefg.apps.googleusercontent.com`
- **Client Secret**: `GOCSPX-abc123xyz`

**PENTING:** Copy kedua nilai ini!

---

### 5️⃣ Masukkan ke File .env.local

1. Buka file `.env.local` di project kamu
2. Ganti baris ini:

```env
GOOGLE_CLIENT_ID=your-client-id-here
GOOGLE_CLIENT_SECRET=your-client-secret-here
```

Dengan nilai yang kamu copy tadi:

```env
GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abc123xyz
```

3. **Save file** dan **restart development server**:

```bash
# Tekan Ctrl+C di terminal untuk stop server
# Lalu jalankan lagi:
npm run dev
```

---

## ✅ Selesai!

Sekarang kamu bisa:
- ✨ **Login dengan Google** di web Ovrica
- ➕ **Tambah Meeting** langsung dari website
- ✏️ **Edit Meeting** yang sudah ada
- 🗑️ **Hapus Meeting** dengan satu klik

Semua data tersimpan di **Google Calendar** kamu, tidak perlu database tambahan!

---

## 🆘 Troubleshooting

### Error: "redirect_uri_mismatch"
✅ Pastikan di Google Console, Authorized redirect URIs sudah diisi:
```
http://localhost:3000/api/auth/callback/google
```

### Error: "Access blocked: This app's request is invalid"
✅ Pastikan email kamu sudah ditambahkan di **Test users** di OAuth consent screen

### Tidak bisa login
✅ Cek file `.env.local` sudah benar isi `GOOGLE_CLIENT_ID` dan `GOOGLE_CLIENT_SECRET`
✅ Restart development server setelah edit `.env.local`

---

## 📞 Butuh Bantuan?

Kalau ada yang bingung, tanya aja! 😊
