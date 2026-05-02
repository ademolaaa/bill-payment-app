'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '../../../../components/Input';
import { Button } from '../../../../components/Button';
import { supabase } from '../../../../lib/supabase/client';

export default function ProfileSettingsPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setFullName(user.user_metadata?.full_name || '');
        setEmail(user.email || '');
      }
    };
    fetchUser();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Dummy update for now until we build the settings mutation logic
    setTimeout(() => {
      setIsLoading(false);
      router.push('/settings');
    }, 1000);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-slate-900 pb-24">
      {/* Header */}
      <header className="px-5 pt-12 pb-4">
        <h1 className="text-[26px] font-bold text-[#1f2937]">Profile Settings</h1>
      </header>

      <div className="px-5">
        <form onSubmit={handleSave} className="space-y-6">
          
          <Input 
            label="Full Name" 
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />

          <Input 
            label="Email" 
            type="email" 
            value={email}
            disabled={true} 
          />

          <Input 
            label="Phone Number" 
            type="tel" 
            defaultValue="+1 234 567 890" 
          />

          <Input 
            label="Address" 
            defaultValue="123 Main Street" 
          />

          <div className="pt-2">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
}
