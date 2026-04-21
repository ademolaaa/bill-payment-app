'use client';

import React from 'react';
import { Button } from '../../../../components/Button';
import { Input } from '../../../../components/Input';

export default function DeleteAccountPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white pb-24">
      <header className="px-5 pt-12 pb-4 border-b border-gray-100">
        <h1 className="text-[26px] font-bold text-red-600">Delete Account</h1>
      </header>

      <div className="px-5 pt-6">
        <div className="bg-red-50 border border-red-100 rounded-xl p-5 mb-6">
          <h2 className="text-red-700 font-bold mb-2">Warning: Permanent Action</h2>
          <p className="text-red-600 text-sm leading-relaxed">
            Deleting your account will permanently remove all your data, transaction history, and funds associated with this account. This action cannot be undone.
          </p>
        </div>

        <form className="space-y-4">
          <Input 
            label="Type 'DELETE' to confirm" 
            placeholder="DELETE" 
          />
          <Input 
            label="Password" 
            type="password" 
            placeholder="Enter your password" 
          />
          <div className="pt-6">
            <Button type="button" className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg py-3.5 px-4 transition-colors duration-200">
              Permanently Delete Account
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
