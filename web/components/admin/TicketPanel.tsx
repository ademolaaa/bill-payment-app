'use client';

import React, { useState } from 'react';
import { SupportTicket } from '../../types/admin';
import { resolveTicket, addTicketMessage, escalateTicketToProvider } from '../../lib/admin/mockStore';
import { useDashboardStats } from '../../hooks/useDashboardStats';
import {
  MessageSquare,
  Search,
  CheckCircle,
  HelpCircle,
  Clock,
  ArrowRight,
  User,
  Tag,
  AlertTriangle
} from 'lucide-react';

export const TicketPanel: React.FC = () => {
  const { tickets } = useDashboardStats();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'active' | 'resolved'>('active');
  const [expandedTicketId, setExpandedTicketId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<Record<string, string>>({});

  const handleResolve = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    resolveTicket(id);
  };

  const handleEscalate = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    escalateTicketToProvider(id);
  };

  const handleSendReply = (ticketId: string, e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const text = replyText[ticketId]?.trim();
    if (!text) return;

    try {
      addTicketMessage(ticketId, {
        sender: 'admin',
        content: text,
        timestamp: new Date().toISOString(),
        adminName: 'Support Agent Bola'
      });
      setReplyText(prev => ({ ...prev, [ticketId]: '' }));
    } catch (err: any) {
      alert(err.message || 'Failed to dispatch reply.');
    }
  };

  // Sort: escalated tickets float to top
  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      t.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.userEmail.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = filterCategory === 'all' || t.category === filterCategory;
    const matchesStatus = activeTab === 'active'
      ? (t.status === 'open' || t.status === 'in_progress')
      : (t.status === 'resolved' || t.status === 'closed');

    return matchesSearch && matchesCategory && matchesStatus;
  }).sort((a, b) => {
    if (a.escalated && !b.escalated) return -1;
    if (!a.escalated && b.escalated) return 1;
    return 0;
  });

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'wallet_funding':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'failed_bill':
        return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      default:
        return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    }
  };

  const getPriorityBadge = (pri: string) => {
    switch (pri) {
      case 'critical':
        return 'bg-rose-500/10 text-rose-500 border border-rose-500/20 animate-pulse';
      case 'high':
        return 'bg-rose-500/10 text-rose-500 border border-rose-500/20';
      case 'medium':
        return 'bg-amber-500/10 text-amber-500 border border-amber-500/20';
      default:
        return 'bg-slate-500/10 text-slate-500 border border-slate-500/20';
    }
  };

  // SLA countdown helper
  const getSlaDisplay = (deadline: string) => {
    const now = new Date();
    const sla = new Date(deadline);
    const diffMs = sla.getTime() - now.getTime();
    if (diffMs <= 0) return { text: 'OVERDUE', overdue: true };
    const mins = Math.round(diffMs / 60000);
    if (mins < 60) return { text: `${mins}m left`, overdue: false };
    const hrs = Math.floor(mins / 60);
    const rem = mins % 60;
    return { text: `${hrs}h ${rem}m left`, overdue: false };
  };

  return (
    <div className="w-full font-sans select-none space-y-6">
      
      {/* 1. TOP STATS HEADER BAR - Parity Unified */}
      <div className="grid grid-cols-3 gap-3 md:gap-4">
        <button
          onClick={() => setActiveTab('active')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            activeTab === 'active'
              ? 'border-cyan-500/30 bg-cyan-500/5 dark:bg-cyan-500/10 shadow-sm animate-fade-in'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161b22] hover:bg-slate-50'
          } col-span-2`}
        >
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Active Dispute Queue</span>
          <span className="text-xl md:text-2xl font-black font-mono mt-1 text-slate-850 dark:text-slate-100">
            {tickets.filter(t => t.status === 'open' || t.status === 'in_progress').length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('resolved')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            activeTab === 'resolved'
              ? 'border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-500/10 shadow-sm animate-fade-in'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161b22] hover:bg-slate-50'
          } col-span-1`}
        >
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Closed Cases</span>
          <span className="text-xl md:text-2xl font-black font-mono mt-1 text-slate-850 dark:text-slate-100">
            {tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length}
          </span>
        </button>
      </div>

      {/* 2. CONTROLS BAR: SEARCH & CATEGORY CHIPS */}
      <div className="flex flex-col sm:flex-row items-center gap-3 p-4 bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800 rounded-2xl">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 w-4.5 h-4.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search tickets by subject, reference or user email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-[#0d1117] text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden md:block">Category:</span>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 dark:bg-[#0d1117] text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-cyan-500 w-full sm:w-auto"
          >
            <option value="all">All Channels</option>
            <option value="wallet_funding">Wallet Funding disputes</option>
            <option value="failed_bill">Failed Bill Top-ups</option>
            <option value="other">Other System Issues</option>
          </select>
        </div>
      </div>

      {/* 3. TICKET CORRESPONDENCE STACKS */}
      <div className="space-y-3">
        {filteredTickets.length > 0 ? (
          filteredTickets.map((tkt) => {
            const isExpanded = expandedTicketId === tkt.id;
            return (
              <div
                key={tkt.id}
                onClick={() => setExpandedTicketId(isExpanded ? null : tkt.id)}
                className={`p-5 bg-white dark:bg-[#161b22] border rounded-2xl hover:shadow-sm transition-all duration-200 cursor-pointer ${
                  isExpanded
                    ? 'border-cyan-500/40 dark:border-cyan-500/30 ring-1 ring-cyan-500/20'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                
                {/* Visual Overview Row */}
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center flex-wrap gap-2 text-xs">
                      <span className="font-mono font-bold text-cyan-600 dark:text-cyan-500">
                        {tkt.reference}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] border uppercase font-extrabold ${getCategoryColor(tkt.category)}`}>
                        {tkt.category.replace('_', ' ')}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${getPriorityBadge(tkt.priority)}`}>
                        {tkt.priority} priority
                      </span>
                      {tkt.escalated && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-rose-500/20 text-rose-500 border border-rose-500/30 animate-pulse">
                          ⚠ ESCALATED
                        </span>
                      )}
                      {tkt.autoClassified && (
                        <span className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase bg-cyan-500/10 text-cyan-500">
                          AUTO-CLASSIFIED
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase border ${
                        tkt.status === 'open' 
                          ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' 
                          : tkt.status === 'in_progress'
                            ? 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                            : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                      }`}>
                        {tkt.status === 'open' ? 'Pending Reply' : tkt.status === 'in_progress' ? 'Investigating' : 'Resolved'}
                      </span>
                    </div>

                    <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
                      {tkt.subject}
                    </h4>
                    
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 flex-wrap">
                      <User className="w-3.5 h-3.5" />
                      <span>{tkt.userEmail}</span>
                      <span>•</span>
                      <span>Opened {new Intl.DateTimeFormat('en-NG', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(tkt.createdAt))}</span>
                      {tkt.slaDeadline && tkt.status !== 'resolved' && (() => {
                        const sla = getSlaDisplay(tkt.slaDeadline);
                        return (
                          <>
                            <span>•</span>
                            <span className={`font-bold ${sla.overdue ? 'text-rose-500' : 'text-amber-500'} flex items-center gap-0.5`}>
                              <Clock className="w-3 h-3" />
                              SLA: {sla.text}
                            </span>
                          </>
                        );
                      })()}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Action buttons */}
                    {tkt.status !== 'resolved' && tkt.category === 'failed_bill' && !tkt.escalated && (
                      <button
                        onClick={(e) => handleEscalate(tkt.id, e)}
                        className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold uppercase rounded-lg transition-colors flex items-center gap-1 select-none"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Escalate to Provider
                      </button>
                    )}

                    {tkt.status !== 'resolved' && (
                      <button
                        onClick={(e) => handleResolve(tkt.id, e)}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold uppercase rounded-lg transition-colors flex items-center gap-1 select-none"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Resolve Case
                      </button>
                    )}
                    
                    <span className="text-slate-400">
                      <ArrowRight className={`w-4 h-4 transform transition-transform duration-200 ${
                        isExpanded ? 'rotate-90 text-cyan-500' : ''
                      }`} />
                    </span>
                  </div>
                </div>

                {/* Collapsible Correspondence Stream Detail */}
                {isExpanded && (
                  <div className="mt-5 pt-5 border-t border-slate-100 dark:border-slate-800 space-y-4 animate-fade-in">
                    
                    {/* Conversation thread log */}
                    <div className="space-y-3">
                      <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5 text-cyan-500" />
                        Dispute Correspondence Stream
                      </h5>

                      <div className="p-4 bg-slate-50 dark:bg-[#0d1117]/30 border border-slate-100 dark:border-slate-850 rounded-xl space-y-3.5">
                        {tkt.messages.map((msg) => (
                          <div key={msg.id} className={`flex gap-2.5 ${msg.sender === 'admin' ? 'justify-end text-right' : ''}`}>
                            {msg.sender !== 'admin' && (
                              <div className="w-6 h-6 rounded-full bg-cyan-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 shadow-sm mt-1">
                                C
                              </div>
                            )}
                            <div className="flex-1 text-xs">
                              <span className="font-semibold text-slate-800 dark:text-slate-200">
                                {msg.sender === 'admin' ? (msg.adminName || 'Support Agent Bola') : 'Customer User'}
                              </span>
                              <span className="text-[9px] text-slate-400 font-semibold block mt-0.5 uppercase tracking-wide">
                                {new Intl.DateTimeFormat('en-NG', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(msg.timestamp))}
                              </span>
                              <p className={`mt-1.5 leading-relaxed p-3 rounded-xl border text-left inline-block max-w-[85%] ${
                                msg.sender === 'admin'
                                  ? 'bg-emerald-50 dark:bg-[#161b22] border-emerald-500/20 dark:border-emerald-500/20 text-slate-800 dark:text-slate-200 font-medium'
                                  : 'bg-white dark:bg-[#0d1117] border-slate-200/50 dark:border-slate-800 text-slate-650 dark:text-slate-350'
                              }`}>
                                {msg.content}
                              </p>
                            </div>
                            {msg.sender === 'admin' && (
                              <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 shadow-sm mt-1">
                                A
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Dynamic Reply Form */}
                    {tkt.status !== 'resolved' && (
                      <form onSubmit={(e) => handleSendReply(tkt.id, e)} className="flex gap-2 w-full">
                        <input
                          type="text"
                          placeholder="Type internal system notes or quick support reply..."
                          value={replyText[tkt.id] || ''}
                          onChange={(e) => {
                            e.stopPropagation();
                            setReplyText(prev => ({ ...prev, [tkt.id]: e.target.value }));
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="flex-1 px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-[#0d1117] text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-cyan-500 font-bold"
                        />
                        <button
                          type="submit"
                          onClick={(e) => e.stopPropagation()}
                          className="px-5 py-2.5 bg-slate-850 hover:bg-slate-750 dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-colors uppercase tracking-wider"
                        >
                          Send
                        </button>
                      </form>
                    )}

                  </div>
                )}

              </div>
            );
          })
        ) : (
          <div className="p-12 text-center text-xs text-slate-400 italic bg-white dark:bg-[#161b22] border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
            No support tickets found matching active criteria.
          </div>
        )}
      </div>

    </div>
  );
};
