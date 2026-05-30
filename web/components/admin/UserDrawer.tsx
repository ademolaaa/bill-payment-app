'use client';

import React, { useEffect, useState } from 'react';
import { CustomerUser, Transaction } from '../../types/admin';
import { transactions } from '../../lib/admin/mockStore';
import { useLayout } from './LayoutContext';
import {
  X,
  Wallet,
  FileCheck,
  UserCheck,
  UserX,
  Key,
  MessageSquare,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

const maskEmail = (email: string) => {
  if (!email || !email.includes('@')) return email;
  const [username, domain] = email.split('@');
  if (username.length <= 2) {
    return `${username[0]}***@${domain}`;
  }
  return `${username[0]}***${username[username.length - 1]}@${domain}`;
};

const maskPhone = (phone: string) => {
  if (!phone) return '';
  const clean = phone.replace(/\s+/g, '');
  if (clean.length <= 6) {
    return '***';
  }
  return `${clean.slice(0, 4)}******${clean.slice(-3)}`;
};

interface UserDrawerProps {
  user: CustomerUser | null;
  onClose: () => void;
  onAction: (action: string, userId: string) => void;
}

export const UserDrawer: React.FC<UserDrawerProps> = ({ user, onClose, onAction }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewingDoc, setViewingDoc] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const { simulatedRole } = useLayout();

  // Bind Escape key to close the drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Handle slide-in transition animation
  useEffect(() => {
    if (user) {
      // Small timeout to allow element to render before slide-in CSS kicks in
      const timer = setTimeout(() => setIsOpen(true), 10);
      return () => clearTimeout(timer);
    } else {
      setIsOpen(false);
      setViewingDoc(false);
    }
  }, [user]);

  if (!user) return null;

  // Filter 5 most recent transactions for this user
  const userTxs = transactions
    .filter((tx) => tx.userId === user.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  // Filter wallet funding history (simulated from user transactions above ₦5,000 or marked deposit)
  const walletFunding = transactions
    .filter((tx) => tx.userId === user.id && tx.status === 'successful' && (tx.serviceType === 'electricity' || tx.amount >= 5000))
    .slice(0, 3);

  const handleTriggerAction = (actionName: string) => {
    onAction(actionName, user.id);
    
    // Display premium toast indicator
    let msg = '';
    if (actionName === 'suspend') msg = `User ${user.fullName} suspended successfully.`;
    if (actionName === 'activate') msg = `User ${user.fullName} activated successfully.`;
    if (actionName === 'approveKYC') msg = `KYC for ${user.fullName} approved.`;
    if (actionName === 'rejectKYC') msg = `KYC for ${user.fullName} rejected.`;
    if (actionName === 'resetPassword') {
      const emailDisplay = simulatedRole === 'Super Admin' ? user.email : maskEmail(user.email);
      msg = `Password reset link dispatched to ${emailDisplay}.`;
    }
    
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end font-sans">
      
      {/* 1. SEMI-TRANSPARENT BACKDROP */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-slate-950/50 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* 2. DRAWER CONTAINER PANEL */}
      <div
        className={`relative w-full max-w-lg h-full bg-white dark:bg-[#161b22] border-l border-slate-200 dark:border-slate-800 shadow-2xl overflow-y-auto transition-transform duration-300 ease-out transform custom-scrollbar ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        
        {/* Floating Interactive Toast Alerts */}
        {toastMessage && (
          <div className="absolute top-4 left-4 right-4 z-50 p-3 bg-emerald-600 text-white font-semibold text-xs rounded-xl shadow-lg flex items-center gap-2 animate-slide-in">
            <ShieldCheck className="w-4 h-4" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* TOP HEADER SECTION */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-5 bg-slate-50 dark:bg-[#1c2128] border-b border-slate-200 dark:border-slate-800 select-none">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-500 text-white font-extrabold text-lg shadow-sm">
              {getInitials(user.fullName)}
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100 leading-none">
                {user.fullName}
              </h3>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-medium leading-none block mt-1">
                Joined {new Intl.DateTimeFormat('en-NG', { dateStyle: 'medium' }).format(new Date(user.createdAt))}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Status indicators */}
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${
              user.status === 'active'
                ? 'bg-emerald-500/10 text-emerald-500'
                : 'bg-rose-500/10 text-rose-500'
            }`}>
              {user.status}
            </span>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors"
              aria-label="Close user detail panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          
          {/* USER CONTACT DETAILS */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 dark:bg-[#0d1117]/30 border border-slate-100 dark:border-slate-800 rounded-xl text-xs">
            <div>
              <span className="text-slate-400 font-medium block">Email Address</span>
              <span className="text-slate-800 dark:text-slate-200 font-bold block mt-0.5 break-all">
                {simulatedRole === 'Super Admin' ? user.email : maskEmail(user.email)}
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Phone Number</span>
              <span className="text-slate-800 dark:text-slate-200 font-bold block mt-0.5 font-mono">
                {simulatedRole === 'Super Admin' ? user.phone : maskPhone(user.phone)}
              </span>
            </div>
          </div>

          {/* SECTION 1: WALLET METRICS */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 select-none">
              <Wallet className="w-4 h-4 text-cyan-500" />
              Wallet Balance
            </h4>
            <div className="p-4 bg-gradient-to-r from-slate-900 to-slate-850 text-white rounded-2xl shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Active Funds Available</span>
                <div className="text-2xl font-black font-mono mt-1 tracking-tight">
                  ₦{user.walletBalance.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                </div>
              </div>
              <span className="text-[11px] font-bold px-2 py-1 rounded bg-white/10 text-cyan-300">
                NGN Ledger
              </span>
            </div>

            {/* Funding mini-list */}
            <div className="space-y-1.5 mt-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block select-none">Funding References</span>
              {walletFunding.length > 0 ? (
                walletFunding.map((fund) => (
                  <div key={fund.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-50/50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/50 text-xs">
                    <span className="font-mono text-slate-500 dark:text-slate-400">{fund.reference}</span>
                    <span className="font-bold text-emerald-500 font-mono">+₦{fund.amount.toLocaleString()}</span>
                  </div>
                ))
              ) : (
                <span className="text-xs text-slate-400 italic">No large funding matches on file</span>
              )}
            </div>
          </div>

          {/* SECTION 2: KYC DOCUMENT MANAGER */}
          <div className="space-y-3 p-4 bg-slate-50/50 dark:bg-slate-800/20 border border-slate-200/50 dark:border-slate-800 rounded-2xl">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 select-none">
                <FileCheck className="w-4 h-4 text-cyan-500" />
                KYC Verification
              </h4>
              <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                user.kycStatus === 'verified'
                  ? 'bg-emerald-500/10 text-emerald-500'
                  : user.kycStatus === 'pending'
                  ? 'bg-amber-500/10 text-amber-500 animate-pulse'
                  : 'bg-rose-500/10 text-rose-500'
              }`}>
                {user.kycStatus}
              </span>
            </div>

            {user.kycStatus === 'pending' ? (
              <div className="space-y-3">
                <p className="text-xs text-slate-500 leading-relaxed">
                  User uploaded a National Identification Number (NIN) slip for level 2 clearance audit.
                </p>
                
                {/* Simulated doc preview pane */}
                {!viewingDoc ? (
                  <button
                    onClick={() => setViewingDoc(true)}
                    className="w-full py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 transition-colors"
                  >
                    View National ID Card Document
                  </button>
                ) : (
                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden animate-fade-in bg-white dark:bg-[#0d1117] p-3 text-center">
                    <div className="h-40 bg-slate-100 dark:bg-[#161b22] rounded flex items-center justify-center text-slate-400 text-xs flex-col gap-2">
                      <ShieldCheck className="w-10 h-10 text-cyan-500" />
                      <span className="font-semibold text-slate-600 dark:text-slate-300">SIMULATED NATIONAL ID CARD</span>
                      <span className="text-[10px] text-slate-400">FullName: {user.fullName} | NIN: 89011234992</span>
                    </div>
                    <button
                      onClick={() => setViewingDoc(false)}
                      className="mt-3 text-xs font-bold text-rose-500 hover:underline"
                    >
                      Hide Document
                    </button>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => handleTriggerAction('approveKYC')}
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5"
                  >
                    <UserCheck className="w-4 h-4" />
                    Approve Verify
                  </button>
                  <button
                    onClick={() => handleTriggerAction('rejectKYC')}
                    className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5"
                  >
                    <UserX className="w-4 h-4" />
                    Reject/Deny
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-500 flex items-center gap-2">
                {user.kycStatus === 'verified' ? (
                  <>
                    <ShieldCheck className="w-5 h-5 text-emerald-500" />
                    <span>NIN verification completed and approved by Compliance Staff.</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-5 h-5 text-rose-500" />
                    <span>KYC is currently unverified or documents were rejected.</span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* SECTION 3: QUICK ACTIONS GRID */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-widest select-none">
              Administrative Commands
            </h4>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleTriggerAction(user.status === 'active' ? 'suspend' : 'activate')}
                className={`py-2 px-3 border text-xs font-semibold rounded-lg flex flex-col items-center justify-center gap-1.5 transition-colors ${
                  user.status === 'active'
                    ? 'border-rose-200 dark:border-rose-900/40 text-rose-500 hover:bg-rose-500/5'
                    : 'border-emerald-200 dark:border-emerald-900/40 text-emerald-500 hover:bg-emerald-500/5'
                }`}
              >
                {user.status === 'active' ? (
                  <>
                    <UserX className="w-4 h-4" />
                    <span>Suspend User</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4" />
                    <span>Activate User</span>
                  </>
                )}
              </button>
              
              <button
                onClick={() => handleTriggerAction('resetPassword')}
                className="py-2 px-3 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg flex flex-col items-center justify-center gap-1.5 transition-colors"
              >
                <Key className="w-4 h-4 text-slate-400" />
                <span>Reset Pass</span>
              </button>

              <button
                onClick={() => alert(`Direct broadcast message screen trigger for ${user.email}!`)}
                className="py-2 px-3 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg flex flex-col items-center justify-center gap-1.5 transition-colors"
              >
                <MessageSquare className="w-4 h-4 text-slate-400" />
                <span>Send Notice</span>
              </button>
            </div>
          </div>

          {/* SECTION 4: RECENT UTILITY LEDGER */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 select-none">
              <Clock className="w-4 h-4 text-cyan-500" />
              Recent Utility Activities
            </h4>
            
            {userTxs.length > 0 ? (
              <div className="overflow-hidden border border-slate-200 dark:border-slate-800 rounded-xl">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 dark:bg-[#1c2128] text-slate-400 uppercase select-none">
                    <tr>
                      <th className="p-3">Service</th>
                      <th className="p-3 text-right">Amount</th>
                      <th className="p-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-transparent">
                    {userTxs.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="p-3">
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-800 dark:text-slate-200 capitalize">
                              {tx.serviceType.replace('_', ' ')}
                            </span>
                            <span className="text-[10px] text-slate-400">{tx.provider}</span>
                          </div>
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-slate-700 dark:text-slate-300">
                          ₦{tx.amount.toLocaleString()}
                        </td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            tx.status === 'successful'
                              ? 'bg-emerald-500/10 text-emerald-500'
                              : tx.status === 'failed'
                              ? 'bg-rose-500/10 text-rose-500'
                              : tx.status === 'pending'
                              ? 'bg-amber-500/10 text-amber-500'
                              : 'bg-slate-500/10 text-slate-500'
                          }`}>
                            {tx.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-400 italic border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                No transactions completed by user yet.
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
