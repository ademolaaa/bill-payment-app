'use client';

import React from 'react';
import Link from 'next/link';

const SOCIAL_LINKS = [
  { name: 'Instagram', handle: 'kyvatronhq', url: '#', showArrow: true, icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg> },
  { name: 'Facebook', handle: 'Kyvatron', url: '#', showArrow: true, icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg> },
  { name: 'X', handle: 'Kyvatron', url: '#', showArrow: true, icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="4" x2="20" y2="20"></line><line x1="20" y1="4" x2="4" y2="20"></line></svg> },
  { name: 'Whatsapp', handle: '+2349150728340', url: '#', showArrow: false, icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg> },
  { name: 'Email', handle: 'support@kyvatron.com', url: '#', showArrow: false, icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg> },
  { name: 'Website', handle: 'Kyvatron.com', url: '#', showArrow: false, icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg> },
];

export default function SupportPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-slate-900 relative pb-24">
      {/* Header */}
      <header className="px-5 pt-12 pb-4">
        <h1 className="text-[26px] font-bold text-[#1f2937]">Support</h1>
      </header>

      <div className="px-5">
        <p className="text-[15px] text-[#4b5563] leading-relaxed mb-6 pe-4">
          For further inquiries, feel free to reach out to our support team via our support channels below.
        </p>
        
        {/* Social Links List */}
        <div className="border-t border-gray-100">
          {SOCIAL_LINKS.map((link, index) => (
            <a key={link.name} href={link.url} className={`flex items-center py-[18px] ${index !== SOCIAL_LINKS.length - 1 ? 'border-b border-gray-100' : ''}`}>
              <div className="w-[34px] h-[34px] rounded-lg bg-[#f8fafc] flex items-center justify-center text-[#4b5563] mr-4 flex-shrink-0">
                {link.icon}
              </div>
              <span className="text-[17px] font-semibold text-black flex-grow">{link.name}</span>
              
              <div className="flex items-center text-gray-700 dark:text-slate-600">
                <span className="text-[15px]">{link.handle}</span>
                {link.showArrow && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-[18px] w-[18px] ml-1.5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
