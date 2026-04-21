'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '../../../../components/Input';
import { Button } from '../../../../components/Button';

export default function ProfileSettingsPage() {
  const router = useRouter();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Changes Saved!");
    router.push('/settings');
  };

  return (
    <div className="flex flex-col min-h-screen bg-white pb-24">
      {/* Header */}
      <header className="px-5 pt-12 pb-4">
        <h1 className="text-[26px] font-bold text-[#1f2937]">Profile Settings</h1>
      </header>

      <div className="px-5">
        <form onSubmit={handleSave} className="space-y-6">
          
          <Input 
            label="Full Name" 
            defaultValue="John Doe" 
          />

          <Input 
            label="Email" 
            type="email" 
            defaultValue="john.doe@example.com" 
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
            <Button type="submit">Save Changes</Button>
          </div>

        </form>
      </div>
    </div>
  );
}
