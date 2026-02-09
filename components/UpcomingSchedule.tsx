'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface CalendarEvent {
  id: string;
  summary: string;
  start: {
    dateTime?: string;
    date?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
  };
  location?: string;
  description?: string;
}

export default function UpcomingSchedule() {
  const { data: session } = useSession();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session?.accessToken) {
      fetchEvents();
    } else {
      setLoading(false);
    }
  }, [session]);

  const fetchEvents = async () => {
    try {
      if (!session?.accessToken) {
        throw new Error('No access token available');
      }

      const timeMin = new Date().toISOString();
      
      // Gunakan access token user untuk akses calendar mereka sendiri
      const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin}&maxResults=5&singleEvents=true&orderBy=startTime`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch events: ${response.status}`);
      }

      const data = await response.json();
      setEvents(data.items || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load events');
      console.error('Error fetching calendar events:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return 'All day';
    const date = new Date(dateString);
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isToday = (dateString?: string) => {
    if (!dateString) return false;
    const eventDate = new Date(dateString);
    const today = new Date();
    return (
      eventDate.getDate() === today.getDate() &&
      eventDate.getMonth() === today.getMonth() &&
      eventDate.getFullYear() === today.getFullYear()
    );
  };

  const isTomorrow = (dateString?: string) => {
    if (!dateString) return false;
    const eventDate = new Date(dateString);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return (
      eventDate.getDate() === tomorrow.getDate() &&
      eventDate.getMonth() === tomorrow.getMonth() &&
      eventDate.getFullYear() === tomorrow.getFullYear()
    );
  };

  const getRelativeDate = (dateString?: string) => {
    if (isToday(dateString)) return 'Hari Ini';
    if (isTomorrow(dateString)) return 'Besok';
    return formatDate(dateString);
  };

  const now = new Date();
  const currentMonth = now.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  const currentDay = now.toLocaleDateString('id-ID', { weekday: 'long' });
  const currentDate = now.getDate();

  if (!session) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        <div className="text-center py-8">
          <div className="text-5xl mb-4">🔒</div>
          <p className="text-gray-600 mb-4">Login untuk melihat jadwal kamu</p>
          <Link
            href="/api/auth/signin"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#2d7a4a] text-white rounded-xl hover:bg-[#245c3a] transition-colors font-medium"
          >
            Login dengan Google
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
          <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        <div className="text-center py-8">
          <div className="text-5xl mb-4">⚠️</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchEvents}
            className="px-4 py-2 bg-[#2d7a4a] text-white rounded-lg hover:bg-[#245c3a] transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2d7a4a] to-[#1a4d2e] flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Upcoming Schedule</h2>
        </div>
        <span className="text-sm text-gray-500">{currentMonth}</span>
      </div>

      {events.length === 0 ? (
        /* Empty State */
        <div className="text-center py-8">
          <div className="mb-6 bg-gradient-to-br from-[#2d7a4a] to-[#1a4d2e] rounded-2xl p-6 max-w-xs mx-auto">
            <div className="text-white">
              <div className="text-sm font-medium mb-2">{currentDay}</div>
              <div className="text-6xl font-bold mb-2">{currentDate}</div>
              <div className="text-sm opacity-90">{currentMonth}</div>
            </div>
          </div>
          <div className="text-5xl mb-4">📭</div>
          <p className="text-gray-600 mb-6">Tidak ada jadwal meeting untuk hari ini</p>
          <Link
            href="/calendar"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#FF6436] text-white rounded-xl hover:bg-[#e55a30] transition-colors font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Tambah Event Baru
          </Link>
        </div>
      ) : (
        /* Events List */
        <div className="space-y-4">
          {events.map((event) => {
            const eventDate = event.start.dateTime || event.start.date;
            const isTodayEvent = isToday(eventDate);
            
            return (
              <div
                key={event.id}
                className={`group relative overflow-hidden rounded-xl border-2 transition-all hover:shadow-lg ${
                  isTodayEvent
                    ? 'bg-gradient-to-br from-[#2d7a4a] to-[#1a4d2e] border-[#2d7a4a] text-white'
                    : 'bg-white border-gray-200 hover:border-[#2d7a4a]'
                }`}
              >
                {/* Badge "HARI INI" untuk event hari ini */}
                {isTodayEvent && (
                  <div className="absolute top-3 right-3">
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#FF6436] text-white text-xs font-bold rounded-full animate-pulse">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      HARI INI
                    </span>
                  </div>
                )}

                <div className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Date Icon */}
                    <div className={`flex-shrink-0 w-16 h-16 rounded-xl flex flex-col items-center justify-center ${
                      isTodayEvent ? 'bg-white/20' : 'bg-gray-50'
                    }`}>
                      <div className={`text-xs font-medium ${isTodayEvent ? 'text-white' : 'text-gray-500'}`}>
                        {new Date(eventDate || '').toLocaleDateString('id-ID', { month: 'short' })}
                      </div>
                      <div className={`text-2xl font-bold ${isTodayEvent ? 'text-white' : 'text-gray-900'}`}>
                        {new Date(eventDate || '').getDate()}
                      </div>
                    </div>

                    {/* Event Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className={`text-lg font-bold mb-2 ${isTodayEvent ? 'text-white' : 'text-gray-900'}`}>
                        {event.summary}
                      </h3>
                      
                      <div className="space-y-2">
                        {/* Date Badge */}
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
                            isTodayEvent 
                              ? 'bg-white/20 text-white' 
                              : 'bg-[#2d7a4a]/10 text-[#2d7a4a]'
                          }`}>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {getRelativeDate(eventDate)}
                          </span>
                        </div>

                        {/* Time */}
                        <div className="flex items-center gap-2">
                          <svg className={`w-4 h-4 ${isTodayEvent ? 'text-white/80' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className={`text-sm ${isTodayEvent ? 'text-white/90' : 'text-gray-600'}`}>
                            {formatTime(event.start.dateTime)} - {formatTime(event.end.dateTime)}
                          </span>
                        </div>

                        {/* Location */}
                        {event.location && (
                          <div className="flex items-center gap-2">
                            <svg className={`w-4 h-4 ${isTodayEvent ? 'text-white/80' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className={`text-sm ${isTodayEvent ? 'text-white/90' : 'text-gray-600'}`}>
                              {event.location}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
