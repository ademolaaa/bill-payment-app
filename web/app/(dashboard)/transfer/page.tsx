'use client';

import React from 'react';
import { Button } from '../../../components/Button';
import { Input } from '../../../components/Input';

export default function TransferPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 pb-24">
      <header className="px-5 pt-12 pb-4 border-b border-gray-100 bg-white dark:bg-slate-900">
        <h1 className="text-[24px] font-bold text-gray-900 dark:text-white">Transfer</h1>
        <p className="text-gray-700 dark:text-slate-600 text-sm mt-1">Send funds to another Kyvatron user</p>
      </header>

      <div className="px-5 pt-6">
        <form className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-100 shadow-sm mt-2">
          <Input 
            label="Recipient Email or Username" 
            placeholder="e.g. user@kyvatron.com" 
          />
          <Input 
            label="Amount" 
            placeholder="0.00" 
            type="number" 
          />
          <Input 
            label="Note (Optional)" 
            placeholder="What's this for?" 
          />
          <div className="mt-8">
            <Button type="submit">Send Transfer</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
