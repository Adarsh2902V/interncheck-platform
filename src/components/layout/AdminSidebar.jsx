'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ShieldAlert, AlertOctagon, CheckSquare, Users, BarChart3, ArrowLeft } from 'lucide-react';

const ADMIN_LINKS = [
  { href: '/admin', label: 'Admin Overview', icon: LayoutDashboard },
  { href: '/admin/internships', label: 'Manage Internships', icon: CheckSquare },
  { href: '/admin/verification', label: 'Risk Assessment Engine', icon: ShieldAlert },
  { href: '/admin/reports', label: 'Student Reports Queue', icon: AlertOctagon },
  { href: '/admin/experiences', label: 'Experience Moderation', icon: CheckSquare },
  { href: '/admin/users', label: 'User Management', icon: Users },
  { href: '/admin/analytics', label: 'Platform Analytics', icon: BarChart3 },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full md:w-64 bg-slate-900 text-slate-300 p-4 space-y-6 shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="px-3 py-2 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
          <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">
            Governance Console
          </span>
        </div>
        <h2 className="text-base font-black text-white mt-1">
          Admin Operations
        </h2>
      </div>

      <nav className="space-y-1">
        {ADMIN_LINKS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-900/30 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="pt-6 border-t border-slate-800 px-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Public Portal
        </Link>
      </div>
    </aside>
  );
}
