'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, Star, Trash2, CheckCircle2, Clock } from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';
import { toast } from 'sonner';

export default function MyExperiencesPage() {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyExperiences = async () => {
    try {
      const res = await fetch('/api/experiences?all=true');
      if (res.ok) {
        const data = await res.json();
        setExperiences(data.items || []);
      }
    } catch (err) {
      toast.error('Failed to load your submitted experiences');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyExperiences();
  }, []);

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/experiences/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setExperiences((prev) => prev.filter((e) => e.id !== id));
        toast.success('Experience deleted');
      }
    } catch (err) {
      toast.error('Failed to delete experience');
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">
            Contributions
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            My Submitted Experiences ({experiences.length})
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Interviews and company reviews you have shared to guide fellow students.
          </p>
        </div>

        <Link
          href="/senior/submit-experience"
          className="px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700 transition-colors shadow-xs"
        >
          + Share New Experience
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((n) => (
            <div key={n} className="h-28 bg-slate-100 animate-pulse rounded-2xl"></div>
          ))}
        </div>
      ) : experiences.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No experiences submitted yet</h3>
          <p className="text-xs text-slate-500">
            Have you completed an internship or given interviews? Share your insights to help juniors.
          </p>
          <Link
            href="/senior/submit-experience"
            className="inline-block px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold"
          >
            Submit an Experience
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {experiences.map((exp) => (
            <div
              key={exp.id}
              className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={exp.status} />
                    {exp.isVerified && (
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Verified Senior Badge
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{exp.internshipRole}</h3>
                  <p className="text-xs font-semibold text-slate-700">
                    {exp.companyName} • Rating: {exp.rating}/5 ⭐ • Helpful Votes: {exp.helpfulCount}
                  </p>
                </div>

                <button
                  onClick={() => handleDelete(exp.id)}
                  title="Delete experience"
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                "{exp.adviceForJuniors}"
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
