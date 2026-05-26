'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '../../../components/Button';
import { supabase } from '../../../lib/supabase/client';

export default function ConvertPage() {
  const [fromCurrency, setFromCurrency] = useState<'NGN' | 'USDT'>('NGN');
  const [amount, setAmount] = useState('');
  const [balanceNGN, setBalanceNGN] = useState<number>(0);
  const [balanceUSDT, setBalanceUSDT] = useState<number>(0);
  const [loadingBalances, setLoadingBalances] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fixed dummy exchange rate
  const exchangeRate = 1215.00;
  const numAmount = parseFloat(amount) || 0;
  
  // Calculate preview
  const convertAmount = Math.max(0, numAmount);
  // Fee calculation: 2% for USDT, flat 500 NGN for NGN
  const fees = fromCurrency === 'NGN' ? (convertAmount > 0 ? 500 : 0) : (convertAmount > 0 ? convertAmount * 0.02 : 0);
  const receiveAmount = fromCurrency === 'NGN' 
    ? (convertAmount > fees ? (convertAmount - fees) / exchangeRate : 0)
    : (convertAmount > fees ? (convertAmount - fees) * exchangeRate : 0);

  const fetchBalances = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('balance_ngn, balance_usdt')
        .eq('id', user.id)
        .single();
        
      if (profile) {
        setBalanceNGN(Number(profile.balance_ngn) || 0);
        setBalanceUSDT(Number(profile.balance_usdt) || 0);
      }
    } catch (err) {
      console.error('Error fetching balances:', err);
    } finally {
      setLoadingBalances(false);
    }
  };

  useEffect(() => {
    fetchBalances();
  }, []);

  const handleSwap = () => {
    setFromCurrency(prev => prev === 'NGN' ? 'USDT' : 'NGN');
    setAmount('');
    setMessage(null);
  };

  const handleConvert = async () => {
    if (!amount || numAmount <= 0) {
      setMessage({ type: 'error', text: 'Please enter a valid amount to convert' });
      return;
    }

    const currentBalance = fromCurrency === 'NGN' ? balanceNGN : balanceUSDT;
    if (numAmount > currentBalance) {
      setMessage({ type: 'error', text: `Insufficient ${fromCurrency} balance to convert ${numAmount.toLocaleString()} ${fromCurrency}` });
      return;
    }

    if (numAmount <= fees) {
      setMessage({ type: 'error', text: `Amount must be greater than the conversion fee of ${fees.toLocaleString()} ${fromCurrency}` });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch('/api/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from_currency: fromCurrency,
          amount: numAmount,
          exchange_rate: exchangeRate,
          fees: fees
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to convert currency');
      }

      const receivedText = fromCurrency === 'NGN' 
        ? `${data.receive_amount.toLocaleString('en-US', { minimumFractionDigits: 4 })} USDT`
        : `${data.receive_amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })} NGN`;

      setMessage({ 
        type: 'success', 
        text: `Successfully converted ${numAmount.toLocaleString()} ${fromCurrency}! Received ${receivedText}` 
      });
      setAmount('');
      await fetchBalances();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Something went wrong' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC] dark:bg-slate-950 pb-24">
      {/* Header */}
      <header className="px-5 pt-12 pb-6 flex items-center justify-between">
        <h1 className="text-[28px] font-bold text-[#0F172A] dark:text-white">Convert</h1>
        <Link href="/history?type=conversion" className="w-10 h-10 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center shadow-sm text-[#0F172A] dark:text-white border border-gray-100 dark:border-slate-800 hover:bg-gray-50 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </Link>
      </header>

      <div className="px-5 flex flex-col space-y-6">
        
        {/* Available Balances Card */}
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
          <h2 className="text-[16px] font-bold text-[#0F172A] dark:text-white mb-4">Available Balances</h2>
          
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[#E0E7FF] dark:bg-blue-900/30 rounded-full flex items-center justify-center text-[#0047FF] font-bold text-[12px]">
                NGN
              </div>
              <span className="text-[15px] text-[#475569] dark:text-slate-300">NGN Balance</span>
            </div>
            <span className="text-[15px] font-medium text-[#0F172A] dark:text-white">
              {loadingBalances ? 'Loading...' : `${balanceNGN.toLocaleString('en-NG', { minimumFractionDigits: 2 })} NGN`}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-[#16a34a] rounded-full flex items-center justify-center text-white font-bold text-[10px]">
                T
              </div>
              <span className="text-[15px] text-[#475569] dark:text-slate-300">USDT Balance</span>
            </div>
            <span className="text-[15px] font-medium text-[#0F172A] dark:text-white">
              {loadingBalances ? 'Loading...' : `${balanceUSDT.toLocaleString('en-US', { minimumFractionDigits: 2 })} USDT`}
            </span>
          </div>
        </div>

        {/* Conversion Form */}
        <div className="flex flex-col space-y-2 relative">
          
          {/* From Section */}
          <div>
            <label className="block text-[15px] font-bold text-[#0F172A] dark:text-white mb-2">From</label>
            
            {/* Currency Dropdown */}
            <div className="relative">
              <select 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                value={fromCurrency}
                onChange={(e) => {
                  const newCurrency = e.target.value as 'NGN' | 'USDT';
                  if (newCurrency !== fromCurrency) {
                    handleSwap();
                  }
                }}
                title="Select From Currency"
              >
                <option value="NGN">NGN</option>
                <option value="USDT">USDT</option>
              </select>
              <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-4 mb-3 shadow-sm relative pointer-events-none">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-[#E0E7FF] dark:bg-blue-900/30 rounded-full flex items-center justify-center text-[#0047FF] font-bold text-[12px]">
                    {fromCurrency}
                  </div>
                  <span className="text-[15px] font-medium text-[#334155] dark:text-slate-200">{fromCurrency}</span>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Amount Input */}
            <div className="bg-white dark:bg-slate-900 border border-blue-400 dark:border-blue-500/50 rounded-2xl p-4 shadow-sm ring-1 ring-blue-100 dark:ring-blue-900/30 relative flex items-center">
              <div className="flex-1">
                <label className="block text-[13px] text-gray-500 dark:text-slate-400 mb-1">Enter Amount</label>
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-lg bg-[#F0F5FF] dark:bg-[#1D4ED8]/20 flex items-center justify-center text-[#0047FF] dark:text-blue-400 font-bold text-[14px] mr-3">
                    {fromCurrency === 'NGN' ? '₦' : '$'}
                  </div>
                  <input 
                    type="number"
                    placeholder="0.00"
                    className="w-full bg-transparent text-[22px] font-bold text-[#0F172A] dark:text-white focus:outline-none placeholder-gray-300 dark:placeholder-gray-500"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    disabled={submitting}
                  />
                </div>
              </div>
              <div className="text-[14px] font-bold text-gray-400 ml-2">{fromCurrency}</div>
            </div>
          </div>

          {/* Swap Button */}
          <div className="relative h-4 flex justify-center items-center z-10">
            <button 
              onClick={handleSwap}
              disabled={submitting}
              className="absolute bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 shadow-md rounded-full px-4 py-2 flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
              <span className="text-[14px] font-semibold">Swap</span>
            </button>
          </div>

          {/* To Section */}
          <div className="pt-2">
            <label className="block text-[15px] font-bold text-[#0F172A] dark:text-white mb-2">To</label>
            
            {/* Currency Dropdown */}
            <div className="relative">
              <select 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                value={fromCurrency === 'NGN' ? 'USDT' : 'NGN'}
                onChange={(e) => {
                  const newCurrency = e.target.value as 'NGN' | 'USDT';
                  const currentToCurrency = fromCurrency === 'NGN' ? 'USDT' : 'NGN';
                  if (newCurrency !== currentToCurrency) {
                    handleSwap();
                  }
                }}
                title="Select To Currency"
              >
                <option value="NGN">NGN</option>
                <option value="USDT">USDT</option>
              </select>
              <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-4 shadow-sm relative pointer-events-none">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-[#E0E7FF] dark:bg-blue-900/30 rounded-full flex items-center justify-center text-[#0047FF] font-bold text-[12px]">
                    {fromCurrency === 'NGN' ? 'USDT' : 'NGN'}
                  </div>
                  <span className="text-[15px] font-medium text-[#334155] dark:text-slate-200">{fromCurrency === 'NGN' ? 'USDT' : 'NGN'}</span>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Preview Card */}
        <div className="bg-[#F8FAFC] dark:bg-slate-800/50 rounded-2xl p-5 border border-gray-50 dark:border-slate-800 mt-2">
          <h3 className="text-[15px] font-bold text-[#0F172A] dark:text-white mb-4">Conversion Preview</h3>
          
          <div className="flex justify-between items-center mb-4">
            <span className="text-[14px] text-[#475569] dark:text-slate-400">Current Exchange Rate</span>
            <span className="text-[14px] font-medium text-[#0F172A] dark:text-white">
              {`1 USDT = ${exchangeRate.toLocaleString('en-NG', {minimumFractionDigits:2})} NGN`}
            </span>
          </div>
          
          <div className="h-[1px] bg-gray-200 dark:bg-slate-700 w-full mb-4"></div>
          
          <div className="flex justify-between items-center mb-3">
            <span className="text-[14px] text-[#475569] dark:text-slate-400">Fees ({fromCurrency})</span>
            <span className="text-[14px] font-medium text-[#0F172A] dark:text-white">
              {fees.toLocaleString('en-NG', {minimumFractionDigits:2})} {fromCurrency}
            </span>
          </div>
          
          <div className="flex justify-between items-center mb-3">
            <span className="text-[14px] text-[#475569] dark:text-slate-400">You will convert ({fromCurrency})</span>
            <span className="text-[14px] font-medium text-[#0F172A] dark:text-white">
              {convertAmount.toLocaleString('en-NG', {minimumFractionDigits:2})} {fromCurrency}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-[14px] text-[#475569] dark:text-slate-400">You will receive ({fromCurrency === 'NGN' ? 'USDT' : 'NGN'})</span>
            <span className="text-[14px] font-medium text-[#0F172A] dark:text-white">
              {receiveAmount.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:4})} {fromCurrency === 'NGN' ? 'USDT' : 'NGN'}
            </span>
          </div>
        </div>

        {/* Success/Error Message */}
        {message && (
          <div className={`p-4 rounded-2xl text-[14px] font-semibold border ${
            message.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-950/20 dark:border-green-900/30 dark:text-green-400' 
              : 'bg-red-50 border-red-200 text-red-700 dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-400'
          }`}>
            {message.text}
          </div>
        )}

        {/* Confirm Button */}
        <div className="pt-2">
          <Button 
            onClick={handleConvert}
            disabled={submitting}
            className="w-full rounded-[14px] bg-[#0047FF] hover:bg-blue-700 py-4 flex items-center justify-center text-[16px] disabled:opacity-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            {submitting ? 'Converting...' : 'Confirm Conversion'}
          </Button>
        </div>

      </div>
    </div>
  );
}
