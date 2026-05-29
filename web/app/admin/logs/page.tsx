'use client';

import React, { useState, useEffect } from 'react';
import {
  systemAlerts,
  resolveAlert,
  acknowledgeAlert,
  subscribe
} from '../../../lib/admin/mockStore';
import { SystemAlert } from '../../../types/admin';
import {
  FileWarning,
  AlertTriangle,
  Info,
  CheckCircle2,
  ExternalLink,
  Filter,
  ShieldCheck
} from 'lucide-react';

type FilterMode = 'all' | 'active' | 'resolved';

export default function ErrorLogsPage() {
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [filter, setFilter] = useState<FilterMode>('all');

  useEffect(() => {
    const syncStore = () => {
      setAlerts([...systemAlerts].sort((a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ));
    };
    syncStore();
    return subscribe(syncStore);
  }, []);

  const filtered = alerts.filter(a => {
    if (filter === 'active') return !a.isResolved;
    if (filter === 'resolved') return a.isResolved;
    return true;
  });

  const activeCount = alerts.filter(a => !a.isResolved).length;
  const resolvedCount = alerts.filter(a => a.isResolved).length;

  const getIcon = (type: string) => {
    if (type === 'error') return <AlertTriangle className="w-4 h-4 text-rose-500" />;
    if (type === 'warning') return <AlertTriangle className="w-4 h-4 text-amber-500" />;
    return <Info className="w-4 h-4 text-blue-500" />;
  };

  const handleResolve = (id: string) => {
    resolveAlert(id);
  };

  const handleAcknowledge = (id: string) => {
    acknowledgeAlert(id);
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 select-none">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <FileWarning className="w-6 h-6 text-rose-500" />
            Error & Alert Logs
          </h1>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-1">
            System alerts, gateway errors, and resolution audit trail
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-rose-500/10 text-rose-500">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span className="text-[10px] font-extrabold">{activeCount} Active</span>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-500">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span className="text-[10px] font-extrabold">{resolvedCount} Resolved</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-[#0d1117] rounded-xl w-fit select-none">
        {(['all', 'active', 'resolved'] as FilterMode[]).map(mode => (
          <button
            key={mode}
            onClick={() => setFilter(mode)}
            className={`px-4 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wide transition-all ${
              filter === mode
                ? 'bg-white dark:bg-[#161b22] text-slate-800 dark:text-slate-100 shadow-sm'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            <Filter className="w-3 h-3 inline mr-1" />
            {mode} ({mode === 'all' ? alerts.length : mode === 'active' ? activeCount : resolvedCount})
          </button>
        ))}
      </div>

      {/* Log Table */}
      <div className="bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800/80 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-slate-50 dark:bg-[#1c2128] text-slate-400 uppercase font-bold select-none">
              <tr>
                <th className="p-3 w-10">Type</th>
                <th className="p-3">Service</th>
                <th className="p-3">Message</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-right">Timestamp</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.length > 0 ? filtered.map(alert => (
                <tr key={alert.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="p-3">{getIcon(alert.type)}</td>
                  <td className="p-3">
                    <span className="font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide font-mono text-[10px]">
                      {alert.service}
                    </span>
                  </td>
                  <td className="p-3 max-w-md">
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{alert.message}</p>
                  </td>
                  <td className="p-3 text-center">
                    {alert.isResolved ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[9px] font-extrabold uppercase">
                        <CheckCircle2 className="w-3 h-3" /> Resolved
                      </span>
                    ) : alert.acknowledged ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-[9px] font-extrabold uppercase">
                        Acknowledged
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 text-[9px] font-extrabold uppercase animate-pulse">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-right font-mono text-slate-400 whitespace-nowrap">
                    {new Date(alert.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}{' '}
                    {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {alert.resolvedAt && (
                      <div className="text-[9px] text-emerald-500 mt-0.5">
                        Resolved {new Date(alert.resolvedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {alert.sourceUrl && (
                        <button
                          onClick={() => window.location.href = alert.sourceUrl!}
                          className="p-1.5 rounded-md hover:bg-cyan-500/10 text-slate-400 hover:text-cyan-500 transition-colors"
                          title="Go to source"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {!alert.isResolved && (
                        <button
                          onClick={() => handleResolve(alert.id)}
                          className="p-1.5 rounded-md hover:bg-emerald-500/10 text-slate-400 hover:text-emerald-500 transition-colors"
                          title="Mark as Resolved"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {!alert.acknowledged && !alert.isResolved && (
                        <button
                          onClick={() => handleAcknowledge(alert.id)}
                          className="p-1.5 rounded-md hover:bg-amber-500/10 text-slate-400 hover:text-amber-500 transition-colors"
                          title="Acknowledge"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 italic">
                    No alerts match the current filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
