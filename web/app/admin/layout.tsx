'use client';

import React from 'react';
import { LayoutProvider } from '../../components/admin/LayoutContext';
import { Sidebar } from '../../components/admin/Sidebar';
import { Header } from '../../components/admin/Header';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <LayoutProvider>
      <div className="flex w-full h-screen overflow-hidden bg-slate-50 dark:bg-[#0d1117] text-slate-800 dark:text-slate-100 transition-colors duration-300 antialiased font-sans">
        
        {/* Collapsible dark sidebar overlay/panel */}
        <Sidebar />

        {/* Dynamic header and content viewport pane */}
        <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
          
          {/* Header containing system search, theme toggles, and notification counters */}
          <Header />

          {/* Core scrollable page viewpoint */}
          <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8 md:py-8 custom-scrollbar">
            <div className="max-w-7xl mx-auto w-full space-y-6">
              {children}
            </div>
          </main>

        </div>

      </div>
    </LayoutProvider>
  );
}
