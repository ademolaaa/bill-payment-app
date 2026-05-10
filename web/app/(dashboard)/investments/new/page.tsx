'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '../../../../components/Button';

export default function NewInvestmentPage() {
  const [currency, setCurrency] = useState('NGN');
  const [packageType, setPackageType] = useState('3');
  const [amount, setAmount] = useState('');

  // Package logic
  let roiPercent = 11;
  let durationText = '3 Months';
  if (packageType === '6') {
    roiPercent = 23;
    durationText = '6 Months';
  } else if (packageType === '12') {
    roiPercent = 47;
    durationText = '12 Months';
  }

  const numAmount = parseFloat(amount) || 0;
  const roiAmount = (numAmount * roiPercent) / 100;
  const totalAmount = numAmount + roiAmount;

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-slate-950 pb-24">
      {/* Header */}
      <header className="px-5 pt-12 pb-6 flex items-center bg-white dark:bg-slate-950 sticky top-0 z-10 border-b border-gray-50 dark:border-slate-900">
        <Link href="/home" className="mr-4 text-gray-900 dark:text-white">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <h1 className="text-[20px] font-bold text-gray-900 dark:text-white flex-1 text-center pr-10">
          Investments
        </h1>
      </header>

      <div className="px-5 pt-6 flex flex-col space-y-6">
        
        {/* Headline */}
        <h2 className="text-[22px] font-bold text-[#0F172A] dark:text-white leading-tight pr-4">
          Invest in Kyvatron&apos;s arbitrage and earn up to <span className="text-[#0047FF]">47% ROI</span> per year
        </h2>

        {/* Currency Dropdown */}
        <div>
          <label className="block text-[15px] font-bold text-[#0F172A] dark:text-white mb-2">Currency</label>
          <div className="relative">
            <select 
              title="Select Currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full appearance-none bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-4 pr-10 text-[15px] font-medium text-[#334155] dark:text-slate-300 shadow-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="NGN">NGN</option>
              <option value="USDT">USDT</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Investment Package Dropdown */}
        <div>
          <label className="block text-[15px] font-bold text-[#0F172A] dark:text-white mb-2">Investment Package</label>
          <div className="relative">
            <select 
              title="Select Investment Package"
              value={packageType}
              onChange={(e) => setPackageType(e.target.value)}
              className="w-full appearance-none bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-4 pr-10 text-[15px] font-medium text-[#334155] dark:text-slate-300 shadow-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="3">3 Months, 11% ROI</option>
              <option value="6">6 Months, 23% ROI</option>
              <option value="12">12 Months, 47% ROI</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Amount Input */}
        <div>
          <label className="block text-[15px] font-bold text-[#0F172A] dark:text-white mb-2">Amount To Invest</label>
          <input 
            type="number"
            placeholder="Min: 100,000 NGN"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl py-4 px-4 text-[15px] font-medium text-[#0F172A] dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow shadow-sm placeholder-gray-400"
          />
        </div>

        {/* Preview Card */}
        <div className="bg-[#F8FAFC] dark:bg-slate-800/50 rounded-2xl p-5 border border-gray-50 dark:border-slate-800 mt-2">
          <h3 className="text-[16px] font-bold text-[#0F172A] dark:text-white mb-5">Preview</h3>
          
          <div className="flex justify-between items-center mb-4">
            <span className="text-[14px] text-[#475569] dark:text-slate-400">Investment:</span>
            <span className="text-[14px] font-medium text-[#0F172A] dark:text-white">
              {currency === 'NGN' ? '₦' : ''}{numAmount.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})}{currency === 'USDT' ? ' USDT' : ''}
            </span>
          </div>
          
          <div className="flex justify-between items-center mb-4">
            <span className="text-[14px] text-[#475569] dark:text-slate-400">Duration:</span>
            <span className="text-[14px] font-medium text-[#0F172A] dark:text-white">{durationText}</span>
          </div>
          
          <div className="flex justify-between items-center mb-4">
            <span className="text-[14px] text-[#475569] dark:text-slate-400">ROI:</span>
            <span className="text-[14px] font-medium text-[#0F172A] dark:text-white">
              {roiPercent}% ({currency === 'NGN' ? '₦' : ''}{roiAmount.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})}{currency === 'USDT' ? ' USDT' : ''})
            </span>
          </div>
          
          <div className="h-[1px] bg-gray-200 dark:bg-slate-700 w-full mb-4"></div>
          
          <div className="flex justify-between items-center">
            <span className="text-[14px] font-bold text-[#0F172A] dark:text-white">Total:</span>
            <span className="text-[14px] font-bold text-[#0F172A] dark:text-white">
              {currency === 'NGN' ? '₦' : ''}{totalAmount.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})}{currency === 'USDT' ? ' USDT' : ''}
            </span>
          </div>
        </div>

        {/* Confirm Button */}
        <div className="pt-2">
          <Button className="w-full rounded-[14px] bg-[#0047FF] hover:bg-blue-700 py-4 text-[16px] font-bold flex items-center justify-center">
            Confirm
          </Button>
        </div>

        {/* Active Investments Section */}
        <div className="pt-4 pb-8">
          <h3 className="text-[18px] font-bold text-[#0F172A] dark:text-white mb-4">Active Investments</h3>
          
          <div className="space-y-4">
            {/* Investment Card 1 */}
            <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
              <div className="space-y-3 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-[14px] font-medium text-[#64748B] dark:text-slate-400">Investment Package:</span>
                  <span className="text-[14px] font-bold text-[#0F172A] dark:text-white text-right">3 Months, 11% ROI</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[14px] font-medium text-[#64748B] dark:text-slate-400">Currency:</span>
                  <span className="text-[14px] font-bold text-[#0F172A] dark:text-white">NGN</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[14px] font-medium text-[#64748B] dark:text-slate-400">Amount Invested:</span>
                  <span className="text-[14px] font-bold text-[#0F172A] dark:text-white">₦500,000.00</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[14px] font-medium text-[#64748B] dark:text-slate-400">ROI:</span>
                  <span className="text-[14px] font-bold text-[#0F172A] dark:text-white">₦55,000.00</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[14px] font-medium text-[#64748B] dark:text-slate-400">Total:</span>
                  <span className="text-[14px] font-bold text-[#0F172A] dark:text-white">₦555,000.00</span>
                </div>
              </div>
              
              <div className="h-[1px] bg-gray-100 dark:bg-slate-800 w-full mb-4"></div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[14px] font-medium text-[#64748B] dark:text-slate-400">Investment Date:</span>
                  <span className="text-[14px] font-bold text-[#0F172A] dark:text-white">March 05, 2026</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[14px] font-medium text-[#64748B] dark:text-slate-400">Maturity Date:</span>
                  <span className="text-[14px] font-bold text-[#0F172A] dark:text-white">June 05, 2026</span>
                </div>
              </div>
            </div>

            {/* Investment Card 2 */}
            <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
              <div className="space-y-3 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-[14px] font-medium text-[#64748B] dark:text-slate-400">Investment Package:</span>
                  <span className="text-[14px] font-bold text-[#0F172A] dark:text-white text-right">12 Months, 47% ROI</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[14px] font-medium text-[#64748B] dark:text-slate-400">Currency:</span>
                  <span className="text-[14px] font-bold text-[#0F172A] dark:text-white">USDT</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[14px] font-medium text-[#64748B] dark:text-slate-400">Amount Invested:</span>
                  <span className="text-[14px] font-bold text-[#0F172A] dark:text-white">$2,000.00</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[14px] font-medium text-[#64748B] dark:text-slate-400">ROI:</span>
                  <span className="text-[14px] font-bold text-[#0F172A] dark:text-white">$940.00</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[14px] font-medium text-[#64748B] dark:text-slate-400">Total:</span>
                  <span className="text-[14px] font-bold text-[#0F172A] dark:text-white">$2,940.00</span>
                </div>
              </div>
              
              <div className="h-[1px] bg-gray-100 dark:bg-slate-800 w-full mb-4"></div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[14px] font-medium text-[#64748B] dark:text-slate-400">Investment Date:</span>
                  <span className="text-[14px] font-bold text-[#0F172A] dark:text-white">August 03, 2026</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[14px] font-medium text-[#64748B] dark:text-slate-400">Maturity Date:</span>
                  <span className="text-[14px] font-bold text-[#0F172A] dark:text-white">August 03, 2027</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
