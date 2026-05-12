import React from 'react';
import Image from 'next/image';

interface NotificationItemProps {
  title: string;
  description: string;
  timestamp: string;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({ title, description, timestamp }) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 mb-4 shadow-sm border border-gray-100 dark:border-slate-800 flex items-center">
      <div className="w-12 h-12 relative flex-shrink-0 mr-4">
        <Image src="/logo.png" alt="Icon" fill className="object-contain" />
      </div>
      <div className="flex-grow">
        <div className="flex justify-between items-start mb-1">
          <h4 className="text-[16px] font-bold text-slate-900 dark:text-white">{title}</h4>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap ml-2">{timestamp}</span>
        </div>
        <p className="text-[14px] text-slate-600 dark:text-slate-400 leading-relaxed pr-2">
          {description}
        </p>
      </div>
    </div>
  );
};
