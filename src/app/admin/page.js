'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Briefcase,
  AlertOctagon,
  ShieldAlert,
  CheckSquare,
  Clock,
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
import { toast } from 'sonner';

export default function AdminOverviewPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAdminAnalytics() {
      try {
        const res = await fetch('/api/admin/analytics');
        if (res.ok) {
          const resData = await res.json();
          setData(resData);
        } else {
          toast.error('Failed to load admin analytics (Admin privileges required)');
        }
      } catch (err) {
        toast.error('Error fetching admin data');
      } finally {
        setLoading(false);
      }
    }
    loadAdminAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-slate-200 animate-pulse w-1/3 rounded-xl"></div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-28 bg-slate-200 animate-pulse rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  const stats = data?.stats || {};
  const charts = data?.charts || {};
  const recentReports = data?.recentReports || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">
          Platform Governance
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5">
          Administration Overview
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Monitor system metrics, risk distribution, pending moderation queues, and scam investigations.
        </p>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-1">
          <span className="text-slate-500 text-xs font-semibold">Registered Users</span>
          <p className="text-3xl font-black text-slate-900">{stats.totalUsers || 0}</p>
          <Link href="/admin/users" className="text-[11px] font-bold text-purple-600 hover:underline">
            Manage users →
          </Link>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-1">
          <span className="text-slate-500 text-xs font-semibold">Total Internships</span>
          <p className="text-3xl font-black text-slate-900">{stats.totalInternships || 0}</p>
          <div className="flex items-center gap-2 text-[11px] font-bold text-amber-700">
            <span>{stats.pendingInternships || 0} Pending</span>
          </div>
        </div>

        <div className="bg-white border border-rose-200 p-5 rounded-2xl shadow-xs space-y-1">
          <span className="text-rose-700 text-xs font-semibold">High Risk Listings</span>
          <p className="text-3xl font-black text-rose-600">{stats.highRiskInternships || 0}</p>
          <Link href="/admin/verification" className="text-[11px] font-bold text-rose-700 hover:underline">
            Review risk matrix →
          </Link>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-1">
          <span className="text-slate-500 text-xs font-semibold">Student Scam Reports</span>
          <p className="text-3xl font-black text-slate-900">{stats.totalReports || 0}</p>
          <div className="text-[11px] font-bold text-rose-700">
            {stats.pendingReports || 0} Awaiting Investigation
          </div>
        </div>
      </div>

      {/* Recharts Visual Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Distribution Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-purple-600" />
            Automated Risk Score Distribution
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.riskDistribution || []}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#3b62f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tech Domain Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-brand-700" />
            Domain Category Distribution
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.domainDistribution || []} layout="vertical">
                <XAxis type="number" stroke="#64748b" fontSize={11} allowDecimals={false} />
                <YAxis dataKey="domain" type="category" stroke="#64748b" fontSize={10} width={100} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#8b5cf6" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Student Reports Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 text-rose-600" />
            Recent Scam Reports from Students
          </h3>
          <Link href="/admin/reports" className="text-xs font-bold text-purple-600 hover:underline">
            View all reports ({stats.totalReports || 0}) →
          </Link>
        </div>

        {recentReports.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 italic">No reports filed recently.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Internship</th>
                  <th className="py-2.5 px-3">Reported By</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Current Risk</th>
                  <th className="py-2.5 px-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentReports.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-3 font-semibold text-slate-900">
                      {r.internship?.title}
                      <span className="block text-[11px] text-slate-500 font-normal">
                        {r.internship?.companyName}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-600">{r.user?.name}</td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                        {r.category.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <RiskBadge score={r.internship?.riskScore} size="sm" />
                    </td>
                    <td className="py-3 px-3">
                      <Link
                        href="/admin/reports"
                        className="text-xs font-bold text-purple-600 hover:underline"
                      >
                        Investigate →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
