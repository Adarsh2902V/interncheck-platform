'use client';

import React from 'react';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';

export default function StudentDashboardLayout({ children }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row gap-8 bg-slate-50 min-h-[calc(100vh-12rem)]">
        <DashboardSidebar />
        <div className="flex-1 bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm">
          {children}
        </div>
      </div>
    </div>
  );
}
