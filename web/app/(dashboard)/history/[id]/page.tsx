'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '../../../../components/Button';
import { supabase } from '../../../../lib/supabase/client';

export default function ReceiptPage({ params }: { params: { id: string } }) {
  const [transaction, setTransaction] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactionDetails = async () => {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setError('Unauthorized');
          return;
        }

        const { data, error: dbError } = await supabase
          .from('transactions')
          .select('*')
          .eq('id', params.id)
          .single();

        if (dbError) {
          throw dbError;
        }

        setTransaction(data);
      } catch (err: any) {
        console.error('Error fetching transaction:', err);
        setError(err.message || 'Failed to fetch transaction details');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactionDetails();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="mt-4 text-sm text-gray-500 dark:text-slate-400">Loading receipt details...</p>
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-red-600 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Receipt Not Found</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-6">{error || 'This transaction could not be located in your history.'}</p>
        <Link href="/home">
          <Button variant="primary">Return Home</Button>
        </Link>
      </div>
    );
  }

  const isSuccess = transaction.status === 'successful' || transaction.status === 'completed';
  const isPending = transaction.status === 'pending';
  const isReversed = transaction.status === 'reversed';
  
  const isDeposit = transaction.type === 'deposit' || transaction.type === 'refund';
  
  const formattedAmount = transaction.currency === 'USDT'
    ? `$${Number(transaction.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT`
    : new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(Number(transaction.amount));

  // Type label formatter
  const getTypeLabel = () => {
    switch (transaction.type) {
      case 'deposit': return 'Wallet Funding';
      case 'bill_payment': return 'Utility Bill Payment';
      case 'withdrawal': return 'Withdrawal';
      case 'refund': return 'Wallet Refund';
      case 'conversion': return 'Currency Conversion';
      default: return transaction.type;
    }
  };

  // Payment method resolver
  const getPaymentMethod = () => {
    if (transaction.type === 'deposit') {
      return 'Flutterwave (Card/USSD)';
    }
    if (transaction.type === 'conversion') {
      const receiveCurrency = transaction.metadata?.receive_currency || (transaction.currency === 'NGN' ? 'USDT' : 'NGN');
      return `Wallet Conversion (${transaction.currency} → ${receiveCurrency})`;
    }
    if (transaction.type === 'bill_payment') {
      return `Kyvatron Wallet (${transaction.metadata?.category || 'Utility'})`;
    }
    return 'Kyvatron Wallet Balance';
  };

  const formattedDate = new Date(transaction.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 relative pb-24">
      
      {/* Header */}
      <header className="p-4 pt-10 flex items-center justify-between border-b border-gray-100 bg-white dark:bg-slate-900 shadow-sm relative z-10">
        <Link href="/home" className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:bg-slate-800 transition-colors cursor-pointer">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-900 dark:text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </Link>
        <h1 className="text-lg font-bold text-gray-900 dark:text-white absolute left-1/2 transform -translate-x-1/2">Transaction Receipt</h1>
        <div className="w-8"></div>
      </header>

      {/* Main Receipt Content */}
      <div className="flex-grow p-4 mt-4 w-full max-w-lg mx-auto">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-slate-800 relative overflow-hidden flex flex-col items-center">
          
          {/* Status Icon */}
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
            isSuccess ? 'bg-green-100 text-green-600 dark:bg-green-950/20 dark:text-green-400' :
            isPending ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-950/20 dark:text-yellow-400' :
            'bg-red-100 text-red-600 dark:bg-red-950/20 dark:text-red-400'
          }`}>
            {isSuccess ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            ) : isPending ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            )}
          </div>

          <p className="text-[14px] text-gray-500 dark:text-slate-400 font-medium mb-1 capitalize">{getTypeLabel()}</p>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight mb-8">
            {isDeposit ? '+' : '-'}{formattedAmount}
          </h2>

          {/* Receipt Details rows */}
          <div className="w-full border-t border-dashed border-gray-200 dark:border-slate-800 pt-6 space-y-5">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500 dark:text-slate-400">Status</span>
              <span className={`font-bold capitalize px-3 py-1 rounded-full text-[12px] ${
                isSuccess ? 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400' :
                isPending ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400' :
                isReversed ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400' :
                'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400'
              }`}>
                {transaction.status}
              </span>
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500 dark:text-slate-400">Date & Time</span>
              <span className="font-semibold text-gray-900 dark:text-white">{formattedDate}</span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500 dark:text-slate-400">Payment Method</span>
              <span className="font-semibold text-gray-900 dark:text-white text-right">{getPaymentMethod()}</span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500 dark:text-slate-400">Reference No.</span>
              <span className="font-semibold text-gray-900 dark:text-white tracking-wide text-right truncate max-w-[200px]" title={transaction.tx_ref}>
                {transaction.flw_transaction_id || transaction.tx_ref}
              </span>
            </div>

            {transaction.description && (
              <div className="flex justify-between items-start text-sm border-t border-gray-50 dark:border-slate-800 pt-4 mt-2">
                <span className="text-gray-500 dark:text-slate-400">Description</span>
                <span className="font-semibold text-gray-900 dark:text-white text-right max-w-[200px] leading-tight">
                  {transaction.description}
                </span>
              </div>
            )}
            
            {isReversed && transaction.metadata?.reversal_reason && (
              <div className="flex justify-between items-start text-sm border-t border-gray-50 dark:border-slate-800 pt-4 mt-2">
                <span className="text-red-500 dark:text-red-400">Refund Reason</span>
                <span className="font-semibold text-red-600 dark:text-red-400 text-right max-w-[200px] leading-tight">
                  {transaction.metadata.reversal_reason}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Share Button Overlay */}
      <div className="fixed bottom-24 left-0 w-full px-6 flex justify-center z-20 pointer-events-none">
        <div className="w-full max-w-sm pointer-events-auto shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-lg">
          <Button variant="primary" className="bg-blue-600 flex items-center justify-center space-x-2 w-full py-4 rounded-xl">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
             <span>Share Receipt</span>
          </Button>
        </div>
      </div>

    </div>
  );
}
