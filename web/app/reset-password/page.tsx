'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { supabase } from '../../lib/supabase/client';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if user has an active session when they land on this page
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('Your password reset link is invalid or has expired. Please try requesting a new one.');
      }
    };
    checkSession();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setIsLoading(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: password
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
    } else {
      setSuccess('Your password has been updated successfully! Redirecting...');
      setTimeout(() => {
        router.push('/home');
      }, 2000);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center p-6 pt-24">
      <div className="w-full max-w-sm flex flex-col">
        <h1 className="text-3xl font-bold text-[#1a202c] dark:text-white mb-2">Set New Password</h1>
        <p className="text-gray-500 dark:text-slate-400 text-sm mb-8">Please enter your new password below.</p>
        
        {error && <p className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}
        {success && <p className="text-green-600 text-sm mb-4 bg-green-50 p-3 rounded-lg border border-green-100">{success}</p>}
        
        <form onSubmit={handleUpdate} className="flex flex-col flex-grow">
          <div className="space-y-4 mb-8">
             <Input 
               label="New Password"
               name="password"
               type="password"
               placeholder="••••••••" 
               value={password}
               onChange={(e) => setPassword(e.target.value)}
             />
             <Input 
               label="Confirm New Password"
               name="confirmPassword"
               type="password"
               placeholder="••••••••" 
               value={confirmPassword}
               onChange={(e) => setConfirmPassword(e.target.value)}
             />
          </div>

          <Button type="submit" variant="primary" disabled={isLoading || !!success}>
            {isLoading ? 'Updating...' : 'Update Password'}
          </Button>
        </form>
      </div>
    </main>
  );
}
