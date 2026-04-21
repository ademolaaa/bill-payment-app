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
        <label className="block text-gray-900 text-[15px] font-bold mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          className={`w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-5 text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-[15px] font-medium shadow-sm ${
            icon ? 'pr-12' : ''
          }`}
          {...props}
        />
        {icon && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-5 pointer-events-none text-gray-400">
             {icon}
          </div>
        )}
      </div>
    </div>
  );
};
