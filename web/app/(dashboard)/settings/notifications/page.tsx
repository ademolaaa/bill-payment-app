'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SettingsToggleRow } from '../../../../components/settings/SettingsToggleRow';
import { SettingsSectionCard } from '../../../../components/settings/SettingsSectionCard';
import { SettingsSaveStatus, SaveState } from '../../../../components/settings/SettingsSaveStatus';

interface NotificationPreferences {
  accountAlerts: boolean;
  transactionNotifications: boolean;
  investmentUpdates: boolean;
  promotionsOffers: boolean;
  securityAlerts: boolean;
  emailEnabled: boolean;
  pushEnabled: boolean;
  smsEnabled: boolean;
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  accountAlerts: true,
  transactionNotifications: true,
  investmentUpdates: true,
  promotionsOffers: true,
  securityAlerts: true,
  emailEnabled: true,
  pushEnabled: false,
  smsEnabled: false
};

const STORAGE_KEY = 'kyvatron_notification_preferences';

export default function NotificationPreferencesPage() {
  const router = useRouter();
  const [prefs, setPrefs] = useState<NotificationPreferences>(DEFAULT_PREFERENCES);
  const [loadingKey, setLoadingKey] = useState<keyof NotificationPreferences | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveState>('idle');
  const [showSecurityModal, setShowSecurityModal] = useState(false);

  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setPrefs(JSON.parse(stored));
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PREFERENCES));
      }
    } catch (e) {
      console.error('Failed to load notification preferences from localStorage', e);
    }
  }, []);

  const persistPreferences = async (newPrefs: NotificationPreferences, key: keyof NotificationPreferences) => {
    setLoadingKey(key);
    setSaveStatus('saving');

    try {
      // Simulate API network request latency (600ms)
      await new Promise(resolve => setTimeout(resolve, 600));

      localStorage.setItem(STORAGE_KEY, JSON.stringify(newPrefs));
      setPrefs(newPrefs);
      setSaveStatus('saved');

      // Clear the saved status badge after a brief delay
      setTimeout(() => {
        setSaveStatus(prev => prev === 'saved' ? 'idle' : prev);
      }, 2500);
    } catch (error) {
      console.error('Failed to persist notification settings', error);
      setSaveStatus('error');
      
      // Auto-recover back to previous preference layout
      const oldPrefs = localStorage.getItem(STORAGE_KEY);
      if (oldPrefs) {
        setPrefs(JSON.parse(oldPrefs));
      }
    } finally {
      setLoadingKey(null);
    }
  };

  const handleToggle = (key: keyof NotificationPreferences) => {
    // Intercept security alert toggle off to present safe gate modal
    if (key === 'securityAlerts' && prefs.securityAlerts) {
      setShowSecurityModal(true);
      return;
    }

    const updated = {
      ...prefs,
      [key]: !prefs[key]
    };
    
    persistPreferences(updated, key);
  };

  const confirmDisableSecurity = () => {
    setShowSecurityModal(false);
    const updated = {
      ...prefs,
      securityAlerts: false
    };
    persistPreferences(updated, 'securityAlerts');
  };

  // Compute validation states
  const allChannelsDisabled = !prefs.emailEnabled && !prefs.pushEnabled && !prefs.smsEnabled;
  
  const hasActiveAlertWithoutChannel = 
    (prefs.accountAlerts || prefs.transactionNotifications || prefs.investmentUpdates || prefs.promotionsOffers || prefs.securityAlerts) && 
    allChannelsDisabled;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 pb-12 relative transition-colors duration-300">
      
      {/* Header */}
      <header className="p-6 pt-12 flex flex-col relative bg-white dark:bg-slate-900 mb-4 rounded-b-[32px] shadow-sm border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <button 
              onClick={() => router.back()} 
              title="Go Back" 
              aria-label="Go Back" 
              className="p-2 border.5 border-gray-100 dark:border-slate-800 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors bg-white dark:bg-slate-900 shadow-sm mr-4 text-slate-800 dark:text-slate-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <h1 className="text-[20px] font-bold text-gray-900 dark:text-white">Notification Settings</h1>
          </div>
          
          {/* Reusable inline update indicator */}
          <SettingsSaveStatus state={saveStatus} />
        </div>
        <p className="text-[13.5px] text-gray-500 dark:text-slate-400 leading-relaxed max-w-sm px-1">
          Customize how and when you receive security logs, wallet receipts, and promotional offers.
        </p>
      </header>

      {/* Main Settings Grid */}
      <div className="p-5 space-y-6 max-w-xl mx-auto w-full">
        
        {/* Warning Indicator: All channels muted */}
        {allChannelsDisabled && (
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-2xl p-4 flex items-start space-x-3 text-red-600 dark:text-red-400 animate-pulse">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <h4 className="text-[14px] font-bold">All communication channels disabled</h4>
              <p className="text-[12px] opacity-90 mt-0.5 leading-snug">
                You have completely muted your email, push, and SMS channels. You will not receive any balance logs or transaction updates.
              </p>
            </div>
          </div>
        )}

        {/* Categories Section */}
        <SettingsSectionCard title="Notification Categories">
          <SettingsToggleRow 
            title="Account Alerts"
            description="Important changes, balance locks, and virtual account setup confirmations."
            isEnabled={prefs.accountAlerts}
            onToggle={() => handleToggle('accountAlerts')}
            isLoading={loadingKey === 'accountAlerts'}
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>}
          />
          <SettingsToggleRow 
            title="Transaction Notifications"
            description="Alerts for card funding, bank transfers, and USDT NOWPayments deposits."
            isEnabled={prefs.transactionNotifications}
            onToggle={() => handleToggle('transactionNotifications')}
            isLoading={loadingKey === 'transactionNotifications'}
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>}
          />
          <SettingsToggleRow 
            title="Investment Updates"
            description="Portfolio metrics, monthly ROI sheets, and product maturation logs."
            isEnabled={prefs.investmentUpdates}
            onToggle={() => handleToggle('investmentUpdates')}
            isLoading={loadingKey === 'investmentUpdates'}
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
          />
          <SettingsToggleRow 
            title="Promotions & Offers"
            description="Cashback bonuses, limited-time referral incentives, and platform discounts."
            isEnabled={prefs.promotionsOffers}
            onToggle={() => handleToggle('promotionsOffers')}
            isLoading={loadingKey === 'promotionsOffers'}
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>}
          />
          <SettingsToggleRow 
            title="Security Alerts"
            description="Real-time notifications for login triggers and API key modifications."
            isEnabled={prefs.securityAlerts}
            onToggle={() => handleToggle('securityAlerts')}
            isLoading={loadingKey === 'securityAlerts'}
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>}
          />
        </SettingsSectionCard>

        {/* Delivery Channels */}
        <SettingsSectionCard title="Delivery Channels">
          <SettingsToggleRow 
            title="Email"
            description="Get clean email logs and transaction statements directly to your inbox."
            isEnabled={prefs.emailEnabled}
            onToggle={() => handleToggle('emailEnabled')}
            isLoading={loadingKey === 'emailEnabled'}
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
          />
          <SettingsToggleRow 
            title="Push Notifications"
            description="Instant slide alerts on your desktop or mobile interface."
            isEnabled={prefs.pushEnabled}
            onToggle={() => handleToggle('pushEnabled')}
            isLoading={loadingKey === 'pushEnabled'}
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>}
          />
          <SettingsToggleRow 
            title="SMS"
            description="Primary fallback delivery for critical account events."
            isEnabled={prefs.smsEnabled}
            onToggle={() => handleToggle('smsEnabled')}
            isLoading={loadingKey === 'smsEnabled'}
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>}
          />
        </SettingsSectionCard>

        {/* Warning Indicator: Active alert, muted channels */}
        {hasActiveAlertWithoutChannel && (
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-2xl p-4 flex items-start space-x-3 text-amber-700 dark:text-amber-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0 mt-0.5 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-[12.5px] leading-snug">
              Preferences are enabled, but delivery channels are muted. Connect at least one channel to receive alerts.
            </p>
          </div>
        )}
      </div>

      {/* Security Alerts Confirmation Modal overlay */}
      {showSecurityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full shadow-xl border border-slate-100 dark:border-slate-800 text-center relative animate-slideUp">
            <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Disable Security Alerts?</h3>
            <p className="text-[13px] text-gray-500 dark:text-slate-400 leading-relaxed mb-6">
              Disabling security alerts blocks notifications about login attempts and password adjustments. This exposes your wallet to unauthorized actions.
            </p>
            
            <div className="flex flex-col space-y-2">
              <button 
                onClick={() => setShowSecurityModal(false)}
                className="w-full py-3 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-2xl text-[14px] font-bold shadow-md shadow-blue-500/10 transition-colors"
              >
                Keep Security Alerts On (Recommended)
              </button>
              <button 
                onClick={confirmDisableSecurity}
                className="w-full py-3 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50 text-red-600 dark:text-red-400 rounded-2xl text-[13px] font-bold transition-colors"
              >
                Yes, Disable Security Alerts
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
