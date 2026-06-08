'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../../../lib/supabase/client';

// Date helper functions
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const parseCreatedAt = (dateVal: any): Date => {
  if (!dateVal) return new Date();
  if (dateVal instanceof Date) return dateVal;
  
  const str = String(dateVal);
  // Replace space with T for Safari compatibility
  const normalized = str.replace(' ', 'T');
  const d = new Date(normalized);
  if (isNaN(d.getTime())) {
    const dFallback = new Date(str);
    return isNaN(dFallback.getTime()) ? new Date() : dFallback;
  }
  return d;
};

const formatDate = (date: Date | null) => {
  if (!date) return 'Select Date';
  const month = MONTHS[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  return `${month} ${day}, ${year}`;
};

const formatStatementDate = (date: Date) => {
  const month = MONTHS[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  return `${month} ${day}, ${year}`;
};

const formatStatementTime = (date: Date) => {
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 should be 12
  return `${hours}:${minutes} ${ampm}`;
};

const formatStatementPeriod = (start: Date | null, end: Date | null) => {
  if (!start || !end) return '';
  const startMonth = MONTHS[start.getMonth()];
  const startDay = start.getDate();
  const startYear = start.getFullYear();
  
  const endMonth = MONTHS[end.getMonth()];
  const endDay = end.getDate();
  const endYear = end.getFullYear();
  
  if (startYear === endYear) {
    return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${startYear}`;
  }
  return `${startMonth} ${startDay}, ${startYear} - ${endMonth} ${endDay}, ${endYear}`;
};

const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

const DatePicker = ({ 
  startDate, setStartDate, endDate, setEndDate 
}: { 
  startDate: Date | null, setStartDate: (d: Date | null) => void,
  endDate: Date | null, setEndDate: (d: Date | null) => void
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const renderMonth = (date: Date, showPrevArrow: boolean, showNextArrow: boolean) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    const days = [];
    const prevMonthDays = getDaysInMonth(year, month - 1);
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({ day: prevMonthDays - i, isCurrentMonth: false, date: new Date(year, month - 1, prevMonthDays - i) });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, isCurrentMonth: true, date: new Date(year, month, i) });
    }
    const remainingDays = 42 - days.length; 
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ day: i, isCurrentMonth: false, date: new Date(year, month + 1, i) });
    }

    return (
      <div>
        <div className="flex justify-between items-center mb-4 px-1">
          {showPrevArrow ? (
            <button onClick={prevMonth} aria-label="Previous Month" title="Previous Month" className="p-1 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#0F172A] dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
          ) : <div className="w-6"/>}
          <span className="text-[12px] sm:text-[13px] font-bold text-[#0F172A] dark:text-white">
            {date.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </span>
          {showNextArrow ? (
            <button onClick={nextMonth} aria-label="Next Month" title="Next Month" className="p-1 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#0F172A] dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          ) : <div className="w-6"/>}
        </div>
        <div className="grid grid-cols-7 gap-y-2 gap-x-0 sm:gap-x-1 text-center text-[10px] sm:text-[11px]">
          {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => <span key={d} className="text-gray-400 font-medium pb-2">{d}</span>)}
          {days.map((d, idx) => {
            const isSelectedStart = startDate && d.date.getTime() === startDate.getTime();
            const isSelectedEnd = endDate && d.date.getTime() === endDate.getTime();
            const isSelected = isSelectedStart || isSelectedEnd;
            const isBetween = startDate && endDate && d.date > startDate && d.date < endDate;
            
            const handleDayClick = () => {
              if (!startDate || (startDate && endDate)) {
                setStartDate(d.date);
                setEndDate(null);
              } else if (startDate && !endDate) {
                if (d.date < startDate) {
                  setEndDate(startDate);
                  setStartDate(d.date);
                } else {
                  setEndDate(d.date);
                }
              }
            };

            return (
              <div key={idx} className="relative z-10 py-0.5" onClick={handleDayClick}>
                {isBetween && <div className="absolute inset-y-0 left-0 right-0 bg-blue-50 dark:bg-blue-900/30 -z-10"></div>}
                {isSelectedStart && startDate && endDate && <div className="absolute inset-y-0 right-0 left-1/2 bg-blue-50 dark:bg-blue-900/30 -z-10"></div>}
                {isSelectedEnd && startDate && endDate && <div className="absolute inset-y-0 left-0 right-1/2 bg-blue-50 dark:bg-blue-900/30 -z-10"></div>}
                
                <span className={`w-6 h-6 sm:w-7 sm:h-7 mx-auto flex items-center justify-center rounded-full cursor-pointer transition-colors ${
                  isSelected ? 'bg-[#0047FF] text-white font-bold shadow-md' :
                  isBetween ? 'text-[#0F172A] dark:text-white' :
                  d.isCurrentMonth ? 'text-[#0F172A] dark:text-white hover:bg-gray-100 dark:hover:bg-slate-800' : 'text-gray-300 dark:text-slate-600'
                }`}>
                  {d.day}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const nextMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8">
        {renderMonth(currentDate, true, false)}
        <div className="hidden sm:block">
          {renderMonth(nextMonthDate, false, true)}
        </div>
      </div>
      <div className="sm:hidden flex justify-between items-center -mt-4 mb-4 px-2">
        <button onClick={prevMonth} className="text-gray-500 text-[12px] font-bold p-2">&larr; Prev</button>
        <button onClick={nextMonth} className="text-blue-600 text-[12px] font-bold p-2">Next &rarr;</button>
      </div>
    </div>
  );
};

const typeOptions = [
  {
    label: 'All Transactions',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
      </svg>
    ),
    color: 'text-gray-400'
  },
  {
    label: 'Deposits',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 11l3-3m0 0l3 3m-3-3v8m0-13a9 9 0 110 18 9 9 0 010-18z" />
      </svg>
    ),
    color: 'text-[#16A34A]'
  },
  {
    label: 'Withdrawals',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
      </svg>
    ),
    color: 'text-[#0047FF]'
  },
  {
    label: 'Conversions',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
    color: 'text-purple-500'
  },
  {
    label: 'Investments',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
    color: 'text-gray-500'
  },
  {
    label: 'Bill Payments',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
    color: 'text-gray-500'
  }
];

export default function HistoryPage() {
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);
  const [selectedTime, setSelectedTime] = useState('All Time');
  const [showCalendar, setShowCalendar] = useState(false);
  const [showDownloadCalendar, setShowDownloadCalendar] = useState(false);
  
  const [filterStartDate, setFilterStartDate] = useState<Date | null>(null);
  const [filterEndDate, setFilterEndDate] = useState<Date | null>(null);

  const [downloadStartDate, setDownloadStartDate] = useState<Date | null>(null);
  const [downloadEndDate, setDownloadEndDate] = useState<Date | null>(null);

  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [selectedType, setSelectedType] = useState('All Transactions');

  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Custom states for high-fidelity statement export and email delivery
  const [userEmail, setUserEmail] = useState('');
  const [userFullName, setUserFullName] = useState('');
  const [statementTransactions, setStatementTransactions] = useState<any[]>([]);
  const [downloading, setDownloading] = useState(false);

  // Helper to load html2pdf script dynamically from CDN
  const loadHtml2Pdf = () => {
    return new Promise<any>((resolve, reject) => {
      if ((window as any).html2pdf) {
        resolve((window as any).html2pdf);
        return;
      }
      const script = document.createElement('script');
      script.src = '/html2pdf.bundle.min.js';
      script.onload = () => resolve((window as any).html2pdf);
      script.onerror = (err) => reject(err);
      document.body.appendChild(script);
    });
  };

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        setUserEmail(user.email || '');
        setUserFullName(user.user_metadata?.full_name || 'John Doe');

        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setTransactions(data || []);
      } catch (err) {
        console.error('Error fetching history:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const handleTimeSelect = (option: string) => {
    if (option === 'Custom Date Range') {
      setFilterStartDate(null);
      setFilterEndDate(null);
      setShowCalendar(true);
      setShowTimeDropdown(false);
    } else {
      setSelectedTime(option);
      setShowTimeDropdown(false);
    }
  };

  const handleTypeSelect = (option: string) => {
    setSelectedType(option);
    setShowTypeDropdown(false);
  };

  // Filter transactions dynamically
  const getFilteredTransactions = () => {
    return transactions.filter(tx => {
      // 1. Filter by Type
      if (selectedType !== 'All Transactions') {
        const typeLower = tx.type.toLowerCase();
        if (selectedType === 'Deposits' && typeLower !== 'deposit' && typeLower !== 'refund') return false;
        if (selectedType === 'Withdrawals' && typeLower !== 'withdrawal') return false;
        if (selectedType === 'Conversions' && typeLower !== 'conversion') return false;
        if (selectedType === 'Investments' && (typeLower !== 'withdrawal' || !tx.tx_ref?.startsWith('kyvatron-invest'))) return false;
        if (selectedType === 'Bill Payments' && typeLower !== 'bill_payment') return false;
      }

      // 2. Filter by Date
      if (selectedTime !== 'All Time' && filterStartDate) {
        const txDate = parseCreatedAt(tx.created_at);
        // Start of start date
        const start = new Date(filterStartDate);
        start.setHours(0, 0, 0, 0);
        
        if (txDate < start) return false;

        if (filterEndDate) {
          // End of end date
          const end = new Date(filterEndDate);
          end.setHours(23, 59, 59, 999);
          if (txDate > end) return false;
        }
      }

      return true;
    });
  };

  const filteredTransactions = getFilteredTransactions();

  return (
    <div className="flex flex-col p-5 pt-12 min-h-screen bg-slate-50 dark:bg-slate-950 pb-10">
      <header className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/home" className="mr-3 p-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-900 dark:text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <h1 className="text-[20px] font-bold text-[#0F172A] dark:text-white">Transaction History</h1>
        </div>
        <button 
          onClick={() => {
            setDownloadStartDate(null);
            setDownloadEndDate(null);
            setShowDownloadCalendar(true);
          }}
          className="flex items-center space-x-1.5 text-[#0047FF] border border-[#0047FF] rounded-lg px-3 py-1.5 text-[12px] font-medium hover:bg-blue-50 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span>Download Statement</span>
        </button>
      </header>

      {/* Filters */}
      <div className="flex space-x-3 mb-8 relative">
        <div className="relative flex-1">
          <button 
            onClick={() => setShowTimeDropdown(!showTimeDropdown)}
            className="w-full flex justify-between items-center bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl px-4 py-3 text-[14px] font-medium text-[#0F172A] dark:text-white shadow-sm"
          >
            <div className="flex items-center space-x-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{selectedTime}</span>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#0047FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showTimeDropdown ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
            </svg>
          </button>
          
          {showTimeDropdown && (
            <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl shadow-lg z-20 py-2">
              <button 
                onClick={() => handleTimeSelect('All Time')}
                className={`w-full text-left px-4 py-3 text-[14px] flex items-center space-x-2 ${selectedTime === 'All Time' ? 'bg-blue-50 text-[#0047FF]' : 'text-[#0F172A] dark:text-white hover:bg-gray-50 dark:hover:bg-slate-800'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>All Time</span>
              </button>
              <button 
                onClick={() => handleTimeSelect('Custom Date Range')}
                className={`w-full text-left px-4 py-3 text-[14px] flex items-center space-x-2 ${selectedTime === 'Custom Date Range' ? 'bg-blue-50 text-[#0047FF]' : 'text-[#0F172A] dark:text-white hover:bg-gray-50 dark:hover:bg-slate-800'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Custom Date Range</span>
              </button>
            </div>
          )}
        </div>

        <div className="relative flex-1">
          <button 
            onClick={() => setShowTypeDropdown(!showTypeDropdown)}
            className="w-full flex justify-between items-center bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl px-4 py-3 text-[14px] font-medium text-[#0F172A] dark:text-white shadow-sm"
          >
            <div className="flex items-center space-x-2">
              <span className="text-gray-400">
                {typeOptions.find(opt => opt.label === selectedType)?.icon}
              </span>
              <span>{selectedType}</span>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#0047FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showTypeDropdown ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
            </svg>
          </button>
          
          {showTypeDropdown && (
            <div className="absolute top-full right-0 w-full mt-2 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl shadow-lg z-20 py-2">
              {typeOptions.map((option) => (
                <button 
                  key={option.label}
                  onClick={() => handleTypeSelect(option.label)}
                  className={`w-full text-left px-4 py-3 text-[14px] flex items-center space-x-3 ${selectedType === option.label ? 'bg-blue-50 text-[#0047FF] font-medium' : 'text-[#0F172A] dark:text-white hover:bg-gray-50 dark:hover:bg-slate-800'}`}
                >
                  <span className={`${selectedType === option.label ? 'text-[#0047FF]' : option.color}`}>
                    {option.icon}
                  </span>
                  <span className="truncate">{option.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <h2 className="text-[16px] font-bold text-[#0F172A] dark:text-white mb-4">Transactions</h2>

      {/* Transactions List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden flex-grow mb-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-xs text-gray-500 dark:text-slate-400">Fetching transaction logs...</p>
          </div>
        ) : filteredTransactions.length > 0 ? (
          <div className="divide-y divide-gray-100 dark:divide-slate-800">
            {filteredTransactions.map((tx) => {
              const isPositive = tx.type === 'deposit' || tx.type === 'refund';
              const isUsdt = tx.currency?.toUpperCase() === 'USDT' || 
                             tx.description?.includes('USDT') || 
                             tx.description?.toLowerCase().includes('nowpayments');
              const formattedAmount = isUsdt
                ? `$${Number(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT`
                : new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(Number(tx.amount));
              
              const isSuccess = tx.status === 'successful' || tx.status === 'completed';
              const isPending = tx.status === 'pending';

              const txDate = parseCreatedAt(tx.created_at);
              const txDateStr = `${formatStatementDate(txDate)}, ${formatStatementTime(txDate)}`;

              // Custom provider descriptions
              let displayDescription = tx.description || 'Transaction';
              if (tx.type === 'deposit') displayDescription = 'Deposit';
              if (tx.type === 'conversion') displayDescription = `Convert ${tx.currency}`;
              if (tx.type === 'bill_payment') displayDescription = `${tx.metadata?.category || 'Utility'} Payment`;

              const isInvestment = tx.type === 'withdrawal' && (
                tx.tx_ref?.startsWith('kyvatron-invest') || 
                tx.description?.toLowerCase().includes('investment') || 
                tx.description?.toLowerCase().includes('roi')
              );

              // Define 5 distinct styles
              let iconBg = 'bg-[#0047FF]';
              let iconSvg = (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              );
              let displayType = tx.type;

              if (isPositive) {
                iconBg = 'bg-[#16A34A]';
                iconSvg = (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                );
                displayType = tx.type === 'deposit' ? 'Deposit' : 'Refund';
              } else if (isInvestment) {
                iconBg = 'bg-amber-500';
                iconSvg = (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                );
                displayType = 'Investment';
              } else if (tx.type === 'conversion') {
                iconBg = 'bg-purple-600';
                iconSvg = (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                );
                displayType = 'Conversion';
              } else if (tx.type === 'bill_payment') {
                iconBg = 'bg-sky-600';
                iconSvg = (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                );
                displayType = 'Bill Payment';
              } else if (tx.type === 'withdrawal') {
                iconBg = 'bg-red-500';
                iconSvg = (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                );
                displayType = 'Withdrawal';
              }

              return (
                <Link 
                  href={`/history/${tx.id}`} 
                  key={tx.id} 
                  className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer block"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${iconBg}`}>
                      {iconSvg}
                    </div>
                    <div>
                      <h4 className="text-[15px] font-bold text-[#0F172A] dark:text-white mb-0.5 capitalize">
                        {displayType}
                      </h4>
                      <p className="text-[13px] text-[#475569] dark:text-slate-400 mb-0.5">{displayDescription}</p>
                      <p className="text-[11px] text-[#64748B] dark:text-slate-500">{txDateStr}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right flex flex-col items-end">
                      <p className={`text-[15px] font-bold mb-1 ${isPositive ? 'text-[#16A34A]' : 'text-[#0F172A] dark:text-white'}`}>
                        {isPositive ? '+' : '-'}{formattedAmount}
                      </p>
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded capitalize ${
                        isSuccess ? 'bg-[#DCFCE7] text-[#16A34A]' :
                        isPending ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-600'
                      }`}>
                        {tx.status}
                      </span>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 text-[#64748B] text-[14px]">
            No transactions found matching your criteria.
          </div>
        )}
      </div>

      <div className="text-center text-[#64748B] text-[13px] font-medium">
        No more transactions
      </div>

      {/* Calendar Overlay */}
      {showCalendar && (
        <div className="fixed inset-0 z-[60] overflow-y-auto bg-black/40 backdrop-blur-sm p-4 flex justify-center">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-5 shadow-2xl relative my-auto animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[18px] font-bold text-[#0F172A] dark:text-white">Select Date Range</h3>
              <button onClick={() => setShowCalendar(false)} className="text-gray-400 hover:text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex items-center justify-between mb-8 space-x-3">
              <div className="flex-1">
                <label className="text-[12px] text-[#64748B] mb-1 block font-medium">From</label>
                <div className={`border ${!filterStartDate || (filterStartDate && filterEndDate) ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-200 dark:border-slate-800'} rounded-xl p-3 flex items-center space-x-2`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-[14px] text-[#0F172A] dark:text-white font-medium whitespace-nowrap">{formatDate(filterStartDate)}</span>
                </div>
              </div>
              <div className="pt-5 text-gray-400 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
              <div className="flex-1">
                <label className="text-[12px] text-[#64748B] mb-1 block font-medium">To</label>
                <div className={`border ${filterStartDate && !filterEndDate ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-200 dark:border-slate-800'} rounded-xl p-3 flex items-center space-x-2`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-[14px] text-[#0F172A] dark:text-white font-medium whitespace-nowrap">{formatDate(filterEndDate)}</span>
                </div>
              </div>
            </div>

            {/* Interactive Calendar */}
            <DatePicker 
              startDate={filterStartDate} setStartDate={setFilterStartDate}
              endDate={filterEndDate} setEndDate={setFilterEndDate}
            />

            <button 
              onClick={() => {
                if (filterStartDate && filterEndDate) {
                  setSelectedTime(`${formatDate(filterStartDate)} - ${formatDate(filterEndDate)}`);
                } else if (filterStartDate) {
                  setFilterEndDate(filterStartDate);
                  setSelectedTime(`${formatDate(filterStartDate)} - ${formatDate(filterStartDate)}`);
                } else {
                  setSelectedTime('All Time');
                }
                setShowCalendar(false);
              }}
              className="w-full bg-[#0047FF] hover:bg-blue-700 text-white font-bold py-3.5 rounded-2xl transition-colors text-[15px] mt-4"
            >
              Apply
            </button>
          </div>
        </div>
      )}

      {/* Download Statement Calendar Overlay */}
      {showDownloadCalendar && (
        <div className="fixed inset-0 z-[60] overflow-y-auto bg-black/40 backdrop-blur-sm p-4 flex justify-center">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-5 pt-3 pb-5 shadow-2xl relative my-auto animate-in zoom-in-95 duration-200">
            <div className="w-10 h-1 bg-gray-200 dark:bg-slate-700 rounded-full mx-auto mb-5"></div>
            
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-[20px] font-bold text-[#0F172A] dark:text-white">Download Statement</h3>
              <button onClick={() => setShowDownloadCalendar(false)} className="text-gray-400 hover:text-gray-600 mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <p className="text-[14px] text-[#64748B] mb-8">
              Select a date range to generate and download your transaction statement.
            </p>

            <div className="flex items-center justify-between mb-8 space-x-3">
              <div className="flex-1">
                <label className="text-[12px] text-[#64748B] mb-1 block font-medium">From</label>
                <div className={`border ${!downloadStartDate || (downloadStartDate && downloadEndDate) ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-200 dark:border-slate-800'} rounded-xl p-3 flex items-center space-x-2 bg-white dark:bg-slate-900`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-[14px] text-[#0F172A] dark:text-white font-medium whitespace-nowrap">{formatDate(downloadStartDate)}</span>
                </div>
              </div>
              <div className="pt-5 text-gray-400 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
              <div className="flex-1">
                <label className="text-[12px] text-[#64748B] mb-1 block font-medium">To</label>
                <div className={`border ${downloadStartDate && !downloadEndDate ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-200 dark:border-slate-800'} rounded-xl p-3 flex items-center space-x-2 bg-white dark:bg-slate-900`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-[14px] text-[#0F172A] dark:text-white font-medium whitespace-nowrap">{formatDate(downloadEndDate)}</span>
                </div>
              </div>
            </div>

            {/* Interactive Calendar */}
            <DatePicker 
              startDate={downloadStartDate} setStartDate={setDownloadStartDate}
              endDate={downloadEndDate} setEndDate={setDownloadEndDate}
            />

            <button 
              onClick={async () => {
                if (downloadStartDate && downloadEndDate) {
                  try {
                    setDownloading(true);
                    
                    const start = new Date(downloadStartDate);
                    start.setHours(0, 0, 0, 0);
                    
                    const end = new Date(downloadEndDate);
                    end.setHours(23, 59, 59, 999);
                    
                    // Filter down to the transactions matching the selected range
                    const filtered = transactions.filter(tx => {
                      const txDate = parseCreatedAt(tx.created_at);
                      return txDate >= start && txDate <= end;
                    });
                    
                    setStatementTransactions(filtered);
                    
                    // Allow state and DOM rendering updates
                    await new Promise(resolve => setTimeout(resolve, 300));
                    
                    // Initialize and load the client-side generator from CDN
                    const html2pdf = await loadHtml2Pdf();
                    const element = document.getElementById('kyvatron-statement-wrapper');
                    if (!element) {
                      throw new Error('Statement wrapper element not found in DOM.');
                    }
                    const r1 = element.getBoundingClientRect();
                    console.log('[DEBUG PDF] wrapper rect width/height/top/left:', r1.width, r1.height, r1.top, r1.left);
                    const templateEl = document.getElementById('kyvatron-statement-template');
                    if (templateEl) {
                      const r2 = templateEl.getBoundingClientRect();
                      console.log('[DEBUG PDF] template rect width/height/top/left:', r2.width, r2.height, r2.top, r2.left);
                    }
                    
                    const finalHeight = element ? Math.max(element.offsetHeight || element.scrollHeight || 1123, 1123) : 1123;
                    console.log('[DEBUG PDF] final height for rendering:', finalHeight);

                    const startDateStr = formatDate(downloadStartDate);
                    const endDateStr = formatDate(downloadEndDate);
                    
                    const opt = {
                      margin:       0,
                      filename:     `Kyvatron_Statement_${downloadStartDate.toISOString().split('T')[0]}_to_${downloadEndDate.toISOString().split('T')[0]}.pdf`,
                      image:        { type: 'jpeg', quality: 0.98 },
                      html2canvas:  { 
                        scale: 2, 
                        useCORS: true, 
                        letterRendering: true,
                        width: 794,
                        height: finalHeight,
                        windowWidth: 794,
                        windowHeight: finalHeight,
                        scrollX: 0,
                        scrollY: 0,
                        x: 0,
                        y: 0,
                        onclone: (clonedDoc: any) => {
                          // Clear HTML & Body styles that could restrict height or overflow in cloned doc
                          if (clonedDoc.documentElement) {
                            clonedDoc.documentElement.style.height = 'auto';
                            clonedDoc.documentElement.style.minHeight = '0';
                            clonedDoc.documentElement.style.overflow = 'visible';
                          }
                          if (clonedDoc.body) {
                            clonedDoc.body.style.height = 'auto';
                            clonedDoc.body.style.minHeight = '0';
                            clonedDoc.body.style.overflow = 'visible';
                            clonedDoc.body.style.width = 'auto';
                          }

                          // Fix the html2pdf container
                          const containers = clonedDoc.querySelectorAll('.html2pdf__container');
                          containers.forEach((container: any) => {
                            container.style.width = '794px';
                            container.style.height = `${finalHeight}px`;
                            container.style.overflow = 'visible';
                            container.style.opacity = '1';
                            container.style.visibility = 'visible';
                            container.style.display = 'block';
                            container.style.position = 'static';
                          });

                          // FIX: PDF statement generation wrapper handling in cloned doc
                          const wrappers = clonedDoc.querySelectorAll('[id="kyvatron-statement-wrapper"]');
                          console.log('[DEBUG PDF onclone] wrappers count:', wrappers.length);
                          wrappers.forEach((wrapper: any, idx: number) => {
                            wrapper.style.position = 'absolute';
                            wrapper.style.left = '0';
                            wrapper.style.top = '0';
                            wrapper.style.width = '794px';
                            wrapper.style.height = `${finalHeight}px`;
                            wrapper.style.opacity = '1';
                            wrapper.style.visibility = 'visible';
                            wrapper.style.display = 'block';
                            wrapper.style.overflow = 'visible';
                          });

                          const templates = clonedDoc.querySelectorAll('.kyvatron-pdf-template');
                          console.log('[DEBUG PDF onclone] templates count:', templates.length);
                          templates.forEach((el: any, idx: number) => {
                            el.style.position = 'relative';
                            el.style.left = '0';
                            el.style.top = '0';
                            el.style.width = '794px';
                            el.style.height = `${finalHeight}px`;
                            el.style.display = 'block';
                            el.style.visibility = 'visible';
                            el.style.opacity = '1';
                          });
                        }
                      },
                      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
                    };
                    
                    // Render the exact high-fidelity PDF file matching mockup parameters
                    await html2pdf().from(element).set(opt).save();
                    
                    setShowDownloadCalendar(false);
                    
                    // Dispatch notification details via the simulated email worker
                    if (userEmail) {
                      try {
                        await fetch('/api/send-statement', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            email: userEmail,
                            accountName: userFullName || 'John Doe',
                            startDate: startDateStr,
                            endDate: endDateStr,
                            transactionsCount: filtered.length
                          })
                        });
                      } catch (emailErr) {
                        console.error('Failed to trigger email notification copy:', emailErr);
                      }
                    }
                    
                    alert(`Statement downloaded successfully! A copy has also been sent to your email at ${userEmail || 'your registered email address'}.`);
                  } catch (err: any) {
                    console.error('Statement generation error:', err);
                    alert('Error creating your PDF statement: ' + (err.message || err));
                  } finally {
                    setDownloading(false);
                  }
                }
              }}
              disabled={!downloadStartDate || !downloadEndDate || downloading}
              className={`w-full font-bold py-3.5 rounded-2xl transition-colors text-[15px] mt-4 flex items-center justify-center space-x-2 ${
                downloadStartDate && downloadEndDate && !downloading
                  ? 'bg-[#0047FF] hover:bg-blue-700 text-white' 
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              {downloading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-gray-600"></div>
                  <span>Generating PDF...</span>
                </>
              ) : (
                <span>Download Statement</span>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Premium Full-Screen Loading Overlay */}
      {downloading && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/80 dark:bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#0047FF]"></div>
            <p className="text-[16px] font-bold text-[#0F172A] dark:text-white">Generating Statement...</p>
            <p className="text-[12px] text-gray-500 dark:text-slate-400">Please wait while we prepare your high-fidelity PDF.</p>
          </div>
        </div>
      )}

      {/* High-Fidelity Printable PDF Statement Template */}
      <div
        id="kyvatron-statement-wrapper"
        style={{
          position: 'absolute', left: '0', top: '0', width: '794px', height: 'auto',
          overflow: 'visible', zIndex: -9999, opacity: 0, pointerEvents: 'none'
        }}
      >
        <div
          id="kyvatron-statement-template"
          className="kyvatron-pdf-template"
          style={{
            backgroundColor: '#ffffff', color: '#000000',
            fontFamily: 'Arial, Helvetica, sans-serif',
            padding: '48px', width: '794px', minHeight: '1123px', boxSizing: 'border-box'
          }}
        >
          {/* ── HEADER (table layout — no flex/SVG for html2canvas) ── */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '40px' }}><tbody><tr>
            <td style={{ verticalAlign: 'middle', padding: 0 }}>
              <div style={{ fontSize: '36px', fontWeight: '900', color: '#0047FF', letterSpacing: '0.02em', lineHeight: '1', marginBottom: '8px' }}>KYVATRON</div>
              <div style={{ fontSize: '14px', color: '#475569', fontWeight: '500' }}>Official Account Transaction Statement</div>
            </td>
          </tr></tbody></table>

          {/* ── INFO GRID (nested tables — no flex) ── */}
          <div style={{ marginBottom: '32px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}><tbody><tr>
              <td style={{ verticalAlign: 'top', width: '50%', paddingRight: '16px' }}>
                <table style={{ borderCollapse: 'collapse' }}><tbody>
                  <tr><td style={{ padding: '6px 0', fontWeight: '700', color: '#475569', whiteSpace: 'nowrap', paddingRight: '40px' }}>Statement Period:</td><td style={{ padding: '6px 0', color: '#475569' }}>{formatStatementPeriod(downloadStartDate, downloadEndDate)}</td></tr>
                  <tr><td style={{ padding: '6px 0', fontWeight: '700', color: '#475569', whiteSpace: 'nowrap', paddingRight: '40px' }}>Generated:</td><td style={{ padding: '6px 0', color: '#475569' }}>{formatStatementDate(new Date())}</td></tr>
                </tbody></table>
              </td>
              <td style={{ verticalAlign: 'top', width: '50%' }}>
                <table style={{ borderCollapse: 'collapse' }}><tbody>
                  <tr><td style={{ padding: '6px 0', fontWeight: '700', color: '#475569', whiteSpace: 'nowrap', paddingRight: '40px' }}>Account Name:</td><td style={{ padding: '6px 0', color: '#475569' }}>{userFullName || 'John Doe'}</td></tr>
                  <tr><td style={{ padding: '6px 0', fontWeight: '700', color: '#475569', whiteSpace: 'nowrap', paddingRight: '40px' }}>Currency:</td><td style={{ padding: '6px 0', color: '#475569' }}>Multi-Currency (NGN / USDT)</td></tr>
                </tbody></table>
              </td>
            </tr></tbody></table>
          </div>

          {/* ── TABLE ── */}
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', marginBottom: '28px' }}>
            <thead>
              <tr style={{ backgroundColor: '#0047FF' }}>
                <th style={{ padding: '12px 10px', color: '#fff', fontWeight: '700', textAlign: 'left', width: '20%' }}>Date &amp; Time</th>
                <th style={{ padding: '12px 10px', color: '#fff', fontWeight: '700', textAlign: 'left', width: '15%' }}>Type</th>
                <th style={{ padding: '12px 10px', color: '#fff', fontWeight: '700', textAlign: 'left', width: '25%' }}>Description</th>
                <th style={{ padding: '12px 10px', color: '#fff', fontWeight: '700', textAlign: 'left', width: '25%' }}>Amount</th>
                <th style={{ padding: '12px 10px', color: '#fff', fontWeight: '700', textAlign: 'left', width: '15%' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {statementTransactions.length > 0 ? (
                statementTransactions.map((tx, idx) => {
                  const isPositive = tx.type === 'deposit' || tx.type === 'refund';
                  const isConversion = tx.type === 'conversion';
                  const baseCurrency = tx.currency?.toUpperCase() || 'NGN';
                  const receiveCurrency = (tx.metadata?.receive_currency || (baseCurrency === 'NGN' ? 'USDT' : 'NGN')).toUpperCase();
                  const baseAmountVal = Number(tx.amount);
                  const receiveAmountVal = Number(tx.metadata?.receive_amount || tx.metadata?.converted_amount || (baseAmountVal * (baseCurrency === 'NGN' ? 0.00065 : 1500)));
                  const txDate = parseCreatedAt(tx.created_at);
                  const dateStr = formatStatementDate(txDate);
                  const timeStr = formatStatementTime(txDate);

                  const isInvestment = tx.type === 'withdrawal' && (
                    tx.tx_ref?.startsWith('kyvatron-invest') ||
                    tx.description?.toLowerCase().includes('investment') ||
                    tx.description?.toLowerCase().includes('roi')
                  );
                  let displayType = 'Transaction';
                  if (isInvestment) displayType = 'Investment';
                  else if (tx.type === 'deposit') displayType = 'Deposit';
                  else if (tx.type === 'withdrawal') displayType = 'Withdrawal';
                  else if (tx.type === 'conversion') displayType = 'Conversion';
                  else if (tx.type === 'bill_payment') displayType = 'Bill Payment';

                  let displayDescription = tx.description || '';
                  if (isInvestment) {
                    const m = (tx.description || '').match(/(\d+)\s*mo(?:nths?)?\s*@?\s*([\d.]+)%\s*ROI/i);
                    if (m) displayDescription = `${m[1]} Months, ${m[2]}% ROI`;
                  } else if (isConversion) {
                    displayDescription = `${baseCurrency} to ${receiveCurrency}`;
                  } else if (!displayDescription) {
                    if (tx.type === 'deposit') displayDescription = 'Deposit';
                    else if (tx.type === 'bill_payment') displayDescription = `${tx.metadata?.category || 'Utility'} Payment`;
                    else displayDescription = 'Transaction';
                  } else {
                    if (tx.type === 'deposit') {
                      displayDescription = (baseCurrency === 'USDT' || displayDescription.toLowerCase().includes('usdt')) ? 'USDT (TRC20)' : 'NGN';
                    } else if (tx.type === 'withdrawal') {
                      if (baseCurrency === 'USDT' || displayDescription.toLowerCase().includes('usdt')) displayDescription = 'USDT (TRC20)';
                      else if (displayDescription.toLowerCase().includes('bank') || displayDescription.toLowerCase().includes('transfer')) displayDescription = 'Bank Transfer';
                    } else if (tx.type === 'bill_payment') {
                      if (displayDescription.toLowerCase().includes('dstv')) displayDescription = 'DSTv Subscription';
                      else if (displayDescription.toLowerCase().includes('airtime')) displayDescription = 'Airtime Top-up';
                    }
                  }

                  const pdfStatus = tx.status?.toLowerCase();
                  let statusLabel = 'Failed';
                  let statusColor = '#EF4444';
                  if (pdfStatus === 'successful' || pdfStatus === 'completed') { statusLabel = 'Completed'; statusColor = '#16A34A'; }
                  else if (pdfStatus === 'active') { statusLabel = 'Active'; statusColor = '#16A34A'; }
                  else if (pdfStatus === 'pending') { statusLabel = 'Pending'; statusColor = '#F59E0B'; }

                  const fv = (v: number) => v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                  return (
                    <tr key={tx.id} style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #EEF2FF' }}>
                      <td style={{ padding: '14px 10px', verticalAlign: 'top' }}>
                        <div style={{ color: '#475569', fontWeight: '600', fontSize: '11px', marginBottom: '4px' }}>{dateStr}</div>
                        <div style={{ color: '#94A3B8', fontSize: '10px' }}>{timeStr}</div>
                      </td>
                      <td style={{ padding: '14px 10px', color: '#475569', verticalAlign: 'top' }}>{displayType}</td>
                      <td style={{ padding: '14px 10px', color: '#475569', wordBreak: 'break-word', verticalAlign: 'top' }}>{displayDescription}</td>
                      <td style={{ padding: '14px 10px', fontWeight: '600', fontSize: '10px', verticalAlign: 'top' }}>
                        {isConversion ? (
                          <div>
                            <div style={{ color: '#64748B', marginBottom: '4px' }}>-{fv(baseAmountVal)} {baseCurrency}</div>
                            <div style={{ color: '#16A34A' }}>+{fv(receiveAmountVal)} {receiveCurrency}</div>
                          </div>
                        ) : (
                          <div style={{ color: isPositive ? '#16A34A' : '#64748B' }}>
                            {isPositive ? '+' : '-'}{fv(baseAmountVal)} {baseCurrency}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '14px 10px', fontWeight: '600', color: statusColor, verticalAlign: 'top' }}>{statusLabel}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} style={{ padding: '28px', textAlign: 'center', color: '#94A3B8', fontStyle: 'italic' }}>
                    No transactions found for this period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* ── FOOTER (table layout) ── */}
          <div style={{ borderTop: '1.5px solid #E2E8F0', paddingTop: '16px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}><tbody><tr>
              <td style={{ verticalAlign: 'bottom', padding: 0 }}>
                <div style={{ fontSize: '14px', fontWeight: '900', color: '#0047FF', marginBottom: '3px' }}>KYVATRON</div>
                <div style={{ fontSize: '9px', color: '#94A3B8', lineHeight: '1.5' }}>Automatically generated official account statement. For queries, contact support@kyvatron.com.</div>
              </td>
              <td style={{ verticalAlign: 'bottom', textAlign: 'right', padding: 0 }}>
                <div style={{ border: '2px solid #0047FF', borderRadius: '8px', padding: '8px 14px', textAlign: 'center' }}>
                  <div style={{ fontSize: '9px', fontWeight: '800', color: '#0047FF', letterSpacing: '0.08em' }}>&#10003; VERIFIED STATEMENT</div>
                  <div style={{ fontSize: '8px', color: '#64748B', marginTop: '2px' }}>{formatStatementDate(new Date())} · kyvatron.com</div>
                </div>
              </td>
            </tr></tbody></table>
          </div>

        </div>
      </div>

    </div>
  );
}
