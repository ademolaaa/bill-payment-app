'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '../components/Button';

export default function LaunchPage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Abstract background blobs for modern fintech feel */}
      <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-72 h-72 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>

      <div className="w-full max-w-sm flex flex-col items-center z-10 space-y-8">
        
        {/* Logo Placeholder */}
        <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-blue-400 rounded-2xl flex items-center justify-center shadow-lg mb-4">
           {/* Abstract logo mark */}
          <div className="w-10 h-10 border-4 border-white rounded-full flex items-center justify-center">
            <div className="w-3 h-3 bg-white dark:bg-slate-900 rounded-full"></div>
          </div>
        </div>

        {/* Text Content */}
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            Pay Bills, <br className="hidden sm:block" /> Simplified.
          </h1>
          <p className="text-gray-700 dark:text-slate-600 text-sm px-4">
            Manage your utilities, subscriptions, and transfers securely in one place.
          </p>
        </div>

        {/* CTAs */}
        <div className="w-full space-y-4 pt-10">
          <Link href="/signup" className="block w-full">
            <Button variant="primary">Create Account</Button>
          </Link>
          
          <Link href="/login" className="block w-full">
             {/* Using standard Tailwind button styling inline for a slightly different secondary look if needed, or Button variant */}
            <Button variant="outline">Log In</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
