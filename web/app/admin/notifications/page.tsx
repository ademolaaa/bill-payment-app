'use client';

import React, { useState, useEffect } from 'react';
import {
  notificationLogs,
  subscribe
} from '../../../lib/admin/mockStore';
import { NotificationLog } from '../../../types/admin';
import {
  Bell,
  Search,
  Users,
  Send,
  CheckCircle
} from 'lucide-react';
import Link from 'next/link';

export default function NotificationsPage() {
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [audienceFilter, setAudienceFilter] = useState('all-audiences');

  useEffect(() => {
    const syncLogs = () => {
      setLogs([...notificationLogs]);
    };
    syncLogs();
    return subscribe(syncLogs);
  }, []);

  const filteredLogs = logs.filter(log => {
    const matchesSearch =
      log.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.body.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAudience = audienceFilter === 'all-audiences' || log.targetAudience === audienceFilter;
    return matchesSearch && matchesAudience;
  });

  return (
    <div className="space-y-6 font-sans">
      
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 select-none">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Bell className="w-6 h-6 text-cyan-500" />
            Notification Campaigns
          </h1>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-1">
            Audit historically dispatched mobile push notifications, SMS campaigns, or utility alerts
          </p>
        </div>

        <Link
          href="/admin/broadcast"
          className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-black uppercase rounded-xl transition-all shadow-sm flex items-center gap-2"
        >
          <Send className="w-4 h-4" />
          Send New Broadcast
        </Link>
      </div>

      {/* 2. FILTERS */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-4 bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800 rounded-2xl">
        <div className="relative sm:col-span-8">
          <Search className="absolute left-3 top-2.5 w-4.5 h-4.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search campaigns by title, tag or body content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-xs bg-slate-50 dark:bg-[#0d1117] text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="relative sm:col-span-4">
          <select
            value={audienceFilter}
            onChange={(e) => setAudienceFilter(e.target.value)}
            className="w-full px-3 py-2.5 text-xs bg-slate-50 dark:bg-[#0d1117] text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-cyan-500 font-semibold text-slate-600 dark:text-slate-400"
          >
            <option value="all-audiences">All Target Audiences</option>
            <option value="all">Everyone (All Users)</option>
            <option value="verified">Verified KYC Only</option>
            <option value="unverified">Unverified KYC Only</option>
            <option value="pending">Pending KYC Only</option>
          </select>
        </div>
      </div>

      {/* 3. LOGS LIST */}
      <div className="bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-slate-50 dark:bg-[#1c2128] text-slate-400 uppercase font-bold select-none">
              <tr>
                <th className="p-4">Dispatched Campaign Details</th>
                <th className="p-4 text-center">Sender</th>
                <th className="p-4 text-center">Target Audience</th>
                <th className="p-4 text-center">Recipient Counts</th>
                <th className="p-4 text-center">Delivery State</th>
                <th className="p-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-transparent">
              {filteredLogs.length > 0 ? (
                filteredLogs
                  .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime())
                  .map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="p-4 space-y-1 max-w-sm">
                        <div className="font-extrabold text-slate-800 dark:text-slate-100 leading-snug">
                          {log.title}
                        </div>
                        <p className="text-slate-500 dark:text-slate-450 leading-relaxed font-medium break-words">
                          {log.body}
                        </p>
                      </td>
                      <td className="p-4 text-center font-semibold text-slate-655 dark:text-slate-350">
                        {log.sentBy}
                      </td>
                      <td className="p-4 text-center">
                        <span className="inline-flex px-2 py-0.5 rounded bg-cyan-500/10 text-[9px] font-black uppercase text-cyan-500">
                          {log.targetAudience}
                        </span>
                      </td>
                      <td className="p-4 text-center font-mono font-bold text-slate-700 dark:text-slate-300">
                        {log.recipientCount.toLocaleString()} Users
                      </td>
                      <td className="p-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 text-[9px] font-extrabold uppercase text-emerald-500">
                          <CheckCircle className="w-2.5 h-2.5" />
                          Sent
                        </span>
                      </td>
                      <td className="p-4 text-right font-mono text-slate-400 select-none">
                        {new Date(log.sentAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}{' '}
                        {new Date(log.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-400 italic">
                    No historical notification logs match current filter criteria.
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
