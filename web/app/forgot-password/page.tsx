'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabase/client';

const MailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    if (!email) {
      setError('Please enter your email address.');
      setIsLoading(false);
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccess('Check your email for a password reset link.');
    }
    setIsLoading(false);
  };

  return (
    <main className="min-h-screen bg-white dark:bg-slate-950 flex flex-col items-center justify-center p-6 pb-12 font-sans">
      <div className="w-full max-w-sm flex flex-col items-center">
        
        {/* Logo Placeholder */}
        <div className="mb-6 mt-8 flex flex-col items-center">
          <img src="/logo.png" alt="Kyvatron" className="h-[48px] object-contain" onError={(e) => {
            // Fallback if logo not found
            e.currentTarget.style.display = 'none';
            const span = document.createElement('span');
            span.innerHTML = '<span class="text-[#0047FF] font-bold text-3xl">K</span><span class="text-[#0F172A] dark:text-white font-bold text-2xl ml-1">Kyvatron</span>';
            e.currentTarget.parentNode?.appendChild(span);
          }} />
        </div>

        <div className="text-center mb-8">
          <h1 className="text-[26px] font-bold text-[#0F172A] dark:text-white mb-2 leading-tight">Forgot Password</h1>
          <p className="text-[14px] text-[#64748B] dark:text-slate-400 max-w-[280px] mx-auto leading-relaxed">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>
        
        {error && <p className="text-red-500 text-[13px] font-medium mb-4 w-full text-center bg-red-50 dark:bg-red-900/20 p-3 rounded-[12px]">{error}</p>}
        {success && <p className="text-[#16A34A] text-[13px] font-medium mb-4 w-full text-center bg-[#DCFCE7]/50 dark:bg-[#166534]/20 p-3 rounded-[12px]">{success}</p>}
        
        <form onSubmit={handleReset} className="w-full flex flex-col">
          <div className="space-y-4 mb-6">
            <div className="relative flex items-center">
              <div className="absolute left-4 z-10"><MailIcon /></div>
              <input 
                name="email"
                type="email"
                placeholder="Email Address" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-[52px] pl-[48px] pr-4 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-[12px] text-[15px] text-[#0F172A] dark:text-white placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#0047FF]/20 focus:border-[#0047FF] transition-all shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)]"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full h-[54px] bg-[#0047FF] hover:bg-blue-700 text-white font-bold text-[16px] rounded-[14px] transition-colors shadow-sm disabled:opacity-70 mb-6"
          >
            {isLoading ? 'Sending Link...' : 'Send Reset Link'}
          </button>
          
          <div className="text-center mb-8">
            <Link href="/login" className="text-[14px] font-medium text-[#0047FF] hover:underline flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Log In
            </Link>
          </div>
          
          <div className="text-center mt-auto">
            <p className="text-[12px] text-[#64748B] dark:text-slate-400 font-medium">
              By continuing, you agree to our <Link href="/terms" className="text-[#0047FF] hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-[#0047FF] hover:underline">Privacy Policy</Link>.
            </p>
          </div>
        </form>

      </div>
    </main>
  );
}
