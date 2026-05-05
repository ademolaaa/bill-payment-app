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
    <div className="flex flex-col min-h-screen bg-white dark:bg-slate-950 pb-24">
      {/* Header section */}
      <header className="px-5 pt-12 pb-6 flex items-center justify-between bg-white dark:bg-slate-950 sticky top-0 z-10">
        <Link href="/referral" className="mr-4 text-[#0F172A] dark:text-white">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <h1 className="text-[20px] font-bold text-[#0F172A] dark:text-white absolute left-1/2 transform -translate-x-1/2">
          Successful Referrals
        </h1>
        <div className="w-6"></div>
      </header>

      <div className="flex flex-col mt-2">
        
        {/* Top Card */}
        <div className="bg-[#F8FAFC] dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-5 rounded-[24px] flex items-center space-x-5 mb-6 mx-5">
          <div className="w-[56px] h-[56px] rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-[#0047FF] dark:text-blue-400 relative shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] border border-gray-50 dark:border-slate-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-[28px] w-[28px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <div className="absolute bottom-0 right-0 w-[20px] h-[20px] bg-[#22C55E] rounded-full border-[3px] border-[#F8FAFC] dark:border-slate-900 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-[10px] w-[10px] text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <div>
            <p className="text-[14px] font-medium text-[#475569] dark:text-slate-400 mb-0.5">Total Successful Referrals</p>
            <h2 className="text-[32px] font-bold text-[#0047FF] dark:text-blue-400 leading-none mt-1">18</h2>
          </div>
        </div>

        {/* Referrals List */}
        <div className="mx-5">
          <div className="bg-[#F8FAFC] dark:bg-slate-800 rounded-t-[16px] px-4 py-4 grid grid-cols-[1.5fr_1fr_1fr] gap-2 items-center">
            <span className="text-[13px] font-medium text-[#64748B] dark:text-slate-400">Referee</span>
            <span className="text-[13px] font-medium text-[#64748B] dark:text-slate-400 text-center">Joined Date</span>
            <span className="text-[13px] font-medium text-[#64748B] dark:text-slate-400 text-right">Investment Date</span>
          </div>
          
          <div className="flex flex-col divide-y divide-gray-100 dark:divide-slate-800 bg-white dark:bg-slate-900 border border-t-0 border-gray-100 dark:border-slate-800 rounded-b-[16px]">
            {referrals.map((ref, idx) => (
              <div key={idx} className="grid grid-cols-[1.5fr_1fr_1fr] gap-2 p-4 items-center hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-[38px] h-[38px] rounded-full bg-[#0047FF] text-white flex items-center justify-center text-[13px] font-bold flex-shrink-0 shadow-sm">
                    {ref.initials}
                  </div>
                  <span className="text-[14px] font-medium text-[#0F172A] dark:text-white truncate">{ref.name}</span>
                </div>
                <div className="text-[13px] font-medium text-[#475569] dark:text-slate-300 text-center">
                  {ref.joined}
                </div>
                <div className="text-[13px] font-medium text-[#475569] dark:text-slate-300 text-right">
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
