'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '../../../../components/Button';
import { Input } from '../../../../components/Input';

export default function SecurityPage() {
  const [email2FA, setEmail2FA] = useState(true);
  const [authApp, setAuthApp] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 relative pb-24">
      {/* Header */}
      <header className="p-4 pt-10 flex items-center justify-between border-b border-gray-100 bg-white shadow-sm relative z-10">
        <Link href="/settings" className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </Link>
        <h1 className="text-lg font-bold text-gray-900 absolute left-1/2 transform -translate-x-1/2">Security & 2FA</h1>
        <div className="w-8"></div> {/* Spacer for center alignment */}
      </header>

      {/* Main Container */}
      <div className="flex-grow p-4 mt-2">
        
        {/* 2FA Toggles Section */}
        <section className="mb-8">
          <h2 className="text-[14px] font-bold text-gray-500 uppercase tracking-wider mb-3 px-2">Two-Factor Authentication</h2>
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            
            {/* Email 2FA Toggle */}
            <div className="flex items-center justify-between p-5 border-b border-gray-50">
              <div>
                <h3 className="text-[16px] font-medium text-gray-900 mb-0.5">Email Verification</h3>
                <p className="text-[13px] text-gray-500">Receive codes via registered email</p>
              </div>
              <button 
                onClick={() => setEmail2FA(!email2FA)}
                className={`w-12 h-6 rounded-full relative transition-colors duration-200 focus:outline-none ${email2FA ? 'bg-blue-600' : 'bg-gray-300'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform duration-200 ${email2FA ? 'translate-x-6.5 left-0.5 shadow-sm' : 'translate-x-0.5 shadow-sm'}`} />
              </button>
            </div>

            {/* Authenticator App Toggle */}
            <div className="flex items-center justify-between p-5">
              <div className="mr-4">
                <h3 className="text-[16px] font-medium text-gray-900 mb-0.5">Authenticator App</h3>
                <p className="text-[13px] text-gray-500">Google Authenticator or similar</p>
              </div>
              <button 
                onClick={() => setAuthApp(!authApp)}
                className={`w-12 h-6 rounded-full relative transition-colors duration-200 focus:outline-none flex-shrink-0 ${authApp ? 'bg-blue-600' : 'bg-gray-300'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform duration-200 ${authApp ? 'translate-x-6.5 left-0.5 shadow-sm' : 'translate-x-0.5 shadow-sm'}`} />
              </button>
            </div>

          </div>
        </section>

        {/* Change Password Form */}
        <section>
          <h2 className="text-[14px] font-bold text-gray-500 uppercase tracking-wider mb-3 px-2">Change Password</h2>
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); console.log("Password updated"); }}>
              <Input 
                type="password" 
                label="Current Password" 
                placeholder="Enter current password" 
                required 
              />
              <Input 
                type="password" 
                label="New Password" 
                placeholder="Must be at least 8 characters" 
                required 
              />
              <Input 
                type="password" 
                label="Confirm New Password" 
                placeholder="Re-enter new password" 
                required 
              />
              <div className="pt-4">
                <Button type="submit" variant="primary" className="w-full">
                  Update Password
                </Button>
              </div>
            </form>
          </div>
        </section>

      </div>

    </div>
  );
}
