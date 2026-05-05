import React, { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  icon,
  className = '',
  ...props
}) => {
  return (
    <div className={`mb-4 w-full ${className}`}>
      {label && (
        <label className="block text-gray-900 dark:text-slate-200 text-[15px] font-bold mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          className={`w-full bg-gray-50 dark:bg-slate-800 border border-transparent dark:border-slate-700 rounded-2xl py-4 px-5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-200 text-[15px] font-medium shadow-sm ${
            icon ? 'pr-12' : ''
          }`}
          {...props}
        />
        {icon && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-5 pointer-events-none text-gray-600 dark:text-slate-700">
             {icon}
          </div>
        )}
      </div>
    </div>
  );
};
