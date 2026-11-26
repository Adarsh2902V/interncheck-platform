'use client';

import React from 'react';
import { Search, Filter, RotateCcw } from 'lucide-react';

export const DOMAINS = [
  'ALL',
  'Web Development',
  'Backend Development',
  'Software Engineering',
  'Artificial Intelligence',
  'Data Science',
  'Mobile App Development',
  'Cybersecurity',
  'DevOps / Cloud',
  'Game Development',
];

export const WORK_MODES = [
  { value: 'ALL', label: 'All Modes' },
  { value: 'REMOTE', label: 'Remote' },
  { value: 'HYBRID', label: 'Hybrid' },
  { value: 'ONSITE', label: 'On-site' },
];

export const RISK_LEVELS = [
  { value: 'ALL', label: 'All Risk Levels' },
  { value: 'LOW', label: 'Low Risk (Verified/Safe)' },
  { value: 'MEDIUM', label: 'Medium Risk' },
  { value: 'HIGH', label: 'High Risk (Suspicious)' },
];

export default function InternshipFilters({ filters, onChange, onReset }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-subtle space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={filters.search || ''}
          onChange={(e) => onChange({ search: e.target.value })}
          placeholder="Search by company name, title, or skills (e.g. React, Node.js, Python)..."
          className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors placeholder:text-slate-400"
        />
      </div>

      {/* Filter Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Domain Select */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
            Domain
          </label>
          <select
            value={filters.domain || 'ALL'}
            onChange={(e) => onChange({ domain: e.target.value })}
            className="w-full text-xs py-2 px-3 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-800"
          >
            {DOMAINS.map((d) => (
              <option key={d} value={d}>
                {d === 'ALL' ? 'All Tech Domains' : d}
              </option>
            ))}
          </select>
        </div>

        {/* Work Mode */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
            Work Mode
          </label>
          <select
            value={filters.workMode || 'ALL'}
            onChange={(e) => onChange({ workMode: e.target.value })}
            className="w-full text-xs py-2 px-3 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-800"
          >
            {WORK_MODES.map((wm) => (
              <option key={wm.value} value={wm.value}>
                {wm.label}
              </option>
            ))}
          </select>
        </div>

        {/* Risk Level Filter (Key Highlight) */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
            Risk Assessment
          </label>
          <select
            value={filters.riskLevel || 'ALL'}
            onChange={(e) => onChange({ riskLevel: e.target.value })}
            className="w-full text-xs py-2 px-3 rounded-lg border border-slate-200 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-800"
          >
            {RISK_LEVELS.map((rl) => (
              <option key={rl.value} value={rl.value}>
                {rl.label}
              </option>
            ))}
          </select>
        </div>

        {/* Compensation / Paid status */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
            Stipend Type
          </label>
          <select
            value={filters.isPaid ?? 'ALL'}
            onChange={(e) => onChange({ isPaid: e.target.value })}
            className="w-full text-xs py-2 px-3 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-800"
          >
            <option value="ALL">All Internships</option>
            <option value="true">Paid Only</option>
            <option value="false">Unpaid Only</option>
          </select>
        </div>

        {/* Sort By */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
            Sort By
          </label>
          <select
            value={filters.sortBy || 'latest'}
            onChange={(e) => onChange({ sortBy: e.target.value })}
            className="w-full text-xs py-2 px-3 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium text-slate-800"
          >
            <option value="latest">Latest Posted</option>
            <option value="stipend">Highest Stipend</option>
            <option value="riskAsc">Lowest Risk Score</option>
            <option value="riskDesc">Highest Risk Score</option>
          </select>
        </div>
      </div>

      {/* Active filters and reset */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
        <span className="text-slate-500">
          Filter by parameters to screen opportunities before applying.
        </span>
        <button
          onClick={onReset}
          className="inline-flex items-center gap-1 font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Filters
        </button>
      </div>
    </div>
  );
}
