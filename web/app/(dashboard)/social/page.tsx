'use client';

import React from 'react';
import Link from 'next/link';

const SOCIAL_LINKS = [
  { name: 'Instagram', handle: '@kyvatronhq', url: '#', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg> },
  { name: 'Facebook', handle: 'Kyvatron', url: '#', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg> },
  { name: 'X', handle: '@Kyvatron', url: '#', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="4" x2="20" y2="20"></line><line x1="20" y1="4" x2="4" y2="20"></line></svg> },
  { name: 'Whatsapp', handle: '+234 915 072 8340', url: '#', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg> },
  { name: 'Email', handle: 'support@kyvatron.com', url: '#', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg> },
  { name: 'Website', handle: 'kyvatron.com', url: '#', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg> },
];

export default function SocialPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 relative pb-24">
      <header className="p-4 pt-10 flex items-center justify-between border-b border-gray-100 bg-white dark:bg-slate-900 shadow-sm relative z-10">
        <Link href="/support" className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:bg-slate-800 transition-colors cursor-pointer">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-800 dark:text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </Link>
        <h1 className="text-lg font-bold text-gray-900 dark:text-white absolute left-1/2 transform -translate-x-1/2">Social Channels</h1>
        <div className="w-8"></div>
      </header>

      <div className="flex-grow p-4 mt-2">
        <section className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          {SOCIAL_LINKS.map((link, index) => (
            <a key={link.name} href={link.url} className={`flex items-center p-4 hover:bg-gray-50 transition-colors ${index !== SOCIAL_LINKS.length - 1 ? 'border-b border-gray-50' : ''}`}>
              <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-100 flex items-center justify-center text-gray-600 mr-4">
                {link.icon}
              </div>
              <span className="text-[16px] font-semibold text-gray-900 dark:text-white flex-grow">{link.name}</span>
              <span className="text-[14px] text-gray-500 dark:text-slate-400">{link.handle}</span>
            </a>
          ))}
        </section>
      </div>
    </div>
  );
}
