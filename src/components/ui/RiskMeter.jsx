'use client';

import React from 'react';
import { AlertCircle, ShieldCheck, AlertTriangle, ShieldAlert } from 'lucide-react';

export default function RiskMeter({ score = 0, level = 'LOW', size = 'default' }) {
  // Determine color theme based on score
  let strokeColor = '#10b981'; // green
  let textColor = 'text-emerald-600';
  let bgColor = 'bg-emerald-500';
  let ringBg = 'bg-emerald-50';
  let label = 'Low Risk Opportunity';
  let summary = 'Standard company domain, legitimate ATS channel, and no fee requests detected.';

  if (score > 60 || level === 'HIGH') {
    strokeColor = '#ef4444'; // red
    textColor = 'text-rose-600';
    bgColor = 'bg-rose-500';
    ringBg = 'bg-rose-50';
    label = 'High Risk / Likely Suspicious';
    summary = 'Multiple severe red flags detected (e.g. registration fees, suspicious URL, or student fraud reports).';
  } else if (score > 30 || level === 'MEDIUM') {
    strokeColor = '#f59e0b'; // amber
    textColor = 'text-amber-600';
    bgColor = 'bg-amber-500';
    ringBg = 'bg-amber-50';
    label = 'Moderate Risk / Exercise Caution';
    summary = 'Minor discrepancies found (e.g. public email provider, newly created domain, or third-party forms).';
  }

  // Circular gauge math (radius 40, circum 251.2)
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-subtle">
      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Circular SVG Gauge */}
        <div className="relative flex items-center justify-center shrink-0">
          <svg className="w-32 h-32 transform -rotate-90">
            {/* Background Track */}
            <circle
              cx="64"
              cy="64"
              r={radius}
              stroke="#e2e8f0"
              strokeWidth="9"
              fill="transparent"
            />
            {/* Value Track */}
            <circle
              cx="64"
              cy="64"
              r={radius}
              stroke={strokeColor}
              strokeWidth="9"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          {/* Centered Score */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className={`text-3xl font-black font-mono tracking-tight ${textColor}`}>
              {score}
            </span>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              / 100 Risk
            </span>
          </div>
        </div>

        {/* Descriptor and Gauge Scale */}
        <div className="flex-1 text-center sm:text-left space-y-2">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold ${textColor} ${ringBg} border border-current/20`}>
              {level === 'LOW' && <ShieldCheck className="w-4 h-4" />}
              {level === 'MEDIUM' && <AlertTriangle className="w-4 h-4" />}
              {level === 'HIGH' && <ShieldAlert className="w-4 h-4" />}
              {label}
            </span>
          </div>

          <p className="text-sm text-slate-600 leading-relaxed">
            {summary}
          </p>

          {/* Three Tier Bar Range */}
          <div className="pt-2">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1">
              <span>0 (Safe)</span>
              <span>30 (Low)</span>
              <span>60 (Medium)</span>
              <span>100 (High Risk)</span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden flex">
              <div className="h-full bg-emerald-500 w-[30%]" title="0-30: Low Risk"></div>
              <div className="h-full bg-amber-400 w-[30%]" title="31-60: Medium Risk"></div>
              <div className="h-full bg-rose-500 w-[40%]" title="61-100: High Risk"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
