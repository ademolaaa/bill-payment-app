'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase/client';

// SVG Icons
const MailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const EyeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.97 9.97 0 012.5-4.173M9.88 9.88a3 3 0 104.24 4.24M15 12a3 3 0 00-3-3m0 0a3 3 0 00-3 3M3 3l18 18" />
  </svg>
);

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!formData.email || !formData.password) {
      setError('Email and password are required.');
      setIsLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });
    
    if (error) {
      setError(error.message);
      setIsLoading(false);
    } else {
      router.push('/home');
    }
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
          <h1 className="text-[26px] font-bold text-[#0F172A] dark:text-white mb-2 leading-tight">Welcome back</h1>
          <p className="text-[14px] text-[#64748B] dark:text-slate-400">Log in to access your Kyvatron account</p>
        </div>
        
        {error && <p className="text-red-500 text-[13px] font-medium mb-4 w-full text-center">{error}</p>}
        
        <form onSubmit={handleLogin} className="w-full flex flex-col">
          <div className="space-y-4 mb-4">
            
            <div className="relative flex items-center">
              <div className="absolute left-4 z-10"><MailIcon /></div>
              <input 
                name="email"
                type="email"
                placeholder="Email Address" 
                value={formData.email}
                onChange={handleChange}
                className="w-full h-[52px] pl-[48px] pr-4 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-[12px] text-[15px] text-[#0F172A] dark:text-white placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#0047FF]/20 focus:border-[#0047FF] transition-all shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)]"
              />
            </div>

            <div className="relative flex items-center">
              <div className="absolute left-4 z-10"><LockIcon /></div>
              <input 
                name="password"
                type="password"
                placeholder="Password" 
                value={formData.password}
                onChange={handleChange}
                className="w-full h-[52px] pl-[48px] pr-[48px] bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-[12px] text-[15px] text-[#0F172A] dark:text-white placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#0047FF]/20 focus:border-[#0047FF] transition-all shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)]"
              />
              <div className="absolute right-4 z-10 cursor-pointer"><EyeOffIcon /></div>
            </div>
            
          </div>

          <div className="flex items-center justify-between w-full mb-8">
            <label className="flex items-center space-x-2 cursor-pointer group">
              <div className={`w-[18px] h-[18px] rounded-[4px] border ${rememberMe ? 'bg-[#0047FF] border-[#0047FF]' : 'bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-700 group-hover:border-[#0047FF] transition-colors'} flex items-center justify-center`}>
                {rememberMe && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <input 
                type="checkbox" 
                className="hidden" 
                checked={rememberMe} 
                onChange={(e) => setRememberMe(e.target.checked)} 
              />
              <span className="text-[13px] font-medium text-[#64748B] dark:text-slate-400">Remember me</span>
            </label>

            <Link href="/forgot-password" className="text-[13px] font-medium text-[#0047FF] hover:underline">
              Forgot Password?
            </Link>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full h-[54px] bg-[#0047FF] hover:bg-blue-700 text-white font-bold text-[16px] rounded-[14px] transition-colors shadow-sm disabled:opacity-70"
          >
            {isLoading ? 'Logging In...' : 'Log In'}
          </button>
          
          <div className="text-center mt-6 mb-8">
            <p className="text-[12px] text-[#64748B] dark:text-slate-400 font-medium">
              By logging in, you agree to our <Link href="/terms" className="text-[#0047FF] hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-[#0047FF] hover:underline">Privacy Policy</Link>.
            </p>
          </div>
        </form>

        <div className="text-center mt-auto">
          <p className="text-[#0F172A] dark:text-white font-medium text-[14px]">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-[#0047FF] hover:underline font-bold">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
