'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User } from '../../../types/database';

import { supabase } from '../../../lib/supabase/client';

// ── Profile menu items ────────────────────────────────────────────────────────
const PROFILE_LINKS = [
  {
    id: 'settings',
    label: 'Settings',
    href: '/settings',
    bg: 'bg-blue-50',
    color: 'text-blue-600',
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  },
  {
    id: 'statement',
    label: 'Transaction Statement',
    href: '/history',
    bg: 'bg-green-50',
    color: 'text-green-600',
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  },
  {
    id: 'security',
    label: 'Security & Biometrics',
    href: '/settings/security',
    bg: 'bg-purple-50',
    color: 'text-purple-600',
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>,
  },
  {
    id: 'theme',
    label: 'Theme Settings',
    href: '/settings/theme',
    bg: 'bg-blue-50',
    color: 'text-blue-600',
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>,
  },
  {
    id: 'bank',
    label: 'Linked Bank Accounts',
    href: '/settings',
    bg: 'bg-yellow-50',
    color: 'text-yellow-600',
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>,
  },
  {
    id: 'notifications',
    label: 'Notification Preferences',
    href: '/notifications',
    bg: 'bg-orange-50',
    color: 'text-orange-600',
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>,
  },
  {
    id: 'referral',
    label: 'Referral',
    href: '/referral',
    bg: 'bg-teal-50',
    color: 'text-teal-600',
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  },
  {
    id: 'support',
    label: 'Support',
    href: '/support',
    bg: 'bg-slate-50',
    color: 'text-slate-600',
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  },
];

export default function ProfilePage() {
  const router = useRouter();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  React.useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserName(user.user_metadata?.full_name || 'User');
        setUserEmail(user.email || '');
        setUserId(user.id.substring(0, 8)); // Just show first 8 chars of UUID
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="flex flex-col p-4 pt-10 min-h-screen bg-slate-50 dark:bg-slate-950 pb-28">

      <header className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile</h1>
      </header>

      {/* ── Avatar + User Info Card ──────────────────────────────────────── */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col mb-5">

        {/* Avatar row */}
        <div className="flex items-center mb-5">
          {/* Avatar with camera edit overlay */}
          <div className="relative mr-4 flex-shrink-0">
            <div className="w-[70px] h-[70px] rounded-full bg-gray-100 dark:bg-slate-800 border-2 border-gray-200 flex items-center justify-center overflow-hidden">
              {/* User silhouette SVG */}
              <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-gray-600 dark:text-slate-700" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
              </svg>
            </div>
            {/* Camera icon overlay */}
            <button
              aria-label="Change profile photo"
              className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center shadow-md border-2 border-white hover:bg-blue-700 transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          {/* Name + email */}
          <div className="flex-grow min-w-0">
            <h2 className="text-[19px] font-bold text-gray-900 dark:text-white leading-tight truncate">{userName}</h2>
            <p className="text-sm text-gray-700 dark:text-slate-600 truncate">{userEmail}</p>
            <span className="inline-block mt-1.5 text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              ID: {userId.toUpperCase()}
            </span>
          </div>
        </div>

        {/* KYC Badge */}
        <Link
          href="/kyc"
          className="w-full bg-red-50 hover:bg-red-100 transition-colors border border-red-100 rounded-2xl p-4 flex items-center justify-between"
        >
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-full bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-[14px] font-bold text-red-700">KYC Status: <span className="uppercase tracking-wider">Unverified</span></p>
              {/* Contextual description */}
              <p className="text-[12px] text-red-500 mt-0.5 leading-snug">
                Verify your identity to unlock withdrawals and higher limits.
              </p>
            </div>
          </div>
          <span className="text-sm font-semibold text-red-600 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-full shadow-sm ml-3 whitespace-nowrap flex-shrink-0">
            Verify Now
          </span>
        </Link>
      </section>

      {/* ── Profile Links ─────────────────────────────────────────────────── */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
        {PROFILE_LINKS.map((link, index) => (
          <Link
            key={link.id}
            href={link.href}
            className={`flex items-center p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors ${index !== PROFILE_LINKS.length - 1 ? 'border-b border-gray-50' : ''}`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 flex-shrink-0 ${link.bg} ${link.color}`}>
              {link.icon}
            </div>
            <span className="text-[15px] font-medium text-gray-900 dark:text-slate-200 flex-grow">{link.label}</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        ))}
      </section>

      {/* ── Log Out Button ────────────────────────────────────────────────── */}
      <button
        onClick={() => setShowLogoutConfirm(true)}
        className="w-full bg-white dark:bg-slate-900 border border-red-100 rounded-2xl p-4 flex items-center justify-center space-x-2 text-red-600 font-bold text-[16px] shadow-sm hover:bg-red-50 active:scale-[0.98] transition-all duration-150"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        <span>Log Out</span>
      </button>

      {/* App version */}
      <p className="text-center text-[11px] text-gray-300 font-medium mt-5">App Version 1.0.0</p>

      {/* ── Logout Confirmation Modal ─────────────────────────────────────── */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowLogoutConfirm(false)} />
          <div className="bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl p-6 w-full max-w-sm relative z-10">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center text-red-600 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Log Out?</h3>
              <p className="text-sm text-gray-700 dark:text-slate-600 mt-1">You will need to sign back in to access your account.</p>
            </div>
            <div className="flex flex-col space-y-3">
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl py-4 text-[15px] transition-colors active:scale-95"
              >
                {isLoggingOut ? 'Logging Out...' : 'Yes, Log Me Out'}
              </button>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="w-full bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 text-gray-900 dark:text-slate-200 font-bold rounded-2xl py-4 text-[15px] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
