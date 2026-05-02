'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { supabase } from '../../lib/supabase/client';

export default function SignUpPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!formData.email || !formData.password || !formData.fullName) {
      setError('All fields are required.');
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

    const { error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.fullName,
        }
      }
    });
    
    if (error) {
      setError(error.message);
      setIsLoading(false);
    } else {
      router.push('/home');
    }
  };

  const lockIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
    </svg>
  );

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm flex flex-col">
        <h1 className="text-3xl font-bold text-[#1a202c] dark:text-white mb-8">Sign Up</h1>
        
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        
        <form onSubmit={handleSignUp} className="flex flex-col flex-grow">
          <div className="space-y-4 mb-6">
             <Input 
               name="fullName"
               placeholder="Full Name" 
               value={formData.fullName}
               onChange={handleChange}
             />
             <Input 
               name="email"
               type="email"
               placeholder="Email" 
               value={formData.email}
               onChange={handleChange}
             />
             <Input 
               name="password"
               type="password"
               placeholder="Password" 
               icon={lockIcon}
               value={formData.password}
               onChange={handleChange}
             />
             <Input 
               name="confirmPassword"
               type="password"
               placeholder="Confirm Password" 
               value={formData.confirmPassword}
               onChange={handleChange}
             />
          </div>

          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </Button>
          
          <div className="text-center mt-4">
            <p className="text-sm text-gray-500 dark:text-slate-400 font-medium px-4">
              By signing up, you agree to our <br className="hidden sm:block"/>
              <Link href="/terms" className="text-blue-600 hover:text-blue-700">Terms of Service</Link> and <Link href="/privacy" className="text-blue-600 hover:text-blue-700">Privacy Policy</Link>.
            </p>
          </div>
        </form>

        <div className="text-center mt-12 mb-4">
          <p className="text-[#1a202c] dark:text-white font-medium text-[15px]">
            Already have an account?
            <span className="block mt-1">
              <Link href="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
                Log In
              </Link>
            </span>
          </p>
        </div>
      </div>
    </main>
  );
}
