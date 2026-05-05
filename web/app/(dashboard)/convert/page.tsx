'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '../../../components/Button';

export default function ConvertPage() {
  const [fromCurrency, setFromCurrency] = useState<'NGN' | 'USDT'>('NGN');
  const [amount, setAmount] = useState('');

  // Fixed dummy values for UI preview
  const exchangeRate = 1215.00;
  const numAmount = parseFloat(amount) || 0;
  
  // Calculate preview
  const convertAmount = Math.max(0, numAmount);
  // Using dynamic fee calculation to look realistic (e.g., 2% for USDT, flat 500 for NGN)
  const fees = fromCurrency === 'NGN' ? (convertAmount > 0 ? 500 : 0) : (convertAmount > 0 ? convertAmount * 0.02 : 0);
  const receiveAmount = fromCurrency === 'NGN' 
    ? (convertAmount > fees ? (convertAmount - fees) / exchangeRate : 0)
    : (convertAmount > fees ? (convertAmount - fees) * exchangeRate : 0);

  const handleSwap = () => {
    setFromCurrency(prev => prev === 'NGN' ? 'USDT' : 'NGN');
    setAmount('');
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC] dark:bg-slate-950 pb-24">
      {/* Header */}
      <header className="px-5 pt-12 pb-6 flex items-center justify-between">
        <h1 className="text-[28px] font-bold text-[#0F172A] dark:text-white">Convert</h1>
        <Link href="/history?type=conversion" className="w-10 h-10 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center shadow-sm text-[#0F172A] dark:text-white border border-gray-100 dark:border-slate-800 hover:bg-gray-50 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </Link>
      </header>

      <div className="px-5 flex flex-col space-y-6">
        
        {/* Available Balances Card */}
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
          <h2 className="text-[16px] font-bold text-[#0F172A] dark:text-white mb-4">Available Balances</h2>
          
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-[#16a34a] rounded-full flex items-center justify-center text-white font-bold text-[10px]">
                ₦
              </div>
              <span className="text-[15px] text-[#475569] dark:text-slate-300">NGN Balance</span>
            </div>
            <span className="text-[15px] font-medium text-[#0F172A] dark:text-white">₦250,000.00</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-[#16a34a] rounded-full flex items-center justify-center text-white font-bold text-[10px]">
                T
              </div>
              <span className="text-[15px] text-[#475569] dark:text-slate-300">USDT Balance</span>
            </div>
            <span className="text-[15px] font-medium text-[#0F172A] dark:text-white">250.00 USDT</span>
          </div>
        </div>

        {/* Conversion Form */}
        <div className="flex flex-col space-y-2 relative">
          
          {/* From Section */}
          <div>
            <label className="block text-[15px] font-bold text-[#0F172A] dark:text-white mb-2">From</label>
            
            {/* Currency Dropdown */}
            <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-4 mb-3 shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-[#16a34a] rounded-full flex items-center justify-center text-white font-bold text-[10px]">
                  {fromCurrency === 'NGN' ? '₦' : 'T'}
                </div>
                <span className="text-[15px] font-medium text-[#334155] dark:text-slate-200">{fromCurrency}</span>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            {/* Amount Input */}
            <div className="bg-white dark:bg-slate-900 border border-blue-400 dark:border-blue-500/50 rounded-2xl p-4 shadow-sm ring-1 ring-blue-100 dark:ring-blue-900/30">
              <label className="block text-[13px] text-gray-500 dark:text-slate-400 mb-1">Enter Amount</label>
              <div className="flex items-center relative">
                {fromCurrency === 'NGN' && <span className="text-[22px] font-medium text-gray-400 mr-1">₦</span>}
                <input 
                  type="number"
                  placeholder="0.00"
                  className="w-full bg-transparent text-[22px] font-medium text-[#0F172A] dark:text-white focus:outline-none placeholder-gray-300 dark:placeholder-gray-500"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                {fromCurrency === 'USDT' && (
                  <div className="text-[22px] font-medium text-gray-400 absolute right-0">USDT</div>
                )}
              </div>
            </div>
          </div>

          {/* Swap Button */}
          <div className="relative h-4 flex justify-center items-center z-10">
            <button 
              onClick={handleSwap}
              className="absolute bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 shadow-md rounded-full px-4 py-2 flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
              <span className="text-[14px] font-semibold">Swap</span>
            </button>
          </div>

          {/* To Section */}
          <div className="pt-2">
            <label className="block text-[15px] font-bold text-[#0F172A] dark:text-white mb-2">To</label>
            
            {/* Currency Dropdown */}
            <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-[#16a34a] rounded-full flex items-center justify-center text-white font-bold text-[10px]">
                  {fromCurrency === 'NGN' ? 'T' : '₦'}
                </div>
                <span className="text-[15px] font-medium text-[#334155] dark:text-slate-200">{fromCurrency === 'NGN' ? 'USDT' : 'NGN'}</span>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Preview Card */}
        <div className="bg-[#F8FAFC] dark:bg-slate-800/50 rounded-2xl p-5 border border-gray-50 dark:border-slate-800 mt-2">
          <h3 className="text-[15px] font-bold text-[#0F172A] dark:text-white mb-4">Conversion Preview</h3>
          
          <div className="flex justify-between items-center mb-4">
            <span className="text-[14px] text-[#475569] dark:text-slate-400">Current Exchange Rate</span>
            <span className="text-[14px] font-medium text-[#0F172A] dark:text-white">
              {fromCurrency === 'NGN' 
                ? `1 USDT = ${exchangeRate.toLocaleString('en-NG', {minimumFractionDigits:2})} NGN`
                : `1 USDT = ${exchangeRate.toLocaleString('en-NG', {minimumFractionDigits:2})} NGN`
              }
            </span>
          </div>
          
          <div className="h-[1px] bg-gray-200 dark:bg-slate-700 w-full mb-4"></div>
          
          <div className="flex justify-between items-center mb-3">
            <span className="text-[14px] text-[#475569] dark:text-slate-400">Fees ({fromCurrency})</span>
            <span className="text-[14px] font-medium text-[#0F172A] dark:text-white">
              {fromCurrency === 'NGN' ? '₦' : ''}{fees.toLocaleString('en-NG', {minimumFractionDigits:2})}{fromCurrency === 'USDT' ? ' USDT' : ''}
            </span>
          </div>
          
          <div className="flex justify-between items-center mb-3">
            <span className="text-[14px] text-[#475569] dark:text-slate-400">You will convert ({fromCurrency})</span>
            <span className="text-[14px] font-medium text-[#0F172A] dark:text-white">
              {fromCurrency === 'NGN' ? '₦' : ''}{convertAmount.toLocaleString('en-NG', {minimumFractionDigits:2})}{fromCurrency === 'USDT' ? ' USDT' : ''}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-[14px] text-[#475569] dark:text-slate-400">You will receive ({fromCurrency === 'NGN' ? 'USDT' : 'NGN'})</span>
            <span className="text-[14px] font-medium text-[#0F172A] dark:text-white">
              {fromCurrency === 'USDT' ? '₦' : ''}{receiveAmount.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})}{fromCurrency === 'NGN' ? ' USDT' : ''}
            </span>
          </div>
        </div>

        {/* Confirm Button */}
        <div className="pt-2">
          <Button className="w-full rounded-[14px] bg-[#0047FF] hover:bg-blue-700 py-4 flex items-center justify-center text-[16px]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Confirm Conversion
          </Button>
        </div>

      </div>
    </div>
  );
}
