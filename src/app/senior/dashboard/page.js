'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, Plus, ThumbsUp, Star, CheckCircle2, User, ExternalLink } from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';
import { toast } from 'sonner';

export default function SeniorDashboardPage() {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAlumniData() {
      try {
        const res = await fetch('/api/experiences?all=true');
        if (res.ok) {
          const data = await res.json();
          setExperiences(data.items || []);
        }
      } catch (err) {
        toast.error('Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    }
    loadAlumniData();
  }, []);

  const totalHelpful = experiences.reduce((acc, curr) => acc + (curr.helpfulCount || 0), 0);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">
            Alumni & Senior Portal
          </span>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mt-0.5">
            Senior Mentor Dashboard
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Empower juniors by sharing genuine interview experiences, selection rounds, and company work culture.
          </p>
        </div>

        <Link
          href="/senior/submit-experience"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 text-white font-semibold text-sm hover:bg-purple-700 transition-all shadow-md shadow-purple-900/20"
        >
          <Plus className="w-4 h-4 text-white" />
          Share Internship Experience
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-1 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase">Submissions</span>
          <p className="text-3xl font-black text-slate-900">{experiences.length}</p>
          <p className="text-xs text-slate-400">Published and active reviews</p>
        </div>

        <div className="bg-white rounded-2xl border border-purple-200 p-6 space-y-1 shadow-sm">
          <span className="text-xs font-semibold text-purple-700 uppercase">Total Helpful Votes</span>
          <p className="text-3xl font-black text-purple-900">{totalHelpful}</p>
          <p className="text-xs text-purple-600 font-medium">Students benefited from your reviews</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-1 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase">Status</span>
          <p className="text-xl font-bold text-emerald-600 flex items-center gap-1.5 mt-1">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            Verified Contributor
          </p>
          <p className="text-xs text-slate-400">Automatic verified senior badge enabled</p>
        </div>
      </div>

      {/* Submissions List */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">
          Your Contributed Experiences ({experiences.length})
        </h2>

        {loading ? (
          <div className="h-40 bg-slate-100 animate-pulse rounded-2xl"></div>
        ) : experiences.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">No experiences submitted yet</h3>
            <p className="text-xs text-slate-500">
              Share details about your internship interviews, stipend, and offer to guide college juniors.
            </p>
            <Link
              href="/senior/submit-experience"
              className="inline-block px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold"
            >
              Submit Your First Review
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {experiences.map((exp) => (
              <div
                key={exp.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">
                      {exp.companyName}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900">{exp.internshipRole}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={exp.status} />
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg">
                      <ThumbsUp className="w-3.5 h-3.5 text-purple-600" />
                      {exp.helpfulCount} Helpful
                    </span>
                  </div>
                </div>

                <div className="text-xs text-slate-600 space-y-2 border-t border-slate-100 pt-3">
                  <p>
                    <strong className="text-slate-800">Selection Process:</strong> {exp.selectionProcess}
                  </p>
                  <p className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 font-mono text-[11px]">
                    <strong className="text-slate-800 font-sans block mb-0.5">Interview Questions:</strong>
                    {exp.interviewQuestions}
                  </p>
                  <p>
                    <strong className="text-slate-800">Advice for Juniors:</strong> "{exp.adviceForJuniors}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
