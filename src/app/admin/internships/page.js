'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { CheckSquare, Trash2, CheckCircle2, XCircle, ExternalLink, ShieldCheck } from 'lucide-react';
import RiskBadge from '@/components/ui/RiskBadge';
import StatusBadge from '@/components/ui/StatusBadge';
import { toast } from 'sonner';

export default function AdminInternshipsPage() {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInternships = async () => {
    try {
      const res = await fetch('/api/internships?all=true&limit=100');
      if (res.ok) {
        const data = await res.json();
        setInternships(data.items || []);
      }
    } catch (err) {
      toast.error('Failed to load internships');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInternships();
  }, []);

  const handleUpdateStatus = async (id, verificationStatus) => {
    try {
      const res = await fetch(`/api/admin/internships/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verificationStatus }),
      });
      if (res.ok) {
        toast.success(`Internship marked as ${verificationStatus}`);
        fetchInternships();
      } else {
        toast.error('Failed to update status');
      }
    } catch (err) {
      toast.error('Error updating internship');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to permanently delete this listing?')) return;
    try {
      const res = await fetch(`/api/internships/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Internship removed');
        setInternships((prev) => prev.filter((i) => i.id !== id));
      }
    } catch (err) {
      toast.error('Failed to delete listing');
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4 flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">
            Listing Moderation
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            Manage All Internships ({internships.length})
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Approve, reject, or delete submitted internship listings across all categories.
          </p>
        </div>

        <Link
          href="/internships"
          className="text-xs font-bold text-purple-600 hover:underline"
        >
          View Public Directory →
        </Link>
      </div>

      {loading ? (
        <div className="h-64 bg-slate-100 animate-pulse rounded-2xl"></div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Internship & Company</th>
                  <th className="py-3 px-4">Domain & Mode</th>
                  <th className="py-3 px-4">Stipend</th>
                  <th className="py-3 px-4">Risk Rating</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {internships.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      <Link
                        href={`/internships/${item.id}`}
                        className="hover:text-purple-600 block line-clamp-1"
                      >
                        {item.title}
                      </Link>
                      <span className="text-[11px] text-slate-500 font-normal">
                        {item.companyName}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span>{item.domain}</span>
                      <span className="block text-[10px] text-slate-400">{item.workMode}</span>
                    </td>
                    <td className="py-3.5 px-4 font-medium">{item.stipend}</td>
                    <td className="py-3.5 px-4">
                      <RiskBadge score={item.riskScore} level={item.riskLevel} size="sm" />
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={item.verificationStatus} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        {item.verificationStatus !== 'APPROVED' && (
                          <button
                            onClick={() => handleUpdateStatus(item.id, 'APPROVED')}
                            title="Approve"
                            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}
                        {item.verificationStatus !== 'REJECTED' && (
                          <button
                            onClick={() => handleUpdateStatus(item.id, 'REJECTED')}
                            title="Reject / Flag"
                            className="p-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(item.id)}
                          title="Delete"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
