import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'text';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  fullWidth = true,
  className = '',
  ...props
}) => {
  const baseStyles = 'font-bold rounded-2xl py-4 px-4 transition-all duration-200 active:scale-95 text-center text-[15px] shadow-sm transform-gpu';
  const widthStyles = fullWidth ? 'w-full' : '';
  
  let variantStyles = '';
  if (variant === 'primary') {
    variantStyles = 'bg-fintech-primary hover:opacity-90 text-white shadow-sm focus:ring-4 focus:ring-gray-200';
  } else if (variant === 'outline') {
    variantStyles = 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-900 dark:text-white shadow-sm focus:ring-4 focus:ring-gray-100 dark:focus:ring-slate-700';
  } else if (variant === 'text') {
    variantStyles = 'bg-transparent text-gray-900 dark:text-slate-200 hover:opacity-70 shadow-none active:scale-100 p-0';
  }

  return (
    <button
      className={`${baseStyles} ${widthStyles} ${variantStyles} ${className} disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none`}
      {...props}
    >
      {children}
    </button>
  );
};
