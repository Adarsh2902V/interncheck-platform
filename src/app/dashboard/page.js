'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  Bookmark,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  BookOpen,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import RiskBadge from '@/components/ui/RiskBadge';
import StatusBadge from '@/components/ui/StatusBadge';

export default function StudentDashboardPage() {
  const [stats, setStats] = useState(null);
  const [saved, setSaved] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [intRes, savedRes, appRes, expRes, repRes] = await Promise.all([
          fetch('/api/internships?limit=100'),
          fetch('/api/saved'),
          fetch('/api/applications'),
          fetch('/api/experiences?limit=100'),
          fetch('/api/reports'),
        ]);

        const intData = intRes.ok ? await intRes.json() : { items: [] };
        const savedData = savedRes.ok ? await savedRes.json() : { saved: [] };
        const appData = appRes.ok ? await appRes.json() : { applications: [] };
        const repData = repRes.ok ? await repRes.json() : { reports: [] };

        const allInts = intData.items || [];
        const lowRiskCount = allInts.filter((i) => i.riskLevel === 'LOW').length;
        const medRiskCount = allInts.filter((i) => i.riskLevel === 'MEDIUM').length;
        const highRiskCount = allInts.filter((i) => i.riskLevel === 'HIGH').length;

        setSaved(savedData.saved || []);
        setApplications(appData.applications || []);

        setStats({
          totalInternships: allInts.length,
          lowRiskCount,
          medRiskCount,
          highRiskCount,
          savedCount: (savedData.saved || []).length,
          applicationsCount: (appData.applications || []).length,
          reportsCount: (repData.reports || []).length,
          riskChartData: [
            { name: 'Low Risk', value: lowRiskCount, color: '#10b981' },
            { name: 'Medium Risk', value: medRiskCount, color: '#f59e0b' },
            { name: 'High Risk', value: highRiskCount, color: '#ef4444' },
          ],
        });
      } catch (err) {
        console.error('Failed to load student dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-slate-200 animate-pulse w-1/3 rounded-xl"></div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-24 bg-slate-200 animate-pulse rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="border-b border-slate-100 pb-4">
        <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">
          Student Workspace
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5">
          Internship Safety & Application Dashboard
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Monitor your tracked applications, review saved opportunities, and verify risk ratings.
        </p>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 space-y-1">
          <span className="text-slate-500 text-xs font-semibold">Available Listings</span>
          <p className="text-2xl font-black text-slate-900">{stats?.totalInternships || 0}</p>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>{stats?.lowRiskCount || 0} Low Risk</span>
          </div>
        </div>

        <div className="bg-purple-50/60 border border-purple-200/80 rounded-2xl p-4 space-y-1">
          <span className="text-purple-800 text-xs font-semibold">Tracked Applications</span>
          <p className="text-2xl font-black text-purple-950">{stats?.applicationsCount || 0}</p>
          <Link href="/dashboard/applications" className="text-[11px] font-bold text-purple-700 hover:underline">
            Manage stages →
          </Link>
        </div>

        <div className="bg-blue-50/60 border border-blue-200/80 rounded-2xl p-4 space-y-1">
          <span className="text-blue-800 text-xs font-semibold">Saved Opportunities</span>
          <p className="text-2xl font-black text-blue-950">{stats?.savedCount || 0}</p>
          <Link href="/dashboard/saved" className="text-[11px] font-bold text-blue-700 hover:underline">
            View bookmarks →
          </Link>
        </div>

        <div className="bg-rose-50/60 border border-rose-200/80 rounded-2xl p-4 space-y-1">
          <span className="text-rose-800 text-xs font-semibold">Flagged Listings</span>
          <p className="text-2xl font-black text-rose-950">{stats?.highRiskCount || 0}</p>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-rose-700">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
            <span>Avoid applying</span>
          </div>
        </div>
      </div>

      {/* Visual Analytics Chart: Risk Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-purple-600" />
            Platform Internship Risk Distribution
          </h3>
          <p className="text-xs text-slate-500">
            Automated screening breakdown across all verified and flagged listings.
          </p>

          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.riskChartData || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {(stats?.riskChartData || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val, name) => [`${val} Listings`, name]}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Recent Applications Widget */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-brand-700" />
              Recent Applications
            </h3>
            <Link href="/dashboard/applications" className="text-xs font-bold text-purple-600 hover:underline">
              View all
            </Link>
          </div>

          {applications.length === 0 ? (
            <div className="text-center py-8 space-y-2">
              <p className="text-xs text-slate-500">No applications tracked yet.</p>
              <Link href="/internships" className="inline-block text-xs font-bold text-purple-600">
                Browse internships to track →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {applications.slice(0, 3).map((app) => (
                <div key={app.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between gap-3 text-xs">
                  <div className="space-y-0.5">
                    <h4 className="font-bold text-slate-900 line-clamp-1">{app.internship?.title}</h4>
                    <p className="text-slate-500">{app.internship?.companyName}</p>
                  </div>
                  <StatusBadge status={app.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Saved Opportunities Quick Strip */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-purple-600" />
            Saved Opportunities Ready for Action ({saved.length})
          </h3>
          <Link href="/dashboard/saved" className="text-xs font-bold text-purple-600 hover:underline">
            Manage all saved →
          </Link>
        </div>

        {saved.length === 0 ? (
          <p className="text-xs text-slate-500 py-3 italic">
            You haven't bookmarked any opportunities yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {saved.slice(0, 2).map((item) => (
              <div key={item.id} className="p-4 border border-slate-200 rounded-2xl flex items-center justify-between gap-3">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{item.title}</h4>
                  <p className="text-[11px] text-slate-500">{item.companyName} • {item.stipend}</p>
                </div>
                <RiskBadge score={item.riskScore} level={item.riskLevel} size="sm" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
