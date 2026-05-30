'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useLayout } from './LayoutContext';
import {
  customerUsers,
  transactions,
  systemAlerts,
  acknowledgeAlert,
  resolveAlert,
  subscribe
} from '../../lib/admin/mockStore';
import { CustomerUser, Transaction, SystemAlert } from '../../types/admin';
import {
  Menu,
  Search,
  Bell,
  Sun,
  Moon,
  ChevronDown,
  User,
  Shield,
  LogOut,
  AlertTriangle,
  Info,
  Check,
  ShieldCheck as ShieldCheckIcon,
  ExternalLink
} from 'lucide-react';

interface HeaderProps {
  onMobileMenuToggle?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMobileMenuToggle }) => {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { toggleMobileSidebar, simulatedRole, setSimulatedRole } = useLayout();

  // Reactive store data
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [alertsDropdownOpen, setAlertsDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Search Results
  const [matchingUsers, setMatchingUsers] = useState<CustomerUser[]>([]);
  const [matchingTxs, setMatchingTxs] = useState<Transaction[]>([]);

  // Refs for clicking outside dropdowns
  const searchRef = useRef<HTMLDivElement>(null);
  const alertsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Sync state with the mock store on changes
  useEffect(() => {
    const syncStore = () => {
      setAlerts([...systemAlerts]);
    };
    syncStore();
    return subscribe(syncStore);
  }, []);

  // Handle Search queries
  useEffect(() => {
    if (!searchQuery.trim()) {
      setMatchingUsers([]);
      setMatchingTxs([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filteredUsers = customerUsers.filter(
      (u) =>
        u.fullName.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query) ||
        u.phone.includes(query)
    ).slice(0, 4);

    const filteredTxs = transactions.filter(
      (t) =>
        t.reference.toLowerCase().includes(query) ||
        t.userEmail.toLowerCase().includes(query)
    ).slice(0, 4);

    setMatchingUsers(filteredUsers);
    setMatchingTxs(filteredTxs);
  }, [searchQuery]);

  // Click outside listener for dropdown close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
      if (alertsRef.current && !alertsRef.current.contains(e.target as Node)) {
        setAlertsDropdownOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Breadcrumbs derivation from pathname
  const getBreadcrumbs = () => {
    const parts = pathname.split('/').filter(Boolean);
    return parts.map((part, index) => {
      const href = '/' + parts.slice(0, index + 1).join('/');
      const label = part.charAt(0).toUpperCase() + part.slice(1).replace('-', ' ');
      return { label, href, isLast: index === parts.length - 1 };
    });
  };

  const breadcrumbs = getBreadcrumbs();
  const unacknowledgedAlerts = alerts.filter((a) => !a.acknowledged);

  const handleAcknowledge = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    acknowledgeAlert(id);
  };

  const handleResolve = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    resolveAlert(id);
  };

  const handleMobileToggle = () => {
    if (onMobileMenuToggle) {
      onMobileMenuToggle();
    }
    toggleMobileSidebar();
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between w-full h-16 px-4 md:px-6 bg-white dark:bg-[#161b22] border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
      
      {/* 1. LEFT - MOBILE MENU & BREADCRUMB */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleMobileToggle}
          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden focus:outline-none"
          aria-label="Toggle mobile menu"
        >
          <Menu className="w-6 h-6" />
        </button>

        <nav className="hidden sm:flex items-center space-x-1.5 text-sm font-medium select-none">
          <span className="text-slate-400 dark:text-slate-500">BillAdmin</span>
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              <span className="text-slate-400 dark:text-slate-500">/</span>
              {crumb.isLast ? (
                <span className="text-slate-800 dark:text-slate-200 font-semibold">{crumb.label}</span>
              ) : (
                <span className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300">
                  {crumb.label}
                </span>
              )}
            </React.Fragment>
          ))}
        </nav>
      </div>

      {/* 2. CENTER - GLOBAL QUICK SEARCH */}
      <div ref={searchRef} className="relative flex-1 max-w-md mx-6 hidden md:block">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Search users by name, transactions by ref..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-[#0d1117] text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:border-cyan-500 dark:focus:border-cyan-500/50 transition-colors duration-200"
          />
        </div>

        {/* Quick Search Dropdown Result */}
        {searchFocused && searchQuery.trim() && (
          <div className="absolute top-12 left-0 right-0 z-50 bg-white dark:bg-[#1c2128] border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl overflow-hidden animate-fade-in">
            <div className="max-h-96 overflow-y-auto p-2 space-y-3 custom-scrollbar">
              
              {/* Category: Users */}
              <div>
                <h6 className="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Users
                </h6>
                {matchingUsers.length > 0 ? (
                  <div className="space-y-0.5 mt-1">
                    {matchingUsers.map((user) => (
                      <div
                        key={user.id}
                        onClick={() => {
                          setSearchFocused(false);
                          setSearchQuery('');
                          window.location.href = `/admin/users?id=${user.id}`;
                        }}
                        className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors duration-150"
                      >
                        <div>
                          <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                            {user.fullName}
                          </div>
                          <div className="text-xs text-slate-400">{user.email}</div>
                        </div>
                        <span className="text-xs text-slate-400 font-mono">{user.phone}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="px-3 py-2 text-xs text-slate-400 italic">No matching users</div>
                )}
              </div>

              {/* Category: Transactions */}
              <div>
                <h6 className="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Transactions
                </h6>
                {matchingTxs.length > 0 ? (
                  <div className="space-y-0.5 mt-1">
                    {matchingTxs.map((tx) => (
                      <div
                        key={tx.id}
                        onClick={() => {
                          setSearchFocused(false);
                          setSearchQuery('');
                          window.location.href = `/admin/transactions?ref=${tx.reference}`;
                        }}
                        className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors duration-150"
                      >
                        <div>
                          <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 font-mono">
                            {tx.reference}
                          </div>
                          <div className="text-xs text-slate-400">{tx.userEmail}</div>
                        </div>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          ₦{tx.amount.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="px-3 py-2 text-xs text-slate-400 italic">No matching transactions</div>
                )}
              </div>

            </div>
          </div>
        )}
      </div>

      {/* 3. RIGHT SIDE - UTILITIES (ALERTS, THEME, USER PROFILE) */}
      <div className="flex items-center gap-3 md:gap-4">
        
        {/* A. SYSTEM ALERTS BELL */}
        <div ref={alertsRef} className="relative">
          <button
            onClick={() => setAlertsDropdownOpen(!alertsDropdownOpen)}
            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none relative transition-colors duration-200"
            aria-label="System Alerts"
          >
            <Bell className="w-5 h-5" />
            {unacknowledgedAlerts.length > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white ring-2 ring-white dark:ring-[#161b22] animate-pulse">
                {unacknowledgedAlerts.length}
              </span>
            )}
          </button>

          {/* Alerts Dropdown Drawer */}
          {alertsDropdownOpen && (
            <div className="absolute right-0 top-12 z-50 w-80 md:w-96 bg-white dark:bg-[#1c2128] border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl overflow-hidden animate-fade-in">
              <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#161b22] flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">System Alerts</span>
                <span className="text-xs text-rose-500 font-bold">{unacknowledgedAlerts.length} Active Alerts</span>
              </div>
              <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 custom-scrollbar">
                {alerts.length > 0 ? (
                  alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-4 flex gap-3 ${
                        alert.acknowledged ? 'opacity-60 bg-white dark:bg-transparent' : 'bg-rose-500/5 dark:bg-rose-500/10'
                      }`}
                    >
                      {alert.type === 'error' ? (
                        <AlertTriangle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
                      ) : (
                        <Info className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                            {alert.service}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">
                          {alert.message}
                        </p>
                        
                        {!alert.acknowledged && (
                          <button
                            onClick={(e) => handleAcknowledge(alert.id, e)}
                            className="mt-2.5 flex items-center gap-1.5 px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[10px] font-semibold text-slate-600 dark:text-slate-300 transition-colors"
                          >
                            <Check className="w-3 h-3" />
                            Acknowledge
                          </button>
                        )}
                        <div className="flex items-center gap-1.5 mt-1.5">
                          {!alert.isResolved && (
                            <button
                              onClick={(e) => handleResolve(alert.id, e)}
                              className="flex items-center gap-1 px-2 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 transition-colors"
                            >
                              <ShieldCheckIcon className="w-3 h-3" />
                              Resolve
                            </button>
                          )}
                          {alert.sourceUrl && (
                            <button
                              onClick={(e) => { e.stopPropagation(); window.location.href = alert.sourceUrl!; }}
                              className="flex items-center gap-1 px-2 py-1 rounded bg-cyan-500/10 hover:bg-cyan-500/20 text-[10px] font-semibold text-cyan-600 dark:text-cyan-400 transition-colors"
                            >
                              <ExternalLink className="w-3 h-3" />
                              View
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-xs text-slate-400 italic">No system alerts active</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* B. SIMULATED ROLE SWITCHER DROPDOWN */}
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl shadow-sm">
          <span className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider hidden sm:inline">Role:</span>
          <select
            value={simulatedRole}
            onChange={(e) => setSimulatedRole(e.target.value as any)}
            className="bg-transparent text-xs font-black text-cyan-600 dark:text-cyan-400 outline-none border-none cursor-pointer focus:ring-0 p-0 pr-6"
            style={{ backgroundImage: 'none' }}
          >
            <option value="Super Admin" className="bg-white dark:bg-[#1c2128] text-slate-800 dark:text-slate-200">Super Admin</option>
            <option value="Finance Admin" className="bg-white dark:bg-[#1c2128] text-slate-800 dark:text-slate-200">Finance Admin</option>
            <option value="Operations Admin" className="bg-white dark:bg-[#1c2128] text-slate-800 dark:text-slate-200">Operations Admin</option>
            <option value="Compliance Officer" className="bg-white dark:bg-[#1c2128] text-slate-800 dark:text-slate-200">Compliance Officer</option>
          </select>
        </div>

        {/* C. DARK / LIGHT THEME TOGGLE */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none transition-colors duration-200"
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* D. ADMIN PROFILE DROPDOWN */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-2 p-1.5 pl-2.5 rounded-full md:rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200 focus:outline-none text-slate-800 dark:text-slate-200"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-cyan-600 text-white font-bold text-sm">
              D
            </div>
            <div className="hidden md:flex flex-col text-left select-none">
              <span className="text-xs font-semibold leading-none">Dele</span>
              <span className="text-[10px] font-medium text-slate-400 leading-none mt-1">{simulatedRole}</span>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 hidden md:block" />
          </button>

          {/* Profile Dropdown Drawer */}
          {profileDropdownOpen && (
            <div className="absolute right-0 top-12 z-50 w-52 bg-white dark:bg-[#1c2128] border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl overflow-hidden animate-fade-in divide-y divide-slate-100 dark:divide-slate-800">
              <div className="px-4 py-3 select-none">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Dele Balogun</p>
                <div className="inline-flex items-center gap-1.5 mt-1.5 px-2 py-0.5 rounded bg-cyan-500/10 text-[10px] font-bold text-cyan-500">
                  <Shield className="w-3 h-3" />
                  {simulatedRole}
                </div>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    window.location.href = '/admin/settings';
                  }}
                  className="flex items-center gap-2.5 w-full px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  My Profile
                </button>
                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    window.location.href = '/admin/settings?tab=roles';
                  }}
                  className="flex items-center gap-2.5 w-full px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <Shield className="w-4 h-4 text-slate-400" />
                  Permissions
                </button>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    alert('Signing out simulation!');
                  }}
                  className="flex items-center gap-2.5 w-full px-4 py-2 text-xs font-semibold text-rose-500 hover:bg-rose-500/5 dark:hover:bg-rose-500/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

    </header>
  );
};
