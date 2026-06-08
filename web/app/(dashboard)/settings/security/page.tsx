'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '../../../../components/Button';
import { Input } from '../../../../components/Input';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../../lib/supabase/client';

export default function SecurityPage() {
  const router = useRouter();
  const [email2FA, setEmail2FA] = useState(true);
  const [authApp, setAuthApp] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showDisableConfirm, setShowDisableConfirm] = useState(false);
  const [setupStep, setSetupStep] = useState(1);
  const [verificationCode, setVerificationCode] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [qrCodeSvg, setQrCodeSvg] = useState('');
  
  const [enrolledFactorId, setEnrolledFactorId] = useState('');
  const [activeChallengeId, setActiveChallengeId] = useState('');
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Check current MFA status on load
  useEffect(() => {
    const checkExistingMFA = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase.auth.mfa.listFactors();
        if (error) throw error;
        const verifiedFactor = data?.totp?.find(f => f.status === 'verified');
        if (verifiedFactor) {
          setAuthApp(true);
        } else {
          setAuthApp(false);
        }
      } catch (err) {
        console.error('Error listing MFA factors:', err);
      } finally {
        setLoading(false);
      }
    };
    checkExistingMFA();
  }, []);

  const handleToggleAuthApp = async () => {
    if (!authApp) {
      setErrorMsg(null);
      setIsEnrolling(true);
      try {
        // Enroll the user in a new TOTP factor
        const { data, error } = await supabase.auth.mfa.enroll({
          factorType: 'totp',
          issuer: 'Kyvatron'
        });
        if (error) throw error;
        
        setEnrolledFactorId(data.id);
        setSecretKey(data.totp.secret);
        setQrCodeSvg(data.totp.qr_code);
        
        setShowAuthModal(true);
        setSetupStep(1);
      } catch (err: any) {
        console.error('Enrollment error:', err);
        alert(err.message || 'Failed to start authenticator enrollment.');
      } finally {
        setIsEnrolling(false);
      }
    } else {
      setShowDisableConfirm(true);
    }
  };

  const handleCloseModal = async () => {
    setShowAuthModal(false);
    // Clean up unverified factor from the account if closed prematurely
    if (setupStep < 3 && enrolledFactorId) {
      try {
        await supabase.auth.mfa.unenroll({ factorId: enrolledFactorId });
      } catch (err) {
        console.error('Error cleaning up unverified factor:', err);
      }
    }
    setEnrolledFactorId('');
    setSecretKey('');
    setQrCodeSvg('');
    setVerificationCode('');
    setErrorMsg(null);
  };

  const handleScannedCode = async () => {
    if (!enrolledFactorId) return;
    setErrorMsg(null);
    try {
      // Create a verification challenge for the enrolled factor
      const { data, error } = await supabase.auth.mfa.challenge({
        factorId: enrolledFactorId
      });
      if (error) throw error;
      setActiveChallengeId(data.id);
      setSetupStep(2);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to generate challenge.');
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationCode.length !== 6 || !enrolledFactorId || !activeChallengeId) return;
    
    setErrorMsg(null);
    try {
      // Verify challenge with the user-entered code
      const { data, error } = await supabase.auth.mfa.verify({
        factorId: enrolledFactorId,
        challengeId: activeChallengeId,
        code: verificationCode
      });
      if (error) throw error;
      
      setSetupStep(3);
      setTimeout(() => {
        setAuthApp(true);
        setShowAuthModal(false);
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Verification failed. Please check the code.');
    }
  };

  const handleDisableMFA = async () => {
    try {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) throw error;
      const verifiedFactor = data?.totp?.find(f => f.status === 'verified');
      if (verifiedFactor) {
        const { error: unenrollError } = await supabase.auth.mfa.unenroll({
          factorId: verifiedFactor.id
        });
        if (unenrollError) throw unenrollError;
      }
      setAuthApp(false);
      setShowDisableConfirm(false);
      alert('Authenticator App has been disabled.');
    } catch (err: any) {
      alert(err.message || 'Failed to disable Authenticator App.');
    }
  };

  const formatSecretKey = (key: string) => {
    return key.replace(/\s/g, '').match(/.{1,4}/g)?.join(' ') || key;
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
                disabled={loading || isEnrolling}
                title={authApp ? "Disable Authenticator App" : "Enable Authenticator App"}
                className={`w-12 h-6 rounded-full relative transition-colors duration-200 focus:outline-none flex-shrink-0 ${(loading || isEnrolling) ? 'opacity-50 cursor-wait' : ''} ${authApp ? 'bg-blue-600' : 'bg-gray-300'}`}
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
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleCloseModal} />
          <div className="bg-white dark:bg-slate-900 rounded-[32px] w-full max-w-md relative z-10 overflow-hidden animate-in fade-in zoom-in duration-200">
            
            <div className="p-6 font-sans">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Authenticator App</h3>
                <button onClick={handleCloseModal} title="Close Modal" className="p-2 rounded-full hover:bg-gray-100 dark:bg-slate-800">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              {errorMsg && (
                <div className="mb-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-xl text-xs font-semibold text-center border border-red-100 dark:border-red-900/50">
                  {errorMsg}
                </div>
              )}

              {setupStep === 1 && (
                <div className="space-y-6">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-800">
                    <p className="text-sm text-blue-800 dark:text-blue-300 font-medium">
                      Scan the QR code with your authenticator app (Google Authenticator, Authy, etc.)
                    </p>
                  </div>

                  <div className="flex justify-center py-4">
                    <div className="w-48 h-48 bg-white p-3 rounded-2xl shadow-inner border border-gray-100 flex items-center justify-center overflow-hidden">
                      {qrCodeSvg ? (
                        <div 
                          className="w-full h-full [&>svg]:w-full [&>svg]:h-full" 
                          dangerouslySetInnerHTML={{ __html: qrCodeSvg }} 
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-100 rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-slate-300">
                          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="text-xs text-gray-500 dark:text-slate-400 mb-2 uppercase tracking-widest font-bold">Manual Entry Key</p>
                    <div className="bg-gray-100 dark:bg-slate-800 p-3 rounded-xl inline-flex items-center space-x-3 border border-gray-200 dark:border-slate-700">
                      <span className="font-mono text-gray-800 dark:text-slate-200 font-bold select-all tracking-wider">{formatSecretKey(secretKey)}</span>
                      <button 
                        onClick={() => navigator.clipboard.writeText(secretKey)}
                        className="text-blue-600 hover:text-blue-700 p-1"
                        title="Copy Key"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>
                      </button>
                    </div>
                  </div>

                  <Button onClick={handleScannedCode} variant="primary" className="w-full py-4 text-[16px]">
                    I&apos;ve Scanned the Code
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

      {/* Disable Confirmation Modal */}
      {showDisableConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowDisableConfirm(false)} />
          <div className="bg-white dark:bg-slate-900 rounded-[32px] w-full max-w-sm relative z-10 overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 text-center space-y-4 font-sans">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center text-red-600 dark:text-red-400 mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Disable Authenticator?</h3>
              <p className="text-sm text-gray-600 dark:text-slate-400">This will lower your account security. You will no longer be prompted for an authenticator code when logging in.</p>
              <div className="flex space-x-3 pt-2">
                <Button onClick={() => setShowDisableConfirm(false)} variant="outline" className="flex-1">Cancel</Button>
                <Button onClick={handleDisableMFA} variant="primary" className="flex-1 bg-red-600 hover:bg-red-700 border-red-600 hover:border-red-700">Disable</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
