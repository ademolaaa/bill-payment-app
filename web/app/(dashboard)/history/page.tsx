'use client';

import React, { useState } from 'react';
import Link from 'next/link';

const mockTransactions = [
  { id: '1', type: 'Deposit', subtype: 'USDT (TRC20)', amount: '+1,250.75 USDT', date: 'May 28, 2024 • 10:35 AM', isPositive: true },
  { id: '2', type: 'Withdrawal', subtype: 'Bank Transfer', amount: '-50,000.00 NGN', date: 'May 27, 2024 • 4:20 PM', isPositive: false },
  { id: '3', type: 'Withdrawal', subtype: 'To: John Doe', amount: '-1,500.00 USDT', date: 'May 27, 2024 • 11:15 AM', isPositive: false },
  { id: '4', type: 'Deposit', subtype: 'NGN', amount: '+25,000.00 NGN', date: 'May 26, 2024 • 9:10 AM', isPositive: true },
  { id: '5', type: 'Withdrawal', subtype: 'USDT (TRC20)', amount: '-200.00 USDT', date: 'May 25, 2024 • 6:45 PM', isPositive: false },
];

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
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13l-3 3m0 0l-3-3m3 3V8m0 13a9 9 0 110-18 9 9 0 010-18z" />
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
  
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [selectedType, setSelectedType] = useState('All Transactions');

  const handleTimeSelect = (option: string) => {
    if (option === 'Custom Date Range') {
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
          onClick={() => setShowDownloadCalendar(true)}
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
        <div className="divide-y divide-gray-100 dark:divide-slate-800">
          {mockTransactions.map((tx) => (
            <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
              <div className="flex items-center space-x-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${tx.isPositive ? 'bg-[#16A34A]' : 'bg-[#0047FF]'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={tx.isPositive ? "M5 10l7-7m0 0l7 7m-7-7v18" : "M19 14l-7 7m0 0l-7-7m7 7V3"} />
                  </svg>
                </div>
                <div>
                  <h4 className="text-[15px] font-bold text-[#0F172A] dark:text-white mb-0.5">{tx.type}</h4>
                  <p className="text-[13px] text-[#475569] dark:text-slate-400 mb-0.5">{tx.subtype}</p>
                  <p className="text-[11px] text-[#64748B] dark:text-slate-500">{tx.date}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="text-right flex flex-col items-end">
                  <p className={`text-[15px] font-bold mb-1 ${tx.isPositive ? 'text-[#16A34A]' : 'text-[#0F172A] dark:text-white'}`}>{tx.amount}</p>
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${tx.isPositive ? 'bg-[#DCFCE7] text-[#16A34A]' : 'bg-[#FEE2E2] text-[#EF4444]'}`}>Completed</span>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center text-[#64748B] text-[13px] font-medium">
        No more transactions
      </div>

      {/* Calendar Overlay */}
      {showCalendar && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4 sm:p-0">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-5 shadow-2xl relative animate-in slide-in-from-bottom-10 fade-in">
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
                <div className="border border-gray-200 dark:border-slate-800 rounded-xl p-3 flex items-center space-x-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-[14px] text-[#0F172A] dark:text-white font-medium whitespace-nowrap">May 1, 2024</span>
                </div>
              </div>
              <div className="pt-5 text-gray-400 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
              <div className="flex-1">
                <label className="text-[12px] text-[#64748B] mb-1 block font-medium">To</label>
                <div className="border border-blue-500 rounded-xl p-3 flex items-center space-x-2 ring-1 ring-blue-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-[14px] text-[#0F172A] dark:text-white font-medium whitespace-nowrap">May 28, 2024</span>
                </div>
              </div>
            </div>

            {/* Mock Calendar Grid */}
            <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-8">
              {/* May 2024 */}
              <div>
                <div className="flex justify-between items-center mb-4 px-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span className="text-[12px] sm:text-[13px] font-bold text-[#0F172A] dark:text-white">May 2024</span>
                  <div className="w-4" /> {/* Spacer */}
                </div>
                <div className="grid grid-cols-7 gap-y-2 gap-x-0 sm:gap-x-1 text-center text-[10px] sm:text-[11px]">
                  {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => <span key={d} className="text-gray-400 font-medium">{d}</span>)}
                  <span className="text-gray-300">28</span><span className="text-gray-300">29</span><span className="text-gray-300">30</span>
                  <div className="relative z-10"><div className="absolute inset-y-0 right-0 left-1/2 bg-blue-50 dark:bg-blue-900/20 -z-10"></div><span className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center bg-[#0047FF] text-white rounded-full mx-auto">1</span></div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 text-[#0F172A] dark:text-white flex items-center justify-center">2</div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 text-[#0F172A] dark:text-white flex items-center justify-center">3</div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 text-[#0F172A] dark:text-white flex items-center justify-center rounded-r-lg">4</div>
                  
                  <div className="bg-blue-50 dark:bg-blue-900/20 text-[#0F172A] dark:text-white flex items-center justify-center rounded-l-lg py-1">5</div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 text-[#0F172A] dark:text-white flex items-center justify-center py-1">6</div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 text-[#0F172A] dark:text-white flex items-center justify-center py-1">7</div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 text-[#0F172A] dark:text-white flex items-center justify-center py-1">8</div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 text-[#0F172A] dark:text-white flex items-center justify-center py-1">9</div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 text-[#0F172A] dark:text-white flex items-center justify-center py-1">10</div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 text-[#0F172A] dark:text-white flex items-center justify-center py-1 rounded-r-lg">11</div>
                  
                  <div className="bg-blue-50 dark:bg-blue-900/20 text-[#0F172A] dark:text-white flex items-center justify-center rounded-l-lg py-1">12</div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 text-[#0F172A] dark:text-white flex items-center justify-center py-1">13</div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 text-[#0F172A] dark:text-white flex items-center justify-center py-1">14</div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 text-[#0F172A] dark:text-white flex items-center justify-center py-1">15</div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 text-[#0F172A] dark:text-white flex items-center justify-center py-1">16</div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 text-[#0F172A] dark:text-white flex items-center justify-center py-1">17</div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 text-[#0F172A] dark:text-white flex items-center justify-center py-1 rounded-r-lg">18</div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 text-[#0F172A] dark:text-white flex items-center justify-center rounded-l-lg py-1">19</div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 text-[#0F172A] dark:text-white flex items-center justify-center py-1">20</div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 text-[#0F172A] dark:text-white flex items-center justify-center py-1">21</div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 text-[#0F172A] dark:text-white flex items-center justify-center py-1">22</div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 text-[#0F172A] dark:text-white flex items-center justify-center py-1">23</div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 text-[#0F172A] dark:text-white flex items-center justify-center py-1">24</div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 text-[#0F172A] dark:text-white flex items-center justify-center py-1 rounded-r-lg">25</div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 text-[#0F172A] dark:text-white flex items-center justify-center rounded-l-lg py-1">26</div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 text-[#0F172A] dark:text-white flex items-center justify-center py-1">27</div>
                  <div className="relative z-10 py-1"><div className="absolute inset-y-0 left-0 right-1/2 bg-blue-50 dark:bg-blue-900/20 -z-10"></div><span className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center bg-[#0047FF] text-white rounded-full mx-auto">28</span></div>
                  <span className="text-[#0F172A] dark:text-white py-1">29</span>
                  <span className="text-[#0F172A] dark:text-white py-1">30</span>
                  <span className="text-[#0F172A] dark:text-white py-1">31</span>
                  <span className="text-gray-300 py-1">1</span>
                </div>
              </div>
              
              {/* June 2024 */}
              <div>
                <div className="flex justify-between items-center mb-4 px-1">
                  <div className="w-4" /> {/* Spacer */}
                  <span className="text-[12px] sm:text-[13px] font-bold text-[#0F172A] dark:text-white">June 2024</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#0F172A] dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                <div className="grid grid-cols-7 gap-y-2 gap-x-0 sm:gap-x-1 text-center text-[10px] sm:text-[11px]">
                  {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => <span key={d} className="text-gray-400 font-medium">{d}</span>)}
                  <span className="text-gray-300 py-1">26</span><span className="text-gray-300 py-1">27</span><span className="text-gray-300 py-1">28</span><span className="text-gray-300 py-1">29</span><span className="text-gray-300 py-1">30</span><span className="text-gray-300 py-1">31</span>
                  <span className="text-[#0F172A] dark:text-white py-1">1</span>
                  
                  <span className="text-[#0F172A] dark:text-white py-1">2</span><span className="text-[#0F172A] dark:text-white py-1">3</span><span className="text-[#0F172A] dark:text-white py-1">4</span><span className="text-[#0F172A] dark:text-white py-1">5</span><span className="text-[#0F172A] dark:text-white py-1">6</span><span className="text-[#0F172A] dark:text-white py-1">7</span><span className="text-[#0F172A] dark:text-white py-1">8</span>
                  <span className="text-[#0F172A] dark:text-white py-1">9</span><span className="text-[#0F172A] dark:text-white py-1">10</span><span className="text-[#0F172A] dark:text-white py-1">11</span><span className="text-[#0F172A] dark:text-white py-1">12</span><span className="text-[#0F172A] dark:text-white py-1">13</span><span className="text-[#0F172A] dark:text-white py-1">14</span><span className="text-[#0F172A] dark:text-white py-1">15</span>
                  <span className="text-[#0F172A] dark:text-white py-1">16</span><span className="text-[#0F172A] dark:text-white py-1">17</span><span className="text-[#0F172A] dark:text-white py-1">18</span><span className="text-[#0F172A] dark:text-white py-1">19</span><span className="text-[#0F172A] dark:text-white py-1">20</span><span className="text-[#0F172A] dark:text-white py-1">21</span><span className="text-[#0F172A] dark:text-white py-1">22</span>
                  <span className="text-[#0F172A] dark:text-white py-1">23</span><span className="text-[#0F172A] dark:text-white py-1">24</span><span className="text-[#0F172A] dark:text-white py-1">25</span><span className="text-[#0F172A] dark:text-white py-1">26</span><span className="text-[#0F172A] dark:text-white py-1">27</span><span className="text-[#0F172A] dark:text-white py-1">28</span><span className="text-[#0F172A] dark:text-white py-1">29</span>
                  <span className="text-gray-900 dark:text-white font-bold py-1">30</span><span className="text-gray-300 py-1">1</span><span className="text-gray-300 py-1">2</span><span className="text-gray-300 py-1">3</span><span className="text-gray-300 py-1">4</span><span className="text-gray-300 py-1">5</span><span className="text-gray-300 py-1">6</span>
                </div>
              </div>
            </div>

            <button 
              onClick={() => {
                setSelectedTime('May 1 - May 28');
                setShowCalendar(false);
              }}
              className="w-full bg-[#0047FF] hover:bg-blue-700 text-white font-bold py-3.5 rounded-2xl transition-colors text-[15px]"
            >
              Apply
            </button>
          </div>
        </div>
      )}

      {/* Download Statement Calendar Overlay */}
      {showDownloadCalendar && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 pt-3 shadow-2xl relative animate-in slide-in-from-bottom-10 fade-in">
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
                <div className="border border-blue-200 dark:border-blue-900 rounded-xl p-3 flex items-center space-x-2 bg-white dark:bg-slate-900">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-[14px] text-[#0F172A] dark:text-white font-medium whitespace-nowrap">May 1, 2024</span>
                </div>
              </div>
              <div className="pt-5 text-gray-400 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
              <div className="flex-1">
                <label className="text-[12px] text-[#64748B] mb-1 block font-medium">To</label>
                <div className="border border-gray-200 dark:border-slate-800 rounded-xl p-3 flex items-center space-x-2 bg-white dark:bg-slate-900">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-[14px] text-[#0F172A] dark:text-white font-medium whitespace-nowrap">May 28, 2024</span>
                </div>
              </div>
            </div>

            {/* Mock Calendar Grid */}
            <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-8">
              {/* May 2024 */}
              <div>
                <div className="flex justify-between items-center mb-4 px-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span className="text-[12px] sm:text-[13px] font-bold text-[#0F172A] dark:text-white">May 2024</span>
                  <div className="w-4" /> {/* Spacer */}
                </div>
                <div className="grid grid-cols-7 gap-y-2 gap-x-0 sm:gap-x-1 text-center text-[10px] sm:text-[11px]">
                  {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => <span key={d} className="text-gray-400 font-medium">{d}</span>)}
                  <span className="text-gray-300">28</span><span className="text-gray-300">29</span><span className="text-gray-300">30</span>
                  <div className="relative z-10"><div className="absolute inset-y-0 right-0 left-1/2 bg-blue-50 dark:bg-blue-900/20 -z-10"></div><span className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center bg-[#0047FF] text-white rounded-full mx-auto">1</span></div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 text-[#0F172A] dark:text-white flex items-center justify-center">2</div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 text-[#0F172A] dark:text-white flex items-center justify-center">3</div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 text-[#0F172A] dark:text-white flex items-center justify-center rounded-r-lg">4</div>
                  
                  <div className="bg-blue-50 dark:bg-blue-900/20 text-[#0F172A] dark:text-white flex items-center justify-center rounded-l-lg py-1">5</div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 text-[#0F172A] dark:text-white flex items-center justify-center py-1">6</div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 text-[#0F172A] dark:text-white flex items-center justify-center py-1">7</div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 text-[#0F172A] dark:text-white flex items-center justify-center py-1">8</div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 text-[#0F172A] dark:text-white flex items-center justify-center py-1">9</div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 text-[#0F172A] dark:text-white flex items-center justify-center py-1">10</div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 text-[#0F172A] dark:text-white flex items-center justify-center py-1 rounded-r-lg">11</div>
                  
                  <div className="bg-blue-50 dark:bg-blue-900/20 text-[#0F172A] dark:text-white flex items-center justify-center rounded-l-lg py-1">12</div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 text-[#0F172A] dark:text-white flex items-center justify-center py-1">13</div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 text-[#0F172A] dark:text-white flex items-center justify-center py-1">14</div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 text-[#0F172A] dark:text-white flex items-center justify-center py-1">15</div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 text-[#0F172A] dark:text-white flex items-center justify-center py-1">16</div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 text-[#0F172A] dark:text-white flex items-center justify-center py-1">17</div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 text-[#0F172A] dark:text-white flex items-center justify-center py-1 rounded-r-lg">18</div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 text-[#0F172A] dark:text-white flex items-center justify-center rounded-l-lg py-1">19</div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 text-[#0F172A] dark:text-white flex items-center justify-center py-1">20</div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 text-[#0F172A] dark:text-white flex items-center justify-center py-1">21</div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 text-[#0F172A] dark:text-white flex items-center justify-center py-1">22</div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 text-[#0F172A] dark:text-white flex items-center justify-center py-1">23</div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 text-[#0F172A] dark:text-white flex items-center justify-center py-1">24</div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 text-[#0F172A] dark:text-white flex items-center justify-center py-1 rounded-r-lg">25</div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 text-[#0F172A] dark:text-white flex items-center justify-center rounded-l-lg py-1">26</div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 text-[#0F172A] dark:text-white flex items-center justify-center py-1">27</div>
                  <div className="relative z-10 py-1"><div className="absolute inset-y-0 left-0 right-1/2 bg-blue-50 dark:bg-blue-900/20 -z-10"></div><span className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center bg-[#0047FF] text-white rounded-full mx-auto">28</span></div>
                  <span className="text-[#0F172A] dark:text-white py-1">29</span>
                  <span className="text-[#0F172A] dark:text-white py-1">30</span>
                  <span className="text-[#0F172A] dark:text-white py-1">31</span>
                  <span className="text-gray-300 py-1">1</span>
                </div>
              </div>
              
              {/* June 2024 */}
              <div>
                <div className="flex justify-between items-center mb-4 px-1">
                  <div className="w-4" /> {/* Spacer */}
                  <span className="text-[12px] sm:text-[13px] font-bold text-[#0F172A] dark:text-white">June 2024</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#0F172A] dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                <div className="grid grid-cols-7 gap-y-2 gap-x-0 sm:gap-x-1 text-center text-[10px] sm:text-[11px]">
                  {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => <span key={d} className="text-gray-400 font-medium">{d}</span>)}
                  <span className="text-gray-300 py-1">26</span><span className="text-gray-300 py-1">27</span><span className="text-gray-300 py-1">28</span><span className="text-gray-300 py-1">29</span><span className="text-gray-300 py-1">30</span><span className="text-gray-300 py-1">31</span>
                  <span className="text-[#0F172A] dark:text-white py-1">1</span>
                  
                  <span className="text-[#0F172A] dark:text-white py-1">2</span><span className="text-[#0F172A] dark:text-white py-1">3</span><span className="text-[#0F172A] dark:text-white py-1">4</span><span className="text-[#0F172A] dark:text-white py-1">5</span><span className="text-[#0F172A] dark:text-white py-1">6</span><span className="text-[#0F172A] dark:text-white py-1">7</span><span className="text-[#0F172A] dark:text-white py-1">8</span>
                  <span className="text-[#0F172A] dark:text-white py-1">9</span><span className="text-[#0F172A] dark:text-white py-1">10</span><span className="text-[#0F172A] dark:text-white py-1">11</span><span className="text-[#0F172A] dark:text-white py-1">12</span><span className="text-[#0F172A] dark:text-white py-1">13</span><span className="text-[#0F172A] dark:text-white py-1">14</span><span className="text-[#0F172A] dark:text-white py-1">15</span>
                  <span className="text-[#0F172A] dark:text-white py-1">16</span><span className="text-[#0F172A] dark:text-white py-1">17</span><span className="text-[#0F172A] dark:text-white py-1">18</span><span className="text-[#0F172A] dark:text-white py-1">19</span><span className="text-[#0F172A] dark:text-white py-1">20</span><span className="text-[#0F172A] dark:text-white py-1">21</span><span className="text-[#0F172A] dark:text-white py-1">22</span>
                  <span className="text-[#0F172A] dark:text-white py-1">23</span><span className="text-[#0F172A] dark:text-white py-1">24</span><span className="text-[#0F172A] dark:text-white py-1">25</span><span className="text-[#0F172A] dark:text-white py-1">26</span><span className="text-[#0F172A] dark:text-white py-1">27</span><span className="text-[#0F172A] dark:text-white py-1">28</span><span className="text-[#0F172A] dark:text-white py-1">29</span>
                  <span className="text-gray-900 dark:text-white font-bold py-1">30</span><span className="text-gray-300 py-1">1</span><span className="text-gray-300 py-1">2</span><span className="text-gray-300 py-1">3</span><span className="text-gray-300 py-1">4</span><span className="text-gray-300 py-1">5</span><span className="text-gray-300 py-1">6</span>
                </div>
              </div>
            </div>

            <button 
              onClick={() => {
                setShowDownloadCalendar(false);
                // Here we'd actually trigger a download or logic
                alert('Statement downloaded successfully!');
              }}
              className="w-full bg-[#0047FF] hover:bg-blue-700 text-white font-bold py-3.5 rounded-2xl transition-colors text-[15px]"
            >
              Download Statement
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

