'use client';

import React, { useState, useEffect } from 'react';
import {
  dashboardStats,
  transactions,
  auditLogs,
  subscribe,
  recalculateStats,
  getDailySuccessRateData,
  getServiceCategoryWithFees
} from '../../lib/admin/mockStore';
import { DashboardStats, Transaction, AuditLog } from '../../types/admin';
import { StatCards } from '../../components/admin/StatCards';
import { AtRiskBanner } from '../../components/admin/AtRiskBanner';
import {
  RevenueAreaChart,
  ServiceDonutChart,
  DailySuccessBarChart
} from '../../components/admin/Charts';
import { TransactionModal } from '../../components/admin/TransactionModal';
import {
  Activity,
  History,
  TrendingUp,
  PieChart,
  BarChart3,
  ExternalLink,
  ShieldCheck,
  DollarSign,
  AlertTriangle
} from 'lucide-react';

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentTxs, setRecentTxs] = useState<Transaction[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  // Sync data dynamically from mockStore on subscription notify
  useEffect(() => {
    const syncStore = () => {
      // Refresh statistics recalculation on each store transaction mutation
      recalculateStats();
      setStats({ ...dashboardStats });
      
      // Sort and get the top 6 most recent transactions
      const sortedTxs = [...transactions]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 6);
      setRecentTxs(sortedTxs);

      // Sort and get recent admin audit activity logs
      const sortedLogs = [...auditLogs]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 5);
      setLogs(sortedLogs);
    };

    syncStore();
    return subscribe(syncStore);
  }, []);

  if (!stats) return null;

  // Mock revenue chart coordinates
  const revenueData = [
    { date: '2026-05-24', revenue: 145000, fees: 8900 },
    { date: '2026-05-25', revenue: 172000, font: 9400, fees: 11000 },
    { date: '2026-05-25', revenue: 172000, fees: 9400 },
    { date: '2026-05-26', revenue: 158000, fees: 9800 },
    { date: '2026-05-27', revenue: 210000, fees: 14200 },
    { date: '2026-05-28', revenue: 195000, fees: 12500 },
    { date: '2026-05-29', revenue: 245000, fees: 16800 }
  ];

  // Donut chart with fee rates from mockStore (fixes missing fee margin %)
  const donutData = getServiceCategoryWithFees();

  // Bar chart from mockStore (fixes Thu-Sun showing 0)
  const barData = getDailySuccessRateData();

  // Net profit calculation
  const netProfit = stats.netProfit;
  const gatewayCostRate = 0.8; // %

  // Modal actions callback
  const handleTxAction = (action: string, txId: string) => {
    // Operations handled in-memory. mockStore triggers pub-sub notify to rebuild dashboard
    setSelectedTx(null);
  };

  return (
    <div className="space-y-6">

      {/* AT RISK TRANSACTIONS BANNER */}
      <AtRiskBanner count={stats.atRiskTransactions} />
      
      {/* Dynamic welcome header panel */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 select-none">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-800 dark:text-slate-100">
            Operations Command Overview
          </h1>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-1">
            Real-time diagnostics and transactional auditing for Nigerian utility gateways
          </p>
        </div>
        <div className="flex items-center gap-2">
          {stats.escalatedTickets > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-500 text-xs font-bold uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4" />
              {stats.escalatedTickets} Escalated
            </div>
          )}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            Gateway Active
          </div>
        </div>
      </div>

      {/* KPI STATISTICS METRICS GRID */}
      <StatCards stats={stats} />

      {/* NET PROFIT SUMMARY CARD */}
      <div className="p-5 bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Net Platform Profit</span>
              <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-100 font-mono tabular-nums mt-0.5">
                ₦{Math.round(netProfit).toLocaleString()}
              </h3>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 font-semibold">After {gatewayCostRate}% gateway fees</span>
            <div className="text-xs font-bold text-emerald-500 mt-1">Gross: ₦{Math.round(stats.totalRevenue).toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* CHARTS CONTAINER GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* A. REVENUE AREA FLOW (lg:col-span-8) */}
        <div className="lg:col-span-8 p-5 bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800/80 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/60 select-none">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <TrendingUp className="w-4.5 h-4.5 text-cyan-500" />
              Gross Revenue vs Fee Margin Stream
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-50 dark:bg-[#0d1117] text-slate-400 font-bold uppercase">
              Last 6 Days
            </span>
          </div>
          <div className="pt-4 flex-1">
            <RevenueAreaChart data={revenueData} />
          </div>
        </div>

        {/* B. SERVICE DONUT DISTRIBUTION (lg:col-span-4) */}
        <div className="lg:col-span-4 p-5 bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800/80 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/60 select-none">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <PieChart className="w-4.5 h-4.5 text-cyan-500" />
              Utility Volume Split
            </span>
          </div>
          <div className="pt-4 flex-1 flex items-center justify-center">
            <ServiceDonutChart data={donutData} />
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* C. DAILY SUCCESS BAR (lg:col-span-6) */}
        <div className="lg:col-span-6 p-5 bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800/80 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/60 select-none">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <BarChart3 className="w-4.5 h-4.5 text-cyan-500" />
              Dispatched Top-ups Health
            </span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">
              Mon - Sun
            </span>
          </div>
          <div className="pt-4 flex-1">
            <DailySuccessBarChart data={barData} />
          </div>
        </div>

        {/* D. RECENT SYSTEM AUDIT FEED (lg:col-span-6) */}
        <div className="lg:col-span-6 p-5 bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800/80 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/60 select-none">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <History className="w-4.5 h-4.5 text-cyan-500" />
              Recent Operations Audit Log
            </span>
            <button
              onClick={() => window.location.href = '/admin/settings?tab=logs'}
              className="text-[10px] text-cyan-500 font-extrabold hover:underline uppercase tracking-wide flex items-center gap-0.5"
            >
              View Full
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
          
          <div className="pt-4 flex-1 space-y-3">
            {logs.map((log) => (
              <div key={log.id} className="flex gap-3 text-xs items-start p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold flex items-center justify-center flex-shrink-0 text-[10px]">
                  {log.adminName[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 select-none">
                    <span className="font-semibold text-slate-700 dark:text-slate-350">{log.adminName}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed text-[11px]">
                    <span className="font-bold text-slate-600 dark:text-slate-350 uppercase font-mono tracking-wide mr-1.5">
                      {log.action.replace('_', ' ')}:
                    </span>
                    {log.details}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* RECENT TRANSACTIONS DATA TABLE GRID */}
      <div className="p-5 bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4">
        <div className="flex items-center justify-between pb-2 select-none">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <Activity className="w-4.5 h-4.5 text-cyan-500" />
            Live Utility Activity Stream
          </h3>
          <button
            onClick={() => window.location.href = '/admin/transactions'}
            className="text-[10px] text-cyan-500 font-extrabold hover:underline uppercase tracking-wide flex items-center gap-0.5"
          >
            Full Ledger
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>

        <div className="overflow-hidden border border-slate-100 dark:border-slate-800/80 rounded-xl">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-slate-50 dark:bg-[#1c2128] text-slate-400 uppercase font-bold select-none">
              <tr>
                <th className="p-3">Reference</th>
                <th className="p-3">User Contact</th>
                <th className="p-3 text-right">Amount</th>
                <th className="p-3">Service Type</th>
                <th className="p-3">Gateway</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-transparent">
              {recentTxs.map((tx) => (
                <tr
                  key={tx.id}
                  onClick={() => setSelectedTx(tx)}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 cursor-pointer transition-colors"
                >
                  <td className="p-3 font-mono font-bold text-cyan-600 dark:text-cyan-500">{tx.reference}</td>
                  <td className="p-3">
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[150px]">{tx.userEmail}</span>
                      <span className="text-[10px] text-slate-400 font-mono mt-0.5">{tx.userPhone}</span>
                    </div>
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-slate-700 dark:text-slate-350">
                    ₦{tx.amount.toLocaleString()}
                  </td>
                  <td className="p-3 capitalize">
                    <span className="inline-flex items-center px-2 py-0.5 rounded bg-cyan-500/10 text-[10px] font-extrabold text-cyan-500 uppercase tracking-wide">
                      {tx.serviceType.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-3 font-medium text-slate-600 dark:text-slate-400">{tx.provider}</td>
                  <td className="p-3 text-center">
                    <div className="flex flex-col items-center gap-1">
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
                      {tx.atRisk && (
                        <span className="px-1.5 py-0.5 rounded bg-rose-500/10 text-[8px] font-extrabold text-rose-500 uppercase tracking-wider animate-pulse">
                          ⚠ AT RISK
                        </span>
                      )}
                      {tx.webhookLate && (
                        <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-[8px] font-bold text-amber-500 uppercase">
                          WEBHOOK LATE
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-3 text-right font-mono text-slate-400">
                    {new Date(tx.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })} -{' '}
                    {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* OVERLAY DETAILS MODAL LAUNCHER */}
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
