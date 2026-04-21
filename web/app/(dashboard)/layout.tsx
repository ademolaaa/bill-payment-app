import React from 'react';
import { BottomNav } from '../../components/BottomNav';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 relative transition-colors duration-300">
      {/* 
        The main content area has pb-20 to ensure it doesn't 
        hide behind the fixed BottomNav on mobile. 
      */}
      <main className="pb-20">
        {children}
      </main>
      
      <BottomNav />
    </div>
  );
}
