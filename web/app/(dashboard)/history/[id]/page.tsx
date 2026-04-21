'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '../../../../components/Button';

// Mock fetching single transaction details
const dummyReceipt = {
  id: 't1', 
  type: 'Deposit', 
  amount: 50000, 
  status: 'Completed', 
  providerReference: '1234567890ABCDEF',
  date: 'Oct 24, 2026, 14:30 PM',
  paymentMethod: 'Bank Transfer (GTBank)'
};

export default function ReceiptPage({ params }: { params: { id: string } }) {
  // In a real app we would fetch the details for params.id
  // Using dummyReceipt for now

  const formattedAmount = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(dummyReceipt.amount);
  const isSuccess = dummyReceipt.status === 'Completed';

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 relative pb-24">
      
      {/* Header */}
      <header className="p-4 pt-10 flex items-center justify-between border-b border-gray-100 bg-white shadow-sm relative z-10">
        <Link href="/history" className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </Link>
        <h1 className="text-lg font-bold text-gray-900 absolute left-1/2 transform -translate-x-1/2">Transaction Receipt</h1>
        <div className="w-8"></div> {/* Spacer for center alignment */}
      </header>

      {/* Main Receipt Content */}
      <div className="flex-grow p-4 mt-4 w-full max-w-lg mx-auto">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 relative overflow-hidden flex flex-col items-center">
          
          {/* Status Icon */}
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isSuccess ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
            {isSuccess ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            )}
          </div>

          <p className="text-[14px] text-gray-500 font-medium mb-1 capitalize">{dummyReceipt.type}</p>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-8">
            {isSuccess ? '+' : ''}{formattedAmount}
          </h2>

          {/* Receipt Details rows */}
          <div className="w-full border-t border-dashed border-gray-200 pt-6 space-y-5">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Status</span>
              <span className={`font-semibold capitalize ${isSuccess ? 'text-green-600' : 'text-red-600'}`}>
                {dummyReceipt.status}
              </span>
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Date & Time</span>
              <span className="font-semibold text-gray-900">{dummyReceipt.date}</span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Payment Method</span>
              <span className="font-semibold text-gray-900">{dummyReceipt.paymentMethod}</span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Reference No.</span>
              <span className="font-semibold text-gray-900 tracking-wide">{dummyReceipt.providerReference}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Share Button Overlay */}
      <div className="fixed bottom-24 left-0 w-full px-6 flex justify-center z-20 pointer-events-none">
        <div className="w-full max-w-sm pointer-events-auto shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-lg">
          <Button variant="primary" className="bg-blue-600 flex items-center justify-center space-x-2 w-full py-4 rounded-xl">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
             <span>Share Receipt</span>
          </Button>
        </div>
      </div>

    </div>
  );
}
