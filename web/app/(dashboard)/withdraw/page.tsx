'use client';

import React from 'react';
import { Button } from '../../../components/Button';
import { Input } from '../../../components/Input';

export default function WithdrawPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-24">
      <header className="px-5 pt-12 pb-4 border-b border-gray-100 bg-white">
        <h1 className="text-[24px] font-bold text-gray-900">Withdraw</h1>
        <p className="text-gray-500 text-sm mt-1">Send funds to your local bank or crypto wallet</p>
      </header>

      <div className="px-5 pt-6">
        <form className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm mt-2">
          <div className="mb-4">
            <label className="block text-gray-800 text-[15px] font-medium mb-1.5">Withdraw Method</label>
            <select className="w-full border border-gray-200 rounded-xl py-3.5 px-4 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-[15px]">
              <option>Local Bank Transfer</option>
              <option>USDT (TRC20)</option>
            </select>
          </div>
          
          <Input 
            label="Amount" 
            placeholder="0.00" 
            type="number" 
          />
          <Input 
            label="Destination Account / Address" 
            placeholder="Account Number or Wallet Address" 
          />
          <div className="mt-8">
            <Button type="submit">Submit Withdrawal</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
