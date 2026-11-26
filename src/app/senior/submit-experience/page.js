'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BookOpen, Star, Send, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function SubmitExperiencePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    companyName: '',
    internshipRole: '',
    domain: 'Web Development',
    duration: '6 months',
    stipend: '₹40,000 / month',
    selectionProcess: '',
    interviewQuestions: '',
    workExperience: '',
    offerReceived: true,
    certificateReceived: true,
    rating: 5,
    feedback: '',
    adviceForJuniors: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/experiences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || 'Experience submitted successfully!');
        router.push('/experiences');
        router.refresh();
      } else {
        toast.error(data.message || 'Validation error');
      }
    } catch (err) {
      toast.error('Failed to submit experience');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <Link
        href="/experiences"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Experiences Repository
      </Link>

      <div className="border-b border-slate-200 pb-4">
        <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">
          Student Experience Repository
        </span>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight mt-0.5">
          Share Your Internship Experience
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Provide genuine advice, interview questions, and stipend details to help your college peers make informed career decisions.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Company Name *
              </label>
              <input
                type="text"
                required
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                placeholder="e.g. Razorpay, Swiggy, Postman"
                className="w-full text-sm p-2.5 rounded-xl border border-slate-300"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Internship Role *
              </label>
              <input
                type="text"
                required
                value={formData.internshipRole}
                onChange={(e) => setFormData({ ...formData, internshipRole: e.target.value })}
                placeholder="e.g. Frontend Engineering Intern"
                className="w-full text-sm p-2.5 rounded-xl border border-slate-300"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Domain
              </label>
              <select
                value={formData.domain}
                onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white"
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
                Duration
              </label>
              <input
                type="text"
                required
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="e.g. 6 months"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Monthly Stipend
              </label>
              <input
                type="text"
                required
                value={formData.stipend}
                onChange={(e) => setFormData({ ...formData, stipend: e.target.value })}
                placeholder="e.g. ₹40,000 / month"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Overall Company Rating (1 to 5 Stars) *
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setFormData({ ...formData, rating: star })}
                  className="p-1 text-amber-400 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= formData.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                    }`}
                  />
                </button>
              ))}
              <span className="font-bold text-sm text-slate-700 ml-2">
                {formData.rating} Stars
              </span>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Selection & Screening Process *
            </label>
            <textarea
              rows={3}
              required
              minLength={15}
              value={formData.selectionProcess}
              onChange={(e) => setFormData({ ...formData, selectionProcess: e.target.value })}
              placeholder="Describe rounds: online coding test, technical system interview, HR call..."
              className="w-full text-sm p-3 rounded-xl border border-slate-300"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Interview Questions Asked *
            </label>
            <textarea
              rows={4}
              required
              minLength={15}
              value={formData.interviewQuestions}
              onChange={(e) => setFormData({ ...formData, interviewQuestions: e.target.value })}
              placeholder="1. Closures & debouncing implementation in JavaScript&#10;2. How to avoid N+1 query problems in SQL?"
              className="w-full text-sm p-3 rounded-xl border border-slate-300 font-mono text-xs"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Work Experience & Mentorship *
            </label>
            <textarea
              rows={3}
              required
              minLength={20}
              value={formData.workExperience}
              onChange={(e) => setFormData({ ...formData, workExperience: e.target.value })}
              placeholder="Describe day to day tasks, team culture, tools used, and production responsibilities..."
              className="w-full text-sm p-3 rounded-xl border border-slate-300"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Advice for Juniors & Preparation Strategy *
            </label>
            <textarea
              rows={3}
              required
              minLength={10}
              value={formData.adviceForJuniors}
              onChange={(e) => setFormData({ ...formData, adviceForJuniors: e.target.value })}
              placeholder="What should juniors study? What projects should they build to crack this role?"
              className="w-full text-sm p-3 rounded-xl border border-slate-300"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.offerReceived}
                onChange={(e) => setFormData({ ...formData, offerReceived: e.target.checked })}
                className="w-4 h-4 text-purple-600 rounded"
              />
              <span className="font-semibold text-slate-700">Full-time Offer / PPO Received</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.certificateReceived}
                onChange={(e) => setFormData({ ...formData, certificateReceived: e.target.checked })}
                className="w-4 h-4 text-purple-600 rounded"
              />
              <span className="font-semibold text-slate-700">Internship Certificate Provided</span>
            </label>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-purple-600 text-white font-bold text-sm hover:bg-purple-700 transition-colors shadow-md disabled:opacity-60"
            >
              <Send className="w-4 h-4" />
              {submitting ? 'Submitting Review...' : 'Publish Experience'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
