'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { supabase } from '../../lib/supabase/client';

// SVG Icons
const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const MailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const EyeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.97 9.97 0 012.5-4.173M9.88 9.88a3 3 0 104.24 4.24M15 12a3 3 0 00-3-3m0 0a3 3 0 00-3 3M3 3l18 18" />
  </svg>
);

const TagIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
  </svg>
);

export default function SignUpPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    referralCode: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!formData.email || !formData.password || !formData.firstName || !formData.lastName) {
      setError('All fields except Referral Code are required.');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      setIsLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: `${formData.firstName} ${formData.lastName}`.trim(),
          referred_by: formData.referralCode || null,
        }
      }
    });
    
    if (signUpError) {
      setError(signUpError.message);
      setIsLoading(false);
    } else if (signUpData.user) {
      // If sign up is successful, try to set up the wallet
      // Note: We ignore errors here so the user can still log in even if wallet creation fails temporarily
      try {
        await fetch('/api/user/setup-wallet', {
          method: 'POST',
        });
      } catch (e) {
        console.error('Initial wallet setup failed:', e);
      }
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
          <h1 className="text-[26px] font-bold text-[#0F172A] dark:text-white mb-2 leading-tight">Create your account</h1>
          <p className="text-[14px] text-[#64748B] dark:text-slate-400">Join Kyvatron and start trading profitably today</p>
        </div>
        
        {error && <p className="text-red-500 text-[13px] font-medium mb-4 w-full text-center">{error}</p>}
        
        <form onSubmit={handleSignUp} className="w-full flex flex-col">
          <div className="space-y-4 mb-8">
            
            <Input 
              name="firstName"
              placeholder="First Name" 
              value={formData.firstName}
              onChange={handleChange}
              iconLeft={<UserIcon />}
              aria-label="First Name"
              required
            />

            <Input 
              name="lastName"
              placeholder="Last Name" 
              value={formData.lastName}
              onChange={handleChange}
              iconLeft={<UserIcon />}
              aria-label="Last Name"
              required
            />

            <Input 
              name="email"
              type="email"
              placeholder="Email Address" 
              value={formData.email}
              onChange={handleChange}
              iconLeft={<MailIcon />}
              aria-label="Email Address"
              required
            />

            <Input 
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password" 
              value={formData.password}
              onChange={handleChange}
              iconLeft={<LockIcon />}
              iconRight={
                <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"}>
                  <EyeOffIcon />
                </button>
              }
              aria-label="Password"
              required
            />

            <Input 
              name="confirmPassword"
              type={showPassword ? "text" : "password"}
              placeholder="Confirm Password" 
              value={formData.confirmPassword}
              onChange={handleChange}
              iconLeft={<LockIcon />}
              iconRight={
                <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"}>
                  <EyeOffIcon />
                </button>
              }
              aria-label="Confirm Password"
              required
            />

            <Input 
              name="referralCode"
              placeholder="Referral Code (Optional)" 
              value={formData.referralCode}
              onChange={handleChange}
              iconLeft={<TagIcon />}
              aria-label="Referral Code"
            />
            
          </div>

          <Button 
            type="submit" 
            disabled={isLoading}
            className="h-[54px] bg-[#0047FF] hover:bg-blue-700 text-white font-bold text-[16px] rounded-[14px] transition-colors shadow-sm disabled:opacity-70"
          >
            {isLoading ? 'Signing Up...' : 'Sign Up'}
          </Button>
          
          <div className="text-center mt-6 mb-8">
            <p className="text-[12px] text-[#64748B] dark:text-slate-400 font-medium">
              By signing up, you agree to our <a href="https://kyvatron.com/terms-and-conditions" target="_blank" rel="noopener noreferrer" className="text-[#0047FF] hover:underline">Terms of Service</a> and <a href="https://kyvatron.com/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-[#0047FF] hover:underline">Privacy Policy</a>.
            </p>
          </div>
        </form>

        <div className="text-center mt-auto">
          <p className="text-[#0F172A] dark:text-white font-medium text-[14px]">
            Already have an account?{' '}
            <Link href="/login" className="text-[#0047FF] hover:underline font-bold">
              Log In
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
