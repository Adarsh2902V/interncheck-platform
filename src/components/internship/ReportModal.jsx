'use client';

import React, { useState } from 'react';
import Modal from '@/components/ui/Modal';
import { AlertTriangle, Send } from 'lucide-react';
import { toast } from 'sonner';

const REPORT_CATEGORIES = [
  { value: 'MONEY_ASKING', label: 'Asking for Money / Registration Fee' },
  { value: 'FAKE_COMPANY', label: 'Fake or Non-Existent Company' },
  { value: 'FAKE_JD', label: 'Misleading Job Description / Captcha Typing' },
  { value: 'FAKE_OFFER', label: 'Fake Offer Letter / Unsolicited WhatsApp Offer' },
  { value: 'PERSONAL_INFO_MISUSE', label: 'Demanding Bank Account / Aadhaar / OTP' },
  { value: 'SUSPICIOUS_COMMUNICATION', label: 'Suspicious Telegram / Informal Channel' },
  { value: 'OTHER', label: 'Other Fraudulent Activity' },
];

export default function ReportModal({ isOpen, onClose, internshipId, internshipTitle, onReportSubmitted }) {
  const [category, setCategory] = useState('MONEY_ASKING');
  const [description, setDescription] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      toast.error('Please describe the suspicious activity');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          internshipId,
          category,
          description: description.trim(),
          evidenceUrl: evidenceUrl.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || 'Report submitted successfully');
        setDescription('');
        setEvidenceUrl('');
        onClose();
        if (onReportSubmitted) onReportSubmitted();
      } else {
        toast.error(data.message || 'Failed to submit report');
      }
    } catch (err) {
      toast.error('An unexpected error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Report Suspicious Internship">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 text-xs text-rose-800 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <p>
            You are reporting <strong className="font-semibold">{internshipTitle}</strong>.
            Filing a report immediately flags this listing for administrative review and adjusts its automated risk assessment score.
          </p>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Category of Suspicious Activity *
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full text-sm py-2 px-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600 bg-white"
          >
            {REPORT_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Detailed Description of What Happened *
          </label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Explain what the recruiter asked for, why you suspect it is fake, or any money/personal documents demanded..."
            className="w-full text-sm p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600"
            required
            minLength={15}
          />
          <span className="text-[11px] text-slate-400">Minimum 15 characters. Be objective and factual.</span>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Evidence Link (Optional)
          </label>
          <input
            type="url"
            value={evidenceUrl}
            onChange={(e) => setEvidenceUrl(e.target.value)}
            placeholder="Google Drive screenshot link, Imgur, or cloud proof URL..."
            className="w-full text-sm py-2 px-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-semibold bg-rose-600 text-white hover:bg-rose-700 transition-colors shadow-sm disabled:opacity-60"
          >
            <Send className="w-4 h-4" />
            {submitting ? 'Submitting Report...' : 'Submit Report'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
