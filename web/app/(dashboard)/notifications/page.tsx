'use client';

import React from 'react';
import { NotificationItem } from '../../../components/NotificationItem';

const dummyNotifications = [
  {
    id: 'n1',
    title: 'Welcome to Jovico!',
    description: 'We are thrilled to have you onboard. Start by funding your wallet to unlock all features.',
    timestamp: 'Just now'
  },
  {
    id: 'n2',
    title: 'New Login Alert',
    description: 'A new login was detected from Chrome on Windows.',
    timestamp: '2h ago'
  },
  {
    id: 'n3',
    title: 'Deposit Confirmation',
    description: 'You successfully deposited ₦150,000.00 into your account.',
    timestamp: '5h ago'
  },
  {
    id: 'n4',
    title: 'Card Linked',
    description: 'Your Mastercard ending in **4599 has been successfully linked securely.',
    timestamp: 'Yesterday'
  }
];

export default function NotificationsPage() {
  return (
    <div className="flex flex-col p-6 min-h-screen bg-white dark:bg-slate-900">
      {/* Header */}
      <header className="mb-6 mt-10">
        <h1 className="text-3xl font-bold text-black dark:text-white">Notifications</h1>
      </header>

      {/* Notifications List */}
      <div className="flex flex-col">
        {dummyNotifications.map((notif) => (
          <NotificationItem 
            key={notif.id}
            title={notif.title}
            description={notif.description}
            timestamp={notif.timestamp}
          />
        ))}
      </div>
    </div>
  );
}
