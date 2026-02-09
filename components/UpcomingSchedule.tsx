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
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Upcoming Schedule</h3>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-200 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Upcoming Schedule</h3>
        <div className="text-center py-8">
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
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 mb-4">
          <div className="text-center mb-4">
            <div className="text-6xl font-bold text-[#2d7a4a]">
              {new Date().getDate()}
            </div>
            <div className="text-lg text-gray-600 font-medium">
              {new Date().toLocaleDateString('id-ID', { weekday: 'long' })}
            </div>
            <div className="text-sm text-gray-500">
              {new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
            </div>
          </div>
        </div>

        {/* Empty State */}
        <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl">
          <div className="text-5xl mb-3">📅</div>
          <p className="text-gray-900 font-semibold mb-1">No Upcoming Events</p>
          <p className="text-sm text-gray-500">Your schedule is clear for now</p>
          <button className="mt-4 px-4 py-2 bg-[#2d7a4a] text-white rounded-lg text-sm font-medium hover:bg-opacity-90 transition-all">
            + Add New Event
          </button>
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
        {events.map((event) => (
          <div
            key={event.id}
            className="flex items-start gap-4 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all duration-300 cursor-pointer group"
          >
            {/* Date Badge */}
            <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-[#2d7a4a] to-[#4ade80] rounded-xl flex flex-col items-center justify-center text-white shadow-md">
              <span className="text-2xl font-bold">
                {new Date(event.start.dateTime || event.start.date || '').getDate()}
              </span>
              <span className="text-xs uppercase">
                {new Date(event.start.dateTime || event.start.date || '').toLocaleDateString('id-ID', { month: 'short' })}
              </span>
            </div>

            {/* Event Details */}
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900 group-hover:text-[#2d7a4a] transition-colors truncate">
                {event.summary}
              </h4>
              <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                <span>🕐</span>
                <span>
                  {event.start.dateTime ? formatTime(event.start.dateTime) : 'All day'}
                </span>
              </div>
              {event.location && (
                <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                  <span>📍</span>
                  <span className="truncate">{event.location}</span>
                </div>
              )}
            </div>

            {/* Arrow Icon */}
            <div className="flex-shrink-0 text-gray-400 group-hover:text-[#2d7a4a] group-hover:translate-x-1 transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        ))}
      </div>

      {/* View All Button */}
      <button className="w-full mt-4 py-2 text-sm text-[#2d7a4a] hover:bg-gray-50 rounded-lg transition-colors font-medium">
        View All Events →
      </button>
    </div>
  );
}
