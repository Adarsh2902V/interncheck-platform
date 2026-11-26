'use client';

import React from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle } from 'lucide-react';

export default function RiskBadge({ score = 0, level = 'LOW', size = 'md', showScore = true }) {
  let config = {
    LOW: {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
      pill: 'bg-emerald-600 text-white',
      icon: ShieldCheck,
      label: 'Low Risk',
      ring: 'ring-emerald-500/20',
    },
    MEDIUM: {
      bg: 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100',
      pill: 'bg-amber-600 text-white',
      icon: AlertTriangle,
      label: 'Medium Risk',
      ring: 'ring-amber-500/20',
    },
    HIGH: {
      bg: 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100',
      pill: 'bg-rose-600 text-white',
      icon: ShieldAlert,
      label: 'High Risk / Suspicious',
      ring: 'ring-rose-500/20',
    },
  };

  const current = config[level] || config.LOW;
  const Icon = current.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1.5',
    md: 'text-xs px-2.5 py-1 gap-2',
    lg: 'text-sm px-3.5 py-1.5 gap-2.5 font-medium',
  };

  return (
    <div
      className={`inline-flex items-center font-semibold border rounded-md transition-colors ${current.bg} ${sizeClasses[size]}`}
    >
      <Icon className={size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
      <span>{current.label}</span>
      {showScore && (
        <span
          className={`font-mono font-bold px-1.5 py-0.5 rounded text-[10px] leading-tight ${current.pill}`}
        >
          {score}/100
        </span>
      )}
    </div>
  );
}
