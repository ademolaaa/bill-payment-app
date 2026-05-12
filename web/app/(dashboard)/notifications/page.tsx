'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { NotificationItem } from '../../../components/NotificationItem';

interface Notification {
  id: string;
  title: string;
  description: string;
  timestamp: string;
}

const dummyNotifications: Notification[] = [
  {
    id: 'n1',
    title: 'Deposit Completed',
    description: 'You deposited 50,000.00 NGN into your account.',
    timestamp: 'May 12, 2025\n09:24 AM'
  },
  {
    id: 'n2',
    title: 'Withdrawal Completed',
    description: 'You withdrew 25,000.00 NGN from your account.',
    timestamp: 'May 12, 2025\n07:15 AM'
  },
  {
    id: 'n3',
    title: 'KYC Approved',
    description: 'Your KYC verification has been approved.',
    timestamp: 'May 11, 2025\n04:38 PM'
  },
  {
    id: 'n4',
    title: 'Deposit Completed',
    description: 'You deposited 3,000.00 USDT into your account.',
    timestamp: 'May 11, 2025\n10:02 AM'
  },
  {
    id: 'n5',
    title: 'Investment Confirmation',
    description: 'Your investment of 400,000.00 NGN has been confirmed.',
    timestamp: 'May 10, 2025\n02:20 PM'
  },
  {
    id: 'n6',
    title: 'Investment Confirmation',
    description: 'Your investment of 12,500.00 USDT has been confirmed.',
    timestamp: 'May 09, 2025\n11:47 AM'
  }
];

export default function NotificationsPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-slate-950 pb-20">
      {/* Header */}
      <header className="p-6 pt-14 flex items-center justify-between">
        <div className="flex items-center">
          <button onClick={() => router.back()} title="Go Back" aria-label="Go Back" className="mr-4 text-slate-900 dark:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-[32px] font-bold text-slate-900 dark:text-white tracking-tight">Notifications</h1>
        </div>
        <button title="History" aria-label="History" className="w-10 h-10 rounded-full border border-gray-100 dark:border-slate-800 flex items-center justify-center text-slate-900 dark:text-white">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </header>

      <div className="px-6">
        <h2 className="text-[15px] font-medium text-blue-900 dark:text-blue-400 mb-6">Recent</h2>

        {/* Notifications List */}
        <div className="flex flex-col">
          {dummyNotifications.length > 0 ? (
            dummyNotifications.map((notif) => (
              <NotificationItem 
                key={notif.id}
                title={notif.title}
                description={notif.description}
                timestamp={notif.timestamp}
              />
            ))
          ) : (
            <div className="py-20 text-center flex flex-col items-center">
              <div className="w-20 h-20 relative mb-4 opacity-20 grayscale">
                <Image src="/logo.png" alt="Kyvatron" fill className="object-contain" />
              </div>
              <p className="text-[15px] font-bold text-gray-900 dark:text-white">All caught up!</p>
              <p className="text-[13px] text-gray-500 dark:text-slate-400">You have no new notifications.</p>
            </div>
          )}
        </div>

        {/* Load More */}
        {dummyNotifications.length > 0 && (
          <div className="mt-4 flex justify-center">
            <button className="flex items-center space-x-2 px-6 py-3 rounded-full bg-slate-50 dark:bg-slate-900 text-blue-600 dark:text-blue-400 text-[14px] font-bold shadow-sm border border-slate-100 dark:border-slate-800 transition hover:bg-slate-100 dark:hover:bg-slate-800">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
              <span>Load more</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
