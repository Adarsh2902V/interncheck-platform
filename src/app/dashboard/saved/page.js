'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bookmark, Trash2, ExternalLink, ArrowLeft } from 'lucide-react';
import RiskBadge from '@/components/ui/RiskBadge';
import { toast } from 'sonner';

export default function SavedInternshipsPage() {
  const [savedList, setSavedList] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSaved = async () => {
    try {
      const res = await fetch('/api/saved');
      if (res.ok) {
        const data = await res.json();
        setSavedList(data.saved || []);
      }
    } catch (err) {
      toast.error('Failed to load saved internships');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSaved();
  }, []);

  const handleRemove = async (internshipId) => {
    try {
      const res = await fetch(`/api/saved/${internshipId}`, { method: 'DELETE' });
      if (res.ok) {
        setSavedList((prev) => prev.filter((item) => item.id !== internshipId));
        toast.success('Removed from bookmarks');
      }
    } catch (err) {
      toast.error('Failed to remove bookmark');
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">
            Bookmarks
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            Saved Internships ({savedList.length})
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Review and apply to opportunities bookmarked for later.
          </p>
        </div>

        <Link
          href="/internships"
          className="text-xs font-bold text-purple-600 hover:underline"
        >
          + Find More
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-20 bg-slate-100 animate-pulse rounded-2xl"></div>
          ))}
        </div>
      ) : savedList.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <Bookmark className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No saved internships yet</h3>
          <p className="text-xs text-slate-500">
            Browse the directory and click the bookmark icon on any card to save it here.
          </p>
          <Link
            href="/internships"
            className="inline-block px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold shadow-sm"
          >
            Explore Opportunities
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {savedList.map((item) => (
            <div
              key={item.id}
              className="p-4 bg-white border border-slate-200/90 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-xs transition-shadow"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider bg-purple-50 px-2 py-0.5 rounded">
                    {item.domain}
                  </span>
                  <RiskBadge score={item.riskScore} level={item.riskLevel} size="sm" />
                </div>
                <Link
                  href={`/internships/${item.id}`}
                  className="text-sm font-bold text-slate-900 hover:text-purple-600 block transition-colors"
                >
                  {item.title}
                </Link>
                <p className="text-xs text-slate-500">
                  {item.companyName} • {item.location} • <strong className="text-purple-900">{item.stipend}</strong>
                </p>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <Link
                  href={`/internships/${item.id}`}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  View Details
                </Link>
                <button
                  onClick={() => handleRemove(item.id)}
                  title="Remove from saved"
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
