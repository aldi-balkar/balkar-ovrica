'use client';

import { useEffect, useState } from 'react';

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
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
        const CALENDAR_ID = process.env.NEXT_PUBLIC_GOOGLE_CALENDAR_ID;

        if (!API_KEY || !CALENDAR_ID) {
          throw new Error('Missing API credentials');
        }

        const now = new Date().toISOString();
        const url = `https://www.googleapis.com/calendar/v3/calendars/${CALENDAR_ID}/events?key=${API_KEY}&timeMin=${now}&maxResults=5&singleEvents=true&orderBy=startTime`;

        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error('Failed to fetch calendar events');
        }

        const data = await response.json();
        setEvents(data.items || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

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
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { 
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { 
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('id-ID', { 
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
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
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="text-center py-8">
          <div className="text-5xl mb-4">⚠️</div>
          <p className="text-red-600 mb-2">⚠️ Failed to load calendar</p>
          <p className="text-sm text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Upcoming Schedule</h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              {new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
            </span>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mini Calendar */}
        <div className="bg-gradient-to-br from-[#2d7a4a] to-[#1a4d2e] rounded-2xl p-6 mb-6 max-w-xs mx-auto">
          <div className="text-white text-center">
            <div className="text-sm font-medium mb-2">
              {new Date().toLocaleDateString('id-ID', { weekday: 'long' })}
            </div>
            <div className="text-6xl font-bold mb-2">
              {new Date().getDate()}
            </div>
            <div className="text-sm opacity-90">
              {new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
            </div>
          </div>
        </div>

        {/* Empty State */}
        <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl">
          <div className="text-5xl mb-3">📭</div>
          <p className="text-gray-900 font-semibold mb-1">Tidak Ada Jadwal Meeting</p>
          <p className="text-sm text-gray-500 mb-4">Calendar kamu kosong untuk hari ini</p>
          <a
            href="https://calendar.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#FF6436] text-white rounded-xl text-sm font-semibold hover:bg-[#e55a30] transition-all hover:scale-105"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Tambah Event Baru
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900">Upcoming Schedule</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            {new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
          </span>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Today's Date Card */}
      <div className="bg-gradient-to-br from-[#2d7a4a] to-[#4ade80] rounded-xl p-6 mb-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm opacity-90 mb-1">Today</div>
            <div className="text-3xl font-bold">
              {new Date().toLocaleDateString('id-ID', { weekday: 'long' })}
            </div>
            <div className="text-sm opacity-90 mt-1">
              {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </div>
          <div className="text-6xl font-bold opacity-20">
            {new Date().getDate()}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {events.map((event) => {
          const eventDate = event.start.dateTime || event.start.date;
          const isTodayEvent = isToday(eventDate);
          
          return (
            <div
              key={event.id}
              className={`group relative overflow-hidden rounded-xl border-2 transition-all hover:shadow-lg ${
                isTodayEvent
                  ? 'bg-gradient-to-br from-[#2d7a4a] to-[#1a4d2e] border-[#2d7a4a] text-white'
                  : 'bg-gray-50 border-gray-200 hover:border-[#2d7a4a]'
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

              <div className="p-4">
                <div className="flex items-start gap-4">
                  {/* Date Badge */}
                  <div className={`flex-shrink-0 w-16 h-16 rounded-xl flex flex-col items-center justify-center ${
                    isTodayEvent ? 'bg-white/20' : 'bg-white border border-gray-200'
                  }`}>
                    <span className={`text-xs font-medium ${isTodayEvent ? 'text-white' : 'text-gray-500'}`}>
                      {new Date(eventDate || '').toLocaleDateString('id-ID', { month: 'short' })}
                    </span>
                    <span className={`text-2xl font-bold ${isTodayEvent ? 'text-white' : 'text-gray-900'}`}>
                      {new Date(eventDate || '').getDate()}
                    </span>
                  </div>

                  {/* Event Details */}
                  <div className="flex-1 min-w-0 pr-16">
                    <h4 className={`font-semibold text-base mb-2 ${isTodayEvent ? 'text-white' : 'text-gray-900'}`}>
                      {event.summary}
                    </h4>
                    
                    <div className="space-y-1.5">
                      {/* Relative Date */}
                      <div className={`text-sm flex items-center gap-1.5 ${isTodayEvent ? 'text-white/90' : 'text-gray-600'}`}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {getRelativeDate(eventDate)}
                      </div>

                      {/* Time */}
                      <div className={`text-sm flex items-center gap-1.5 ${isTodayEvent ? 'text-white/90' : 'text-gray-600'}`}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {event.start.dateTime ? formatTime(event.start.dateTime) : 'All day'}
                      </div>

                      {/* Location */}
                      {event.location && (
                        <div className={`text-sm flex items-center gap-1.5 truncate ${isTodayEvent ? 'text-white/90' : 'text-gray-500'}`}>
                          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="truncate">{event.location}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Arrow Icon */}
                  <div className={`flex-shrink-0 transition-all ${isTodayEvent ? 'text-white/60 group-hover:text-white' : 'text-gray-400 group-hover:text-[#2d7a4a]'} group-hover:translate-x-1`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* View All Button */}
      <a
        href="/calendar"
        className="block w-full mt-4 py-2.5 text-center text-sm text-[#2d7a4a] hover:bg-gray-50 rounded-lg transition-colors font-medium"
      >
        View All Events →
      </a>
    </div>
  );
}
