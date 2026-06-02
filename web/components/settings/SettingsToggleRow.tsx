import React from 'react';

interface SettingsToggleRowProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  isEnabled: boolean;
  onToggle: () => void;
  isLoading?: boolean;
  isDisabled?: boolean;
}

export const SettingsToggleRow = ({
  icon,
  title,
  description,
  isEnabled,
  onToggle,
  isLoading = false,
  isDisabled = false
}: SettingsToggleRowProps) => {
  const switchId = `switch-${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
  const descId = `desc-${switchId}`;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (!isDisabled && !isLoading) {
        onToggle();
      }
    }
  };

  return (
    <div className="flex items-center justify-between py-4 group select-none">
      <div className="flex items-center space-x-4 flex-grow mr-4">
        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/10 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-transform duration-200 flex-shrink-0">
          {icon}
        </div>
        <div>
          <h4 id={switchId} className="text-[15px] font-bold text-gray-900 dark:text-white mb-0.5">
            {title}
          </h4>
          <p id={descId} className="text-[12px] text-gray-500 dark:text-slate-400 leading-snug max-w-xs md:max-w-md">
            {description}
          </p>
        </div>
      </div>
      <button
        role="switch"
        aria-checked={isEnabled}
        aria-labelledby={switchId}
        aria-describedby={descId}
        disabled={isDisabled || isLoading}
        onClick={onToggle}
        onKeyDown={handleKeyDown}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 duration-300 ${
          isEnabled 
            ? 'bg-blue-600 dark:bg-blue-500' 
            : 'bg-gray-200 dark:bg-slate-700'
        } ${isDisabled || isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <span
          className={`relative flex h-4 w-4 transform items-center justify-center rounded-full bg-white shadow-md transition-all duration-300 ${
            isEnabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        >
          {isLoading && (
            <svg className="animate-spin h-2.5 w-2.5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          )}
        </span>
      </button>
    </div>
  );
};
