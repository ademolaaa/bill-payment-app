import React, { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  iconLeft,
  iconRight,
  error,
  className = '',
  ...props
}) => {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-[#0F172A] dark:text-slate-200 text-[14px] font-bold mb-1.5 ml-1">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {iconLeft && (
          <div className="absolute left-4 z-10 text-gray-400">
             {iconLeft}
          </div>
        )}
        <input
          className={`w-full h-[52px] bg-white dark:bg-slate-900 border rounded-[12px] text-[15px] text-[#0F172A] dark:text-white placeholder-[#94A3B8] focus:outline-none focus:ring-2 transition-all shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)] ${
            error
              ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500'
              : 'border-gray-200 dark:border-slate-800 focus:ring-[#0047FF]/20 focus:border-[#0047FF]'
          } ${
            iconLeft ? 'pl-[48px]' : 'pl-4'
          } ${iconRight ? 'pr-[48px]' : 'pr-4'}`}
          {...props}
        />
        {iconRight && (
          <div className="absolute right-4 z-10 text-gray-400">
             {iconRight}
          </div>
        )}
      </div>
      {error && (
        <p className="text-red-500 text-[12px] mt-1 ml-1 font-medium">{error}</p>
      )}
    </div>
  );
};
