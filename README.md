# Ovrica - Meeting Management App

Web aplikasi untuk manajemen meeting dengan fitur Calendar, Spin Wheel, Notulen, dan Daftar Hadir.

## 🚀 Features

- **Calendar** - View dan manage jadwal meeting
- **Spin Wheel** - Random presenter selector dengan konfetti animation
- **Notulen** - Catatan hasil meeting
- **Daftar Hadir** - Attendance tracking peserta
- **Google Calendar Integration** - Sync dengan Google Calendar API

## 📦 Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS v4
- Google Calendar API

## 🔧 Setup Google Calendar API

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project atau pilih existing project
3. Enable **Google Calendar API**:
   - Navigate to "APIs & Services" > "Library"
   - Search "Google Calendar API"
   - Click "Enable"

### 2. Get API Credentials

#### Option A: API Key (Public Calendar - Simpler)

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy API key yang di-generate
4. (Optional) Click "Restrict Key" untuk security:
   - Application restrictions: HTTP referrers
   - API restrictions: Google Calendar API

#### Option B: OAuth 2.0 (Private Calendar - More Secure)

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Configure consent screen if prompted
4. Choose "Web application"
5. Add authorized redirect URIs: `http://localhost:3000`
6. Copy Client ID

### 3. Configure Calendar Sharing (if using API Key)

1. Open [Google Calendar](https://calendar.google.com/)
2. Click settings (⚙️) for your calendar
3. Scroll to "Access permissions"
4. Check "Make available to public"
5. Copy your Calendar ID from settings (usually `your-email@gmail.com`)

### 4. Environment Variables

Create `.env.local` file di root project:

```env
# API Key method (simpler)
NEXT_PUBLIC_GOOGLE_API_KEY=your_api_key_here
NEXT_PUBLIC_GOOGLE_CALENDAR_ID=your_calendar_id@gmail.com

# Atau gunakan 'primary' untuk calendar utama (requires OAuth)
# NEXT_PUBLIC_GOOGLE_CALENDAR_ID=primary
```

## 🏃‍♂️ Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000)

## 📝 Notes

- Google Calendar API memiliki quota limit: 1,000,000 requests/day
- Untuk production, gunakan OAuth 2.0 dengan proper authentication
- Test dengan public calendar terlebih dahulu sebelum production

## 🎨 Color Palette

- Primary Green: `#2d7a4a`
- Accent Orange: `#FF6436`
- Background: `#f9fafb`

## 📄 License

MIT
