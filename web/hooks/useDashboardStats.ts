'use client';

import { useState, useEffect } from 'react';
import {
  dashboardStats,
  customerUsers,
  supportTickets,
  systemAlerts,
  transactions,
  auditLogs,
  subscribe,
  recalculateStats
} from '../lib/admin/mockStore';
import { DashboardStats, CustomerUser, SupportTicket, SystemAlert, Transaction, AuditLog } from '../types/admin';

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats>({ ...dashboardStats });
  const [users, setUsers] = useState<CustomerUser[]>([...customerUsers]);
  const [tickets, setTickets] = useState<SupportTicket[]>([...supportTickets]);
  const [alerts, setAlerts] = useState<SystemAlert[]>([...systemAlerts]);
  const [txs, setTxs] = useState<Transaction[]>([...transactions]);
  const [logs, setLogs] = useState<AuditLog[]>([...auditLogs]);

  useEffect(() => {
    const sync = () => {
      recalculateStats();
      setStats({ ...dashboardStats });
      setUsers([...customerUsers]);
      setTickets([...supportTickets]);
      setAlerts([...systemAlerts]);
      setTxs([...transactions]);
      setLogs([...auditLogs]);
    };
    // Sync initially on client load
    sync();
    // Return unsubscribe function
    return subscribe(sync);
  }, []);

  return {
    stats,
    users,
    tickets,
    alerts,
    transactions: txs,
    auditLogs: logs
  };
}
