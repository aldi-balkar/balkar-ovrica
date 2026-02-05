'use client';

import { useState } from 'react';
import MainLayout from '@/components/MainLayout';

interface Meeting {
  id: number;
  title: string;
  date: string;
  time: string;
  description: string;
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [meetings] = useState<Meeting[]>([
    {
      id: 1,
      title: 'Team Standup Meeting',
      date: '2026-02-10',
      time: '09:00',
      description: 'Daily standup with development team',
    },
    {
      id: 2,
      title: 'Client Presentation',
      date: '2026-02-15',
      time: '14:00',
      description: 'Q1 progress presentation to client',
    },
  ]);
  const [showModal, setShowModal] = useState(false);

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const hasMeeting = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return meetings.some(m => m.date === dateStr);
  };

  const isToday = (day: number) => {
    const today = new Date();
    return day === today.getDate() && 
           currentDate.getMonth() === today.getMonth() && 
           currentDate.getFullYear() === today.getFullYear();
  };

  const days = getDaysInMonth(currentDate);

  return (
    <MainLayout>
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Calendar</h1>
        <p className="text-sm sm:text-base text-gray-600">Kelola jadwal meeting Anda</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Calendar Section */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 shadow-sm">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={previousMonth}
                  className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-gray-700">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                  </svg>
                </button>
                <button
                  onClick={nextMonth}
                  className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-gray-700">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {/* Day Headers */}
              {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(day => (
                <div key={day} className="text-center text-xs sm:text-sm font-semibold text-gray-600 py-2">
                  {day}
                </div>
              ))}

              {/* Calendar Days */}
              {days.map((day, index) => {
                const dayKey = day === null ? `empty-${index}` : `day-${currentMonth}-${day}`;
                return (
                <div
                  key={dayKey}
                  className={`
                    aspect-square flex items-center justify-center rounded-lg text-xs sm:text-sm font-medium
                    ${day === null ? 'invisible' : ''}
                    ${isToday(day as number) ? 'bg-[#2d7a4a] text-white' : 'text-gray-700'}
                    ${hasMeeting(day as number) && !isToday(day as number) ? 'bg-orange-100 text-orange-700' : ''}
                    ${!isToday(day as number) && !hasMeeting(day as number) ? 'hover:bg-gray-100' : ''}
                    transition-colors cursor-pointer relative
                  `}
                >
                  {day}
                  {hasMeeting(day as number) && (
                    <span className="absolute bottom-0.5 sm:bottom-1 w-1 h-1 bg-[#FF6436] rounded-full"></span>
                  )}
                </div>
              );
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 sm:w-4 sm:h-4 bg-[#2d7a4a] rounded"></div>
                <span className="text-xs sm:text-sm text-gray-600">Hari Ini</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 sm:w-4 sm:h-4 bg-orange-100 rounded"></div>
                <span className="text-xs sm:text-sm text-gray-600">Ada Meeting</span>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Meetings */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 shadow-sm mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Jadwal Meeting</h3>
              <button
                onClick={() => setShowModal(true)}
                className="w-full sm:w-auto px-4 py-2 bg-[#FF6436] text-white rounded-lg text-sm font-medium hover:bg-opacity-90 transition-all whitespace-nowrap"
              >
                + Tambah Jadwal Meeting
              </button>
            </div>

            <div className="space-y-3">
              {meetings.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Tidak ada meeting yang dijadwalkan</p>
              ) : (
                meetings.map(meeting => (
                  <div
                    key={meeting.id}
                    className="p-4 bg-gray-50 border border-gray-200 rounded-xl hover:border-[#2d7a4a] transition-all"
                  >
                    <h4 className="font-semibold text-gray-900 mb-1">{meeting.title}</h4>
                    <p className="text-sm text-gray-600 mb-2">{meeting.description}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                      </svg>
                      {new Date(meeting.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 ml-2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {meeting.time}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Tambah Jadwal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-4 sm:p-6 w-full max-w-md">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Tambah Jadwal Meeting</h3>
            <form className="space-y-4">
              <div>
                <label htmlFor="meeting-title" className="block text-sm font-medium text-gray-700 mb-2">Judul Meeting</label>
                <input
                  id="meeting-title"
                  type="text"
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:border-[#2d7a4a] focus:ring-2 focus:ring-[#2d7a4a]/20 outline-none"
                  placeholder="Masukkan judul meeting"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="cal-date" className="block text-sm font-medium text-gray-700 mb-2">Tanggal</label>
                  <input
                    id="cal-date"
                    type="date"
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:border-[#2d7a4a] focus:ring-2 focus:ring-[#2d7a4a]/20 outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="cal-time" className="block text-sm font-medium text-gray-700 mb-2">Waktu</label>
                  <input
                    id="cal-time"
                    type="time"
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:border-[#2d7a4a] focus:ring-2 focus:ring-[#2d7a4a]/20 outline-none"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="cal-desc" className="block text-sm font-medium text-gray-700 mb-2">Deskripsi</label>
                <textarea
                  id="cal-desc"
                  rows={3}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:border-[#2d7a4a] focus:ring-2 focus:ring-[#2d7a4a]/20 outline-none resize-none"
                  placeholder="Deskripsi meeting..."
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#FF6436] text-white rounded-lg font-medium hover:bg-opacity-90 transition-all"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
