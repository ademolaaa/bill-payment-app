'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '../../../components/Button';

export default function WithdrawPage() {
  const [currency, setCurrency] = useState<'NGN' | 'USDT'>('NGN');
  const [amount, setAmount] = useState('');
  const [email, setEmail] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Calculate preview values
  const numAmount = parseFloat(amount) || 0;
  const fees = 0; // Internal transfers usually have 0 fees
  const finalAmount = numAmount - fees > 0 ? numAmount - fees : 0;
  
  const formatCurrency = (val: number) => {
    return val === null 
      ? `0.00 ${currency}`
      : `${val.toLocaleString(currency === 'NGN' ? 'en-NG' : 'en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})} ${currency}`;
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC] dark:bg-slate-950 pb-24">
      {/* Header */}
      <header className="px-5 pt-12 pb-6">
        <h1 className="text-[28px] font-bold text-[#0F172A] dark:text-white">Withdraw</h1>
      </header>

      <div className="px-5 flex flex-col space-y-6">
        
        {/* Currency Selector */}
        <div className="relative">
          <label className="block text-[15px] font-bold text-[#0F172A] dark:text-white mb-2">Currency</label>
          <div 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center justify-between bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-4 shadow-sm cursor-pointer hover:border-gray-200 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-[12px] ${currency === 'NGN' ? 'bg-[#16a34a]' : 'bg-[#26A17B]'}`}>
                {currency}
              </div>
              <span className="text-[15px] font-medium text-[#334155] dark:text-slate-300">
                {currency === 'NGN' ? 'NGN' : 'USDT (TRC20)'}
              </span>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          
          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl shadow-lg z-20 overflow-hidden">
              <div 
                className="flex items-center space-x-3 p-4 hover:bg-gray-50 dark:hover:bg-slate-800 cursor-pointer"
                onClick={() => { setCurrency('NGN'); setIsDropdownOpen(false); }}
              >
                <div className="w-6 h-6 bg-[#16a34a] rounded-full flex items-center justify-center text-white font-bold text-[12px]">NGN</div>
                <span className="text-[15px] font-medium text-[#334155] dark:text-slate-300">NGN</span>
              </div>
              <div 
                className="flex items-center space-x-3 p-4 hover:bg-gray-50 dark:hover:bg-slate-800 cursor-pointer"
                onClick={() => { setCurrency('USDT'); setIsDropdownOpen(false); }}
              >
                <div className="w-6 h-6 bg-[#26A17B] rounded-full flex items-center justify-center text-white font-bold text-[12px]">USDT</div>
                <span className="text-[15px] font-medium text-[#334155] dark:text-slate-300">USDT (TRC20)</span>
              </div>
            </div>
          )}
        </div>

        {/* Amount Input */}
        <div>
          <label className="block text-[15px] font-bold text-[#0F172A] dark:text-white mb-2">Amount</label>
          <div className="relative flex items-center">
            <div className="absolute left-3 w-8 h-8 rounded-lg bg-[#F0F5FF] dark:bg-[#1D4ED8]/20 flex items-center justify-center text-[#0047FF] dark:text-blue-400 font-bold text-[14px]">
              {currency === 'NGN' ? '₦' : '$'}
            </div>
            <input 
              type="number"
              placeholder="Enter amount"
              className="w-full bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-900/50 rounded-2xl py-4 pl-14 pr-16 text-[15px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow shadow-sm text-gray-900 dark:text-white placeholder-gray-400 font-medium"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <div className="absolute right-4 text-gray-400 font-bold text-[13px] uppercase">{currency}</div>
          </div>
        </div>

        {/* Receiver's Email */}
        <div>
          <label className="block text-[15px] font-bold text-[#0F172A] dark:text-white mb-2">Receiver&apos;s Email</label>
          <div className="relative flex items-center">
            <div className="absolute left-4 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <input 
              type="email"
              placeholder="Enter email address"
              className="w-full bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-[15px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow shadow-sm text-gray-900 dark:text-white placeholder-gray-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        {/* Internal Transfer Preview */}
        <div>
          <label className="block text-[15px] font-bold text-[#0F172A] dark:text-white mb-2">Internal Transfer Preview</label>
          <div className="bg-[#F8FAFC] dark:bg-slate-800/50 rounded-2xl p-5 border border-gray-50 dark:border-slate-800">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[14px] text-[#475569] dark:text-slate-400">Initial Amount</span>
              <span className="text-[14px] font-medium text-[#0F172A] dark:text-white">{formatCurrency(numAmount)}</span>
            </div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-[14px] text-[#475569] dark:text-slate-400">Fees</span>
              <span className="text-[14px] font-medium text-[#0F172A] dark:text-white">{formatCurrency(fees)}</span>
            </div>
            <div className="h-[1px] bg-gray-200 dark:bg-slate-700 w-full mb-4"></div>
            <div className="flex justify-between items-center">
              <span className="text-[14px] text-[#475569] dark:text-slate-400">Final Amount</span>
              <span className="text-[14px] font-medium text-blue-600 dark:text-blue-400">{formatCurrency(finalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Withdraw Button */}
        <div className="pt-2">
          <Button className="w-full rounded-[14px] bg-[#0047FF] hover:bg-blue-700 py-4 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            Withdraw {currency}
          </Button>
        </div>

        {/* External Transfer Links */}
        <div className="pt-4">
          <h2 className="text-[16px] font-bold text-[#0F172A] dark:text-white mb-3">External Transfer</h2>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
            
            <Link href="/withdraw/bank-transfer" className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors border-b border-gray-100 dark:border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-slate-800 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                  </svg>
                </div>
                <span className="text-[15px] font-medium text-[#0F172A] dark:text-white">Bank Transfer</span>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>

            <Link href="/withdraw/crypto-transfer" className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-[#26A17B] rounded-full flex items-center justify-center text-white font-bold text-[12px]">
                  T
                </div>
                <span className="text-[15px] font-medium text-[#0F172A] dark:text-white">Cryptocurrency (USDT TRC20)</span>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>

          </div>
        </div>

      </div>
    </div>
  );
}
