'use client';

import React, { useState, useEffect } from 'react';
import {
  makerCheckerRequests,
  approveMakerCheckerRequest,
  rejectMakerCheckerRequest,
  subscribe
} from '../../../lib/admin/mockStore';
import { MakerCheckerRequest } from '../../../types/admin';
import {
  ShieldCheck,
  Clock,
  UserCheck,
  UserX,
  Users,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Calendar
} from 'lucide-react';

export default function MakerCheckerPage() {
  const [requests, setRequests] = useState<MakerCheckerRequest[]>([]);
  const [activeTab, setActiveTab] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED'>('PENDING');
  const [selectedChecker, setSelectedChecker] = useState('adm-1'); // Default to Super Admin Dele
  const [searchQuery, setSearchQuery] = useState('');

  // Simulating standard admin user catalog for the dropdown checker selector
  const adminUsers = [
    { id: 'adm-1', name: 'Super Admin Dele' },
    { id: 'adm-2', name: 'Finance Admin Tolu' },
    { id: 'adm-3', name: 'Operations Admin Kemi' },
    { id: 'adm-4', name: 'Compliance Officer Wale' }
  ];

  useEffect(() => {
    const syncRequests = () => {
      setRequests([...makerCheckerRequests]);
    };
    syncRequests();
    return subscribe(syncRequests);
  }, []);

  const handleApprove = (id: string, makerId: string) => {
    if (selectedChecker === makerId) {
      alert('Security Exception: Collusion Guard Active! Maker is not allowed to checker-approve their own proposed request.');
      return;
    }

    try {
      const checker = adminUsers.find(a => a.id === selectedChecker);
      if (checker) {
        approveMakerCheckerRequest(id, checker.id, checker.name);
        alert('Dual-authorization verified. The proposed transaction has been committed to the ledger.');
      }
    } catch (err: any) {
      alert(`Approval Error: ${err.message}`);
    }
  };

  const handleReject = (id: string) => {
    const reason = prompt('Please enter a rejection audit reason:', 'Proposed float balance adjustment is incorrect');
    if (reason !== null) {
      try {
        const checker = adminUsers.find(a => a.id === selectedChecker);
        if (checker) {
          rejectMakerCheckerRequest(id, checker.id, checker.name, reason);
          alert('Proposed adjustment rejected successfully.');
        }
      } catch (err: any) {
        alert(`Rejection Error: ${err.message}`);
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold bg-cyan-500/10 text-cyan-500 uppercase tracking-wider animate-pulse">PENDING</span>;
      case 'APPROVED':
        return <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-500/10 text-emerald-500 uppercase tracking-wider">APPROVED</span>;
      case 'REJECTED':
        return <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold bg-rose-500/10 text-rose-500 uppercase tracking-wider">REJECTED</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold bg-slate-500/10 text-slate-500 uppercase tracking-wider">EXPIRED</span>;
    }
  };

  // Filter requests based on tab, searchQuery, and real-time TTL expiration
  const filteredRequests = requests.filter(req => {
    const isExpired = new Date(req.expiresAt).getTime() < Date.now();
    let statusMatch = false;

    if (activeTab === 'EXPIRED') {
      statusMatch = isExpired && req.status === 'PENDING';
    } else {
      statusMatch = req.status === activeTab && (!isExpired || req.status !== 'PENDING');
    }

    const matchesSearch =
      req.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.makerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.payload.userId?.toLowerCase().includes(searchQuery.toLowerCase());

    return statusMatch && matchesSearch;
  });

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 select-none">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-cyan-500" />
            Compliance Authorization Center
          </h1>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-1">
            Dual-signature verification workspace enforcing segregation of administrative duties
          </p>
        </div>

        {/* SIMULATE LOGGED-IN CHECKER */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl">
          <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Authorize As:</span>
          <select
            value={selectedChecker}
            onChange={(e) => setSelectedChecker(e.target.value)}
            className="bg-transparent text-xs font-black text-cyan-600 dark:text-cyan-400 outline-none border-none cursor-pointer p-0 focus:ring-0"
          >
            {adminUsers.map(admin => (
              <option key={admin.id} value={admin.id}>{admin.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* COMPLIANCE ALERT INFO */}
      <div className="p-4 bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 rounded-2xl flex items-start gap-3 select-none text-xs leading-relaxed">
        <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-extrabold block">Segregation of Duties (SOD) Safe Locks Enabled</span>
          <span className="opacity-90 block mt-1">
            To prevent self-authorization and potential financial fraud, <strong>the Maker is strictly barred from approving their own proposals</strong>. If the authorizer matches the creator of a proposal, the action buttons will flag a security conflict warning.
          </span>
        </div>
      </div>

      {/* TABS CONTROLLERS */}
      <div className="flex flex-wrap items-center gap-2 p-1 bg-slate-100 dark:bg-slate-900/60 rounded-xl w-fit border border-slate-200/50 dark:border-slate-800/80">
        {(['PENDING', 'APPROVED', 'REJECTED', 'EXPIRED'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-xs font-extrabold uppercase rounded-lg transition-all ${
              activeTab === tab
                ? 'bg-white dark:bg-[#161b22] text-slate-850 dark:text-slate-100 shadow-sm'
                : 'text-slate-400 hover:text-slate-500 dark:text-slate-500 dark:hover:text-slate-400'
            }`}
          >
            {tab.toLowerCase()} ({
              requests.filter(req => {
                const isExpired = new Date(req.expiresAt).getTime() < Date.now();
                if (tab === 'EXPIRED') return isExpired && req.status === 'PENDING';
                return req.status === tab && (!isExpired || req.status !== 'PENDING');
              }).length
            })
          </button>
        ))}
      </div>

      {/* SEARCH AND QUEUE VIEW */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4.5 h-4.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search queue by Request ID, Maker Name, or User ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-xs bg-white dark:bg-[#161b22] text-slate-850 dark:text-slate-100 border border-slate-200 dark:border-slate-800/80 rounded-xl focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="grid grid-cols-1 gap-4">
          {filteredRequests.length > 0 ? (
            filteredRequests.map(req => {
              const isCollusionRisk = req.makerId === selectedChecker && req.status === 'PENDING';
              return (
                <div
                  key={req.id}
                  className="p-5 bg-white dark:bg-[#161b22] border border-slate-250 dark:border-slate-800/80 rounded-2xl shadow-sm space-y-4 transition-all duration-200"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/60 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-cyan-500/10 text-cyan-500 text-[9px] font-black uppercase rounded">
                        {req.actionType.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 font-mono">
                        Request Ref: {req.id}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      {getStatusBadge(req.status)}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">PROPOSED PAYLOAD</span>
                      <div className="p-3 bg-slate-50 dark:bg-[#0d1117]/30 border border-slate-100 dark:border-slate-800/80 rounded-xl space-y-2 font-mono text-[11px] leading-relaxed">
                        <div>
                          <span className="text-slate-400 font-semibold">Target Entity:</span>{' '}
                          <span className="text-slate-800 dark:text-slate-200 font-bold">{req.targetEntityId}</span>
                        </div>
                        {req.actionType === 'WALLET_CREDIT' && (
                          <>
                            <div>
                              <span className="text-slate-400 font-semibold">Adjustment:</span>{' '}
                              <span className={req.payload.type === 'credit' ? 'text-emerald-500 font-bold' : 'text-rose-500 font-bold'}>
                                {req.payload.type.toUpperCase()} ₦{(req.payload.amount).toLocaleString()}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-400 font-semibold">Audit Reason:</span>{' '}
                              <span className="text-slate-600 dark:text-slate-350 italic">"{req.payload.reason}"</span>
                            </div>
                          </>
                        )}
                        {req.actionType === 'ROUTE_OVERRIDE' && (
                          <>
                            <div>
                              <span className="text-slate-400 font-semibold">Routing Override:</span>{' '}
                              <span className="text-slate-800 dark:text-slate-200 font-bold">
                                {req.payload.manualOverride ? 'FORCE DEGRADED ROUTING' : 'DYNAMIC AUTO ROUTING'}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-400 font-semibold">Target Gateway ID:</span>{' '}
                              <span className="text-slate-800 dark:text-slate-200">{req.payload.providerId}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3 flex flex-col justify-between">
                      <div className="space-y-2">
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">PROPOSAL CONTEXT</span>
                        <div className="grid grid-cols-2 gap-2 text-xs font-bold leading-relaxed">
                          <div className="text-slate-450 font-semibold">
                            Proposed By:
                            <div className="text-slate-850 dark:text-slate-200 font-bold mt-0.5 flex items-center gap-1">
                              <Users className="w-3.5 h-3.5 text-slate-400" />
                              {req.makerName}
                            </div>
                          </div>
                          <div className="text-slate-450 font-semibold">
                            Proposal Expiry:
                            <div className="text-slate-850 dark:text-slate-200 font-mono mt-0.5 flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              {new Date(req.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Audit Details for resolved items */}
                      {req.status !== 'PENDING' && (
                        <div className="p-3 bg-slate-50 dark:bg-[#0d1117]/30 border border-slate-100 dark:border-slate-800/80 rounded-xl text-[10px] leading-relaxed">
                          <div className="flex items-center gap-1 font-bold text-slate-500">
                            <Calendar className="w-3.5 h-3.5" />
                            Audit Signature
                          </div>
                          <div className="mt-1 font-semibold text-slate-600 dark:text-slate-350">
                            Authorized by: <strong className="text-slate-800 dark:text-slate-200">{req.checkerName}</strong>
                          </div>
                          {req.rejectionReason && (
                            <div className="mt-1 font-bold text-rose-500">
                              Rejection Reason: <span className="italic font-semibold">"{req.rejectionReason}"</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Collision Check warning banner */}
                      {isCollusionRisk && (
                        <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl flex items-center gap-2 text-[10.5px] font-bold animate-pulse">
                          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                          <span>Maker-Checker Collusion Guard Active. Select a different authorizer to approve.</span>
                        </div>
                      )}

                      {/* Compliance Verification Action Desk */}
                      {req.status === 'PENDING' && !isCollusionRisk && (
                        <div className="flex items-center gap-2.5 pt-2">
                          <button
                            onClick={() => handleReject(req.id)}
                            className="flex-1 px-4 py-2 text-xs font-black uppercase text-rose-500 hover:bg-rose-500/5 border border-rose-500/20 rounded-xl transition-all flex items-center justify-center gap-1"
                          >
                            <XCircle className="w-4 h-4" />
                            Reject Proposal
                          </button>
                          <button
                            onClick={() => handleApprove(req.id, req.makerId)}
                            className="flex-1 px-4 py-2 text-xs font-black uppercase text-white bg-emerald-500 hover:bg-emerald-650 rounded-xl transition-all flex items-center justify-center gap-1 shadow-sm"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Confirm Approval
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-12 text-center text-xs text-slate-400 italic">
              No authorization requests found matching this filter criteria.
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
