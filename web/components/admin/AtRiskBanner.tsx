'use client';

import React from 'react';
import { AlertTriangle, ExternalLink } from 'lucide-react';

interface AtRiskBannerProps {
  count: number;
}

export const AtRiskBanner: React.FC<AtRiskBannerProps> = ({ count }) => {
  if (count === 0) return null;

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 animate-pulse-slow select-none">
      <div className="flex items-center gap-2.5">
        <div className="p-1.5 rounded-lg bg-amber-500/20">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
        </div>
        <div>
          <span className="text-xs font-extrabold text-amber-600 dark:text-amber-400 uppercase tracking-wide">
            {count} AT RISK Transaction{count > 1 ? 's' : ''}
          </span>
          <p className="text-[10px] text-amber-500/80 dark:text-amber-500/60 font-medium mt-0.5">
            Pending transactions exceeding 30-minute threshold — webhook acknowledgment may be late
          </p>
        </div>
      </div>
      <button
        onClick={() => window.location.href = '/admin/transactions'}
        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500 text-white text-[10px] font-bold uppercase tracking-wide hover:bg-amber-600 transition-colors flex-shrink-0"
      >
        Review
        <ExternalLink className="w-3 h-3" />
      </button>
    </div>
  );
};
