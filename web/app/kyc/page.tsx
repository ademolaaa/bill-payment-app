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
    <div className="flex flex-col min-h-screen bg-white dark:bg-slate-900 pb-10">
      {/* Header */}
      <header className="px-4 pt-12 pb-4 flex items-center mb-2">
        <button onClick={() => router.back()} aria-label="Go back" className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:bg-slate-800 transition-colors mr-1">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#1f2937]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </button>
        <h1 className="text-[24px] font-bold text-[#1f2937]">KYC Verification</h1>
      </header>

      <div className="flex-grow px-5">
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="flex-grow space-y-6">
            
            {/* ID Type Select */}
            <div>
              <label htmlFor="idType" className="block text-black text-[16px] font-bold mb-2.5">ID Type</label>
              <div className="relative">
                <select 
                  id="idType"
                  title="Select ID Type"
                  className="w-full border border-gray-200 rounded-[12px] py-3.5 px-4 text-black bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none font-medium text-[16px] shadow-sm"
                  value={idType}
                  onChange={(e) => setIdType(e.target.value)}
                  required
                >
                  <option value="National ID Card">National ID Card</option>
                  <option value="Driver's License">Driver's License</option>
                  <option value="International Passport">International Passport</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-900 dark:text-slate-200">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                </div>
              </div>
            </div>

            {/* Front Side Upload */}
            <div>
              <label htmlFor="frontFile" className="block text-black text-[16px] font-bold mb-2.5">Front Side</label>
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
                className="w-full border border-gray-200 rounded-[12px] py-4 flex items-center justify-center space-x-2 bg-white dark:bg-slate-900 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm overflow-hidden"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-900 dark:text-slate-200 transform -rotate-45" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                <span className="text-[16px] font-medium text-black truncate px-2">
                  {frontFile ? frontFile.name : 'Upload file'}
                </span>
              </button>
            </div>

            {/* Back Side Upload */}
            <div>
              <label htmlFor="backFile" className="block text-black text-[16px] font-bold mb-2.5">Back Side</label>
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
                className="w-full border border-gray-200 rounded-[12px] py-4 flex items-center justify-center space-x-2 bg-white dark:bg-slate-900 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm overflow-hidden"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-900 dark:text-slate-200 transform -rotate-45" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                <span className="text-[16px] font-medium text-black truncate px-2">
                  {backFile ? backFile.name : 'Upload file'}
                </span>
              </button>
            </div>

          </div>

          <div className="mt-12 mb-4">
            <Button type="submit" variant="primary" className="w-full py-4 text-[16px] font-medium rounded-[12px]">
              Submit
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
