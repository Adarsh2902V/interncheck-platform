'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Search, AlertCircle, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import InternshipCard from '@/components/internship/InternshipCard';
import InternshipFilters from '@/components/internship/InternshipFilters';
import Modal from '@/components/ui/Modal';
import { toast } from 'sonner';

export default function InternshipsPage() {
  const [internships, setInternships] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 9, total: 0, totalPages: 1 });
  const [filters, setFilters] = useState({
    search: '',
    domain: 'ALL',
    workMode: 'ALL',
    isPaid: 'ALL',
    riskLevel: 'ALL',
    sortBy: 'latest',
  });
  const [loading, setLoading] = useState(true);

  // New Internship Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    companyName: '',
    companyWebsite: '',
    companyEmail: '',
    domain: 'Web Development',
    location: '',
    workMode: 'REMOTE',
    stipend: '₹20,000 / month',
    stipendAmount: 20000,
    isPaid: true,
    requiresFee: false,
    duration: '3 months',
    applicationUrl: '',
    description: '',
    requiredSkills: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchInternships = useCallback(
    async (currentPage = 1) => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams({
          page: currentPage.toString(),
          limit: '9',
          search: filters.search,
          domain: filters.domain,
          workMode: filters.workMode,
          isPaid: filters.isPaid,
          riskLevel: filters.riskLevel,
          sortBy: filters.sortBy,
        });

        const res = await fetch(`/api/internships?${queryParams.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setInternships(data.items || []);
          setPagination(data.pagination || { page: 1, total: 0, totalPages: 1 });
        }
      } catch (err) {
        toast.error('Failed to load internships');
      } finally {
        setLoading(false);
      }
    },
    [filters]
  );

  useEffect(() => {
    fetchInternships(1);
  }, [fetchInternships]);

  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      domain: 'ALL',
      workMode: 'ALL',
      isPaid: 'ALL',
      riskLevel: 'ALL',
      sortBy: 'latest',
    });
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/internships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        setIsModalOpen(false);
        fetchInternships(1);
      } else {
        toast.error(data.message || 'Validation error');
      }
    } catch (err) {
      toast.error('Failed to create internship');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">
            Verified Directory
          </span>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mt-0.5">
            Explore Internships
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Browse opportunities screened through our 10-point rule-based risk assessment engine.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-900 text-white font-semibold text-sm hover:bg-slate-800 transition-all shadow-sm hover:shadow"
        >
          <Plus className="w-4 h-4 text-purple-300" />
          Submit Internship Listing
        </button>
      </div>

      {/* Filter Control Bar */}
      <InternshipFilters
        filters={filters}
        onChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {/* Results Count & Notice */}
      <div className="flex items-center justify-between text-xs font-medium text-slate-500">
        <span>
          Showing {internships.length} of {pagination.total} opportunities
        </span>
        <span className="text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
          Disclaimer: Low risk does not guarantee legitimacy. Never pay money to apply.
        </span>
      </div>

      {/* Grid of Listings */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-64 bg-slate-200 animate-pulse rounded-2xl"></div>
          ))}
        </div>
      ) : internships.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <AlertCircle className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No internships matched your criteria</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your domain, risk level, or keyword filters to view other opportunities.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 bg-purple-50 text-purple-700 text-xs font-bold rounded-xl hover:bg-purple-100"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {internships.map((internship) => (
            <InternshipCard
              key={internship.id}
              internship={internship}
              onSaveToggle={() => {}}
            />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <button
            onClick={() => fetchInternships(pagination.page - 1)}
            disabled={pagination.page <= 1}
            className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 disabled:opacity-40 hover:bg-slate-50"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-slate-700 px-3 py-2 bg-white rounded-xl border border-slate-200">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            onClick={() => fetchInternships(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
            className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 disabled:opacity-40 hover:bg-slate-50"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Submit Internship Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Submit New Internship Opportunity"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 text-purple-900 leading-relaxed">
            All submitted listings are automatically evaluated by our 10-parameter risk scoring engine before approval. Be accurate with corporate email domains and application URLs.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Internship Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Frontend Engineering Intern"
                className="w-full p-2.5 rounded-xl border border-slate-300 text-sm"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Company Name *
              </label>
              <input
                type="text"
                required
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                placeholder="e.g. Razorpay Software Pvt Ltd"
                className="w-full p-2.5 rounded-xl border border-slate-300 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Company Website
              </label>
              <input
                type="url"
                value={formData.companyWebsite}
                onChange={(e) => setFormData({ ...formData, companyWebsite: e.target.value })}
                placeholder="https://company.com"
                className="w-full p-2.5 rounded-xl border border-slate-300 text-sm"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Official Contact Email
              </label>
              <input
                type="email"
                value={formData.companyEmail}
                onChange={(e) => setFormData({ ...formData, companyEmail: e.target.value })}
                placeholder="careers@company.com"
                className="w-full p-2.5 rounded-xl border border-slate-300 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Domain *
              </label>
              <select
                value={formData.domain}
                onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                className="w-full p-2 rounded-xl border border-slate-300 bg-white"
              >
                <option value="Web Development">Web Development</option>
                <option value="Backend Development">Backend Development</option>
                <option value="Software Engineering">Software Engineering</option>
                <option value="Artificial Intelligence">Artificial Intelligence</option>
                <option value="Data Science">Data Science</option>
                <option value="Mobile App Development">Mobile App Development</option>
                <option value="Cybersecurity">Cybersecurity</option>
                <option value="DevOps / Cloud">DevOps / Cloud</option>
                <option value="Game Development">Game Development</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Work Mode *
              </label>
              <select
                value={formData.workMode}
                onChange={(e) => setFormData({ ...formData, workMode: e.target.value })}
                className="w-full p-2 rounded-xl border border-slate-300 bg-white"
              >
                <option value="REMOTE">Remote</option>
                <option value="HYBRID">Hybrid</option>
                <option value="ONSITE">On-site</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Duration *
              </label>
              <input
                type="text"
                required
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="e.g. 3 months"
                className="w-full p-2 rounded-xl border border-slate-300"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Stipend Label *
              </label>
              <input
                type="text"
                required
                value={formData.stipend}
                onChange={(e) => setFormData({ ...formData, stipend: e.target.value })}
                placeholder="e.g. ₹25,000 / month or Unpaid"
                className="w-full p-2.5 rounded-xl border border-slate-300 text-sm"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Monthly Amount (₹ for sorting)
              </label>
              <input
                type="number"
                value={formData.stipendAmount}
                onChange={(e) => setFormData({ ...formData, stipendAmount: Number(e.target.value) })}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Location *
              </label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. Bengaluru, Karnataka or Remote"
                className="w-full p-2.5 rounded-xl border border-slate-300 text-sm"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Application URL *
              </label>
              <input
                type="url"
                required
                value={formData.applicationUrl}
                onChange={(e) => setFormData({ ...formData, applicationUrl: e.target.value })}
                placeholder="https://company.com/careers/intern"
                className="w-full p-2.5 rounded-xl border border-slate-300 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Required Skills (comma separated) *
            </label>
            <input
              type="text"
              required
              value={formData.requiredSkills}
              onChange={(e) => setFormData({ ...formData, requiredSkills: e.target.value })}
              placeholder="e.g. React, Next.js, Node.js, PostgreSQL"
              className="w-full p-2.5 rounded-xl border border-slate-300 text-sm"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Detailed Role Description *
            </label>
            <textarea
              rows={4}
              required
              minLength={20}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Provide a comprehensive job description with day-to-day responsibilities..."
              className="w-full p-2.5 rounded-xl border border-slate-300 text-sm"
            />
          </div>

          {/* Registration fee toggle red flag test */}
          <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <input
              type="checkbox"
              id="requiresFee"
              checked={formData.requiresFee}
              onChange={(e) => setFormData({ ...formData, requiresFee: e.target.checked })}
              className="w-4 h-4 text-purple-600 rounded"
            />
            <label htmlFor="requiresFee" className="font-semibold text-slate-700 cursor-pointer">
              Listing demands a registration fee, kit charge, or security deposit (Will be flagged by safety engine!)
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-brand-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-60"
            >
              {submitting ? 'Assessing Risk...' : 'Submit & Screen Listing'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
