'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '../../../components/Button';
import { Input } from '../../../components/Input';

export default function DepositPage() {
  const [activeTab, setActiveTab] = useState<'NGN' | 'USDT'>('NGN');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText('TLg8B5...,....');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-slate-900 pb-24">
      {/* Header */}
      <header className="px-5 pt-12 pb-4 flex items-center bg-white dark:bg-slate-900 sticky top-0 z-10">
        <Link href="/home" className="mr-4 text-gray-900 dark:text-white">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <h1 className="text-[20px] font-bold text-gray-900 dark:text-white flex-1 text-center pr-10">Deposit</h1>
      </header>

      {/* Tabs */}
      <div className="px-5 mb-6 flex border-b border-gray-100 relative">
        <button 
          onClick={() => setActiveTab('NGN')}
          className={`flex-1 pb-3 text-[15px] font-bold text-center transition-colors relative ${activeTab === 'NGN' ? 'text-[#1d4ed8]' : 'text-gray-400'}`}
        >
          NGN Deposit
          {activeTab === 'NGN' && (
            <div className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-blue-700"></div>
          )}
        </button>
        <button 
          onClick={() => setActiveTab('USDT')}
          className={`flex-1 pb-3 text-[15px] font-bold text-center transition-colors relative ${activeTab === 'USDT' ? 'text-[#1d4ed8]' : 'text-gray-400'}`}
        >
          USDT (TRC20) Deposit
          {activeTab === 'USDT' && (
            <div className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-blue-700"></div>
          )}
        </button>
      </div>

      <div className="px-5">
        {activeTab === 'NGN' ? (
          /* NGN Tab Content */
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Balance Card */}
            <div className="bg-white dark:bg-slate-900 border border-gray-200 rounded-3xl p-6 mb-6 shadow-sm flex flex-col items-start space-y-1">
              <span className="text-[14px] font-bold text-gray-900 dark:text-white">NGN <span className="font-medium text-gray-700 dark:text-slate-600">Balance</span></span>
              <h2 className="text-[28px] font-bold text-gray-900 dark:text-white">₦182,300.00</h2>
            </div>

            {/* Amount Form */}
            <div className="mb-6">
              <Input 
                label="Amount" 
                placeholder=""
              />
            </div>

            <div className="mb-6">
              <label className="block text-[15px] font-bold text-gray-900 dark:text-white mb-3">Deposit via</label>
              <div className="flex items-center text-[16px] text-gray-900 dark:text-white">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
                  </svg>
                </div>
                Manual Bank Transfer
              </div>
            </div>

            <div className="flex justify-between items-center mb-3">
              <span className="text-[16px] font-bold text-gray-900 dark:text-white">Fee</span>
              <span className="text-[16px] font-bold text-gray-900 dark:text-white">₦1000.00</span>
            </div>

            <div className="flex justify-between items-center mb-8">
              <span className="text-[16px] font-bold text-gray-900 dark:text-white">Total Amount</span>
              <span className="text-[16px] font-bold text-gray-900 dark:text-white">₦182,400.00</span>
            </div>

            <div className="mb-8">
              <Link href="/deposit/manual">
                <Button>Proceed to Manual Deposit</Button>
              </Link>
            </div>

            <h3 className="text-[15px] font-medium text-gray-700 dark:text-slate-600">Recent Deposits</h3>
          </div>
        ) : (
          /* USDT Tab Content */
          <div className="animate-in fade-in slide-in-from-left-4 duration-300 pb-20">
            {/* Network Badge */}
            <div className="flex justify-center mb-6 mt-2">
              <div className="bg-[#F8FAFC] dark:bg-slate-800 rounded-xl px-4 py-2 flex items-center">
                <span className="text-[14px] text-gray-500 dark:text-slate-400 mr-2">Network:</span>
                <span className="text-[14px] font-bold text-gray-900 dark:text-white">TRON (TRC20)</span>
              </div>
            </div>

            {/* QR Code Container */}
            <div className="flex justify-center mb-6">
              <div className="p-2 bg-white dark:bg-slate-800 rounded-3xl border-4 border-blue-600 shadow-sm relative w-[220px] h-[220px] flex items-center justify-center">
                {/* Simplified QR Placeholder using SVG blocks */}
                <svg width="100%" height="100%" viewBox="0 0 100 100" fill="currentColor" className="text-gray-900 dark:text-white">
                  {/* Top Left Square */}
                  <rect x="5" y="5" width="25" height="25" fill="none" stroke="currentColor" strokeWidth="3"/>
                  <rect x="10" y="10" width="15" height="15"/>
                  {/* Top Right Square */}
                  <rect x="70" y="5" width="25" height="25" fill="none" stroke="currentColor" strokeWidth="3"/>
                  <rect x="75" y="10" width="15" height="15"/>
                  {/* Bottom Left Square */}
                  <rect x="5" y="70" width="25" height="25" fill="none" stroke="currentColor" strokeWidth="3"/>
                  <rect x="10" y="75" width="15" height="15"/>
                  
                  {/* Random inner blocks */}
                  <rect x="35" y="5" width="10" height="10"/>
                  <rect x="50" y="15" width="15" height="10"/>
                  <rect x="5" y="35" width="20" height="15"/>
                  <rect x="30" y="35" width="15" height="15"/>
                  <rect x="70" y="35" width="25" height="10"/>
                  <rect x="50" y="70" width="15" height="15"/>
                  <rect x="75" y="55" width="10" height="25"/>
                  <rect x="35" y="80" width="10" height="15"/>
                  <rect x="85" y="85" width="10" height="10"/>
                </svg>
                {/* Center Logo */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center p-1">
                    <div className="w-full h-full bg-[#26A17B] rounded-full flex items-center justify-center text-white font-bold text-[18px]">
                      T
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Wallet Address Box */}
            <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-4 mb-6 shadow-sm flex items-center justify-between">
              <div className="pr-4">
                <p className="text-[14px] text-gray-500 dark:text-slate-400 mb-1">Wallet Address</p>
                <p className="text-[15px] font-bold text-[#0F172A] dark:text-white break-all leading-tight">
                  TSwL9vQQZWPZbdMaWgV4B2Lizyu5Yw1rHp
                </p>
              </div>
              <button 
                onClick={handleCopy}
                className="w-12 h-12 bg-blue-600 hover:bg-blue-700 rounded-2xl flex-shrink-0 flex items-center justify-center text-white transition-colors"
              >
                {copied ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </button>
            </div>

            {/* Info List */}
            <div className="bg-[#F8FAFC] dark:bg-slate-800/50 rounded-2xl p-5 border border-gray-50 dark:border-slate-800 space-y-4">
              
              <div className="flex items-center justify-between">
                <div className="flex items-center text-blue-600 dark:text-blue-400">
                  <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center mr-3">
                    <span className="text-[12px] font-bold">$</span>
                  </div>
                  <span className="text-[14px] text-[#475569] dark:text-slate-300">Minimum Deposit Amount:</span>
                </div>
                <span className="text-[14px] font-bold text-[#0F172A] dark:text-white">5.00 USDT</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center text-blue-600 dark:text-blue-400">
                  <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414zM11 12a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-[14px] text-[#475569] dark:text-slate-300">USDT Balance:</span>
                </div>
                <span className="text-[14px] font-bold text-[#0F172A] dark:text-white">1,250.75 USDT</span>
              </div>

              <div className="flex items-start">
                <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                  <span className="text-[12px] font-bold font-serif italic">i</span>
                </div>
                <p className="text-[13px] text-[#475569] dark:text-slate-300 leading-relaxed">
                  Only send TRC20-based USDT to this deposit address.
                </p>
              </div>

            </div>

            {/* Bottom Actions */}
            <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 p-5 flex space-x-3 pb-8 border-t border-gray-100 dark:border-slate-800 z-10">
              <Button 
                variant="outline" 
                className="flex-1 rounded-2xl border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold py-4 shadow-sm hover:bg-gray-50 dark:hover:bg-slate-800"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Save Picture
              </Button>
              <Button 
                onClick={handleCopy}
                className="flex-1 rounded-2xl bg-[#0047FF] hover:bg-blue-700 flex items-center justify-center text-white font-bold py-4 shadow-md"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                {copied ? 'Copied' : 'Copy Address'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
