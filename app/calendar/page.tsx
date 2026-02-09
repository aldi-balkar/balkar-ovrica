'use client';

import { useState, useEffect } from 'react';
import MainLayout from '@/components/MainLayout';
import { useSession } from 'next-auth/react';

interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime?: string;
    date?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
  };
  location?: string;
}

interface MeetingForm {
  summary: string;
  description: string;
  date: string;
  time: string;
  duration: string;
  location: string;
}

export default function CalendarPage() {
  const { data: session } = useSession();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<MeetingForm>({
    summary: '',
    description: '',
    date: '',
    time: '',
    duration: '60',
    location: '',
  });

  // Fetch events from Google Calendar
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
        const calendarId = process.env.NEXT_PUBLIC_GOOGLE_CALENDAR_ID;

        if (!apiKey || !calendarId) {
          console.error('Missing API credentials');
          return;
        }

        // Get start and end of the current month
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59);

        const timeMin = startOfMonth.toISOString();
        const timeMax = endOfMonth.toISOString();

        const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?key=${apiKey}&timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime`;

        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        setEvents(data.items || []);
      } catch (error) {
        console.error('Error fetching calendar events:', error);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [currentDate]);

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
    return events.some(event => {
      const eventDate = event.start.dateTime || event.start.date;
      if (!eventDate) return false;
      const eventDateStr = eventDate.split('T')[0]; // Get YYYY-MM-DD part
      return eventDateStr === dateStr;
    });
  };

  const getEventsForDay = (day: number): CalendarEvent[] => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(event => {
      const eventDate = event.start.dateTime || event.start.date;
      if (!eventDate) return false;
      const eventDateStr = eventDate.split('T')[0];
      return eventDateStr === dateStr;
    });
  };

  const formatTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  const isToday = (day: number) => {
    const today = new Date();
    return day === today.getDate() && 
           currentDate.getMonth() === today.getMonth() && 
           currentDate.getFullYear() === today.getFullYear();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session) {
      alert('Silakan login terlebih dahulu untuk menambah meeting');
      return;
    }

    setSubmitting(true);

    try {
      // Calculate end time
      const startDateTime = new Date(`${formData.date}T${formData.time}`);
      const endDateTime = new Date(startDateTime.getTime() + parseInt(formData.duration) * 60000);

      const response = await fetch('/api/calendar/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          summary: formData.summary,
          description: formData.description,
          startDateTime: startDateTime.toISOString(),
          endDateTime: endDateTime.toISOString(),
          location: formData.location,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create event');
      }

      // Reset form and close modal
      setFormData({
        summary: '',
        description: '',
        date: '',
        time: '',
        duration: '60',
        location: '',
      });
      setShowModal(false);

      // Refresh events
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
      const calendarId = process.env.NEXT_PUBLIC_GOOGLE_CALENDAR_ID;
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59);
      const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId || '')}/events?key=${apiKey}&timeMin=${startOfMonth.toISOString()}&timeMax=${endOfMonth.toISOString()}&singleEvents=true&orderBy=startTime`;
      const refreshResponse = await fetch(url);
      const data = await refreshResponse.json();
      setEvents(data.items || []);

      alert('✅ Meeting berhasil ditambahkan!');
    } catch (error) {
      console.error('Error creating event:', error);
      alert('❌ Gagal menambahkan meeting. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
    }
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
                const dayKey = day === null ? `empty-${index}` : `day-${currentDate.getMonth()}-${day}`;
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
              {session ? (
                <button
                  onClick={() => setShowModal(true)}
                  className="w-full sm:w-auto px-4 py-2 bg-[#FF6436] text-white rounded-lg text-sm font-medium hover:bg-opacity-90 transition-all whitespace-nowrap text-center"
                >
                  + Tambah Jadwal Meeting
                </button>
              ) : (
                <a
                  href={`https://calendar.google.com/calendar/u/0/r/eventedit?dates=${new Date().toISOString().split('T')[0].replace(/-/g, '')}/${new Date().toISOString().split('T')[0].replace(/-/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-4 py-2 bg-[#FF6436] text-white rounded-lg text-sm font-medium hover:bg-opacity-90 transition-all whitespace-nowrap text-center"
                >
                  + Tambah Jadwal Meeting
                </a>
              )}
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="p-4 bg-gray-100 rounded-xl animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {events.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-3">Tidak ada meeting yang dijadwalkan</p>
                    <a
                      href="https://calendar.google.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-[#2d7a4a] hover:underline"
                    >
                      Buka Google Calendar →
                    </a>
                  </div>
                ) : (
                  events.slice(0, 5).map(event => (
                    <div
                      key={event.id}
                      className="p-4 bg-gray-50 border border-gray-200 rounded-xl hover:border-[#2d7a4a] transition-all"
                    >
                      <h4 className="font-semibold text-gray-900 mb-1">{event.summary}</h4>
                      {event.description && (
                        <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                      )}
                      <div className="flex items-center gap-2 text-sm text-gray-500 flex-wrap">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                        </svg>
                        {new Date(event.start.dateTime || event.start.date || '').toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        {event.start.dateTime && (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 ml-2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {formatTime(event.start.dateTime)}
                          </>
                        )}
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                          </svg>
                          {event.location}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Tambah Jadwal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Tambah Jadwal Meeting</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="meeting-title" className="block text-sm font-medium text-gray-700 mb-2">
                  Judul Meeting *
                </label>
                <input
                  id="meeting-title"
                  type="text"
                  required
                  value={formData.summary}
                  onChange={(e) => setFormData({...formData, summary: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:border-[#2d7a4a] focus:ring-2 focus:ring-[#2d7a4a]/20 outline-none"
                  placeholder="Masukkan judul meeting"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="cal-date" className="block text-sm font-medium text-gray-700 mb-2">
                    Tanggal *
                  </label>
                  <input
                    id="cal-date"
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:border-[#2d7a4a] focus:ring-2 focus:ring-[#2d7a4a]/20 outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="cal-time" className="block text-sm font-medium text-gray-700 mb-2">
                    Waktu *
                  </label>
                  <input
                    id="cal-time"
                    type="time"
                    required
                    value={formData.time}
                    onChange={(e) => setFormData({...formData, time: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:border-[#2d7a4a] focus:ring-2 focus:ring-[#2d7a4a]/20 outline-none"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="cal-duration" className="block text-sm font-medium text-gray-700 mb-2">
                  Durasi
                </label>
                <select
                  id="cal-duration"
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:border-[#2d7a4a] focus:ring-2 focus:ring-[#2d7a4a]/20 outline-none"
                >
                  <option value="30">30 menit</option>
                  <option value="60">1 jam</option>
                  <option value="90">1.5 jam</option>
                  <option value="120">2 jam</option>
                </select>
              </div>

              <div>
                <label htmlFor="cal-location" className="block text-sm font-medium text-gray-700 mb-2">
                  Lokasi
                </label>
                <input
                  id="cal-location"
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:border-[#2d7a4a] focus:ring-2 focus:ring-[#2d7a4a]/20 outline-none"
                  placeholder="Zoom, Office, dll"
                />
              </div>

              <div>
                <label htmlFor="cal-desc" className="block text-sm font-medium text-gray-700 mb-2">
                  Deskripsi
                </label>
                <textarea
                  id="cal-desc"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:border-[#2d7a4a] focus:ring-2 focus:ring-[#2d7a4a]/20 outline-none resize-none"
                  placeholder="Deskripsi meeting..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setFormData({
                      summary: '',
                      description: '',
                      date: '',
                      time: '',
                      duration: '60',
                      location: '',
                    });
                  }}
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-all disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-[#FF6436] text-white rounded-lg font-medium hover:bg-opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Menyimpan...
                    </>
                  ) : (
                    'Simpan'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
