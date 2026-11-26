'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Heart, Github, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Intern<span className="text-indigo-400">Check</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              Don't just find internships. Verify them. InternCheck is an independent safety and verification platform that screens tech internships against registration fee scams, unverified shell companies, and fraudulent recruiter communications.
            </p>
            <div className="text-xs text-slate-500 font-mono">
              Deterministic 10-Parameter Heuristic Engine • PostgreSQL • Prisma ORM
            </div>
          </div>

          {/* Platform Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">Platform</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link href="/internships" className="hover:text-white transition-colors">
                  Browse Opportunities
                </Link>
              </li>
              <li>
                <Link href="/experiences" className="hover:text-white transition-colors">
                  Senior Interview Insights
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  Verification Heuristics
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-white transition-colors">
                  Student Application Tracker
                </Link>
              </li>
            </ul>
          </div>

          {/* Access Portals */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">Access Roles</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link href="/login" className="hover:text-white transition-colors">
                  Student Access
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition-colors">
                  Alumni / Senior Verification
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition-colors">
                  Admin Governance Portal
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-white transition-colors">
                  Create Free Account
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>
            © 2026 InternCheck Platform. Built for safe student career opportunities.
          </p>
          <p className="flex items-center gap-1 text-slate-400">
            Automated screening is an initial security barrier • Not an endorsement or financial guarantee
          </p>
        </div>
      </div>
    </footer>
  );
}
