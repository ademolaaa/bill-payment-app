'use client';

import React from 'react';
import { Button } from '../../../components/Button';

export default function ReferralPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white pb-24">
      {/* Header text */}
      <header className="px-5 pt-16 pb-6">
        <h1 className="text-[28px] font-bold text-gray-900 leading-tight pr-4">
          Invite friends to Kyvatron <br/>to earn a 10 USDT reward <br/>per referral
        </h1>
      </header>

      <div className="px-5">
        
        {/* Referral Code Field */}
        <div className="flex items-center justify-between bg-white shadow-sm border border-gray-200 rounded-2xl p-[6px] pl-4 mb-8">
          <span className="text-[16px] font-bold text-gray-900">X8Y7Z6W5</span>
          <Button className="w-auto px-6 py-2.5 rounded-[8px]">Share</Button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8 border-b border-gray-100 pb-8">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-[15px] font-medium text-gray-500 mb-1">Successful Referrals</p>
            <h2 className="text-[28px] font-bold text-gray-900">3</h2>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 text-right flex flex-col justify-end">
            <h2 className="text-[28px] font-bold text-gray-900">₦45,000</h2>
            <p className="text-[14px] font-medium text-gray-500">Total Earnings</p>
          </div>
        </div>

        <div className="mb-10">
          <h3 className="text-[17px] font-bold text-gray-900 mb-4">Rules</h3>
          <ol className="list-decimal pl-5 space-y-3 text-[15px] text-gray-500 leading-relaxed">
            <li className="pl-1">Referred users must use your Referral Code when signing up on Kyvatron</li>
            <li className="pl-1">You cannot refer an already existing Kyvatron user</li>
            <li className="pl-1">You cannot refer yourself</li>
            <li className="pl-1">Referred users must complete KYC verification</li>
            <li className="pl-1">Referred users must invest at least 100,000 NGN or 100 USDT</li>
          </ol>
        </div>

        {/* Action Button */}
        <div className="mb-8">
          <Button variant="outline" className="w-full font-bold py-4 rounded-[12px]">Proceed</Button>
        </div>

      </div>
    </div>
  );
}
