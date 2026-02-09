'use client';

import { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';

export default function MainLayout({ children }: { readonly children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full">
        {children}
      </main>
      <Footer />
    </div>
  );
}
