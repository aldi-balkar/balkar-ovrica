'use client';

import { useState, useEffect, useRef } from 'react';
import MainLayout from '@/components/MainLayout';
import { useLocalStorage, formatDate } from '@/lib/utils';
import { Notulen } from '@/types';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Avatar from '@/components/Avatar';

interface MeetingAttendee {
  email: string;
  displayName?: string;
  photoUrl?: string;
  responseStatus?: string;
}

interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
  location?: string;
  attendees?: MeetingAttendee[];
  hangoutLink?: string;
  organizer?: { email: string; displayName?: string };
}

interface Attendee {
  email: string;
  name: string;
  status: 'Hadir' | 'Telat' | 'Izin';
  notes: string;
  photoUrl?: string;
}

interface ActionItem {
  action: string;
  pic: string;
  deadline: string;
  status: 'Open' | 'In Progress' | 'Done';
}

export default function NotulenPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [notulens, setNotulens] = useLocalStorage<Notulen[]>('notulens', []);
  const [selectedNotulen, setSelectedNotulen] = useState<Notulen | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [meetingData, setMeetingData] = useState<CalendarEvent | null>(null);
  const [availableAttendees, setAvailableAttendees] = useState<MeetingAttendee[]>([]);
  const [showAttendeeDropdown, setShowAttendeeDropdown] = useState(false);
  const [attendeeSearchQuery, setAttendeeSearchQuery] = useState('');
  const [openStatusDropdown, setOpenStatusDropdown] = useState<number | null>(null);
  const [showPicDropdown, setShowPicDropdown] = useState(false);
  const [picSearchQuery, setPicSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const statusDropdownRef = useRef<HTMLDivElement>(null);
  const picDropdownRef = useRef<HTMLDivElement>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    timeStart: '',
    timeEnd: '',
    location: '',
    pic: '',
  });
  
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  
  const [agendas, setAgendas] = useState<string[]>([]);
  const [newAgenda, setNewAgenda] = useState('');
  
  const [discussion, setDiscussion] = useState('');
  const [decisions, setDecisions] = useState('');
  
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [newAction, setNewAction] = useState({ action: '', pic: '', deadline: '', status: 'Open' as 'Open' | 'In Progress' | 'Done' });
  
  const [conclusion, setConclusion] = useState('');

  // Load meeting data from URL params or localStorage
  useEffect(() => {
    const meetingId = searchParams.get('meetingId');
    if (meetingId) {
      const storedMeeting = localStorage.getItem(`meeting_${meetingId}`);
      if (storedMeeting) {
        const meeting: CalendarEvent = JSON.parse(storedMeeting);
        setMeetingData(meeting);
        
        // Auto-populate form
        setFormData({
          title: meeting.summary || '',
          date: meeting.start.dateTime ? new Date(meeting.start.dateTime).toISOString().split('T')[0] : '',
          timeStart: meeting.start.dateTime ? new Date(meeting.start.dateTime).toTimeString().slice(0, 5) : '',
          timeEnd: meeting.end.dateTime ? new Date(meeting.end.dateTime).toTimeString().slice(0, 5) : '',
          location: meeting.location || meeting.hangoutLink || '',
          pic: meeting.organizer?.displayName || meeting.organizer?.email || '',
        });
        
        // Set available attendees
        if (meeting.attendees && meeting.attendees.length > 0) {
          setAvailableAttendees(meeting.attendees);
        }
        
        setShowForm(true);
      }
    }
  }, [searchParams]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowAttendeeDropdown(false);
      }
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
        setOpenStatusDropdown(null);
      }
      if (picDropdownRef.current && !picDropdownRef.current.contains(event.target as Node)) {
        setShowPicDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Redirect if not logged in
  if (!session) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-gray-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Login Required</h2>
            <p className="text-gray-600 mb-6">Silakan login terlebih dahulu untuk mengakses Meeting Notes</p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-[#2d7a4a] text-white rounded-lg font-medium hover:bg-[#235d3a] transition-colors"
            >
              Go to Homepage
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newNotulen: Notulen = {
      id: Date.now(),
      title: formData.title,
      date: formData.date,
      time: `${formData.timeStart} - ${formData.timeEnd}`,
      place: formData.location,
      agenda: agendas.join('\n'),
      content: discussion,
      conclusion: conclusion,
    };
    setNotulens([...notulens, newNotulen]);
    resetForm();
    setShowForm(false);
  };

  const addAttendeeFromDropdown = (attendee: MeetingAttendee) => {
    const exists = attendees.find(a => a.email === attendee.email);
    if (!exists) {
      setAttendees([...attendees, {
        email: attendee.email,
        name: attendee.displayName || attendee.email,
        status: 'Hadir',
        notes: '',
        photoUrl: attendee.photoUrl
      }]);
    }
    setAttendeeSearchQuery('');
    setShowAttendeeDropdown(false);
  };

  const generateAllAttendees = () => {
    const newAttendees = availableAttendees
      .filter(att => !attendees.find(a => a.email === att.email))
      .map(att => ({
        email: att.email,
        name: att.displayName || att.email,
        status: 'Hadir' as 'Hadir' | 'Telat' | 'Izin',
        notes: '',
        photoUrl: att.photoUrl
      }));
    setAttendees([...attendees, ...newAttendees]);
  };

  const resetForm = () => {
    setFormData({ title: '', date: '', timeStart: '', timeEnd: '', location: '', pic: '' });
    setAttendees([]);
    setAgendas([]);
    setDiscussion('');
    setDecisions('');
    setActionItems([]);
    setConclusion('');
  };

  const handleDelete = (id: number) => {
    if (confirm('Yakin ingin menghapus notulen ini?')) {
      setNotulens(notulens.filter((n) => n.id !== id));
      if (selectedNotulen?.id === id) {
        setSelectedNotulen(null);
      }
    }
  };

  const removeAttendee = (index: number) => {
    setAttendees(attendees.filter((_, i) => i !== index));
  };

  const addAgenda = () => {
    if (newAgenda.trim()) {
      setAgendas([...agendas, newAgenda]);
      setNewAgenda('');
    }
  };

  const removeAgenda = (index: number) => {
    setAgendas(agendas.filter((_, i) => i !== index));
  };

  const addActionItem = () => {
    if (newAction.action.trim() && newAction.pic.trim()) {
      setActionItems([...actionItems, newAction]);
      setNewAction({ action: '', pic: '', deadline: '', status: 'Open' });
    }
  };

  const removeActionItem = (index: number) => {
    setActionItems(actionItems.filter((_, i) => i !== index));
  };

  return (
    <MainLayout>
      <div className="flex h-[calc(100vh-8rem)] -mx-4 sm:-mx-6">
        {/* Sidebar - Workspace & List */}
        <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col">
          {/* Workspace Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-gray-900 truncate">{session.user?.name || 'User'}&apos;s Workspace</h3>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="p-3 border-b border-gray-200">
            <button 
              onClick={() => setShowForm(!showForm)}
              className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-200 rounded flex items-center gap-2 font-medium"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              New
            </button>
          </div>

          {/* Meetings List */}
          <div className="flex-1 overflow-y-auto p-3">
            <div className="space-y-1">
              {notulens.length === 0 ? (
                <div className="px-3 py-6 text-center text-xs text-gray-400">
                  No meetings yet
                </div>
              ) : (
                notulens.map((notulen) => (
                  <button
                    key={notulen.id}
                    onClick={() => handleView(notulen)}
                    className={`w-full px-3 py-2 text-left text-sm rounded hover:bg-gray-200 transition-colors flex items-start gap-2 ${
                      selectedNotulen?.id === notulen.id ? 'bg-gray-200' : ''
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                    <span className="text-gray-900 truncate flex-1">{notulen.title}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 bg-white overflow-y-auto">
          {showForm ? (
            <div className="max-w-5xl mx-auto p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Buat Notulen Meeting</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* 1. Informasi Meeting */}
                <div className="bg-gray-50 rounded-lg p-5">
                  <h3 className="text-base font-semibold text-gray-900 mb-4">Informasi Meeting</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Judul Meeting</label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Contoh: Weekly Team Sync"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-[#2d7a4a] focus:border-[#2d7a4a] outline-none"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Tanggal</label>
                        <input
                          type="date"
                          value={formData.date}
                          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-[#2d7a4a] focus:border-[#2d7a4a] outline-none"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Jam Mulai</label>
                          <input
                            type="time"
                            value={formData.timeStart}
                            onChange={(e) => setFormData({ ...formData, timeStart: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-[#2d7a4a] focus:border-[#2d7a4a] outline-none"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Jam Selesai</label>
                          <input
                            type="time"
                            value={formData.timeEnd}
                            onChange={(e) => setFormData({ ...formData, timeEnd: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-[#2d7a4a] focus:border-[#2d7a4a] outline-none"
                            required
                          />
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Lokasi / Link Meeting</label>
                        <input
                          type="text"
                          value={formData.location}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          placeholder="Google Meet / Ruang Meeting 3"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-[#2d7a4a] focus:border-[#2d7a4a] outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">PIC Meeting</label>
                        <input
                          type="text"
                          value={formData.pic}
                          onChange={(e) => setFormData({ ...formData, pic: e.target.value })}
                          placeholder="Nama PIC"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-[#2d7a4a] focus:border-[#2d7a4a] outline-none"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Daftar Hadir */}
                <div className="bg-white rounded-lg p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-xl font-bold text-gray-900">Daftar Hadir</h3>
                    {availableAttendees.length > 0 && (
                      <button
                        type="button"
                        onClick={generateAllAttendees}
                        className="px-4 py-2 bg-[#2d7a4a] text-white text-sm font-medium rounded-lg hover:bg-[#235d3a] transition-colors"
                      >
                        Generate Semua Peserta ({availableAttendees.length})
                      </button>
                    )}
                  </div>
                  <div className="space-y-4">
                    {/* Dropdown Search for Attendees */}
                    <div className="relative" ref={dropdownRef}>
                      <input
                        type="text"
                        value={attendeeSearchQuery}
                        onChange={(e) => {
                          setAttendeeSearchQuery(e.target.value);
                          setShowAttendeeDropdown(true);
                        }}
                        onFocus={() => setShowAttendeeDropdown(true)}
                        placeholder="Cari dan tambah peserta..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#2d7a4a] focus:border-[#2d7a4a] outline-none"
                      />
                      
                      {showAttendeeDropdown && availableAttendees.length > 0 && (
                        <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {availableAttendees
                            .filter(att => 
                              !attendees.find(a => a.email === att.email) &&
                              (att.displayName?.toLowerCase().includes(attendeeSearchQuery.toLowerCase()) || 
                               att.email.toLowerCase().includes(attendeeSearchQuery.toLowerCase()))
                            )
                            .map((att, idx) => (
                              <div
                                key={idx}
                                onClick={() => addAttendeeFromDropdown(att)}
                                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0"
                              >
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                                  {(att.displayName || att.email).charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {att.displayName || att.email}
                                  </p>
                                  {att.displayName && (
                                    <p className="text-xs text-gray-500 truncate">{att.email}</p>
                                  )}
                                </div>
                              </div>
                            ))}
                          {availableAttendees.filter(att => 
                            !attendees.find(a => a.email === att.email) &&
                            (att.displayName?.toLowerCase().includes(attendeeSearchQuery.toLowerCase()) || 
                             att.email.toLowerCase().includes(attendeeSearchQuery.toLowerCase()))
                          ).length === 0 && (
                            <div className="px-4 py-6 text-sm text-gray-500 text-center">
                              Tidak ada peserta ditemukan
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {attendees.length > 0 && (
                      <div className="bg-white rounded-lg border border-gray-200 overflow-visible">
                        <div className="overflow-x-auto overflow-y-visible">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b border-gray-200 bg-white">
                                <th className="text-left py-3 px-4 font-semibold text-gray-900 text-sm">Peserta</th>
                                <th className="text-left py-3 px-4 font-semibold text-gray-900 text-sm w-40">Status</th>
                                <th className="text-left py-3 px-4 font-semibold text-gray-900 text-sm">Keterangan</th>
                                <th className="w-20"></th>
                              </tr>
                            </thead>
                            <tbody className="bg-white">
                              {attendees.map((att, idx) => (
                                <tr key={idx} className="border-b border-gray-100 last:border-0">
                                  <td className="py-3 px-4">
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                                        {att.name.charAt(0).toUpperCase()}
                                      </div>
                                      <span className="text-sm text-gray-900">{att.name}</span>
                                    </div>
                                  </td>
                                  <td className="py-3 px-4">
                                    <div className="relative" ref={openStatusDropdown === idx ? statusDropdownRef : null}>
                                      <button
                                        type="button"
                                        onClick={() => setOpenStatusDropdown(openStatusDropdown === idx ? null : idx)}
                                        className="w-full px-3 py-1.5 rounded-md text-sm font-medium outline-none cursor-pointer flex items-center justify-between gap-2"
                                        style={{
                                          backgroundColor: att.status === 'Hadir' ? '#dcfce7' : att.status === 'Telat' ? '#fef3c7' : '#f3f4f6',
                                          color: att.status === 'Hadir' ? '#166534' : att.status === 'Telat' ? '#854d0e' : '#374151'
                                        }}
                                      >
                                        <span>{att.status}</span>
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                      </button>
                                      
                                      {openStatusDropdown === idx && (
                                        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                                          {(['Hadir', 'Telat', 'Izin'] as const).map((status) => (
                                            <button
                                              key={status}
                                              type="button"
                                              onClick={() => {
                                                const newAttendees = [...attendees];
                                                newAttendees[idx].status = status;
                                                setAttendees(newAttendees);
                                                setOpenStatusDropdown(null);
                                              }}
                                              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors"
                                              style={{
                                                backgroundColor: att.status === status ? (status === 'Hadir' ? '#dcfce7' : status === 'Telat' ? '#fef3c7' : '#f3f4f6') : 'white',
                                                color: status === 'Hadir' ? '#166534' : status === 'Telat' ? '#854d0e' : '#374151'
                                              }}
                                            >
                                              {status}
                                            </button>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                  <td className="py-3 px-4">
                                    <input
                                      type="text"
                                      value={att.notes}
                                      onChange={(e) => {
                                        const newAttendees = [...attendees];
                                        newAttendees[idx].notes = e.target.value;
                                        setAttendees(newAttendees);
                                      }}
                                      placeholder="Tambah keterangan..."
                                      className="w-full px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-md outline-none focus:border-[#2d7a4a] focus:ring-1 focus:ring-[#2d7a4a]"
                                    />
                                  </td>
                                  <td className="py-3 px-4 text-center">
                                    <button
                                      type="button"
                                      onClick={() => removeAttendee(idx)}
                                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                                    >
                                      Hapus
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. Agenda */}
                <div className="bg-gray-50 rounded-lg p-5">
                  <h3 className="text-base font-semibold text-gray-900 mb-4">Agenda</h3>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newAgenda}
                        onChange={(e) => setNewAgenda(e.target.value)}
                        placeholder="Tambah agenda..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-[#2d7a4a] focus:border-[#2d7a4a] outline-none"
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addAgenda())}
                      />
                      <button
                        type="button"
                        onClick={addAgenda}
                        className="px-4 py-2 bg-[#2d7a4a] text-white text-sm rounded-lg hover:bg-[#235d3a] transition-colors"
                      >
                        Tambah
                      </button>
                    </div>
                    {agendas.length > 0 && (
                      <ul className="space-y-1.5">
                        {agendas.map((agenda, idx) => (
                          <li key={idx} className="flex items-start gap-2 p-2.5 bg-white rounded border border-gray-200">
                            <span className="text-gray-400 mt-0.5">•</span>
                            <span className="flex-1 text-gray-900 text-sm">{agenda}</span>
                            <button
                              type="button"
                              onClick={() => removeAgenda(idx)}
                              className="text-red-600 hover:text-red-700 text-xs"
                            >
                              Hapus
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                {/* 4. Pembahasan & Keputusan */}
                <div className="bg-gray-50 rounded-lg p-5">
                  <h3 className="text-base font-semibold text-gray-900 mb-4">Pembahasan & Keputusan</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Poin Pembahasan</label>
                      <textarea
                        value={discussion}
                        onChange={(e) => setDiscussion(e.target.value)}
                        rows={6}
                        placeholder="Tulis poin-poin pembahasan selama meeting..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-[#2d7a4a] focus:border-[#2d7a4a] outline-none resize-vertical"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Keputusan Disepakati</label>
                      <textarea
                        value={decisions}
                        onChange={(e) => setDecisions(e.target.value)}
                        rows={4}
                        placeholder="Keputusan apa yang telah disepakati dalam meeting ini..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-[#2d7a4a] focus:border-[#2d7a4a] outline-none resize-vertical"
                      />
                    </div>
                  </div>
                </div>

                {/* 5. Action Items */}
                <div className="bg-gray-50 rounded-lg p-5">
                  <h3 className="text-base font-semibold text-gray-900 mb-4">Action Items</h3>
                  <div className="space-y-3">
                    <div className="grid grid-cols-12 gap-2">
                      <input
                        type="text"
                        value={newAction.action}
                        onChange={(e) => setNewAction({ ...newAction, action: e.target.value })}
                        placeholder="Task / Action"
                        className="col-span-5 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-[#2d7a4a] focus:border-[#2d7a4a] outline-none"
                      />
                      <div className="col-span-3 relative" ref={picDropdownRef}>
                        <input
                          type="text"
                          value={picSearchQuery}
                          onChange={(e) => {
                            setPicSearchQuery(e.target.value);
                            setNewAction({ ...newAction, pic: e.target.value });
                            setShowPicDropdown(true);
                          }}
                          onFocus={() => setShowPicDropdown(true)}
                          placeholder="PIC"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-[#2d7a4a] focus:border-[#2d7a4a] outline-none"
                        />
                        {showPicDropdown && availableAttendees.length > 0 && (
                          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                            {availableAttendees
                              .filter(att => 
                                att.displayName?.toLowerCase().includes(picSearchQuery.toLowerCase()) || 
                                att.email.toLowerCase().includes(picSearchQuery.toLowerCase())
                              )
                              .map((att, idx) => (
                                <div
                                  key={idx}
                                  onClick={() => {
                                    const picName = att.displayName || att.email;
                                    setNewAction({ ...newAction, pic: picName });
                                    setPicSearchQuery(picName);
                                    setShowPicDropdown(false);
                                  }}
                                  className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0"
                                >
                                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
                                    {(att.displayName || att.email).charAt(0).toUpperCase()}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-gray-900 truncate">
                                      {att.displayName || att.email}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            {availableAttendees.filter(att => 
                              att.displayName?.toLowerCase().includes(picSearchQuery.toLowerCase()) || 
                              att.email.toLowerCase().includes(picSearchQuery.toLowerCase())
                            ).length === 0 && (
                              <div className="px-3 py-4 text-xs text-gray-500 text-center">
                                Tidak ada peserta ditemukan
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <input
                        type="date"
                        value={newAction.deadline}
                        onChange={(e) => setNewAction({ ...newAction, deadline: e.target.value })}
                        className="col-span-3 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-[#2d7a4a] focus:border-[#2d7a4a] outline-none"
                      />
                      <button
                        type="button"
                        onClick={addActionItem}
                        className="col-span-1 px-3 py-2 bg-[#2d7a4a] text-white text-sm rounded-lg hover:bg-[#235d3a] transition-colors"
                      >
                        +
                      </button>
                    </div>
                    
                    {actionItems.length > 0 && (
                      <div className="overflow-x-auto bg-white rounded border border-gray-200">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-gray-200 bg-gray-50">
                              <th className="text-left py-2 px-3 font-semibold text-gray-700">Action</th>
                              <th className="text-left py-2 px-3 font-semibold text-gray-700">PIC</th>
                              <th className="text-left py-2 px-3 font-semibold text-gray-700">Deadline</th>
                              <th className="text-left py-2 px-3 font-semibold text-gray-700">Status</th>
                              <th className="w-16"></th>
                            </tr>
                          </thead>
                          <tbody>
                            {actionItems.map((item, idx) => (
                              <tr key={idx} className="border-b border-gray-100">
                                <td className="py-2 px-3 text-gray-900">{item.action}</td>
                                <td className="py-2 px-3 text-gray-900">{item.pic}</td>
                                <td className="py-2 px-3 text-gray-600">{item.deadline}</td>
                                <td className="py-2 px-3">
                                  <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
                                    {item.status}
                                  </span>
                                </td>
                                <td className="py-2 px-3">
                                  <button
                                    type="button"
                                    onClick={() => removeActionItem(idx)}
                                    className="text-red-600 hover:text-red-700 text-xs"
                                  >
                                    Hapus
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>

                {/* 6. Kesimpulan */}
                <div className="bg-gray-50 rounded-lg p-5">
                  <h3 className="text-base font-semibold text-gray-900 mb-4">Kesimpulan</h3>
                  <textarea
                    value={conclusion}
                    onChange={(e) => setConclusion(e.target.value)}
                    rows={4}
                    placeholder="Kesimpulan akhir meeting..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-[#2d7a4a] focus:border-[#2d7a4a] outline-none resize-vertical"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => { resetForm(); setShowForm(false); }}
                    className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#2d7a4a] text-white rounded-lg text-sm font-medium hover:bg-[#235d3a] transition-colors"
                  >
                    Simpan Notulen
                  </button>
                </div>
              </form>
            </div>
          ) : selectedNotulen ? (
            <div className="max-w-4xl mx-auto p-8">
              <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">{selectedNotulen.title}</h1>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                    </svg>
                    {formatDate(selectedNotulen.date)} • {selectedNotulen.time}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                    {selectedNotulen.place}
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => handleDelete(selectedNotulen.id)}
                    className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="prose prose-sm max-w-none space-y-8">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-3">Agenda</h2>
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedNotulen.agenda}</p>
                </div>

                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-3">Discussion</h2>
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedNotulen.content}</p>
                </div>

                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-3">Conclusion</h2>
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedNotulen.conclusion}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-gray-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No note selected</h3>
                <p className="text-gray-500 text-sm mb-4">Select a meeting note from the sidebar or create a new one</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="px-4 py-2 bg-[#2d7a4a] text-white rounded-lg text-sm font-medium hover:bg-[#235d3a] transition-colors"
                >
                  Create New Note
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
