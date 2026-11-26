'use client';

import React from 'react';

export default function StatusBadge({ status, type = 'application' }) {
  const configs = {
    // Application statuses
    INTERESTED: { label: 'Interested', bg: 'bg-slate-100 text-slate-700 border-slate-200' },
    APPLIED: { label: 'Applied', bg: 'bg-blue-50 text-blue-700 border-blue-200' },
    ASSESSMENT: { label: 'Assessment', bg: 'bg-purple-50 text-purple-700 border-purple-200' },
    INTERVIEW: { label: 'Interview', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    SELECTED: { label: 'Selected / Offer', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    REJECTED: { label: 'Rejected', bg: 'bg-rose-50 text-rose-700 border-rose-200' },

    // Verification / Report / Experience statuses
    APPROVED: { label: 'Approved', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    PENDING: { label: 'Pending Review', bg: 'bg-amber-50 text-amber-700 border-amber-200' },
    RESOLVED: { label: 'Resolved', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  };

  const current = configs[status] || { label: status, bg: 'bg-slate-100 text-slate-700 border-slate-200' };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${current.bg}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-70"></span>
      {current.label}
    </span>
  );
}
