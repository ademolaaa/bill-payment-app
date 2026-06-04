'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { supabase } from '../../lib/supabase/client';

// SVG Icons
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

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // MFA states
  const [showMFA, setShowMFA] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  const [mfaFactorId, setMfaFactorId] = useState('');

  // Check if session is already active but requires MFA promotion (AAL1 -> AAL2)
  useEffect(() => {
    const checkActiveMfaSession = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
        if (aalData && aalData.nextLevel === 'aal2' && aalData.currentLevel === 'aal1') {
          const { data: factorsData } = await supabase.auth.mfa.listFactors();
          const verifiedFactor = factorsData?.totp?.find(f => f.status === 'verified');
          if (verifiedFactor) {
            setMfaFactorId(verifiedFactor.id);
            setShowMFA(true);
          }
        }
      } catch (err) {
        console.error('Error checking active MFA session:', err);
      }
    };
    
    checkActiveMfaSession();
  }, []);

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

    try {
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });
      
      if (loginError) {
        setError(loginError.message);
        setIsLoading(false);
        return;
      }

      // Check if MFA is required
      const { data: aalData, error: aalError } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aalError) {
        setError(aalError.message);
        setIsLoading(false);
        return;
      }

      if (aalData.nextLevel === 'aal2' && aalData.currentLevel === 'aal1') {
        // MFA enrolled but not verified yet for this session. Get factors.
        const { data: factorsData, error: factorsError } = await supabase.auth.mfa.listFactors();
        if (factorsError) {
          setError(factorsError.message);
          setIsLoading(false);
          return;
        }

        const verifiedFactor = factorsData?.totp?.find(f => f.status === 'verified');
        if (verifiedFactor) {
          setMfaFactorId(verifiedFactor.id);
          setShowMFA(true);
          setIsLoading(false);
        } else {
          // If no verified factor is found despite nextLevel being aal2, log them in
          router.push('/home');
        }
      } else {
        router.push('/home');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during login.');
      setIsLoading(false);
    }
  };

  const handleVerifyMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mfaCode.length !== 6 || !mfaFactorId) return;

    setError(null);
    setIsLoading(true);

    try {
      // Challenge the MFA factor
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: mfaFactorId
      });
      if (challengeError) throw challengeError;

      // Verify the challenge code
      const { data: verifyData, error: verifyError } = await supabase.auth.mfa.verify({
        factorId: mfaFactorId,
        challengeId: challengeData.id,
        code: mfaCode
      });
      if (verifyError) throw verifyError;

      router.push('/home');
    } catch (err: any) {
      setError(err.message || 'MFA verification failed. Please try again.');
      setIsLoading(false);
    }
  };

  const handleCancelMfa = async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Error signing out during MFA cancel:', err);
    }
    setShowMFA(false);
    setMfaCode('');
    setMfaFactorId('');
    setError(null);
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

        {showMFA ? (
          <div className="w-full flex flex-col items-center">
            <div className="text-center mb-8">
              <h1 className="text-[26px] font-bold text-[#0F172A] dark:text-white mb-2 leading-tight">Security Code</h1>
              <p className="text-[14px] text-[#64748B] dark:text-slate-400">Enter the 6-digit code from your authenticator app</p>
            </div>
            
            {error && <p className="text-red-500 text-[13px] font-medium mb-4 w-full text-center">{error}</p>}
            
            <form onSubmit={handleVerifyMfa} className="w-full flex flex-col">
              <div className="flex justify-center mb-8">
                <input 
                  type="text"
                  maxLength={6}
                  placeholder="000000"
                  className="w-full max-w-[220px] text-center text-3xl font-bold tracking-[12px] py-4 border-2 border-gray-200 dark:border-slate-700 rounded-2xl focus:border-[#0047FF] focus:outline-none bg-transparent text-gray-900 dark:text-white"
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                  autoFocus
                  required
                />
              </div>

              <Button 
                type="submit" 
                disabled={isLoading || mfaCode.length !== 6}
                className="h-[54px] bg-[#0047FF] hover:bg-blue-700 text-white font-bold text-[16px] rounded-[14px] transition-colors shadow-sm disabled:opacity-70"
              >
                {isLoading ? 'Verifying...' : 'Verify & Log In'}
              </Button>
              
              <button 
                type="button"
                onClick={handleCancelMfa}
                disabled={isLoading}
                className="mt-5 text-[14px] font-bold text-[#64748B] hover:text-[#0F172A] dark:hover:text-white transition-colors py-2"
              >
                Cancel
              </button>
            </form>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center">
            <div className="text-center mb-8">
              <h1 className="text-[26px] font-bold text-[#0F172A] dark:text-white mb-2 leading-tight">Welcome back</h1>
              <p className="text-[14px] text-[#64748B] dark:text-slate-400">Log in to access your Kyvatron account</p>
            </div>
            
            {error && <p className="text-red-500 text-[13px] font-medium mb-4 w-full text-center">{error}</p>}
            
            <form onSubmit={handleLogin} className="w-full flex flex-col">
              <div className="space-y-4 mb-4">
                
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

              <Button 
                type="submit" 
                disabled={isLoading}
                className="h-[54px] bg-[#0047FF] hover:bg-blue-700 text-white font-bold text-[16px] rounded-[14px] transition-colors shadow-sm disabled:opacity-70"
              >
                {isLoading ? 'Logging In...' : 'Log In'}
              </Button>
              
              <div className="text-center mt-6 mb-8">
                <p className="text-[12px] text-[#64748B] dark:text-slate-400 font-medium">
                  By logging in, you agree to our <a href="https://kyvatron.com/terms-and-conditions" target="_blank" rel="noopener noreferrer" className="text-[#0047FF] hover:underline">Terms of Service</a> and <a href="https://kyvatron.com/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-[#0047FF] hover:underline">Privacy Policy</a>.
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
        )}
      </div>
    </main>
  );
}
