'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Avatar from './Avatar';

interface CalendarEvent {
  id: string;
  summary: string;
  start: {
    dateTime?: string;
    date?: string;
  };
  location?: string;
  organizer?: {
    email?: string;
    displayName?: string;
  };
  attendees?: Array<{
    email?: string;
    displayName?: string;
    responseStatus?: string;
  }>;
}

export default function MyMeetings() {
  const { data: session } = useSession();
  const [myMeetings, setMyMeetings] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.accessToken) {
      fetchMyMeetings();
    } else {
      setLoading(false);
    }
  }, [session]);

  const fetchMyMeetings = async () => {
    try {
      if (!session?.accessToken) return;

      const timeMin = new Date().toISOString();
      const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin}&maxResults=10&singleEvents=true&orderBy=startTime`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
        },
      });

      const data = await response.json();
      
      // Filter hanya meeting yang user jadi organizer/PIC
      const userEmail = session?.user?.email;
      const filteredMeetings = (data.items || []).filter((event: CalendarEvent) => 
        event.organizer?.email === userEmail
      );

      setMyMeetings(filteredMeetings.slice(0, 5)); // Max 5 meetings
    } catch (error) {
      console.error('Error fetching my meetings:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hari Ini';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Besok';
    } else {
      return date.toLocaleDateString('id-ID', { 
        weekday: 'short', 
        day: 'numeric', 
        month: 'short' 
      });
    }
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return 'All day';
    const date = new Date(dateString);
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getAttendeeCount = (event: CalendarEvent) => {
    return event.attendees?.length || 0;
  };

  const getConfirmedCount = (event: CalendarEvent) => {
    return event.attendees?.filter(a => a.responseStatus === 'accepted').length || 0;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        <div className="text-center py-8">
          <div className="text-5xl mb-4">🔒</div>
          <p className="text-gray-600 mb-4">Login untuk melihat meeting kamu</p>
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

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2d7a4a] to-[#1a4d2e] flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">My Meetings</h2>
            <p className="text-xs text-gray-500">Meeting yang kamu organize</p>
          </div>
        </div>
        <Link 
          href="/calendar" 
          className="text-sm text-[#2d7a4a] hover:text-[#245c3a] font-medium"
        >
          View All
        </Link>
      </div>

      {/* Meetings List */}
      {myMeetings.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-5xl mb-4">📭</div>
          <p className="text-gray-600 mb-4">Kamu belum punya meeting sebagai organizer</p>
          <Link
            href="/calendar"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#FF6436] text-white rounded-xl hover:bg-[#e55a30] transition-colors font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Buat Meeting Baru
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {myMeetings.map((meeting) => {
            const attendeeCount = getAttendeeCount(meeting);
            const confirmedCount = getConfirmedCount(meeting);
            
            return (
              <div
                key={meeting.id}
                className="group p-4 rounded-xl border-2 border-gray-200 hover:border-[#2d7a4a] hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  {/* Date Badge */}
                  <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br from-[#2d7a4a] to-[#1a4d2e] flex flex-col items-center justify-center text-white">
                    <div className="text-xs font-medium">
                      {new Date(meeting.start.dateTime || meeting.start.date || '').toLocaleDateString('id-ID', { month: 'short' })}
                    </div>
                    <div className="text-2xl font-bold">
                      {new Date(meeting.start.dateTime || meeting.start.date || '').getDate()}
                    </div>
                  </div>

                  {/* Meeting Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-gray-900 mb-2 group-hover:text-[#2d7a4a] transition-colors">
                      {meeting.summary}
                    </h3>
                    
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      {/* Date & Time */}
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-medium">{formatDate(meeting.start.dateTime || meeting.start.date)}</span>
                        <span className="text-gray-400">•</span>
                        <span>{formatTime(meeting.start.dateTime)}</span>
                      </div>

                      {/* Location */}
                      {meeting.location && (
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="truncate max-w-[150px]">{meeting.location}</span>
                        </div>
                      )}

                      {/* Attendees */}
                      {attendeeCount > 0 && (
                        <div className="flex items-center gap-1.5">
                          <div className="flex -space-x-2">
                            {meeting.attendees?.slice(0, 3).map((attendee, idx) => (
                              <Avatar 
                                key={idx}
                                name={attendee.displayName || attendee.email || 'User'} 
                                size={24}
                                className="border-2 border-white"
                              />
                            ))}
                          </div>
                          <span className="text-xs text-gray-600 font-medium">
                            {confirmedCount}/{attendeeCount} confirmed
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Organizer
                    </span>
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
