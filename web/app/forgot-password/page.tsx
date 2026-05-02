'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { supabase } from '../../lib/supabase/client';

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
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center p-6 pt-24">
      <div className="w-full max-w-sm flex flex-col">
        <h1 className="text-3xl font-bold text-[#1a202c] dark:text-white mb-2">Reset Password</h1>
        <p className="text-gray-500 dark:text-slate-400 text-sm mb-8">Enter your email and we'll send you a link to reset your password.</p>
        
        {error && <p className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}
        {success && <p className="text-green-600 text-sm mb-4 bg-green-50 p-3 rounded-lg border border-green-100">{success}</p>}
        
        <form onSubmit={handleReset} className="flex flex-col flex-grow">
          <div className="space-y-4 mb-8">
             <Input 
               label="Email Address"
               name="email"
               type="email"
               placeholder="example@email.com" 
               value={email}
               onChange={(e) => setEmail(e.target.value)}
             />
          </div>

          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading ? 'Sending Link...' : 'Send Reset Link'}
          </Button>
          
          <div className="text-center mt-6">
            <Link href="/login" className="text-blue-600 hover:text-blue-700 font-semibold text-sm">
              &larr; Back to Log In
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
