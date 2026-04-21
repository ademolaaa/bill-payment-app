'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '../../../components/Button';

const SETTINGS_LINKS = [
  { id: 'profile', label: 'Profile Settings', href: '/settings/profile', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> },
  { id: 'theme', label: 'Theme Settings', href: '/settings/theme', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg> },
  { id: 'security', label: 'Security & 2FA', href: '/settings/security', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg> },
  { id: 'kyc', label: 'KYC Verification', href: '/kyc', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
  { id: 'terms', label: 'Terms of Use', href: '/terms', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg> },
  { id: 'privacy', label: 'Privacy Policy', href: '/privacy', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" /></svg> },
];

export default function SettingsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 relative pb-24">
      {/* Header */}
      <header className="p-4 pt-10 flex items-center justify-between border-b border-gray-100 bg-white shadow-sm relative z-10">
        <Link href="/profile" className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </Link>
        <h1 className="text-lg font-bold text-gray-900 absolute left-1/2 transform -translate-x-1/2">Settings</h1>
        <div className="w-8"></div> {/* Spacer for center alignment */}
      </header>

      {/* Main Container */}
      <div className="flex-grow p-4 mt-2">
        <section className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          {SETTINGS_LINKS.map((link, index) => (
            <Link key={link.id} href={link.href} className={`flex items-center p-4 hover:bg-gray-50 transition-colors ${index !== SETTINGS_LINKS.length - 1 ? 'border-b border-gray-50' : ''}`}>
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mr-4">
                {link.icon}
              </div>
              <span className="text-[16px] font-medium text-gray-800 flex-grow">{link.label}</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </Link>
          ))}
        </section>

        {/* Delete Account */}
        <section className="mt-8">
          <Link href="/settings/delete-account" className="block w-full">
            <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 pointer-events-none">
              Delete Account
            </Button>
          </Link>
          <p className="text-xs text-gray-400 text-center mt-3 px-4">
            This action is permanent and will completely erase all your data.
          </p>
        </section>
      </div>

    </div>
  );
}
