'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Building,
  MapPin,
  Briefcase,
  IndianRupee,
  Clock,
  ExternalLink,
  Bookmark,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Calendar,
  Share2,
  BookOpen,
} from 'lucide-react';
import RiskBreakdown from '@/components/internship/RiskBreakdown';
import ReportModal from '@/components/internship/ReportModal';
import ExperienceCard from '@/components/experience/ExperienceCard';
import StatusBadge from '@/components/ui/StatusBadge';
import { toast } from 'sonner';

export default function InternshipDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [internship, setInternship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'risk' | 'experiences'

  // Application tracker quick add
  const [trackingStatus, setTrackingStatus] = useState(null);
  const [updatingTracker, setUpdatingTracker] = useState(false);

  const fetchDetails = useCallback(async () => {
    try {
      const res = await fetch(`/api/internships/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setInternship(data.internship);
        setIsSaved(data.internship.isSaved || false);
        setTrackingStatus(data.internship.userApplication?.status || null);
      } else {
        toast.error('Internship not found');
      }
    } catch (err) {
      toast.error('Failed to load internship details');
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const handleBookmarkToggle = async () => {
    try {
      const res = await fetch('/api/saved', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ internshipId: params.id }),
      });
      const data = await res.json();
      if (res.ok) {
        setIsSaved(data.saved);
        toast.success(data.message);
      } else {
        toast.error(data.message || 'Please log in to save');
      }
    } catch (err) {
      toast.error('Bookmark toggle failed');
    }
  };

  const handleTrackApplication = async (status = 'APPLIED') => {
    setUpdatingTracker(true);
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ internshipId: params.id, status }),
      });
      const data = await res.json();
      if (res.ok) {
        setTrackingStatus(status);
        toast.success(`Internship added to tracker as ${status}!`);
      } else {
        toast.error(data.message || 'Please log in to track');
      }
    } catch (err) {
      toast.error('Failed to update application tracker');
    } finally {
      setUpdatingTracker(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 space-y-6">
        <div className="h-8 bg-slate-200 animate-pulse w-1/3 rounded-xl"></div>
        <div className="h-64 bg-slate-200 animate-pulse rounded-2xl"></div>
      </div>
    );
  }

  if (!internship) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Internship Not Found</h2>
        <p className="text-sm text-slate-500">The requested listing does not exist or has been removed.</p>
        <Link href="/internships" className="inline-block px-4 py-2 bg-brand-900 text-white rounded-xl text-sm font-semibold">
          Back to Internships
        </Link>
      </div>
    );
  }

  const skills = internship.requiredSkills
    ? internship.requiredSkills.split(',').map((s) => s.trim())
    : [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back button */}
      <Link
        href="/internships"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to all listings
      </Link>

      {/* Main Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-purple-700 uppercase tracking-wider bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-100">
                {internship.domain}
              </span>
              <span className="text-xs text-slate-500">
                Posted {new Date(internship.postedDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
              <StatusBadge status={internship.verificationStatus} type="verification" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {internship.title}
            </h1>

            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Building className="w-4 h-4 text-purple-600" />
              <span>{internship.companyName}</span>
              {internship.companyWebsite && (
                <a
                  href={internship.companyWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-purple-600 hover:underline inline-flex items-center gap-0.5 font-normal ml-1"
                >
                  Visit Website <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>

          {/* Action CTAs: Apply, Save, Report */}
          <div className="flex flex-wrap lg:flex-col items-center gap-3 shrink-0">
            <a
              href={internship.applicationUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => handleTrackApplication('APPLIED')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-brand-900 text-white font-bold text-sm hover:bg-slate-800 transition-all shadow-md hover:scale-[1.02]"
            >
              Apply on Official Portal
              <ExternalLink className="w-4 h-4 text-purple-300" />
            </a>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleBookmarkToggle}
                className={`flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                  isSaved
                    ? 'bg-purple-50 border-purple-200 text-purple-700'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current text-purple-600' : ''}`} />
                {isSaved ? 'Saved' : 'Save'}
              </button>

              <button
                onClick={() => setReportModalOpen(true)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-rose-200 bg-rose-50/70 text-rose-700 hover:bg-rose-100 text-xs font-bold transition-colors"
              >
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                Report Scam
              </button>
            </div>
          </div>
        </div>

        {/* Quick Highlights Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100 text-xs">
          <div className="bg-slate-50 rounded-xl p-3 space-y-0.5 border border-slate-100">
            <span className="text-slate-400 font-medium">Stipend</span>
            <p className="font-bold text-slate-900 text-sm">{internship.stipend}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-3 space-y-0.5 border border-slate-100">
            <span className="text-slate-400 font-medium">Work Mode</span>
            <p className="font-bold text-slate-900 text-sm">{internship.workMode}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-3 space-y-0.5 border border-slate-100">
            <span className="text-slate-400 font-medium">Location</span>
            <p className="font-bold text-slate-900 text-sm truncate">{internship.location}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-3 space-y-0.5 border border-slate-100">
            <span className="text-slate-400 font-medium">Duration</span>
            <p className="font-bold text-slate-900 text-sm">{internship.duration}</p>
          </div>
        </div>
      </div>

      {/* TABS: Overview & Role | Rule-Based Risk Engine | Senior Experiences */}
      <div className="space-y-6">
        <div className="flex border-b border-slate-200 gap-6 text-sm font-bold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 transition-colors ${
              activeTab === 'overview'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Role & Requirements
          </button>
          <button
            onClick={() => setActiveTab('risk')}
            className={`pb-3 flex items-center gap-1.5 transition-colors ${
              activeTab === 'risk'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Verification & Risk Matrix
            <span className="bg-purple-100 text-purple-800 font-mono text-[10px] px-1.5 py-0.5 rounded-full">
              {internship.riskScore}/100
            </span>
          </button>
          <button
            onClick={() => setActiveTab('experiences')}
            className={`pb-3 flex items-center gap-1.5 transition-colors ${
              activeTab === 'experiences'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Senior Experiences ({internship.relatedExperiences?.length || 0})
          </button>
        </div>

        {/* TAB 1: Role & Description */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200/90 p-6 space-y-4">
                <h3 className="text-base font-bold text-slate-900">About the Opportunity</h3>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {internship.description}
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/90 p-6 space-y-3">
                <h3 className="text-base font-bold text-slate-900">Required Skills & Technologies</h3>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="bg-slate-100 text-slate-800 px-3 py-1 rounded-xl text-xs font-semibold"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar info */}
            <div className="space-y-6">
              {/* Mini Risk Callout */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Risk Assessment
                  </span>
                  <button
                    onClick={() => setActiveTab('risk')}
                    className="text-xs font-bold text-purple-600 hover:underline"
                  >
                    View Breakdown →
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center font-mono font-black text-xl text-purple-700">
                    {internship.riskScore}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      {internship.riskLevel} Risk Level
                    </h4>
                    <p className="text-xs text-slate-500">
                      {internship.riskFactors?.length || 0} risk factors, {internship.positiveSignals?.length || 0} positive signals
                    </p>
                  </div>
                </div>
              </div>

              {/* Application Tracking State Widget */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-5 space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Your Application Status
                </h4>
                {trackingStatus ? (
                  <div className="space-y-2">
                    <StatusBadge status={trackingStatus} />
                    <p className="text-xs text-slate-500">
                      Tracked in your Student Dashboard.
                    </p>
                    <Link
                      href="/dashboard/applications"
                      className="text-xs font-bold text-purple-600 block hover:underline"
                    >
                      Manage in Dashboard →
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs text-slate-600">
                      Planning to apply? Add to your tracker to remember stages.
                    </p>
                    <button
                      onClick={() => handleTrackApplication('INTERESTED')}
                      disabled={updatingTracker}
                      className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors"
                    >
                      Mark as Interested
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Verification & Risk Assessment Engine */}
        {activeTab === 'risk' && (
          <RiskBreakdown
            assessment={internship.riskAssessment}
            internship={internship}
          />
        )}

        {/* TAB 3: Related Experiences from Seniors */}
        {activeTab === 'experiences' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Experiences for {internship.companyName}
                </h3>
                <p className="text-xs text-slate-500">
                  Reviews and interview questions contributed by verified seniors and alumni.
                </p>
              </div>
              <Link
                href="/senior/submit-experience"
                className="px-4 py-2 bg-purple-50 text-purple-700 font-bold text-xs rounded-xl hover:bg-purple-100 transition-colors"
              >
                + Share Experience
              </Link>
            </div>

            {(!internship.relatedExperiences || internship.relatedExperiences.length === 0) ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-2">
                <BookOpen className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-sm font-semibold text-slate-700">No experiences submitted for this specific company yet.</p>
                <p className="text-xs text-slate-500">Are you an alumni or past intern? Help juniors by contributing your review!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {internship.relatedExperiences.map((exp) => (
                  <ExperienceCard key={exp.id} experience={exp} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Report Scam Modal */}
      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        internshipId={internship.id}
        internshipTitle={internship.title}
        onReportSubmitted={() => {
          fetchDetails();
        }}
      />
    </div>
  );
}
