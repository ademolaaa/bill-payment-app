'use client';

import React from 'react';
import { Provider } from '../../types/admin';
import { CircuitBreakerBadge } from './CircuitBreakerBadge';
import {
  Smartphone,
  Wifi,
  Zap,
  Tv,
  Coins,
  FileText,
  HelpCircle,
  ToggleLeft,
  ToggleRight,
  TrendingUp,
  Cpu,
  Layers,
  AlertTriangle
} from 'lucide-react';

interface ProviderCardProps {
  provider: Provider;
  onToggleStatus: (id: string) => void;
  onRouteOverride: (id: string, override: boolean) => void;
  onWeightChange: (id: string, weight: number) => void;
  onHealthPing?: (id: string) => void;
}

export const ProviderCard: React.FC<ProviderCardProps> = ({
  provider,
  onToggleStatus,
  onRouteOverride,
  onWeightChange,
  onHealthPing
}) => {
  
  // Icon selector based on utility service type
  const getServiceIcon = (type: string) => {
    switch (type) {
      case 'airtime':
        return <Smartphone className="w-5 h-5" />;
      case 'data':
        return <Wifi className="w-5 h-5" />;
      case 'electricity':
        return <Zap className="w-5 h-5" />;
      case 'cable_tv':
        return <Tv className="w-5 h-5" />;
      case 'betting':
        return <Coins className="w-5 h-5" />;
      case 'scratch_card':
        return <FileText className="w-5 h-5" />;
      default:
        return <HelpCircle className="w-5 h-5" />;
    }
  };

  // Dynamic status-colored indicator borders
  const statusBorderClass = provider.status === 'active'
    ? 'border-emerald-500/30 hover:border-emerald-500/60 dark:border-emerald-500/20 dark:hover:border-emerald-500/40'
    : provider.circuitState === 'OPEN'
    ? 'border-rose-500/30 hover:border-rose-500/50 dark:border-rose-500/20 dark:hover:border-rose-500/40'
    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700';

  // Scratch Card graceful degradation banner
  const isGracefulDegradation = provider.status === 'inactive' && provider.circuitState === 'OPEN';

  return (
    <div className={`flex flex-col justify-between p-5 bg-white dark:bg-[#161b22] border rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 font-sans ${statusBorderClass}`}>
      
      {/* Graceful Degradation Banner */}
      {isGracefulDegradation && (
        <div className="flex items-center gap-2 px-3 py-2 mb-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
          <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wide">
            Graceful Degradation — Users see &ldquo;Temporarily Unavailable&rdquo;
          </span>
        </div>
      )}

      {/* 1. TOP HEADER - BRANDING & SERVICE LABELS */}
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${
              provider.status === 'active'
                ? 'bg-cyan-500/10 text-cyan-500'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
            }`}>
              {getServiceIcon(provider.serviceType)}
            </div>
            
            <div>
              <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
                {provider.name}
              </h4>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mt-0.5 leading-none">
                {provider.serviceType.replace('_', ' ')}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1.5">
            {/* Status indicators */}
            <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wide leading-none ${
              provider.status === 'active'
                ? 'bg-emerald-500/10 text-emerald-500'
                : provider.status === 'degraded'
                ? 'bg-amber-500/10 text-amber-500'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
            }`}>
              {provider.status}
            </span>

            {/* Performance Health Grade */}
            <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold leading-none font-mono ${
              provider.successRate >= 98
                ? 'bg-emerald-500/10 text-emerald-500'
                : provider.successRate >= 95
                ? 'bg-amber-500/10 text-amber-500'
                : 'bg-rose-500/10 text-rose-500'
            }`}>
              {provider.successRate}% OK
            </span>
          </div>
        </div>

        {/* Circuit Breaker Badge */}
        <div className="mt-3">
          <CircuitBreakerBadge
            state={provider.circuitState}
            failures={provider.consecutiveFailures}
            lastCheck={provider.lastHealthCheck}
            onPing={onHealthPing ? () => onHealthPing(provider.id) : undefined}
          />
        </div>

        {/* Fallback route indicator */}
        {provider.fallbackProviderId && (
          <div className="mt-2 flex items-center gap-1.5 px-2 py-1 rounded-md bg-blue-500/10 border border-blue-500/10">
            <Layers className="w-3 h-3 text-blue-500" />
            <span className="text-[9px] font-bold text-blue-500 uppercase tracking-wide">
              Fallback route configured
            </span>
          </div>
        )}

        {/* 2. LATENCY & DISPATCH TIMES */}
        <div className="mt-4 grid grid-cols-2 gap-2 text-[10px] font-bold p-2.5 bg-slate-50 dark:bg-[#0d1117]/30 border border-slate-100 dark:border-slate-800/80 rounded-xl select-none">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Cpu className="w-3.5 h-3.5 text-slate-400" />
            <span>RTT: <span className="text-slate-700 dark:text-slate-300 font-mono">{provider.latencyMs}ms</span></span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400 justify-end">
            <TrendingUp className="w-3.5 h-3.5 text-slate-400" />
            <span>Success: <span className="text-slate-700 dark:text-slate-300 font-mono">{provider.successRate}%</span></span>
          </div>
        </div>
      </div>

      {/* 3. INTERACTIVE SWITCH CONTROLS */}
      <div className="mt-5 space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800/80">
        
        {/* SWITCH A: ENABLE GATEWAY */}
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-500 dark:text-slate-400 select-none">Enable API Access</span>
          <button
            onClick={() => onToggleStatus(provider.id)}
            className="focus:outline-none transition-colors duration-200"
            aria-label="Toggle provider status"
          >
            {provider.status === 'active' ? (
              <ToggleRight className="w-9 h-9 text-emerald-500" />
            ) : (
              <ToggleLeft className="w-9 h-9 text-slate-300 dark:text-slate-600" />
            )}
          </button>
        </div>

        {/* SWITCH B: MANUAL ROUTE OVERRIDE */}
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-500 dark:text-slate-400 select-none flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-cyan-500" />
            Manual Override
          </span>
          <button
            onClick={() => onRouteOverride(provider.id, !provider.manualOverride)}
            className="focus:outline-none transition-colors duration-200"
            aria-label="Toggle manual routing weight"
          >
            {provider.manualOverride ? (
              <ToggleRight className="w-9 h-9 text-cyan-500" />
            ) : (
              <ToggleLeft className="w-9 h-9 text-slate-300 dark:text-slate-600" />
            )}
          </button>
        </div>

        {/* SLIDER BLOCK: ROUTING WEIGHT ALLOCATION */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-semibold select-none">
            <span className={provider.manualOverride ? 'text-slate-500 dark:text-slate-400' : 'text-slate-300 dark:text-slate-600 font-normal italic'}>
              {provider.manualOverride ? 'Traffic Allocations Weight' : 'Auto-routed by latency stats'}
            </span>
            {provider.manualOverride && (
              <span className="font-extrabold text-cyan-500 font-mono text-xs bg-cyan-500/10 px-1.5 py-0.5 rounded">
                {provider.routingWeight}%
              </span>
            )}
          </div>

          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={provider.routingWeight}
            disabled={!provider.manualOverride}
            onChange={(e) => onWeightChange(provider.id, parseInt(e.target.value))}
            className={`w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer focus:outline-none ${
              provider.manualOverride
                ? 'accent-cyan-500 dark:accent-cyan-400'
                : 'accent-slate-300 dark:accent-slate-700 cursor-not-allowed opacity-50'
            }`}
          />
        </div>

      </div>

    </div>
  );
};
