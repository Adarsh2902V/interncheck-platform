'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShieldCheck, ShieldAlert, RefreshCw, Edit2, AlertTriangle, ExternalLink } from 'lucide-react';
import RiskBadge from '@/components/ui/RiskBadge';
import Modal from '@/components/ui/Modal';
import { toast } from 'sonner';

export default function AdminVerificationCenterPage() {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);

  // Override Modal state
  const [overrideModalOpen, setOverrideModalOpen] = useState(false);
  const [selectedInternship, setSelectedInternship] = useState(null);
  const [overrideScore, setOverrideScore] = useState(20);
  const [overrideLevel, setOverrideLevel] = useState('LOW');
  const [overrideReason, setOverrideReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchInternships = async () => {
    try {
      const res = await fetch('/api/internships?all=true&limit=100');
      if (res.ok) {
        const data = await res.json();
        setInternships(data.items || []);
      }
    } catch (err) {
      toast.error('Failed to load listings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInternships();
  }, []);

  const handleRecalculate = async (id) => {
    try {
      const res = await fetch(`/api/internships/${id}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'RECALCULATE' }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        fetchInternships();
      } else {
        toast.error('Recalculation failed');
      }
    } catch (err) {
      toast.error('Error recalculating risk');
    }
  };

  const openOverrideModal = (item) => {
    setSelectedInternship(item);
    setOverrideScore(item.riskScore || 20);
    setOverrideLevel(item.riskLevel || 'LOW');
    setOverrideReason('');
    setOverrideModalOpen(true);
  };

  const handleOverrideSubmit = async (e) => {
    e.preventDefault();
    if (!overrideReason.trim()) {
      toast.error('Please specify an administrative override reason');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/internships/${selectedInternship.id}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'OVERRIDE',
          score: overrideScore,
          level: overrideLevel,
          reason: overrideReason.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        setOverrideModalOpen(false);
        fetchInternships();
      } else {
        toast.error('Override failed');
      }
    } catch (err) {
      toast.error('Error submitting override');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">
          Security Operations
        </span>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
          Risk Assessment Engine Center
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Review automated heuristic scores, trigger on-demand recalculations, and apply administrative overrides with audit logs.
        </p>
      </div>

      {loading ? (
        <div className="h-64 bg-slate-100 animate-pulse rounded-2xl"></div>
      ) : (
        <div className="space-y-4">
          {internships.map((item) => (
            <div
              key={item.id}
              className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <RiskBadge score={item.riskScore} level={item.riskLevel} />
                    <span className="text-xs font-bold text-slate-400 font-mono">
                      Reports: {item.reportCount}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                  <p className="text-xs text-slate-600">
                    {item.companyName} • Source: {item.listingSource} •{' '}
                    <a
                      href={item.applicationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:underline font-mono inline-flex items-center gap-0.5"
                    >
                      {item.applicationUrl.substring(0, 45)}... <ExternalLink className="w-3 h-3" />
                    </a>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleRecalculate(item.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                    Recalculate
                  </button>
                  <button
                    onClick={() => openOverrideModal(item)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-purple-200 bg-purple-50 text-xs font-bold text-purple-700 hover:bg-purple-100"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Override Score
                  </button>
                </div>
              </div>

              {/* Factors pill summary */}
              {item.riskAssessment?.factors && (
                <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-1.5 text-[11px]">
                  {item.riskAssessment.factors.map((f, idx) => (
                    <span
                      key={idx}
                      className={`px-2 py-0.5 rounded font-mono font-medium ${
                        f.isPositive
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}
                    >
                      {f.title} ({f.isPositive ? f.scoreImpact : `+${f.scoreImpact}`})
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Admin Risk Override Modal */}
      <Modal
        isOpen={overrideModalOpen}
        onClose={() => setOverrideModalOpen(false)}
        title="Admin Risk Assessment Override"
      >
        <form onSubmit={handleOverrideSubmit} className="space-y-4 text-xs">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-amber-900 leading-relaxed">
            Overriding this risk assessment will adjust the public score displayed to students and record an entry in the platform audit log.
          </div>

          <div className="space-y-1">
            <label className="block font-bold text-slate-700 uppercase tracking-wider">
              Target Listing:
            </label>
            <p className="font-semibold text-slate-900 text-sm">
              {selectedInternship?.title} ({selectedInternship?.companyName})
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                New Risk Score (0-100) *
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={overrideScore}
                onChange={(e) => setOverrideScore(Number(e.target.value))}
                className="w-full text-sm p-2 rounded-xl border border-slate-300 font-mono font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Risk Level Category *
              </label>
              <select
                value={overrideLevel}
                onChange={(e) => setOverrideLevel(e.target.value)}
                className="w-full text-sm p-2 rounded-xl border border-slate-300 bg-white"
              >
                <option value="LOW">LOW Risk (0-30)</option>
                <option value="MEDIUM">MEDIUM Risk (31-60)</option>
                <option value="HIGH">HIGH Risk (61-100)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Override Justification Reason *
            </label>
            <textarea
              rows={3}
              required
              value={overrideReason}
              onChange={(e) => setOverrideReason(e.target.value)}
              placeholder="e.g. Manually verified MCA corporate registration and campus recruitment team credentials."
              className="w-full text-sm p-2.5 rounded-xl border border-slate-300"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setOverrideModalOpen(false)}
              className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-colors"
            >
              {submitting ? 'Applying Override...' : 'Confirm Override'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
