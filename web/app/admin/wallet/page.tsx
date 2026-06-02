'use client';

import React, { useState } from 'react';
import {
  updateUserStatus,
  adjustUserBalance
} from '../../../lib/admin/mockStore';
import { useDashboardStats } from '../../../hooks/useDashboardStats';
import { CustomerUser } from '../../../types/admin';
import {
  Wallet,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Activity,
  Plus,
  Minus,
  CheckCircle,
  HelpCircle,
  Coins
} from 'lucide-react';

export default function WalletPage() {
  const { users, stats } = useDashboardStats();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Selection & Form state
  const [selectedUserId, setSelectedUserId] = useState('');
  const [currency, setCurrency] = useState<'NGN' | 'USDT'>('NGN');
  const [adjustType, setAdjustType] = useState<'credit' | 'debit'>('credit');
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustReason, setAdjustReason] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const totalFloat = stats.walletFloat;
  const totalFloatUsdt = stats.walletFloatUsdt || 0;
  const selectedUser = users.find(u => u.id === selectedUserId);

  const handleAdjustBalance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) {
      alert('Please select a customer user first!');
      return;
    }
    const amountNum = parseFloat(adjustAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      alert('Please enter a valid positive number for adjustment amount!');
      return;
    }
    if (!adjustReason.trim()) {
      alert('Please provide a business reason/reference for audit logs!');
      return;
    }

    const u = users.find(cust => cust.id === selectedUserId);
    if (!u) return;

    if (adjustType === 'debit') {
      const balance = currency === 'USDT' ? (u.usdtBalance || 0) : u.walletBalance;
      if (balance < amountNum) {
        alert(`Insufficient ${currency} wallet balance to execute debit deduction!`);
        return;
      }
    }

    setShowConfirmModal(true);
  };

  const executeAdjustment = () => {
    if (!selectedUserId) return;
    const amountNum = parseFloat(adjustAmount);
    try {
      adjustUserBalance(selectedUserId, amountNum, adjustType, adjustReason, currency);
      const symbol = currency === 'USDT' ? '$' : '₦';
      setSuccessMsg(`Wallet successfully ${adjustType === 'credit' ? 'credited' : 'debited'} by ${symbol}${amountNum.toLocaleString()} ${currency}!`);
      setAdjustAmount('');
      setAdjustReason('');
      setShowConfirmModal(false);
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setSuccessMsg('');
      }, 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to adjust balance.');
      setShowConfirmModal(false);
    }
  };

  const filteredUsers = users.filter(u => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;

    const matchesSpecialKyc = ['verified', 'pending', 'rejected', 'unverified'].includes(q);
    const matchesSpecialStatus = ['active', 'suspended'].includes(q);

    if (matchesSpecialKyc) {
      return u.kycStatus.toLowerCase() === q;
    }
    if (matchesSpecialStatus) {
      return u.status.toLowerCase() === q;
    }

    return (
      u.fullName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.phone.includes(q)
    );
  });

  return (
    <div className="space-y-6">
      
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 select-none">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Wallet className="w-6 h-6 text-cyan-500" />
            Wallet & Finance Console
          </h1>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-1">
            Audit user cash reserves, perform manual operational balances adjustments, and track liabilities
          </p>
        </div>
      </div>

      {/* 2. STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 select-none font-sans">
        <div className="p-5 bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800 rounded-2xl relative overflow-hidden">
          <div className="absolute right-3 top-3 p-1.5 bg-blue-500/10 text-blue-500 rounded-lg">
            <Coins className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Outstanding NGN Float</span>
          <span className="text-2xl font-black font-mono mt-2 block text-slate-850 dark:text-slate-100">
            ₦{totalFloat.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className="p-5 bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800 rounded-2xl relative overflow-hidden">
          <div className="absolute right-3 top-3 p-1.5 bg-emerald-500/10 text-emerald-500 rounded-lg">
            <Coins className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Outstanding USDT Float</span>
          <span className="text-2xl font-black font-mono mt-2 block text-slate-850 dark:text-slate-100">
            ${totalFloatUsdt.toLocaleString('en-US', { minimumFractionDigits: 2 })} USDT
          </span>
        </div>
        <div className="p-5 bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800 rounded-2xl relative overflow-hidden">
          <div className="absolute right-3 top-3 p-1.5 bg-cyan-500/10 text-cyan-500 rounded-lg">
            <Activity className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Total Financed Accounts</span>
          <span className="text-2xl font-black font-mono mt-2 block text-slate-850 dark:text-slate-100">
            {users.length} Active
          </span>
        </div>
      </div>

      {/* 3. CORE ADJ WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: MANUAL ADJUSTMENT PANEL (lg:col-span-5) */}
        <div className="lg:col-span-5 p-6 bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800 rounded-2xl space-y-5">
          <div>
            <h3 className="text-sm font-extrabold text-slate-850 dark:text-slate-100">
              Manual Balance Adjustment
            </h3>
            <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider block mt-0.5 leading-none">
              Credit or debit user wallets with audit logging
            </span>
          </div>

          {successMsg && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl text-xs flex items-center gap-3 animate-fade-in font-bold">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleAdjustBalance} className="space-y-4 text-xs font-semibold">
            {/* SELECT CUSTOMER */}
            <div className="space-y-1.5">
              <label className="text-slate-400 uppercase tracking-widest block">Target Customer</label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-[#0d1117] text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-cyan-500 font-bold"
              >
                <option value="">Select a customer user...</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.fullName} (₦{u.walletBalance.toLocaleString()} | ${(u.usdtBalance || 0).toLocaleString()} USDT)
                  </option>
                ))}
              </select>
            </div>

            {/* CURRENCY SELECTOR */}
            <div className="space-y-1.5">
              <label className="text-slate-400 uppercase tracking-widest block">Operational Currency</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCurrency('NGN')}
                  className={`py-2 px-4 rounded-xl border flex items-center justify-center gap-1.5 transition-colors font-bold uppercase ${
                    currency === 'NGN'
                      ? 'border-blue-500/30 bg-blue-500/5 dark:bg-blue-500/10 text-blue-500'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0d1117]/30 text-slate-450'
                  }`}
                >
                  NGN (Naira)
                </button>
                <button
                  type="button"
                  onClick={() => setCurrency('USDT')}
                  className={`py-2 px-4 rounded-xl border flex items-center justify-center gap-1.5 transition-colors font-bold uppercase ${
                    currency === 'USDT'
                      ? 'border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-500/10 text-emerald-500'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0d1117]/30 text-slate-450'
                  }`}
                >
                  USDT (Trc20)
                </button>
              </div>
            </div>

            {/* ADJUSTMENT DIRECTION */}
            <div className="space-y-1.5">
              <label className="text-slate-400 uppercase tracking-widest block">Adjustment Direction</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustType('credit')}
                  className={`py-2 px-4 rounded-xl border flex items-center justify-center gap-1.5 transition-colors font-bold uppercase ${
                    adjustType === 'credit'
                      ? 'border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-500/10 text-emerald-500'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0d1117]/30 text-slate-450'
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  Credit Wallet
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustType('debit')}
                  className={`py-2 px-4 rounded-xl border flex items-center justify-center gap-1.5 transition-colors font-bold uppercase ${
                    adjustType === 'debit'
                      ? 'border-rose-500/30 bg-rose-500/5 dark:bg-rose-500/10 text-rose-500'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0d1117]/30 text-slate-450'
                  }`}
                >
                  <Minus className="w-4 h-4" />
                  Debit Deduction
                </button>
              </div>
            </div>

            {/* AMOUNT */}
            <div className="space-y-1.5">
              <label className="text-slate-400 uppercase tracking-widest block">Adjustment Amount ({currency})</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 font-bold text-slate-400">
                  {currency === 'USDT' ? '$' : '₦'}
                </span>
                <input
                  type="number"
                  step="0.01"
                  placeholder={currency === 'USDT' ? 'e.g. 10.00' : 'e.g. 5000'}
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  className="w-full pl-7 pr-4 py-2.5 bg-slate-50 dark:bg-[#0d1117] text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-cyan-500 font-mono font-bold"
                />
              </div>
            </div>

            {/* AUDIT BUSINESS REASON */}
            <div className="space-y-1.5">
              <label className="text-slate-400 uppercase tracking-widest block">Audit Log Reason</label>
              <textarea
                rows={3}
                placeholder="Business reason or reference ID (required)..."
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0d1117] text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-cyan-500 font-sans leading-relaxed resize-none"
              />
            </div>

            <button
              type="submit"
              className={`w-full py-3 text-white font-bold uppercase rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-sm ${
                adjustType === 'credit'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              Confirm Finance Adjustment
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN: WALLET DIRECTORY LEDGER (lg:col-span-7) */}
        <div className="lg:col-span-7 p-6 bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 select-none">
            <h3 className="text-sm font-extrabold text-slate-850 dark:text-slate-100 w-full">
              Float Ledger Directory
            </h3>
            
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by full name, email or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-[#0d1117] text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-cyan-500 font-bold"
              />
            </div>
          </div>

          <div className="overflow-hidden border border-slate-100 dark:border-slate-800/80 rounded-xl">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-50 dark:bg-[#1c2128] text-slate-400 uppercase font-bold select-none">
                <tr>
                  <th className="p-3">Customer User</th>
                  <th className="p-3 text-right">NGN Balance</th>
                  <th className="p-3 text-right">USDT Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-transparent">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((cust) => (
                    <tr
                      key={cust.id}
                      onClick={() => setSelectedUserId(cust.id)}
                      className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/30 cursor-pointer transition-colors ${
                        selectedUserId === cust.id
                          ? 'bg-cyan-500/5 border-l-2 border-cyan-500'
                          : ''
                      }`}
                    >
                      <td className="p-3">
                        <div className="font-extrabold text-slate-800 dark:text-slate-100">{cust.fullName}</div>
                        <div className="text-[10px] text-slate-400 font-medium leading-normal mt-0.5">{cust.email}</div>
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-slate-800 dark:text-slate-200">
                        ₦{cust.walletBalance.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        ${(cust.usdtBalance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} USDT
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="p-8 text-center text-slate-400 italic">
                      No user accounts found matching active search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* 4. ATOMIC CONFIRMATION GATE MODAL */}
      {showConfirmModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in font-sans">
          <div className="w-full max-w-md bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-2xl ${
                adjustType === 'credit' 
                  ? 'bg-emerald-500/10 text-emerald-500' 
                  : 'bg-rose-500/10 text-rose-500'
              }`}>
                {adjustType === 'credit' ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownRight className="w-6 h-6" />}
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-850 dark:text-slate-100 uppercase tracking-wide">
                  Confirm Wallet {adjustType === 'credit' ? 'Credit' : 'Debit'}
                </h3>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mt-0.5">
                  High-Risk Financial Action Gate
                </span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-[#0d1117]/30 border border-slate-100 dark:border-slate-800 rounded-2xl space-y-3.5 text-xs font-semibold text-slate-650 dark:text-slate-350">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Target User:</span>
                <span className="font-extrabold text-slate-800 dark:text-slate-200">{selectedUser.fullName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Email Address:</span>
                <span className="font-bold text-slate-500 dark:text-slate-400">{selectedUser.email}</span>
              </div>
              <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-800 pt-3">
                <span className="text-slate-400">Action Type:</span>
                <span className={`uppercase font-black ${
                  adjustType === 'credit' ? 'text-emerald-500' : 'text-rose-500'
                }`}>
                  Manual Wallet {adjustType === 'credit' ? 'Credit' : 'Debit'} ({currency})
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Amount to {adjustType === 'credit' ? 'Credit' : 'Debit'}:</span>
                <span className="font-mono font-black text-slate-855 dark:text-slate-100 text-sm">
                  {currency === 'USDT' ? '$' : '₦'}{parseFloat(adjustAmount).toLocaleString(currency === 'USDT' ? 'en-US' : 'en-NG', { minimumFractionDigits: 2 })} {currency}
                </span>
              </div>
              <div className="flex justify-between items-start border-t border-slate-100 dark:border-slate-800 pt-3">
                <span className="text-slate-400">Audit Reason:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200 italic break-all max-w-[200px] text-right">
                  "{adjustReason}"
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-3 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold uppercase rounded-xl border border-slate-200 dark:border-slate-800 transition-colors text-xs"
              >
                Cancel
              </button>
              <button
                onClick={executeAdjustment}
                className={`flex-1 py-3 text-white font-bold uppercase rounded-xl shadow-sm transition-colors text-xs ${
                  adjustType === 'credit'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                Execute Adjustment
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
