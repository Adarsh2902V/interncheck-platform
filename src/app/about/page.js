'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Database, Code, Cpu, Server, CheckCircle2, AlertTriangle, Layers, BookOpen, ExternalLink } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Title */}
      <div className="space-y-3 text-center sm:text-left border-b border-slate-200 pb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold border border-purple-200">
          <Cpu className="w-3.5 h-3.5" />
          <span>Major Project Specification • B.Tech CSE </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          System Architecture & Technical Design
        </h1>
        <p className="text-base text-slate-600 max-w-3xl leading-relaxed">
          InternCheck addresses the widespread problem of fraudulent internship listings and registration fee scams targeting engineering students through a modular monolithic architecture, PostgreSQL relational schema, and deterministic 10-parameter rule-based risk evaluation.
        </p>
      </div>

      {/* 3 Core Modules */}
      <div className="space-y-6">
        <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
          <Layers className="w-5 h-5 text-purple-600" />
          Three Integrated Core Modules
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center font-bold text-sm">
              M1
            </div>
            <h3 className="text-base font-bold text-slate-900">Internship Listing Service</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Provides robust REST endpoints for CRUD operations on internship listings, multi-parameter search, domain filtering, stipend sorting, bookmarking, and moderation workflow.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-purple-200 p-6 space-y-3 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold text-sm">
              M2
            </div>
            <h3 className="text-base font-bold text-slate-900">Verification & Risk Assessment</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Primary highlight of the system. Evaluates 10 weighted heuristic rules, calculates normalized 0–100 risk scores, isolates individual risk factors, and updates dynamically.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-sm">
              M3
            </div>
            <h3 className="text-base font-bold text-slate-900">Student Experience Repository</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Community platform where seniors and alumni submit verified interview questions, selection processes, stipends, and peer reviews with helpful vote moderation.
            </p>
          </div>
        </div>
      </div>

      {/* Verification Engine 10 Parameters Table */}
      <div className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            10-Parameter Rule-Based Risk Engine Matrix
          </h2>
          <p className="text-xs text-slate-500">
            Weighted scoring logic executed in <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">services/riskAssessmentService.js</code>
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">Evaluation Parameter</th>
                  <th className="py-3 px-4">Detection Mechanism</th>
                  <th className="py-3 px-4">Risk Impact</th>
                  <th className="py-3 px-4">Positive Signal Impact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                <tr>
                  <td className="py-3 px-4 font-mono font-bold">01</td>
                  <td className="py-3 px-4 font-semibold text-slate-800">Company Website</td>
                  <td className="py-3 px-4">Validates URL protocol, reachability format</td>
                  <td className="py-3 px-4 text-rose-600 font-bold">+12 pts (Missing)</td>
                  <td className="py-3 px-4 text-emerald-600 font-bold">-5 pts (Active URL)</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-mono font-bold">02</td>
                  <td className="py-3 px-4 font-semibold text-slate-800">Email Authenticity</td>
                  <td className="py-3 px-4">Public Gmail/Yahoo vs Custom Corporate Domain match</td>
                  <td className="py-3 px-4 text-rose-600 font-bold">+15 pts (Free domain)</td>
                  <td className="py-3 px-4 text-emerald-600 font-bold">-12 pts (Domain match)</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-mono font-bold">03</td>
                  <td className="py-3 px-4 font-semibold text-slate-800">Registration / Training Fees</td>
                  <td className="py-3 px-4">Scans for "security deposit", "registration fee", "kit fee"</td>
                  <td className="py-3 px-4 text-rose-600 font-bold">+35 pts (Critical Red Flag)</td>
                  <td className="py-3 px-4 text-emerald-600 font-bold">-6 pts (Free verified)</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-mono font-bold">04</td>
                  <td className="py-3 px-4 font-semibold text-slate-800">Stipend Realism</td>
                  <td className="py-3 px-4">Checks if stipend &gt; ₹1,20,000 or promises daily payouts</td>
                  <td className="py-3 px-4 text-rose-600 font-bold">+18 pts (Clickbait/Scam)</td>
                  <td className="py-3 px-4 text-emerald-600 font-bold">-6 pts (Standard range)</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-mono font-bold">05</td>
                  <td className="py-3 px-4 font-semibold text-slate-800">Company Information Depth</td>
                  <td className="py-3 px-4">String length heuristic & detailed deliverables check</td>
                  <td className="py-3 px-4 text-rose-600 font-bold">+12 pts (Sparse/vague)</td>
                  <td className="py-3 px-4 text-emerald-600 font-bold">-6 pts (Comprehensive)</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-mono font-bold">06</td>
                  <td className="py-3 px-4 font-semibold text-slate-800">Application URL Pattern</td>
                  <td className="py-3 px-4">Checks forms.gle, bit.ly, t.me vs Greenhouse/Lever/Workday</td>
                  <td className="py-3 px-4 text-rose-600 font-bold">+16 pts (Free Form/Chat)</td>
                  <td className="py-3 px-4 text-emerald-600 font-bold">-12 pts (Enterprise ATS)</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-mono font-bold">07</td>
                  <td className="py-3 px-4 font-semibold text-slate-800">Scam JD Keywords</td>
                  <td className="py-3 px-4">Detects "captcha typing", "copy paste", "guaranteed offer"</td>
                  <td className="py-3 px-4 text-rose-600 font-bold">+22 pts (Flagged phrases)</td>
                  <td className="py-3 px-4 text-slate-400">Neutral</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-mono font-bold">08</td>
                  <td className="py-3 px-4 font-semibold text-slate-800">Sensitive Information</td>
                  <td className="py-3 px-4">Flags upfront demands for bank accounts, OTPs, Aadhaar</td>
                  <td className="py-3 px-4 text-rose-600 font-bold">+28 pts (Identity theft)</td>
                  <td className="py-3 px-4 text-slate-400">Neutral</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-mono font-bold">09</td>
                  <td className="py-3 px-4 font-semibold text-slate-800">Admin Verification</td>
                  <td className="py-3 px-4">Admin moderation record state in PostgreSQL</td>
                  <td className="py-3 px-4 text-rose-600 font-bold">+45 pts (Rejected listing)</td>
                  <td className="py-3 px-4 text-emerald-600 font-bold">-18 pts (Verified badge)</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-mono font-bold">10</td>
                  <td className="py-3 px-4 font-semibold text-slate-800">Community Reports</td>
                  <td className="py-3 px-4">Aggregates verified student reports filed in database</td>
                  <td className="py-3 px-4 text-rose-600 font-bold">+12 pts / report (up to +36)</td>
                  <td className="py-3 px-4 text-slate-400">Neutral</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Technology Stack Grid */}
      <div className="space-y-6">
        <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
          <Database className="w-5 h-5 text-brand-700" />
          Production Engineering Stack
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-1">
            <span className="text-[11px] font-bold text-purple-600 uppercase">Frontend</span>
            <p className="font-bold text-slate-900 text-sm">Next.js (App Router)</p>
            <p className="text-xs text-slate-500">React 18, Tailwind CSS, Lucide Icons, Sonner</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-1">
            <span className="text-[11px] font-bold text-purple-600 uppercase">Backend</span>
            <p className="font-bold text-slate-900 text-sm">Node.js Route Handlers</p>
            <p className="text-xs text-slate-500">RESTful APIs, JWT Auth, bcrypt password hashing</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-1">
            <span className="text-[11px] font-bold text-purple-600 uppercase">Database & ORM</span>
            <p className="font-bold text-slate-900 text-sm">PostgreSQL + Prisma</p>
            <p className="text-xs text-slate-500">10 relational models, foreign keys, cascades, indexes</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-1">
            <span className="text-[11px] font-bold text-purple-600 uppercase">Analytics</span>
            <p className="font-bold text-slate-900 text-sm">Recharts Library</p>
            <p className="text-xs text-slate-500">Risk distribution bars, domain breakdown, pie charts</p>
          </div>
        </div>
      </div>

      {/* Viva / Demo Quick Links CTA */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 space-y-4">
        <h3 className="text-xl font-bold">Ready to demonstrate the platform?</h3>
        <p className="text-xs text-slate-300 max-w-xl">
          Use the quick 1-click login buttons on the login page to easily switch between Student, Alumni, and Administrator roles during project demonstration and viva evaluation.
        </p>
        <div className="flex gap-3">
          <Link
            href="/login"
            className="px-5 py-2.5 bg-purple-600 text-white font-bold text-xs rounded-xl hover:bg-purple-700"
          >
            Go to Demo Login
          </Link>
          <Link
            href="/internships"
            className="px-5 py-2.5 bg-slate-800 text-slate-200 font-bold text-xs rounded-xl hover:bg-slate-700 border border-slate-700"
          >
            Explore Internships
          </Link>
        </div>
      </div>
    </div>
  );
}
