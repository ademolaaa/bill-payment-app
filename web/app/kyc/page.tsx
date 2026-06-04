'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '../../components/Button';

export default function KYCPage() {
  const router = useRouter();
  const [idType, setIdType] = useState('National ID Card');
  
  // File upload state
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  
  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("KYC Submitted", { idType, frontFile, backFile });
    router.push('/profile');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, side: 'front' | 'back') => {
    const file = e.target.files?.[0] || null;
    if (side === 'front') {
      setFrontFile(file);
    } else {
      setBackFile(file);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC] dark:bg-slate-950 pb-12">
      {/* Header */}
      <header className="px-5 pt-12 pb-4">
        <button 
          onClick={() => router.back()} 
          aria-label="Go back" 
          className="w-10 h-10 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center shadow-sm text-slate-800 dark:text-white border border-gray-100 dark:border-slate-800 hover:bg-gray-50 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-[28px] font-bold text-slate-900 dark:text-white mt-4">KYC Verification</h1>
        <p className="text-[15px] text-gray-500 dark:text-slate-400 mt-1">Verify your identity to enjoy all features</p>
      </header>

      <div className="flex-grow px-5">
        <form onSubmit={handleSubmit} className="flex flex-col h-full space-y-6">
          <div className="flex-grow space-y-6">
            
            {/* ID Type Select */}
            <div>
              <label htmlFor="idType" className="block text-slate-900 dark:text-white text-[15px] font-bold mb-2">ID Type</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  {/* ID card icon */}
                  <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] dark:bg-blue-900/30 flex items-center justify-center text-[#1D4ED8] dark:text-blue-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                </div>
                <select 
                  id="idType"
                  title="Select ID Type"
                  className="w-full border border-gray-100 dark:border-slate-800 rounded-2xl py-4 pl-14 pr-10 text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none font-bold text-[15px] shadow-sm cursor-pointer"
                  value={idType}
                  onChange={(e) => setIdType(e.target.value)}
                  required
                >
                  <option value="National ID Card">National ID Card</option>
                  <option value="Driver's License">Driver&apos;s License</option>
                  <option value="International Passport">International Passport</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-gray-500 dark:text-slate-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Front Side Upload */}
            <div>
              <label htmlFor="frontFile" className="block text-slate-900 dark:text-white text-[15px] font-bold mb-2">Front Side</label>
              <input 
                id="frontFile"
                title="Front Side ID Upload"
                type="file" 
                ref={frontInputRef}
                className="hidden"
                accept="image/*,.pdf"
                onChange={(e) => handleFileChange(e, 'front')}
              />
              <button 
                type="button" 
                aria-label="Upload Front Side of ID"
                onClick={() => frontInputRef.current?.click()}
                className="w-full border-2 border-dashed border-[#BFDBFE] dark:border-blue-900/50 rounded-[20px] py-7 flex flex-col items-center justify-center bg-[#EFF6FF] dark:bg-blue-950/20 hover:bg-[#DBEAFE] dark:hover:bg-blue-950/30 transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
              >
                <div className="w-12 h-12 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-[#1D4ED8] dark:text-blue-400 shadow-sm mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </div>
                <span className="text-[15px] font-bold text-slate-800 dark:text-slate-200 px-4 text-center truncate max-w-full">
                  {frontFile ? frontFile.name : 'Upload front side'}
                </span>
                <span className="text-[12px] text-gray-500 dark:text-slate-400 mt-1">
                  JPG, PNG or PDF • Max 10MB
                </span>
              </button>
            </div>

            {/* Back Side Upload */}
            <div>
              <label htmlFor="backFile" className="block text-slate-900 dark:text-white text-[15px] font-bold mb-2">Back Side</label>
              <input 
                id="backFile"
                title="Back Side ID Upload"
                type="file" 
                ref={backInputRef}
                className="hidden"
                accept="image/*,.pdf"
                onChange={(e) => handleFileChange(e, 'back')}
              />
              <button 
                type="button" 
                aria-label="Upload Back Side of ID"
                onClick={() => backInputRef.current?.click()}
                className="w-full border-2 border-dashed border-[#A7F3D0] dark:border-green-900/50 rounded-[20px] py-7 flex flex-col items-center justify-center bg-[#ECFDF5] dark:bg-green-950/10 hover:bg-[#D1FAE5] dark:hover:bg-green-950/20 transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
              >
                <div className="w-12 h-12 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-[#10B981] dark:text-green-400 shadow-sm mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </div>
                <span className="text-[15px] font-bold text-slate-800 dark:text-slate-200 px-4 text-center truncate max-w-full">
                  {backFile ? backFile.name : 'Upload back side'}
                </span>
                <span className="text-[12px] text-gray-500 dark:text-slate-400 mt-1">
                  JPG, PNG or PDF • Max 10MB
                </span>
              </button>
            </div>

          </div>

          <div className="mt-10 mb-4 flex flex-col space-y-4">
            <Button 
              type="submit" 
              className="w-full py-4 text-[16px] font-bold rounded-[14px] bg-[#0047FF] hover:bg-blue-700 flex items-center justify-center text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Submit for Verification
            </Button>
            
            <div className="flex items-center justify-center space-x-1.5 text-[12px] text-[#64748B] dark:text-slate-400 font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Your information is secure and encrypted</span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
