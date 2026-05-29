'use client';

import React from 'react';
import { CircuitState } from '../../types/admin';
import { ShieldCheck, ShieldAlert, ShieldQuestion, Zap } from 'lucide-react';

interface CircuitBreakerBadgeProps {
  state: CircuitState;
  failures: number;
  lastCheck: string;
  onPing?: () => void;
}

export const CircuitBreakerBadge: React.FC<CircuitBreakerBadgeProps> = ({ state, failures, lastCheck, onPing }) => {
  const config = {
    CLOSED: { icon: ShieldCheck, label: 'Healthy', bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/20' },
    HALF_OPEN: { icon: ShieldQuestion, label: 'Probing', bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/20' },
    OPEN: { icon: ShieldAlert, label: 'Tripped', bg: 'bg-rose-500/10', text: 'text-rose-500', border: 'border-rose-500/20' }
  };

  const c = config[state];
  const Icon = c.icon;
  const checkAge = lastCheck ? Math.round((Date.now() - new Date(lastCheck).getTime()) / 60000) : 0;

  return (
    <div className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border ${c.bg} ${c.border} transition-all duration-200`}>
      <div className="flex items-center gap-1.5">
        <Icon className={`w-3.5 h-3.5 ${c.text}`} />
        <span className={`text-[10px] font-extrabold uppercase tracking-wide ${c.text}`}>
          {c.label}
        </span>
      </div>

      {failures > 0 && (
        <span className="text-[9px] font-bold text-slate-400 font-mono">
          {failures} fail{failures > 1 ? 's' : ''}
        </span>
      )}

      <span className="text-[9px] text-slate-400 font-mono">
        {checkAge < 1 ? 'just now' : `${checkAge}m ago`}
      </span>

      {onPing && (
        <button
          onClick={(e) => { e.stopPropagation(); onPing(); }}
          className="ml-1 p-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-cyan-500/10 text-slate-400 hover:text-cyan-500 transition-colors"
          title="Run health check ping"
        >
          <Zap className="w-3 h-3" />
        </button>
      )}
    </div>
  );
};
