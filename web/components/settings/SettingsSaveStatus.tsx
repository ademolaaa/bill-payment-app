import React from 'react';

export type SaveState = 'idle' | 'saving' | 'saved' | 'error';

interface SettingsSaveStatusProps {
  state: SaveState;
}

export const SettingsSaveStatus = ({ state }: SettingsSaveStatusProps) => {
  if (state === 'idle') return null;

  const config = {
    saving: {
      bg: 'bg-blue-50 dark:bg-blue-900/10',
      border: 'border-blue-100 dark:border-blue-900/20',
      text: 'text-blue-600 dark:text-blue-400',
      label: 'Saving changes...',
      icon: (
        <svg className="animate-spin h-3.5 w-3.5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )
    },
    saved: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/20',
      border: 'border-emerald-100 dark:border-emerald-900/30',
      text: 'text-emerald-600 dark:text-emerald-400',
      label: 'All changes saved',
      icon: (
        <svg className="h-3.5 w-3.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      )
    },
    error: {
      bg: 'bg-red-50 dark:bg-red-950/20',
      border: 'border-red-100 dark:border-red-900/30',
      text: 'text-red-600 dark:text-red-400',
      label: 'Failed to save changes',
      icon: (
        <svg className="h-3.5 w-3.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      )
    }
  }[state];

  return (
    <div className={`inline-flex items-center px-3 py-1.5 rounded-full border text-xs font-bold transition-all duration-300 animate-fadeIn ${config.bg} ${config.border} ${config.text}`}>
      {config.icon}
      <span>{config.label}</span>
    </div>
  );
};
