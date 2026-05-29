'use client';

import React, { useState, useEffect } from 'react';
import {
  providers as apiProviders,
  subscribe,
  updateProviderStatus,
  updateProviderDetails,
  simulateHealthPing
} from '../../../lib/admin/mockStore';
import { Provider } from '../../../types/admin';
import { ProviderCard } from '../../../components/admin/ProviderCard';
import { Cpu, AlertCircle, RefreshCw } from 'lucide-react';

export default function ProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([]);

  // Sync provider states dynamically from mockStore pub-sub
  useEffect(() => {
    const syncProviders = () => {
      setProviders([...apiProviders]);
    };
    syncProviders();
    return subscribe(syncProviders);
  }, []);

  const handleToggleStatus = (id: string) => {
    const prov = providers.find((p) => p.id === id);
    if (prov) {
      const nextStatus = prov.status === 'active' ? 'inactive' : 'active';
      updateProviderStatus(id, nextStatus);
    }
  };

  const handleRouteOverride = (id: string, override: boolean) => {
    // When manual override is toggled ON, set to degraded to indicate manual control
    // When toggled OFF, restore to active for automatic balancing
    updateProviderDetails(id, {
      manualOverride: override,
      status: override ? 'degraded' : 'active'
    });
  };

  const handleWeightChange = (id: string, weight: number) => {
    updateProviderDetails(id, { routingWeight: weight });
  };

  const handleHealthPing = (id: string) => {
    simulateHealthPing(id);
  };

  return (
    <div className="space-y-6">
      
      {/* 1. HEADER TITLE BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 select-none">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Cpu className="w-6 h-6 text-cyan-500" />
            API Gateway Routing
          </h1>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-1">
            Audit API latency offsets, toggle gateway statuses, or force manual traffic weight overrides
          </p>
        </div>

        <button
          onClick={() => {
            alert('Re-pinging Vtpass, Shago, and Airtel API ports!');
          }}
          className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold uppercase rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-sm"
        >
          <RefreshCw className="w-4 h-4" />
          Test Latencies
        </button>
      </div>

      {/* 2. AUTOMATIC BALANCING DIAGNOSTICS INFO BANNER */}
      <div className="p-4 bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 rounded-2xl flex items-start gap-3 select-none text-xs leading-relaxed">
        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-extrabold block">MTN & Airtel Automatic Load-Balancing Enabled</span>
          <span className="opacity-90 block mt-1">
            By default, transaction flows are auto-routed dynamically to the gateway showcasing the lowest RTT latency response times and highest health success rates over the last 10 minutes. Toggle <strong>Manual Override</strong> on any card to lock static routing weight splits.
          </span>
        </div>
      </div>

      {/* 3. PROVIDERS ROUTING CARDS BENTO GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {providers.length > 0 ? (
          providers.map((prov) => (
            <ProviderCard
              key={prov.id}
              provider={prov}
              onToggleStatus={handleToggleStatus}
              onRouteOverride={handleRouteOverride}
              onWeightChange={handleWeightChange}
              onHealthPing={handleHealthPing}
            />
          ))
        ) : (
          <div className="col-span-full p-12 text-center text-xs text-slate-400 italic">
            No registered API provider routing adapters registered in database configuration.
          </div>
        )}
      </div>

    </div>
  );
}
