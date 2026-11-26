'use client';

import React, { useState, useEffect } from 'react';
import { User, Mail, GraduationCap, Building, ShieldCheck, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function StudentProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch (err) {
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  if (loading) {
    return <div className="h-64 bg-slate-100 animate-pulse rounded-2xl"></div>;
  }

  return (
    <div className="space-y-6 max-w-xl">
      <div className="border-b border-slate-100 pb-4">
        <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">
          Account Settings
        </span>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
          Student Profile
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Your credentials and university affiliation.
        </p>
      </div>

      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 space-y-5 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-purple-600 text-white font-black text-2xl flex items-center justify-center shadow-md">
            {user?.name ? user.name[0] : 'S'}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">{user?.name}</h3>
            <p className="text-xs text-slate-500">{user?.email}</p>
            <span className="inline-block mt-1 text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200 uppercase">
              Role: {user?.role}
            </span>
          </div>
        </div>

        <div className="space-y-3 pt-3 border-t border-slate-100 text-xs">
          <div className="flex items-center justify-between py-2 border-b border-slate-50">
            <span className="text-slate-500 flex items-center gap-1.5">
              <Building className="w-4 h-4 text-slate-400" />
              College / University
            </span>
            <span className="font-bold text-slate-800">{user?.college || 'NSUT Delhi (Demo)'}</span>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-slate-50">
            <span className="text-slate-500 flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-slate-400" />
              Branch / Department
            </span>
            <span className="font-bold text-slate-800">{user?.branch || 'Computer Engineering'}</span>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-slate-50">
            <span className="text-slate-500">Graduation Year</span>
            <span className="font-mono font-bold text-slate-800">{user?.graduationYear || 2026}</span>
          </div>

          <div className="flex items-center justify-between py-2">
            <span className="text-slate-500">Account Safety Status</span>
            <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1">
              <Check className="w-3 h-3 text-emerald-600" />
              Active & Verified
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
