'use client';

import React, { useState } from 'react';
import { Button } from '../../../components/Button';
import { Input } from '../../../components/Input';
import { supabase } from '../../../lib/supabase/client';


// ─── Types ────────────────────────────────────────────────────────────────────

type CategoryId =
  | 'airtime'
  | 'data'
  | 'electricity'
  | 'tv'
  | 'betting'
  | 'water'
  | 'internet'
  | 'school'
  | 'transport';

interface FormState {
  network: string;
  phone: string;
  amount: string;
  // electricity
  meterNumber: string;
  meterType: string;
  // tv
  smartCardNumber: string;
  bouquet: string;
  // data
  bundle: string;
  // betting
  userId: string;
  platform: string;
  // water
  accountNumber: string;
  // internet
  ispPlan: string;
  // school
  schoolName: string;
  studentId: string;
  // transport
  transportType: string;
}

const INITIAL_FORM: FormState = {
  network: '', phone: '', amount: '',
  meterNumber: '', meterType: '',
  smartCardNumber: '', bouquet: '',
  bundle: '',
  userId: '', platform: '',
  accountNumber: '',
  ispPlan: '',
  schoolName: '', studentId: '',
  transportType: '',
};

// ─── Category Config ──────────────────────────────────────────────────────────

const BILL_CATEGORIES = [
  {
    id: 'airtime' as CategoryId, name: 'Airtime', bg: 'bg-blue-50', color: 'text-blue-600',
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>,
  },
  {
    id: 'data' as CategoryId, name: 'Data', bg: 'bg-green-50', color: 'text-green-600',
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" /></svg>,
  },
  {
    id: 'electricity' as CategoryId, name: 'Electricity', bg: 'bg-yellow-50', color: 'text-yellow-600',
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
  },
  {
    id: 'tv' as CategoryId, name: 'TV', bg: 'bg-purple-50', color: 'text-purple-600',
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
  },
  {
    id: 'betting' as CategoryId, name: 'Betting', bg: 'bg-red-50', color: 'text-red-600',
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  },
  {
    id: 'water' as CategoryId, name: 'Water', bg: 'bg-cyan-50', color: 'text-cyan-600',
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2C6.477 2 2 9 2 14a10 10 0 0020 0c0-5-4.477-12-10-12z" /></svg>,
  },
  {
    id: 'internet' as CategoryId, name: 'Internet', bg: 'bg-indigo-50', color: 'text-indigo-600',
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" /></svg>,
  },
  {
    id: 'school' as CategoryId, name: 'School Fees', bg: 'bg-orange-50', color: 'text-orange-600',
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg>,
  },
  {
    id: 'transport' as CategoryId, name: 'Transport', bg: 'bg-teal-50', color: 'text-teal-600',
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h8m-8 4h8m-4 4h4M3 12l2-7h14l2 7M3 12v6a1 1 0 001 1h1m12 0h1a1 1 0 001-1v-6M3 12h18" /></svg>,
  },
];

// ─── Styled Select Helper ─────────────────────────────────────────────────────

const SelectField = ({
  id, label, value, onChange, required, placeholder, options,
}: {
  id: string; label: string; value: string;
  onChange: (v: string) => void; required?: boolean;
  placeholder: string; options: { value: string; label: string }[];
}) => (
  <div className="mb-4 w-full">
    <label htmlFor={id} className="block text-gray-900 dark:text-white text-[15px] font-bold mb-2">{label}</label>
    <div className="relative">
      <select
        id={id}
        title={label}
        className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-5 text-gray-900 dark:text-white focus:outline-none focus:bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-[15px] font-medium shadow-sm appearance-none"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
      >
        <option value="" disabled>{placeholder}</option>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-gray-600 dark:text-slate-700">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </div>
    </div>
  </div>
);

const NETWORKS = [
  { value: 'mtn', label: 'MTN' },
  { value: 'airtel', label: 'Airtel' },
  { value: 'glo', label: 'Glo' },
  { value: '9mobile', label: '9Mobile' },
];

const DATA_BUNDLES = [
  { value: '500mb_daily', label: '500MB – Daily (100 NGN)' },
  { value: '1gb_weekly', label: '1GB – Weekly (350 NGN)' },
  { value: '2gb_monthly', label: '2GB – Monthly (1,000 NGN)' },
  { value: '5gb_monthly', label: '5GB – Monthly (2,000 NGN)' },
  { value: '10gb_monthly', label: '10GB – Monthly (3,500 NGN)' },
  { value: '20gb_monthly', label: '20GB – Monthly (5,000 NGN)' },
];

