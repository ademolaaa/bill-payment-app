'use client';

import React, { useState } from 'react';
import {
  Megaphone,
  Mail,
  Users,
  Clock,
  Sparkles,
  AlertTriangle,
  PlayCircle,
  CheckCircle,
  History,
  TrendingUp
} from 'lucide-react';
import { sendNotification } from '../../lib/admin/mockStore';
import { useDashboardStats } from '../../hooks/useDashboardStats';

export const BroadcastModal: React.FC = () => {
  const { notificationLogs } = useDashboardStats();
  const [type, setType] = useState<'maintenance' | 'alert' | 'promo'>('maintenance');
  const [audience, setAudience] = useState<string>('all');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  
  // Dispatch Progress State
  const [isSending, setIsSending] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dispatchSuccess, setDispatchSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !content.trim()) {
      alert('Please fill out all fields before launching broadcast!');
      return;
    }

    setIsSending(true);
    setProgress(0);
    setDispatchSuccess(false);

    // Simulate real-time dispatch progress bar incrementation
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsSending(false);
            setDispatchSuccess(true);
            
            // Dispatch to global store!
            sendNotification({
              title: subject,
              body: content,
              targetAudience: audience === 'all' ? 'all' : audience === 'kyc1' ? 'unverified' : 'verified',
              sentBy: 'Super Admin Dele',
              recipientCount: audience === 'all' ? 25000 : audience === 'kyc1' ? 9500 : 15500
            });

            // Clear form
            setSubject('');
            setContent('');
          }, 600);
          return 100;
        }
        return prev + 10;
      });
    }, 150);
  };

  const getBroadcastIcon = (bType: string) => {
    switch (bType) {
      case 'maintenance':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'promo':
        return <Sparkles className="w-4 h-4 text-cyan-500" />;
      default:
        return <Megaphone className="w-4 h-4 text-rose-500" />;
    }
  };

  return (
    <div className="w-full font-sans select-none space-y-6">
      
      {/* 2-COLUMN BENTO GRID: CAMPAIGN BUILDER VS DELIVERY METRICS ARCHIVE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: LIVE FORM BUILDER PANEL (lg:col-span-7) */}
        <div className="lg:col-span-7 p-6 bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800 rounded-2xl space-y-5">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-rose-500/10 text-rose-500 rounded-xl">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
                Compose Administrative Broadcast
              </h3>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mt-0.5 leading-none">
                Deliver notification feeds across client channels
              </span>
            </div>
          </div>

          {dispatchSuccess && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl text-xs flex items-center gap-3 animate-fade-in">
              <CheckCircle className="w-6 h-6 flex-shrink-0" />
              <div>
                <span className="font-bold block">Broadcast Dispatched Successfully!</span>
                <span className="text-[10px] opacity-90 block mt-0.5">Payload delivered to push gateways and text channels.</span>
              </div>
            </div>
          )}

          {isSending ? (
            <div className="p-8 bg-slate-50 dark:bg-[#0d1117]/30 border border-slate-100 dark:border-slate-800 rounded-2xl text-center space-y-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-cyan-500/10 text-cyan-500 mx-auto animate-pulse">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-350 block">Distributing Broadcast Packets...</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Dispatching to socket nodes and push adapters</span>
              </div>
              
              {/* Progress track */}
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  style={{ width: `${progress}%` }}
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-150 rounded-full"
                />
              </div>
              <span className="text-xs font-mono font-extrabold text-cyan-500">{progress}% Completed</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
              <div className="grid grid-cols-2 gap-4">
                
                {/* FIELD 1: TYPE */}
                <div className="space-y-1.5">
                  <label className="text-slate-400 uppercase tracking-widest block">Broadcast Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0d1117] text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-cyan-500"
                  >
                    <option value="maintenance">Maintenance alert</option>
                    <option value="alert">System outage alert</option>
                    <option value="promo">Marketing campaign</option>
                  </select>
                </div>

                {/* FIELD 2: TARGET SEGMENT */}
                <div className="space-y-1.5">
                  <label className="text-slate-400 uppercase tracking-widest block">Target Audience</label>
                  <select
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0d1117] text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-cyan-500"
                  >
                    <option value="all">All registered accounts</option>
                    <option value="kyc1">KYC Level 1 (NIN Pending)</option>
                    <option value="kyc2">KYC Level 2 Verified</option>
                  </select>
                </div>

              </div>

              {/* FIELD 3: SUBJECT */}
              <div className="space-y-1.5">
                <label className="text-slate-400 uppercase tracking-widest block">Subject Header</label>
                <input
                  type="text"
                  placeholder="e.g. Schedule Maintenance: Vtpass API upgrade downtimes"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0d1117] text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* FIELD 4: CONTENT */}
              <div className="space-y-1.5">
                <label className="text-slate-400 uppercase tracking-widest block">Broadcast Body Content</label>
                <textarea
                  rows={5}
                  placeholder="Write clear, operational announcements here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0d1117] text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-cyan-500 font-sans leading-relaxed resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold uppercase rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              >
                <PlayCircle className="w-4.5 h-4.5" />
                Launch Dispatch Campaign
              </button>

            </form>
          )}

        </div>

        {/* RIGHT COLUMN: ARCHIVED DELIVERY FEED (lg:col-span-5) */}
        <div className="lg:col-span-5 p-6 bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800 rounded-2xl space-y-5">
          <div className="flex items-center gap-2 select-none">
            <div className="p-2 bg-cyan-500/10 text-cyan-500 rounded-xl">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
                Recent Broadcast Dispatches
              </h3>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mt-0.5 leading-none">
                Delivery ratios and open metrics log
              </span>
            </div>
          </div>

          <div className="space-y-3.5 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
            {notificationLogs && notificationLogs.length > 0 ? (
              notificationLogs.map((item) => (
                <div
                  key={item.id}
                  className="p-4 border border-slate-100 dark:border-slate-800 rounded-xl space-y-2.5 hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors"
                >
                  <div className="flex items-center justify-between text-[10px] font-bold">
                    <span className="flex items-center gap-1">
                      <Megaphone className="w-3.5 h-3.5 text-cyan-500" />
                      <span className="uppercase text-slate-400 font-mono">BROADCAST</span>
                    </span>
                    <span className="text-slate-400 font-mono">
                      {new Date(item.sentAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-100 leading-snug">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      {item.body}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2.5 border-t border-slate-100 dark:border-slate-800/60 text-[9px] font-bold select-none text-slate-400">
                    <div className="flex flex-col">
                      <span>Recipients</span>
                      <span className="text-xs font-extrabold text-slate-700 dark:text-slate-350 mt-0.5 font-mono">
                        {item.recipientCount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span>Sent By</span>
                      <span className="text-xs font-extrabold text-slate-700 dark:text-slate-350 mt-0.5 truncate">
                        {item.sentBy}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span>Target Cohort</span>
                      <span className="text-xs font-extrabold text-cyan-500 mt-0.5 truncate uppercase">
                        {item.targetAudience}
                      </span>
                    </div>
                  </div>

                </div>
              ))
            ) : (
              <div className="text-center p-8 text-slate-400 text-xs italic">
                No notification broadcast campaigns deployed.
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
