'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '../../../../components/Button';

export default function BankTransferPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-24">
      <header className="p-4 pt-10 flex items-center justify-between border-b border-gray-100 bg-white shadow-sm relative z-10">
        <Link href="/withdraw" className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </Link>
        <h1 className="text-[17px] font-bold text-gray-900 absolute left-1/2 transform -translate-x-1/2">Bank Transfer</h1>
        <div className="w-8"></div>
      </header>

      <div className="px-5 pt-6 flex flex-col space-y-6">
        <p className="text-[15px] text-gray-600 leading-relaxed">
          Initiate a withdrawal to a bank account with the same name on your Kyvatron account.
        </p>

        <form className="flex flex-col space-y-6">
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col space-y-5">
            <div>
              <label htmlFor="bank-name" className="block text-gray-800 text-[14px] font-medium mb-1.5 ml-1">Bank Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" /></svg>
                  </div>
                </div>
                <input id="bank-name" type="text" placeholder="Enter bank name" className="w-full pl-14 pr-4 py-3.5 border border-gray-200 rounded-2xl text-[14px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

            <div>
              <label htmlFor="account-number" className="block text-gray-800 text-[14px] font-medium mb-1.5 ml-1">Account Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                  </div>
                </div>
                <input id="account-number" type="text" placeholder="Enter account number" className="w-full pl-14 pr-4 py-3.5 border border-gray-200 rounded-2xl text-[14px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

            <div>
              <label htmlFor="amount" className="block text-gray-800 text-[14px] font-medium mb-1.5 ml-1">Amount</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-900 font-bold text-[13px]">
                    ₦
                  </div>
                </div>
                <input id="amount" type="number" placeholder="Enter amount" className="w-full pl-14 pr-4 py-3.5 border border-gray-200 rounded-2xl text-[14px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="text-[15px] font-bold text-gray-900 mb-4">External Transfer Preview</h3>
            
            <div className="flex flex-col space-y-3">
              <div className="flex justify-between items-center pb-3 border-b border-gray-50">
                <span className="text-[13px] font-medium text-gray-500">Initial Amount</span>
                <span className="text-[14px] font-medium text-gray-900">₦0.00</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-gray-50">
                <span className="text-[13px] font-medium text-gray-500">Fees</span>
                <span className="text-[14px] font-medium text-gray-900">₦0.00</span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-[14px] font-bold text-gray-900">Final Amount</span>
                <span className="text-[15px] font-bold text-gray-900">₦0.00</span>
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full py-4 rounded-[14px] font-bold text-[15px]">Confirm</Button>
        </form>
      </div>
    </div>
  );
}
