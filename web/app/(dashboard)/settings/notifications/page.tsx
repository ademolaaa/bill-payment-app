'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface PreferenceItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  isEnabled: boolean;
  onToggle: () => void;
}

const PreferenceItem = ({ icon, title, description, isEnabled, onToggle }: PreferenceItemProps) => (
  <div className="flex items-center justify-between py-4 group">
    <div className="flex items-center space-x-4">
      <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div>
        <h4 className="text-[15px] font-bold text-gray-900 dark:text-white mb-0.5">{title}</h4>
        <p className="text-[12px] text-gray-500 dark:text-slate-400 leading-snug max-w-[200px] sm:max-w-xs">{description}</p>
      </div>
    </div>
    <button 
      onClick={onToggle}
      aria-label={`Toggle ${title}`}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isEnabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-slate-700'}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  </div>
);

export default function NotificationPreferencesPage() {
  const router = useRouter();
  
  const [prefs, setPrefs] = useState({
    accountAlerts: true,
    transactions: true,
    investments: true,
    promotions: true,
    security: true,
    email: true,
    push: false,
    sms: false
  });

  const toggle = (key: keyof typeof prefs) => {
    setPrefs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 pb-10">
      {/* Header */}
      <header className="p-4 pt-12 flex flex-col relative bg-white dark:bg-slate-900 mb-2 rounded-b-[32px] shadow-sm">
        <div className="flex items-center mb-6">
          <button onClick={() => router.back()} title="Go Back" aria-label="Go Back" className="p-2 border border-gray-100 dark:border-slate-800 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors bg-white dark:bg-slate-900 shadow-sm mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-900 dark:text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h1 className="text-[22px] font-bold text-gray-900 dark:text-white">Notification Preferences</h1>
        </div>
        <p className="text-[14px] text-gray-500 dark:text-slate-400 leading-relaxed max-w-sm px-2 mb-4">
          Choose what you want to be notified about and how you want to receive notifications.
        </p>
      </header>

      <div className="p-5 space-y-6">
        {/* Preference Section */}
        <section>
          <h3 className="text-[16px] font-bold text-gray-900 dark:text-white mb-4 px-1">Notification Preferences</h3>
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-2 px-5 shadow-sm border border-gray-100 dark:border-slate-800 divide-y divide-gray-50 dark:divide-slate-800">
            <PreferenceItem 
              title="Account Alerts"
              description="Get notified about important changes to your account."
              isEnabled={prefs.accountAlerts}
              onToggle={() => toggle('accountAlerts')}
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>}
            />
            <PreferenceItem 
              title="Transaction Notifications"
              description="Receive alerts for deposits, withdrawals and transfers."
              isEnabled={prefs.transactions}
              onToggle={() => toggle('transactions')}
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>}
            />
            <PreferenceItem 
              title="Investment Updates"
              description="Stay updated on your investments and portfolio performance."
              isEnabled={prefs.investments}
              onToggle={() => toggle('investments')}
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
            />
            <PreferenceItem 
              title="Promotions & Offers"
              description="Receive updates about new products, features and special offers."
              isEnabled={prefs.promotions}
              onToggle={() => toggle('promotions')}
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>}
            />
            <PreferenceItem 
              title="Security Alerts"
              description="Get notified about login attempts and security-related activities."
              isEnabled={prefs.security}
              onToggle={() => toggle('security')}
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>}
            />
          </div>
        </section>

        {/* Delivery Channels */}
        <section>
          <h3 className="text-[16px] font-bold text-gray-900 dark:text-white mb-4 px-1">Delivery Channels</h3>
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-2 px-5 shadow-sm border border-gray-100 dark:border-slate-800 divide-y divide-gray-50 dark:divide-slate-800">
            <PreferenceItem 
              title="Email"
              description="Receive notifications via email"
              isEnabled={prefs.email}
              onToggle={() => toggle('email')}
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
            />
            <PreferenceItem 
              title="Push Notifications"
              description="Receive notifications on this device"
              isEnabled={prefs.push}
              onToggle={() => toggle('push')}
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>}
            />
            <PreferenceItem 
              title="SMS"
              description="Receive notifications via SMS"
              isEnabled={prefs.sms}
              onToggle={() => toggle('sms')}
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>}
            />
          </div>
        </section>

        {/* Info */}
        <div className="flex items-start space-x-2 px-2 py-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-[12px] text-gray-500 dark:text-slate-400 italic">
            You can manage your notification settings at any time.
          </p>
        </div>
      </div>
    </div>
  );
}
