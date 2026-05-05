'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '../../../../components/Button';

export default function BankTransferPage() {
  const [amount, setAmount] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');

  const numAmount = parseFloat(amount) || 0;
  const fees = numAmount > 0 ? 50 : 0; // Flat ₦50 fee for example
  const finalAmount = Math.max(0, numAmount - fees);

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-slate-950 pb-24">
      {/* Header section */}
      <header className="px-5 pt-12 pb-6 flex items-center bg-white dark:bg-slate-950 sticky top-0 z-10">
        <Link href="/withdraw" className="mr-4 text-[#0F172A] dark:text-white">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <h1 className="text-[20px] font-bold text-[#0F172A] dark:text-white flex-1 text-center pr-10">
          Bank Transfer
        </h1>
      </header>

      <div className="px-5 flex flex-col space-y-6">
        
        {/* Subtitle */}
        <p className="text-[15px] text-[#475569] dark:text-slate-400 leading-relaxed pr-2">
          Initiate a withdrawal to a bank account with the same name on your Kyvatron account.
        </p>

        {/* Form Container */}
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[20px] p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] space-y-5">
          
          {/* Bank Name */}
          <div>
            <label className="block text-[15px] font-bold text-[#0F172A] dark:text-white mb-2">Bank Name</label>
            <div className="relative flex items-center">
              <div className="absolute left-3 w-8 h-8 rounded-lg bg-[#F0F5FF] dark:bg-[#1D4ED8]/20 flex items-center justify-center text-[#0047FF] dark:text-blue-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                </svg>
              </div>
              <input 
                type="text"
                placeholder="Enter bank name"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl py-3.5 pl-[56px] pr-4 text-[15px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow text-[#0F172A] dark:text-white placeholder-gray-400"
              />
            </div>
          </div>

          {/* Account Number */}
          <div>
            <label className="block text-[15px] font-bold text-[#0F172A] dark:text-white mb-2">Account Number</label>
            <div className="relative flex items-center">
              <div className="absolute left-3 w-8 h-8 rounded-lg bg-[#F0F5FF] dark:bg-[#1D4ED8]/20 flex items-center justify-center text-[#0047FF] dark:text-blue-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <input 
                type="number"
                placeholder="Enter account number"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl py-3.5 pl-[56px] pr-4 text-[15px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow text-[#0F172A] dark:text-white placeholder-gray-400"
              />
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-[15px] font-bold text-[#0F172A] dark:text-white mb-2">Amount</label>
            <div className="relative flex items-center">
              <div className="absolute left-3 w-8 h-8 rounded-lg bg-[#F0F5FF] dark:bg-[#1D4ED8]/20 flex items-center justify-center text-[#0047FF] dark:text-blue-400">
                <span className="font-bold text-[14px]">₦</span>
              </div>
              <input 
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl py-3.5 pl-[56px] pr-4 text-[15px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow text-[#0F172A] dark:text-white placeholder-gray-400"
              />
            </div>
          </div>

        </div>

        {/* Preview Container */}
        <div className="bg-[#F8FAFC] dark:bg-slate-800/50 rounded-[20px] p-5 border border-gray-50 dark:border-slate-800">
          <h3 className="text-[16px] font-bold text-[#0F172A] dark:text-white mb-4">External Transfer Preview</h3>
          
          <div className="flex justify-between items-center mb-3">
            <span className="text-[14px] text-[#475569] dark:text-slate-400">Initial Amount</span>
            <span className="text-[14px] text-[#475569] dark:text-slate-400">
              ₦{numAmount.toLocaleString('en-NG', {minimumFractionDigits:2, maximumFractionDigits:2})}
            </span>
          </div>
          
          <div className="flex justify-between items-center mb-4">
            <span className="text-[14px] text-[#475569] dark:text-slate-400">Fees</span>
            <span className="text-[14px] text-[#475569] dark:text-slate-400">
              ₦{fees.toLocaleString('en-NG', {minimumFractionDigits:2, maximumFractionDigits:2})}
            </span>
          </div>
          
          <div className="h-[1px] bg-gray-200/70 dark:bg-slate-700 w-full mb-4"></div>
          
          <div className="flex justify-between items-center">
            <span className="text-[14px] font-bold text-[#0F172A] dark:text-white">Final Amount</span>
            <span className="text-[14px] font-bold text-[#0F172A] dark:text-white">
              ₦{finalAmount.toLocaleString('en-NG', {minimumFractionDigits:2, maximumFractionDigits:2})}
            </span>
          </div>
        </div>

        {/* Confirm Button */}
        <div className="pt-2">
          <Button className="w-full rounded-[14px] bg-[#0047FF] hover:bg-blue-700 py-4 text-[16px] font-bold flex items-center justify-center shadow-md">
            Confirm
          </Button>
        </div>

      </div>
    </div>
  );
}
