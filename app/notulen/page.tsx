'use client';

import { useState } from 'react';
import MainLayout from '@/components/MainLayout';
import { useLocalStorage, formatDate } from '@/lib/utils';
import { Notulen } from '@/types';

export default function NotulenPage() {
  const [notulens, setNotulens] = useLocalStorage<Notulen[]>('notulens', []);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    place: '',
    agenda: '',
    content: '',
    conclusion: '',
  });

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newNotulen: Notulen = {
      id: Date.now(),
      ...formData,
    };
    setNotulens([...notulens, newNotulen]);
    setShowForm(false);
    setFormData({
      title: '',
      date: '',
      time: '',
      place: '',
      agenda: '',
      content: '',
      conclusion: '',
    });
  };

  const handleDelete = (id: number) => {
    if (confirm('Yakin ingin menghapus notulen ini?')) {
      setNotulens(notulens.filter((n) => n.id !== id));
    }
  };

  const handleView = (notulen: Notulen) => {
    alert(`
NOTULEN RAPAT

Judul: ${notulen.title}
Tanggal: ${formatDate(notulen.date)}
Waktu: ${notulen.time}
Tempat: ${notulen.place}

AGENDA:
${notulen.agenda}

PEMBAHASAN:
${notulen.content}

KESIMPULAN:
${notulen.conclusion}
    `);
  };

  return (
    <MainLayout>
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Notulen Meeting</h1>
        <p className="text-sm sm:text-base text-gray-600">Kelola catatan hasil meeting Anda</p>
      </div>

      <div className="flex justify-end mb-4 sm:mb-6">
        <button
          onClick={() => setShowForm(!showForm)}
          className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-[#FF6436] text-white rounded-xl text-sm sm:text-base font-medium hover:bg-opacity-90 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300"
        >
          + Buat Notulen Baru
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-gray-200 rounded-2xl p-8 mb-6 shadow-sm">
          <h3 className="text-xl font-semibold mb-6 text-gray-900">Buat Notulen Baru</h3>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="judul" className="block text-sm font-medium mb-2 text-gray-700">Judul Rapat</label>
              <input
                id="judul"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:border-[#2d7a4a] focus:ring-2 focus:ring-[#2d7a4a]/20 transition-all duration-300 outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="tanggal" className="block text-sm font-medium mb-2 text-gray-700">Tanggal</label>
                <input
                  id="tanggal"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:border-[#2d7a4a] focus:ring-2 focus:ring-[#2d7a4a]/20 transition-all duration-300 outline-none"
                  required
                />
              </div>

              <div>
                <label htmlFor="waktu" className="block text-sm font-medium mb-2 text-gray-700">Waktu</label>
                <input
                  id="waktu"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:border-[#2d7a4a] focus:ring-2 focus:ring-[#2d7a4a]/20 transition-all duration-300 outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="tempat" className="block text-sm font-medium mb-2 text-gray-700">Tempat</label>
              <input
                id="tempat"
                type="text"
                value={formData.place}
                onChange={(e) => setFormData({ ...formData, place: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:border-[#2d7a4a] focus:ring-2 focus:ring-[#2d7a4a]/20 transition-all duration-300 outline-none"
                required
              />
            </div>

            <div>
              <label htmlFor="agenda" className="block text-sm font-medium mb-2 text-gray-700">Agenda</label>
              <textarea
                id="agenda"
                value={formData.agenda}
                onChange={(e) => setFormData({ ...formData, agenda: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:border-[#2d7a4a] focus:ring-2 focus:ring-[#2d7a4a]/20 transition-all duration-300 outline-none resize-vertical"
                required
              />
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium mb-2 text-gray-700">Isi Pembahasan</label>
              <textarea
                id="notes"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={5}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:border-[#2d7a4a] focus:ring-2 focus:ring-[#2d7a4a]/20 transition-all duration-300 outline-none resize-vertical"
                required
              />
            </div>

            <div>
              <label htmlFor="conclusions" className="block text-sm font-medium mb-2 text-gray-700">Kesimpulan</label>
              <textarea
                id="conclusions"
                value={formData.conclusion}
                onChange={(e) => setFormData({ ...formData, conclusion: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:border-[#2d7a4a] focus:ring-2 focus:ring-[#2d7a4a]/20 transition-all duration-300 outline-none resize-vertical"
                required
              />
            </div>

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-3 bg-gray-100 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all duration-300"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-[#FF6436] text-white rounded-xl font-medium hover:bg-opacity-90 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300"
              >
                Simpan
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table List */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        {notulens.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            Belum ada notulen. Klik &quot;Buat Notulen Baru&quot; untuk membuat yang baru.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Meeting Title</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Tempat</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {notulens.map((notulen) => (
                  <tr key={notulen.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{notulen.title}</div>
                      <div className="text-sm text-gray-500 mt-1">
                        Agenda: {notulen.agenda.substring(0, 60)}...
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-sm whitespace-nowrap">
                      {formatDate(notulen.date)} <br />
                      <span className="text-gray-500">{notulen.time}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-sm">
                      {notulen.place}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleView(notulen)}
                          className="px-4 py-2 bg-[#2d7a4a] text-white rounded-lg text-sm font-medium hover:bg-opacity-90 transition-all"
                        >
                          Detail
                        </button>
                        <button
                          onClick={() => handleDelete(notulen.id)}
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
    </MainLayout>
  );
}