const TV_PROVIDERS = [
  { value: 'dstv', label: 'DSTV' },
  { value: 'gotv', label: 'GOTV' },
  { value: 'startimes', label: 'StarTimes' },
  { value: 'showmax', label: 'Showmax' },
];

const TV_BOUQUETS: Record<string, { value: string; label: string }[]> = {
  dstv: [
    { value: 'padi', label: 'Padi – 2,500 NGN' },
    { value: 'yanga', label: 'Yanga – 3,500 NGN' },
    { value: 'confam', label: 'Confam – 6,200 NGN' },
    { value: 'compact', label: 'Compact – 15,000 NGN' },
    { value: 'premium', label: 'Premium – 29,500 NGN' },
  ],
  gotv: [
    { value: 'smallie', label: 'Smallie – 1,575 NGN' },
    { value: 'jinja', label: 'Jinja – 2,715 NGN' },
    { value: 'jolli', label: 'Jolli – 4,115 NGN' },
    { value: 'max', label: 'Max – 6,200 NGN' },
  ],
  startimes: [
    { value: 'nova', label: 'Nova – 1,200 NGN' },
    { value: 'basic', label: 'Basic – 2,200 NGN' },
    { value: 'smart', label: 'Smart – 3,000 NGN' },
    { value: 'classic', label: 'Classic – 3,700 NGN' },
    { value: 'super', label: 'Super – 5,300 NGN' },
  ],
  showmax: [
    { value: 'mobile', label: 'Mobile – 1,200 NGN' },
    { value: 'standard', label: 'Standard – 3,600 NGN' },
  ],
};

const ELECTRICITY_PROVIDERS = [
  { value: 'ikedc', label: 'Ikeja Electric (IKEDC)' },
  { value: 'ekedc', label: 'Eko Electric (EKEDC)' },
  { value: 'aedc', label: 'Abuja Electric (AEDC)' },
  { value: 'kedco', label: 'Kano Electric (KEDCO)' },
  { value: 'phedc', label: 'Port Harcourt (PHEDC)' },
  { value: 'ibedc', label: 'Ibadan Electric (IBEDC)' },
  { value: 'eedc', label: 'Enugu Electric (EEDC)' },
];

const METER_TYPES = [
  { value: 'prepaid', label: 'Prepaid' },
  { value: 'postpaid', label: 'Postpaid' },
];

const BETTING_PLATFORMS = [
  { value: 'bet9ja', label: 'Bet9ja' },
  { value: 'sportybet', label: 'SportyBet' },
  { value: 'betway', label: 'Betway' },
  { value: '1xbet', label: '1xBet' },
  { value: 'nairabet', label: 'NairaBet' },
  { value: 'merrybet', label: 'MerryBet' },
];

const WATER_PROVIDERS = [
  { value: 'lswc', label: 'Lagos State Water Corporation' },
  { value: 'rwcc', label: 'Rivers Water Corp.' },
  { value: 'kwwb', label: 'Kano Water Board' },
  { value: 'bwc', label: 'Abuja Water Board' },
];

const ISP_PLANS = [
  { value: 'spectranet_5mb', label: 'Spectranet – 5Mbps Unlimited 8,750 NGN' },
  { value: 'smile_1gb', label: 'Smile – 1GB 1,000 NGN' },
  { value: 'swift_10mb', label: 'Swift Networks – 10Mbps 15,000 NGN' },
  { value: 'ipnx_home', label: 'IPNX – Home Starter 10,000 NGN' },
];

const TRANSPORT_TYPES = [
  { value: 'cowry_topup', label: 'Cowry Card Top-up (Lagos BRT)' },
  { value: 'abuja_metro', label: 'Abuja Light Rail Pass' },
  { value: 'lrt_ticket', label: 'LRT Day Ticket' },
];

// ─── Summary Helpers ──────────────────────────────────────────────────────────

