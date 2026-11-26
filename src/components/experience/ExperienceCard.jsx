'use client';

import React, { useState } from 'react';
import { Star, ThumbsUp, CheckCircle2, Building, Briefcase, IndianRupee, Clock, HelpCircle, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

export default function ExperienceCard({ experience, onHelpfulToggled }) {
  const [helpfulCount, setHelpfulCount] = useState(experience.helpfulCount || 0);
  const [isVoted, setIsVoted] = useState(experience.isHelpfulVoted || false);
  const [loading, setLoading] = useState(false);

  const handleHelpful = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/experiences/${experience.id}/helpful`, {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok) {
        setIsVoted(data.voted);
        setHelpfulCount(data.helpfulCount);
        toast.success(data.voted ? 'Marked as helpful' : 'Vote removed');
        if (onHelpfulToggled) onHelpfulToggled(experience.id, data.helpfulCount, data.voted);
      } else {
        toast.error(data.message || 'Please log in to vote');
      }
    } catch (err) {
      toast.error('Failed to vote');
    } finally {
      setLoading(false);
    }
  };

  const initialLetter = experience.companyName ? experience.companyName.charAt(0).toUpperCase() : 'C';

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-subtle hover:shadow-card transition-all duration-150 space-y-4 flex flex-col justify-between">
      <div className="space-y-4">
        {/* Top Header: Company Avatar + Role + Rating */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 font-bold text-sm flex items-center justify-center shrink-0">
              {initialLetter}
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider">
                  {experience.domain || 'Tech Internship'}
                </span>
                {experience.isVerified && (
                  <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.2 rounded text-[10px] font-semibold">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Verified Review
                  </span>
                )}
              </div>
              <h3 className="text-base font-bold text-slate-900 leading-snug">
                {experience.internshipRole}
              </h3>
              <p className="text-xs font-medium text-slate-600">
                {experience.companyName}
              </p>
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1 bg-amber-50 border border-amber-200/80 px-2.5 py-1 rounded-lg shrink-0">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span className="text-xs font-bold text-amber-900">
              {experience.rating}.0
            </span>
          </div>
        </div>

        {/* Meta Specs: Stipend, Duration */}
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="inline-flex items-center gap-1 bg-slate-50 px-2.5 py-0.5 rounded border border-slate-200/80 font-medium text-slate-600">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            Duration: {experience.duration}
          </span>
          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded border border-emerald-200 font-semibold">
            <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />
            Stipend: {experience.stipend}
          </span>
        </div>

        {/* Structured Feedback */}
        <div className="space-y-3 text-xs text-slate-600 border-t border-slate-100 pt-3">
          {/* Selection Process */}
          <div>
            <span className="font-semibold text-slate-900 block mb-0.5">
              Selection Process:
            </span>
            <p className="text-slate-600 leading-relaxed whitespace-pre-line line-clamp-3">
              {experience.selectionProcess}
            </p>
          </div>

          {/* Interview Questions */}
          {experience.interviewQuestions && (
            <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-200/80">
              <span className="font-semibold text-slate-800 block mb-0.5 flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
                Interview Questions:
              </span>
              <p className="text-slate-600 font-mono text-[11px] leading-relaxed line-clamp-2">
                {experience.interviewQuestions}
              </p>
            </div>
          )}

          {/* Advice for Juniors */}
          {experience.adviceForJuniors && (
            <div className="bg-indigo-50/50 rounded-lg p-2.5 border border-indigo-100">
              <span className="font-semibold text-indigo-950 block mb-0.5 flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
                Senior Advice:
              </span>
              <p className="text-slate-700 leading-relaxed line-clamp-2">
                "{experience.adviceForJuniors}"
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer: Submitter info and helpful toggle */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500">
        <span className="truncate max-w-[180px]">
          By <strong className="text-slate-700">{experience.user?.name || 'Senior'}</strong>
        </span>

        <button
          onClick={handleHelpful}
          disabled={loading}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium transition-colors ${
            isVoted
              ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <ThumbsUp className={`w-3.5 h-3.5 ${isVoted ? 'fill-current' : ''}`} />
          <span>Helpful ({helpfulCount})</span>
        </button>
      </div>
    </div>
  );
}
