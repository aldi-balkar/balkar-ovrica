'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { name: 'Home', href: '/' },
  { name: 'Calendar', href: '/calendar' },
  { name: 'Activity', href: '/activity' },
  { name: 'Messages', href: '/messages' },
  { name: 'Settings', href: '/settings' },
  { name: 'Notulen', href: '/notulen' },
  { name: 'Presentasi', href: '/presentation' },
  { name: 'Spin Wheel', href: '/spinwheel' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 bg-[#1a3326]/70 backdrop-blur-lg border-r border-[#2d5a3f] fixed h-screen overflow-y-auto">
      <div className="p-6">
        <h2 className="text-2xl font-semibold mb-8">ovrica</h2>
        
        <nav className="flex flex-col gap-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-4 py-3 rounded-xl transition-all duration-300 ${
                pathname === item.href
                  ? 'bg-[#2d7a4a] text-white font-medium'
                  : 'text-gray-300 hover:bg-[#1f3d2e] hover:text-white'
              }`}
            >
              <span className="text-sm">{item.name}</span>
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}
