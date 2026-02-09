'use client';

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
  description?: string;
  location?: string;
}

export async function getUpcomingEvents(maxResults: number = 10): Promise<CalendarEvent[]> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
    const calendarId = process.env.NEXT_PUBLIC_GOOGLE_CALENDAR_ID || 'primary';

    if (!apiKey) {
      console.warn('Google API Key not configured');
      return [];
    }

    const now = new Date().toISOString();
    const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?key=${apiKey}&timeMin=${now}&maxResults=${maxResults}&singleEvents=true&orderBy=startTime`;

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Google Calendar API error: ${response.status}`);
    }

    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error('Error fetching Google Calendar events:', error);
    return [];
  }
}

export function formatEventDate(event: CalendarEvent): string {
  const startDate = event.start.dateTime || event.start.date;
  if (!startDate) return 'No date';

  const date = new Date(startDate);
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  };

  return date.toLocaleDateString('en-US', options);
}

export function formatEventTime(event: CalendarEvent): string {
  const startDate = event.start.dateTime;
  if (!startDate) return 'All day';

  const date = new Date(startDate);
  const options: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  };

  return date.toLocaleTimeString('en-US', options);
}

export function isToday(event: CalendarEvent): boolean {
  const startDate = event.start.dateTime || event.start.date;
  if (!startDate) return false;

  const eventDate = new Date(startDate);
  const today = new Date();

  return (
    eventDate.getDate() === today.getDate() &&
    eventDate.getMonth() === today.getMonth() &&
    eventDate.getFullYear() === today.getFullYear()
  );
}
