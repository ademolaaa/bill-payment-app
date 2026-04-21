import React from 'react';
import Link from 'next/link';
import { Transaction } from '../types/database';

interface TransactionItemProps {
  transaction: Transaction;
  dateStr?: string; // Optional formatted date string for display since dummy doesn't have it natively
}

export const TransactionItem: React.FC<TransactionItemProps> = ({ transaction, dateStr = 'Today' }) => {
  const isPositive = transaction.type === 'deposit' || transaction.type === 'transfer' && transaction.amount > 0; // rough guess based on type
  
  // A simple icon logic
  const getIcon = () => {
    switch(transaction.type) {
      case 'deposit': 
        return (
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" /></svg>
          </div>
        );
      case 'withdrawal':
        return (
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" /></svg>
          </div>
        );
      case 'payment':
        return (
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
          </div>
        );
    }
  };

  const formattedAmount = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(Math.abs(transaction.amount));

  return (
    <Link href={`/history/${transaction.id}`} className="flex items-center justify-between p-3 bg-white rounded-xl shadow-sm border border-gray-50 mb-3 hover:bg-gray-50 transition-colors">
      <div className="flex items-center space-x-3">
        {getIcon()}
        <div>
          <h4 className="text-[15px] font-semibold text-gray-900 capitalize">{transaction.providerReference || transaction.type}</h4>
          <p className="text-[12px] text-gray-500">{dateStr}</p>
        </div>
      </div>
      <div className="text-right">
        <p className={`text-[15px] font-semibold ${isPositive ? 'text-green-600' : 'text-gray-900'}`}>
          {isPositive ? '+' : '-'}{formattedAmount}
        </p>
        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
          transaction.status === 'completed' ? 'bg-green-100 text-green-700' :
          transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
        }`}>
          {transaction.status === 'completed' ? 'Success' : transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
        </span>
      </div>
    </Link>
  );
};
