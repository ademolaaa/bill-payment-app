'use client';

import React from 'react';
import Link from 'next/link';

export default function WithdrawPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 pb-24">
      <header className="px-5 pt-12 pb-4 border-b border-gray-100 bg-white dark:bg-slate-900">
        <h1 className="text-[24px] font-bold text-gray-900 dark:text-white">Withdraw</h1>
        <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">Send funds to your local bank or crypto wallet</p>
      </header>

      <div className="px-5 pt-6 flex flex-col space-y-8">
        
        <div>
          <h2 className="text-[15px] font-bold text-gray-900 dark:text-white mb-3 ml-1">External Transfer</h2>
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            
            <Link href="/withdraw/bank-transfer" className="flex items-center p-4 hover:bg-gray-50 dark:bg-slate-800 transition-colors border-b border-gray-50">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" /></svg>
              </div>
              <div className="flex-grow">
                <h3 className="text-[15px] font-bold text-gray-900 dark:text-white">Bank Transfer</h3>
                <p className="text-[12px] text-gray-500 dark:text-slate-400 mt-0.5">Withdraw to your local bank account</p>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </Link>

            <Link href="/withdraw/crypto-transfer" className="flex items-center p-4 hover:bg-gray-50 dark:bg-slate-800 transition-colors">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <div className="flex-grow">
                <h3 className="text-[15px] font-bold text-gray-900 dark:text-white">Cryptocurrency (USDT TRC20)</h3>
                <p className="text-[12px] text-gray-500 dark:text-slate-400 mt-0.5">Withdraw to external USDT wallet</p>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </Link>

          </div>
        </div>

      </div>
    </div>
  );
}
