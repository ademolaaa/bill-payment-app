'use client';

import React from 'react';
import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-slate-900 relative pb-24">
      {/* Header */}
      <header className="p-4 pt-10 flex items-center justify-between border-b border-gray-100 bg-white dark:bg-slate-900 sticky top-0 z-10">
        <Link href="/settings" className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:bg-slate-800 transition-colors cursor-pointer">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-900 dark:text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </Link>
        <h1 className="text-lg font-bold text-gray-900 dark:text-white absolute left-1/2 transform -translate-x-1/2">Terms of Use</h1>
        <div className="w-8"></div>
      </header>

      <div className="flex-grow p-6 prose prose-sm text-gray-600 max-w-none">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-slate-700 mb-6">Last Updated: October 2026</p>
        
        <h2 className="text-[17px] font-bold text-gray-900 dark:text-white mb-2">1. Acceptance of Terms</h2>
        <p className="mb-6 leading-relaxed">
          By creating an account, accessing or using the services provided by our application, you agree to comply with and be bound by these Terms of Use. If you do not agree with any part of these terms, you must not use our services.
        </p>

        <h2 className="text-[17px] font-bold text-gray-900 dark:text-white mb-2">2. Eligibility and KYC</h2>
        <p className="mb-6 leading-relaxed">
          You must provide accurate and complete personal data during your KYC (Know Your Customer) registration. We reserve the right to suspend or terminate accounts that provide false, misleading, or fraudulent information.
        </p>

        <h2 className="text-[17px] font-bold text-gray-900 dark:text-white mb-2">3. Service Disruptions</h2>
        <p className="mb-6 leading-relaxed">
          While we strive for 99.9% uptime, bill payments and transfers rely on third-party banking/telecommunication networks. We are not liable for delayed transactions caused by provider downtime.
        </p>
        
        <h2 className="text-[17px] font-bold text-gray-900 dark:text-white mb-2">4. Account Security</h2>
        <p className="mb-6 leading-relaxed">
          You are entirely responsible for maintaining the confidentiality of your PIN, password, and Two-Factor Authentication (2FA) credentials. Any action taken using your account is deemed authorized by you.
        </p>
      </div>
    </div>
  );
}
