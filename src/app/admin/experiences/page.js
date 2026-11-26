'use client';

import React, { useState, useEffect } from 'react';
import { BookOpen, CheckCircle2, XCircle, Star, Award, Trash2 } from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';
import { toast } from 'sonner';

export default function AdminExperiencesPage() {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchExperiences = async () => {
    try {
      const res = await fetch('/api/experiences?all=true&limit=100');
      if (res.ok) {
        const data = await res.json();
        setExperiences(data.items || []);
      }
    } catch (err) {
      toast.error('Failed to load experiences');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExperiences();
  }, []);

  const handleModerate = async (id, status, isVerified) => {
    try {
      const res = await fetch(`/api/experiences/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, isVerified }),
      });
      if (res.ok) {
        toast.success(`Experience status updated to ${status}`);
        fetchExperiences();
      } else {
        toast.error('Failed to update');
      }
    } catch (err) {
      toast.error('Moderation error');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this experience?')) return;
    try {
      const res = await fetch(`/api/experiences/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Experience deleted');
        setExperiences((prev) => prev.filter((e) => e.id !== id));
      }
    } catch (err) {
      toast.error('Delete error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">
          Peer Moderation
        </span>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
          Student Experience Moderation Queue ({experiences.length})
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Review interview reviews submitted by students and alumni, approve for public display, and assign Verified Senior badges.
        </p>
      </div>

      {loading ? (
        <div className="h-64 bg-slate-100 animate-pulse rounded-2xl"></div>
      ) : (
        <div className="space-y-4">
          {experiences.map((exp) => (
            <div
              key={exp.id}
              className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={exp.status} />
                    {exp.isVerified && (
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Verified Senior Review
                      </span>
                    )}
                    <span className="text-xs font-bold text-amber-700 flex items-center">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400 mr-0.5" />
                      {exp.rating}.0
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{exp.internshipRole}</h3>
                  <p className="text-xs text-slate-600">
                    Company: <strong className="text-slate-800">{exp.companyName}</strong> • Submitter:{' '}
                    <strong className="text-slate-800">{exp.user?.name}</strong> ({exp.user?.college || 'Alumni'}) • Helpful Votes: {exp.helpfulCount}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {exp.status !== 'APPROVED' && (
                    <button
                      onClick={() => handleModerate(exp.id, 'APPROVED', true)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-xs hover:bg-emerald-100 inline-flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Approve & Verify
                    </button>
                  )}
                  {exp.status !== 'REJECTED' && (
                    <button
                      onClick={() => handleModerate(exp.id, 'REJECTED', false)}
                      className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 font-bold text-xs hover:bg-rose-100 inline-flex items-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Reject
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(exp.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="text-xs text-slate-600 space-y-1.5 border-t border-slate-100 pt-2">
                <p>
                  <strong className="text-slate-700">Interview Questions:</strong>{' '}
                  <span className="font-mono text-[11px]">{exp.interviewQuestions}</span>
                </p>
                <p>
                  <strong className="text-slate-700">Advice:</strong> "{exp.adviceForJuniors}"
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
