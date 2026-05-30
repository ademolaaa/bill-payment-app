'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '../../../components/Button';
import { Input } from '../../../components/Input';
import { supabase } from '../../../lib/supabase/client';
import { useFlutterwaveCheckout, FlutterwavePaymentData } from '../../../hooks/useFlutterwaveCheckout';

export default function DepositPage() {
  const [activeTab, setActiveTab] = useState<'NGN' | 'USDT'>('NGN');
  const [copied, setCopied] = useState(false);
  const [amount, setAmount] = useState<string>('');
  const [cryptoAmount, setCryptoAmount] = useState<string>('');
  const [generatedPayment, setGeneratedPayment] = useState<any>(null);
  const [generating, setGenerating] = useState<boolean>(false);
  const [webhookSimulating, setWebhookSimulating] = useState<boolean>(false);
  const [balanceNGN, setBalanceNGN] = useState<number>(0);
  const [balanceUSDT, setBalanceUSDT] = useState<number>(0);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchBalances = async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) return;
      setUser(currentUser);

      const { data: profile } = await supabase
        .from('profiles')
        .select('balance_ngn, balance_usdt')
        .eq('id', currentUser.id)
        .single();
        
      if (profile) {
        setBalanceNGN(Number(profile.balance_ngn) || 0);
        setBalanceUSDT(Number(profile.balance_usdt) || 0);
      }
    } catch (err) {
      console.error('Error fetching balances:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCryptoDeposit = async () => {
    setFeedback(null);
    const amt = parseFloat(cryptoAmount);
    if (isNaN(amt) || amt <= 0) {
      setFeedback({ type: 'error', message: 'Please enter a valid deposit amount greater than zero.' });
      return;
    }
    if (amt < 5) {
      setFeedback({ type: 'error', message: 'Minimum deposit amount is 5.00 USDT.' });
      return;
    }

    setGenerating(true);
    try {
      const res = await fetch('/api/payments/create-crypto-deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: amt }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setGeneratedPayment(data);
        setFeedback({ type: 'success', message: 'NOWPayments deposit invoice generated successfully!' });
      } else {
        setFeedback({ type: 'error', message: data.error || 'Failed to generate crypto deposit address.' });
      }
    } catch (e) {
      console.error(e);
      setFeedback({ type: 'error', message: 'Network error generating crypto deposit.' });
    } finally {
      setGenerating(false);
    }
  };

  const handleSimulateWebhook = async () => {
    if (!generatedPayment) return;
    setFeedback(null);
    setWebhookSimulating(true);
    try {
      const res = await fetch('/api/webhooks/nowpayments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-nowpayments-sig': 'sandbox-test-signature',
        },
        body: JSON.stringify({
          payment_status: 'confirmed',
          order_id: generatedPayment.orderId,
          price_amount: Number(generatedPayment.amount),
          price_currency: 'usd',
          actually_paid: Number(generatedPayment.amount),
          pay_currency: 'usdttrc20',
        }),
      });
      const data = await res.json();
      if (res.ok && data.received) {
        setFeedback({ 
          type: 'success', 
          message: `Webhook simulated! Credited +${generatedPayment.amount} USDT to your wallet successfully.` 
        });
        setGeneratedPayment(null);
        setCryptoAmount('');
        await fetchBalances(); // Reload balances immediately!
      } else {
        setFeedback({ type: 'error', message: data.error || 'Failed to trigger simulated webhook.' });
      }
    } catch (e) {
      console.error(e);
      setFeedback({ type: 'error', message: 'Network error simulating payment webhook.' });
    } finally {
      setWebhookSimulating(false);
    }
  };

  useEffect(() => {
    fetchBalances();
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText('TSwL9vQQZWPZbdMaWgV4B2Lizyu5Yw1rHp');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const { initiatePayment } = useFlutterwaveCheckout({
    onSuccess: async (payment: FlutterwavePaymentData) => {
      setFeedback({ 
        type: 'success', 
        message: `Wallet successfully credited with ${parseFloat(amount).toLocaleString('en-NG')} NGN!` 
      });
      setAmount('');
      await fetchBalances(); // Reload dynamic balance
    },
    onCancel: () => {
      setFeedback({ type: 'error', message: 'Automatic deposit was cancelled.' });
    },
    onError: (errorMsg: string) => {
      setFeedback({ type: 'error', message: errorMsg });
    },
  });

  const handleAutomaticDeposit = async () => {
    setFeedback(null);
    const depositAmt = parseFloat(amount);
    if (isNaN(depositAmt) || depositAmt <= 0) {
      setFeedback({ type: 'error', message: 'Please enter a valid deposit amount greater than zero.' });
      return;
    }

    if (!user) {
      setFeedback({ type: 'error', message: 'You must be logged in to deposit.' });
      return;
    }

    const txRef = `kyvatron-deposit-${user.id}-${Date.now()}`;
    initiatePayment({
      txRef,
      amount: depositAmt,
      currency: 'NGN',
      customerEmail: user.email!,
      customerName: user.user_metadata?.full_name || user.email!,
      description: 'Kyvatron Wallet Automatic Deposit',
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-slate-900 pb-24">
      {/* Header */}
      <header className="px-5 pt-12 pb-4 flex items-center bg-white dark:bg-slate-900 sticky top-0 z-10">
        <Link href="/home" className="mr-4 text-gray-900 dark:text-white">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <h1 className="text-[20px] font-bold text-gray-900 dark:text-white flex-1 text-center pr-10">Deposit</h1>
      </header>

      {/* Tabs */}
      <div className="px-5 mb-6 flex border-b border-gray-100 relative">
        <button 
          onClick={() => setActiveTab('NGN')}
          className={`flex-1 pb-3 text-[15px] font-bold text-center transition-colors relative ${activeTab === 'NGN' ? 'text-[#1d4ed8]' : 'text-gray-400'}`}
        >
          NGN Deposit
          {activeTab === 'NGN' && (
            <div className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-blue-700"></div>
          )}
        </button>
        <button 
          onClick={() => setActiveTab('USDT')}
          className={`flex-1 pb-3 text-[15px] font-bold text-center transition-colors relative ${activeTab === 'USDT' ? 'text-[#1d4ed8]' : 'text-gray-400'}`}
        >
          USDT (TRC20) Deposit
          {activeTab === 'USDT' && (
            <div className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-blue-700"></div>
          )}
        </button>
      </div>

      <div className="px-5">
        {activeTab === 'NGN' ? (
          /* NGN Tab Content */
          <div className="animate-in fade-in slide-in-from-right-4 duration-300 pb-20">
            {/* Balance Card */}
            <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[20px] p-6 mb-6 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[14px] text-[#475569] dark:text-slate-400 font-medium block mb-1">NGN Balance</span>
                <h2 className="text-[24px] font-bold text-[#0F172A] dark:text-white leading-none">
                  {loading ? '...' : `${balanceNGN.toLocaleString('en-NG', { minimumFractionDigits: 2 })} NGN`}
                </h2>
              </div>
              <div className="w-12 h-12 bg-[#DCFCE7] dark:bg-[#166534]/30 rounded-full flex items-center justify-center text-[#16A34A] dark:text-[#22C55E]">
                <span className="text-[22px] font-bold">NGN</span>
              </div>
            </div>

            {/* Feedback Message */}
            {feedback && (
              <div className={`p-4 rounded-2xl text-[13px] font-bold text-center mb-6 border ${
                feedback.type === 'success' 
                  ? 'bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 border-green-100 dark:border-green-900/30' 
                  : 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/30'
              }`}>
                {feedback.message}
              </div>
            )}

            {/* Amount Form */}
            <div className="mb-8">
              <label className="block text-[15px] font-bold text-[#0F172A] dark:text-white mb-3">Amount</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="text-gray-400 text-[18px] font-bold"></span>
                </div>
                <input 
                  type="number" 
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl py-4 pl-10 pr-14 text-[16px] font-medium text-[#0F172A] dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-gray-300 shadow-sm"
                />
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <span className="text-gray-400 text-[14px] font-bold">NGN</span>
                </div>
              </div>
            </div>

            {/* Select Deposit Method */}
            <div className="mb-6">
              <label className="block text-[15px] font-medium text-[#0F172A] dark:text-white mb-4">Select Deposit Method</label>
              
              <div className="grid grid-cols-2 gap-4">
                
                {/* Manual Method */}
                <Link href="/deposit/manual" className="block">
                  <div className="bg-[#F0F5FF] dark:bg-blue-900/20 border border-blue-200 dark:border-blue-500/30 rounded-2xl p-5 text-center flex flex-col items-center h-full transition-all">
                    <div className="w-14 h-14 bg-[#1D4ED8] rounded-full flex items-center justify-center text-white mb-4 shadow-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
                      </svg>
                    </div>
                    <h3 className="text-[15px] font-bold text-[#0F172A] dark:text-white mb-0.5">Deposit Manually</h3>
                    <p className="text-[13px] font-medium text-[#2563EB] mb-4">(Unlimited)</p>
                    <p className="text-[12px] text-[#475569] dark:text-slate-400 leading-relaxed">
                      Get bank details and make a manual transfer.
                    </p>
                  </div>
                </Link>

                {/* Automatic Method */}
                <button onClick={handleAutomaticDeposit} className="block w-full text-left focus:outline-none">
                  <div className="bg-gradient-to-br from-[#F8FAFC] to-white dark:from-slate-800 dark:to-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-5 text-center flex flex-col items-center h-full shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-100/50 to-orange-100/50 dark:from-purple-900/10 dark:to-orange-900/10 opacity-50"></div>
                    <div className="relative z-10 w-14 h-14 bg-gradient-to-br from-purple-600 to-orange-500 rounded-full flex items-center justify-center text-white mb-4 shadow-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12H4s.5-1 4-4Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 9V4s1 .5 4 4Z" />
                      </svg>
                    </div>
                    <h3 className="text-[15px] font-bold text-[#0F172A] dark:text-white mb-0.5 relative z-10">Deposit Automatically</h3>
                    <p className="text-[13px] font-medium text-purple-600 dark:text-purple-400 mb-4 relative z-10">(Flutterwave)</p>
                    <p className="text-[12px] text-[#475569] dark:text-slate-400 leading-relaxed relative z-10">
                      Pay securely with your bank card or account.
                    </p>
                  </div>
                </button>

              </div>
            </div>
          </div>
        ) : (
          /* USDT Tab Content */
          <div className="animate-in fade-in slide-in-from-left-4 duration-300 pb-20">
            {/* Network Badge */}
            <div className="flex justify-center mb-6 mt-2">
              <div className="bg-[#F8FAFC] dark:bg-slate-800 rounded-xl px-4 py-2 flex items-center">
                <span className="text-[14px] text-gray-500 dark:text-slate-400 mr-2">Network:</span>
                <span className="text-[14px] font-bold text-gray-900 dark:text-white">TRON (TRC20)</span>
              </div>
            </div>

            {feedback && (
              <div className={`p-4 rounded-2xl text-[13px] font-bold text-center mb-6 border ${
                feedback.type === 'success' 
                  ? 'bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 border-green-100 dark:border-green-900/30' 
                  : 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/30'
              }`}>
                {feedback.message}
              </div>
            )}

            {generatedPayment ? (
              /* DYNAMIC GENERATED NOWPAYMENTS INVOICE SCREEN */
              <div className="space-y-6">
                {/* QR Code Container */}
                <div className="flex justify-center">
                  <div className="p-2 bg-white dark:bg-slate-800 rounded-3xl border-4 border-[#16a34a] shadow-sm relative w-[200px] h-[200px] flex items-center justify-center">
                    <svg width="100%" height="100%" viewBox="0 0 100 100" fill="currentColor" className="text-gray-900 dark:text-white">
                      <rect x="5" y="5" width="25" height="25" fill="none" stroke="currentColor" strokeWidth="3"/>
                      <rect x="10" y="10" width="15" height="15"/>
                      <rect x="70" y="5" width="25" height="25" fill="none" stroke="currentColor" strokeWidth="3"/>
                      <rect x="75" y="10" width="15" height="15"/>
                      <rect x="5" y="70" width="25" height="25" fill="none" stroke="currentColor" strokeWidth="3"/>
                      <rect x="10" y="75" width="15" height="15"/>
                      <rect x="35" y="5" width="10" height="10"/>
                      <rect x="50" y="15" width="15" height="10"/>
                      <rect x="5" y="35" width="20" height="15"/>
                      <rect x="30" y="35" width="15" height="15"/>
                      <rect x="70" y="35" width="25" height="10"/>
                      <rect x="50" y="70" width="15" height="15"/>
                      <rect x="75" y="55" width="10" height="25"/>
                      <rect x="35" y="80" width="10" height="15"/>
                      <rect x="85" y="85" width="10" height="10"/>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center p-1">
                        <div className="w-full h-full bg-[#16a34a] rounded-full flex items-center justify-center text-white font-bold text-[18px]">
                          T
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#16a34a]/10 text-[#16a34a] animate-pulse">
                    ● Awaiting Network Confirmation
                  </span>
                </div>

                {/* Amount to Send */}
                <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-[12px] text-gray-500 dark:text-slate-400 mb-0.5">Send Exact Amount</p>
                    <p className="text-[20px] font-extrabold text-[#0F172A] dark:text-white leading-none">
                      {generatedPayment.amount} {generatedPayment.currency}
                    </p>
                  </div>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(generatedPayment.amount.toString());
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="px-3 py-1.5 bg-gray-100 dark:bg-slate-800 rounded-lg text-xs font-bold text-[#0047FF] hover:bg-gray-200 transition"
                  >
                    Copy
                  </button>
                </div>

                {/* Deposit TRC20 Address */}
                <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex items-center justify-between">
                  <div className="pr-4 flex-1">
                    <p className="text-[12px] text-gray-500 dark:text-slate-400 mb-0.5">Deposit Wallet Address (TRC20)</p>
                    <p className="text-[13px] font-bold text-[#0F172A] dark:text-white break-all leading-tight">
                      {generatedPayment.payAddress}
                    </p>
                  </div>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(generatedPayment.payAddress);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="px-3 py-1.5 bg-gray-100 dark:bg-slate-800 rounded-lg text-xs font-bold text-[#0047FF] hover:bg-gray-200 transition"
                  >
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>

                {/* Order Reference */}
                <div className="text-center text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                  Ref: {generatedPayment.orderId}
                </div>

                {/* QA SIMULATOR SANDBOX CONTROLS */}
                <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-2xl text-xs shadow-sm">
                  <span className="font-extrabold uppercase text-orange-600 dark:text-orange-400 block mb-1 text-[10px] tracking-wider">NOWPayments Sandbox Controls</span>
                  <p className="text-slate-600 dark:text-slate-400 leading-normal mb-3.5">
                    Use this tool to simulate blockchain payment verification and trigger dynamic user wallet crediting.
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleSimulateWebhook}
                      disabled={webhookSimulating}
                      className="flex-1 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white font-bold text-center text-xs uppercase rounded-xl transition shadow-sm disabled:opacity-60 cursor-pointer"
                    >
                      {webhookSimulating ? 'Simulating Webhook...' : 'Simulate Successful Webhook'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setGeneratedPayment(null)}
                      className="px-3 py-2.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs uppercase rounded-xl transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* DEPOSIT INPUT & METHOD SELECTION */
              <div className="space-y-6">
                <div>
                  <label className="block text-[15px] font-bold text-[#0F172A] dark:text-white mb-2">Deposit Amount (USDT)</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      placeholder="Min 5.00 USDT"
                      value={cryptoAmount}
                      onChange={(e) => setCryptoAmount(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl py-4 pl-4 pr-16 text-[16px] font-medium text-[#0F172A] dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-gray-300 shadow-sm"
                    />
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                      <span className="text-gray-400 text-[14px] font-bold">USDT</span>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={handleCreateCryptoDeposit}
                  disabled={generating}
                  className="w-full rounded-2xl bg-[#0047FF] hover:bg-blue-700 text-white font-bold py-4 text-[15px] shadow-md flex items-center justify-center gap-2"
                >
                  {generating ? (
                    'Generating Invoice...'
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Generate USDT TRC20 Invoice
                    </>
                  )}
                </Button>

                {/* Static Alternative */}
                <div className="border-t border-gray-150 dark:border-slate-800 pt-5">
                  <div className="bg-[#F8FAFC] dark:bg-slate-800/40 rounded-2xl p-4 border border-gray-50 dark:border-slate-800">
                    <h4 className="text-[13px] font-bold text-gray-800 dark:text-slate-200 mb-2">Or Direct Transfer (Static Wallet)</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal mb-3">
                      Transfer directly to the Kyvatron static vault address. Deposits under this method require manual support ticket verification.
                    </p>
                    <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl p-3 flex items-center justify-between">
                      <span className="text-[11px] font-mono text-slate-600 dark:text-slate-400 break-all select-all font-bold">
                        TSwL9vQQZWPZbdMaWgV4B2Lizyu5Yw1rHp
                      </span>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText('TSwL9vQQZWPZbdMaWgV4B2Lizyu5Yw1rHp');
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        }}
                        className="text-[11px] font-extrabold text-[#0047FF] uppercase ml-2"
                      >
                        {copied ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Balance & network info */}
                <div className="bg-[#F8FAFC] dark:bg-slate-800/50 rounded-2xl p-5 border border-gray-50 dark:border-slate-800 space-y-3.5 text-slate-600 dark:text-slate-400">
                  <div className="flex justify-between items-center text-xs">
                    <span>Active Wallet balance</span>
                    <strong className="text-slate-800 dark:text-slate-200 font-bold">{loading ? '...' : `${balanceUSDT.toLocaleString('en-US', { minimumFractionDigits: 2 })} USDT`}</strong>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span>Minimum deposit</span>
                    <strong className="text-slate-800 dark:text-slate-200 font-bold">5.00 USDT</strong>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
