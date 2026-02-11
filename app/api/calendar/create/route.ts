import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const accessToken = (session as any).accessToken;

    if (!accessToken) {
      return NextResponse.json({ error: 'No access token' }, { status: 401 });
    }

    const body = await request.json();
    const { summary, description, startDateTime, endDateTime, location, attendees, addGoogleMeet } = body;

    // Validate required fields
    if (!summary || !startDateTime || !endDateTime) {
      return NextResponse.json(
        { error: 'Missing required fields: summary, startDateTime, endDateTime' },
        { status: 400 }
      );
    }

    const eventData: any = {
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
    };

    // Add attendees if provided
    if (attendees && attendees.length > 0) {
      eventData.attendees = attendees;
    }

    // Add Google Meet conference if requested
    if (addGoogleMeet) {
      eventData.conferenceData = {
        createRequest: {
          requestId: `meet-${Date.now()}`,
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      };
    }

    // Create event in Google Calendar - using primary (user's own calendar)
    // Add sendUpdates=all to send email notifications to attendees
    const queryParams = new URLSearchParams();
    if (addGoogleMeet) {
      queryParams.append('conferenceDataVersion', '1');
    }
    if (attendees && attendees.length > 0) {
      queryParams.append('sendUpdates', 'all'); // Send email to all attendees
    }
    
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events${queryParams.toString() ? '?' + queryParams.toString() : ''}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
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
