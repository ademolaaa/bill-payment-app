'use client';

import React, { useState } from 'react';
import { Button } from '../../../components/Button';
import { Input } from '../../../components/Input';

const AVAILABLE_PLANS = [
  {
    id: 'p1',
    name: 'Fixed Deposit',
    apy: '10.5%',
    description: 'Secure, low-risk returns guaranteed over a 12-month period.',
    color: 'bg-indigo-600',
    lightColor: 'bg-indigo-50'
  },
  {
    id: 'p2',
    name: 'Crypto Staking',
    apy: '15.0%',
    description: 'Stake stablecoins for high-yield returns with flexible withdrawal terms.',
    color: 'bg-purple-600',
    lightColor: 'bg-purple-50'
  },
  {
    id: 'p3',
    name: 'Treasury Bills',
    apy: '8.0%',
    description: 'Government-backed securities with guaranteed payout at maturity.',
    color: 'bg-emerald-600',
    lightColor: 'bg-emerald-50'
  }
];

export default function InvestmentsPage() {
  const [activePlan, setActivePlan] = useState<typeof AVAILABLE_PLANS[0] | null>(null);
  const [amount, setAmount] = useState('');

  const handleInvest = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(`Invested ${amount} into ${activePlan?.name}`);
    // Dummy state reset
    setActivePlan(null);
    setAmount('');
  };

  return (
    <div className="flex flex-col p-4 pt-10 min-h-screen relative">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Investments</h1>
      </header>

      {/* Hero: My Portfolio */}
      <section className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white shadow-xl mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-bl-full"></div>
        <div className="relative z-10 flex flex-col space-y-1">
          <p className="text-sm font-medium text-gray-400">Total Invested</p>
          <h2 className="text-3xl font-bold tracking-tight">₦450,000.00</h2>
        </div>
        <div className="relative z-10 flex items-center mt-4 space-x-2">
          <div className="bg-green-500/20 px-2 py-1 rounded text-green-400 text-xs font-bold flex items-center space-x-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
            <span>+12.4%</span>
          </div>
          <p className="text-xs font-medium text-gray-400">Current Yield (₦55,800.00)</p>
        </div>
      </section>

      {/* Active Investments */}
      <section className="mb-8">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Active Investments</h3>
        <div className="flex flex-col space-y-3">
          <div className="bg-white rounded-2xl p-4 shadow-sm border-l-4 border-indigo-600">
            <div className="flex justify-between items-start mb-1">
              <h4 className="text-[16px] font-bold text-gray-900">Fixed Deposit</h4>
              <span className="text-[12px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">Active</span>
            </div>
            <p className="text-[13px] text-gray-500 mb-3">Principal: ₦250,000.00</p>
            <div className="flex justify-between items-end border-t border-gray-50 pt-3">
              <div>
                <p className="text-[12px] text-gray-400">Accrued Interest</p>
                <p className="text-[14px] font-bold text-green-600">+₦12,500.00</p>
              </div>
              <div className="text-right">
                <p className="text-[12px] text-gray-400">Maturity Date</p>
                <p className="text-[13px] font-bold text-gray-900">14 Nov 2026</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border-l-4 border-emerald-600">
            <div className="flex justify-between items-start mb-1">
              <h4 className="text-[16px] font-bold text-gray-900">Treasury Bills</h4>
              <span className="text-[12px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">Active</span>
            </div>
            <p className="text-[13px] text-gray-500 mb-3">Principal: ₦200,000.00</p>
            <div className="flex justify-between items-end border-t border-gray-50 pt-3">
              <div>
                <p className="text-[12px] text-gray-400">Accrued Interest</p>
                <p className="text-[14px] font-bold text-green-600">+₦4,000.00</p>
              </div>
              <div className="text-right">
                <p className="text-[12px] text-gray-400">Maturity Date</p>
                <p className="text-[13px] font-bold text-gray-900">01 Jan 2027</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Available Plans */}
      <section className="flex-grow pb-12">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Available Plans</h3>
        <div className="flex flex-col space-y-4">
          {AVAILABLE_PLANS.map((plan) => (
            <div key={plan.id} className="bg-white rounded-2xl p-5 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${plan.color}`}>
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                  </div>
                  <h4 className="text-[17px] font-bold text-gray-900">{plan.name}</h4>
                </div>
                <div className={`${plan.lightColor} text-gray-900 px-3 py-1 rounded-full text-sm font-bold shadow-sm`}>
                  {plan.apy} APY
                </div>
              </div>
              <p className="text-[13px] text-gray-500 mb-5 leading-relaxed pr-4">
                {plan.description}
              </p>
              <Button variant="outline" fullWidth={false} className="w-full text-[14px] py-2" onClick={() => setActivePlan(plan)}>
                Invest Now
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* Dummy Modal Overlay */}
      {activePlan && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 transition-opacity" onClick={() => setActivePlan(null)}></div>
          
          {/* Modal Content */}
          <div className="bg-white rounded-t-3xl sm:rounded-3xl p-6 w-full max-w-sm relative z-10 transform transition-transform duration-300">
            <h3 className="text-xl font-bold text-gray-900 mb-1">Invest in {activePlan.name}</h3>
            <p className="text-sm text-gray-500 mb-6">Enter the amount you wish to invest to earn {activePlan.apy}.</p>
            
            <form onSubmit={handleInvest}>
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
                <Button type="submit" variant="primary">Confirm Investment</Button>
                <Button type="button" variant="text" onClick={() => setActivePlan(null)}>Cancel</Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
