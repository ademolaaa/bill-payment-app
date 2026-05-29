'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  transactions,
  subscribe,
  retryTransaction,
  reverseTransaction
} from '../../../lib/admin/mockStore';
import { Transaction } from '../../../types/admin';
import { TransactionModal } from '../../../components/admin/TransactionModal';
import {
  Search,
  ArrowRightLeft,
  ChevronLeft,
  ChevronRight,
  Filter,
  FileSpreadsheet,
  Download
} from 'lucide-react';

function TransactionsPageContent() {
  const searchParams = useSearchParams();
  const autoOpenRef = searchParams.get('ref');

  const [txs, setTxs] = useState<Transaction[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Selected Detail Modal target
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  // Sync data dynamically from mockStore pub-sub
  useEffect(() => {
    const syncTxs = () => {
      setTxs([...transactions]);
    };
    syncTxs();
    return subscribe(syncTxs);
  }, []);

  // Handle URL query parameter parameter auto-opening on load
  useEffect(() => {
    if (autoOpenRef && txs.length > 0) {
      const match = txs.find((t) => t.reference === autoOpenRef);
      if (match) setSelectedTx(match);
    }
  }, [autoOpenRef, txs]);

  // Execute admin state mutations
  const handleTxAction = (action: string, txId: string) => {
    if (action === 'retry') {
      retryTransaction(txId);
    } else if (action === 'reverse') {
      reverseTransaction(txId);
    }

    // Refresh selectedTx object details inside active overlay to keep it synced
    const updated = transactions.find((t) => t.id === txId);
    if (updated) setSelectedTx(updated);
  };

  // Filter matching results
  const filteredTxs = txs.filter((t) => {
    const matchesSearch =
      t.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.userEmail.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesService = serviceFilter === 'all' || t.serviceType === serviceFilter;
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;

    return matchesSearch && matchesService && matchesStatus;
  });

  // Pagination bounds
  const totalPages = Math.max(Math.ceil(filteredTxs.length / itemsPerPage), 1);
  const paginatedTxs = filteredTxs
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Reset page bounds on filter adjustments
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, serviceFilter, statusFilter]);

  return (
    <div className="space-y-6">
      
      {/* 1. HEADER TITLE BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 select-none">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <ArrowRightLeft className="w-6 h-6 text-cyan-500" />
            Transaction Ledger
          </h1>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-1">
            Audit core utility dispatches, re-route processing gateways, or perform user cashbacks
          </p>
        </div>

        <button
          onClick={() => alert('Simulated CSV export complete!')}
          className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold uppercase rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-sm"
        >
          <Download className="w-4.5 h-4.5" />
          Export Ledger
        </button>
      </div>

      {/* 2. ADVANCED FILTER CONTROLS BAR */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-4 bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800 rounded-2xl">
        
        {/* Search */}
        <div className="relative sm:col-span-6">
          <Search className="absolute left-3 top-2.5 w-4.5 h-4.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by unique reference string or customer email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-xs bg-slate-50 dark:bg-[#0d1117] text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Service filter */}
        <div className="relative sm:col-span-3">
          <select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            className="w-full px-3 py-2.5 text-xs bg-slate-50 dark:bg-[#0d1117] text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-cyan-500 font-semibold"
          >
            <option value="all">All Service types</option>
            <option value="airtime">Airtime purchase</option>
            <option value="data">Data bundles purchase</option>
            <option value="electricity">Electricity prepaids</option>
            <option value="cable_tv">Cable TV subscript</option>
            <option value="betting">Betting wallet fund</option>
            <option value="scratch_card">PIN Scratch Card</option>
          </select>
        </div>

        {/* Status filter */}
        <div className="relative sm:col-span-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2.5 text-xs bg-slate-50 dark:bg-[#0d1117] text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-cyan-500 font-semibold"
          >
            <option value="all">All statuses</option>
            <option value="successful">Successful Only</option>
            <option value="failed">Failed Outages Only</option>
            <option value="reversed">Reversed Refunds Only</option>
            <option value="pending">Pending Routing Queue</option>
          </select>
        </div>

      </div>

      {/* 3. TRANSACTION DATA GRID */}
      <div className="p-5 bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4">
        
        <div className="overflow-hidden border border-slate-100 dark:border-slate-800/80 rounded-xl">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-slate-50 dark:bg-[#1c2128] text-slate-400 uppercase select-none font-bold">
              <tr>
                <th className="p-3.5">Reference String</th>
                <th className="p-3.5">Customer User</th>
                <th className="p-3.5 text-right">Debit Amount</th>
                <th className="p-3.5">Utility Channel</th>
                <th className="p-3.5">API Gateway</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-right">Activity Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-transparent">
              {paginatedTxs.length > 0 ? (
                paginatedTxs.map((tx) => (
                  <tr
                    key={tx.id}
                    onClick={() => setSelectedTx(tx)}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 cursor-pointer transition-colors"
                  >
                    <td className="p-3.5 font-mono font-bold text-cyan-600 dark:text-cyan-500">{tx.reference}</td>
                    <td className="p-3.5">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[160px]">
                          {tx.userEmail}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono mt-0.5">{tx.userPhone}</span>
                      </div>
                    </td>
                    <td className="p-3.5 text-right font-mono font-bold text-slate-700 dark:text-slate-350">
                      ₦{tx.amount.toLocaleString()}
                    </td>
                    <td className="p-3.5 capitalize">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded bg-cyan-500/10 text-[10px] font-extrabold text-cyan-500 uppercase tracking-wide">
                        {tx.serviceType.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3.5 font-semibold text-slate-600 dark:text-slate-400">{tx.provider}</td>
                    <td className="p-3.5 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${
                        tx.status === 'successful'
                          ? 'bg-emerald-500/10 text-emerald-500'
                          : tx.status === 'failed'
                          ? 'bg-rose-500/10 text-rose-500'
                          : tx.status === 'reversed'
                          ? 'bg-blue-500/10 text-blue-500'
                          : 'bg-amber-500/10 text-amber-500 animate-pulse'
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right font-mono text-slate-400 select-none">
                      {new Date(tx.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })} -{' '}
                      {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-xs text-slate-400 italic">
                    No transactions captured on ledger matching selected parameters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION WRAPPER FOOTER */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 select-none">
            <span className="text-[11px] text-slate-400 font-bold">
              Showing page {currentPage} of {totalPages} ({filteredTxs.length} items matched)
            </span>

            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((c) => Math.max(c - 1, 1))}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 disabled:opacity-40 disabled:cursor-not-allowed text-slate-500 dark:text-slate-400"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((c) => Math.min(c + 1, totalPages))}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 disabled:opacity-40 disabled:cursor-not-allowed text-slate-500 dark:text-slate-400"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

      </div>

      {/* OVERLAY DETAILS DIALOG SHEET */}
      {selectedTx && (
        <TransactionModal
          transaction={selectedTx}
          onClose={() => setSelectedTx(null)}
          onAction={handleTxAction}
        />
      )}

    </div>
  );
}

export default function TransactionsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-slate-400 animate-pulse">Loading ledger...</div>}>
      <TransactionsPageContent />
    </Suspense>
  );
}
