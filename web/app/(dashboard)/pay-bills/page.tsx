'use client';

import React, { useState } from 'react';
import { Button } from '../../../components/Button';
import { Input } from '../../../components/Input';

const BILL_CATEGORIES = [
  { id: 'airtime', name: 'Airtime', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>, color: 'text-blue-500', bg: 'bg-blue-50' },
  { id: 'data', name: 'Data', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 21.213 0" /></svg>, color: 'text-green-500', bg: 'bg-green-50' },
  { id: 'electricity', name: 'Electricity', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>, color: 'text-yellow-500', bg: 'bg-yellow-50' },
  { id: 'tv', name: 'TV', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>, color: 'text-purple-500', bg: 'bg-purple-50' },
  { id: 'betting', name: 'Betting', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, color: 'text-red-500', bg: 'bg-red-50' },
];

const CATEGORY_PROVIDERS: Record<string, { label: string; placeholder: string; options: { value: string; label: string }[] }> = {
  airtime: {
    label: 'Network',
    placeholder: 'Select Network',
    options: [
      { value: 'mtn', label: 'MTN' },
      { value: 'airtel', label: 'Airtel' },
      { value: 'glo', label: 'Glo' },
      { value: '9mobile', label: '9mobile' },
    ],
  },
  data: {
    label: 'Network',
    placeholder: 'Select Network',
    options: [
      { value: 'mtn', label: 'MTN' },
      { value: 'airtel', label: 'Airtel' },
      { value: 'glo', label: 'Glo' },
      { value: '9mobile', label: '9mobile' },
    ],
  },
  electricity: {
    label: 'Provider',
    placeholder: 'Select Distribution Company',
    options: [
      { value: 'ikedc', label: 'Ikeja Electric (IKEDC)' },
      { value: 'ekedc', label: 'Eko Electric (EKEDC)' },
      { value: 'aedc', label: 'Abuja Electric (AEDC)' },
      { value: 'kedco', label: 'Kano Electric (KEDCO)' },
      { value: 'phEDC', label: 'Port Harcourt (PHEDC)' },
    ],
  },
  tv: {
    label: 'Provider',
    placeholder: 'Select TV Provider',
    options: [
      { value: 'dstv', label: 'DSTV' },
      { value: 'gotv', label: 'GOTV' },
      { value: 'startimes', label: 'StarTimes' },
      { value: 'showmax', label: 'Showmax' },
    ],
  },
  betting: {
    label: 'Package',
    placeholder: 'Select Betting Platform',
    options: [
      { value: 'bet9ja', label: 'Bet9ja' },
      { value: 'sportybet', label: 'SportyBet' },
      { value: 'betway', label: 'Betway' },
      { value: '1xbet', label: '1xBet' },
    ],
  },
};

export default function PayBillsPage() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  
  // Form State for Airtime
  const [phone, setPhone] = useState('');
  const [network, setNetwork] = useState('');
  const [amount, setAmount] = useState('');

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(`Paying ${amount} for ${activeCategory} to ${phone} on ${network}`);
    // Dummy state reset
    setActiveCategory(null);
    setPhone('');
    setNetwork('');
    setAmount('');
  };

  return (
    <div className="flex flex-col p-4 pt-10 min-h-screen relative">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Pay Bills</h1>
        <p className="text-sm text-gray-500 mt-1">Select a service to proceed</p>
      </header>

      {/* Grid Menu */}
      <div className="grid grid-cols-4 sm:grid-cols-4 gap-y-8 gap-x-4 mb-8 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
        {BILL_CATEGORIES.map((cat) => (
          <div 
            key={cat.id} 
            className="flex flex-col items-center cursor-pointer"
            onClick={() => setActiveCategory(cat.id)}
          >
            <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-2 ${cat.bg} ${cat.color} transition-transform active:scale-95`}>
              {cat.icon}
            </div>
            <span className="text-[12px] font-semibold text-gray-700">{cat.name}</span>
          </div>
        ))}
      </div>

      {/* Recent Billers Placeholder */}
      <section className="mt-4">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Recent</h3>
        <div className="flex items-center space-x-4 overflow-x-auto pb-4">
          {['Mom', 'Electrician', 'Landlord', 'Sister'].map((contact, idx) => (
             <div key={idx} className="flex flex-col items-center flex-shrink-0">
               <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 border border-gray-200 shadow-sm cursor-pointer hover:bg-gray-100">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
               </div>
               <p className="text-[11px] font-medium text-gray-600 mt-2 truncate w-14 text-center">{contact}</p>
             </div>
          ))}
        </div>
      </section>

      {/* Dummy Modal Overlay */}
      {activeCategory && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 transition-opacity" onClick={() => setActiveCategory(null)}></div>
          
          {/* Modal Content */}
          <div className="bg-white rounded-t-3xl sm:rounded-3xl p-6 pt-8 w-full max-w-sm relative z-10 transform transition-transform duration-300">
            <h3 className="text-xl font-bold text-gray-900 mb-6 capitalize">{activeCategory} Purchase</h3>
            
            <form onSubmit={handlePay}>
              <div className="space-y-4 mb-8">
                 {/* Styled Select Dropdown overriding Input for Provider/Network */}
                 <div>
                    <label className="block text-gray-800 text-[15px] font-medium mb-1.5">
                      {CATEGORY_PROVIDERS[activeCategory]?.label || 'Provider'}
                    </label>
                    <select 
                      className="w-full border border-gray-200 rounded-xl py-3.5 px-4 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                      value={network}
                      onChange={(e) => setNetwork(e.target.value)}
                      required
                    >
                      <option value="" disabled>{CATEGORY_PROVIDERS[activeCategory]?.placeholder || 'Select Option'}</option>
                      {CATEGORY_PROVIDERS[activeCategory]?.options.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                 </div>

                 <Input 
                   label={activeCategory === 'electricity' ? 'Meter Number' : activeCategory === 'tv' ? 'Smart Card Number' : 'Phone Number'}
                   type="tel"
                   placeholder={activeCategory === 'electricity' ? '01023456789' : activeCategory === 'tv' ? '1234567890' : '0801 234 5678'}
                   value={phone}
                   onChange={(e) => setPhone(e.target.value)}
                   required
                 />

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
                <Button type="submit" variant="primary">Pay Now</Button>
                <Button type="button" variant="text" onClick={() => setActiveCategory(null)}>Cancel</Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
