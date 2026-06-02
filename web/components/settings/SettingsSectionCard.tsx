import React from 'react';

interface SettingsSectionCardProps {
  title?: string;
  children: React.ReactNode;
}

export const SettingsSectionCard = ({ title, children }: SettingsSectionCardProps) => {
  return (
    <section className="w-full">
      {title && (
        <h3 className="text-[16px] font-bold text-gray-900 dark:text-white mb-3 px-1">
          {title}
        </h3>
      )}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-2 px-5 shadow-sm border border-gray-100 dark:border-slate-800/80 divide-y divide-gray-50 dark:divide-slate-800/60">
        {children}
      </div>
    </section>
  );
};
