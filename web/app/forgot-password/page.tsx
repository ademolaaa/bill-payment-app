'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    // Dummy state auth logic
    console.log('Resetting password for', email);
  };

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center p-6 pt-24">
      <div className="w-full max-w-sm flex flex-col h-full">
        <h1 className="text-3xl font-bold text-[#1a202c] mb-4">Forgot Password</h1>
        
        <p className="text-gray-800 text-[17px] mb-8 leading-relaxed">
          Enter your email address and we will send you a link to reset your password.
        </p>

        <form onSubmit={handleReset} className="flex flex-col flex-grow">
          <div className="mb-6">
             <Input 
               label="Email address"
               name="email"
               type="email"
               value={email}
               onChange={(e) => setEmail(e.target.value)}
             />
          </div>

          <Button type="submit" variant="primary">Reset Password</Button>
        </form>

        <div className="mt-auto pb-8 w-full text-center fixed bottom-0 left-0">
           <Link href="/login" className="text-[#1a202c] font-medium text-[15px] hover:text-blue-700">
             Back to Login
           </Link>
        </div>
      </div>
    </main>
  );
}
