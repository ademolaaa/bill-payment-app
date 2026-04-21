'use client';

import React from 'react';
import Link from 'next/link';
import { TransactionItem } from '../../../components/TransactionItem';
import { Transaction } from '../../../types/database';

// Dummy Data mapped to grouped dates
const transactionHistory: { date: string; data: Transaction[] }[] = [
  {
    date: 'Today, 21 Apr',
    data: [
      { id: 't1', userId: 'u1', type: 'deposit', amount: 150000, status: 'completed', providerReference: 'Salary Deposit' },
      { id: 't2', userId: 'u1', type: 'payment', amount: -6500, status: 'completed', providerReference: 'Netflix Subscription' },
      { id: 't3', userId: 'u1', type: 'transfer', amount: -25000, status: 'pending', providerReference: 'Transfer to Mom' },
    ]
  },
  {
    date: 'Yesterday, 20 Apr',
    data: [
      { id: 't4', userId: 'u1', type: 'payment', amount: -4500, status: 'completed', providerReference: 'Starbucks Coffee' },
      { id: 't5', userId: 'u1', type: 'deposit', amount: 45000, status: 'completed', providerReference: 'Client Freelance Payment' },
      { id: 't6', userId: 'u1', type: 'transfer', amount: -12000, status: 'failed', providerReference: 'Transfer to Electrician' },
    ]
  }
];

export default function HistoryPage() {
  return (
    <div className="flex flex-col p-4 pt-10 min-h-screen bg-slate-50">
      <header className="mb-6 flex items-center">
        <Link href="/home" className="mr-3 p-2 bg-white rounded-full shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Transaction History</h1>
      </header>

      {/* Filter Tabs (Dummy visual only) */}
      <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
         {['All', 'Incoming', 'Outgoing', 'Failed'].map((tab, idx) => (
           <span key={tab} className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${idx === 0 ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>
             {tab}
           </span>
         ))}
      </div>

      {/* Grouped Transactions List */}
      <div className="flex-grow pb-12">
        {transactionHistory.map((group, groupIdx) => (
          <div key={groupIdx} className="mb-6">
            <h3 className="text-[13px] font-bold text-gray-500 uppercase tracking-wider mb-3 px-1">{group.date}</h3>
            <div className="flex flex-col">
              {group.data.map((tx) => (
                <TransactionItem key={tx.id} transaction={tx} dateStr={group.date} />
              ))}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
