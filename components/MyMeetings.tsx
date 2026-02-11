'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Avatar from './Avatar';

interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime?: string;
    date?: string;
  };
  end?: {
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
  hangoutLink?: string;
  conferenceData?: {
    entryPoints?: Array<{
      uri?: string;
    }>;
  };
}

export default function MyMeetings() {
  const { data: session } = useSession();
  const [myMeetings, setMyMeetings] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

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
                onClick={() => {
                  setSelectedEvent(meeting);
                  setShowDetailModal(true);
                }}
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

      {/* Detail Modal */}
      {showDetailModal && selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={() => setShowDetailModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-1">{selectedEvent.summary}</h2>
                {selectedEvent.organizer && (
                  <p className="text-sm text-gray-600">
                    Organized by {selectedEvent.organizer.displayName || selectedEvent.organizer.email}
                  </p>
                )}
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-gray-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-140px)] px-6 py-4 space-y-6">
              {/* Date & Time */}
              <div className="flex items-start gap-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-600 mt-0.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <div className="text-base font-medium text-gray-900">
                    {new Date(selectedEvent.start.dateTime || selectedEvent.start.date || '').toLocaleDateString('id-ID', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {formatTime(selectedEvent.start.dateTime)} - {formatTime(selectedEvent.end?.dateTime)}
                  </div>
                </div>
              </div>

              {/* Location */}
              {selectedEvent.location && (
                <div className="flex items-start gap-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-600 mt-0.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                  <div className="text-base text-gray-900">{selectedEvent.location}</div>
                </div>
              )}

              {/* Google Meet Link */}
              {(selectedEvent.hangoutLink || selectedEvent.conferenceData?.entryPoints?.[0]?.uri) && (
                <div className="flex items-start gap-4">
                  <svg className="w-6 h-6 text-gray-600 mt-0.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M15 12c0 1.654-1.346 3-3 3s-3-1.346-3-3 1.346-3 3-3 3 1.346 3 3zm9-.449s-4.252 8.449-11.985 8.449c-7.18 0-12.015-8.449-12.015-8.449s4.446-7.551 12.015-7.551c7.694 0 11.985 7.551 11.985 7.551zm-7 .449c0-2.757-2.243-5-5-5s-5 2.243-5 5 2.243 5 5 5 5-2.243 5-5z"/>
                  </svg>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Video conference</div>
                    <a
                      href={selectedEvent.hangoutLink || selectedEvent.conferenceData?.entryPoints?.[0]?.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#2d7a4a] hover:text-[#245c3a] font-medium flex items-center gap-1"
                    >
                      Join with Google Meet
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                      </svg>
                    </a>
                  </div>
                </div>
              )}

              {/* Attendees */}
              {selectedEvent.attendees && selectedEvent.attendees.length > 0 && (
                <div className="flex items-start gap-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-600 mt-0.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                  </svg>
                  <div className="flex-1">
                    <div className="text-sm text-gray-600 mb-2">
                      {selectedEvent.attendees.length} guest{selectedEvent.attendees.length > 1 ? 's' : ''}
                    </div>
                    <div className="space-y-2">
                      {selectedEvent.attendees.map((attendee, idx) => {
                        const colors = [
                          'bg-blue-500',
                          'bg-green-500', 
                          'bg-purple-500',
                          'bg-pink-500',
                          'bg-orange-500',
                          'bg-red-500',
                          'bg-indigo-500',
                          'bg-teal-500'
                        ];
                        const colorClass = colors[idx % colors.length];
                        
                        return (
                        <div key={idx} className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full ${colorClass} flex items-center justify-center text-sm font-medium text-white`}>
                            {(attendee.displayName || attendee.email || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">
                              {attendee.displayName || attendee.email}
                            </div>
                            {attendee.email && attendee.displayName && (
                              <div className="text-xs text-gray-500">{attendee.email}</div>
                            )}
                          </div>
                          <div className={`text-xs px-2 py-1 rounded-full ${
                            attendee.responseStatus === 'accepted' ? 'bg-green-100 text-green-700' :
                            attendee.responseStatus === 'declined' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {attendee.responseStatus === 'accepted' ? '✓ Yes' :
                             attendee.responseStatus === 'declined' ? '✗ No' :
                             '? Maybe'}
                          </div>
                        </div>
                      );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Description */}
              {selectedEvent.description && (
                <div className="flex items-start gap-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-600 mt-0.5 flex-shrink-0">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                  </svg>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-gray-600 mb-1">Description</div>
                    <div className="text-base text-gray-900 whitespace-pre-wrap break-words overflow-wrap-anywhere">
                      {selectedEvent.description.replace(/<[^>]*>/g, '').substring(0, 500)}
                      {selectedEvent.description.length > 500 && '...'}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions - Only show for organizer */}
            {selectedEvent.organizer?.email === session?.user?.email && (
              <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 rounded-b-2xl">
                <button
                  onClick={() => {
                    const meetLink = selectedEvent.hangoutLink || selectedEvent.conferenceData?.entryPoints?.[0]?.uri;
                    if (meetLink) {
                      window.open(meetLink, '_blank');
                    } else {
                      alert('Tautan meeting tidak tersedia');
                    }
                  }}
                  className="w-full px-4 py-3 bg-[#2d7a4a] text-white rounded-lg font-medium hover:bg-[#235d3a] transition-colors flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                  </svg>
                  Mulai Meeting Sekarang
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
