'use client';

import React from 'react';
import Link from 'next/link';

export default function SuccessfulReferralsPage() {
  const referrals = [
    { initials: 'AM', name: 'Adewale M.', joined: 'May 12, 2024', investment: 'May 15, 2024' },
    { initials: 'BK', name: 'Blessing K.', joined: 'May 10, 2024', investment: 'May 13, 2024' },
    { initials: 'CS', name: 'Chinedu S.', joined: 'May 08, 2024', investment: 'May 10, 2024' },
    { initials: 'EO', name: 'Esther O.', joined: 'May 05, 2024', investment: 'May 07, 2024' },
    { initials: 'FM', name: 'Femi M.', joined: 'May 01, 2024', investment: 'May 03, 2024' },
    { initials: 'GO', name: 'Grace O.', joined: 'Apr 28, 2024', investment: 'Apr 30, 2024' },
    { initials: 'IH', name: 'Ibrahim H.', joined: 'Apr 25, 2024', investment: 'Apr 27, 2024' },
    { initials: 'JN', name: 'Joy N.', joined: 'Apr 20, 2024', investment: 'Apr 22, 2024' },
    { initials: 'KA', name: 'Kingsley A.', joined: 'Apr 18, 2024', investment: 'Apr 20, 2024' },
    { initials: 'LO', name: 'Lucy O.', joined: 'Apr 15, 2024', investment: 'Apr 17, 2024' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 pb-24">
      <header className="p-4 pt-10 flex items-center justify-between border-b border-gray-100 bg-white dark:bg-slate-900 shadow-sm relative z-10">
        <Link href="/referral" className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:bg-slate-800 transition-colors cursor-pointer">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-800 dark:text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </Link>
        <h1 className="text-[17px] font-bold text-gray-900 dark:text-white absolute left-1/2 transform -translate-x-1/2">Successful Referrals</h1>
        <div className="w-8"></div>
      </header>

      <div className="p-4 mt-2">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-sm border border-gray-100 flex items-center space-x-4 mb-6">
          <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 relative">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
            </div>
          </div>
          <div>
            <p className="text-[13px] font-medium text-gray-500 dark:text-slate-400 mb-0.5">Total Successful Referrals</p>
            <h2 className="text-[28px] font-bold text-blue-600">18</h2>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-3 gap-2 p-4 border-b border-gray-50">
            <span className="text-[12px] font-medium text-gray-500 dark:text-slate-400 col-span-1">Referee</span>
            <span className="text-[12px] font-medium text-gray-500 dark:text-slate-400 text-center col-span-1">Joined Date</span>
            <span className="text-[12px] font-medium text-gray-500 dark:text-slate-400 text-right col-span-1">Investment Date</span>
          </div>
          
          <div className="flex flex-col divide-y divide-gray-50">
            {referrals.map((ref, idx) => (
              <div key={idx} className="grid grid-cols-3 gap-2 p-4 items-center">
                <div className="flex items-center space-x-2 col-span-1">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px] font-bold flex-shrink-0">
                    {ref.initials}
                  </div>
                  <span className="text-[13px] font-bold text-gray-900 dark:text-white truncate">{ref.name}</span>
                </div>
                <div className="text-[12px] font-medium text-gray-600 text-center col-span-1">
                  {ref.joined}
                </div>
                <div className="text-[12px] font-medium text-gray-600 text-right col-span-1">
                  {ref.investment}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
