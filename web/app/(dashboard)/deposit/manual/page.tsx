'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { Button } from '../../../../components/Button';

export default function ManualDepositPage() {
  const [receiptImage, setReceiptImage] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setReceiptImage(e.target.files[0]);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: 'Manual Deposit Details',
      text: 'Account Name: Kyvatron Limited\nBank: Providus Bank\nAccount Number: 5404105265\n\nKindly make a transfer using your Email Address as Narration.',
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.text);
        alert('Details copied to clipboard');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC] dark:bg-slate-950 pb-32">
      {/* Header */}
      <header className="px-5 pt-12 pb-6 flex items-center bg-[#F8FAFC] dark:bg-slate-950 sticky top-0 z-10">
        <Link href="/deposit" className="mr-4 text-gray-900 dark:text-white">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <h1 className="text-[20px] font-bold text-gray-900 dark:text-white flex-1 text-center pr-10">
          Manual Deposit
        </h1>
      </header>

      <div className="px-5 flex-1 flex flex-col">
        {/* Main Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm relative pt-6 pb-12 px-5 border border-gray-100 dark:border-slate-800">
          
          {/* Instructions Header */}
          <div className="flex items-center space-x-4 mb-6 bg-[#F0F5FF] dark:bg-blue-900/20 -mx-5 -mt-6 p-5 rounded-t-3xl border-b border-[#E5EDFF] dark:border-blue-900/30">
            <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-sm text-blue-700 dark:text-blue-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
              </svg>
            </div>
            <h2 className="text-[18px] font-bold text-[#0F172A] dark:text-white leading-tight">
              Manual Deposit<br />Instructions
            </h2>
          </div>

          {/* Intro Text */}
          <p className="text-[15px] text-[#334155] dark:text-slate-300 mb-8 leading-relaxed">
            Kindly make a transfer using your Email Address as Narration. Minimum amount is <span className="text-blue-700 dark:text-blue-400 font-bold">1,000 NGN</span>.
          </p>

          {/* Account Details */}
          <div className="space-y-6 mb-8 border-b border-gray-100 dark:border-slate-800 pb-8">
            {/* Account Name */}
            <div className="flex items-center">
              <div className="w-10 h-10 bg-[#F0F5FF] dark:bg-slate-800 rounded-xl flex items-center justify-center mr-4 text-blue-600 dark:text-blue-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="flex flex-1 justify-between items-center">
                <span className="text-[15px] text-[#475569] dark:text-slate-400">Account Name:</span>
                <span className="text-[15px] font-bold text-[#0F172A] dark:text-white">Kyvatron Limited</span>
              </div>
            </div>

            {/* Bank */}
            <div className="flex items-center">
              <div className="w-10 h-10 bg-[#F0F5FF] dark:bg-slate-800 rounded-xl flex items-center justify-center mr-4 text-blue-600 dark:text-blue-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                </svg>
              </div>
              <div className="flex flex-1 justify-between items-center">
                <span className="text-[15px] text-[#475569] dark:text-slate-400">Bank:</span>
                <span className="text-[15px] font-bold text-[#0F172A] dark:text-white">Providus Bank</span>
              </div>
            </div>

            {/* Account Number */}
            <div className="flex items-center">
              <div className="w-10 h-10 bg-[#F0F5FF] dark:bg-slate-800 rounded-xl flex items-center justify-center mr-4 text-blue-600 dark:text-blue-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <div className="flex flex-1 justify-between items-center">
                <span className="text-[15px] text-[#475569] dark:text-slate-400">Account Number:</span>
                <span className="text-[15px] font-bold text-[#0F172A] dark:text-white">5404105265</span>
              </div>
            </div>
          </div>

          {/* Info Text */}
          <div className="flex items-start mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-700 dark:text-blue-400 mr-3 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-[14px] text-[#475569] dark:text-slate-300 leading-relaxed">
              Once completed, click on the Image Icon below to upload your full transaction receipt, then click on the Submit button, and your order will be processed promptly.
            </p>
          </div>

          {/* Floating Upload Button */}
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-16 h-16 bg-[#0047FF] hover:bg-blue-700 transition-colors rounded-full flex items-center justify-center shadow-xl border-4 border-[#F8FAFC] dark:border-slate-950 text-white relative"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {receiptImage && (
                <div className="absolute top-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
              )}
            </button>
            <div className="mt-2 text-center text-xs font-medium text-blue-600 dark:text-blue-400">
              {receiptImage ? 'Receipt Selected' : ''}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Sticky Action Buttons */}
      <div className="fixed bottom-0 left-0 w-full bg-[#F8FAFC] dark:bg-slate-950 p-5 flex space-x-3 pb-8">
        <Button 
          className="flex-1 rounded-2xl bg-[#0047FF] hover:bg-blue-700 flex items-center justify-center text-white font-bold py-4 shadow-md"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
          Submit
        </Button>
        <Button 
          variant="outline" 
          onClick={handleShare}
          className="flex-1 rounded-2xl border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center justify-center text-[#0F172A] dark:text-white font-bold py-4 shadow-sm hover:bg-gray-50 dark:hover:bg-slate-800"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          Share Details
        </Button>
      </div>
    </div>
  );
}
