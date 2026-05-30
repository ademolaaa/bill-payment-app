'use client';

import React, { useState, useEffect } from 'react';
import {
  bankDepositRecords,
  transactions as apiTransactions,
  reconcileManualMatch,
  subscribe
} from '../../../lib/admin/mockStore';
import { BankDepositRecord, Transaction } from '../../../types/admin';
import {
  RefreshCw,
  Search,
  Filter,
  CheckCircle,
  AlertTriangle,
  HelpCircle,
  ArrowRight,
  Database,
  Building,
  Calendar,
  Layers,
  FileSpreadsheet
} from 'lucide-react';

export default function ReconciliationPage() {
  const [deposits, setDeposits] = useState<BankDepositRecord[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedDeposit, setSelectedDeposit] = useState<BankDepositRecord | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'UNMATCHED' | 'MATCHED' | 'PARTIAL_MATCH'>('UNMATCHED');
  
  // State for finding matches
  const [txSearchQuery, setTxSearchQuery] = useState('');

  useEffect(() => {
    const syncStore = () => {
      setDeposits([...bankDepositRecords]);
      setTransactions([...apiTransactions]);
    };
    syncStore();
    return subscribe(syncStore);
  }, []);

  const handleManualMatch = (depositId: string, ledgerTxId: string) => {
    try {
      reconcileManualMatch(depositId, ledgerTxId);
      alert('Ledger entry and bank statement matches have been successfully linked and closed.');
      setSelectedDeposit(null);
    } catch (err: any) {
      alert(`Manual Match Failed: ${err.message}`);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'MATCHED':
        return <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-500/10 text-emerald-500 uppercase tracking-wider">MATCHED</span>;
      case 'PARTIAL_MATCH':
        return <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold bg-amber-500/10 text-amber-500 uppercase tracking-wider">PARTIAL MATCH</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold bg-rose-500/10 text-rose-500 uppercase tracking-wider animate-pulse">UNMATCHED</span>;
    }
  };

  // Filter deposit records
  const filteredDeposits = deposits.filter(dep => {
    const statusMatch = filterStatus === 'ALL' || dep.reconciliationStatus === filterStatus;
    const searchMatch =
      dep.senderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dep.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dep.amount.toString().includes(searchQuery);
    return statusMatch && searchMatch;
  });

  // Find candidate matches in ledger for the selected unmatched deposit
  const candidateTransactions = transactions.filter(tx => {
    // If we have a selected deposit, prioritize matching amounts or reference queries
    if (!selectedDeposit) return false;
    
    const isUnreconciled = !deposits.some(d => d.matchedLedgerTxId === tx.id);
    const matchesAmount = tx.amount === selectedDeposit.amount;
    const matchesSearch =
      tx.reference.toLowerCase().includes(txSearchQuery.toLowerCase()) ||
      tx.userEmail.toLowerCase().includes(txSearchQuery.toLowerCase()) ||
      tx.amount.toString().includes(txSearchQuery);

    return isUnreconciled && (matchesAmount || matchesSearch || txSearchQuery.length > 0);
  });

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 select-none">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <RefreshCw className="w-6 h-6 text-cyan-500" />
            Financial Reconciliation Engine
          </h1>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-1">
            Audit bank statement deposits and dynamically link them with digital ledger transactions
          </p>
        </div>
      </div>

      {/* FILTER CONTROL TABS */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800/80 rounded-2xl">
        <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-900/60 rounded-xl border border-slate-200/50 dark:border-slate-800/80">
          {(['UNMATCHED', 'MATCHED', 'PARTIAL_MATCH', 'ALL'] as const).map(status => (
            <button
              key={status}
              onClick={() => {
                setFilterStatus(status);
                setSelectedDeposit(null);
              }}
              className={`px-4 py-2 text-xs font-extrabold uppercase rounded-lg transition-all ${
                filterStatus === status
                  ? 'bg-white dark:bg-[#161b22] text-slate-850 dark:text-slate-100 shadow-sm'
                  : 'text-slate-400 hover:text-slate-500 dark:text-slate-500 dark:hover:text-slate-400'
              }`}
            >
              {status.replace('_', ' ').toLowerCase()} ({
                status === 'ALL' ? deposits.length : deposits.filter(d => d.reconciliationStatus === status).length
              })
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 w-4.5 h-4.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search deposits..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-[#0d1117] text-slate-850 dark:text-slate-100 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* SIDE-BY-SIDE MATCHING WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* BANK DEPOSIT RECORD LIST (Left Workspace) */}
        <div className={`p-5 bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4 ${selectedDeposit ? 'lg:col-span-6' : 'lg:col-span-12'}`}>
          <h3 className="text-xs font-bold text-slate-450 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800/60 pb-3">
            <Building className="w-4.5 h-4.5 text-cyan-500" />
            Bank Statement Credit Inflows
          </h3>

          <div className="space-y-3">
            {filteredDeposits.length > 0 ? (
              filteredDeposits.map(dep => {
                const isSelected = selectedDeposit?.id === dep.id;
                const matchedTx = dep.matchedLedgerTxId ? transactions.find(t => t.id === dep.matchedLedgerTxId) : null;

                return (
                  <div
                    key={dep.id}
                    onClick={() => dep.reconciliationStatus !== 'MATCHED' && setSelectedDeposit(dep)}
                    className={`p-4 border rounded-2xl transition-all duration-200 ${
                      dep.reconciliationStatus === 'MATCHED'
                        ? 'border-slate-150 dark:border-slate-850/80 bg-slate-50/20 dark:bg-transparent cursor-not-allowed opacity-75'
                        : isSelected
                        ? 'border-cyan-500 bg-cyan-500/5 cursor-pointer shadow-sm'
                        : 'border-slate-250 dark:border-slate-800/80 bg-white dark:bg-[#0d1117]/10 hover:border-slate-350 dark:hover:border-slate-750 cursor-pointer'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-800 dark:text-slate-150 text-xs">
                            {dep.senderName}
                          </span>
                          <span className="text-[9px] font-mono text-slate-400 font-bold bg-slate-100 dark:bg-slate-900 px-1.5 py-0.5 rounded">
                            {dep.reference}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-slate-400 font-bold font-mono">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(dep.bankTimestamp).toLocaleDateString()} - {new Date(dep.bankTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>

                      <div className="text-right space-y-1">
                        <div className="text-xs font-black text-slate-800 dark:text-slate-100 font-mono">
                          ₦{dep.amount.toLocaleString()}
                        </div>
                        <div className="flex items-center justify-end gap-1">
                          {getStatusBadge(dep.reconciliationStatus)}
                        </div>
                      </div>
                    </div>

                    {/* Matched Details inside item */}
                    {matchedTx && (
                      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-850/60 grid grid-cols-2 gap-2 text-[10px] font-bold font-mono leading-relaxed text-slate-450">
                        <div>
                          Linked Platform Ref:
                          <div className="text-cyan-600 mt-0.5">{matchedTx.reference}</div>
                        </div>
                        <div className="text-right">
                          Ledger Status:
                          <div className="text-emerald-500 mt-0.5">{matchedTx.status.toUpperCase()}</div>
                        </div>
                        {dep.varianceAmount && (
                          <div className="col-span-2 text-rose-500 font-extrabold mt-1">
                            ⚠ Variance Discrepancy Amount: ₦{dep.varianceAmount.toLocaleString()}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="p-12 text-center text-xs text-slate-400 italic">
                No bank deposit records found matching your filter criteria.
              </div>
            )}
          </div>
        </div>

        {/* LEDGER COMPLIANCE MATCHING (Right Workspace, only shows when a deposit is selected) */}
        {selectedDeposit && (
          <div className="lg:col-span-6 p-5 bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60 pb-3">
              <h3 className="text-xs font-bold text-slate-450 uppercase tracking-widest flex items-center gap-1.5">
                <Database className="w-4.5 h-4.5 text-cyan-500" />
                Ledger Transaction Candidates
              </h3>
              <button
                onClick={() => setSelectedDeposit(null)}
                className="text-[10px] font-bold uppercase text-slate-400 hover:text-slate-500 dark:text-slate-500 dark:hover:text-slate-400"
              >
                Close Panel
              </button>
            </div>

            <div className="p-4 bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 rounded-2xl space-y-2 text-xs leading-relaxed">
              <span className="font-extrabold block">Reconciling: {selectedDeposit.senderName}</span>
              <span className="opacity-95 block">
                Bank Amount: <strong>₦{selectedDeposit.amount.toLocaleString()}</strong> | Ref: <strong>{selectedDeposit.reference}</strong>
              </span>
              <span className="opacity-90 block mt-1.5">
                Below are the closest automated matches based on transaction amount. If there's a small discrepancy, matching will result in a <strong>Partial Match</strong> with variance logging.
              </span>
            </div>

            {/* Candidate Search bar */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4.5 h-4.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search ledger by Reference or Email..."
                value={txSearchQuery}
                onChange={(e) => setTxSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-[#0d1117] text-slate-850 dark:text-slate-100 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none"
              />
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
              {candidateTransactions.length > 0 ? (
                candidateTransactions.map(tx => {
                  const isExactAmount = tx.amount === selectedDeposit.amount;
                  return (
                    <div
                      key={tx.id}
                      className="p-3 border border-slate-200 dark:border-slate-800/80 rounded-xl bg-slate-50/20 dark:bg-[#0d1117]/30 hover:border-slate-350 dark:hover:border-slate-750 flex flex-wrap items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-cyan-600 dark:text-cyan-500">
                            {tx.reference}
                          </span>
                          {!isExactAmount && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-[8px] font-extrabold text-amber-500 uppercase tracking-wider">
                              Amount Variance
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 font-semibold font-mono">
                          <span>User: {tx.userEmail}</span>
                          <span className="block mt-0.5">Status: <strong className="text-emerald-500 uppercase">{tx.status}</strong></span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right font-mono font-bold text-slate-750 dark:text-slate-200">
                          ₦{tx.amount.toLocaleString()}
                        </div>
                        <button
                          onClick={() => handleManualMatch(selectedDeposit.id, tx.id)}
                          className="px-3 py-1.5 bg-slate-850 hover:bg-slate-700 text-white rounded-lg font-black text-[10px] uppercase flex items-center gap-1 shadow-sm transition-colors"
                        >
                          Match
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-xs text-slate-400 italic">
                  No compatible unmatched ledger transactions found in the database.
                </div>
              )}
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
