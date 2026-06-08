'use client';

import React, { useState, useEffect } from 'react';
import {
  getDailySuccessRateData,
  getServiceCategoryWithFees,
  getRevenueTimelineData,
  makerCheckerRequests,
  bankDepositRecords,
  approveMakerCheckerRequest,
  rejectMakerCheckerRequest,
  subscribe
} from '../../lib/admin/mockStore';
import { useDashboardStats } from '../../hooks/useDashboardStats';
import { DashboardStats, Transaction, AuditLog, MakerCheckerRequest, BankDepositRecord } from '../../types/admin';
import { useLayout } from '../../components/admin/LayoutContext';
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
  AlertTriangle,
  UserCheck,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
  Users,
  Clock,
} from 'lucide-react';

const maskEmail = (email: string) => {
  if (!email || !email.includes('@')) return email;
  const [username, domain] = email.split('@');
  if (username.length <= 5) {
    return `${username[0]}***${username[username.length - 1]}@${domain}`;
  }
  return `${username.slice(0, 3)}***${username.slice(-2)}@${domain}`;
};

const maskPhone = (phone: string) => {
  if (!phone) return '';
  if (phone.length <= 5) {
    return '***';
  }
  return `${phone.slice(0, 4)}******${phone.slice(-3)}`;
};

