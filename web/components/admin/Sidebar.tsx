'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLayout } from './LayoutContext';
import {
  LayoutDashboard,
  Users,
  ArrowLeftRight,
  Zap,
  Wallet,
  Headphones,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
  FileWarning,
  Server
} from 'lucide-react';

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface SidebarGroup {
  title: string;
  items: SidebarItem[];
}

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar, mobileSidebarOpen, setMobileSidebarOpen } = useLayout();

  const navigation: SidebarGroup[] = [
    {
      title: 'OVERVIEW',
      items: [
        { name: 'Dashboard', href: '/admin', icon: LayoutDashboard }
      ]
    },
    {
      title: 'OPERATIONS',
      items: [
        { name: 'Users', href: '/admin/users', icon: Users },
        { name: 'Transactions', href: '/admin/transactions', icon: ArrowLeftRight },
        { name: 'Providers', href: '/admin/providers', icon: Server },
        { name: 'Services', href: '/admin/services', icon: Zap }
      ]
    },
    {
      title: 'FINANCE',
      items: [
        { name: 'Wallet / Finance', href: '/admin/wallet', icon: Wallet }
      ]
    },
    {
      title: 'SUPPORT',
      items: [
        { name: 'Help Desk', href: '/admin/support', icon: Headphones },
        { name: 'Notifications', href: '/admin/notifications', icon: Bell }
      ]
    },
    {
      title: 'SYSTEM',
      items: [
        { name: 'Error Logs', href: '/admin/logs', icon: FileWarning },
        { name: 'Settings', href: '/admin/settings', icon: Settings }
      ]
    }
  ];

  // Check if link is active
  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0f172a] text-slate-300 font-sans border-r border-slate-800 transition-all duration-300 ease-in-out">
      {/* 1. TOP LOGO SECTION */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800">
        <Link href="/admin" className="flex items-center gap-3 select-none">
          <svg className="w-8 h-8 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <line x1="12" y1="4" x2="12" y2="20" />
            <line x1="2" y1="12" x2="22" y2="12" />
          </svg>
          {!sidebarCollapsed && (
            <span className="font-semibold text-lg tracking-wider text-white uppercase animate-fade-in">
              BillAdmin
            </span>
          )}
        </Link>
        {/* Mobile Close Button */}
        <button
          onClick={() => setMobileSidebarOpen(false)}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 md:hidden focus:outline-none"
          aria-label="Close sidebar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* 2. NAVIGATION LINKS */}
      <div className="flex-1 overflow-y-auto py-6 px-3 space-y-7 custom-scrollbar">
        {navigation.map((group, idx) => (
          <div key={idx} className="space-y-2">
            {/* Group Label */}
            {!sidebarCollapsed ? (
              <h5 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider select-none">
                {group.title}
              </h5>
            ) : (
              <div className="h-px bg-slate-800 mx-2 select-none" />
            )}

            {/* Group Items */}
            <div className="space-y-1">
              {group.items.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileSidebarOpen(false)}
                    className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      active
                        ? 'bg-cyan-500/10 text-cyan-400 font-semibold border-l-2 border-cyan-400'
                        : 'hover:bg-slate-800/60 hover:text-white'
                    }`}
                  >
                    <Icon className={`w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-105 ${active ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                    
                    {!sidebarCollapsed && (
                      <span className="truncate">{item.name}</span>
                    )}

                    {/* Tooltip on Hover when Collapsed */}
                    {sidebarCollapsed && (
                      <div className="absolute left-16 z-50 hidden group-hover:flex items-center">
                        <div className="bg-slate-900 border border-slate-700 text-white font-medium text-xs rounded px-2.5 py-1.5 whitespace-nowrap shadow-xl">
                          {item.name}
                        </div>
                        <div className="w-1.5 h-1.5 bg-slate-900 border-l border-t border-slate-700 rotate-[-45deg] -translate-x-1" />
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* 3. COLLAPSE TOGGLE FOOTER BUTTON */}
      <div className="p-3 border-t border-slate-800 hidden md:block">
        <button
          onClick={toggleSidebar}
          className="flex items-center justify-center w-full py-2.5 rounded-lg bg-slate-800/40 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors duration-200 focus:outline-none"
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <div className="flex items-center gap-2">
              <ChevronLeft className="w-5 h-5" />
              <span className="text-xs font-medium">Collapse Menu</span>
            </div>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* A. DESKTOP STYLING WITH VARIABLE WIDTH */}
      <aside className={`hidden md:block h-screen sticky top-0 z-40 transition-all duration-300 ease-in-out flex-shrink-0 ${
        sidebarCollapsed ? 'w-16' : 'w-60'
      }`}>
        {sidebarContent}
      </aside>

      {/* B. MOBILE STYLING WITH FIXED DRAWER OVERLAY */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Semi-transparent Backdrop Overlay */}
          <div
            onClick={() => setMobileSidebarOpen(false)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300"
          />
          {/* Sidebar Drawer container */}
          <div className="relative flex flex-col w-64 h-full animate-slide-in shadow-2xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
