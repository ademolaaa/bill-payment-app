'use client';

import React, { useState } from 'react';
import { Button } from '../../../components/Button';
import { Input } from '../../../components/Input';

// ── Types ─────────────────────────────────────────────────────────────────────
type ModalMode = 'invest' | 'topup' | 'details';

interface ActiveInvestment {
  id: string;
  name: string;
  principal: string;
  accruedInterest: string;
  maturityDate: string;
  yieldRate: string;    // p.a.
  borderColor: string;
  description: string;
}

// ── Data ──────────────────────────────────────────────────────────────────────
const ACTIVE_INVESTMENTS: ActiveInvestment[] = [
  {
    id: 'ai1',
    name: 'Fixed Deposit',
    principal: '₦250,000.00',
    accruedInterest: '+₦12,500.00',
    maturityDate: '14 Nov 2026',
    yieldRate: '10.5% p.a.',
    borderColor: 'border-indigo-500',
    description: 'Secure, low-risk returns guaranteed over a 12-month period.',
  },
  {
    id: 'ai2',
    name: 'Treasury Bills',
    principal: '₦200,000.00',
    accruedInterest: '+₦4,000.00',
    maturityDate: '01 Jan 2027',
    yieldRate: '8.0% p.a.',
    borderColor: 'border-emerald-500',
    description: 'Government-backed securities with guaranteed payout at maturity.',
  },
];

const AVAILABLE_PLANS = [
  {
    id: 'p1',
    name: 'Fixed Deposit',
    apy: '10.5% p.a.',
    description: 'Secure, low-risk returns guaranteed over a 12-month period.',
    color: 'bg-indigo-600',
    lightColor: 'bg-indigo-50',
    textColor: 'text-indigo-700',
  },
  {
    id: 'p2',
    name: 'Crypto Staking',
    apy: '15.0% p.a.',
    description: 'Stake stablecoins for high-yield returns with flexible withdrawal terms.',
    color: 'bg-purple-600',
    lightColor: 'bg-purple-50',
    textColor: 'text-purple-700',
  },
  {
    id: 'p3',
    name: 'Treasury Bills',
    apy: '8.0% p.a.',
    description: 'Government-backed securities with guaranteed payout at maturity.',
    color: 'bg-emerald-600',
    lightColor: 'bg-emerald-50',
    textColor: 'text-emerald-700',
  },
];

