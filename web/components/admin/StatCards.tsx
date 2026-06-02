'use client';

import React, { useState, useEffect } from 'react';
import { DashboardStats } from '../../types/admin';
import {
  TrendingUp,
  Clock,
  Activity,
  CheckCircle2,
  Users,
  ShieldAlert,
  HelpCircle,
  Wallet,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

// ==========================================
// ANIMATED COUNT-UP NUMBER HELPER
// ==========================================
const AnimatedNumber: React.FC<{ value: number; formatter?: (v: number) => string }> = ({ value, formatter }) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const duration = 750; // ms transition length
    
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setCurrent(progress * value);
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    
    window.requestAnimationFrame(step);
  }, [value]);

  return <>{formatter ? formatter(current) : Math.round(current).toLocaleString()}</>;
};

// Currency formatter to Nigerian Naira (₦)
const formatNaira = (val: number) => {
  return `₦${val.toLocaleString('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};

// Percentage formatter
const formatPercent = (val: number) => {
  return `${val.toFixed(1)}%`;
};

interface StatCardsProps {
  stats: DashboardStats;
}

export const StatCards: React.FC<StatCardsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full select-none font-sans">
      
      {/* 1. TOTAL REVENUE */}
      <div className="flex flex-col justify-between p-5 bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Total Revenue
          </span>
          <div className="p-2 rounded-lg bg-cyan-50 dark:bg-cyan-500/10 text-cyan-500 dark:text-cyan-400">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 space-y-2">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Naira (NGN)</span>
            <h3 className="text-xl md:text-2xl font-extrabold text-slate-800 dark:text-slate-100 font-mono tracking-tight leading-none tabular-nums overflow-hidden text-ellipsis whitespace-nowrap" title={formatNaira(stats.totalRevenue)}>
              <AnimatedNumber value={stats.totalRevenue} formatter={formatNaira} />
            </h3>
          </div>
          <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800/50">
            <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider block">Crypto (USDT)</span>
            <h3 className="text-lg md:text-xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono tracking-tight leading-none tabular-nums overflow-hidden text-ellipsis whitespace-nowrap">
              <AnimatedNumber value={stats.totalRevenueUsdt || 0} formatter={(v) => `$${v.toLocaleString('en-US', { minimumFractionDigits: 2 })} USDT`} />
            </h3>
          </div>
        </div>
      </div>

      {/* 2. TODAY'S REVENUE */}
      <div className="flex flex-col justify-between p-5 bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Today's Revenue
          </span>
          <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-500 dark:text-blue-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 space-y-2">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Naira (NGN)</span>
            <h3 className="text-xl md:text-2xl font-extrabold text-slate-800 dark:text-slate-100 font-mono tracking-tight leading-none tabular-nums overflow-hidden text-ellipsis whitespace-nowrap" title={formatNaira(stats.todayRevenue)}>
              <AnimatedNumber value={stats.todayRevenue} formatter={formatNaira} />
            </h3>
          </div>
          <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800/50">
            <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider block">Crypto (USDT)</span>
            <h3 className="text-lg md:text-xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono tracking-tight leading-none tabular-nums overflow-hidden text-ellipsis whitespace-nowrap">
              <AnimatedNumber value={stats.todayRevenueUsdt || 0} formatter={(v) => `$${v.toLocaleString('en-US', { minimumFractionDigits: 2 })} USDT`} />
            </h3>
          </div>
        </div>
      </div>

      {/* 3. TOTAL TRANSACTIONS */}
      <div className="flex flex-col justify-between p-5 bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Total Transactions
          </span>
          <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-500/10 text-purple-500 dark:text-purple-400">
            <Activity className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-xl md:text-2xl font-extrabold text-slate-800 dark:text-slate-100 font-mono tracking-tight leading-none tabular-nums overflow-hidden text-ellipsis whitespace-nowrap">
            <AnimatedNumber value={stats.totalTransactions} />
          </h3>
          <div className="flex items-center justify-between items-center mt-2.5">
            <span className="inline-flex items-center gap-1 text-emerald-500 text-xs font-semibold">
              <ArrowUpRight className="w-4 h-4" />
              8.1% volume
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-[10px] font-extrabold text-emerald-500 uppercase">
              Auto-Routing
            </span>
          </div>
        </div>
      </div>

      {/* 4. SUCCESS RATE */}
      <div className="flex flex-col justify-between p-5 bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Success Rate
          </span>
          <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 dark:text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-xl md:text-2xl font-extrabold text-slate-800 dark:text-slate-100 font-mono tracking-tight leading-none tabular-nums overflow-hidden text-ellipsis whitespace-nowrap">
            <AnimatedNumber value={stats.successRate} formatter={formatPercent} />
          </h3>
          <div className="flex items-center gap-1 mt-2.5 text-xs font-semibold">
            {stats.successRate >= 95 ? (
              <span className="text-emerald-500 flex items-center gap-1">
                <ArrowUpRight className="w-4 h-4" /> Healthy Gateways
              </span>
            ) : stats.successRate >= 85 ? (
              <span className="text-amber-500 flex items-center gap-1">
                <ArrowDownRight className="w-4 h-4" /> API Latency Detected
              </span>
            ) : (
              <span className="text-rose-500 flex items-center gap-1">
                <ArrowDownRight className="w-4 h-4" /> Severe Outages
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 5. ACTIVE USERS */}
      <div className="flex flex-col justify-between p-5 bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Active Users
          </span>
          <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-500 dark:text-amber-400">
            <Users className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-xl md:text-2xl font-extrabold text-slate-800 dark:text-slate-100 font-mono tracking-tight leading-none tabular-nums overflow-hidden text-ellipsis whitespace-nowrap">
            <AnimatedNumber value={stats.activeUsers} />
          </h3>
          <div className="flex items-center gap-1 mt-2.5 text-emerald-500 text-xs font-semibold">
            <ArrowUpRight className="w-4 h-4" />
            <span>+4 onboarded today</span>
          </div>
        </div>
      </div>

      {/* 6. PENDING KYC */}
      <div className="flex flex-col justify-between p-5 bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Pending KYC Reviews
          </span>
          <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-500/10 text-orange-500 dark:text-orange-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-xl md:text-2xl font-extrabold text-slate-800 dark:text-slate-100 font-mono tracking-tight leading-none tabular-nums flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
            <AnimatedNumber value={stats.pendingKYC} />
            {stats.pendingKYC > 0 && (
              <span className="px-2 py-0.5 rounded bg-orange-500/10 text-[10px] font-extrabold text-orange-500 uppercase tracking-wide animate-pulse">
                Action Required
              </span>
            )}
          </h3>
          <div className="flex items-center gap-1 mt-2.5 text-slate-400 text-xs">
            <span>Avg review time: 14 mins</span>
          </div>
        </div>
      </div>

      {/* 7. OPEN SUPPORT TICKETS */}
      <div className="flex flex-col justify-between p-5 bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Open Disputes
          </span>
          <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-500 dark:text-rose-400">
            <HelpCircle className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-xl md:text-2xl font-extrabold text-slate-850 dark:text-slate-100 font-mono tracking-tight leading-none tabular-nums flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
            <AnimatedNumber value={stats.openTickets} />
            {stats.openTickets > 0 && (
              <span className="px-2 py-0.5 rounded bg-rose-500/10 text-[10px] font-extrabold text-rose-500 uppercase tracking-wide">
                Active Queue
              </span>
            )}
          </h3>
          <div className="flex items-center gap-1 mt-2.5 text-rose-500 text-xs font-semibold">
            <ArrowUpRight className="w-4 h-4" />
            <span>{stats.escalatedTickets} escalated • SLA breach</span>
          </div>
        </div>
      </div>

      {/* 8. WALLET FLOAT */}
      <div className="flex flex-col justify-between p-5 bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Total Wallet Float
          </span>
          <div className="p-2 rounded-lg bg-teal-50 dark:bg-teal-500/10 text-teal-500 dark:text-teal-400">
            <Wallet className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 space-y-2">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Naira (NGN)</span>
            <h3 className="text-xl md:text-2xl font-extrabold text-slate-800 dark:text-slate-100 font-mono tracking-tight leading-none tabular-nums overflow-hidden text-ellipsis whitespace-nowrap" title={formatNaira(stats.walletFloat)}>
              <AnimatedNumber value={stats.walletFloat} formatter={formatNaira} />
            </h3>
          </div>
          <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800/50">
            <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider block">Crypto (USDT)</span>
            <h3 className="text-lg md:text-xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono tracking-tight leading-none tabular-nums overflow-hidden text-ellipsis whitespace-nowrap">
              <AnimatedNumber value={stats.walletFloatUsdt || 0} formatter={(v) => `$${v.toLocaleString('en-US', { minimumFractionDigits: 2 })} USDT`} />
            </h3>
          </div>
        </div>
      </div>

    </div>
  );
};
