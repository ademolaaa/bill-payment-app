'use client';

import React, { useEffect, useState } from 'react';
import { Transaction } from '../../types/admin';
import {
  X,
  CreditCard,
  User,
  Clock,
  Code,
  ArrowRightLeft,
  RotateCcw,
  CheckCircle,
  FileDown,
  AlertTriangle,
  HelpCircle
} from 'lucide-react';

interface TransactionModalProps {
  transaction: Transaction | null;
  onClose: () => void;
  onAction: (action: string, txId: string) => void;
  simulatedRole?: string;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  transaction,
  onClose,
  onAction,
  simulatedRole = 'Super Admin'
}) => {
  const [jsonExpanded, setJsonExpanded] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Bind Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Handle animate fade-in
  useEffect(() => {
    if (transaction) {
      const timer = setTimeout(() => setModalOpen(true), 10);
      return () => clearTimeout(timer);
    } else {
      setModalOpen(false);
      setJsonExpanded(false);
    }
  }, [transaction]);

  if (!transaction) return null;

  const handleTriggerAction = (actionName: string) => {
    onAction(actionName, transaction.id);
    
    let msg = '';
    if (actionName === 'retry') msg = `Transaction manual retry triggered for ${transaction.reference}.`;
    if (actionName === 'reverse') {
      const isUsdt = transaction.currency === 'USDT' || transaction.serviceType === 'USDT_DEPOSIT' || transaction.reference.toLowerCase().includes('usdt') || transaction.provider === 'NOWPayments';
      msg = isUsdt 
        ? `$${transaction.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} USDT reversed to user wallet successfully.`
        : `₦${transaction.amount.toLocaleString()} reversed to user wallet successfully.`;
    }
    if (actionName === 'receipt') msg = `PDF receipt generated for reference ${transaction.reference}.`;
    
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
      onClose();
    }, 2000);
  };

  // Timeline step generator with simulated times
  const baseTime = new Date(transaction.createdAt).getTime();
  const formatTime = (offsetMs: number) => {
    return new Intl.DateTimeFormat('en-NG', { timeStyle: 'medium' }).format(new Date(baseTime + offsetMs));
  };

  const steps = [
    { title: 'Payment Initiated', desc: 'User requested bill payment on wallet debit', time: formatTime(0), active: true },
    { title: 'Validating Limits', desc: 'KYC status & single tx limit checks passed', time: formatTime(150), active: true },
    { title: 'Routed to Gateway', desc: `Forwarded to ${transaction.provider} API port`, time: formatTime(240), active: true },
    {
      title: transaction.status === 'successful' ? 'Credit Dispatched' : transaction.status === 'reversed' ? 'Reversal Logged' : 'Failed Processing',
      desc: transaction.status === 'successful' ? 'Gateway returned success response' : transaction.status === 'reversed' ? 'Reversal credited back' : transaction.errorMessage || 'Unknown API failure',
      time: formatTime(transaction.processingTimeMs),
      active: true,
      error: transaction.status === 'failed'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans">
      
      {/* 1. SEMI-TRANSPARENT BACKDROP */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300 ${
          modalOpen ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* 2. CENTERED MODAL LAYOUT */}
      <div
        className={`relative w-full max-w-xl bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-300 ${
          modalOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'
        }`}
      >
        
        {/* Absolute dynamic success toast */}
        {toastMessage && (
          <div className="absolute top-4 left-4 right-4 z-50 p-3 bg-emerald-600 text-white font-semibold text-xs rounded-xl shadow-lg flex items-center gap-2 animate-slide-in">
            <CheckCircle className="w-4 h-4" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* HEADER SECTION */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#1c2128] select-none">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded bg-cyan-500/10 text-cyan-500">
              <ArrowRightLeft className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Transaction Ledger</span>
              <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200 font-mono tracking-wide">
                {transaction.reference}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${
              transaction.status === 'successful'
                ? 'bg-emerald-500/10 text-emerald-500'
                : transaction.status === 'failed'
                ? 'bg-rose-500/10 text-rose-500'
                : transaction.status === 'reversed'
                ? 'bg-blue-500/10 text-blue-500'
                : 'bg-amber-500/10 text-amber-500 animate-pulse'
            }`}>
              {transaction.status}
            </span>

            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
              aria-label="Close modal dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
          
          {/* SECTION 1: SUMMARY LEDGER BANNER */}
          <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 dark:bg-[#0d1117]/30 border border-slate-100 dark:border-slate-800 rounded-xl text-center">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Charged Amount</span>
              <span className="text-base font-extrabold text-slate-800 dark:text-slate-100 font-mono tracking-tight block mt-1">
                {transaction.currency === 'USDT' || transaction.serviceType === 'USDT_DEPOSIT' || transaction.reference.toLowerCase().includes('usdt') || transaction.provider === 'NOWPayments'
                  ? `$${transaction.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} USDT`
                  : `₦${transaction.amount.toLocaleString()}`
                }
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Utility Service</span>
              <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded bg-cyan-500/10 text-[10px] font-extrabold text-cyan-500 uppercase tracking-wide">
                {transaction.serviceType.replace('_', ' ')}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Route Pathway</span>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mt-1">
                {transaction.provider}
              </span>
            </div>
          </div>

          {/* SECTION 2: END-USER DETAILS */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 select-none">
              <User className="w-4 h-4 text-cyan-500" />
              Customer Details
            </h4>
            {(() => {
              const maskEmail = (email: string) => {
                if (!email || !email.includes('@')) return email;
                const [username, domain] = email.split('@');
                if (username.length <= 5) {
                  return `${username.slice(0, 2)}*****@${domain}`;
                }
                return `${username.slice(0, 5)}*****@${domain}`;
              };
              const maskPhone = (phone: string) => {
                if (!phone) return phone;
                if (phone.length >= 11) {
                  return `${phone.slice(0, 7)}***${phone.slice(-4)}`;
                }
                return phone;
              };
              const showFull = simulatedRole === 'Super Admin';
              const emailVal = showFull ? transaction.userEmail : maskEmail(transaction.userEmail);
              const phoneVal = showFull ? transaction.userPhone : maskPhone(transaction.userPhone);
              return (
                <div className="p-3.5 bg-slate-50/50 dark:bg-slate-850 border border-slate-200/40 dark:border-slate-800/80 rounded-xl grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 font-medium block">Notification Email</span>
                    <span className="text-slate-800 dark:text-slate-200 font-bold block mt-0.5 break-all">
                      {emailVal}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Phone Contact</span>
                    <span className="text-slate-800 dark:text-slate-200 font-bold block mt-0.5 font-mono">
                      {phoneVal}
                    </span>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* SECTION 3: PROCESSING TIMELINE TRACK */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 select-none">
              <Clock className="w-4 h-4 text-cyan-500" />
              Audit Transaction Lifecycle
            </h4>

            <div className="relative pl-6 space-y-4 border-l border-slate-200 dark:border-slate-800 ml-2 select-none">
              {steps.map((step, idx) => (
                <div key={idx} className="relative">
                  {/* Bullet Dot indicator */}
                  <span className={`absolute -left-[30px] top-1 flex h-4 w-4 items-center justify-center rounded-full ring-4 ring-white dark:ring-[#161b22] ${
                    step.error
                      ? 'bg-rose-500 text-white'
                      : idx === steps.length - 1 && transaction.status === 'successful'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-300 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}>
                    {step.error ? (
                      <AlertTriangle className="w-2.5 h-2.5" />
                    ) : idx === steps.length - 1 && transaction.status === 'successful' ? (
                      <CheckCircle className="w-2.5 h-2.5" />
                    ) : (
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    )}
                  </span>
                  
                  <div className="flex items-center justify-between text-xs gap-3">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{step.title}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{step.time}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 4: GATEWAY PAYLOAD COLLAPSIBLE */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <button
              onClick={() => setJsonExpanded(!jsonExpanded)}
              className="flex items-center justify-between w-full px-4 py-3 bg-slate-50 dark:bg-[#1c2128] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <span className="flex items-center gap-2">
                <Code className="w-4 h-4 text-slate-400" />
                Raw Partner API Payload Response
              </span>
              <span className="text-[10px] text-cyan-500 hover:underline">
                {jsonExpanded ? 'Collapse' : 'Expand'}
              </span>
            </button>

            {jsonExpanded && (
              <div className="p-4 bg-slate-900 border-t border-slate-200 dark:border-slate-800 font-mono text-[10px] text-emerald-400 overflow-x-auto whitespace-pre leading-relaxed custom-scrollbar">
                {transaction.apiResponse || transaction.errorMessage ? (
                  <code>
                    {JSON.stringify(
                      JSON.parse(transaction.apiResponse || `{"error": "${transaction.errorMessage}"}`),
                      null,
                      2
                    )}
                  </code>
                ) : (
                  <span className="italic text-slate-500">No partner responses logs populated</span>
                )}
              </div>
            )}
          </div>

        </div>

        {/* FOOTER ACTIONS WRAPPER */}
        <div className="flex items-center justify-between gap-3 p-5 bg-slate-50 dark:bg-[#1c2128] border-t border-slate-200 dark:border-slate-800">
          <div className="text-[10px] text-slate-400 font-bold select-none uppercase tracking-wide">
            ProviderRef: {transaction.providerRef || 'N/A'}
          </div>

          <div className="flex gap-2 text-xs">
            {/* 1. Pending Actions */}
            {transaction.status === 'pending' && (
              <>
                <button
                  onClick={() => handleTriggerAction('retry')}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" />
                  Retry Process
                </button>
                <button
                  onClick={() => onClose()}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-lg transition-colors"
                >
                  Close
                </button>
              </>
            )}

            {/* 2. Failed Actions */}
            {transaction.status === 'failed' && (
              <>
                <button
                  onClick={() => handleTriggerAction('retry')}
                  className="px-3.5 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" />
                  Manual Retry
                </button>
                <button
                  onClick={() => handleTriggerAction('reverse')}
                  className="px-3.5 py-2 border border-rose-200 dark:border-rose-900/40 text-rose-500 hover:bg-rose-500/5 font-bold rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reverse Funds
                </button>
                <button
                  onClick={() => {
                    onClose();
                    window.location.href = '/admin/support?tkt=tx-failed';
                  }}
                  className="p-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 rounded-lg transition-colors"
                  title="Link to Dispute ticket"
                >
                  <HelpCircle className="w-4 h-4" />
                </button>
              </>
            )}

            {/* 3. Successful Actions */}
            {transaction.status === 'successful' && (
              <>
                <button
                  onClick={() => handleTriggerAction('reverse')}
                  className="px-4 py-2 border border-rose-200 dark:border-rose-900/40 text-rose-500 hover:bg-rose-500/5 font-bold rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reverse Payment
                </button>
                <button
                  onClick={() => handleTriggerAction('receipt')}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <FileDown className="w-4 h-4" />
                  Get Receipt
                </button>
              </>
            )}

            {transaction.status === 'reversed' && (
              <button
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg transition-colors"
              >
                Done
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
