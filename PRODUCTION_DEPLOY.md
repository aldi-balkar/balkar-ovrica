# Production Deployment Guide

## ✅ Status: App Published to Production

OAuth app sudah dipublish dan siap untuk semua Google users!

---

## 🚀 Deploy ke Vercel

### 1. Push ke GitHub
```bash
git add .
git commit -m "feat: Production ready with OAuth and warning banner"
git push origin main
```

### 2. Deploy ke Vercel

**Option A: Via Vercel Dashboard**
1. Login ke https://vercel.com
2. Import repository `balkar-ovrica`
3. Configure project:
   - Framework Preset: **Next.js**
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`

**Option B: Via CLI**
```bash
npm install -g vercel
vercel login
vercel --prod
```

### 3. Set Environment Variables di Vercel

Di Vercel Dashboard → Project Settings → Environment Variables, tambahkan:

```env
# Google OAuth
GOOGLE_CLIENT_ID=your-client-id-here
GOOGLE_CLIENT_SECRET=your-client-secret-here

# Google Calendar API
NEXT_PUBLIC_GOOGLE_API_KEY=your-api-key-here
NEXT_PUBLIC_GOOGLE_CALENDAR_ID=your-email@gmail.com

# NextAuth - UPDATE THESE!
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=generate-new-secret-here
```

**Generate new NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

---

## 🔧 Update Google Cloud Console

### Update Authorized Domains

1. Buka: https://console.cloud.google.com/apis/credentials?project=aldibalkar-api
2. Klik OAuth Client ID yang sudah dibuat
3. **Update Authorized JavaScript origins:**
   ```
   http://localhost:3000
   https://your-app.vercel.app
   https://your-custom-domain.com  (if any)
   ```

4. **Update Authorized redirect URIs:**
   ```
   http://localhost:3000/api/auth/callback/google
   https://your-app.vercel.app/api/auth/callback/google
   https://your-custom-domain.com/api/auth/callback/google  (if any)
   ```

5. **Save**

---

## ✅ Post-Deployment Checklist

- [ ] Environment variables set di Vercel
- [ ] NEXTAUTH_URL updated ke production URL
- [ ] NEXTAUTH_SECRET generated baru untuk production
- [ ] Authorized domains updated di Google Console
- [ ] Test login di production
- [ ] Test calendar integration
- [ ] Test logout functionality
- [ ] Verify warning banner tampil saat login
- [ ] Check all pages accessible

---

## 🎯 Features Implemented

### ✅ Production Ready Components:
1. **AuthWarningBanner** - Info banner tentang "unverified app" warning
2. **Enhanced AuthButton** - Loading states & better UX
3. **Homepage** - Different views untuk logged in/out users
4. **Footer** - Professional footer dengan social links
5. **OAuth Published** - Semua Google users bisa login

### ⚠️ Known Behaviors:
- Google akan tampilkan "unverified app" warning saat login
- User harus klik "Continue" atau "Advanced → Go to Ovrica"
- Ini **NORMAL** untuk app baru yang belum diverifikasi
- AuthWarningBanner menjelaskan ini ke user

---

## 📝 Optional: OAuth Verification

Untuk hilangkan "unverified app" warning (opsional):

1. Submit OAuth Verification Request di Google Console
2. Prepare requirements:
   - Privacy Policy page
   - Terms of Service page
   - Demo video showing app functionality
   - Domain verification
3. Proses review: **4-6 minggu**
4. Setelah approved, warning akan hilang

**Note:** Verification tidak wajib, app tetap bisa digunakan dengan warning.

---

## 🆘 Troubleshooting

### Error: "Redirect URI mismatch"
- Pastikan redirect URI di Google Console match dengan production URL
- Format: `https://your-domain.com/api/auth/callback/google`

### Error: "Invalid client"
- Check GOOGLE_CLIENT_ID dan GOOGLE_CLIENT_SECRET di environment variables
- Pastikan tidak ada trailing spaces atau quotes

### Login tidak redirect ke calendar
- Check NEXTAUTH_URL sudah benar
- Verify callbackUrl di AuthButton: `/calendar`

### Session tidak persist
- Generate new NEXTAUTH_SECRET untuk production
- Jangan pakai secret yang sama dengan development

---

## 📊 Monitoring

Setelah deploy, monitor:
- Login success rate
- Calendar API errors
- Session timeouts
- User feedback tentang warning banner

---

## 🎉 You're Ready!

App sudah production-ready dengan:
- ✅ OAuth published untuk semua users
- ✅ Warning banner untuk educate users
- ✅ Enhanced UX dengan loading states
- ✅ Professional homepage & footer
- ✅ Responsive design
- ✅ Google Calendar integration

**Next Step:** Deploy ke Vercel dan test!
