'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, Clock, CheckCircle2, ShieldAlert } from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';
import { toast } from 'sonner';

export default function MyReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReports() {
      try {
        const res = await fetch('/api/reports');
        if (res.ok) {
          const data = await res.json();
          setReports(data.reports || []);
        }
      } catch (err) {
        toast.error('Failed to load reports');
      } finally {
        setLoading(false);
      }
    }
    loadReports();
  }, []);

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-100 pb-4">
        <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">
          Safety Submissions
        </span>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
          My Scam & Fraud Reports ({reports.length})
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          View the moderation status and resolution notes of suspicious listings you flagged.
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((n) => (
            <div key={n} className="h-28 bg-slate-100 animate-pulse rounded-2xl"></div>
          ))}
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No reports filed</h3>
          <p className="text-xs text-slate-500">
            If you encounter suspicious listings demanding money or asking for personal documents, use the "Report Scam" button on the listing details page.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <div
              key={report.id}
              className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-xs space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={report.status} />
                    <span className="text-[11px] font-mono text-slate-400">
                      Filed on {new Date(report.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    {report.internship?.title}
                  </h3>
                  <p className="text-xs font-semibold text-slate-600">
                    Company: {report.internship?.companyName} • Category:{' '}
                    <strong className="text-rose-700">{report.category.replace('_', ' ')}</strong>
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl text-xs text-slate-700 border border-slate-100">
                <strong className="text-slate-500 text-[10px] uppercase tracking-wider block mb-0.5">
                  Your Report Details:
                </strong>
                {report.description}
              </div>

              {report.resolutionNotes && (
                <div className="bg-emerald-50 p-3 rounded-xl text-xs text-emerald-900 border border-emerald-200">
                  <strong className="text-emerald-700 text-[10px] uppercase tracking-wider block mb-0.5">
                    Moderator Resolution Notes:
                  </strong>
                  {report.resolutionNotes}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
