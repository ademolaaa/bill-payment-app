import React from 'react';
import { BottomNav } from '../../components/BottomNav';

export const dynamic = 'force-dynamic';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <div className="max-w-md mx-auto min-h-screen shadow-xl border-x border-gray-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950 flex flex-col relative pb-20">
        <main className="flex-1">
          {children}
        </main>
        
        <BottomNav />
      </div>
    </div>
  );
}
