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

  // Quick 1-click demo login helper for seamless viva demonstration!
  const quickDemoLogin = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('Password123!');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-900 to-purple-800 text-white shadow-lg mb-2">
            <ShieldCheck className="w-6 h-6 text-purple-300" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Log In to InternCheck
          </h1>
          <p className="text-xs text-slate-500">
            Sign in to check risk ratings, track applications, and share experiences.
          </p>
        </div>

        {/* 1-Click Viva Demo Accounts Widget */}
        <div className="bg-purple-50/70 border border-purple-200 rounded-2xl p-4 space-y-2.5">
          <span className="text-[11px] font-bold text-purple-900 uppercase tracking-wider block">
            ⚡ Quick Demo Logins for Viva & Evaluation:
          </span>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <button
              type="button"
              onClick={() => quickDemoLogin('admin@interncheck.edu')}
              className="px-2.5 py-2 bg-white hover:bg-purple-100/60 border border-purple-200 rounded-xl font-bold text-rose-700 flex flex-col items-center gap-1 transition-all"
            >
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <span>Admin</span>
            </button>
            <button
              type="button"
              onClick={() => quickDemoLogin('aarav.alumni@interncheck.edu')}
              className="px-2.5 py-2 bg-white hover:bg-purple-100/60 border border-purple-200 rounded-xl font-bold text-purple-700 flex flex-col items-center gap-1 transition-all"
            >
              <GraduationCap className="w-4 h-4 text-purple-600" />
              <span>Alumni</span>
            </button>
            <button
              type="button"
              onClick={() => quickDemoLogin('rohan.student@interncheck.edu')}
              className="px-2.5 py-2 bg-white hover:bg-purple-100/60 border border-purple-200 rounded-xl font-bold text-brand-700 flex flex-col items-center gap-1 transition-all"
            >
              <UserCheck className="w-4 h-4 text-brand-600" />
              <span>Student</span>
            </button>
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                College Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@college.edu or demo email"
                className="w-full text-sm py-2.5 px-3.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-sm py-2.5 px-3.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-brand-900 text-white font-bold text-sm hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-60"
            >
              <LogIn className="w-4 h-4" />
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            Don't have an account yet?{' '}
            <Link href="/register" className="font-bold text-purple-600 hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
