'use client';

import React from 'react';
import AdminSidebar from '@/components/layout/AdminSidebar';

export default function AdminLayout({ children }) {
  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)] bg-slate-900">
      <AdminSidebar />
      <div className="flex-1 bg-slate-50 p-6 sm:p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
