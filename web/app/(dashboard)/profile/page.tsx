'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '../../../components/Button';
import { User } from '../../../types/database';

const dummyUser: User = {
  id: 'u1',
  name: 'John Doe',
  email: 'john@example.com',
  kycStatus: 'unverified'
};

const PROFILE_LINKS = [
  { id: 'settings', label: 'Settings', href: '/settings', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
  { id: 'referral', label: 'Referral', href: '/referral', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg> },
  { id: 'support', label: 'Support', href: '/support', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg> },
];

export default function ProfilePage() {
  const router = useRouter();

  return (
    <div className="flex flex-col p-4 pt-10 min-h-screen bg-slate-50">
      <header className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Profile Menu</h1>
      </header>

      {/* User Info Card with prominent unverified badge */}
      <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col mb-8 relative overflow-hidden">
        <div className="flex items-center mb-4">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700 text-2xl mr-4 flex-shrink-0 z-10">
            {dummyUser.name.charAt(0)}
          </div>
          <div className="z-10 flex-grow">
            <h2 className="text-[19px] font-bold text-gray-900 leading-tight">{dummyUser.name}</h2>
            <p className="text-sm text-gray-500">{dummyUser.email}</p>
          </div>
        </div>
        
        {/* Prominent KYC Badge mapping to /kyc */}
        <Link href="/kyc" className="w-full bg-red-50 hover:bg-red-100 transition-colors border border-red-100 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
            </div>
            <div>
              <p className="text-[14px] font-bold text-red-700">KYC Status</p>
              <p className="text-[12px] font-medium text-red-500 uppercase tracking-widest mt-0.5">Unverified</p>
            </div>
          </div>
          <span className="text-sm font-semibold text-red-600 bg-white px-3 py-1.5 rounded-full shadow-sm">Verify Now</span>
        </Link>
      </section>

      {/* Profile Links */}
      <section className="bg-white rounded-3xl shadow-sm border border-gray-100 mb-8 overflow-hidden">
        {PROFILE_LINKS.map((link, index) => (
          <Link key={link.id} href={link.href} className={`flex items-center p-4 hover:bg-gray-50 transition-colors ${index !== PROFILE_LINKS.length - 1 ? 'border-b border-gray-50' : ''}`}>
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mr-4">
              {link.icon}
            </div>
            <span className="text-[16px] font-medium text-gray-800 flex-grow">{link.label}</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </Link>
        ))}
      </section>
      
    </div>
  );
}
