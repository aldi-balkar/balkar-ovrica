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
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Upcoming Schedule</h3>
        <div className="text-center py-8 text-gray-400">
          <p>📅 No upcoming events</p>
          <p className="text-sm mt-2">Your calendar is clear!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Upcoming Schedule</h3>
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
