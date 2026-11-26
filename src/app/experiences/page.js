'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { BookOpen, Plus, Search, Building2, Star, ChevronLeft, ChevronRight, Award } from 'lucide-react';
import ExperienceCard from '@/components/experience/ExperienceCard';
import ExperienceFilters from '@/components/experience/ExperienceFilters';
import { toast } from 'sonner';

export default function ExperiencesPage() {
  const [experiences, setExperiences] = useState([]);
  const [topCompanies, setTopCompanies] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [filters, setFilters] = useState({
    search: '',
    domain: 'ALL',
    rating: 'ALL',
  });
  const [loading, setLoading] = useState(true);

  const fetchExperiences = useCallback(
    async (currentPage = 1) => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams({
          page: currentPage.toString(),
          limit: '10',
          search: filters.search,
          domain: filters.domain,
          rating: filters.rating,
        });

        const res = await fetch(`/api/experiences?${queryParams.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setExperiences(data.items || []);
          setTopCompanies(data.topCompanies || []);
          setPagination(data.pagination || { page: 1, total: 0, totalPages: 1 });
        }
      } catch (err) {
        toast.error('Failed to load student experiences');
      } finally {
        setLoading(false);
      }
    },
    [filters]
  );

  useEffect(() => {
    fetchExperiences(1);
  }, [fetchExperiences]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">
            Peer Knowledge Repository
          </span>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mt-0.5">
            Student & Alumni Experiences
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Real interview questions, selection processes, stipends, and work culture feedback shared by verified seniors.
          </p>
        </div>

        <Link
          href="/senior/submit-experience"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 text-white font-semibold text-sm hover:bg-purple-700 transition-all shadow-md shadow-purple-900/20"
        >
          <Plus className="w-4 h-4 text-white" />
          Share Your Experience
        </Link>
      </div>

      {/* Top rated companies horizontal pills */}
      {topCompanies.length > 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Most Reviewed Companies by Seniors:
          </span>
          <div className="flex flex-wrap gap-2">
            {topCompanies.map((c, idx) => (
              <button
                key={idx}
                onClick={() => setFilters({ ...filters, search: c.companyName })}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 hover:border-purple-300 rounded-xl text-xs font-semibold text-slate-800 transition-colors shadow-2xs"
              >
                <Building2 className="w-3.5 h-3.5 text-purple-600" />
                <span>{c.companyName}</span>
                <span className="flex items-center text-amber-600 font-mono text-[11px]">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400 mr-0.5" />
                  {c.avgRating}
                </span>
                <span className="text-[10px] text-slate-400 font-normal">({c.count})</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <ExperienceFilters
        filters={filters}
        onChange={(newFilters) => setFilters((prev) => ({ ...prev, ...newFilters }))}
        onReset={() => setFilters({ search: '', domain: 'ALL', rating: 'ALL' })}
      />

      {/* Experience Feed */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-44 bg-slate-200 animate-pulse rounded-2xl"></div>
          ))}
        </div>
      ) : experiences.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <BookOpen className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No student experiences found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Be the first to share an interview experience or company review to guide your juniors!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {experiences.map((exp) => (
            <ExperienceCard key={exp.id} experience={exp} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <button
            onClick={() => fetchExperiences(pagination.page - 1)}
            disabled={pagination.page <= 1}
            className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 disabled:opacity-40 hover:bg-slate-50"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-slate-700 px-3 py-2 bg-white rounded-xl border border-slate-200">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            onClick={() => fetchExperiences(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
            className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 disabled:opacity-40 hover:bg-slate-50"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
