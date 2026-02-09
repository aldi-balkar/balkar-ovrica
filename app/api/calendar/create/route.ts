import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const accessToken = (session as any).accessToken;

    if (!accessToken) {
      return NextResponse.json({ error: 'No access token' }, { status: 401 });
    }

    const body = await request.json();
    const { summary, description, startDateTime, endDateTime, location } = body;

    // Validate required fields
    if (!summary || !startDateTime || !endDateTime) {
      return NextResponse.json(
        { error: 'Missing required fields: summary, startDateTime, endDateTime' },
        { status: 400 }
      );
    }

    // Create event in Google Calendar
    const calendarId = process.env.NEXT_PUBLIC_GOOGLE_CALENDAR_ID;
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId || 'primary')}/events`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          summary,
          description,
          location,
          start: {
            dateTime: startDateTime,
            timeZone: 'Asia/Jakarta',
          },
          end: {
            dateTime: endDateTime,
            timeZone: 'Asia/Jakarta',
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error('Google Calendar API Error:', error);
      return NextResponse.json({ error: 'Failed to create event' }, { status: response.status });
    }

    const event = await response.json();
    return NextResponse.json(event);
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
