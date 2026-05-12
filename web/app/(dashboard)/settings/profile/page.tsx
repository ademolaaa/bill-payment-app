'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../../lib/supabase/client';

const InputField = ({ icon, label, value, onChange, type = "text" }: any) => (
  <div className="flex items-center p-3 rounded-2xl border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
    <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-gray-500 dark:text-slate-400 mr-3 flex-shrink-0">
      {icon}
    </div>
    <div className="flex flex-col flex-grow">
      <label className="text-[11px] font-medium text-gray-500 dark:text-slate-400">{label}</label>
      <input 
        type={type}
        value={value}
        onChange={onChange}
        title={label}
        placeholder={label}
        className="w-full bg-transparent border-none p-0 m-0 text-[14px] font-medium text-gray-900 dark:text-white focus:ring-0 focus:outline-none"
      />
    </div>
  </div>
);

export default function ProfileSettingsPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+234 810 123 4567');
  const [address, setAddress] = useState('123 Victoria Island, Lagos, Nigeria');
  const [isLoading, setIsLoading] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const fullName = user.user_metadata?.full_name || '';
        const names = fullName.split(' ');
        setFirstName(names[0] || '');
        setLastName(names.slice(1).join(' ') || '');
        setEmail(user.email || '');
        
        if (user.user_metadata?.avatar_url) {
          setProfileImage(user.user_metadata.avatar_url);
        }
        if (user.user_metadata?.phone) setPhone(user.user_metadata.phone);
        if (user.user_metadata?.address) setAddress(user.user_metadata.address);
      }
    };
    fetchUser();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Image must be smaller than 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            // Update metadata with the new info including profile image and other details
            const { error } = await supabase.auth.updateUser({
                data: {
                    full_name: `${firstName} ${lastName}`.trim(),
                    avatar_url: profileImage, 
                    phone: phone,
                    address: address
                }
            });
            if (error) throw error;
        }
        
        // Brief delay for UX, then back to profile
        setTimeout(() => {
            setIsLoading(false);
            router.push('/profile');
        }, 800);
    } catch (err) {
        console.error('Error updating profile:', err);
        setIsLoading(false);
    }
  };

  const initials = `${firstName.charAt(0) || ''}${lastName.charAt(0) || ''}`.toUpperCase() || 'JD';

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 pb-24">
      {/* Header */}
      <header className="p-4 pt-12 flex flex-col relative bg-slate-50 dark:bg-slate-950 mb-2">
        <div className="flex items-center justify-center relative mb-4">
          <button onClick={() => router.back()} title="Go Back" aria-label="Go Back" className="absolute left-0 p-2 border border-gray-200 dark:border-slate-800 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-900 transition-colors bg-white dark:bg-slate-900">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-900 dark:text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </button>
          <h1 className="text-[20px] font-bold text-gray-900 dark:text-white">Profile Settings</h1>
        </div>
        <p className="text-center text-[13px] text-gray-500 dark:text-slate-400 px-6">
          Manage your personal information and keep your account up to date.
        </p>
      </header>

      <div className="px-5">
        <form onSubmit={handleSave} className="space-y-4">
          
          {/* Profile Photo Section */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 p-6 flex flex-col items-center">
            <div className="w-full text-left mb-6">
              <h3 className="text-[15px] font-bold text-gray-900 dark:text-white">Profile Photo</h3>
            </div>
            
            <div className="relative mb-4 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <div className="w-24 h-24 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center overflow-hidden border-4 border-white dark:border-slate-800 shadow-sm">
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[32px] font-medium text-[#0047FF] dark:text-blue-400 tracking-wider">
                    {initials}
                  </span>
                )}
              </div>
              
              <input 
                type="file" 
                ref={fileInputRef}
                title="Upload Profile Picture"
                aria-label="Upload Profile Picture"
                className="hidden"
                accept="image/jpeg, image/png"
                onChange={handleImageChange}
              />
              
              <button 
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                title="Change Profile Photo"
                aria-label="Change Profile Photo"
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 flex items-center justify-center shadow-sm text-[#0047FF] dark:text-blue-400 hover:bg-gray-50 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </button>
            </div>
            
            <p className="text-[13px] font-medium text-gray-900 dark:text-white mb-1">
              Tap to change your photo
            </p>
            <p className="text-[12px] text-gray-500 dark:text-slate-400">
              JPG, PNG (Max 5MB)
            </p>
          </div>

          <div className="flex flex-col space-y-3 mt-4">
            <InputField 
              label="First Name" 
              value={firstName} 
              onChange={(e: any) => setFirstName(e.target.value)} 
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
            />
            <InputField 
              label="Last Name" 
              value={lastName} 
              onChange={(e: any) => setLastName(e.target.value)} 
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
            />
            <InputField 
              label="Email Address" 
              type="email"
              value={email} 
              onChange={(e: any) => setEmail(e.target.value)} 
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
            />
            <InputField 
              label="Phone Number" 
              type="tel"
              value={phone} 
              onChange={(e: any) => setPhone(e.target.value)} 
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>}
            />
            <InputField 
              label="Home Address" 
              value={address} 
              onChange={(e: any) => setAddress(e.target.value)} 
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
            />
          </div>

          <div className="pt-6">
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-[#0047FF] hover:bg-blue-700 text-white font-bold rounded-2xl py-4 text-[15px] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
