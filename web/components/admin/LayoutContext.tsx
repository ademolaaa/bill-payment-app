'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface LayoutContextType {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (val: boolean) => void;
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (val: boolean) => void;
  toggleSidebar: () => void;
  toggleMobileSidebar: () => void;
  simulatedRole: 'Super Admin' | 'Finance Admin' | 'Operations Admin' | 'Compliance Officer';
  setSimulatedRole: (role: 'Super Admin' | 'Finance Admin' | 'Operations Admin' | 'Compliance Officer') => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const LayoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [simulatedRole, setSimulatedRoleState] = useState<'Super Admin' | 'Finance Admin' | 'Operations Admin' | 'Compliance Officer'>('Super Admin');

  // Responsive automatically collapse on smaller screens
  useEffect(() => {
    const savedRole = localStorage.getItem('simulatedRole');
    if (savedRole && ['Super Admin', 'Finance Admin', 'Operations Admin', 'Compliance Officer'].includes(savedRole)) {
      setSimulatedRoleState(savedRole as any);
    }

    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarCollapsed(true);
      } else {
        setSidebarCollapsed(false);
      }
      if (window.innerWidth >= 768) {
        setMobileSidebarOpen(false);
      }
    };

    // Set initial size
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);
  const toggleMobileSidebar = () => setMobileSidebarOpen(!mobileSidebarOpen);
  const setSimulatedRole = (role: 'Super Admin' | 'Finance Admin' | 'Operations Admin' | 'Compliance Officer') => {
    setSimulatedRoleState(role);
    localStorage.setItem('simulatedRole', role);
  };

  return (
    <LayoutContext.Provider
      value={{
        sidebarCollapsed,
        setSidebarCollapsed,
        mobileSidebarOpen,
        setMobileSidebarOpen,
        toggleSidebar,
        toggleMobileSidebar,
        simulatedRole,
        setSimulatedRole,
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
};

export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
};
