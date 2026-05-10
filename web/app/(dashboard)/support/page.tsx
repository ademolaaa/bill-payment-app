'use client';

import React from 'react';
import Link from 'next/link';

const SOCIAL_LINKS = [
  { 
    name: 'Instagram', 
    handle: 'kyvatronhq', 
    url: 'https://instagram.com/kyvatronhq', 
    handleColor: 'text-[#8B5CF6]',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2" width="28" height="28" rx="8" fill="url(#paint0_linear_insta)"/>
        <path d="M21 16C21 18.7614 18.7614 21 16 21C13.2386 21 11 18.7614 11 16C11 13.2386 13.2386 11 16 11C18.7614 11 21 13.2386 21 16Z" stroke="white" strokeWidth="2.5"/>
        <rect x="7" y="7" width="18" height="18" rx="5" stroke="white" strokeWidth="2.5"/>
        <circle cx="21.5" cy="10.5" r="1.5" fill="white"/>
        <defs>
          <linearGradient id="paint0_linear_insta" x1="2" y1="30" x2="30" y2="2" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F58529"/>
            <stop offset="0.25" stopColor="#FEDA77"/>
            <stop offset="0.5" stopColor="#DD2A7B"/>
            <stop offset="0.75" stopColor="#8134AF"/>
            <stop offset="1" stopColor="#515BD4"/>
          </linearGradient>
        </defs>
      </svg>
    )
  },
  { 
    name: 'Facebook', 
    handle: 'Kyvatron', 
    url: 'https://facebook.com/kyvatron', 
    handleColor: 'text-[#0047FF]',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="32" height="32" rx="16" fill="#1877F2"/>
        <path d="M21.1402 16L21.9056 11.0142H17.106V7.7781C17.106 6.4116 17.7845 5.0772 19.9298 5.0772H22.1287V0.8252C22.1287 0.8252 20.1337 0.4839 18.2435 0.4839C14.2497 0.4839 11.621 2.9238 11.621 7.2917V11.0142H7.2285V16H11.621V28.0583C12.5117 28.199 13.424 28.2721 14.3635 28.2721C15.2831 28.2721 16.208 28.1969 17.106 28.0514V16H21.1402Z" fill="white"/>
      </svg>
    )
  },
  { 
    name: 'X', 
    handle: 'Kyvatron', 
    url: 'https://X.com/kyvatron', 
    handleColor: 'text-[#1F2937] dark:text-slate-400',
    icon: (
      <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865l8.875 11.633Z"/></svg>
      </div>
    )
  },
  { 
    name: 'Whatsapp', 
    handle: '+2349150728340', 
    url: 'https://wa.me/+2349150728340', 
    handleColor: 'text-[#16A34A]',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="32" height="32" rx="16" fill="#25D366"/>
        <path d="M16.0354 7C11.135 7 7.15939 10.9753 7.15939 15.8753C7.15939 17.8209 7.78536 19.6209 8.84093 21.0965L7.69741 24.9658L11.7554 23.8671C13.1251 24.7397 14.7329 25.2443 16.4429 25.2443C21.3434 25.2443 25.319 21.269 25.319 16.3686C25.319 11.4682 21.3434 7.4929 16.4429 7.4929H16.0354ZM16.0354 8.5131H16.4429C20.78 8.5131 24.2988 12.0319 24.2988 16.369C24.2988 20.7062 20.78 24.225 16.4429 24.225C14.8198 24.225 13.3106 23.7335 12.0628 22.8988L11.7161 22.6738L8.68112 23.4951L9.54476 20.613L9.30909 20.2558C8.36154 18.966 7.82006 17.3826 7.82006 15.8753C7.82006 11.5381 11.3388 8.0193 15.676 8.0193H16.0354ZM12.2155 11.4746C12.011 11.4746 11.7042 11.5513 11.4485 11.8324C11.1927 12.1136 10.4764 12.7786 10.4764 14.1345C10.4764 15.4904 11.4741 16.8143 11.6277 17.0189C11.7812 17.2235 13.5654 20.1404 16.4172 21.2589C18.7845 22.1873 19.3475 21.9961 19.9105 21.9195C20.4735 21.8428 21.7271 21.1523 21.983 20.4105C22.2388 19.6687 22.2388 19.0292 22.162 18.8758C22.0853 18.7224 21.8294 18.6202 21.4457 18.4285C21.0619 18.2367 19.1687 17.3031 18.8105 17.1752C18.4523 17.0474 18.1965 16.9962 17.9407 17.3799C17.6848 17.7636 16.9429 18.6202 16.7126 18.8758C16.4824 19.1315 16.2522 19.1571 15.8684 18.9654C15.4847 18.7736 14.0772 18.3144 12.4143 16.8291C11.1166 15.6698 10.2464 14.2492 10.0162 13.8655C9.78593 13.4817 9.99047 13.2771 10.1822 13.0854C10.3615 12.9061 10.5661 12.6504 10.7706 12.4202C10.9752 12.19 11.0519 12.011 11.2054 11.7297C11.3589 11.4485 11.2821 11.2183 11.1798 11.0265C11.0775 10.8348 10.2078 8.6865 9.8496 7.7915C9.5034 6.9208 9.1458 7.0232 8.9155 7.0232C8.711 7.0232 8.4552 7.0097 8.1994 7.0097V11.4746H12.2155Z" fill="white"/>
      </svg>
    )
  },
  { 
    name: 'Email', 
    handle: 'support@kyvatron.com', 
    url: 'mailto:support@kyvatron.com', 
    handleColor: 'text-[#0047FF]',
    icon: (
      <div className="w-8 h-8 bg-[#0047FF] rounded-xl flex items-center justify-center text-white">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
      </div>
    )
  },
  { 
    name: 'Website', 
    handle: 'Kyvatron.com', 
    url: 'https://kyvatron.com', 
    handleColor: 'text-[#8B5CF6]',
    icon: (
      <div className="w-8 h-8 bg-[#F3E8FF] rounded-xl flex items-center justify-center text-[#8B5CF6]">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
      </div>
    )
  },
];

export default function SupportPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-slate-900 relative pb-24">
      {/* Header */}
      <header className="px-5 pt-12 pb-4 flex items-center mb-2">
        <Link href="/home" className="mr-4 p-2.5 bg-gray-50 dark:bg-slate-800 rounded-full text-gray-900 dark:text-slate-200">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
      </header>

      <div className="px-5">
        <h1 className="text-[28px] font-bold text-[#0F172A] dark:text-white mb-2">Support</h1>
        <p className="text-[14px] text-[#64748B] dark:text-slate-400 leading-relaxed mb-8 pe-4">
          For further inquiries, feel free to reach out to our support team via our support channels below.
        </p>
        
        {/* Social Links List */}
        <div className="flex flex-col space-y-3">
          {SOCIAL_LINKS.map((link) => (
            <a 
              key={link.name} 
              href={link.url}
              target="_blank"
              rel="noopener noreferrer" 
              className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center">
                <div className="mr-4 flex-shrink-0">
                  {link.icon}
                </div>
                <span className="text-[16px] font-bold text-[#0F172A] dark:text-white">{link.name}</span>
              </div>
              
              <div className="flex items-center">
                <span className={`text-[14px] ${link.handleColor}`}>{link.handle}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-[18px] w-[18px] ml-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
