'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  adminUsers,
  auditLogs,
  subscribe
} from '../../../lib/admin/mockStore';
import { AdminUser, AuditLog } from '../../../types/admin';
import {
  Settings,
  Shield,
  History,
  Key,
  Bell,
  Search,
  CheckCircle,
  ToggleRight,
  ToggleLeft,
  Download
} from 'lucide-react';

function SettingsPageContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'roles';

  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [logQuery, setLogQuery] = useState('');

  // Filter audit logs
  const filteredLogs = logs.filter((log) => {
    return (
      log.adminName.toLowerCase().includes(logQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(logQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(logQuery.toLowerCase())
    );
  });

  const handleExportAuditLogs = () => {
    // Generate high-fidelity CSV rows
    const headers = ['ID', 'Admin Name', 'Timestamp', 'Action', 'Target', 'IP Address', 'Details'];
    const rows = filteredLogs.map((log) => [
      log.id,
      log.adminName,
      log.timestamp,
      log.action,
      log.target,
      log.ipAddress || '102.89.34.1', // fallback if empty
      log.details.replace(/"/g, '""') // escape double quotes for CSV safety
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(val => `"${val}"`).join(','))
    ].join('\n');

    // Create browser download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `billadmin_audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Sync state with mockStore
  useEffect(() => {
    const syncStore = () => {
      setAdmins([...adminUsers]);
      setLogs([...auditLogs]);
    };
    syncStore();
    return subscribe(syncStore);
  }, []);

  // Update tab on query param change
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const handleTogglePermission = (adminId: string, permission: string) => {
    alert(`Toggled permission "${permission}" for admin ID ${adminId}!`);
  };

  return (
    <div className="space-y-6">
      
      {/* 1. HEADER TITLE BAR */}
      <div className="flex items-center gap-2 select-none">
        <div className="p-2 bg-cyan-500/10 text-cyan-500 rounded-xl">
          <Settings className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-800 dark:text-slate-100">
            System Operations Settings
          </h1>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-1">
            Audit administrator logs, toggle role access policies, or configure gateway notifications
          </p>
        </div>
      </div>

      {/* 2. TABBED SELECTION CONTROLS */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-px select-none text-xs font-bold">
        <button
          onClick={() => setActiveTab('roles')}
          className={`px-4 py-2.5 -mb-px border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'roles'
              ? 'border-cyan-500 text-cyan-500'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Shield className="w-4 h-4" />
          Access Roles & Policies
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2.5 -mb-px border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'logs'
              ? 'border-cyan-500 text-cyan-500'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <History className="w-4 h-4" />
          Full System Audit Trail
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2.5 -mb-px border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'security'
              ? 'border-cyan-500 text-cyan-500'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Key className="w-4 h-4" />
          Gateway Security Keys
        </button>
      </div>

      {/* 3. TABS CONTAINER DETAILS */}
      <div className="pt-2">
        
        {/* TAB A: ACCESS ROLES & POLICIES */}
        {activeTab === 'roles' && (
          <div className="p-5 bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4 animate-fade-in">
            <div className="flex items-center justify-between select-none">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Registered Administrative Accounts
              </h3>
              <button
                onClick={() => alert('New operator addition forms trigger!')}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-bold uppercase rounded-lg transition-colors"
              >
                Add Operator
              </button>
            </div>

            <div className="overflow-hidden border border-slate-100 dark:border-slate-800/80 rounded-xl">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-50 dark:bg-[#1c2128] text-slate-400 uppercase font-bold select-none">
                  <tr>
                    <th className="p-3.5">Admin Operator</th>
                    <th className="p-3.5">Email Address</th>
                    <th className="p-3.5">Assigned Role</th>
                    <th className="p-3.5 text-center">Auto-Refund Policy</th>
                    <th className="p-3.5 text-center">API Route Edits</th>
                    <th className="p-3.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-transparent">
                  {admins.map((adm) => (
                    <tr key={adm.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="p-3.5">
                        <div className="flex items-center gap-2.5 select-none">
                          <div className="w-8 h-8 rounded-full bg-cyan-500/10 text-cyan-500 flex items-center justify-center font-bold">
                            {adm.name[0]}
                          </div>
                          <span className="font-extrabold text-slate-850 dark:text-slate-100">{adm.name}</span>
                        </div>
                      </td>
                      <td className="p-3.5 font-medium text-slate-500 dark:text-slate-400 break-all">{adm.email}</td>
                      <td className="p-3.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded bg-cyan-500/10 text-[9px] font-extrabold text-cyan-500 uppercase tracking-wide">
                          {adm.role.replace('_', ' ')}
                        </span>
                      </td>
                      
                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => handleTogglePermission(adm.id, 'refund')}
                          className="focus:outline-none"
                        >
                          {adm.permissions.includes('manage_refunds') || adm.role === 'Super Admin' ? (
                            <ToggleRight className="w-8 h-8 text-emerald-500" />
                          ) : (
                            <ToggleLeft className="w-8 h-8 text-slate-350 dark:text-slate-650" />
                          )}
                        </button>
                      </td>

                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => handleTogglePermission(adm.id, 'routes')}
                          className="focus:outline-none"
                        >
                          {adm.permissions.includes('manage_providers') || adm.role === 'Super Admin' ? (
                            <ToggleRight className="w-8 h-8 text-cyan-500" />
                          ) : (
                            <ToggleLeft className="w-8 h-8 text-slate-350 dark:text-slate-650" />
                          )}
                        </button>
                      </td>

                      <td className="p-3.5 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/10 text-emerald-500 select-none uppercase">
                          Active
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB B: SYSTEM AUDIT TRAIL */}
        {activeTab === 'logs' && (
          <div className="p-5 bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 select-none w-full pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Operations Audit Trails
                </h3>
                <p className="text-[10px] text-slate-400 mt-1">
                  Track administrative actions and security overrides
                </p>
              </div>
              
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <div className="relative flex-grow md:w-64">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Filter logs by operator or action..."
                    value={logQuery}
                    onChange={(e) => setLogQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-[#0d1117] text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-cyan-500"
                  />
                </div>
                
                <button
                  onClick={handleExportAuditLogs}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-bold uppercase rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-sm whitespace-nowrap"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export CSV
                </button>
              </div>
            </div>

            <div className="overflow-hidden border border-slate-100 dark:border-slate-800/80 rounded-xl">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-50 dark:bg-[#1c2128] text-slate-400 uppercase font-bold select-none">
                  <tr>
                    <th className="p-3.5">Timestamp</th>
                    <th className="p-3.5">Operator</th>
                    <th className="p-3.5">Action Command</th>
                    <th className="p-3.5">Target entity</th>
                    <th className="p-3.5">Detailed description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-transparent">
                  {filteredLogs.length > 0 ? (
                    filteredLogs
                      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                      .map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="p-3.5 font-mono text-slate-400 select-none">
                            {new Date(log.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })} -{' '}
                            {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="p-3.5 font-extrabold text-slate-800 dark:text-slate-100">{log.adminName}</td>
                          <td className="p-3.5">
                            <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-extrabold uppercase font-mono tracking-wide">
                              {log.action.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="p-3.5 font-mono font-semibold text-cyan-600 dark:text-cyan-500">{log.target}</td>
                          <td className="p-3.5 text-slate-600 dark:text-slate-400 font-medium leading-relaxed">{log.details}</td>
                        </tr>
                      ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-12 text-center text-xs text-slate-400 italic">
                        No operations audit trail items match filter parameters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB C: SECURITY KEYS CONFIG */}
        {activeTab === 'security' && (
          <div className="p-6 bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800 rounded-2xl space-y-5 animate-fade-in">
            <div className="space-y-1 select-none">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Partner Gateway API Access Keys
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Configure credential tokens routed to external billing gateways. Keep these strictly confidential.
              </p>
            </div>

            <div className="space-y-4 max-w-xl text-xs font-semibold">
              <div className="space-y-1.5">
                <label className="text-slate-400 uppercase tracking-widest block select-none">Shago API Authorization Key</label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value="••••••••••••••••••••••••••••••••••••"
                    disabled
                    className="flex-1 px-3 py-2 bg-slate-100 dark:bg-slate-850 text-slate-500 border border-slate-200 dark:border-slate-800 rounded-xl"
                  />
                  <button
                    onClick={() => alert('Simulated key rotation completed successfully!')}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-colors"
                  >
                    Rotate Token
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 uppercase tracking-widest block select-none">Vtpass Portal Secret Token</label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value="••••••••••••••••••••••••••••••••••••"
                    disabled
                    className="flex-1 px-3 py-2 bg-slate-100 dark:bg-slate-850 text-slate-500 border border-slate-200 dark:border-slate-800 rounded-xl"
                  />
                  <button
                    onClick={() => alert('Simulated key rotation completed successfully!')}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-colors"
                  >
                    Rotate Token
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-slate-400 animate-pulse">Loading settings...</div>}>
      <SettingsPageContent />
    </Suspense>
  );
}
