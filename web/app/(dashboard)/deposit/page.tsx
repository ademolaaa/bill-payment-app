'use client';

import React, { useState } from 'react';
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
      <header className="px-5 pt-12 pb-2">
        <h1 className="text-[26px] font-bold text-gray-900 dark:text-white">Deposit</h1>
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
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11 20C11 20 15.69 11 19 8C19 8 16.5 7 14 7C14 7 14 3 14 3C14 3 6.69 11 4 14C4 14 6 14 8 14C8 14 8 20 11 20Z" fill="#F5A623"/></svg>
                Flutterwave
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
              <Button>Proceed to Flutterwave</Button>
            </div>

            <h3 className="text-[15px] font-medium text-gray-700 dark:text-slate-600">Recent Deposits</h3>
          </div>
        ) : (
          /* USDT Tab Content */
          <div className="animate-in fade-in slide-in-from-left-4 duration-300">
            {/* Balance Card */}
            <div className="flex flex-col items-center justify-center py-6 mb-4">
              <div className="w-[56px] h-[56px] bg-[#26A17B] rounded-full flex items-center justify-center mb-3">
                <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 5.523 4.477 10 10 10s10-4.477 10-10c0-5.523-4.477-10-10-10zM17 11h-3.5v5.5h-3V11H7V8.5h10V11z" />
                </svg>
              </div>
              <h2 className="text-[26px] font-medium text-gray-900 dark:text-white tracking-tight">6,000.00 USDT</h2>
            </div>

            <div className="mb-2">
              <label className="block text-[15px] font-bold text-gray-900 dark:text-white mb-2">Deposit Address</label>
              <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-gray-200 rounded-2xl p-[6px] pl-4 shadow-sm">
                <span className="text-[15px] text-gray-700 dark:text-slate-600 tracking-wider">TLg8B5...,....</span>
                <Button 
                  onClick={handleCopy}
                  variant="outline"
                  className="w-auto py-2.5 px-6 rounded-[8px] border-none bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 text-gray-900 dark:text-white"
                >
                  {copied ? 'Copied' : 'Copy'}
                </Button>
              </div>
            </div>

            <p className="text-[13px] text-gray-700 dark:text-slate-600 leading-relaxed mb-10 pr-4">
              Only send TRC20-based USDT to this deposit address.
            </p>

            <Button>Deposit</Button>
          </div>
        )}
      </div>
    </div>
  );
}
