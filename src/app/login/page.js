'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, LogIn, ArrowRight, UserCheck, ShieldAlert, GraduationCap } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Welcome back, ${data.user.name}!`);
        if (data.user.role === 'ADMIN') {
          router.push('/admin');
        } else if (data.user.role === 'ALUMNI') {
          router.push('/senior/dashboard');
        } else {
          router.push('/dashboard');
        }
        router.refresh();
      } else {
        toast.error(data.message || 'Login failed');
      }
    } catch (err) {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Quick 1-click demo login helper for Student and Alumni accounts
  const quickDemoLogin = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('Password123!');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-slate-900 text-white shadow-sm border border-slate-800 mb-2">
            <ShieldCheck className="w-6 h-6 text-indigo-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Log In to InternCheck
          </h1>
          <p className="text-xs text-slate-500">
            Sign in to check risk ratings, track applications, or access administration.
          </p>
        </div>

        {/* 1-Click Demo Accounts Widget for Student & Alumni */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
          <span className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider block">
            Quick Demo Logins (Student &amp; Alumni):
          </span>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => quickDemoLogin('aarav.alumni@interncheck.edu')}
              className="px-3 py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg font-semibold text-indigo-700 flex items-center justify-center gap-2 transition-colors shadow-subtle"
            >
              <GraduationCap className="w-4 h-4 text-indigo-600" />
              <span>Alumni (Aarav)</span>
            </button>
            <button
              type="button"
              onClick={() => quickDemoLogin('rohan.student@interncheck.edu')}
              className="px-3 py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg font-semibold text-slate-800 flex items-center justify-center gap-2 transition-colors shadow-subtle"
            >
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <span>Student (Rohan)</span>
            </button>
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-subtle">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@college.edu"
                className="w-full text-sm py-2.5 px-3.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-sm py-2.5 px-3.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-lg bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-60"
            >
              <LogIn className="w-4 h-4" />
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            Don't have an account yet?{' '}
            <Link href="/register" className="font-semibold text-indigo-600 hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
