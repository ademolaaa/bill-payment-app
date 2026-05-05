'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '../../../components/Button';

export default function ReferralPage() {
  const [referralCode, setReferralCode] = useState('K...');

  useEffect(() => {
    // Generate K + 9 digits
    const generateCode = () => {
      let code = 'K';
      for (let i = 0; i < 9; i++) {
        code += Math.floor(Math.random() * 10).toString();
      }
      return code;
    };
    setReferralCode(generateCode());
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 pb-24">
      {/* Header section */}
      <header className="px-5 pt-12 pb-6 flex items-center justify-between">
        <h1 className="text-[26px] font-bold text-[#0F172A] dark:text-white leading-[1.25] w-[65%]">
          Invite friends to <br/>
          <span className="text-[#0047FF]">Kyvatron</span> to earn a <br/>
          <span className="text-[#16A34A]">10 USDT</span> reward <br/>
          per referral
        </h1>
        <div className="w-[35%] flex justify-end pr-2">
          {/* Placeholder for the gift box graphic */}
          <div className="relative w-[110px] h-[110px]">
             {/* Using a structural div for the graphic area until asset is added */}
             <div className="absolute inset-0 bg-blue-100/50 rounded-2xl flex items-center justify-center overflow-hidden">
               <span className="text-[40px]">🎁</span>
               <div className="absolute bottom-2 left-2 w-8 h-8 bg-[#16A34A] rounded-full flex items-center justify-center border-2 border-white text-white font-bold text-[12px] shadow-sm">₮</div>
             </div>
          </div>
        </div>
      </header>

      <div className="px-5 flex flex-col space-y-4">
        
        {/* Referral Code Card */}
        <div className="bg-white dark:bg-slate-900 p-[18px] rounded-[24px] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-[48px] h-[48px] rounded-full bg-[#F0F5FF] dark:bg-[#1D4ED8]/20 flex items-center justify-center text-[#0047FF] dark:text-blue-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <div>
              <p className="text-[13px] font-medium text-[#475569] dark:text-slate-400 mb-1">Referral Code</p>
              <h2 className="text-[20px] font-bold text-[#0F172A] dark:text-white leading-none">{referralCode}</h2>
            </div>
          </div>
          <Button className="px-5 py-3 rounded-[14px] bg-[#0047FF] hover:bg-blue-700 text-white text-[14px] font-bold flex items-center shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Share
          </Button>
        </div>

        {/* Successful Referrals Card */}
        <Link href="/referral/successful" className="bg-white dark:bg-slate-900 p-[18px] rounded-[24px] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100 dark:border-slate-800 flex items-center space-x-4 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
          <div className="w-[48px] h-[48px] rounded-full bg-[#DCFCE7]/60 dark:bg-[#166534]/30 flex items-center justify-center text-[#16A34A] dark:text-[#22C55E]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <div>
            <p className="text-[13px] font-medium text-[#475569] dark:text-slate-400 mb-1">Successful Referrals</p>
            <h2 className="text-[20px] font-bold text-[#0F172A] dark:text-white leading-none">0</h2>
          </div>
        </Link>

        {/* Total Earnings Card */}
        <div className="bg-white dark:bg-slate-900 p-[18px] rounded-[24px] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100 dark:border-slate-800 flex items-center space-x-4 mb-4">
          <div className="w-[48px] h-[48px] rounded-full bg-[#F0F5FF] dark:bg-[#1D4ED8]/20 flex items-center justify-center text-[#0047FF] dark:text-blue-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <div>
            <p className="text-[13px] font-medium text-[#475569] dark:text-slate-400 mb-1">Total Earnings</p>
            <h2 className="text-[20px] font-bold text-[#0F172A] dark:text-white leading-none">0 USDT</h2>
          </div>
        </div>

        {/* Rules */}
        <div className="bg-[#F8FAFC] dark:bg-slate-800/50 p-6 rounded-[24px] border border-gray-100 dark:border-slate-800 mt-2">
          <div className="flex items-center space-x-2.5 mb-5">
            <div className="text-[#0047FF] dark:text-blue-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-[22px] w-[22px]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" opacity="0.2"/>
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 12l2 2 4-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className="text-[18px] font-bold text-[#0F172A] dark:text-white">Rules</h3>
          </div>
          
          <div className="space-y-0 divide-y divide-gray-200/70 dark:divide-gray-700/50">
            {[
              "Referred users must use your referral code when signing up on Kyvatron",
              "You cannot refer an already existing Kyvatron user",
              "You cannot refer yourself",
              "Referred users must complete KYC verification",
              "Referred users must invest at least 100,000 NGN or 100 USDT"
            ].map((rule, idx) => (
              <div key={idx} className="flex items-start py-3.5 first:pt-0 last:pb-0">
                <div className="w-[26px] h-[26px] rounded-full bg-[#F0F5FF] dark:bg-blue-900/40 text-[#0047FF] dark:text-blue-400 flex items-center justify-center text-[13px] font-bold mt-0.5 mr-3.5 flex-shrink-0">
                  {idx + 1}
                </div>
                <p className="text-[14px] font-medium text-[#475569] dark:text-slate-300 leading-snug">{rule}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
