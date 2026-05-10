'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '../../../../components/Button';
import { Input } from '../../../../components/Input';
import { useRouter } from 'next/navigation';

export default function SecurityPage() {
  const router = useRouter();
  const [email2FA, setEmail2FA] = useState(true);
  const [authApp, setAuthApp] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [setupStep, setSetupStep] = useState(1);
  const [verificationCode, setVerificationCode] = useState('');
  const [secretKey, setSecretKey] = useState('K7VJ 4M2P X9LR 3TQ5'); // Dummy secret key

  const handleToggleAuthApp = () => {
    if (!authApp) {
      setShowAuthModal(true);
      setSetupStep(1);
    } else {
      // Logic to disable (maybe another confirm modal)
      setAuthApp(false);
    }
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationCode.length === 6) {
      setSetupStep(3);
      setTimeout(() => {
        setAuthApp(true);
        setShowAuthModal(false);
      }, 1500);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 relative pb-24">
      {/* Header */}
      <header className="p-4 pt-10 flex items-center justify-between border-b border-gray-100 bg-white dark:bg-slate-900 shadow-sm relative z-10">
        <Link href="/settings" className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:bg-slate-800 transition-colors cursor-pointer">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-900 dark:text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </Link>
        <h1 className="text-lg font-bold text-gray-900 dark:text-white absolute left-1/2 transform -translate-x-1/2">Security & 2FA</h1>
        <div className="w-8"></div> {/* Spacer for center alignment */}
      </header>

      {/* Main Container */}
      <div className="flex-grow p-4 mt-2">
        
        {/* 2FA Toggles Section */}
        <section className="mb-8">
          <h2 className="text-[14px] font-bold text-gray-700 dark:text-slate-600 uppercase tracking-wider mb-3 px-2">Two-Factor Authentication</h2>
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            
            {/* Email 2FA Toggle */}
            <div className="flex items-center justify-between p-5 border-b border-gray-50">
              <div>
                <h3 className="text-[16px] font-medium text-gray-900 dark:text-white mb-0.5">Email Verification</h3>
                <p className="text-[13px] text-gray-700 dark:text-slate-600">Receive codes via registered email</p>
              </div>
              <button 
                onClick={() => setEmail2FA(!email2FA)}
                title={email2FA ? "Disable Email Verification" : "Enable Email Verification"}
                className={`w-12 h-6 rounded-full relative transition-colors duration-200 focus:outline-none ${email2FA ? 'bg-blue-600' : 'bg-gray-300'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform duration-200 ${email2FA ? 'translate-x-6.5 left-0.5 shadow-sm' : 'translate-x-0.5 shadow-sm'}`} />
              </button>
            </div>

            {/* Authenticator App Toggle */}
            <div className="flex items-center justify-between p-5">
              <div className="mr-4">
                <h3 className="text-[16px] font-medium text-gray-900 dark:text-white mb-0.5">Authenticator App</h3>
                <p className="text-[13px] text-gray-700 dark:text-slate-600">Google Authenticator or similar</p>
              </div>
              <button 
                onClick={handleToggleAuthApp}
                title={authApp ? "Disable Authenticator App" : "Enable Authenticator App"}
                className={`w-12 h-6 rounded-full relative transition-colors duration-200 focus:outline-none flex-shrink-0 ${authApp ? 'bg-blue-600' : 'bg-gray-300'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform duration-200 ${authApp ? 'translate-x-6.5 left-0.5 shadow-sm' : 'translate-x-0.5 shadow-sm'}`} />
              </button>
            </div>

          </div>
        </section>

        {/* Change Password Form */}
        <section>
          <h2 className="text-[14px] font-bold text-gray-700 dark:text-slate-600 uppercase tracking-wider mb-3 px-2">Change Password</h2>
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-gray-100 p-6">
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); console.log("Password updated"); }}>
              <Input 
                type="password" 
                label="Current Password" 
                placeholder="Enter current password" 
                required 
              />
              <Input 
                type="password" 
                label="New Password" 
                placeholder="Must be at least 8 characters" 
                required 
              />
              <Input 
                type="password" 
                label="Confirm New Password" 
                placeholder="Re-enter new password" 
                required 
              />
              <div className="pt-4">
                <Button type="submit" variant="primary" className="w-full">
                  Update Password
                </Button>
              </div>
            </form>
          </div>
        </section>

      </div>

      {/* ── Authenticator Modal ─────────────────────────────────────────── */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAuthModal(false)} />
          <div className="bg-white dark:bg-slate-900 rounded-[32px] w-full max-w-md relative z-10 overflow-hidden animate-in fade-in zoom-in duration-200">
            
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Authenticator App</h3>
                <button onClick={() => setShowAuthModal(false)} title="Close Modal" className="p-2 rounded-full hover:bg-gray-100 dark:bg-slate-800">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              {setupStep === 1 && (
                <div className="space-y-6">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-800">
                    <p className="text-sm text-blue-800 dark:text-blue-300 font-medium">
                      Scan the QR code with your authenticator app (Google Authenticator, Authy, etc.)
                    </p>
                  </div>

                  <div className="flex justify-center py-4">
                    <div className="w-48 h-48 bg-white p-3 rounded-2xl shadow-inner border border-gray-100 flex items-center justify-center">
                      {/* Simulated QR Code */}
                      <div className="w-full h-full bg-slate-100 rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-slate-300">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-slate-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                         </svg>
                         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">QR CODE PLACEHOLDER</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="text-xs text-gray-500 dark:text-slate-400 mb-2 uppercase tracking-widest font-bold">Manual Entry Key</p>
                    <div className="bg-gray-100 dark:bg-slate-800 p-3 rounded-xl inline-flex items-center space-x-3 border border-gray-200 dark:border-slate-700">
                      <span className="font-mono text-gray-800 dark:text-slate-200 font-bold">{secretKey}</span>
                      <button 
                        onClick={() => navigator.clipboard.writeText(secretKey)}
                        className="text-blue-600 hover:text-blue-700 p-1"
                        title="Copy Key"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>
                      </button>
                    </div>
                  </div>

                  <Button onClick={() => setSetupStep(2)} variant="primary" className="w-full py-4 text-[16px]">
                    I've Scanned the Code
                  </Button>
                </div>
              )}

              {setupStep === 2 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h4 className="text-[17px] font-bold text-gray-900 dark:text-white mb-2">Verify Your App</h4>
                    <p className="text-sm text-gray-600 dark:text-slate-400">Enter the 6-digit code from your authenticator app to confirm the setup.</p>
                  </div>

                  <form onSubmit={handleVerifyCode} className="space-y-6">
                    <div className="flex justify-center">
                      <input 
                        type="text"
                        maxLength={6}
                        placeholder="000000"
                        className="w-full max-w-[200px] text-center text-3xl font-bold tracking-[12px] py-4 border-2 border-gray-200 dark:border-slate-700 rounded-2xl focus:border-blue-500 focus:outline-none bg-transparent text-gray-900 dark:text-white"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                        autoFocus
                      />
                    </div>
                    
                    <div className="flex space-x-3">
                      <Button onClick={() => setSetupStep(1)} variant="outline" className="flex-1">Back</Button>
                      <Button type="submit" variant="primary" className="flex-[2]" disabled={verificationCode.length !== 6}>
                        Verify & Activate
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              {setupStep === 3 && (
                <div className="py-8 flex flex-col items-center text-center space-y-4">
                  <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 animate-bounce">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white">Activation Successful!</h4>
                  <p className="text-sm text-gray-600 dark:text-slate-400">Your account is now protected with 2FA Authenticator.</p>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
