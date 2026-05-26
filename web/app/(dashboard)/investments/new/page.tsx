'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '../../../../components/Button';
import { supabase } from '../../../../lib/supabase/client';

interface Investment {
  id: string;
  currency: string;
  amount: number;
  duration_months: number;
  roi_percent: number;
  roi_amount: number;
  total_amount: number;
  status: string;
  invested_at: string;
  maturity_date: string;
}

export default function NewInvestmentPage() {
  const [currency, setCurrency] = useState('NGN');
  const [packageType, setPackageType] = useState('3');
  const [amount, setAmount] = useState('');
  
  // Balances
  const [balanceNGN, setBalanceNGN] = useState<number>(0);
  const [balanceUSDT, setBalanceUSDT] = useState<number>(0);
  
  // Investments list state
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loadingInvestments, setLoadingInvestments] = useState(true);
  
  // Action states
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Package logic
  let roiPercent = 11;
  let durationText = '3 Months';
  if (packageType === '6') {
    roiPercent = 23;
    durationText = '6 Months';
  } else if (packageType === '12') {
    roiPercent = 47;
    durationText = '12 Months';
  }

  const numAmount = parseFloat(amount) || 0;
  const roiAmount = (numAmount * roiPercent) / 100;
  const totalAmount = numAmount + roiAmount;

  // Fetch balances and investments
  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Fetch balances
      const { data: profile } = await supabase
        .from('profiles')
        .select('balance_ngn, balance_usdt')
        .eq('id', user.id)
        .single();
        
      if (profile) {
        setBalanceNGN(Number(profile.balance_ngn) || 0);
        setBalanceUSDT(Number(profile.balance_usdt) || 0);
      }

      // 2. Fetch investments
      const res = await fetch('/api/investments');
      const data = await res.json();
      if (data.investments) {
        setInvestments(data.investments);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoadingInvestments(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleConfirm = async () => {
    if (!amount || numAmount <= 0) {
      setMessage({ type: 'error', text: 'Please enter a valid amount' });
      return;
    }

    const currentBalance = currency === 'NGN' ? balanceNGN : balanceUSDT;
    if (numAmount > currentBalance) {
      setMessage({ type: 'error', text: `Insufficient ${currency} balance to invest ${numAmount.toLocaleString()} ${currency}` });
      return;
    }

    // Min check
    if (currency === 'NGN' && numAmount < 1000) {
      setMessage({ type: 'error', text: 'Minimum investment amount for NGN is 1,000' });
      return;
    }
    if (currency === 'USDT' && numAmount < 10) {
      setMessage({ type: 'error', text: 'Minimum investment amount for USDT is 10' });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch('/api/investments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currency,
          amount: numAmount,
          duration_months: Number(packageType),
          roi_percent: roiPercent,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create investment');
      }

      setMessage({ type: 'success', text: `Successfully invested ${numAmount.toLocaleString()} ${currency}!` });
      setAmount('');
      // Refresh list & balances
      await fetchData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Something went wrong' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-slate-950 pb-24">
      {/* Header */}
      <header className="px-5 pt-12 pb-6 flex items-center bg-white dark:bg-slate-950 sticky top-0 z-10 border-b border-gray-50 dark:border-slate-900">
        <Link href="/home" className="mr-4 text-gray-900 dark:text-white">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <h1 className="text-[20px] font-bold text-gray-900 dark:text-white flex-1 text-center pr-10">
          Investments
        </h1>
      </header>

      <div className="px-5 pt-6 flex flex-col space-y-6">
        
        {/* Headline */}
        <h2 className="text-[22px] font-bold text-[#0F172A] dark:text-white leading-tight pr-4">
          Invest in Kyvatron&apos;s arbitrage and earn up to <span className="text-[#0047FF]">47% ROI</span> per year
        </h2>

        {/* Balance Display */}
        <div className="bg-slate-50 dark:bg-slate-900/40 rounded-2xl p-4 flex justify-between items-center text-sm font-medium">
          <span className="text-gray-500 dark:text-slate-400">Available Balance:</span>
          <span className="text-gray-900 dark:text-white font-bold">
            {currency === 'NGN' 
              ? `${balanceNGN.toLocaleString('en-NG', { minimumFractionDigits: 2 })} NGN`
              : `${balanceUSDT.toLocaleString('en-US', { minimumFractionDigits: 2 })} USDT`
            }
          </span>
        </div>

        {/* Currency Dropdown */}
        <div>
          <label className="block text-[15px] font-bold text-[#0F172A] dark:text-white mb-2">Currency</label>
          <div className="relative">
            <select 
              title="Select Currency"
              value={currency}
              onChange={(e) => {
                setCurrency(e.target.value);
                setMessage(null);
              }}
              className="w-full appearance-none bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-4 pr-10 text-[15px] font-medium text-[#334155] dark:text-slate-300 shadow-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="NGN">NGN</option>
              <option value="USDT">USDT</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Investment Package Dropdown */}
        <div>
          <label className="block text-[15px] font-bold text-[#0F172A] dark:text-white mb-2">Investment Package</label>
          <div className="relative">
            <select 
              title="Select Investment Package"
              value={packageType}
              onChange={(e) => setPackageType(e.target.value)}
              className="w-full appearance-none bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-4 pr-10 text-[15px] font-medium text-[#334155] dark:text-slate-300 shadow-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="3">3 Months, 11% ROI</option>
              <option value="6">6 Months, 23% ROI</option>
              <option value="12">12 Months, 47% ROI</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Amount Input */}
        <div>
          <label className="block text-[15px] font-bold text-[#0F172A] dark:text-white mb-2">Amount To Invest</label>
          <input 
            type="number"
            placeholder={currency === 'NGN' ? 'Min: 1,000 NGN' : 'Min: 10 USDT'}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl py-4 px-4 text-[15px] font-medium text-[#0F172A] dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow shadow-sm placeholder-gray-400"
          />
        </div>

        {/* Preview Card */}
        <div className="bg-[#F8FAFC] dark:bg-slate-800/50 rounded-2xl p-5 border border-gray-50 dark:border-slate-800 mt-2">
          <h3 className="text-[16px] font-bold text-[#0F172A] dark:text-white mb-5">Preview</h3>
          
          <div className="flex justify-between items-center mb-4">
            <span className="text-[14px] text-[#475569] dark:text-slate-400">Investment:</span>
            <span className="text-[14px] font-medium text-[#0F172A] dark:text-white">
              {numAmount.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})} {currency}
            </span>
          </div>
          
          <div className="flex justify-between items-center mb-4">
            <span className="text-[14px] text-[#475569] dark:text-slate-400">Duration:</span>
            <span className="text-[14px] font-medium text-[#0F172A] dark:text-white">{durationText}</span>
          </div>
          
          <div className="flex justify-between items-center mb-4">
            <span className="text-[14px] text-[#475569] dark:text-slate-400">ROI:</span>
            <span className="text-[14px] font-medium text-[#0F172A] dark:text-white">
              {roiPercent}% ({roiAmount.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})} {currency})
            </span>
          </div>
          
          <div className="h-[1px] bg-gray-200 dark:bg-slate-700 w-full mb-4"></div>
          
          <div className="flex justify-between items-center">
            <span className="text-[14px] font-bold text-[#0F172A] dark:text-white">Total:</span>
            <span className="text-[14px] font-bold text-[#0F172A] dark:text-white">
              {totalAmount.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})} {currency}
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
            onClick={handleConfirm}
            disabled={submitting}
            className="w-full rounded-[14px] bg-[#0047FF] hover:bg-blue-700 py-4 text-[16px] font-bold flex items-center justify-center disabled:opacity-50"
          >
            {submitting ? 'Processing...' : 'Confirm'}
          </Button>
        </div>

        {/* Active Investments Section */}
        <div className="pt-4 pb-8">
          <h3 className="text-[18px] font-bold text-[#0F172A] dark:text-white mb-4">Active Investments</h3>
          
          {loadingInvestments ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : investments.length > 0 ? (
            <div className="space-y-4">
              {investments.map((inv) => (
                <div key={inv.id} className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[24px] p-5 shadow-sm">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-sm ${
                        inv.currency === 'NGN' ? 'bg-[#16A34A]' : 'bg-[#009393]'
                      }`}>
                        <span className="text-[20px] font-bold">{inv.currency === 'NGN' ? '₦' : 'T'}</span>
                      </div>
                      <div>
                        <h4 className="text-[16px] font-bold text-[#0F172A] dark:text-white leading-tight">
                          {inv.duration_months} Months, {inv.roi_percent}% ROI
                        </h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="px-2 py-0.5 bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 text-[10px] font-bold rounded-md">
                            {inv.currency}
                          </span>
                          <div className="flex items-center space-x-1">
                            <div className={`w-1.5 h-1.5 rounded-full ${
                              inv.status === 'active' ? 'bg-[#16A34A]' : 'bg-gray-400'
                            }`}></div>
                            <span className={`text-[11px] font-bold capitalize ${
                              inv.status === 'active' ? 'text-[#16A34A]' : 'text-gray-400'
                            }`}>
                              {inv.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="w-10 h-10 bg-gray-50 dark:bg-slate-800 rounded-xl flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#16A34A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-6">
                    <div className="flex flex-col">
                      <span className="text-[11px] text-gray-400 font-medium mb-1">Amount Invested</span>
                      <span className="text-[13px] font-bold text-[#0F172A] dark:text-white">
                        {Number(inv.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })} {inv.currency}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[11px] text-gray-400 font-medium mb-1">ROI</span>
                      <span className="text-[13px] font-bold text-[#0F172A] dark:text-white">
                        {Number(inv.roi_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })} {inv.currency}
                      </span>
                    </div>
                    <div className="flex flex-col bg-[#DCFCE7]/50 dark:bg-[#166534]/10 rounded-xl p-2">
                      <span className="text-[11px] text-[#16A34A] font-medium mb-1">Total</span>
                      <span className="text-[13px] font-bold text-[#16A34A]">
                        {Number(inv.total_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })} {inv.currency}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-gray-50 dark:border-slate-800 pt-4 mt-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#16A34A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 font-medium">Investment Date</p>
                        <p className="text-[12px] font-bold text-[#0F172A] dark:text-white">
                          {new Date(inv.invested_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#16A34A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 font-medium">Maturity Date</p>
                        <p className="text-[12px] font-bold text-[#0F172A] dark:text-white">
                          {new Date(inv.maturity_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-slate-400">
              No active investments yet. Start your first investment above!
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
