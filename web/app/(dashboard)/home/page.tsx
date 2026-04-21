'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '../../../components/Button';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <header className="px-5 pt-12 pb-4 flex items-center">
        <h1 className="text-2xl font-bold text-gray-900">Home</h1>
      </header>

      <div className="px-5 flex flex-col space-y-6">
        
        {/* Total Balance Card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm flex flex-col items-center">
          <div className="w-full text-left">
            <p className="text-[14px] text-gray-500 font-medium mb-1">Total Balance</p>
            <h2 className="text-[34px] font-bold text-gray-900 tracking-tight leading-none mb-2">
              ₦182,300.00
            </h2>
            <p className="text-[15px] font-medium text-gray-500 mb-6">1,250.75 USDT</p>
          </div>
          
          <div className="flex w-full space-x-3">
            <Button className="flex-1 rounded-[12px]">Deposit</Button>
            <Button className="flex-1 rounded-[12px]">Pay Bills</Button>
          </div>
        </div>

        {/* Investments Section */}
        <div>
          <h3 className="text-[17px] font-bold text-gray-900 mb-4">Investments</h3>
          <div className="flex space-x-3">
            {/* NGN Card */}
            <div className="flex-1 bg-white rounded-2xl p-4 shadow-sm flex flex-col justify-between">
              <div>
                <p className="text-[13px] font-bold text-gray-900 mb-1">NGN</p>
                <h4 className="text-[18px] font-bold text-gray-900 mb-1">₦56,780.25</h4>
              </div>
              <p className="text-[13px] font-medium text-[#16a34a]">+5.25%</p>
            </div>

            {/* USDT Card */}
            <div className="flex-1 bg-white rounded-2xl p-4 shadow-sm flex flex-col justify-between">
              <div>
                <p className="text-[13px] font-bold text-gray-900 mb-1">USDT</p>
                <h4 className="text-[18px] font-bold text-gray-900 mb-1">₮6,420.10</h4>
              </div>
              <div className="flex justify-between items-end">
                <p className="text-[13px] font-medium text-[#16a34a]">+3.60%</p>
                <span className="text-[10px] uppercase font-bold text-gray-400">TRC20</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Row */}
        <div className="grid grid-cols-4 gap-2 pt-2">
          {[
            { label: 'Transfer', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-[22px] w-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg> },
            { label: 'Withdraw', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-[22px] w-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg> },
            { label: 'Invest', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-[22px] w-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg> },
            { label: 'Wallet', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-[22px] w-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg> },
          ].map((action, idx) => (
            <div key={idx} className="flex flex-col items-center cursor-pointer">
              <div className="w-[52px] h-[52px] bg-blue-600 rounded-full flex items-center justify-center text-white mb-2 shadow-sm hover:bg-blue-700 transition">
                {action.icon}
              </div>
              <span className="text-[12px] font-medium text-gray-900">{action.label}</span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
