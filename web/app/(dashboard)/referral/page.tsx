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
      <header className="px-5 pt-12 pb-6">
        <h1 className="text-[28px] font-bold text-gray-900 dark:text-white leading-tight pr-4">
          Invite friends to <br/>Kyvatron to earn a <br/><span className="text-emerald-600">10 USDT</span> reward <br/>per referral
        </h1>
      </header>

      <div className="px-5 flex flex-col space-y-4">
        
        {/* Referral Code Card */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
            </div>
            <div>
              <p className="text-[13px] font-medium text-gray-700 dark:text-slate-600 mb-0.5">Referral Code</p>
              <h2 className="text-[18px] font-bold text-gray-900 dark:text-white">{referralCode}</h2>
            </div>
          </div>
          <Button className="px-5 py-2 rounded-xl text-[14px]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
            Share
          </Button>
        </div>

        {/* Successful Referrals Card */}
        <Link href="/referral/successful" className="bg-white dark:bg-slate-900 p-4 rounded-3xl shadow-sm border border-gray-100 flex items-center space-x-3 hover:bg-gray-50 transition-colors">
          <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
          </div>
          <div>
            <p className="text-[13px] font-medium text-gray-700 dark:text-slate-600 mb-0.5">Successful Referrals</p>
            <h2 className="text-[18px] font-bold text-gray-900 dark:text-white">0</h2>
          </div>
        </Link>

        {/* Total Earnings Card */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl shadow-sm border border-gray-100 flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
          </div>
          <div>
            <p className="text-[13px] font-medium text-gray-700 dark:text-slate-600 mb-0.5">Total Earnings</p>
            <h2 className="text-[18px] font-bold text-gray-900 dark:text-white">0 USDT</h2>
          </div>
        </div>

        {/* Rules */}
        <div className="bg-blue-50/50 p-5 rounded-3xl border border-blue-100">
          <div className="flex items-center space-x-2 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.95 11.95 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            <h3 className="text-[16px] font-bold text-gray-900 dark:text-white">Rules</h3>
          </div>
          
          <div className="space-y-4">
            {[
              "Referred users must use your referral code when signing up on Kyvatron",
              "You cannot refer an already existing Kyvatron user",
              "You cannot refer yourself",
              "Referred users must complete KYC verification",
              "Referred users must invest at least 100,000 NGN or 100 USDT"
            ].map((rule, idx) => (
              <div key={idx} className="flex items-start">
                <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[11px] font-bold mt-0.5 mr-3 flex-shrink-0">
                  {idx + 1}
                </div>
                <p className="text-[14px] text-gray-600 leading-snug">{rule}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