export default function AdminOverviewPage() {
  const { stats, transactions, auditLogs } = useDashboardStats();
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const { simulatedRole, setSimulatedRole } = useLayout();
  const [mcRequests, setMcRequests] = useState<MakerCheckerRequest[]>([]);
  const [deposits, setDeposits] = useState<BankDepositRecord[]>([]);

  // Sync with reactive mockStore databases
  useEffect(() => {
    const syncStore = () => {
      setMcRequests([...makerCheckerRequests]);
      setDeposits([...bankDepositRecords]);
    };
    syncStore();
    return subscribe(syncStore);
  }, []);

  // Sort and get the top 6 most recent transactions
  const recentTxs = [...transactions]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);

  // Sort and get recent admin audit activity logs
  const logs = [...auditLogs]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);

  // Dynamic revenue chart coordinates from mockStore
  const revenueData = getRevenueTimelineData();

  // Donut chart with fee rates from mockStore
  const donutData = getServiceCategoryWithFees();

  // Bar chart from mockStore
  const barData = getDailySuccessRateData();

  // Net profit calculation
  const netProfit = stats.netProfit;
  const gatewayCostRate = 0.8; // %

  const handleTxAction = (action: string, txId: string) => {
    setSelectedTx(null);
  };

  const handleMCApproval = (id: string) => {
    try {
      // Simulate Checker Admin Approval (using adm-1 Dele for demo)
      approveMakerCheckerRequest(id, 'adm-1', 'Super Admin Dele');
      alert('Request successfully approved and executed!');
    } catch (err: any) {
      alert(`Approval Denied: ${err.message}`);
    }
  };

  const handleMCRejection = (id: string) => {
    const reason = prompt('Please enter a rejection reason:', 'Invalid target account selection');
    if (reason !== null) {
      try {
        rejectMakerCheckerRequest(id, 'adm-1', 'Super Admin Dele', reason);
        alert('Request successfully rejected.');
      } catch (err: any) {
        alert(`Rejection Failed: ${err.message}`);
      }
    }
  };

  return (
    <div className="space-y-6">

      {/* AT RISK TRANSACTIONS BANNER (Super Admin / Operations / Compliance Only) */}
      {simulatedRole !== 'Finance Admin' && (
        <AtRiskBanner count={stats.atRiskTransactions} />
      )}
      
      {/* HEADER WITH ROLE SELECTION */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 select-none">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <span>{simulatedRole} Command Cockpit</span>
          </h1>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-1">
            {simulatedRole === 'Super Admin' && 'Full system visibility, security metrics, and overall utility financial flows'}
            {simulatedRole === 'Operations Admin' && 'Real-time API gateway health, automatic balancing distributions, and latency diagnostics'}
            {simulatedRole === 'Finance Admin' && 'Net platform profits, bank statement deposits matching, and wallet float metrics'}
            {simulatedRole === 'Compliance Officer' && 'Dual-authorization queues, KYC reviews status, and operational audit verification'}
          </p>
        </div>

        {/* ROLE SIMULATOR SELECTOR WIDGET */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl">
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Dashboard View:</span>
            <select
              value={simulatedRole}
              onChange={(e) => setSimulatedRole(e.target.value as any)}
              className="bg-transparent text-xs font-black text-cyan-600 dark:text-cyan-400 outline-none border-none cursor-pointer focus:ring-0 p-0"
            >
              <option value="Super Admin">Super Admin</option>
              <option value="Finance Admin">Finance Admin</option>
              <option value="Operations Admin">Operations Admin</option>
              <option value="Compliance Officer">Compliance Officer</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            Gateway Active
          </div>
        </div>
      </div>

      {/* -------------------- SUPER ADMIN VIEW -------------------- */}
      {simulatedRole === 'Super Admin' && (
        <>
          <StatCards stats={stats} />
          
          <div className="p-5 bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 divide-y md:divide-y-0 md:divide-x divide-slate-150 dark:divide-slate-800">
              {/* NGN Profit Split */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-500 shrink-0">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block truncate">NGN Net Profit</span>
                    <h3 className="text-lg sm:text-xl font-extrabold text-slate-800 dark:text-slate-100 font-mono mt-0.5 truncate" title={`₦${Math.round(netProfit).toLocaleString()}`}>
                      ₦{Math.round(netProfit).toLocaleString()}
                    </h3>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] text-slate-400 font-semibold block">After {gatewayCostRate}% fee offset</span>
                  <div className="text-xs font-bold text-cyan-500 mt-1 truncate" title={`Gross NGN: ₦${Math.round(stats.totalRevenue).toLocaleString()}`}>
                    Gross: ₦{Math.round(stats.totalRevenue).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* USDT Profit Split */}
              <div className="flex items-center justify-between gap-4 pt-4 md:pt-0 md:pl-6">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 shrink-0">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block truncate">USDT Net Profit</span>
                    <h3 className="text-lg sm:text-xl font-extrabold text-emerald-500 font-mono mt-0.5 truncate" title={`$${((stats.totalRevenueUsdt || 0) * (1 - gatewayCostRate / 100)).toLocaleString('en-US', { minimumFractionDigits: 2 })} USDT`}>
                      ${((stats.totalRevenueUsdt || 0) * (1 - gatewayCostRate / 100)).toLocaleString('en-US', { minimumFractionDigits: 2 })} USDT
                    </h3>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] text-slate-400 font-semibold block">After {gatewayCostRate}% fee offset</span>
                  <div className="text-xs font-bold text-emerald-500 mt-1 truncate" title={`Gross USDT: $${(stats.totalRevenueUsdt || 0).toLocaleString()} USDT`}>
                    Gross: ${(stats.totalRevenueUsdt || 0).toLocaleString()} USDT
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 p-5 bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800 rounded-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-slate-150 dark:border-slate-800/65">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <TrendingUp className="w-4.5 h-4.5 text-cyan-500" />
                  Gross Revenue vs Fee Margin Stream
                </span>
              </div>
              <div className="pt-4 h-72">
                <RevenueAreaChart data={revenueData} />
              </div>
            </div>
            <div className="lg:col-span-4 p-5 bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800 rounded-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-slate-150 dark:border-slate-800/65">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <PieChart className="w-4.5 h-4.5 text-cyan-500" />
                  Utility Volume Split
                </span>
              </div>
              <div className="pt-4 h-72 flex items-center justify-center">
                <ServiceDonutChart data={donutData} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 p-5 bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800 rounded-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-slate-150 dark:border-slate-800/65">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <BarChart3 className="w-4.5 h-4.5 text-cyan-500" />
                  Dispatched Top-ups Health
                </span>
              </div>
              <div className="pt-4 h-72">
                <DailySuccessBarChart data={barData} />
              </div>
            </div>
            <div className="lg:col-span-6 p-5 bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800 rounded-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-slate-150 dark:border-slate-800/65">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <History className="w-4.5 h-4.5 text-cyan-500" />
                  Recent Operations Audit Log
                </span>
              </div>
              <div className="pt-4 space-y-3">
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
        </>
      )}

      {/* -------------------- OPERATIONS ADMIN VIEW -------------------- */}
      {simulatedRole === 'Operations Admin' && (
        <>
          {/* Operations Core KPI Set */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
              <span className="text-xs font-semibold text-slate-400 uppercase">Auto-Routing Success Rate</span>
              <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 font-mono mt-1">{stats.successRate}%</h3>
              <p className="text-[10px] text-slate-400 mt-1">Dynamically balanced over 4 utility gateway ports</p>
            </div>
            <div className="p-5 bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
              <span className="text-xs font-semibold text-slate-400 uppercase">Active Dispatch Tunnels</span>
              <h3 className="text-2xl font-black text-emerald-500 font-mono mt-1">4 / 4 Health</h3>
              <p className="text-[10px] text-slate-400 mt-1">Flutterwave, MTN VTU Direct, Airtel Direct, VtPass</p>
            </div>
            <div className="p-5 bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
              <span className="text-xs font-semibold text-slate-400 uppercase">Pending Tech Disputes</span>
              <h3 className="text-2xl font-black text-amber-500 font-mono mt-1">{stats.openTickets} Open</h3>
              <p className="text-[10px] text-slate-400 mt-1">Requires immediate vendor callbacks</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 p-5 bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800 rounded-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-slate-150 dark:border-slate-800/65">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <BarChart3 className="w-4.5 h-4.5 text-cyan-500" />
                  Dispatched Top-ups Health
                </span>
              </div>
              <div className="pt-4 h-72">
                <DailySuccessBarChart data={barData} />
              </div>
            </div>
            <div className="lg:col-span-4 p-5 bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800 rounded-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-slate-150 dark:border-slate-800/65">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <PieChart className="w-4.5 h-4.5 text-cyan-500" />
                  Utility volume Split
                </span>
              </div>
              <div className="pt-4 h-72 flex items-center justify-center">
                <ServiceDonutChart data={donutData} />
              </div>
            </div>
          </div>
        </>
      )}

      {/* -------------------- FINANCE ADMIN VIEW -------------------- */}
      {simulatedRole === 'Finance Admin' && (
        <>
          {/* Finance Core KPI Set */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
              <span className="text-xs font-semibold text-slate-400 uppercase">Today&apos;s Revenue</span>
              <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 font-mono mt-1">₦{stats.todayRevenue.toLocaleString()}</h3>
              <p className="text-[10px] text-slate-400 mt-1">Calculated from ₦{stats.totalRevenue.toLocaleString()} total gross</p>
            </div>
            <div className="p-5 bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
              <span className="text-xs font-semibold text-slate-400 uppercase">Operational Float Balance</span>
              <h3 className="text-2xl font-black text-cyan-500 font-mono mt-1">₦{stats.walletFloat.toLocaleString()}</h3>
              <p className="text-[10px] text-slate-400 mt-1">Combined Providus/Wema virtual account float</p>
            </div>
            <div className="p-5 bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
              <span className="text-xs font-semibold text-slate-400 uppercase">Net Platform Profit</span>
              <h3 className="text-2xl font-black text-emerald-500 font-mono mt-1">₦{Math.round(netProfit).toLocaleString()}</h3>
              <p className="text-[10px] text-slate-400 mt-1">Margin: 3.5% after third-party routing offsets</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 p-5 bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800 rounded-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-slate-150 dark:border-slate-800/65">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <TrendingUp className="w-4.5 h-4.5 text-cyan-500" />
                  Gross Revenue vs Fee Margin Stream
                </span>
              </div>
              <div className="pt-4 h-72">
                <RevenueAreaChart data={revenueData} />
              </div>
            </div>

            {/* FINANCE MODULE: UNMATCHED BANK STATEMENT SUMMARY WIDGET */}
            <div className="lg:col-span-4 p-5 bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <FileSpreadsheet className="w-4.5 h-4.5 text-emerald-500" />
                  Unmatched Deposits Queue
                </span>
                <button
                  onClick={() => window.location.href = '/admin/reconciliation'}
                  className="text-[9px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-extrabold uppercase hover:underline"
                >
                  Match Hub
                </button>
              </div>

              <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar">
                {deposits.filter(d => d.reconciliationStatus === 'UNMATCHED').length > 0 ? (
                  deposits.filter(d => d.reconciliationStatus === 'UNMATCHED').map(dep => (
                    <div key={dep.id} className="p-3 bg-slate-50 dark:bg-[#0d1117]/35 border border-slate-100 dark:border-slate-800/80 rounded-xl space-y-1.5">
                      <div className="flex justify-between items-center text-[10px] font-bold">
                        <span className="text-slate-800 dark:text-slate-200">{dep.senderName}</span>
                        <span className="text-emerald-500">₦{dep.amount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center text-[9px] text-slate-400 font-semibold font-mono">
                        <span>Ref: {dep.reference}</span>
                        <span>{new Date(dep.bankTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-xs text-slate-400 italic">
                    All bank statement items successfully reconciled with ledger transactions!
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* -------------------- COMPLIANCE OFFICER VIEW -------------------- */}
      {simulatedRole === 'Compliance Officer' && (
        <>
          {/* Compliance Core KPI Set */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
              <span className="text-xs font-semibold text-slate-400 uppercase">Pending KYC Reviews</span>
              <h3 className="text-2xl font-black text-amber-500 font-mono mt-1">{stats.pendingKYC} Users</h3>
              <p className="text-[10px] text-slate-400 mt-1">Requires BVN/NIN verification reviews</p>
            </div>
            <div className="p-5 bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
              <span className="text-xs font-semibold text-slate-400 uppercase">At Risk Flagged Payments</span>
              <h3 className="text-2xl font-black text-rose-500 font-mono mt-1">{stats.atRiskTransactions} TXs</h3>
              <p className="text-[10px] text-slate-400 mt-1">Exhibiting abnormal routing latencies</p>
            </div>
            <div className="p-5 bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
              <span className="text-xs font-semibold text-slate-400 uppercase">Maker-Checker Approvals Queue</span>
              <h3 className="text-2xl font-black text-cyan-500 font-mono mt-1">
                {mcRequests.filter(r => r.status === 'PENDING').length} Pending
              </h3>
              <p className="text-[10px] text-slate-400 mt-1">Requiring secondary compliance authorization</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* MAKER CHECKER APPROVALS WORKSPACE */}
            <div className="lg:col-span-8 p-5 bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/60 select-none">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <UserCheck className="w-4.5 h-4.5 text-cyan-500" />
                  Dual-Authorization Verification Desk
                </span>
                <button
                  onClick={() => window.location.href = '/admin/maker-checker'}
                  className="text-[9px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-500 font-extrabold uppercase hover:underline"
                >
                  Full queue
                </button>
              </div>

              <div className="space-y-4">
                {mcRequests.filter(r => r.status === 'PENDING').length > 0 ? (
                  mcRequests.filter(r => r.status === 'PENDING').map(req => (
                    <div key={req.id} className="p-4 bg-slate-50 dark:bg-[#0d1117]/35 border border-slate-250 dark:border-slate-800/80 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 font-sans">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-cyan-500/10 text-cyan-500 text-[9px] font-black uppercase rounded">
                            {req.actionType.replace('_', ' ')}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 font-mono">
                            ID: {req.id}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-slate-750 dark:text-slate-200 mt-1">
                          Proposed Action: credit ₦{(req.payload.amount).toLocaleString()} to target {req.payload.userId}
                        </p>
                        <p className="text-[11px] text-slate-450 italic mt-0.5 leading-relaxed">
                          Reason: &quot;{req.payload.reason}&quot;
                        </p>
                        <div className="flex items-center gap-3 text-[10px] text-slate-400 font-bold mt-1.5 pt-1.5 border-t border-slate-100 dark:border-slate-800/50">
                          <span className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" />
                            Proposed by: {req.makerName}
                          </span>
                          <span className="flex items-center gap-1 font-mono">
                            <Clock className="w-3.5 h-3.5" />
                            Expires: {new Date(req.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleMCRejection(req.id)}
                          className="px-3 py-2 border border-rose-500/25 hover:bg-rose-500/5 text-rose-500 rounded-xl text-xs font-extrabold flex items-center gap-1 transition-colors"
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </button>
                        <button
                          onClick={() => handleMCApproval(req.id)}
                          className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-black flex items-center gap-1 shadow-sm transition-colors"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Approve
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-xs text-slate-400 italic">
                    Excellent work! No high-stakes actions pending secondary compliance checks.
                  </div>
                )}
              </div>
            </div>

            {/* COMPLIANCE RECENT OPERATIONS FEED */}
            <div className="lg:col-span-4 p-5 bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800 rounded-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-slate-150 dark:border-slate-800/65 select-none">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <History className="w-4.5 h-4.5 text-cyan-500" />
                  Operator Audit Track
                </span>
              </div>
              <div className="pt-4 space-y-3">
                {logs.map((log) => (
                  <div key={log.id} className="flex gap-3 text-xs items-start p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-850 text-slate-500 font-bold flex items-center justify-center flex-shrink-0 text-[10px]">
                      {log.adminName[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 select-none">
                        <span className="font-semibold text-slate-700 dark:text-slate-350">{log.adminName}</span>
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
        </>
      )}

      {/* RECENT TRANSACTIONS DATA TABLE GRID (Available for Super, Operations, Finance) */}
      {simulatedRole !== 'Compliance Officer' && (
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
                {recentTxs.length > 0 ? (
                  recentTxs.map((tx) => (
                    <tr
                      key={tx.id}
                      onClick={() => setSelectedTx(tx)}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 cursor-pointer transition-colors"
                    >
                      <td className="p-3 font-mono font-bold text-cyan-600 dark:text-cyan-500">{tx.reference}</td>
                      <td className="p-3">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[150px]">
                            {simulatedRole === 'Super Admin' ? tx.userEmail : maskEmail(tx.userEmail)}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                            {simulatedRole === 'Super Admin' ? tx.userPhone : maskPhone(tx.userPhone)}
                          </span>
                        </div>
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-slate-700 dark:text-slate-350">
                        {tx.currency === 'USDT' || tx.serviceType === 'USDT_DEPOSIT' || tx.reference.toLowerCase().includes('usdt') || tx.provider === 'NOWPayments'
                          ? `$${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} USDT`
                          : `₦${tx.amount.toLocaleString()}`
                        }
                      </td>
                      <td className="p-3 capitalize">
                        <span className="inline-flex items-center px-2 py-0.5 rounded bg-cyan-500/10 text-[10px] font-extrabold text-cyan-500 uppercase tracking-wide">
                          {tx.serviceType.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-3 font-medium text-slate-600 dark:text-slate-400">{tx.provider}</td>
                      <td className="p-3 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider border select-none ${
                            tx.status === 'successful'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                              : tx.status === 'failed'
                              ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                              : tx.status === 'reversed'
                              ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
                              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 animate-pulse'
                          }`}>
                            {tx.status}
                          </span>
                          {tx.atRisk && (
                            <span className="flex items-center gap-0.5 px-2 py-0.5 rounded bg-rose-500/20 text-rose-600 dark:text-rose-400 text-[8px] font-black uppercase tracking-wider border border-rose-500/35 animate-pulse select-none shadow-sm">
                              <span>⚠</span> AT RISK
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-right font-mono text-slate-400">
                        {new Date(tx.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })} -{' '}
                        {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-xs text-slate-400 dark:text-slate-500 italic select-none">
                      <div className="flex flex-col items-center justify-center gap-2 py-6">
                        <span className="text-2xl">📊</span>
                        <span>No ledger activities populated or matched today.</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* OVERLAY DETAILS MODAL LAUNCHER */}
      {selectedTx && (
        <TransactionModal
          transaction={selectedTx}
          onClose={() => setSelectedTx(null)}
          onAction={handleTxAction}
          simulatedRole={simulatedRole}
        />
      )}

    </div>
  );
}
