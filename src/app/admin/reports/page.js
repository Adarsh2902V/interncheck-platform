'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AlertOctagon, CheckCircle2, XCircle, ExternalLink, ShieldAlert } from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';
import RiskBadge from '@/components/ui/RiskBadge';
import Modal from '@/components/ui/Modal';
import { toast } from 'sonner';

export default function AdminReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Resolve modal state
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [actionStatus, setActionStatus] = useState('RESOLVED');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchReports = async () => {
    try {
      const url = statusFilter === 'ALL' ? '/api/admin/reports' : `/api/admin/reports?status=${statusFilter}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setReports(data.reports || []);
      }
    } catch (err) {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [statusFilter]);

  const openResolveModal = (report, status) => {
    setSelectedReport(report);
    setActionStatus(status);
    setResolutionNotes('');
    setResolveModalOpen(true);
  };

  const handleResolveSubmit = async (e) => {
    e.preventDefault();
    if (!selectedReport) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/reports/${selectedReport.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: actionStatus,
          resolutionNotes: resolutionNotes.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        setResolveModalOpen(false);
        fetchReports();
      } else {
        toast.error('Failed to update report');
      }
    } catch (err) {
      toast.error('Error resolving report');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">
          Safety Moderation
        </span>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
          Student Scam Reports Investigation ({reports.length})
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Investigate fraudulent listing complaints, review evidence links, and resolve or dismiss reports.
        </p>
      </div>

      <div className="flex gap-2 text-xs">
        {['ALL', 'PENDING', 'RESOLVED', 'REJECTED'].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              statusFilter === s
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="h-64 bg-slate-100 animate-pulse rounded-2xl"></div>
      ) : reports.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 space-y-2">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No reports in this category</h3>
          <p className="text-xs text-slate-500">All submitted student reports have been investigated.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <div
              key={report.id}
              className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={report.status} />
                    <span className="font-bold text-rose-700 bg-rose-50 text-[11px] px-2 py-0.5 rounded border border-rose-200">
                      Category: {report.category.replace('_', ' ')}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Filed on {new Date(report.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">
                    <Link
                      href={`/internships/${report.internshipId}`}
                      className="hover:text-purple-600"
                    >
                      {report.internship?.title}
                    </Link>
                  </h3>
                  <p className="text-xs text-slate-600">
                    Company: <strong className="text-slate-800">{report.internship?.companyName}</strong> • Reported by:{' '}
                    <strong className="text-slate-800">{report.user?.name}</strong> ({report.user?.email})
                  </p>
                </div>

                {report.status === 'PENDING' && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openResolveModal(report, 'RESOLVED')}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-xs hover:bg-emerald-100"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Resolve (Confirm Scam)
                    </button>
                    <button
                      onClick={() => openResolveModal(report, 'REJECTED')}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200"
                    >
                      <XCircle className="w-4 h-4" />
                      Dismiss
                    </button>
                  </div>
                )}
              </div>

              <div className="bg-slate-50 p-3 rounded-xl text-xs text-slate-800 border border-slate-100 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">
                  Student Allegation / Description:
                </span>
                <p className="leading-relaxed">{report.description}</p>
                {report.evidenceUrl && (
                  <div className="pt-1">
                    <a
                      href={report.evidenceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:underline inline-flex items-center gap-1 font-mono text-[11px]"
                    >
                      View Submitted Proof / Cloud Link <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>

              {report.resolutionNotes && (
                <div className="bg-emerald-50 p-3 rounded-xl text-xs text-emerald-950 border border-emerald-200">
                  <span className="text-[10px] uppercase font-bold text-emerald-800 block mb-0.5">
                    Resolution Findings:
                  </span>
                  <p>{report.resolutionNotes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Resolution Modal */}
      <Modal
        isOpen={resolveModalOpen}
        onClose={() => setResolveModalOpen(false)}
        title={actionStatus === 'RESOLVED' ? 'Confirm Scam & Resolve Report' : 'Dismiss Scam Report'}
      >
        <form onSubmit={handleResolveSubmit} className="space-y-4 text-xs">
          <p className="text-slate-600">
            {actionStatus === 'RESOLVED'
              ? 'Marking this report as RESOLVED verifies the student claim, records the scam in the database, and recalculates the risk score of the listing.'
              : 'Dismissing this report marks it as REJECTED without impacting the listing risk score.'}
          </p>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Resolution Audit Notes *
            </label>
            <textarea
              rows={3}
              required
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              placeholder="e.g. Verified recruiter demanded ₹1,499 via UPI. Listing has been blacklisted."
              className="w-full text-sm p-2.5 rounded-xl border border-slate-300"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setResolveModalOpen(false)}
              className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`px-5 py-2 text-white font-bold rounded-xl transition-colors ${
                actionStatus === 'RESOLVED' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-700 hover:bg-slate-800'
              }`}
            >
              {submitting ? 'Updating...' : `Confirm ${actionStatus}`}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