function buildSummaryLines(cat: CategoryId, form: FormState): { label: string; value: string }[] {
  const net = NETWORKS.find(n => n.value === form.network)?.label ?? form.network;
  switch (cat) {
    case 'airtime':
      return [
        { label: 'Network', value: net },
        { label: 'Phone Number', value: form.phone },
        { label: 'Amount', value: `${form.amount} NGN` },
      ];
    case 'data': {
      const bundle = DATA_BUNDLES.find(b => b.value === form.bundle)?.label ?? form.bundle;
      return [
        { label: 'Network', value: net },
        { label: 'Phone Number', value: form.phone },
        { label: 'Bundle', value: bundle },
      ];
    }
    case 'electricity': {
      const prov = ELECTRICITY_PROVIDERS.find(p => p.value === form.network)?.label ?? form.network;
      const mType = METER_TYPES.find(m => m.value === form.meterType)?.label ?? form.meterType;
      return [
        { label: 'Provider', value: prov },
        { label: 'Meter Number', value: form.meterNumber },
        { label: 'Meter Type', value: mType },
        { label: 'Amount', value: `${form.amount} NGN` },
      ];
    }
    case 'tv': {
      const prov = TV_PROVIDERS.find(p => p.value === form.network)?.label ?? form.network;
      const bouquetLabel = (TV_BOUQUETS[form.network] ?? []).find(b => b.value === form.bouquet)?.label ?? form.bouquet;
      return [
        { label: 'Provider', value: prov },
        { label: 'Smart Card No.', value: form.smartCardNumber },
        { label: 'Bouquet / Plan', value: bouquetLabel },
      ];
    }
    case 'betting': {
      const plat = BETTING_PLATFORMS.find(p => p.value === form.platform)?.label ?? form.platform;
      return [
        { label: 'Platform', value: plat },
        { label: 'User ID', value: form.userId },
        { label: 'Amount', value: `${form.amount} NGN` },
      ];
    }
    case 'water':
      return [
        { label: 'Provider', value: WATER_PROVIDERS.find(p => p.value === form.network)?.label ?? form.network },
        { label: 'Account Number', value: form.accountNumber },
        { label: 'Amount', value: `${form.amount} NGN` },
      ];
    case 'internet': {
      const plan = ISP_PLANS.find(p => p.value === form.ispPlan)?.label ?? form.ispPlan;
      return [
        { label: 'Plan', value: plan },
        { label: 'Phone Number', value: form.phone },
      ];
    }
    case 'school':
      return [
        { label: 'School', value: form.schoolName },
        { label: 'Student ID', value: form.studentId },
        { label: 'Amount', value: `${form.amount} NGN` },
      ];
    case 'transport': {
      const t = TRANSPORT_TYPES.find(t => t.value === form.transportType)?.label ?? form.transportType;
      return [
        { label: 'Type', value: t },
        { label: 'Amount', value: `${form.amount} NGN` },
      ];
    }
    default: return [];
  }
}

// ─── Dynamic Form Body ────────────────────────────────────────────────────────

