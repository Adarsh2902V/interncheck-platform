'use client';

import React from 'react';
import { ShieldCheck, AlertTriangle, AlertCircle, CheckCircle2, XCircle, Info, ShieldAlert } from 'lucide-react';
import RiskMeter from '@/components/ui/RiskMeter';

export default function RiskBreakdown({ assessment, internship }) {
  if (!assessment) return null;

  const score = assessment.score ?? internship?.riskScore ?? 0;
  const level = assessment.level ?? internship?.riskLevel ?? 'LOW';
  const factors = assessment.factors || [];
  const positiveSignals = factors.filter((f) => f.isPositive);
  const riskFactors = factors.filter((f) => !f.isPositive);

  return (
    <div className="space-y-6">
      {/* Risk Gauge Header */}
      <RiskMeter score={score} level={level} />

      {/* Official Required Disclaimer Alert */}
      <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4 flex items-start gap-3 text-amber-900 shadow-subtle">
        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <p className="font-bold">Mandatory Verification Disclaimer:</p>
          <p className="text-amber-800 leading-relaxed">
            Automated risk assessment is an initial screening tool, not a guarantee of legitimacy. Never pay money for an internship, offer letter, or training kit. Platform moderators review flagged listings, but students must always verify company credentials independently.
          </p>
        </div>
      </div>

      {/* Two Column Grid: Negative Risk Factors vs Positive Signals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Identified Risk Factors */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-subtle space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h4 className="text-sm font-bold text-rose-900 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              Identified Risk Indicators ({riskFactors.length})
            </h4>
            <span className="text-[11px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200/60">
              Increases Risk
            </span>
          </div>

          {riskFactors.length === 0 ? (
            <p className="text-xs text-slate-500 py-3 italic">
              No negative risk indicators detected for this listing.
            </p>
          ) : (
            <div className="space-y-2.5">
              {riskFactors.map((rf, idx) => (
                <div
                  key={idx}
                  className="bg-rose-50/60 border border-rose-100 rounded-lg p-3 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-rose-800 flex items-center gap-1.5">
                      <XCircle className="w-3.5 h-3.5 text-rose-500" />
                      {rf.title}
                    </span>
                    <span className="font-mono font-bold text-rose-600 bg-rose-100 px-1.5 py-0.5 rounded text-[10px]">
                      +{rf.scoreImpact} pts
                    </span>
                  </div>
                  <p className="text-slate-600 leading-relaxed pl-5">
                    {rf.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Positive Verification Signals */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-subtle space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h4 className="text-sm font-bold text-emerald-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Positive Verification Signals ({positiveSignals.length})
            </h4>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
              Reduces Risk
            </span>
          </div>

          {positiveSignals.length === 0 ? (
            <p className="text-xs text-slate-500 py-3 italic">
              No positive signals verified yet.
            </p>
          ) : (
            <div className="space-y-2.5">
              {positiveSignals.map((ps, idx) => (
                <div
                  key={idx}
                  className="bg-emerald-50/50 border border-emerald-100/80 rounded-xl p-3 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-800 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      {ps.title}
                    </span>
                    <span className="font-mono font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded text-[10px]">
                      {ps.scoreImpact} pts
                    </span>
                  </div>
                  <p className="text-slate-600 leading-relaxed pl-5">
                    {ps.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Assessment Audit Meta */}
      <div className="text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-2 px-1">
        <span>
          Rule Engine: InternCheck Heuristics v2.4 (10-parameter weighted matrix)
        </span>
        <span>
          Last evaluated:{' '}
          {assessment.assessedAt
            ? new Date(assessment.assessedAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })
            : 'Recently'}
        </span>
      </div>
    </div>
  );
}