// ── Page ──────────────────────────────────────────────────────────────────────
export default function InvestmentsPage() {
  const [activePlan, setActivePlan] = useState<typeof AVAILABLE_PLANS[0] | null>(null);
  const [selectedInvestment, setSelectedInvestment] = useState<ActiveInvestment | null>(null);
  const [modalMode, setModalMode] = useState<ModalMode>('invest');
  const [amount, setAmount] = useState('');
  const [success, setSuccess] = useState(false);

  const openNewInvestment = (plan: typeof AVAILABLE_PLANS[0]) => {
    setActivePlan(plan);
    setModalMode('invest');
    setSuccess(false);
    setAmount('');
  };

  const openCardAction = (inv: ActiveInvestment, mode: ModalMode) => {
    setSelectedInvestment(inv);
    setModalMode(mode);
    setSuccess(false);
    setAmount('');
  };

  const closeAll = () => {
    setActivePlan(null);
    setSelectedInvestment(null);
    setSuccess(false);
    setAmount('');
  };

  const handleInvest = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(true);
  };

  const modalOpen = !!activePlan || !!selectedInvestment;
  const modalTitle = activePlan
    ? `Invest in ${activePlan.name}`
    : modalMode === 'topup'
    ? `Top Up — ${selectedInvestment?.name}`
    : `${selectedInvestment?.name} Details`;

  return (
    <div className="flex flex-col p-4 pt-10 min-h-screen bg-slate-50 relative pb-28">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Investments</h1>
      </header>

      {/* ── "Create New Investment" Primary CTA ─────────────────────────── */}
      <button
        onClick={() => openNewInvestment(AVAILABLE_PLANS[0])}
        className="w-full mb-6 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold rounded-2xl py-4 flex items-center justify-center space-x-2 transition-all shadow-md shadow-blue-200"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
        </svg>
        <span>Create New Investment</span>
      </button>

      {/* ── Hero: Portfolio Summary ──────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white shadow-xl mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-bl-full" />
        <div className="relative z-10 flex flex-col space-y-1">
          <p className="text-sm font-medium text-gray-400">Total Invested</p>
          <h2 className="text-3xl font-bold tracking-tight">₦450,000.00</h2>
        </div>
        <div className="relative z-10 flex items-center mt-4 space-x-2">
          <div className="bg-green-500/20 px-2 py-1 rounded text-green-400 text-xs font-bold flex items-center space-x-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
            <span>+12.4% p.a.</span>
          </div>
          <p className="text-xs font-medium text-gray-400">Current Yield (₦55,800.00)</p>
        </div>
      </section>

      {/* ── Active Investments ───────────────────────────────────────────── */}
      <section className="mb-8">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Active Investments</h3>
        <div className="flex flex-col space-y-3">
          {ACTIVE_INVESTMENTS.map((inv) => (
            <div key={inv.id} className={`bg-white rounded-2xl p-4 shadow-sm border-l-4 ${inv.borderColor}`}>

              {/* Title row */}
              <div className="flex justify-between items-start mb-1">
                <h4 className="text-[16px] font-bold text-gray-900 leading-snug">{inv.name}</h4>
                <span className="text-[12px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded ml-2 flex-shrink-0">Active</span>
              </div>
              <p className="text-[13px] text-gray-500 mb-3">Principal: {inv.principal}</p>

              {/* Stats — consistent grid prevents text cutoff */}
              <div className="grid grid-cols-2 gap-x-4 border-t border-gray-50 pt-3 mb-4">
                <div>
                  <p className="text-[11px] text-gray-400 mb-0.5">Accrued Interest</p>
                  <p className="text-[14px] font-bold text-green-600">{inv.accruedInterest}</p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-400 mb-0.5">Maturity Date</p>
                  <p className="text-[13px] font-bold text-gray-900">{inv.maturityDate}</p>
                </div>
                <div className="col-span-2 mt-2">
                  <p className="text-[11px] text-gray-400 mb-0.5">Yield Rate</p>
                  <p className="text-[13px] font-bold text-blue-600">{inv.yieldRate}</p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex space-x-2">
                <button
                  onClick={() => openCardAction(inv, 'details')}
                  className="flex-1 border border-gray-200 rounded-xl py-2 text-[13px] font-semibold text-gray-700 hover:bg-gray-50 active:scale-95 transition-all"
                >
                  View Details
                </button>
                <button
                  onClick={() => openCardAction(inv, 'topup')}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 rounded-xl py-2 text-[13px] font-semibold text-white active:scale-95 transition-all"
                >
                  Top Up
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Available Plans ──────────────────────────────────────────────── */}
      <section className="flex-grow pb-4">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Available Plans</h3>
        <div className="flex flex-col space-y-4">
          {AVAILABLE_PLANS.map((plan) => (
            <div key={plan.id} className="bg-white rounded-2xl p-5 shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${plan.color}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <h4 className="text-[17px] font-bold text-gray-900">{plan.name}</h4>
                </div>
                <span className={`${plan.lightColor} ${plan.textColor} px-3 py-1 rounded-full text-[12px] font-bold flex-shrink-0 ml-2`}>
                  {plan.apy}
                </span>
              </div>
              <p className="text-[13px] text-gray-500 mb-4 leading-relaxed">{plan.description}</p>
              <Button variant="outline" fullWidth={false} className="w-full text-[14px] py-2" onClick={() => openNewInvestment(plan)}>
                Invest Now
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* ── Modal ────────────────────────────────────────────────────────── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={closeAll} />
          <div className="bg-white rounded-t-3xl sm:rounded-3xl p-6 w-full max-w-sm relative z-10">

            {/* ── Success state ── */}
            {success ? (
              <div className="flex flex-col items-center text-center py-4">
                <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center text-green-500 mb-5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {modalMode === 'topup' ? 'Top Up Successful!' : 'Investment Confirmed!'}
                </h3>
                <p className="text-gray-500 text-sm mb-8">Your investment has been processed successfully.</p>
                <Button variant="primary" onClick={closeAll}>Done</Button>
              </div>
            ) : modalMode === 'details' && selectedInvestment ? (
              /* ── Details view ── */
              <>
                <h3 className="text-xl font-bold text-gray-900 mb-5">{selectedInvestment.name} — Details</h3>
                <div className="bg-gray-50 rounded-2xl divide-y divide-gray-100 mb-6 overflow-hidden">
                  {[
                    { label: 'Principal', value: selectedInvestment.principal },
                    { label: 'Accrued Interest', value: selectedInvestment.accruedInterest },
                    { label: 'Yield Rate', value: selectedInvestment.yieldRate },
                    { label: 'Maturity Date', value: selectedInvestment.maturityDate },
                    { label: 'Status', value: 'Active' },
                  ].map((row) => (
                    <div key={row.label} className="flex justify-between items-center px-4 py-3">
                      <span className="text-[13px] font-semibold text-gray-500">{row.label}</span>
                      <span className="text-[13px] font-bold text-gray-900">{row.value}</span>
                    </div>
                  ))}
                </div>
                <div className="flex flex-col space-y-3">
                  <Button variant="primary" onClick={() => { setModalMode('topup'); }}>Top Up This Investment</Button>
                  <Button variant="text" onClick={closeAll}>Close</Button>
                </div>
              </>
            ) : (
              /* ── Invest / Top Up form ── */
              <form onSubmit={handleInvest}>
                <h3 className="text-xl font-bold text-gray-900 mb-1">{modalTitle}</h3>
                <p className="text-sm text-gray-500 mb-6">
                  {modalMode === 'topup'
                    ? `Add more funds to your ${selectedInvestment?.name} at ${selectedInvestment?.yieldRate}.`
                    : `Enter the amount you wish to invest to earn ${activePlan?.apy}.`}
                </p>
                <div className="mb-6">
                  <Input
                    label="Amount (₦)"
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col space-y-3">
                  <Button type="submit" variant="primary">
                    {modalMode === 'topup' ? 'Confirm Top Up' : 'Confirm Investment'}
                  </Button>
                  <Button type="button" variant="text" onClick={closeAll}>Cancel</Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
