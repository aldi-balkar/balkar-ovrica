'use client';

import MainLayout from '@/components/MainLayout';
import Image from 'next/image';
import Avatar from '@/components/Avatar';

export default function Home() {
  return (
    <MainLayout>
      {/* Hero Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:transform hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900">Traveling to Switzerland</h3>
              <p className="text-sm text-gray-500">
                📅 17 Nov - 16 Nov ⏰ 11:00 AM
              </p>
            </div>
            <button className="w-10 h-10 rounded-full bg-[#2d7a4a] hover:bg-[#FF6436] transition-all duration-300 hover:scale-110 flex items-center justify-center text-white">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
              </svg>
            </button>
          </div>
        </div>

        <div className="md:col-span-2 bg-white border border-gray-200 rounded-2xl overflow-hidden h-52 shadow-sm hover:transform hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
          <Image
            src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop"
            alt="Mountain illustration"
            width={800}
            height={400}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Greeting Section */}
      <div className="bg-white border border-gray-200 rounded-2xl p-8 mb-6 shadow-sm">
        <h2 className="text-3xl font-semibold mb-3 text-gray-900">
          Have a Good day,<br />Wendy
        </h2>
        <p className="text-gray-500 mb-6 text-sm">
          Start your day with the boundless enthusiasm of a<br />lifelong explorer.
        </p>
        <div className="flex gap-3 flex-wrap items-center">
          <button className="px-5 py-2.5 rounded-full bg-gray-100 border border-gray-200 text-gray-700 hover:bg-[#2d7a4a] hover:text-white hover:border-[#2d7a4a] hover:-translate-y-0.5 transition-all duration-300 text-sm">
            New
          </button>
          <button className="px-5 py-2.5 rounded-full bg-gray-100 border border-gray-200 text-gray-700 hover:bg-[#2d7a4a] hover:text-white hover:border-[#2d7a4a] hover:-translate-y-0.5 transition-all duration-300 text-sm">
            Tomorrow
          </button>
          <button className="px-5 py-2.5 rounded-full bg-gray-100 border border-gray-200 text-gray-700 hover:bg-[#2d7a4a] hover:text-white hover:border-[#2d7a4a] hover:-translate-y-0.5 transition-all duration-300 text-sm">
            Next week
          </button>
          <button className="px-5 py-2.5 rounded-full bg-gray-100 border border-gray-200 text-gray-700 hover:bg-[#2d7a4a] hover:text-white hover:border-[#2d7a4a] hover:-translate-y-0.5 transition-all duration-300 text-sm">
            Custom
          </button>
          <button className="w-10 h-10 rounded-full bg-[#FF6436] hover:scale-110 transition-all duration-300 flex items-center justify-center text-white">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Schedule Section */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-lg font-semibold text-gray-900">Upcoming Schedule</h3>
            <div className="flex items-center gap-3">
              <button className="px-3 py-1.5 bg-gray-100 border border-gray-200 rounded-lg hover:bg-[#2d7a4a] hover:text-white hover:border-[#2d7a4a] transition-all duration-300 text-sm text-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>
              <span className="text-sm text-gray-700">December 2025</span>
              <button className="px-3 py-1.5 bg-gray-100 border border-gray-200 rounded-lg hover:bg-[#2d7a4a] hover:text-white hover:border-[#2d7a4a] transition-all duration-300 text-sm text-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
              <button className="px-3 py-1.5 bg-gray-100 border border-gray-200 rounded-lg hover:bg-[#2d7a4a] hover:text-white hover:border-[#2d7a4a] transition-all duration-300 text-sm text-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
              </button>
            </div>
          </div>

          {/* Calendar Days */}
          <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
            {['Sun 10', 'Mon 11', 'Tue 12', 'Wed 13', 'Thu 14'].map((day, idx) => (
              <button
                key={day}
                className={`px-5 py-3 rounded-xl whitespace-nowrap text-sm transition-all duration-300 ${
                  idx === 3
                    ? 'bg-[#2d7a4a] text-white border border-[#2d7a4a] font-medium'
                    : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                }`}
              >
                {day}
              </button>
            ))}
          </div>

          {/* Schedule Timeline */}
          <div className="space-y-4">
            <div className="text-sm text-gray-500">11 am</div>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 hover:transform hover:translate-x-1 hover:border-[#2d7a4a] hover:shadow-sm transition-all duration-300">
              <span className="font-medium text-sm text-gray-900">Imperial Dimnum</span>
              <p className="text-xs text-gray-500 mt-1">11 Dec • 11:00 AM</p>
            </div>

            <div className="text-sm text-gray-500">12 pm</div>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex gap-4 hover:transform hover:translate-x-1 hover:border-[#2d7a4a] hover:shadow-sm transition-all duration-300">
              <Image
                src="https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=400&h=200&fit=crop"
                alt="Event"
                width={100}
                height={80}
                className="rounded-lg object-cover"
              />
              <div>
                <h4 className="font-medium text-sm mb-1 text-gray-900">Explore Forest Fork</h4>
                <p className="text-xs text-gray-500 mb-2">21 Dec • 12:00 AM</p>
                <div className="flex items-center gap-1">
                  <Avatar name="Aldi Permana" size={28} className="border-2 border-gray-200" />
                  <Avatar name="Bagas Saputra" size={28} className="border-2 border-gray-200" />
                  <span className="text-xs text-gray-500 ml-1">+2</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex gap-4 hover:transform hover:translate-x-1 hover:border-[#2d7a4a] hover:shadow-sm transition-all duration-300">
              <Image
                src="https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400&h=200&fit=crop"
                alt="Camping"
                width={100}
                height={80}
                className="rounded-lg object-cover"
              />
              <div>
                <h4 className="font-medium text-sm mb-1 text-gray-900">Camping at Ranca Upas</h4>
                <p className="text-xs text-gray-500 mb-2">11 Dec - 12 Dec • 11:00 AM</p>
                <div className="flex items-center gap-1">
                  <Avatar name="Citra Dewi" size={28} className="border-2 border-gray-200" />
                  <Avatar name="Dimas Pratama" size={28} className="border-2 border-gray-200" />
                  <span className="text-xs text-gray-500 ml-1">+2</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 hover:transform hover:translate-x-1 hover:border-[#2d7a4a] hover:shadow-sm transition-all duration-300">
              <span className="font-medium text-sm text-gray-900">Mild Soccer</span>
              <p className="text-xs text-gray-500 mt-1">7 Dec</p>
            </div>
          </div>
        </div>

        {/* Messages Section */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 max-h-[700px] overflow-y-auto shadow-sm">
          {[
            { name: 'Jane Cooper', badge: '10', time: '10:38', message: '2 mutual' },
            { name: 'Jenny Wilson', time: '12:35', message: "Let's plan for tomorrow" },
            { name: 'Broklyn Simoe', badge: '1', time: '19:32', message: 'in 5th minute ago', highlight: true },
            { name: 'Darlene Angel', badge: '3', badgeColor: 'orange', time: 'Yesterday', message: 'in 3rd minute ago' },
          ].map((msg) => (
            <div
              key={msg.name}
              className={`flex gap-3 p-3 rounded-xl mb-2 cursor-pointer transition-all duration-300 ${
                msg.highlight
                  ? 'bg-gray-50 border border-[#FF6436]'
                  : 'hover:bg-gray-50'
              }`}
            >
              <Avatar
                name={msg.name}
                size={48}
                className="flex-shrink-0"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-gray-900">{msg.name}</span>
                  {msg.badge && (
                    <span className={`${msg.badgeColor === 'orange' ? 'bg-[#FF6436]' : 'bg-[#2d7a4a]'} text-white text-xs px-2 py-0.5 rounded-full`}>
                      {msg.badge}
                    </span>
                  )}
                  <span className="text-xs text-gray-500 ml-auto">{msg.time}</span>
                </div>
                <p className="text-xs text-gray-500">{msg.message}</p>
              </div>
            </div>
          ))}

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 mt-4">
            <p className="text-sm text-gray-600">That's cool, see you soon</p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
