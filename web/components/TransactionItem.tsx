import React from 'react';
import Link from 'next/link';

interface TransactionItemProps {
  transaction: {
    id: string;
    type: string;
    amount: number;
    currency?: string;
    status: string;
    providerReference?: string;
  };
  dateStr?: string;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({ transaction, dateStr = 'Today' }) => {
  const isPositive = transaction.type === 'deposit' || transaction.type === 'refund';
  const currency = transaction.currency || 'NGN';
  
  const isInvestment = transaction.type === 'withdrawal' && (
    transaction.providerReference?.toLowerCase().includes('investment') || 
    transaction.providerReference?.toLowerCase().includes('roi') ||
    transaction.id?.includes('invest')
  );

  // Icon logic based on transaction type
  const getIcon = () => {
    if (isInvestment) {
      return (
        <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-950/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
        </div>
      );
    }

    switch (transaction.type) {
      case 'deposit': 
      case 'refund':
        return (
          <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-950/20 flex items-center justify-center text-green-600 dark:text-green-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 13l-5 5m0 0l-5-5m5 5V6" /></svg>
          </div>
        );
      case 'withdrawal':
        return (
          <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-950/20 flex items-center justify-center text-red-600 dark:text-red-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 11l5-5m0 0l5 5m-5-5v12" /></svg>
          </div>
        );
      case 'conversion':
        return (
          <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-950/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          </div>
        );
      case 'bill_payment':
      default:
        return (
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-950/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
          </div>
        );
    }
  };

  const formattedAmount = currency === 'USDT'
    ? `$${Math.abs(transaction.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT`
    : new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(Math.abs(transaction.amount));

  const isSuccess = transaction.status === 'successful' || transaction.status === 'completed';
  const isPending = transaction.status === 'pending';

  return (
    <Link href={`/history/${transaction.id}`} className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-50 dark:border-slate-800 mb-3 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
      <div className="flex items-center space-x-3">
        {getIcon()}
        <div>
          <h4 className="text-[15px] font-semibold text-gray-900 dark:text-white capitalize truncate max-w-[150px]">
            {isInvestment ? 'Investment' : (transaction.providerReference || (transaction.type === 'conversion' ? 'Conversion' : transaction.type === 'bill_payment' ? 'Bill Payment' : transaction.type))}
          </h4>
          <p className="text-[12px] text-gray-700 dark:text-slate-600">{dateStr}</p>
        </div>
      </div>
      <div className="text-right">
        <p className={`text-[15px] font-bold ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>
          {isPositive ? '+' : '-'}{formattedAmount}
        </p>
        <span className={`text-[11px] font-medium px-2 py-0.5 rounded capitalize ${
          isSuccess ? 'bg-[#DCFCE7] text-[#16A34A]' :
          isPending ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-600'
        }`}>
          {transaction.status}
        </span>
      </div>
    </Link>
  );
};
