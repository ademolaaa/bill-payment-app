'use client';

import React, { useState, useEffect } from 'react';
import { useDashboardStats } from '../../../hooks/useDashboardStats';
import {
  providers as apiProviders,
  subscribe,
  updateProviderStatus,
  updateProviderDetails,
  simulateHealthPing
} from '../../../lib/admin/mockStore';
import { Provider, ServiceType } from '../../../types/admin';
import { ProviderCard } from '../../../components/admin/ProviderCard';
import {
  Zap,
  Smartphone,
  Wifi,
  Tv,
  Coins,
  FileText,
  ToggleRight,
  ToggleLeft,
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
  Cpu,
  Sliders,
  CheckCircle2
} from 'lucide-react';

interface ServiceItem {
  id: string;
  name: string;
  category: 'airtime' | 'data' | 'electricity' | 'cable_tv' | 'betting' | 'scratch_card';
  providersCount: number;
  activeProvidersCount: number;
  successRate: number;
  globalStatus: 'active' | 'inactive';
}

export default function GatewayRoutingPage() {
  const { providers: statsProviders } = useDashboardStats();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [activeTab, setActiveTab] = useState<'services' | 'adapters'>('services');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [pinging, setPinging] = useState(false);

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

  const handleTestLatencies = () => {
    setPinging(true);
    setTimeout(() => {
      providers.forEach(p => simulateHealthPing(p.id));
      setPinging(false);
      alert('Re-pinged all active gateways! Updated ping speeds and health scores successfully.');
    }, 800);
  };

  // Compute aggregated service stats from individual providers
  const services: ServiceItem[] = [
    {
      id: 'srv-1',
      name: 'Airtime VTU Dispenser',
      category: 'airtime',
      providersCount: providers.filter(p => p.serviceTypes.includes('airtime')).length,
      activeProvidersCount: providers.filter(p => p.serviceTypes.includes('airtime') && p.status === 'active').length,
      successRate: 98.2,
      globalStatus: providers.some(p => p.serviceTypes.includes('airtime') && p.status === 'active') ? 'active' : 'inactive'
    },
    {
      id: 'srv-2',
      name: 'Mobile Data Bundle Bundler',
      category: 'data',
      providersCount: providers.filter(p => p.serviceTypes.includes('data')).length,
      activeProvidersCount: providers.filter(p => p.serviceTypes.includes('data') && p.status === 'active').length,
      successRate: 97.4,
      globalStatus: providers.some(p => p.serviceTypes.includes('data') && p.status === 'active') ? 'active' : 'inactive'
    },
    {
      id: 'srv-3',
      name: 'Electricity Token Webhook Gateway',
      category: 'electricity',
      providersCount: providers.filter(p => p.serviceType === 'electricity').length,
      activeProvidersCount: providers.filter(p => p.serviceType === 'electricity' && p.status === 'active').length,
      successRate: 95.8,
      globalStatus: providers.some(p => p.serviceType === 'electricity' && p.status === 'active') ? 'active' : 'inactive'
    },
    {
      id: 'srv-4',
      name: 'Cable TV Multichoice Dispatch',
      category: 'cable_tv',
      providersCount: providers.filter(p => p.serviceType === 'cable_tv').length,
      activeProvidersCount: providers.filter(p => p.serviceType === 'cable_tv' && p.status === 'active').length,
      successRate: 99.2,
      globalStatus: providers.some(p => p.serviceType === 'cable_tv' && p.status === 'active') ? 'active' : 'inactive'
    },
    {
      id: 'srv-5',
      name: 'Betting Wallet Ingestion Port',
      category: 'betting',
      providersCount: providers.filter(p => p.serviceType === 'betting').length,
      activeProvidersCount: providers.filter(p => p.serviceType === 'betting' && p.status === 'active').length,
      successRate: 96.5,
      globalStatus: providers.some(p => p.serviceType === 'betting' && p.status === 'active') ? 'active' : 'inactive'
    },
    {
      id: 'srv-6',
      name: 'Scratch Card PIN Generation Engine',
      category: 'scratch_card',
      providersCount: providers.filter(p => p.serviceType === 'pins').length,
      activeProvidersCount: providers.filter(p => p.serviceType === 'pins' && p.status === 'active').length,
      successRate: 0.0,
      globalStatus: providers.some(p => p.serviceType === 'pins' && p.status === 'active') ? 'active' : 'inactive'
    }
  ];

  const handleToggleGlobalService = (category: string, currentStatus: 'active' | 'inactive') => {
    const nextStatus = currentStatus === 'active' ? 'inactive' : 'active';
    const targetCategory = category === 'scratch_card' ? 'pins' : category;
    
    providers.forEach(p => {
      if (p.serviceTypes.includes(targetCategory as any) || p.serviceType === targetCategory) {
        updateProviderStatus(p.id, nextStatus);
      }
    });
    alert(`Globally set all ${category.toUpperCase()} providers to ${nextStatus.toUpperCase()}!`);
  };

  const getServiceIcon = (category: string) => {
    switch (category) {
      case 'airtime':
        return <Smartphone className="w-5 h-5 text-cyan-500" />;
      case 'data':
        return <Wifi className="w-5 h-5 text-blue-500" />;
      case 'electricity':
        return <Zap className="w-5 h-5 text-yellow-500" />;
      case 'cable_tv':
        return <Tv className="w-5 h-5 text-purple-500" />;
      case 'betting':
        return <Coins className="w-5 h-5 text-emerald-500" />;
      default:
        return <FileText className="w-5 h-5 text-rose-500" />;
    }
  };

  const filteredServices = services.filter(srv => {
    const matchesSearch = srv.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || srv.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const filteredProviders = providers.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || p.serviceTypes.includes(categoryFilter as any) || p.serviceType === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      
      {/* HEADER TITLE */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 select-none">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Cpu className="w-6 h-6 text-cyan-500" />
            Gateway Routing Center
          </h1>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-1">
            Configure system billing channels, inspect performance offsets, and manually balance gateway routes
          </p>
        </div>

        <button
          onClick={handleTestLatencies}
          disabled={pinging}
          className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white text-xs font-bold uppercase rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${pinging ? 'animate-spin' : ''}`} />
          {pinging ? 'Pinging...' : 'Test Gateway Speeds'}
        </button>
      </div>

      {/* CONSOLE CONTROL TABS */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-900/60 rounded-2xl w-fit border border-slate-200/50 dark:border-slate-800/80">
        <button
          onClick={() => setActiveTab('services')}
          className={`px-4 py-2 text-xs font-extrabold uppercase rounded-xl transition-all ${
            activeTab === 'services'
              ? 'bg-white dark:bg-[#161b22] text-slate-850 dark:text-slate-100 shadow-sm border border-slate-200/40 dark:border-slate-800/60'
              : 'text-slate-400 hover:text-slate-500 dark:text-slate-500 dark:hover:text-slate-400'
          }`}
        >
          Global Service Categories
        </button>
        <button
          onClick={() => setActiveTab('adapters')}
          className={`px-4 py-2 text-xs font-extrabold uppercase rounded-xl transition-all ${
            activeTab === 'adapters'
              ? 'bg-white dark:bg-[#161b22] text-slate-850 dark:text-slate-100 shadow-sm border border-slate-200/40 dark:border-slate-800/60'
              : 'text-slate-400 hover:text-slate-500 dark:text-slate-500 dark:hover:text-slate-400'
          }`}
        >
          API Gateway Adapters ({providers.length})
        </button>
      </div>

      {/* SEARCH AND FILTER BAR */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-4 bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800/80 rounded-2xl">
        <div className="relative sm:col-span-8">
          <Search className="absolute left-3 top-2.5 w-4.5 h-4.5 text-slate-400" />
          <input
            type="text"
            placeholder={activeTab === 'services' ? "Search utility service dispatchers..." : "Search gateway providers..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-xs bg-slate-50 dark:bg-[#0d1117] text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="relative sm:col-span-4">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-3 py-2.5 text-xs bg-slate-50 dark:bg-[#0d1117] text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-cyan-500 font-semibold"
          >
            <option value="all">All Service Types</option>
            <option value="airtime">Airtime VTU</option>
            <option value="data">Mobile Data</option>
            <option value="electricity">Electricity Token</option>
            <option value="cable_tv">Cable TV</option>
            <option value="betting">Betting Wallet</option>
            <option value="scratch_card">Scratch Card PINs</option>
          </select>
        </div>
      </div>

      {/* SERVICE CATEGORIES VIEW */}
      {activeTab === 'services' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map(srv => (
            <div
              key={srv.id}
              className="flex flex-col justify-between p-5 bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 font-sans"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850">
                      {getServiceIcon(srv.category)}
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-850 dark:text-slate-100">
                        {srv.name}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mt-0.5 leading-none">
                        {srv.category.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                    srv.globalStatus === 'active'
                      ? 'bg-emerald-500/10 text-emerald-500'
                      : 'bg-rose-500/10 text-rose-500'
                  }`}>
                    {srv.globalStatus}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 text-[10px] font-bold p-2.5 bg-slate-50 dark:bg-[#0d1117]/30 border border-slate-100 dark:border-slate-800/80 rounded-xl">
                  <div className="text-slate-450">
                    <span>Routing Gateways:</span>
                    <div className="text-slate-800 dark:text-slate-200 font-mono mt-0.5">
                      {srv.activeProvidersCount} / {srv.providersCount} Active
                    </div>
                  </div>
                  <div className="text-slate-450 text-right">
                    <span>Average Success:</span>
                    <div className="text-slate-800 dark:text-slate-200 font-mono mt-0.5">
                      {srv.successRate > 0 ? `${srv.successRate}%` : '0%'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-sans">
                <span className="font-semibold text-slate-500 dark:text-slate-400">
                  Global Category Toggle
                </span>
                <button
                  onClick={() => handleToggleGlobalService(srv.category, srv.globalStatus)}
                  className="focus:outline-none transition-colors duration-200"
                  aria-label={`Toggle global status for ${srv.name}`}
                >
                  {srv.globalStatus === 'active' ? (
                    <ToggleRight className="w-8 h-8 text-emerald-500" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-slate-350 dark:text-slate-650" />
                  )}
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* API GATEWAY ADAPTERS CARD GRID */}
      {activeTab === 'adapters' && (
        <div className="space-y-6">
          <div className="p-4 bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 rounded-2xl flex items-start gap-3 select-none text-xs leading-relaxed">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-extrabold block">Automatic Load-Balancing Active</span>
              <span className="opacity-90 block mt-1">
                API gateway pipelines dynamically shift weights towards adapters exhibiting the lowest latency RTT and 98%+ success rates. Toggle <strong>Manual Override</strong> to force custom load distributions.
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProviders.length > 0 ? (
              filteredProviders.map((prov) => (
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
                No matching API provider adapters found for your search filter criteria.
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
