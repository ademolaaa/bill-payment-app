'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  customerUsers,
  subscribe,
  updateUserStatus,
  approveKYC,
  rejectKYC
} from '../../../lib/admin/mockStore';
import { CustomerUser } from '../../../types/admin';
import { UserDrawer } from '../../../components/admin/UserDrawer';
import {
  Search,
  Users,
  Filter,
  UserCheck,
  UserX,
  FileCheck,
  MoreVertical,
  Plus
} from 'lucide-react';

function UsersPageContent() {
  const searchParams = useSearchParams();
  const autoOpenId = searchParams.get('id');

  const [users, setUsers] = useState<CustomerUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [kycFilter, setKycFilter] = useState('all');
  
  // Drawer active item target state
  const [selectedUser, setSelectedUser] = useState<CustomerUser | null>(null);

  // Sync data dynamically from mockStore
  useEffect(() => {
    const syncUsers = () => {
      setUsers([...customerUsers]);
    };
    syncUsers();
    return subscribe(syncUsers);
  }, []);

  // Handle URL query parameter auto-expansion on load
  useEffect(() => {
    if (autoOpenId && users.length > 0) {
      const match = users.find((u) => u.id === autoOpenId);
      if (match) setSelectedUser(match);
    }
  }, [autoOpenId, users]);

  // Execute admin state mutations
  const handleUserAction = (action: string, userId: string) => {
    if (action === 'suspend') {
      updateUserStatus(userId, 'suspended');
    } else if (action === 'activate') {
      updateUserStatus(userId, 'active');
    } else if (action === 'approveKYC') {
      approveKYC(userId);
    } else if (action === 'rejectKYC') {
      rejectKYC(userId);
    }

    // Refresh selectedUser object details inside active drawer to keep it synced
    const updated = customerUsers.find((u) => u.id === userId);
    if (updated) setSelectedUser(updated);
  };

  // Filter matching results
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.phone.includes(searchQuery);

    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
    const matchesKyc = kycFilter === 'all' || u.kycStatus === kycFilter;

    return matchesSearch && matchesStatus && matchesKyc;
  });

  return (
    <div className="space-y-6">
      
      {/* 1. HEADER TITLE BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 select-none">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Users className="w-6 h-6 text-cyan-500" />
            Customer Directory
          </h1>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-1">
            Perform KYC audits, allocate mock balances, or toggle account status permissions
          </p>
        </div>

        <button
          onClick={() => alert('Add customer accounts modal trigger!')}
          className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold uppercase rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-sm"
        >
          <Plus className="w-4.5 h-4.5" />
          Create Account
        </button>
      </div>

      {/* 2. ADVANCED FILTERS BAR */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-4 bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800 rounded-2xl">
        
        {/* Search */}
        <div className="relative sm:col-span-6">
          <Search className="absolute left-3 top-2.5 w-4.5 h-4.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by full name, email address or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-xs bg-slate-50 dark:bg-[#0d1117] text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Status */}
        <div className="relative sm:col-span-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2.5 text-xs bg-slate-50 dark:bg-[#0d1117] text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-cyan-500 font-semibold"
          >
            <option value="all">All statuses</option>
            <option value="active">Active Accounts Only</option>
            <option value="suspended">Suspended Accounts Only</option>
          </select>
        </div>

        {/* KYC Verification status */}
        <div className="relative sm:col-span-3">
          <select
            value={kycFilter}
            onChange={(e) => setKycFilter(e.target.value)}
            className="w-full px-3 py-2.5 text-xs bg-slate-50 dark:bg-[#0d1117] text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-cyan-500 font-semibold"
          >
            <option value="all">All KYC Statuses</option>
            <option value="verified">Verified Level 2</option>
            <option value="pending">Verification Pending</option>
            <option value="unverified">Unverified Level 1</option>
          </select>
        </div>

      </div>

      {/* 3. CUSTOMER DATA GRID TABLE */}
      <div className="p-5 bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800 rounded-2xl">
        
        <div className="overflow-hidden border border-slate-100 dark:border-slate-800/85 rounded-xl">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-slate-50 dark:bg-[#1c2128] text-slate-400 uppercase select-none font-bold">
              <tr>
                <th className="p-3.5">Customer Name</th>
                <th className="p-3.5">Email Address</th>
                <th className="p-3.5">Phone Number</th>
                <th className="p-3.5 text-right">Wallet Balance</th>
                <th className="p-3.5 text-center">KYC Status</th>
                <th className="p-3.5 text-center">Permissions</th>
                <th className="p-3.5 text-right">Join Date</th>
                <th className="p-3.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-transparent">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 cursor-pointer transition-colors"
                  >
                    <td className="p-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-cyan-500/10 text-cyan-500 flex items-center justify-center font-bold">
                          {user.fullName[0]}
                        </div>
                        <span className="font-extrabold text-slate-850 dark:text-slate-100">
                          {user.fullName}
                        </span>
                      </div>
                    </td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-400 font-medium break-all max-w-[150px]">{user.email}</td>
                    <td className="p-3.5 font-mono text-slate-500 dark:text-slate-400">{user.phone}</td>
                    <td className="p-3.5 text-right font-mono font-bold text-slate-800 dark:text-slate-200">
                      ₦{user.walletBalance.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                    </td>
                    
                    <td className="p-3.5 text-center">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                        user.kycStatus === 'verified'
                          ? 'bg-emerald-500/10 text-emerald-500'
                          : user.kycStatus === 'pending'
                          ? 'bg-amber-500/10 text-amber-500 animate-pulse'
                          : 'bg-rose-500/10 text-rose-500'
                      }`}>
                        {user.kycStatus}
                      </span>
                    </td>

                    <td className="p-3.5 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                        user.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-500'
                          : 'bg-rose-500/10 text-rose-500'
                      }`}>
                        {user.status}
                      </span>
                    </td>

                    <td className="p-3.5 text-right text-slate-400 font-medium select-none">
                      {new Date(user.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>

                    <td className="p-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => alert(`Operational shortcuts triggered for ${user.fullName}!`)}
                        className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600"
                        title="Shortcut Actions"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-xs text-slate-400 italic">
                    No registered user accounts found matching active parameters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* DETAILED USER PROFILE SLIDE-OUT DRAWER OVERLAY */}
      {selectedUser && (
        <UserDrawer
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onAction={handleUserAction}
        />
      )}

    </div>
  );
}

export default function UsersPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-slate-400 animate-pulse">Loading directory...</div>}>
      <UsersPageContent />
    </Suspense>
  );
}
