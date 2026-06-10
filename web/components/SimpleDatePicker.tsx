import React, { useEffect, useState } from 'react';

interface SimpleDatePickerProps {
  label: string;
  selectedDate: Date | null;
  onSelect: (date: Date) => void;
}

const SimpleDatePicker: React.FC<SimpleDatePickerProps> = ({ label, selectedDate, onSelect }) => {
  const [value, setValue] = useState<string>('');

  useEffect(() => {
    if (selectedDate) {
      const iso = selectedDate.toISOString().split('T')[0];
      setValue(iso);
    } else {
      setValue('');
    }
  }, [selectedDate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    if (e.target.value) {
      const date = new Date(e.target.value);
      if (!isNaN(date.getTime())) {
        onSelect(date);
      }
    }
  };

  return (
    <div className="flex flex-col space-y-1 w-full">
      <label className="text-sm font-medium text-[#0F172A] dark:text-white">{label}</label>
      <input
        type="date"
        className="w-full border border-gray-300 dark:border-slate-700 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#0047FF] bg-white dark:bg-slate-800 text-[#0F172A] dark:text-white"
        value={value}
        onChange={handleChange}
      />
    </div>
  );
};

export default SimpleDatePicker;
