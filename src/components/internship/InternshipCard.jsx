'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Bookmark, MapPin, Briefcase, IndianRupee, Clock, ExternalLink, ShieldCheck, AlertCircle, ArrowRight } from 'lucide-react';
import RiskBadge from '@/components/ui/RiskBadge';
import { toast } from 'sonner';

export default function InternshipCard({ internship, onSaveToggle }) {
  const [isSaved, setIsSaved] = useState(internship.isSaved || false);
  const [saving, setSaving] = useState(false);

  const handleBookmark = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (saving) return;

    setSaving(true);
    try {
      const res = await fetch('/api/saved', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ internshipId: internship.id }),
      });
      const data = await res.json();
      if (res.ok) {
        setIsSaved(data.saved);
        toast.success(data.message);
        if (onSaveToggle) onSaveToggle(internship.id, data.saved);
      } else {
        toast.error(data.message || 'Please log in to save internships');
      }
    } catch (err) {
      toast.error('Failed to update bookmark');
    } finally {
      setSaving(false);
    }
  };

  const skillsList = internship.requiredSkills
    ? internship.requiredSkills.split(',').map((s) => s.trim()).slice(0, 3)
    : [];

  const initialLetter = internship.companyName ? internship.companyName.charAt(0).toUpperCase() : 'C';

  return (
    <div className="group relative bg-white rounded-xl border border-slate-200 hover:border-slate-300 shadow-subtle hover:shadow-card transition-all duration-150 flex flex-col justify-between overflow-hidden">
      {/* Top Banner on High Risk */}
      {internship.riskLevel === 'HIGH' && (
        <div className="bg-rose-50 border-b border-rose-100 px-4 py-1.5 flex items-center gap-1.5 text-xs font-semibold text-rose-700">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>High Risk Detected — Exercise caution before applying</span>
        </div>
      )}

      <div className="p-5 space-y-4">
        {/* Header: Company Avatar + Info + Bookmark */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            {/* Company lettermark avatar */}
            <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 font-bold text-sm flex items-center justify-center shrink-0">
              {initialLetter}
            </div>

            <div className="space-y-0.5 min-w-0">
              <span className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider block">
                {internship.domain || 'Technology'}
              </span>
              <Link
                href={`/internships/${internship.id}`}
                className="block group-hover:text-indigo-600 transition-colors"
              >
                <h3 className="text-base font-bold text-slate-900 truncate">
                  {internship.title}
                </h3>
              </Link>
              <p className="text-xs font-medium text-slate-600 truncate">
                {internship.companyName}
              </p>
            </div>
          </div>

          <button
            onClick={handleBookmark}
            disabled={saving}
            className={`p-2 rounded-lg border transition-colors shrink-0 ${
              isSaved
                ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
                : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50'
            }`}
            title={isSaved ? 'Remove Bookmark' : 'Save Internship'}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Key Attributes Pills */}
        <div className="flex flex-wrap gap-1.5 text-xs text-slate-600">
          <span className="inline-flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded border border-slate-200/80 font-medium">
            <MapPin className="w-3 h-3 text-slate-400" />
            {internship.location}
          </span>
          <span className="inline-flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded border border-slate-200/80 font-medium">
            <Briefcase className="w-3 h-3 text-slate-400" />
            {internship.workMode}
          </span>
          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
            {internship.stipend}
          </span>
        </div>

        {/* Snippet Description */}
        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
          {internship.description}
        </p>

        {/* Skills Tag Pills */}
        {skillsList.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {skillsList.map((skill, idx) => (
              <span
                key={idx}
                className="text-[11px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded"
              >
                {skill}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer: Risk Badge & View CTA */}
      <div className="px-5 py-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-3">
        <RiskBadge
          score={internship.riskScore}
          level={internship.riskLevel}
          size="sm"
          showScore={true}
        />

        <Link
          href={`/internships/${internship.id}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-indigo-600 transition-colors"
        >
          <span>Audit Details</span>
          <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-indigo-600 transition-colors" />
        </Link>
      </div>
    </div>
  );
}
