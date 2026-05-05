import React from 'react';

interface NotificationItemProps {
  title: string;
  description: string;
  timestamp: string;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({ title, description, timestamp }) => {
  return (
    <div className="py-4 border-b border-gray-100 dark:border-slate-800 last:border-b-0">
      <div className="flex justify-between items-start mb-1">
        <h4 className="text-[16px] font-semibold text-black dark:text-white">{title}</h4>
        <span className="text-[13px] text-gray-700 dark:text-slate-600 font-medium">{timestamp}</span>
      </div>
      <p className="text-[15px] text-gray-900 dark:text-slate-300 leading-relaxed pr-8">
        {description}
      </p>
    </div>
  );
};
