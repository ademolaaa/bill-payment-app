'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function ThemeSettingsPage() {
  const [lightMode, setLightMode] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const toggleLight = () => {
    setLightMode(true);
    setDarkMode(false);
  };

  const toggleDark = () => {
    setDarkMode(true);
    setLightMode(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white relative pb-24">
      {/* Header */}
      <header className="px-5 pt-12 pb-4">
        <h1 className="text-[26px] font-bold text-[#1f2937]">Theme Settings</h1>
      </header>

      <div className="px-5">
        
        {/* Toggles Container */}
        <div className="border border-gray-100 rounded-[16px] overflow-hidden shadow-sm">
          
          {/* Light Mode Toggle */}
          <div className="flex items-center justify-between p-5 border-b border-gray-50 bg-white">
            <h3 className="text-[17px] font-medium text-[#111827]">Light Mode</h3>
            <button 
              onClick={toggleLight}
              className={`w-[46px] h-[26px] rounded-full relative transition-colors duration-200 focus:outline-none ${lightMode ? 'bg-blue-600' : 'bg-gray-200'}`}
            >
              <div className={`w-[22px] h-[22px] bg-white rounded-full absolute top-[2px] transition-transform duration-200 ${lightMode ? 'translate-x-[22px] left-[1px] shadow-sm' : 'translate-x-[2px] shadow-sm'}`} />
            </button>
          </div>

          {/* Dark Mode Toggle */}
          <div className="flex items-center justify-between p-5 bg-white">
            <h3 className="text-[17px] font-medium text-[#111827]">Dark Mode</h3>
            <button 
              onClick={toggleDark}
              className={`w-[46px] h-[26px] rounded-full relative transition-colors duration-200 focus:outline-none flex-shrink-0 ${darkMode ? 'bg-blue-600' : 'bg-gray-200'}`}
            >
              <div className={`w-[22px] h-[22px] bg-white rounded-full absolute top-[2px] transition-transform duration-200 ${darkMode ? 'translate-x-[22px] left-[1px] shadow-sm' : 'translate-x-[2px] shadow-sm'}`} />
            </button>
          </div>

        </div>
        
      </div>
    </div>
  );
}
