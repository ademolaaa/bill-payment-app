'use client';

import React from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';

// ── Toggle Switch Component ───────────────────────────────────────────────────
function Toggle({ active, onToggle }: { active: boolean; onToggle: () => void }) {
  return (
    <button
      role="switch"
      title="Toggle theme"
      aria-checked={active ? 'true' : 'false'}
      onClick={onToggle}
      className={`relative inline-flex h-[31px] w-[51px] flex-shrink-0 items-center rounded-full transition-colors duration-300 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
        active ? 'bg-blue-600' : 'bg-gray-200'
      }`}
    >
      <span
        className={`inline-block h-[27px] w-[27px] transform rounded-full bg-white shadow-md ring-0 transition-transform duration-300 ease-in-out ${
          active ? 'translate-x-[22px]' : 'translate-x-[2px]'
        }`}
      />
    </button>
  );
}

// ── Theme Row ─────────────────────────────────────────────────────────────────
function ThemeRow({
  label,
  sublabel,
  icon,
  active,
  onToggle,
}: {
  label: string;
  sublabel: string;
  icon: React.ReactNode;
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={`flex items-center justify-between px-5 py-4 bg-white dark:bg-slate-900 rounded-2xl border transition-all duration-200 ${
        active ? 'border-blue-200 dark:border-blue-800 shadow-sm shadow-blue-50 dark:shadow-blue-950' : 'border-gray-100 dark:border-slate-800'
      }`}
    >
      <div className="flex items-center space-x-4">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-200 ${
          active ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400' : 'bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-500'
        }`}>
          {icon}
        </div>
        <div>
          <p className={`text-[16px] font-semibold transition-colors duration-200 ${active ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-slate-400'}`}>
            {label}
          </p>
          <p className="text-[12px] text-gray-600 dark:text-slate-700 mt-0.5">{sublabel}</p>
        </div>
      </div>
      <Toggle active={active} onToggle={onToggle} />
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
type Theme = 'light' | 'dark';

export default function ThemeSettingsPage() {
  const { theme, setTheme } = useTheme();
  const activeTheme = (theme === 'dark' ? 'dark' : 'light') as 'light' | 'dark';

  return (
    <div className="flex flex-col p-5 pt-12 min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">

      {/* Back navigation */}
      <div className="flex items-center mb-8 space-x-3">
        <Link
          href="/profile"
          className="w-9 h-9 rounded-full bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 shadow-sm flex items-center justify-center text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition"
          aria-label="Go back"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Theme Settings</h1>
      </div>

      {/* Toggle rows */}
      <div className="flex flex-col space-y-3 mb-8">
        <ThemeRow
          label="Light Mode"
          sublabel="Clean white interface"
          active={activeTheme === 'light'}
          onToggle={() => setTheme('light')}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
            </svg>
          }
        />

        <ThemeRow
          label="Dark Mode"
          sublabel="Easier on the eyes at night"
          active={activeTheme === 'dark'}
          onToggle={() => setTheme('dark')}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          }
        />
      </div>



      {/* Current theme indicator */}
      <div className="mt-auto pt-8 text-center">
        <p className="text-[13px] text-gray-600 dark:text-slate-700">
          Currently using{' '}
          <span className="font-semibold text-gray-600 dark:text-slate-300 capitalize">{activeTheme} Mode</span>
        </p>
      </div>
    </div>
  );
}
