'use client';

import React from 'react';
import { TicketPanel } from '../../../components/admin/TicketPanel';
import { HelpCircle } from 'lucide-react';

export default function SupportDisputesPage() {
  return (
    <div className="space-y-6">
      
      {/* 1. HEADER TITLE BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 select-none">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-cyan-500" />
            Customer Disputes
          </h1>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-1">
            Analyze customer-reported failed bill dispatches, allocate cashbacks, and handle ticket communications
          </p>
        </div>
      </div>

      {/* 2. CORE INTERACTIVE TICKET PANELS */}
      <TicketPanel />

    </div>
  );
}
