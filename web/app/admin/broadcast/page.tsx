'use client';

import React from 'react';
import { BroadcastModal } from '../../../components/admin/BroadcastModal';
import { Megaphone } from 'lucide-react';

export default function BroadcastCampaignsPage() {
  return (
    <div className="space-y-6">
      
      {/* 1. HEADER TITLE BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 select-none">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-cyan-500" />
            Notification Broadcasts
          </h1>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-1">
            Deliver scheduled maintenance downtimes, critical API status, or promotional campaigns across customer sockets
          </p>
        </div>
      </div>

      {/* 2. CORE BROADCST MODAL & HISTORY PANELS */}
      <BroadcastModal />

    </div>
  );
}
