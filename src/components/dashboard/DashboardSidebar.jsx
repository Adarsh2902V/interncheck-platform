'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Bookmark, Briefcase, BookOpen, AlertTriangle, User, LogOut } from 'lucide-react';

const LINKS = [
  { href: '/dashboard', label: 'Overview & Analytics', icon: LayoutDashboard },
  { href: '/dashboard/applications', label: 'Application Tracker', icon: Briefcase },
  { href: '/dashboard/saved', label: 'Saved Internships', icon: Bookmark },
  { href: '/dashboard/experiences', label: 'My Submissions', icon: BookOpen },
  { href: '/dashboard/reports', label: 'My Scam Reports', icon: AlertTriangle },
  { href: '/dashboard/profile', label: 'Student Profile', icon: User },
];

export default function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full md:w-64 bg-white border-r border-slate-200/80 p-4 space-y-6 shrink-0">
      <div className="px-3 py-2">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Student Portal
        </span>
        <h2 className="text-base font-black text-slate-900 mt-0.5">
          InternCheck Workspace
        </h2>
      </div>

      <nav className="space-y-1">
        {LINKS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-purple-50 text-purple-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-purple-600' : 'text-slate-400'}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="pt-6 border-t border-slate-100 px-3">
        <div className="bg-brand-50 border border-brand-100 rounded-xl p-3 text-xs text-brand-900 space-y-1">
          <p className="font-bold">Protecting Students</p>
          <p className="text-brand-800 text-[11px] leading-relaxed">
            Always run new internship listings through the Risk Assessment engine before sending resumes.
          </p>
        </div>
      </div>
    </aside>
  );
}
