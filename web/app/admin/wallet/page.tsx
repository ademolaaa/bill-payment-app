'use client';

import React, { useState, useEffect } from 'react';
import {
  customerUsers,
  subscribe,
  updateUserStatus,
  addAuditLog
} from '../../../lib/admin/mockStore';
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
  HelpCircle
} from 'lucide-react';

export default function WalletPage() {
  const [users, setUsers] = useState<CustomerUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Selection & Form state
  const [selectedUserId, setSelectedUserId] = useState('');
  const [adjustType, setAdjustType] = useState<'credit' | 'debit'>('credit');
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustReason, setAdjustReason] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const syncUsers = () => {
      setUsers([...customerUsers]);
    };
    syncUsers();
    return subscribe(syncUsers);
  }, []);

  const totalFloat = users.reduce((sum, u) => sum + u.walletBalance, 0);
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

    const u = customerUsers.find(cust => cust.id === selectedUserId);
    if (!u) return;

    if (adjustType === 'credit') {
      u.walletBalance += amountNum;
    } else {
      if (u.walletBalance < amountNum) {
        alert('Insufficient wallet float balance to execute debit deduction!');
        return;
      }
      u.walletBalance -= amountNum;
    }

    // Log this event to the Audit Trail
    addAuditLog({
      adminId: 'adm-current',
      adminName: 'Finance Admin',
      action: adjustType === 'credit' ? 'Wallet Credit' : 'Wallet Debit',
      target: selectedUserId,
      details: `Manually ${adjustType === 'credit' ? 'credited' : 'debited'} ₦${amountNum.toLocaleString()} to ${u.fullName} (${u.email}). Reason: "${adjustReason}"`,
      ipAddress: '102.89.34.99'
    });

    setSuccessMsg(`Wallet successfully ${adjustType === 'credit' ? 'credited' : 'debited'} by ₦${amountNum.toLocaleString()}!`);
    setAdjustAmount('');
    setAdjustReason('');
    
    // Clear message after 3 seconds
    setTimeout(() => {
      setSuccessMsg('');
    }, 3000);
  };

  const filteredUsers = users.filter(u => {
    return (
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.phone.includes(searchQuery)
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
        <div className="p-5 bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800 rounded-2xl">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Total Outstanding Float</span>
          <span className="text-2xl font-black font-mono mt-2 block text-slate-800 dark:text-slate-100">
            ₦{totalFloat.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className="p-5 bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800 rounded-2xl">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Average Customer Balance</span>
          <span className="text-2xl font-black font-mono mt-2 block text-slate-800 dark:text-slate-100">
            ₦{users.length > 0 ? (totalFloat / users.length).toLocaleString('en-NG', { minimumFractionDigits: 2 }) : '0.00'}
          </span>
        </div>
        <div className="p-5 bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800 rounded-2xl">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Total Financed Accounts</span>
          <span className="text-2xl font-black font-mono mt-2 block text-slate-800 dark:text-slate-100">
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
                    {u.fullName} (₦{u.walletBalance.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>

            {/* ADJUSTMENT TYPE */}
            <div className="space-y-1.5">
              <label className="text-slate-400 uppercase tracking-widest block">Adjustment Direction</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustType('credit')}
                  className={`py-2 px-4 rounded-xl border flex items-center justify-center gap-1.5 transition-colors font-bold uppercase ${
                    adjustType === 'credit'
                      ? 'border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-500/10 text-emerald-500'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0d1117]/30 text-slate-400'
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
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0d1117]/30 text-slate-400'
                  }`}
                >
                  <Minus className="w-4 h-4" />
                  Debit Deduction
                </button>
              </div>
            </div>

            {/* AMOUNT */}
            <div className="space-y-1.5">
              <label className="text-slate-400 uppercase tracking-widest block">Adjustment Amount (NGN)</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 font-bold text-slate-400">₦</span>
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 5000"
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
                  <th className="p-3">Email Address</th>
                  <th className="p-3 text-right">Float Balance</th>
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
                          ? 'bg-cyan-550/5 dark:bg-cyan-500/5 border-l-2 border-cyan-500'
                          : ''
                      }`}
                    >
                      <td className="p-3 font-extrabold text-slate-800 dark:text-slate-100">
                        {cust.fullName}
                      </td>
                      <td className="p-3 font-medium text-slate-500 dark:text-slate-400 break-all">{cust.email}</td>
                      <td className="p-3 text-right font-mono font-bold text-slate-800 dark:text-slate-200">
                        ₦{cust.walletBalance.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
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

    </div>
  );
}
