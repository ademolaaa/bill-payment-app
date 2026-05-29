'use client';

import { useState, useEffect } from 'react';
import {
  dashboardStats,
  customerUsers,
  supportTickets,
  systemAlerts,
  transactions,
  auditLogs,
  providers,
  notificationLogs,
  subscribe
} from '../lib/admin/mockStore';
import { DashboardStats, CustomerUser, SupportTicket, SystemAlert, Transaction, AuditLog, Provider, NotificationLog } from '../types/admin';

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats>({ ...dashboardStats });
  const [users, setUsers] = useState<CustomerUser[]>([...customerUsers]);
  const [tickets, setTickets] = useState<SupportTicket[]>([...supportTickets]);
  const [alerts, setAlerts] = useState<SystemAlert[]>([...systemAlerts]);
  const [txs, setTxs] = useState<Transaction[]>([...transactions]);
  const [logs, setLogs] = useState<AuditLog[]>([...auditLogs]);
  const [apiProviders, setApiProviders] = useState<Provider[]>([...providers]);
  const [notifications, setNotifications] = useState<NotificationLog[]>([...notificationLogs]);

  useEffect(() => {
    const sync = () => {
      setStats({ ...dashboardStats });
      setUsers([...customerUsers]);
      setTickets([...supportTickets]);
      setAlerts([...systemAlerts]);
      setTxs([...transactions]);
      setLogs([...auditLogs]);
      setApiProviders([...providers]);
      setNotifications([...notificationLogs]);
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
    alerts: alerts || [],
    transactions: txs,
    auditLogs: logs,
    providers: apiProviders,
    notificationLogs: notifications
  };
}
