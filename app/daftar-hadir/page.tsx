'use client';

import { useState } from 'react';
import MainLayout from '@/components/MainLayout';
import { useLocalStorage } from '@/lib/utils';

type StatusKehadiran = 'Hadir' | 'Tidak Hadir' | 'Izin';

interface AttendanceRecord {
  id: number;
  namaPeserta: string;
  statusKehadiran: StatusKehadiran;
  waktuCheckIn: string;
  meeting: string;
  tanggal: string;
}

export default function DaftarHadirPage() {
  const [attendanceRecords, setAttendanceRecords] = useLocalStorage<AttendanceRecord[]>('attendanceRecords', []);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    namaPeserta: '',
    statusKehadiran: 'Hadir' as 'Hadir' | 'Tidak Hadir' | 'Izin',
    waktuCheckIn: '',
    meeting: '',
    tanggal: '',
  });

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newRecord: AttendanceRecord = {
      id: Date.now(),
      ...formData,
    };
    setAttendanceRecords([...attendanceRecords, newRecord]);
    setShowModal(false);
    setFormData({
      namaPeserta: '',
      statusKehadiran: 'Hadir',
      waktuCheckIn: '',
      meeting: '',
      tanggal: '',
    });
  };

  const handleDelete = (id: number) => {
    if (confirm('Yakin ingin menghapus data kehadiran ini?')) {
      setAttendanceRecords(attendanceRecords.filter((record) => record.id !== id));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Hadir':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'Tidak Hadir':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'Izin':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <MainLayout>
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Daftar Hadir Meeting</h1>
        <p className="text-sm sm:text-base text-gray-600">Kelola kehadiran peserta meeting</p>
      </div>

      <div className="flex justify-end mb-4 sm:mb-6">
        <button
          onClick={() => setShowModal(true)}
          className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-[#FF6436] text-white rounded-xl text-sm sm:text-base font-medium hover:bg-opacity-90 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300"
        >
          + Tambah Kehadiran
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        {attendanceRecords.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            Belum ada data kehadiran. Klik &quot;Tambah Kehadiran&quot; untuk menambah data.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Nama Peserta</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Meeting</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Tanggal</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Status Kehadiran</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Waktu Check-in</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {attendanceRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{record.namaPeserta}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-sm">
                      {record.meeting}
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-sm">
                      {new Date(record.tanggal).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(record.statusKehadiran)}`}>
                          {record.statusKehadiran}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center text-gray-600 text-sm">
                      {record.waktuCheckIn || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <button
                          onClick={() => handleDelete(record.id)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-opacity-90 transition-all"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Tambah Kehadiran */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-4 sm:p-6 w-full max-w-md">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Tambah Kehadiran</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="nama-peserta" className="block text-sm font-medium text-gray-700 mb-2">Nama Peserta</label>
                <input
                  id="nama-peserta"
                  type="text"
                  value={formData.namaPeserta}
                  onChange={(e) => setFormData({ ...formData, namaPeserta: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:border-[#2d7a4a] focus:ring-2 focus:ring-[#2d7a4a]/20 outline-none"
                  placeholder="Masukkan nama peserta"
                  required
                />
              </div>
              <div>
                <label htmlFor="meeting-name" className="block text-sm font-medium text-gray-700 mb-2">Meeting</label>
                <input
                  id="meeting-name"
                  type="text"
                  value={formData.meeting}
                  onChange={(e) => setFormData({ ...formData, meeting: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:border-[#2d7a4a] focus:ring-2 focus:ring-[#2d7a4a]/20 outline-none"
                  placeholder="Nama meeting"
                  required
                />
              </div>
              <div>
                <label htmlFor="tanggal-hadir" className="block text-sm font-medium text-gray-700 mb-2">Tanggal</label>
                <input
                  id="tanggal-hadir"
                  type="date"
                  value={formData.tanggal}
                  onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:border-[#2d7a4a] focus:ring-2 focus:ring-[#2d7a4a]/20 outline-none"
                  required
                />
              </div>
              <div>
                <label htmlFor="status-kehadiran" className="block text-sm font-medium text-gray-700 mb-2">Status Kehadiran</label>
                <select
                  id="status-kehadiran"
                  value={formData.statusKehadiran}
                  onChange={(e) => setFormData({ ...formData, statusKehadiran: e.target.value as 'Hadir' | 'Tidak Hadir' | 'Izin' })}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:border-[#2d7a4a] focus:ring-2 focus:ring-[#2d7a4a]/20 outline-none"
                  required
                >
                  <option value="Hadir">Hadir</option>
                  <option value="Tidak Hadir">Tidak Hadir</option>
                  <option value="Izin">Izin</option>
                </select>
              </div>
              <div>
                <label htmlFor="waktu-checkin" className="block text-sm font-medium text-gray-700 mb-2">Waktu Check-in</label>
                <input
                  id="waktu-checkin"
                  type="time"
                  value={formData.waktuCheckIn}
                  onChange={(e) => setFormData({ ...formData, waktuCheckIn: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:border-[#2d7a4a] focus:ring-2 focus:ring-[#2d7a4a]/20 outline-none"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#FF6436] text-white rounded-lg font-medium hover:bg-opacity-90 transition-all"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
