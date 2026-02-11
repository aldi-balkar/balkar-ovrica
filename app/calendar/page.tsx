'use client';

import { useState, useEffect, useRef } from 'react';
import MainLayout from '@/components/MainLayout';
import { useSession } from 'next-auth/react';
import Avatar from '@/components/Avatar';

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
  attendees?: Array<{
    email: string;
    displayName?: string;
    responseStatus?: string;
  }>;
  hangoutLink?: string;
  conferenceData?: {
    entryPoints?: Array<{
      entryPointType: string;
      uri: string;
      label?: string;
    }>;
  };
  creator?: {
    email: string;
    displayName?: string;
  };
  organizer?: {
    email: string;
    displayName?: string;
  };
}

interface MeetingForm {
  summary: string;
  description: string;
  date: string;
  time: string;
  duration: string;
  location: string;
  guests: string[];
  addGoogleMeet: boolean;
}

interface GoogleContact {
  email: string;
  name?: string;
  photoUrl?: string;
}

export default function CalendarPage() {
  const { data: session } = useSession();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });
  const [filteredEvents, setFilteredEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [guestInput, setGuestInput] = useState('');
  const [guestSuggestions, setGuestSuggestions] = useState<GoogleContact[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const [formData, setFormData] = useState<MeetingForm>({
    summary: '',
    description: '',
    date: '',
    time: '',
    duration: '60',
    location: '',
    guests: [],
    addGoogleMeet: false,
  });

  // Fetch events from Google Calendar
  useEffect(() => {
    const fetchEvents = async () => {
      if (!session?.accessToken) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Get start and end of the current month
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59);

        const timeMin = startOfMonth.toISOString();
        const timeMax = endOfMonth.toISOString();

        const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime`;

        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${session.accessToken}`,
          },
        });
        
        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        const allEvents = data.items || [];
        setEvents(allEvents);
        
        // Filter to show only TODAY's events by default
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const todayEvents = allEvents.filter((event: CalendarEvent) => {
          const eventDate = new Date(event.start?.dateTime || event.start?.date || '');
          eventDate.setHours(0, 0, 0, 0);
          return eventDate.getTime() === today.getTime();
        });
        
        setFilteredEvents(todayEvents);
        setSelectedDate(today);
      } catch (error) {
        console.error('Error fetching calendar events:', error);
        setEvents([]);
        setFilteredEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [currentDate, session]);

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

  const isSelected = (day: number) => {
    if (!selectedDate || !(selectedDate instanceof Date)) return false;
    return day === selectedDate.getDate() && 
           currentDate.getMonth() === selectedDate.getMonth() && 
           currentDate.getFullYear() === selectedDate.getFullYear();
  };

  const handleDateClick = (day: number) => {
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(clickedDate);
    const eventsForDay = getEventsForDay(day);
    setFilteredEvents(eventsForDay.length > 0 ? eventsForDay : []);
  };

  const searchGoogleContacts = async (query: string) => {
    if (!session?.accessToken || query.length < 3) {
      setGuestSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setLoadingContacts(true);
    setShowSuggestions(true);
    
    try {
      const queryLower = query.toLowerCase();
      const allContacts: GoogleContact[] = [];
      
      // 1. Fetch saved contacts
      const connectionsResponse = await fetch(
        `https://people.googleapis.com/v1/people/me/connections?personFields=names,emailAddresses,photos&pageSize=100`,
        {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        }
      );

      if (connectionsResponse.ok) {
        const data = await connectionsResponse.json();
        (data.connections || []).forEach((person: any) => {
          const email = person.emailAddresses?.[0]?.value;
          const name = person.names?.[0]?.displayName;
          const photoUrl = person.photos?.[0]?.url;
          if (email && (name?.toLowerCase().includes(queryLower) || email.toLowerCase().includes(queryLower))) {
            allContacts.push({ email, name: name || email, photoUrl });
          }
        });
      }

      // Skip otherContacts and Directory API to avoid rate limits and permission errors
      // Most contacts are already in connections
      
      // Remove duplicates and limit results
      const uniqueContacts = Array.from(new Map(allContacts.map(c => [c.email, c])).values());
      setGuestSuggestions(uniqueContacts.slice(0, 10));
      
    } catch (error) {
      console.error('Error searching contacts:', error);
      setGuestSuggestions([]);
    } finally {
      setLoadingContacts(false);
    }
  };

  const handleGuestInputChange = (value: string) => {
    setGuestInput(value);
    
    // Clear previous timeout
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    
    if (value.trim().length >= 3) {
      setLoadingContacts(true);
      setShowSuggestions(true);
      
      // Debounce API call - wait 300ms after user stops typing
      debounceTimeout.current = setTimeout(() => {
        searchGoogleContacts(value);
      }, 300);
    } else {
      setGuestSuggestions([]);
      setShowSuggestions(false);
      setLoadingContacts(false);
    }
  };

  const handleGuestKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && guestInput.trim()) {
      e.preventDefault();
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailRegex.test(guestInput.trim())) {
        addGuest(guestInput.trim());
      } else {
        // Show message in dropdown
        setShowSuggestions(true);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const addGuest = (email: string) => {
    if (!formData.guests.includes(email)) {
      setFormData({ ...formData, guests: [...formData.guests, email] });
    }
    setGuestInput('');
    setGuestSuggestions([]);
    setShowSuggestions(false);
  };

  const removeGuest = (email: string) => {
    setFormData({
      ...formData,
      guests: formData.guests.filter(g => g !== email),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session) {
      alert('⚠️ Silakan login terlebih dahulu untuk menambah meeting');
      return;
    }

    // Validate required fields with specific messages
    if (!formData.summary) {
      alert('⚠️ Judul meeting harus diisi!');
      return;
    }
    if (!formData.date) {
      alert('⚠️ Tanggal meeting harus dipilih!');
      return;
    }
    if (!formData.time) {
      alert('⚠️ Waktu meeting harus dipilih!');
      return;
    }

    setSubmitting(true);

    try {
      if (!session?.accessToken) {
        alert('❌ Session expired. Silakan login ulang.');
        return;
      }

      // Calculate end time
      const startDateTime = new Date(`${formData.date}T${formData.time}`);
      const endDateTime = new Date(startDateTime.getTime() + parseInt(formData.duration) * 60000);

      const response = await fetch('/api/calendar/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify({
          summary: formData.summary,
          description: formData.description,
          startDateTime: startDateTime.toISOString(),
          endDateTime: endDateTime.toISOString(),
          location: formData.location,
          attendees: formData.guests.map(email => ({ email })),
          addGoogleMeet: formData.addGoogleMeet,
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
        guests: [],
        addGoogleMeet: false,
      });
      setGuestInput('');
      setGuestSuggestions([]);
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

      // Show success notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-[#2d7a4a] text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 animate-slide-in z-50';
      notification.innerHTML = `
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        <div>
          <div class="font-semibold">Meeting berhasil dibuat!</div>
          <div class="text-sm opacity-90">Email undangan telah dikirim ke peserta</div>
        </div>
      `;
      document.body.appendChild(notification);
      setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
      }, 4000);
    } catch (error) {
      console.error('Error creating event:', error);
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-red-600 text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 animate-slide-in z-50';
      notification.innerHTML = `
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
        <div>
          <div class="font-semibold">Gagal membuat meeting</div>
          <div class="text-sm opacity-90">Silakan coba lagi</div>
        </div>
      `;
      document.body.appendChild(notification);
      setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
      }, 4000);
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
                const isTodayDay = isToday(day as number);
                const isSelectedDay = isSelected(day as number);
                return (
                <div
                  key={dayKey}
                  onClick={() => day && handleDateClick(day as number)}
                  className={`
                    aspect-square flex items-center justify-center rounded-lg text-xs sm:text-sm font-medium
                    ${day === null ? 'invisible' : ''}
                    ${isTodayDay ? 'bg-[#2d7a4a] text-white' : 'text-gray-700 hover:bg-gray-100'}
                    ${isSelectedDay && !isTodayDay ? 'ring-2 ring-[#2d7a4a]' : ''}
                    transition-all cursor-pointer relative
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
                <span className="text-orange-600 text-lg">•</span>
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
                  className="w-full sm:w-auto px-4 py-2 bg-[#2d7a4a] text-white rounded-lg text-sm font-medium hover:bg-[#235d3a] transition-all whitespace-nowrap text-center"
                >
                  + Tambah Jadwal Meeting
                </button>
              ) : (
                <div className="relative group w-full sm:w-auto">
                  <button
                    disabled
                    className="w-full sm:w-auto px-4 py-2 bg-gray-300 text-gray-500 rounded-lg text-sm font-medium cursor-not-allowed whitespace-nowrap text-center"
                  >
                    + Tambah Jadwal Meeting
                  </button>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                    Login terlebih dahulu untuk menambah meeting
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-800"></div>
                  </div>
                </div>
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
              <div className="space-y-3 transition-all duration-500 ease-in-out">
                {filteredEvents.length === 0 ? (
                  <div className="text-center py-8 animate-fade-in">
                    <p className="text-gray-500 mb-3">
                      {selectedDate 
                        ? `Tidak ada meeting pada tanggal ${selectedDate} ${monthNames[currentDate.getMonth()]}`
                        : 'Tidak ada meeting yang dijadwalkan'
                      }
                    </p>
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
                  filteredEvents.map((event, idx) => (
                    <div
                      key={event.id}
                      style={{ animationDelay: `${idx * 100}ms` }}
                      onClick={() => {
                        setSelectedEvent(event);
                        setShowDetailModal(true);
                      }}
                      className="p-4 bg-gray-50 border border-gray-200 rounded-xl hover:border-[#2d7a4a] transition-all animate-slide-in cursor-pointer"
                    >
                      <h4 className="font-semibold text-gray-900 mb-1">{event.summary}</h4>
                      {event.description && (
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {event.description.replace(/<[^>]*>/g, '').substring(0, 100)}
                          {event.description.replace(/<[^>]*>/g, '').length > 100 ? '...' : ''}
                        </p>
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
                            {new Date(event.start.dateTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false }).replace(':', '.')}
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

      {/* Modal Detail Meeting */}
      {showDetailModal && selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={() => setShowDetailModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-[#2d7a4a] rounded"></div>
                <h2 className="text-xl font-semibold text-gray-900">{selectedEvent.summary}</h2>
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
            <div className="px-6 py-4 space-y-4">
              {/* Date & Time */}
              <div className="flex items-start gap-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-600 mt-0.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1">
                  <p className="text-gray-900 font-medium">
                    {selectedEvent.start.dateTime && selectedEvent.end.dateTime ? (
                      <>
                        {new Date(selectedEvent.start.dateTime).toLocaleDateString('id-ID', { 
                          weekday: 'long', 
                          day: 'numeric', 
                          month: 'long', 
                          year: 'numeric' 
                        })} • {new Date(selectedEvent.start.dateTime).toLocaleTimeString('id-ID', { 
                          hour: '2-digit', 
                          minute: '2-digit',
                          hour12: false 
                        }).replace(':', '.')} – {new Date(selectedEvent.end.dateTime).toLocaleTimeString('id-ID', { 
                          hour: '2-digit', 
                          minute: '2-digit',
                          hour12: false 
                        }).replace(':', '.')}
                      </>
                    ) : (
                      new Date(selectedEvent.start.date || '').toLocaleDateString('id-ID', { 
                        weekday: 'long', 
                        day: 'numeric', 
                        month: 'long', 
                        year: 'numeric' 
                      })
                    )}
                  </p>
                  {selectedEvent.start.dateTime && (
                    <p className="text-sm text-gray-500 mt-1">
                      Weekly on {new Date(selectedEvent.start.dateTime).toLocaleDateString('en-US', { weekday: 'long' })}
                    </p>
                  )}
                </div>
              </div>

              {/* Google Meet Link */}
              {selectedEvent.hangoutLink && (
                <div className="flex items-start gap-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-[#2d7a4a] mt-0.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                  </svg>
                  <div className="flex-1">
                    <a
                      href={selectedEvent.hangoutLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-[#2d7a4a] text-white rounded-lg font-medium hover:bg-[#235d3a] transition-colors"
                    >
                      Buka Google Meet
                    </a>
                    <p className="text-sm text-gray-600 mt-2 break-all">{selectedEvent.hangoutLink}</p>
                  </div>
                </div>
              )}

              {/* Phone Join */}
              {selectedEvent.conferenceData?.entryPoints?.find(e => e.entryPointType === 'phone') && (
                <div className="flex items-start gap-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-[#2d7a4a] mt-0.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                  </svg>
                  <div className="flex-1">
                    <button className="text-[#2d7a4a] hover:underline font-medium">Hubungi via Telepon</button>
                    {selectedEvent.conferenceData.entryPoints.filter(e => e.entryPointType === 'phone').map((entry, idx) => (
                      <p key={idx} className="text-sm text-gray-600 mt-1">{entry.label || entry.uri}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              {selectedEvent.description && (
                <div className="flex items-start gap-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                  <div className="flex-1 min-w-0">
                    <div 
                      className="text-sm text-gray-700 prose prose-sm max-w-none break-words overflow-wrap-anywhere"
                      dangerouslySetInnerHTML={{ __html: selectedEvent.description }}
                    />
                  </div>
                </div>
              )}

              {/* Location */}
              {selectedEvent.location && (
                <div className="flex items-start gap-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-600 mt-0.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-gray-900">{selectedEvent.location}</p>
                  </div>
                </div>
              )}

              {/* Guests */}
              {selectedEvent.attendees && selectedEvent.attendees.length > 0 && (
                <div className="flex items-start gap-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-600 mt-0.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-gray-900 font-medium mb-2">
                      {selectedEvent.attendees.length} guests
                    </p>
                    <div className="space-y-2">
                      {selectedEvent.attendees.filter(a => a.responseStatus === 'accepted').length > 0 && (
                        <div>
                          <p className="text-sm text-green-600 font-medium mb-1">
                            {selectedEvent.attendees.filter(a => a.responseStatus === 'accepted').length} yes
                          </p>
                        </div>
                      )}
                      {selectedEvent.attendees.filter(a => a.responseStatus === 'needsAction').length > 0 && (
                        <div>
                          <p className="text-sm text-gray-500 font-medium mb-1">
                            {selectedEvent.attendees.filter(a => a.responseStatus === 'needsAction').length} awaiting
                          </p>
                        </div>
                      )}
                      <div className="max-h-32 overflow-y-auto space-y-1">
                        {selectedEvent.attendees.map((attendee, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm">
                            <Avatar 
                              name={attendee.displayName || attendee.email || 'Guest'} 
                              size={24}
                              className="flex-shrink-0"
                            />
                            <span className="text-gray-700">
                              {attendee.displayName || attendee.email}
                            </span>
                            {attendee.responseStatus === 'accepted' && (
                              <span className="text-green-600 text-xs">✓</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Organizer */}
              {selectedEvent.organizer && (
                <div className="flex items-start gap-4 pt-4 border-t border-gray-200">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-600 mt-0.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Organized by</p>
                    <p className="text-gray-900">{selectedEvent.organizer.displayName || selectedEvent.organizer.email}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions - Only show for organizer */}
            {selectedEvent.organizer?.email === session?.user?.email && (
              <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 rounded-b-2xl">
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      // Store meeting data in localStorage for notulen page
                      localStorage.setItem(`meeting_${selectedEvent.id}`, JSON.stringify(selectedEvent));
                      window.location.href = `/notulen?meetingId=${selectedEvent.id}`;
                    }}
                    className="flex-1 px-4 py-3 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                    </svg>
                    Buat Notulen
                  </button>
                  <button
                    onClick={() => {
                      if (selectedEvent.hangoutLink) {
                        window.open(selectedEvent.hangoutLink, '_blank');
                      } else {
                        alert('Tautan meeting tidak tersedia');
                      }
                    }}
                    className="flex-1 px-4 py-3 bg-[#2d7a4a] text-white rounded-lg font-medium hover:bg-[#235d3a] transition-colors flex items-center justify-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                    </svg>
                    Mulai Meeting
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Tambah Jadwal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-2xl max-h-[92vh] sm:max-h-[90vh] overflow-hidden shadow-2xl animate-scale-in">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
              <input
                type="text"
                value={formData.summary}
                onChange={(e) => setFormData({...formData, summary: e.target.value})}
                className="text-lg sm:text-2xl font-normal text-gray-900 outline-none w-full"
                placeholder="Add title"
                required
              />
              <button
                onClick={() => {
                  setShowModal(false);
                  setFormData({
                    summary: '',
                    description: '',
                    date: '',
                    time: '',
                    duration: '60',
                    location: '',
                    guests: [],
                    addGoogleMeet: false,
                  });
                  setGuestInput('');
                  setGuestSuggestions([]);
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors ml-4"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-gray-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <form onSubmit={handleSubmit} className="overflow-y-auto" style={{maxHeight: 'calc(92vh - 140px)'}}>
              <div className="px-4 py-4 space-y-4">
                {/* Date & Time */}
                <div className="flex items-start gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-600 mt-2.5 flex-shrink-0">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="flex-1 space-y-2">
                    <div className="grid grid-cols-1 gap-2">
                      <input
                        type="date"
                        required
                        value={formData.date}
                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                        className="px-3 py-2.5 border border-gray-300 rounded-lg text-base text-gray-900 focus:border-[#2d7a4a] focus:ring-2 focus:ring-[#2d7a4a]/20 outline-none"
                      />
                      <div className="flex gap-2">
                        <input
                          type="time"
                          required
                          value={formData.time}
                          onChange={(e) => setFormData({...formData, time: e.target.value})}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:border-[#2d7a4a] focus:ring-2 focus:ring-[#2d7a4a]/20 outline-none"
                        />
                        <select
                          value={formData.duration}
                          onChange={(e) => setFormData({...formData, duration: e.target.value})}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:border-[#2d7a4a] focus:ring-2 focus:ring-[#2d7a4a]/20 outline-none"
                        >
                          <option value="30">30m</option>
                          <option value="60">1h</option>
                          <option value="90">1.5h</option>
                          <option value="120">2h</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Add Guests */}
                <div className="flex items-start gap-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-600 mt-2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                  </svg>
                  <div className="flex-1">
                    <div className="relative">
                      <input
                        type="text"
                        value={guestInput}
                        onChange={(e) => handleGuestInputChange(e.target.value)}
                        onKeyPress={handleGuestKeyPress}
                        onFocus={() => guestInput.length >= 3 && setShowSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:border-[#2d7a4a] focus:ring-2 focus:ring-[#2d7a4a]/20 outline-none"
                        placeholder="Ketik minimal 3 huruf untuk mencari..."
                      />
                      {loadingContacts && (
                        <div className="absolute right-3 top-2.5">
                          <div className="w-5 h-5 border-2 border-gray-300 border-t-[#2d7a4a] rounded-full animate-spin"></div>
                        </div>
                      )}
                      
                      {/* Dropdown Suggestions */}
                      {showSuggestions && guestInput.length >= 3 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-xl max-h-80 overflow-y-auto">
                          {loadingContacts ? (
                            <div className="px-4 py-3 text-sm text-gray-500 text-center">
                              Mencari kontak...
                            </div>
                          ) : guestSuggestions.length > 0 ? (
                            <div className="py-2">
                              {guestSuggestions.map((contact, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => addGuest(contact.email)}
                                  className="w-full px-4 py-3 text-left hover:bg-gray-100 flex items-center gap-3 transition-colors"
                                >
                                  {contact.photoUrl ? (
                                    <img 
                                      src={contact.photoUrl} 
                                      alt={contact.name || contact.email}
                                      referrerPolicy="no-referrer"
                                      className="w-8 h-8 rounded-full object-cover flex-shrink-0 border border-gray-200"
                                    />
                                  ) : (
                                    <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center text-sm font-medium text-white flex-shrink-0">
                                      {(contact.name || contact.email).charAt(0).toUpperCase()}
                                    </div>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium text-gray-900 truncate">
                                      {contact.name || contact.email}
                                    </div>
                                    <div className="text-sm text-gray-600 truncate">
                                      {contact.email}
                                    </div>
                                  </div>
                                </button>
                              ))}
                            </div>
                          ) : (
                            <div className="px-4 py-6 text-center">
                              <div className="text-sm text-gray-600 mb-3">
                                Tidak ada kontak yang cocok dengan "{guestInput}"
                              </div>
                              <div className="text-xs text-gray-500 mb-3">
                                Atau ketik email lengkap lalu tekan Enter
                              </div>
                              <div className="text-xs text-gray-400">
                                Contoh: {guestInput}@gmail.com
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    {/* Guest List */}
                    {formData.guests.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {formData.guests.map((guest, idx) => (
                          <div key={idx} className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                            <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-xs font-medium text-gray-700">
                              {guest.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm text-gray-900 flex-1">{guest}</span>
                            <button
                              type="button"
                              onClick={() => removeGuest(guest)}
                              className="text-gray-400 hover:text-red-600 transition-colors"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Add Google Meet */}
                <div className="flex items-center gap-4">
                  <svg viewBox="0 0 24 24" className="w-5 h-5">
                    <path fill="#00832d" d="M18.5 2h-13C4.122 2 3 3.122 3 4.5v15C3 20.878 4.122 22 5.5 22h13c1.378 0 2.5-1.122 2.5-2.5v-15C21 3.122 19.878 2 18.5 2z"/>
                    <path fill="#fff" d="M7 14.5v-5l4.5 2.5L7 14.5zm8.5-2.5L11 14.5v-5l4.5 2.5z"/>
                  </svg>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, addGoogleMeet: !formData.addGoogleMeet})}
                    className="flex-1 text-left text-[#2d7a4a] hover:underline font-medium"
                  >
                    {formData.addGoogleMeet ? 'Google Meet added' : 'Add Google Meet video conferencing'}
                  </button>
                </div>

                {/* Location */}
                <div className="flex items-start gap-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-600 mt-2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:border-[#2d7a4a] focus:ring-2 focus:ring-[#2d7a4a]/20 outline-none"
                    placeholder="Add location or room"
                  />
                </div>

                {/* Description */}
                <div className="flex items-start gap-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-600 mt-2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                  </svg>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:border-[#2d7a4a] focus:ring-2 focus:ring-[#2d7a4a]/20 outline-none resize-none"
                    placeholder="Add description or attachments"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full px-6 py-3 bg-[#2d7a4a] text-white rounded-lg font-medium hover:bg-[#235d3a] transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-base"
                >
                  {submitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
