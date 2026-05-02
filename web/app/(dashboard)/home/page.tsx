'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '../../../components/Button';
import { TransactionItem } from '../../../components/TransactionItem';
import { Transaction } from '../../../types/database';
import { supabase } from '../../../lib/supabase/client';
import { Transaction } from '../../../types/database';

// ── Dummy recent transactions (reusing same shape as history page) ────────────
const RECENT_TRANSACTIONS: (Transaction & { dateStr: string })[] = [
  { id: 't1', userId: 'u1', type: 'deposit',  amount:  150000, status: 'completed', providerReference: 'Salary Deposit',       dateStr: 'Today, 21 Apr' },
  { id: 't2', userId: 'u1', type: 'payment',  amount:  -6500,  status: 'completed', providerReference: 'Netflix Subscription',  dateStr: 'Today, 21 Apr' },
  { id: 't3', userId: 'u1', type: 'transfer', amount:  -25000, status: 'pending',   providerReference: 'Transfer to Mom',       dateStr: 'Today, 21 Apr' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

// ── Eye icon ──────────────────────────────────────────────────────────────────
const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const EyeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.97 9.97 0 012.5-4.173M9.88 9.88a3 3 0 104.24 4.24M15 12a3 3 0 00-3-3m0 0a3 3 0 00-3 3" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
  </svg>
);

// ── Page ──────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && user.user_metadata?.full_name) {
        const firstName = user.user_metadata.full_name.split(' ')[0];
        setUserName(firstName);
      }
    };
    fetchUser();
  }, []);

  const mask = (value: string) => (balanceVisible ? value : '••••••');

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-24">

      {/* ── Header with greeting ─────────────────────────────────────────── */}
      <header className="px-5 pt-12 pb-4 flex items-center justify-between">
        <div>
          <p className="text-[14px] text-gray-500 font-medium">{getGreeting()},</p>
          <h1 className="text-2xl font-bold text-gray-900">{userName || 'User'} 👋</h1>
        </div>
        {/* Notification bell placeholder */}
        <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-500 cursor-pointer hover:bg-gray-50 transition">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </div>
      </header>

      <div className="px-5 flex flex-col space-y-6">

        {/* ── Total Balance Card ───────────────────────────────────────────── */}
        <div className="bg-white rounded-3xl p-6 shadow-sm flex flex-col items-center">
          <div className="w-full text-left">

            {/* Title row with eye toggle */}
            <div className="flex items-center justify-between mb-1">
              <p className="text-[14px] text-gray-500 font-medium">Total Balance</p>
              <button
                onClick={() => setBalanceVisible(v => !v)}
                className="text-gray-400 hover:text-gray-600 transition p-1 rounded-full hover:bg-gray-100 focus:outline-none"
                aria-label={balanceVisible ? 'Hide balance' : 'Show balance'}
              >
                {balanceVisible ? <EyeIcon /> : <EyeOffIcon />}
              </button>
            </div>

            <h2 className="text-[34px] font-bold text-gray-900 tracking-tight leading-none mb-2 transition-all duration-300">
              {mask('₦182,300.00')}
            </h2>
            <p className="text-[15px] font-medium text-gray-500 mb-6">
              {mask('1,250.75 USDT')}
            </p>
          </div>

          <div className="flex w-full space-x-3">
            <Link href="/deposit" className="flex-1">
              <Button className="w-full rounded-[12px]">Deposit</Button>
            </Link>
            <Link href="/pay-bills" className="flex-1">
              <Button className="w-full rounded-[12px]">Pay Bills</Button>
            </Link>
          </div>
        </div>

        {/* ── Investments ──────────────────────────────────────────────────── */}
        <div>
          <h3 className="text-[17px] font-bold text-gray-900 mb-4">Investments</h3>
          <div className="flex space-x-3">
            {/* NGN Card */}
            <div className="flex-1 bg-white rounded-2xl p-4 shadow-sm flex flex-col justify-between">
              <div>
                <p className="text-[13px] font-bold text-gray-900 mb-1">NGN</p>
                <h4 className="text-[18px] font-bold text-gray-900 mb-1">
                  {mask('₦56,780.25')}
                </h4>
              </div>
              <p className="text-[13px] font-medium text-[#16a34a]">+5.25%</p>
            </div>

            {/* USDT Card — fixed: was showing ¥, now correctly shows ₮ */}
            <div className="flex-1 bg-white rounded-2xl p-4 shadow-sm flex flex-col justify-between">
              <div>
                <p className="text-[13px] font-bold text-gray-900 mb-1">USDT</p>
                <h4 className="text-[18px] font-bold text-gray-900 mb-1">
                  {mask('₮6,420.10')}
                </h4>
              </div>
              <div className="flex justify-between items-end">
                <p className="text-[13px] font-medium text-[#16a34a]">+3.60%</p>
                <span className="text-[10px] uppercase font-bold text-gray-400">TRC20</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Quick Actions Row ────────────────────────────────────────────── */}
        <div className="grid grid-cols-4 gap-2 pt-2">
          {[
            { label: 'Transfer',  href: '/transfer',    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-[22px] w-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg> },
            { label: 'Withdraw',  href: '/withdraw',    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-[22px] w-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg> },
            { label: 'Invest',    href: '/investments', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-[22px] w-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg> },
            { label: 'Wallet',    href: '/deposit',     icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-[22px] w-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg> },
          ].map((action) => (
            <Link href={action.href} key={action.label} className="flex flex-col items-center cursor-pointer group">
              <div className="w-[52px] h-[52px] bg-blue-600 rounded-full flex items-center justify-center text-white mb-2 shadow-sm group-hover:bg-blue-700 transition">
                {action.icon}
              </div>
              <span className="text-[12px] font-medium text-gray-900 group-hover:text-blue-600 transition">{action.label}</span>
            </Link>
          ))}
        </div>

        {/* ── Recent Transactions ──────────────────────────────────────────── */}
        <div className="pt-1 pb-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[17px] font-bold text-gray-900">Recent Transactions</h3>
            <Link href="/history" className="text-[13px] font-semibold text-blue-600 hover:text-blue-700 transition">
              See all →
            </Link>
          </div>
          <div className="flex flex-col">
            {RECENT_TRANSACTIONS.map((tx) => (
              <TransactionItem key={tx.id} transaction={tx} dateStr={tx.dateStr} />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
