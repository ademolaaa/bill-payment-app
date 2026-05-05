'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '../../../../components/Button';

export default function CryptoTransferPage() {
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');

  const numAmount = parseFloat(amount) || 0;
  const fees = numAmount > 0 ? 1 : 0; // Flat 1 USDT network fee for example
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
          USDT (TRC20) Transfer
        </h1>
      </header>

      <div className="px-5 flex flex-col space-y-6">
        
        {/* Subtitle */}
        <p className="text-[15px] text-[#475569] dark:text-slate-400 leading-relaxed pr-2">
          Initiate a withdrawal to an external<br/>USDT (TRC20) wallet address.
        </p>

        {/* Form Container */}
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[20px] p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] space-y-5">
          
          {/* Wallet Address */}
          <div>
            <label className="block text-[15px] font-bold text-[#0F172A] dark:text-white mb-2">Wallet Address</label>
            <div className="relative flex items-center">
              <div className="absolute left-4 flex items-center justify-center text-[#0047FF] dark:text-blue-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <input 
                type="text"
                placeholder="Paste wallet address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl py-3.5 pl-[46px] pr-4 text-[15px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow text-[#0F172A] dark:text-white placeholder-gray-400"
              />
            </div>
          </div>

          {/* Network */}
          <div>
            <label className="block text-[15px] font-bold text-[#0F172A] dark:text-white mb-2">Network</label>
            <div className="flex items-center justify-between bg-[#F8FAFC] dark:bg-slate-800 border border-transparent dark:border-slate-700 rounded-2xl p-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center shadow-[0_1px_3px_rgba(0,0,0,0.1)]">
                  {/* TRON Icon */}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L2 22L12 18L22 22L12 2Z" stroke="#EF4444" strokeWidth="2" strokeLinejoin="round"/>
                    <path d="M2 22L12 18V2L2 22Z" fill="#EF4444" fillOpacity="0.2"/>
                  </svg>
                </div>
                <span className="text-[15px] font-medium text-[#0F172A] dark:text-white">TRON (TRC20)</span>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-[15px] font-bold text-[#0F172A] dark:text-white mb-2">Amount</label>
            <div className="relative flex items-center">
              <div className="absolute left-0 pl-4 pr-3 border-r border-gray-200 dark:border-slate-700 flex items-center justify-center text-[#0F172A] dark:text-white font-bold h-[24px]">
                $
              </div>
              <input 
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl py-3.5 pl-[52px] pr-4 text-[15px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow text-[#0F172A] dark:text-white placeholder-gray-400"
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
              ${numAmount.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})}
            </span>
          </div>
          
          <div className="flex justify-between items-center mb-4">
            <span className="text-[14px] text-[#475569] dark:text-slate-400">Fees</span>
            <span className="text-[14px] text-[#475569] dark:text-slate-400">
              ${fees.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})}
            </span>
          </div>
          
          <div className="h-[1px] bg-gray-200/70 dark:bg-slate-700 w-full mb-4"></div>
          
          <div className="flex justify-between items-center">
            <span className="text-[14px] font-bold text-[#0F172A] dark:text-white">Final Amount</span>
            <span className="text-[14px] font-bold text-[#0F172A] dark:text-white">
              ${finalAmount.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})}
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
