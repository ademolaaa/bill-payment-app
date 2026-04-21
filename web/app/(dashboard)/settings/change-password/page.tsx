'use client';

import React from 'react';
import { Button } from '../../../../components/Button';
import { Input } from '../../../../components/Input';

export default function ChangePasswordPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white pb-24">
      <header className="px-5 pt-12 pb-4">
        <h1 className="text-[26px] font-bold text-[#1f2937]">Change Password</h1>
      </header>

      <div className="px-5 pt-4">
        <form className="space-y-4">
          <Input 
            label="Current Password" 
            type="password" 
            placeholder="Enter current password" 
          />
          <Input 
            label="New Password" 
            type="password" 
            placeholder="Enter new password" 
          />
          <Input 
            label="Confirm New Password" 
            type="password" 
            placeholder="Confirm new password" 
          />
          <div className="pt-4">
            <Button type="submit">Update Password</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
