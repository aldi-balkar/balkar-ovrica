'use client';

import { useState, useEffect, useRef } from 'react';
import MainLayout from '@/components/MainLayout';
import { useLocalStorage } from '@/lib/utils';
import Avatar from '@/components/Avatar';
import { useSession } from 'next-auth/react';

interface Attendance {
  id: number;
  name: string;
  meeting: string;
  date: string;
  status: string;
  checkInTime: string;
}

interface Meeting {
  id: number;
  title: string;
  date: string;
  place: string;
  agenda: string;
  notes: string;
}

interface CalendarEvent {
  id: string;
  summary: string;
  start: {
    dateTime?: string;
    date?: string;
  };
  attendees?: Array<{
    email: string;
    displayName?: string;
    responseStatus?: string;
  }>;
  organizer?: {
    email: string;
    displayName?: string;
  };
}

export default function SpinWheelPage() {
  const { data: session } = useSession();
  const [participants, setParticipants] = useLocalStorage<string[]>('participants', []);
  const [participantName, setParticipantName] = useState('');
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState('');
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<string[]>([]);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [isSequentialSpinning, setIsSequentialSpinning] = useState(false);
  const [currentPickIndex, setCurrentPickIndex] = useState(0);
  const [pointerColor, setPointerColor] = useState('#FF6436');
  const [meetings] = useLocalStorage<Meeting[]>('notulen', []);
  const [attendances] = useLocalStorage<Attendance[]>('attendances', []);
  const [calendarMeetings, setCalendarMeetings] = useState<CalendarEvent[]>([]);
  const [loadingMeetings, setLoadingMeetings] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rotationRef = useRef(0);

  // Fetch meetings from Google Calendar
  useEffect(() => {
    if (session?.accessToken) {
      fetchCalendarMeetings();
    }
  }, [session]);

  const fetchCalendarMeetings = async () => {
    try {
      if (!session?.accessToken) return;
      
      setLoadingMeetings(true);
      
      // Set time range for today only
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const timeMin = today.toISOString();
      const timeMax = tomorrow.toISOString();
      
      const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
        },
      });

      const data = await response.json();
      
      // Filter only meetings where user is organizer
      const userEmail = session?.user?.email;
      const organizedMeetings = (data.items || []).filter((event: CalendarEvent) => 
        event.organizer?.email === userEmail && event.attendees && event.attendees.length > 0
      );

      setCalendarMeetings(organizedMeetings);
    } catch (error) {
      console.error('Error fetching calendar meetings:', error);
    } finally {
      setLoadingMeetings(false);
    }
  };

  const importAttendeesFromCalendar = (event: CalendarEvent) => {
    if (!event.attendees) return;
    
    const attendeeNames = event.attendees
      .map(att => {
        // Gunakan displayName jika ada (nama lengkap seperti "Adnan Firmansyah")
        if (att.displayName && att.displayName.trim()) {
          return att.displayName.trim();
        }
        // Fallback ke email jika tidak ada displayName
        if (att.email) {
          return att.email.split('@')[0];
        }
        return null;
      })
      .filter((name): name is string => !!name);
    
    const uniqueParticipants = Array.from(new Set([...participants, ...attendeeNames]));
    setParticipants(uniqueParticipants);
  };

  // Strong vibrant colors
  const colors = [
    '#FF1744', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5',
    '#2196F3', '#00BCD4', '#009688', '#4CAF50', '#8BC34A',
    '#FFC107', '#FF9800', '#FF5722', '#F44336', '#00E676'
  ];

  // Helper untuk generate avatar color dari nama (using full name hash)
  const getColorFromName = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      const code = name.codePointAt(i);
      if (code) {
        hash = code + ((hash << 5) - hash);
      }
    }
    return colors[Math.abs(hash) % colors.length];
  };

  // Helper untuk get initials
  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    const last = parts.at(-1);
    return (parts[0].charAt(0) + (last?.charAt(0) ?? '')).toUpperCase();
  };

  const drawWheel = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 200;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate pointer color based on rotation
    if (participants.length > 0) {
      const pointerAngle = Math.PI / 2; // Pointer at left (90 degrees)
      const normalizedRotation = (rotationRef.current % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
      const adjustedAngle = (pointerAngle - normalizedRotation + 2 * Math.PI) % (2 * Math.PI);
      const segmentAngle = (2 * Math.PI) / participants.length;
      const segmentIndex = Math.floor(adjustedAngle / segmentAngle);
      const currentColor = getColorFromName(participants[segmentIndex]);
      setPointerColor(currentColor);
    }

    if (participants.length === 0) {
      ctx.fillStyle = '#f3f4f6';
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.fill();

      ctx.fillStyle = '#6b7280';
      ctx.font = '18px Poppins';
      ctx.textAlign = 'center';
      ctx.fillText('Tambahkan peserta', centerX, centerY);
      return;
    }

    const anglePerSegment = (2 * Math.PI) / participants.length;

    participants.forEach((participant, index) => {
      const startAngle = index * anglePerSegment + rotationRef.current;
      const endAngle = startAngle + anglePerSegment;
      const color = getColorFromName(participant);

      // Draw segment
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fill();

      // Draw border
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Draw avatar circle dengan initials
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + anglePerSegment / 2);
      
      // Draw avatar circle background (white)
      const avatarRadius = 25;
      const avatarDistance = radius / 1.8;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(avatarDistance, 0, avatarRadius, 0, 2 * Math.PI);
      ctx.fill();
      
      // Draw initials
      ctx.fillStyle = color;
      ctx.font = 'bold 18px Poppins';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(getInitials(participant), avatarDistance, 0);
      
      ctx.restore();
    });

    // Draw center circle
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 30, 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = '#2d7a4a';
    ctx.lineWidth = 3;
    ctx.stroke();
  };

  useEffect(() => {
    drawWheel();
  }, [participants]);

  const addParticipant = () => {
    const trimmedName = participantName.trim();
    if (trimmedName) {
      // Check for duplicate (case-insensitive)
      const isDuplicate = participants.some(
        (p) => p.toLowerCase() === trimmedName.toLowerCase()
      );
      
      if (isDuplicate) {
        alert('Nama peserta sudah ada! Silakan gunakan nama yang berbeda.');
        return;
      }
      
      setParticipants([...participants, trimmedName]);
      setParticipantName('');
    }
  };

  const removeParticipant = (name: string) => {
    setParticipants(participants.filter((p) => p !== name));
  };

  const spinWheel = () => {
    if (participants.length === 0) {
      alert('Tambahkan peserta terlebih dahulu!');
      return;
    }

    if (isSpinning) return;

    setIsSpinning(true);
    setWinner('');
    setShowWinnerModal(false);

    const spins = 5 + Math.random() * 5;
    const extraDegrees = Math.random() * Math.PI * 2;
    const totalRotation = spins * Math.PI * 2 + extraDegrees;
    const duration = 4000;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const easeOut = 1 - Math.pow(1 - progress, 3);
      rotationRef.current = totalRotation * easeOut;

      drawWheel();

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        const normalizedRotation = (2 * Math.PI - (rotationRef.current % (2 * Math.PI))) % (2 * Math.PI);
        const segmentAngle = (2 * Math.PI) / participants.length;
        const winnerIndex = Math.floor(normalizedRotation / segmentAngle);
        const winnerName = participants[winnerIndex];

        setWinner(winnerName);
        setIsSpinning(false);
        setShowWinnerModal(true);
      }
    };

    animate();
  };

  const handleRemoveWinner = () => {
    if (winner) {
      setParticipants(participants.filter(p => p !== winner));
      setWinner('');
      setShowWinnerModal(false);
    }
  };

  const handleCloseModal = () => {
    setShowWinnerModal(false);
  };

  const generateSequentialOrder = () => {
    if (participants.length === 0) {
      alert('Tambahkan peserta terlebih dahulu!');
      return;
    }

    // Shuffle participants using Fisher-Yates algorithm
    const shuffled = [...participants];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    setSelectedOrder([]);
    setCurrentPickIndex(0);
    setIsSequentialSpinning(true);
    
    // Spin for each participant sequentially
    const spinForNext = (index: number, order: string[]) => {
      if (index >= shuffled.length) {
        setIsSequentialSpinning(false);
        setShowOrderModal(true);
        return;
      }

      setCurrentPickIndex(index + 1);
      
      // Spin animation
      const spins = 3 + Math.random() * 2;
      const extraDegrees = Math.random() * Math.PI * 2;
      const totalRotation = spins * Math.PI * 2 + extraDegrees;
      const duration = 2000; // Faster for sequential
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        rotationRef.current = totalRotation * easeOut;
        drawWheel();

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          // Add winner to order
          const newOrder = [...order, shuffled[index]];
          setSelectedOrder(newOrder);
          
          // Continue to next after short delay
          setTimeout(() => {
            spinForNext(index + 1, newOrder);
          }, 500);
        }
      };

      animate();
    };

    spinForNext(0, []);
  };

  return (
    <MainLayout>
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Spin Wheel – Pilih Peserta</h1>
        <p className="text-sm sm:text-base text-gray-600">Pilih peserta secara acak untuk presentasi atau kegiatan lainnya</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Wheel Section */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-8 flex flex-col items-center shadow-sm">
          <div className="relative mb-4 sm:mb-6 w-full flex items-center justify-center">
            {/* Pointer Jarum - Pindah ke kiri */}
            <div 
              className="absolute left-8 sm:left-12 top-1/2 -translate-y-1/2 z-10 transition-colors duration-300"
              style={{ color: pointerColor }}
            >
              <svg width="50" height="50" viewBox="0 0 50 50" className="drop-shadow-lg">
                <path 
                  d="M 45 25 L 15 10 L 20 25 L 15 40 Z" 
                  fill="currentColor"
                  stroke="#ffffff"
                  strokeWidth="2"
                />
              </svg>
            </div>
            
            <canvas
              ref={canvasRef}
              width="500"
              height="500"
              className="max-w-full h-auto"
              style={{ maxWidth: '400px' }}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <button
              onClick={spinWheel}
              disabled={isSpinning || participants.length === 0}
              className="flex-1 px-8 py-3 sm:py-4 bg-[#FF6436] text-white rounded-xl text-base sm:text-lg font-semibold hover:bg-opacity-90 hover:scale-105 hover:shadow-lg transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
            >
              {isSpinning ? 'BERPUTAR...' : 'Spin Sekarang'}
            </button>
            <button
              onClick={generateSequentialOrder}
              disabled={participants.length === 0 || isSequentialSpinning}
              className="flex-1 px-8 py-3 sm:py-4 bg-[#2d7a4a] text-white rounded-xl text-base sm:text-lg font-semibold hover:bg-[#235d3a] hover:scale-105 hover:shadow-lg transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              {isSequentialSpinning ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Memilih {currentPickIndex}/{participants.length}...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                  Urutan Acak
                </>
              )}
            </button>
          </div>
        </div>

        {/* Participants Section */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-8 shadow-sm">
          <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-5 text-gray-900">Daftar Peserta</h3>
          
          {/* Import dari Meeting */}
          <div className="mb-6 p-5 bg-white rounded-lg border border-gray-200">
            <h4 className="text-sm font-semibold text-gray-900 mb-4">💡 Import Peserta dari Meeting</h4>
            {!session ? (
              <div className="text-center text-gray-500 text-sm py-4">
                Login terlebih dahulu untuk mengakses fitur ini
              </div>
            ) : loadingMeetings ? (
              <div className="text-center text-gray-500 text-sm py-4">
                <div className="inline-block w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                Memuat meeting...
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {calendarMeetings.length === 0 ? (
                  <div className="text-center text-gray-400 text-sm py-6">
                    Belum ada meeting yang Anda organize hari ini
                  </div>
                ) : (
                  calendarMeetings.map((meeting) => {
                    const meetingDate = meeting.start.dateTime 
                      ? new Date(meeting.start.dateTime).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                      : meeting.start.date 
                        ? new Date(meeting.start.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                        : '';
                    const attendeeCount = meeting.attendees?.length || 0;
                    
                    return (
                      <button
                        key={meeting.id}
                        onClick={() => importAttendeesFromCalendar(meeting)}
                        className="w-full p-3 bg-white border border-gray-200 rounded-lg hover:border-[#2d7a4a] hover:bg-gray-50 transition-all text-left"
                      >
                        <div className="font-semibold text-gray-900 text-sm mb-1 truncate">
                          {meeting.summary}
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{meetingDate}</span>
                          <span className="font-medium text-[#2d7a4a]">{attendeeCount} peserta</span>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </div>
          
          <div className="flex gap-3 mb-6">
            <input
              type="text"
              value={participantName}
              onChange={(e) => setParticipantName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addParticipant()}
              placeholder="Nama peserta..."
              className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:border-[#2d7a4a] focus:ring-2 focus:ring-[#2d7a4a]/20 transition-all duration-300 outline-none"
            />
            <button
              onClick={addParticipant}
              className="px-6 py-3 bg-[#FF6436] text-white rounded-xl font-medium hover:bg-opacity-90 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300"
            >
              Tambah
            </button>
          </div>

          <ul className="space-y-2 mb-8 max-h-80 overflow-y-auto">
            {participants.map((participant) => (
              <li
                key={participant}
                className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center gap-3 hover:bg-gray-100 hover:transform hover:translate-x-1 transition-all duration-300"
              >
                <Avatar name={participant} size={40} />
                <span className="flex-1 text-gray-900 font-medium">{participant}</span>
                <button
                  onClick={() => removeParticipant(participant)}
                  className="px-4 py-1.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 hover:scale-105 transition-all duration-300"
                >
                  Hapus
                </button>
              </li>
            ))}
          </ul>

          {participants.length === 0 && (
            <div className="text-center text-gray-400 py-8">
              Belum ada peserta, tambahkan peserta terlebih dahulu
            </div>
          )}
        </div>
      </div>

      {/* Winner Modal - Formal Design */}
      {showWinnerModal && winner && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          {/* Konfetti Animation */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {new Array(50).fill(null).map((_, i) => {
              const uniqueKey = `confetti-${i}-${Date.now()}`;
              return (
              <div
                key={uniqueKey}
                className="absolute animate-confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: '-10%',
                  width: `${Math.random() * 10 + 5}px`,
                  height: `${Math.random() * 20 + 10}px`,
                  backgroundColor: colors[Math.floor(Math.random() * colors.length)],
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${Math.random() * 3 + 2}s`,
                  transform: `rotate(${Math.random() * 360}deg)`
                }}
              />
            );
            })}
          </div>

          {/* Modal Content - Formal */}
          <div className="bg-white rounded-2xl p-8 sm:p-10 w-full max-w-lg relative animate-scale-in shadow-2xl">
            {/* Header */}
            <div className="text-center mb-8 border-b-2 border-gray-200 pb-6">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                Peserta Terpilih
              </h2>
              <p className="text-gray-600 text-sm">Hasil Random Selection</p>
            </div>

            {/* Winner Info */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-4xl shadow-lg">
                    {getInitials(winner)}
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-[#2d7a4a] text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-[#2d7a4a] to-[#4ade80] text-white py-4 px-6 rounded-xl mb-2">
                <div className="text-2xl sm:text-3xl font-bold break-words">
                  {winner}
                </div>
              </div>
              <p className="text-sm text-gray-500">Dipilih secara acak dari {participants.length} peserta</p>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleCloseModal}
                className="flex-1 px-6 py-3.5 bg-gray-200 text-gray-800 rounded-xl font-semibold hover:bg-gray-300 transition-all duration-300"
              >
                Tutup
              </button>
              <button
                onClick={handleRemoveWinner}
                className="flex-1 px-6 py-3.5 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Hapus Peserta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sequential Order Modal */}
      {showOrderModal && selectedOrder.length > 0 && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-2xl relative animate-scale-in shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-gray-200">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Urutan Peserta Terpilih</h2>
                <p className="text-gray-600 text-sm mt-1">Total {selectedOrder.length} peserta</p>
              </div>
              <button
                onClick={() => setShowOrderModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Order List */}
            <div className="space-y-3 mb-6">
              {selectedOrder.map((name, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-[#2d7a4a] to-[#4ade80] text-white rounded-full font-bold text-lg flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                      {getInitials(name)}
                    </div>
                    <span className="text-lg font-semibold text-gray-900 truncate">{name}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowOrderModal(false)}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-xl font-semibold hover:bg-gray-300 transition-all"
              >
                Tutup
              </button>
              <button
                onClick={generateSequentialOrder}
                className="flex-1 px-6 py-3 bg-[#2d7a4a] text-white rounded-xl font-semibold hover:bg-[#235d3a] transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Acak Ulang
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes confetti {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }

        @keyframes scale-in {
          0% {
            transform: scale(0.5);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .animate-confetti {
          animation: confetti linear infinite;
        }

        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </MainLayout>
  );
}
