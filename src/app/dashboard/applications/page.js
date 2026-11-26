'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Briefcase, Plus, Trash2, Edit3, CheckCircle2, ChevronRight, AlertCircle } from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';
import Modal from '@/components/ui/Modal';
import { toast } from 'sonner';

const STAGES = [
  'INTERESTED',
  'APPLIED',
  'ASSESSMENT',
  'INTERVIEW',
  'SELECTED',
  'REJECTED',
];

export default function ApplicationTrackingPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Edit status modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [newStatus, setNewStatus] = useState('INTERESTED');
  const [notes, setNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchApplications = async () => {
    try {
      const url = statusFilter === 'ALL' ? '/api/applications' : `/api/applications?status=${statusFilter}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setApplications(data.applications || []);
      }
    } catch (err) {
      toast.error('Failed to load tracked applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [statusFilter]);

  const openEditModal = (app) => {
    setSelectedApp(app);
    setNewStatus(app.status);
    setNotes(app.notes || '');
    setEditModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selectedApp) return;

    setUpdating(true);
    try {
      const res = await fetch(`/api/applications/${selectedApp.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, notes }),
      });
      if (res.ok) {
        toast.success('Status updated successfully');
        setEditModalOpen(false);
        fetchApplications();
      } else {
        toast.error('Failed to update status');
      }
    } catch (err) {
      toast.error('Error updating status');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/applications/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setApplications((prev) => prev.filter((a) => a.id !== id));
        toast.success('Application removed from tracker');
      }
    } catch (err) {
      toast.error('Failed to remove');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">
            Pipeline Management
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            Application Tracker ({applications.length})
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track stage progression from initial interest through coding rounds, interviews, and offers.
          </p>
        </div>

        <Link
          href="/internships"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          Find Internships to Track
        </Link>
      </div>

      {/* Stage Filter Buttons */}
      <div className="flex flex-wrap gap-1.5 text-xs">
        <button
          onClick={() => setStatusFilter('ALL')}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
            statusFilter === 'ALL'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          All Stages
        </button>
        {STAGES.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              statusFilter === s
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Applications List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-24 bg-slate-100 animate-pulse rounded-2xl"></div>
          ))}
        </div>
      ) : applications.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <Briefcase className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No applications in this category</h3>
          <p className="text-xs text-slate-500">
            Open any internship listing and click "Apply" or "Mark as Interested" to track it here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map((app) => (
            <div
              key={app.id}
              className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-xs space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={app.status} />
                    <span className="text-[11px] text-slate-400">
                      Updated {new Date(app.updatedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <Link
                    href={`/internships/${app.internshipId}`}
                    className="text-base font-bold text-slate-900 hover:text-purple-600 block transition-colors"
                  >
                    {app.internship?.title}
                  </Link>
                  <p className="text-xs font-semibold text-slate-600">
                    {app.internship?.companyName} • {app.internship?.location} • {app.internship?.stipend}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(app)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Update Status
                  </button>
                  <button
                    onClick={() => handleDelete(app.id)}
                    title="Remove from tracker"
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Notes callout */}
              {app.notes && (
                <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-700 border border-slate-100 font-mono">
                  <strong className="text-slate-500 uppercase tracking-wider block text-[10px] mb-0.5">
                    Notes & Interview Prep:
                  </strong>
                  {app.notes}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Edit Status & Notes Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Update Application Stage"
      >
        <form onSubmit={handleUpdate} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Application Stage *
            </label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full text-sm p-2.5 rounded-xl border border-slate-300 bg-white"
            >
              {STAGES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Personal Notes & Follow-up Details
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Cleared round 1 online assessment. Round 2 technical viva scheduled with tech lead on Thursday."
              className="w-full p-2.5 rounded-xl border border-slate-300 text-sm"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setEditModalOpen(false)}
              className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updating}
              className="px-5 py-2 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-colors"
            >
              {updating ? 'Saving...' : 'Save Stage'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
