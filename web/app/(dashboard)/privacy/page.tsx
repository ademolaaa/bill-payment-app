'use client';

import React from 'react';
import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-slate-900 relative pb-24">
      {/* Header */}
      <header className="p-4 pt-10 flex items-center justify-between border-b border-gray-100 bg-white dark:bg-slate-900 sticky top-0 z-10">
        <Link href="/settings" className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:bg-slate-800 transition-colors cursor-pointer">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-800 dark:text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </Link>
        <h1 className="text-lg font-bold text-gray-900 dark:text-white absolute left-1/2 transform -translate-x-1/2">Privacy Policy</h1>
        <div className="w-8"></div>
      </header>

      <div className="flex-grow p-6 prose prose-sm text-gray-600 max-w-none">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500 mb-6">Last Updated: October 2026</p>
        
        <h2 className="text-[17px] font-bold text-gray-900 dark:text-white mb-2">1. Data Collection</h2>
        <p className="mb-6 leading-relaxed">
          We collect personal information necessary to provide you with secure financial services. This includes your name, email address, phone number, government-issued identification (BVN/NIN), and transaction history.
        </p>

        <h2 className="text-[17px] font-bold text-gray-900 dark:text-white mb-2">2. Data Usage</h2>
        <p className="mb-6 leading-relaxed">
          Your data is used strictly for identity verification, transaction processing, fraud prevention, and customer support. We do not sell your personal data to third-party marketing companies.
        </p>

        <h2 className="text-[17px] font-bold text-gray-900 dark:text-white mb-2">3. Data Sharing</h2>
        <p className="mb-6 leading-relaxed">
          We may share your data with trusted third-party partners (such as payment gateways and identity verification providers) strictly for the purpose of executing the services you request. All partners are bound by strict non-disclosure obligations.
        </p>
        
        <h2 className="text-[17px] font-bold text-gray-900 dark:text-white mb-2">4. Your Rights</h2>
        <p className="mb-6 leading-relaxed">
          Under the Data Protection Act, you have the right to request access to, correction of, or deletion of your personal data. You can initiate a deletion request from the Settings menu.
        </p>
      </div>
    </div>
  );
}