function FormBody({ category, form, set, phoneError, amountError }: {
  category: CategoryId;
  form: FormState;
  set: (k: keyof FormState, v: string) => void;
  phoneError?: string;
  amountError?: string;
}) {
  switch (category) {
    case 'airtime':
      return (
        <>
          <SelectField id="network" label="Network" value={form.network} onChange={v => set('network', v)} required placeholder="Select Network" options={NETWORKS} />
          <Input label="Phone Number" type="tel" placeholder="0801 234 5678" value={form.phone} onChange={e => set('phone', e.target.value)} required error={phoneError} minLength={11} maxLength={11} />
          <Input label="Amount (NGN)" type="number" placeholder="0.00" value={form.amount} onChange={e => set('amount', e.target.value)} required error={amountError} />
        </>
      );
    case 'data':
      return (
        <>
          <SelectField id="network" label="Network" value={form.network} onChange={v => set('network', v)} required placeholder="Select Network" options={NETWORKS} />
          <Input label="Phone Number" type="tel" placeholder="0801 234 5678" value={form.phone} onChange={e => set('phone', e.target.value)} required error={phoneError} minLength={11} maxLength={11} />
          <SelectField id="bundle" label="Select Bundle" value={form.bundle} onChange={v => set('bundle', v)} required placeholder="Choose a data bundle" options={DATA_BUNDLES} />
        </>
      );
    case 'electricity':
      return (
        <>
          <SelectField id="network" label="Distribution Company" value={form.network} onChange={v => set('network', v)} required placeholder="Select Provider" options={ELECTRICITY_PROVIDERS} />
          <Input label="Meter Number" type="text" placeholder="01023456789" value={form.meterNumber} onChange={e => set('meterNumber', e.target.value)} required />
          <SelectField id="meterType" label="Meter Type" value={form.meterType} onChange={v => set('meterType', v)} required placeholder="Prepaid or Postpaid?" options={METER_TYPES} />
          <Input label="Amount (NGN)" type="number" placeholder="0.00" value={form.amount} onChange={e => set('amount', e.target.value)} required error={amountError} />
        </>
      );
    case 'tv': {
      const bouquets = TV_BOUQUETS[form.network] ?? [];
      return (
        <>
          <SelectField id="network" label="TV Provider" value={form.network} onChange={v => { set('network', v); set('bouquet', ''); }} required placeholder="Select TV Provider" options={TV_PROVIDERS} />
          <Input label="Smart Card Number" type="text" placeholder="1234567890" value={form.smartCardNumber} onChange={e => set('smartCardNumber', e.target.value)} required />
          <SelectField id="bouquet" label="Bouquet / Plan" value={form.bouquet} onChange={v => set('bouquet', v)} required placeholder={form.network ? 'Select a Plan' : 'Select a provider first'} options={bouquets} />
        </>
      );
    }
    case 'betting':
      return (
        <>
          <SelectField id="platform" label="Betting Platform" value={form.platform} onChange={v => set('platform', v)} required placeholder="Select Platform" options={BETTING_PLATFORMS} />
          <Input label="User ID / Username" type="text" placeholder="Your platform username" value={form.userId} onChange={e => set('userId', e.target.value)} required />
          <Input label="Amount (NGN)" type="number" placeholder="0.00" value={form.amount} onChange={e => set('amount', e.target.value)} required error={amountError} />
        </>
      );
    case 'water':
      return (
        <>
          <SelectField id="network" label="Water Provider" value={form.network} onChange={v => set('network', v)} required placeholder="Select Provider" options={WATER_PROVIDERS} />
          <Input label="Account Number" type="text" placeholder="WC123456789" value={form.accountNumber} onChange={e => set('accountNumber', e.target.value)} required />
          <Input label="Amount (NGN)" type="number" placeholder="0.00" value={form.amount} onChange={e => set('amount', e.target.value)} required error={amountError} />
        </>
      );
    case 'internet':
      return (
        <>
          <SelectField id="ispPlan" label="Internet Plan" value={form.ispPlan} onChange={v => set('ispPlan', v)} required placeholder="Select a Plan" options={ISP_PLANS} />
          <Input label="Phone / Account Number" type="tel" placeholder="0801 234 5678" value={form.phone} onChange={e => set('phone', e.target.value)} required error={phoneError} minLength={11} maxLength={11} />
        </>
      );
    case 'school':
      return (
        <>
          <Input label="School Name" type="text" placeholder="e.g. University of Lagos" value={form.schoolName} onChange={e => set('schoolName', e.target.value)} required />
          <Input label="Student ID / Reg. Number" type="text" placeholder="LCU/ND/22/0001" value={form.studentId} onChange={e => set('studentId', e.target.value)} required />
          <Input label="Amount (NGN)" type="number" placeholder="0.00" value={form.amount} onChange={e => set('amount', e.target.value)} required error={amountError} />
        </>
      );
    case 'transport':
      return (
        <>
          <SelectField id="transportType" label="Transport Type" value={form.transportType} onChange={v => set('transportType', v)} required placeholder="Select Transport Service" options={TRANSPORT_TYPES} />
          <Input label="Amount (NGN)" type="number" placeholder="0.00" value={form.amount} onChange={e => set('amount', e.target.value)} required error={amountError} />
        </>
      );
    default: return null;
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PayBillsPage() {
  const [activeCategory, setActiveCategory] = useState<CategoryId | null>(null);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [step, setStep] = useState<'form' | 'confirm' | 'success'>('form');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [phoneError, setPhoneError] = useState<string>('');
  const [amountError, setAmountError] = useState<string>('');

  const setField = (k: keyof FormState, v: string) => setForm(prev => ({ ...prev, [k]: v }));

  const activeConfig = BILL_CATEGORIES.find(c => c.id === activeCategory);

  const closeModal = () => {
    setActiveCategory(null);
    setForm(INITIAL_FORM);
    setStep('form');
    setIsProcessing(false);
    setErrorMsg('');
    setPhoneError('');
    setAmountError('');
  };

  React.useEffect(() => {
    if (!activeCategory) return;

    // Validate Phone Number
    const needsPhone = activeCategory === 'airtime' || activeCategory === 'data' || activeCategory === 'internet';
    if (needsPhone) {
      if (!form.phone) {
        setPhoneError('');
      } else {
        const cleanPhone = form.phone.replace(/\s+/g, '');
        if (cleanPhone.length !== 11 || !cleanPhone.startsWith('0')) {
          setPhoneError('Enter a valid 11-digit Nigerian phone number');
        } else {
          setPhoneError('');
        }
      }
    } else {
      setPhoneError('');
    }

    // Validate Amount
    const needsAmount = activeCategory === 'airtime' || activeCategory === 'electricity' || activeCategory === 'betting' || activeCategory === 'water' || activeCategory === 'school' || activeCategory === 'transport';
    if (needsAmount) {
      if (!form.amount) {
        setAmountError('');
      } else {
        const amt = parseFloat(form.amount);
        if (isNaN(amt) || amt <= 0) {
          setAmountError('Amount must be greater than ₦0');
        } else {
          setAmountError('');
        }
      }
    } else {
      setAmountError('');
    }
  }, [form.phone, form.amount, activeCategory]);

  const hasErrors = React.useMemo(() => {
    if (!activeCategory) return false;

    // Check Phone validation
    const needsPhone = activeCategory === 'airtime' || activeCategory === 'data' || activeCategory === 'internet';
    if (needsPhone) {
      const cleanPhone = form.phone.replace(/\s+/g, '');
      if (cleanPhone.length !== 11 || !cleanPhone.startsWith('0')) {
        return true;
      }
    }

    // Check Amount validation
    const needsAmount = activeCategory === 'airtime' || activeCategory === 'electricity' || activeCategory === 'betting' || activeCategory === 'water' || activeCategory === 'school' || activeCategory === 'transport';
    if (needsAmount) {
      const amt = parseFloat(form.amount);
      if (isNaN(amt) || amt <= 0) {
        return true;
      }
    }

    // Check general required fields
    if (activeCategory === 'airtime' && (!form.network || !form.phone || !form.amount)) return true;
    if (activeCategory === 'data' && (!form.network || !form.phone || !form.bundle)) return true;
    if (activeCategory === 'electricity' && (!form.network || !form.meterNumber || !form.meterType || !form.amount)) return true;
    if (activeCategory === 'tv' && (!form.network || !form.smartCardNumber || !form.bouquet)) return true;
    if (activeCategory === 'betting' && (!form.platform || !form.userId || !form.amount)) return true;
    if (activeCategory === 'water' && (!form.network || !form.accountNumber || !form.amount)) return true;
    if (activeCategory === 'internet' && (!form.ispPlan || !form.phone)) return true;
    if (activeCategory === 'school' && (!form.schoolName || !form.studentId || !form.amount)) return true;
    if (activeCategory === 'transport' && (!form.transportType || !form.amount)) return true;

    return false;
  }, [activeCategory, form, phoneError, amountError]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (hasErrors) return;
    setErrorMsg('');
    setStep('confirm');
  };

  const handleConfirm = async () => {
    setIsProcessing(true);
    setErrorMsg('');

    try {
      // Find the selected item's amount (for Data/TV/etc. with fixed plan prices)
      let amount = parseFloat(form.amount) || 0;
      if (activeCategory === 'data') {
        const bundle = DATA_BUNDLES.find(b => b.value === form.bundle);
        if (bundle) {
          const match = bundle.label.match(/\((\d+(?:,\d+)?)\s*NGN\)/);
          if (match) amount = parseFloat(match[1].replace(/,/g, ''));
        }
      } else if (activeCategory === 'tv') {
        const bouquets = TV_BOUQUETS[form.network] || [];
        const bq = bouquets.find(b => b.value === form.bouquet);
        if (bq) {
          const match = bq.label.match(/–\s*([\d,]+)\s*NGN/);
          if (match) amount = parseFloat(match[1].replace(/,/g, ''));
        }
      }

      if (amount <= 0) {
        setErrorMsg('Please enter or select a valid payment amount.');
        setIsProcessing(false);
        return;
      }

      const res = await fetch('/api/bills/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: activeCategory,
          amount,
          form,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        setErrorMsg(data.error || 'Payment processing failed. Please try again.');
        setIsProcessing(false);
      } else {
        setStep('success');
        setIsProcessing(false);
      }
    } catch (err: any) {
      console.error('Confirmation error:', err);
      setErrorMsg('An unexpected connection error occurred.');
      setIsProcessing(false);
    }
  };

  const summaryLines = activeCategory ? buildSummaryLines(activeCategory, form) : [];

  return (
    <div className="flex flex-col p-4 pt-10 min-h-screen relative">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pay Bills</h1>
        <p className="text-sm text-gray-700 dark:text-slate-600 mt-1">Select a service to proceed</p>
      </header>

      {/* Bill Category Grid */}
      <div className="grid grid-cols-4 gap-y-6 gap-x-2 mb-8 bg-white dark:bg-slate-900 border border-gray-100 rounded-3xl p-5 shadow-sm">
        {BILL_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            className="flex flex-col items-center cursor-pointer group focus:outline-none"
            onClick={() => { setActiveCategory(cat.id); setStep('form'); }}
          >
            <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-2 ${cat.bg} ${cat.color} transition-transform active:scale-90 group-hover:scale-105`}>
              {cat.icon}
            </div>
            <span className="text-[11px] font-semibold text-gray-700 text-center leading-tight">{cat.name}</span>
          </button>
        ))}
      </div>

      {/* Recent Billers */}
      <section className="mt-2">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Recent</h3>
        <div className="flex items-center space-x-4 overflow-x-auto pb-4">
          {['Mom', 'Electrician', 'Landlord', 'Sister'].map((contact, idx) => (
            <div key={idx} className="flex flex-col items-center flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-gray-700 dark:text-slate-600 border border-gray-200 shadow-sm cursor-pointer hover:bg-gray-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
              </div>
              <p className="text-[11px] font-medium text-gray-600 mt-2 truncate w-14 text-center">{contact}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Modal ── */}
      {activeCategory && activeConfig && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={closeModal} />

          <div className="bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl p-6 pt-8 w-full max-w-sm relative z-10">

            {/* ── STEP: FORM ── */}
            {step === 'form' && (
              <>
                <div className="flex items-center space-x-3 mb-6">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${activeConfig.bg} ${activeConfig.color}`}>
                    {activeConfig.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{activeConfig.name} Payment</h3>
                </div>
                <form onSubmit={handleFormSubmit}>
                  <FormBody category={activeCategory} form={form} set={setField} phoneError={phoneError} amountError={amountError} />
                  <div className="flex flex-col space-y-3 mt-2">
                    <Button type="submit" variant="primary" disabled={hasErrors}>Review Payment</Button>
                    <Button type="button" variant="text" onClick={closeModal}>Cancel</Button>
                  </div>
                </form>
              </>
            )}

            {/* ── STEP: CONFIRM ── */}
            {step === 'confirm' && (
              <>
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-50 text-blue-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Confirm Payment</h3>
                </div>
                <p className="text-sm text-gray-700 dark:text-slate-600 mb-5">Please review your transaction details before confirming.</p>

                <div className="bg-gray-50 dark:bg-slate-800 rounded-2xl divide-y divide-gray-100 mb-6 overflow-hidden">
                  <div className="flex justify-between items-center px-4 py-3">
                    <span className="text-[13px] font-semibold text-gray-700 dark:text-slate-600">Service</span>
                    <span className="text-[13px] font-bold text-gray-900 dark:text-white capitalize">{activeConfig.name}</span>
                  </div>
                  {summaryLines.map((line) => (
                    <div key={line.label} className="flex justify-between items-center px-4 py-3">
                      <span className="text-[13px] font-semibold text-gray-700 dark:text-slate-600">{line.label}</span>
                      <span className="text-[13px] font-bold text-gray-900 dark:text-white">{line.value}</span>
                    </div>
                  ))}
                </div>

                {errorMsg && (
                  <div className="bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 p-4 rounded-2xl text-[13px] font-bold text-center mb-5 border border-red-100 dark:border-red-900/30">
                    {errorMsg}
                  </div>
                )}

                <div className="flex flex-col space-y-3">
                  <Button type="button" variant="primary" onClick={handleConfirm} disabled={isProcessing}>
                    {isProcessing ? 'Processing Payment...' : 'Confirm & Pay'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setStep('form')} disabled={isProcessing}>← Edit Details</Button>
                </div>
              </>
            )}

            {/* ── STEP: SUCCESS ── */}
            {step === 'success' && (
              <div className="flex flex-col items-center text-center py-4">
                <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center text-green-500 mb-5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Payment Successful!</h3>
                <p className="text-gray-700 dark:text-slate-600 text-sm mb-8">Your <span className="font-semibold text-gray-700">{activeConfig.name}</span> payment has been processed successfully.</p>
                <Button type="button" variant="primary" onClick={closeModal}>Done</Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
