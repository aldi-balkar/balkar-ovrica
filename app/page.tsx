'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import MainLayout from '@/components/MainLayout';
import UpcomingSchedule from '@/components/UpcomingSchedule';
import MyMeetings from '@/components/MyMeetings';
import AuthButton from '@/components/AuthButton';
import AuthWarningBanner from '@/components/AuthWarningBanner';

export default function Home() {
  const { data: session, status } = useSession();

  return (
    <MainLayout>
      {/* Hero Section - OpusClip Style */}
      <div className="text-center py-16 px-4 mb-12">
        {/* Tagline Badge */}
        <div className="inline-flex items-center gap-2 bg-[#2d7a4a]/10 border border-[#2d7a4a]/20 rounded-full px-4 py-2 mb-6">
          <span className="text-[#2d7a4a] text-sm font-medium">#1 SMART MEETING MANAGEMENT</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 leading-tight">
          1 meeting. 10 insights.<br />Manage 10x smarter.
        </h1>

        {/* Subtitle */}
        <p className="text-gray-600 text-lg md:text-xl mb-8 max-w-3xl mx-auto">
          Ovrica transforms your meetings into actionable insights, manages attendance, and generates complete notes automatically.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            href="/calendar"
            className="px-8 py-4 bg-[#2d7a4a] text-white rounded-xl font-semibold hover:bg-[#235d3a] transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Schedule Meeting
          </Link>
          <Link 
            href="/notulen"
            className="px-8 py-4 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:border-[#2d7a4a] hover:text-[#2d7a4a] transition-all duration-300"
          >
            View Notulen
          </Link>
        </div>

        {/* Feature Pills */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-10">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2 text-sm text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-[#2d7a4a]">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Smart Scheduling
          </div>
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2 text-sm text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-[#2d7a4a]">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Auto Notulen
          </div>
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2 text-sm text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-[#2d7a4a]">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Digital Attendance
          </div>
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2 text-sm text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-[#2d7a4a]">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Fair Spin Wheel
          </div>
        </div>
      </div>

      {/* Content Grid */}
      {session ? (
        // Logged In User - Show Dashboard
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Google Calendar Schedule Section */}
          <UpcomingSchedule />

          {/* My Meetings Section */}
          <MyMeetings />
        </div>
      ) : (
        // Not Logged In - Show Feature Showcase
        <div className="space-y-12">
          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 bg-[#2d7a4a]/10 rounded-xl flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-[#2d7a4a]">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Calendar</h3>
              <p className="text-sm text-gray-600">Sync dengan Google Calendar, atur meeting dengan mudah, dan dapat notifikasi otomatis.</p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 bg-[#FF6436]/10 rounded-xl flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-[#FF6436]">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Auto Notulen</h3>
              <p className="text-sm text-gray-600">Generate notulen meeting otomatis dengan template lengkap dan simpan ke database.</p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-purple-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Digital Attendance</h3>
              <p className="text-sm text-gray-600">Absensi digital real-time dengan scan QR atau link, lengkap dengan laporan kehadiran.</p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-blue-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Fair Spin Wheel</h3>
              <p className="text-sm text-gray-600">Pilih presenter atau pembicara secara acil dan adil dengan animated spin wheel.</p>
            </div>
          </div>

          {/* How It Works Section */}
          <div className="bg-gradient-to-br from-[#2d7a4a]/5 to-[#FF6436]/5 border border-gray-200 rounded-3xl p-8 md:p-12">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Cara Kerja Ovrica
              </h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                3 langkah sederhana untuk meeting yang lebih produktif dan terorganisir
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="relative">
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <div className="w-12 h-12 bg-[#2d7a4a] text-white rounded-full flex items-center justify-center font-bold text-xl mb-4">
                    1
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Login & Schedule</h3>
                  <p className="text-gray-600">
                    Login dengan Google, buat meeting baru, undang peserta, dan atur jadwal melalui calendar yang terintegrasi.
                  </p>
                </div>
                {/* Arrow */}
                <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 text-[#2d7a4a]">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
                  </svg>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative">
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <div className="w-12 h-12 bg-[#FF6436] text-white rounded-full flex items-center justify-center font-bold text-xl mb-4">
                    2
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Run Meeting</h3>
                  <p className="text-gray-600">
                    Jalankan meeting dengan fitur absensi digital, spin wheel untuk pilih presenter, dan catat notulen secara real-time.
                  </p>
                </div>
                {/* Arrow */}
                <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 text-[#FF6436]">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
                  </svg>
                </div>
              </div>

              {/* Step 3 */}
              <div>
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-xl mb-4">
                    3
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Track & Review</h3>
                  <p className="text-gray-600">
                    Review notulen meeting, cek laporan kehadiran, dan track progress action items untuk follow-up yang efektif.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-gradient-to-r from-[#2d7a4a] to-[#1e5a32] rounded-3xl p-8 md:p-12 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Siap Mulai Meeting yang Lebih Smart?
            </h2>
            <p className="text-lg mb-8 text-white/90 max-w-2xl mx-auto">
              Gabung ribuan tim yang sudah menggunakan Ovrica untuk manage meeting mereka dengan lebih efisien dan produktif.
            </p>
            
            {/* Warning Banner */}
            <AuthWarningBanner />

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6">
              <div className="w-full sm:w-auto">
                <AuthButton />
              </div>
              <Link 
                href="/calendar"
                className="w-full sm:w-auto px-8 py-3 bg-white text-[#2d7a4a] rounded-xl font-semibold hover:bg-gray-100 transition-all duration-300 hover:scale-105 shadow-lg text-center"
              >
                Lihat Demo
              </Link>
            </div>
            <p className="text-sm text-white/80 mt-6 font-medium">
              🚀 Masuk sekali, nikmati fitur yang akan membantu produktivitas tim Anda
            </p>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-[#2d7a4a] mb-2">500+</div>
              <div className="text-gray-600 text-sm">Meeting Terjadwal</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-[#FF6436] mb-2">95%</div>
              <div className="text-gray-600 text-sm">Tingkat Kehadiran</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">300+</div>
              <div className="text-gray-600 text-sm">Notulen Tersimpan</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">50+</div>
              <div className="text-gray-600 text-sm">Tim Aktif</div>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
