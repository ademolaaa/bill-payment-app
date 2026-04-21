'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Dummy state auth logic
    console.log('Logging in with', formData);
    router.push('/home');
  };

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center p-6 pt-24">
      <div className="w-full max-w-sm flex flex-col">
        <h1 className="text-3xl font-bold text-[#1a202c] mb-8">Log In</h1>
        
        <form onSubmit={handleLogin} className="flex flex-col flex-grow">
          <div className="space-y-1 mb-2">
             <Input 
               label="Email"
               name="email"
               type="email"
               placeholder="example@email.com" 
               value={formData.email}
               onChange={handleChange}
             />
             <Input 
               label="Password"
               name="password"
               type="password"
               placeholder="••••••••" 
               value={formData.password}
               onChange={handleChange}
             />
          </div>

          <div className="flex justify-end w-full mb-6 mt-[-10px]">
            <Link href="/forgot-password" className="text-sm font-medium text-blue-600 hover:text-blue-700">
              Forgot password?
            </Link>
          </div>

          <Button type="submit" variant="primary">Log In</Button>
          
          <div className="text-center mt-6">
            <p className="text-[#1a202c] font-medium text-[15px]">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-blue-600 hover:text-blue-700 font-semibold">
                Sign Up
              </Link>
            </p>
          </div>
        </form>
      </div>
    </main>
  );
}
