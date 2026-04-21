'use client';

import React from 'react';
import Link from 'next/link';

export default function MenuPage() {
  const menuItems = [
    { label: 'Home', href: '/home' },
    { label: 'Deposit', href: '/deposit' },
    { label: 'Pay Bills', href: '/pay-bills' },
    { label: 'Transfer', href: '/transfer' },
    { label: 'Withdraw', href: '/withdraw' },
    { label: 'Investments', href: '/investments' },
    { label: 'Transaction History', href: '/history' },
    { label: 'Profile', href: '/profile' },
    { label: 'Settings', href: '/settings' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white pb-24">
      <header className="px-5 pt-12 pb-4 border-b border-gray-100">
        <h1 className="text-[28px] font-bold text-gray-900">Menu</h1>
      </header>

      <div className="px-5 pt-6">
        <ul className="space-y-1">
          {menuItems.map((item, index) => (
            <li key={index}>
              <Link href={item.href} className="block py-4 text-[17px] font-medium text-gray-800 border-b border-gray-50 hover:text-blue-600 transition-colors">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
