'use client';

import React from 'react';
import { Search, RotateCcw } from 'lucide-react';
import { DOMAINS } from '@/components/internship/InternshipFilters';

export default function ExperienceFilters({ filters, onChange, onReset }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-4">
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={filters.search || ''}
          onChange={(e) => onChange({ search: e.target.value })}
          placeholder="Search experiences by company name, role, or keywords..."
          className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Tech Domain
          </label>
          <select
            value={filters.domain || 'ALL'}
            onChange={(e) => onChange({ domain: e.target.value })}
            className="w-full text-xs py-2 px-3 rounded-xl border border-slate-200 bg-white"
          >
            {DOMAINS.map((d) => (
              <option key={d} value={d}>
                {d === 'ALL' ? 'All Domains' : d}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Minimum Rating
          </label>
          <select
            value={filters.rating || 'ALL'}
            onChange={(e) => onChange({ rating: e.target.value })}
            className="w-full text-xs py-2 px-3 rounded-xl border border-slate-200 bg-white"
          >
            <option value="ALL">All Ratings</option>
            <option value="5">5 Stars only</option>
            <option value="4">4+ Stars</option>
            <option value="3">3+ Stars</option>
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={onReset}
            className="w-full py-2 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 inline-flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Filters
          </button>
        </div>
      </div>
    </div>
  );
}
