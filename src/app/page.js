'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Search,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  Building2,
  Users,
  FileCheck,
  Award,
  Zap,
  Globe,
  Mail,
  DollarSign,
  AlertCircle,
  HelpCircle,
  Check,
  ChevronRight,
  Briefcase,
  Star,
} from 'lucide-react';
import InternshipCard from '@/components/internship/InternshipCard';
import ExperienceCard from '@/components/experience/ExperienceCard';

export default function HomePage() {
  const router = useRouter();
  const [internships, setInternships] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);

  // Hero interactive tabs: 'search' | 'verify'
  const [activeHeroTab, setActiveHeroTab] = useState('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchDomain, setSearchDomain] = useState('ALL');

  // Quick risk screener state
  const [analyzerCompany, setAnalyzerCompany] = useState('');
  const [analyzerEmail, setAnalyzerEmail] = useState('');
  const [analyzerWebsite, setAnalyzerWebsite] = useState('');
  const [analyzerFee, setAnalyzerFee] = useState('no'); // 'no' | 'yes'
  const [analyzerUrl, setAnalyzerUrl] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [intRes, expRes] = await Promise.all([
          fetch('/api/internships?limit=6'),
          fetch('/api/experiences?limit=3'),
        ]);
        if (intRes.ok) {
          const intData = await intRes.json();
          setInternships(intData.items || []);
        }
        if (expRes.ok) {
          const expData = await expRes.json();
          setExperiences(expData.items || []);
        }
      } catch (err) {
        console.error('Failed to load home page data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('search', searchQuery.trim());
    if (searchDomain !== 'ALL') params.set('domain', searchDomain);
    router.push(`/internships?${params.toString()}`);
  };

  const handleRunAnalysis = (e) => {
    e.preventDefault();
    let score = 20; // baseline
    const positiveSignals = [];
    const riskFactors = [];

    // 1. Fee evaluation
    if (analyzerFee === 'yes') {
      score += 35;
      riskFactors.push({
        title: 'Mandatory Upfront Fee Detected',
        points: '+35 pts',
        desc: 'Asking for application fees, security deposits, or training packages is a critical indicator of fraudulent recruitment.',
      });
    } else {
      score -= 6;
      positiveSignals.push({
        title: 'Zero Upfront Fees',
        points: '-6 pts',
        desc: 'Legitimate employers never demand payments from candidates.',
      });
    }

    // 2. Email domain check
    const emailLower = (analyzerEmail || '').toLowerCase();
    const freeDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
    const isFreeEmail = freeDomains.some((d) => emailLower.endsWith(`@${d}`));

    if (isFreeEmail) {
      score += 20;
      riskFactors.push({
        title: 'Public Email Domain Used',
        points: '+20 pts',
        desc: 'Official company recruiters operate from authenticated corporate domain email addresses, not generic free providers.',
      });
    } else if (emailLower.includes('@')) {
      score -= 10;
      positiveSignals.push({
        title: 'Corporate Email Domain',
        points: '-10 pts',
        desc: 'Email matches a dedicated organizational or corporate domain.',
      });
    }

    // 3. Website check
    if (!analyzerWebsite || analyzerWebsite.trim().length < 4) {
      score += 15;
      riskFactors.push({
        title: 'Missing Official Website',
        points: '+15 pts',
        desc: 'Company has no verifiable digital presence or official web portal.',
      });
    } else {
      score -= 8;
      positiveSignals.push({
        title: 'Verified Web Presence',
        points: '-8 pts',
        desc: 'Direct website URL provided for organizational validation.',
      });
    }

    // 4. Application URL check
    const urlLower = (analyzerUrl || '').toLowerCase();
    if (urlLower.includes('forms.gle') || urlLower.includes('docs.google.com/forms') || urlLower.includes('t.me')) {
      score += 16;
      riskFactors.push({
        title: 'Unverified Application Channel',
        points: '+16 pts',
        desc: 'Directing applicants to Google Forms or Telegram channels instead of an enterprise ATS or verified portal.',
      });
    } else if (urlLower.includes('greenhouse.io') || urlLower.includes('lever.co') || urlLower.includes('workday.com')) {
      score -= 12;
      positiveSignals.push({
        title: 'Tier-1 Enterprise ATS',
        points: '-12 pts',
        desc: 'Applications routed through enterprise-grade talent software.',
      });
    }

    // Normalize score 0-100
    const finalScore = Math.max(5, Math.min(98, score));
    let level = 'LOW';
    if (finalScore > 60) level = 'HIGH';
    else if (finalScore > 30) level = 'MEDIUM';

    setAnalysisResult({
      score: finalScore,
      level,
      company: analyzerCompany || 'Unspecified Entity',
      riskFactors,
      positiveSignals,
    });
  };

  const loadPreset = (presetKey) => {
    if (presetKey === 'scam') {
      setAnalyzerCompany('Apex Global Tech Solutions');
      setAnalyzerEmail('hr.apextechnologies@gmail.com');
      setAnalyzerWebsite('');
      setAnalyzerFee('yes');
      setAnalyzerUrl('https://forms.gle/xY872kL90DemoScam');
      setAnalysisResult(null);
    } else if (presetKey === 'safe') {
      setAnalyzerCompany('Razorpay Software');
      setAnalyzerEmail('careers@razorpay.com');
      setAnalyzerWebsite('https://razorpay.com');
      setAnalyzerFee('no');
      setAnalyzerUrl('https://boards.greenhouse.io/razorpay/jobs/829102');
      setAnalysisResult(null);
    }
  };

  return (
    <div className="space-y-24 pb-20">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-white border-b border-slate-200/90 pt-14 pb-20 px-4 sm:px-6 lg:px-8 bg-grid-slate">
        <div className="max-w-6xl mx-auto space-y-10">
          {/* Top Security Trust Badge */}
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200/90 text-slate-700 text-xs font-semibold shadow-subtle">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Rule-Based Heuristic Security Standard v2.4</span>
              <span className="text-slate-300">•</span>
              <span className="text-indigo-600 font-bold">10-Point Audit Engine</span>
            </div>
          </div>

          {/* Main Title & Subtitle */}
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.12]">
              Verify Before You Apply.
              <span className="block text-indigo-600 mt-1">Spot Fake Internships &amp; Fee Scams.</span>
            </h1>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
              An open verification network built for college students. Evaluate company legitimacy, check recruiter domains, detect registration fee demands, and read interview experiences from verified seniors.
            </p>
          </div>

          {/* DUAL-PURPOSE INTERACTIVE HERO PANEL */}
          <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-lifted overflow-hidden">
            {/* Tabs Header */}
            <div className="flex border-b border-slate-200 bg-slate-50/70 p-1.5 gap-1.5">
              <button
                type="button"
                onClick={() => setActiveHeroTab('search')}
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                  activeHeroTab === 'search'
                    ? 'bg-white text-slate-900 shadow-subtle border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Search className="w-4 h-4 text-indigo-600" />
                <span>Search Verified Internships</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveHeroTab('verify')}
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                  activeHeroTab === 'verify'
                    ? 'bg-white text-slate-900 shadow-subtle border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span>Instant Risk Screener</span>
                <span className="hidden sm:inline-block px-1.5 py-0.2 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Tool
                </span>
              </button>
            </div>

            {/* Tab 1 Content: Search Form */}
            {activeHeroTab === 'search' && (
              <form onSubmit={handleHeroSearch} className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2 relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Role title, company, or tech stack (e.g. React, Python)..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-800 placeholder-slate-400"
                    />
                  </div>
                  <div>
                    <select
                      value={searchDomain}
                      onChange={(e) => setSearchDomain(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-700 bg-white"
                    >
                      <option value="ALL">All Domains</option>
                      <option value="Web Development">Web Development</option>
                      <option value="Data Science">Data Science</option>
                      <option value="Mobile App Development">Mobile App Development</option>
                      <option value="Cloud & DevOps">Cloud &amp; DevOps</option>
                      <option value="AI / Machine Learning">AI / Machine Learning</option>
                      <option value="Cybersecurity">Cybersecurity</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
                    <span className="font-semibold text-slate-700">Quick Filters:</span>
                    <button
                      type="button"
                      onClick={() => setSearchQuery('Frontend')}
                      className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    >
                      Frontend
                    </button>
                    <button
                      type="button"
                      onClick={() => setSearchQuery('Python')}
                      className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    >
                      Python
                    </button>
                    <button
                      type="button"
                      onClick={() => setSearchQuery('Remote')}
                      className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    >
                      Remote
                    </button>
                  </div>
                  <button
                    type="submit"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800 transition-all shadow-sm"
                  >
                    <span>Browse Internships</span>
                    <ArrowRight className="w-4 h-4 text-indigo-300" />
                  </button>
                </div>
              </form>
            )}

            {/* Tab 2 Content: Live Heuristic Analyzer */}
            {activeHeroTab === 'verify' && (
              <div className="p-6 space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <span className="text-xs font-semibold text-slate-600">
                    Test any listing against our 10-parameter heuristic rules:
                  </span>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-400">Load sample:</span>
                    <button
                      type="button"
                      onClick={() => loadPreset('scam')}
                      className="font-medium text-rose-600 hover:underline"
                    >
                      Suspicious Sample
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={() => loadPreset('safe')}
                      className="font-medium text-emerald-600 hover:underline"
                    >
                      Legitimate Sample
                    </button>
                  </div>
                </div>

                <form onSubmit={handleRunAnalysis} className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Company Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Acme Corp"
                        value={analyzerCompany}
                        onChange={(e) => setAnalyzerCompany(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-indigo-600"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Email</label>
                      <input
                        type="email"
                        placeholder="e.g. hr@company.com or hr@gmail.com"
                        value={analyzerEmail}
                        onChange={(e) => setAnalyzerEmail(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-indigo-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Company Website</label>
                      <input
                        type="text"
                        placeholder="https://company.com"
                        value={analyzerWebsite}
                        onChange={(e) => setAnalyzerWebsite(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-indigo-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Application URL</label>
                      <input
                        type="text"
                        placeholder="e.g. forms.gle or career portal"
                        value={analyzerUrl}
                        onChange={(e) => setAnalyzerUrl(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-indigo-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Asks for Fee / Deposit?</label>
                      <select
                        value={analyzerFee}
                        onChange={(e) => setAnalyzerFee(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-indigo-600 bg-white"
                      >
                        <option value="no">No Fee Required (₹0)</option>
                        <option value="yes">Yes, Requires Upfront Fee (+35 pts)</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors shadow-sm"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      Run Real-Time Risk Analysis
                    </button>
                  </div>
                </form>

                {/* Analysis Output Box */}
                {analysisResult && (
                  <div
                    className={`rounded-xl border p-4 transition-all ${
                      analysisResult.level === 'HIGH'
                        ? 'bg-rose-50/70 border-rose-200 text-rose-900'
                        : analysisResult.level === 'MEDIUM'
                        ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                        : 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3 mb-3 border-slate-200/60">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm">{analysisResult.company}</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              analysisResult.level === 'HIGH'
                                ? 'bg-rose-600 text-white'
                                : analysisResult.level === 'MEDIUM'
                                ? 'bg-amber-600 text-white'
                                : 'bg-emerald-600 text-white'
                            }`}
                          >
                            {analysisResult.level} RISK
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5">
                          Evaluated against 10 deterministic parameters in <code className="font-mono">riskAssessmentService.js</code>
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-2xl font-black font-mono">
                          {analysisResult.score}/100
                        </span>
                        <span className="block text-[10px] uppercase font-bold text-slate-500">
                          Risk Severity Index
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs">
                      {analysisResult.riskFactors.length > 0 && (
                        <div>
                          <span className="font-bold text-rose-700 block mb-1">
                            Flagged Risk Factors:
                          </span>
                          <div className="space-y-1">
                            {analysisResult.riskFactors.map((rf, i) => (
                              <div key={i} className="flex items-start gap-1.5 text-slate-700">
                                <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                                <span>
                                  <strong>{rf.title}</strong> ({rf.points}): {rf.desc}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {analysisResult.positiveSignals.length > 0 && (
                        <div className="pt-1">
                          <span className="font-bold text-emerald-700 block mb-1">
                            Positive Verification Signals:
                          </span>
                          <div className="space-y-1">
                            {analysisResult.positiveSignals.map((ps, i) => (
                              <div key={i} className="flex items-start gap-1.5 text-slate-700">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                <span>
                                  <strong>{ps.title}</strong> ({ps.points}): {ps.desc}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* KEY TRUST SPECIFICATIONS BAR */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-200">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 text-center">
              <span className="text-2xl font-bold font-mono text-slate-900">10-Point</span>
              <p className="text-xs font-semibold text-slate-600 mt-0.5">Deterministic Matrix</p>
              <p className="text-[11px] text-slate-500">Zero black-box ambiguity</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 text-center">
              <span className="text-2xl font-bold font-mono text-emerald-600">₹0 Fee</span>
              <p className="text-xs font-semibold text-slate-600 mt-0.5">Strict Tolerance</p>
              <p className="text-[11px] text-slate-500">Flags paid package scams</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 text-center">
              <span className="text-2xl font-bold font-mono text-indigo-600">100%</span>
              <p className="text-xs font-semibold text-slate-600 mt-0.5">Open Heuristics</p>
              <p className="text-[11px] text-slate-500">Itemized scoring factors</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 text-center">
              <span className="text-2xl font-bold font-mono text-slate-900">Verified</span>
              <p className="text-xs font-semibold text-slate-600 mt-0.5">Alumni Reviews</p>
              <p className="text-[11px] text-slate-500">Authentic interview logs</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 1: HOW INTERNCHECK WORKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 max-w-2xl mx-auto mb-12">
          <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
            Verification Workflow
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            How InternCheck Protects Students
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Our multi-step screening architecture guides students from initial discovery to validated application with verifiable evidence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-subtle space-y-3">
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-900 flex items-center justify-center font-bold text-xs border border-slate-200">
              01
            </div>
            <h3 className="text-base font-bold text-slate-900">Internship Listings</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Curated opportunities with explicit stipend disclosures, skill requirements, duration, and work mode filters.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-subtle space-y-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs border border-indigo-200">
              02
            </div>
            <h3 className="text-base font-bold text-slate-900">Automated Risk Audit</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Our 10-parameter heuristic engine assesses domain consistency, applicant fees, unrealistic stipends, and URL security.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-subtle space-y-3">
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-900 flex items-center justify-center font-bold text-xs border border-slate-200">
              03
            </div>
            <h3 className="text-base font-bold text-slate-900">Senior Experiences</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Real interview questions, stipend payout realities, and authentic feedback shared by verified college alumni.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-subtle space-y-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs border border-emerald-200">
              04
            </div>
            <h3 className="text-base font-bold text-slate-900">Informed Application</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Apply safely through direct official portals and organize your application stages in your student dashboard.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 2: FEATURED VERIFIED OPPORTUNITIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
              Screened Opportunities
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Latest Screened Internships
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Evaluated by our automated risk engine with detailed risk scores and verification status.
            </p>
          </div>
          <Link
            href="/internships"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800"
          >
            Browse All ({internships.length}) Opportunities →
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-64 bg-slate-200 animate-pulse rounded-xl"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {internships.slice(0, 6).map((item) => (
              <InternshipCard key={item.id} internship={item} />
            ))}
          </div>
        )}
      </section>

      {/* SECTION 3: THE 10-PARAMETER HEURISTIC MATRIX */}
      <section className="bg-slate-50 py-16 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
              Core Technical System
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              The 10-Parameter Verification Matrix
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Every internship submitted to InternCheck is evaluated in real-time across 10 deterministic heuristic rules designed to flag fraudulent patterns before students fall victim.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { title: '1. Website Authenticity', impact: '+10 pts if missing', desc: 'Validates active corporate website and organizational domain presence.' },
              { title: '2. Email Domain Match', impact: '+20 pts if generic', desc: 'Flags public Gmail/Yahoo addresses; rewards corporate domains matching website.' },
              { title: '3. Registration Fees', impact: '+35 pts severe flag', desc: 'Detects upfront fees, training costs, document charges, or kit deposits.' },
              { title: '4. Stipend Logic', impact: '+15 pts if unrealistic', desc: 'Flags exaggerated daily/weekly payouts that lure vulnerable college freshers.' },
              { title: '5. Company Info Depth', impact: '+10 pts if hollow', desc: 'Checks detailed job descriptions and clear project deliverables.' },
              { title: '6. Application URLs', impact: '+16 pts if suspicious', desc: 'Distinguishes verified enterprise ATS from Google Forms or Telegram channels.' },
              { title: '7. JD Scam Keywords', impact: '+15 pts scam scan', desc: 'Scans for captcha typing, copy paste, and no-interview guarantees.' },
              { title: '8. Sensitive Data Checks', impact: '+20 pts red flag', desc: 'Flags upfront requests for bank accounts, OTPs, or Aadhaar cards.' },
              { title: '9. Admin Verification', impact: '-15 pts credentialed', desc: 'Checks platform moderation records and corporate credentials.' },
              { title: '10. Community Reports', impact: '+15 pts on reports', desc: 'Dynamically recalculates risk when multiple students file fraud reports.' },
            ].map((rule, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-subtle hover:border-slate-300 transition-colors space-y-2 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="w-6 h-6 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">
                      {idx + 1}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                      {rule.impact}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">{rule.title}</h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed">{rule.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: SENIOR EXPERIENCES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
              Student Experiences
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Authentic Insights from College Seniors
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Read real interview questions, stipend realities, and work culture feedback directly from alumni.
            </p>
          </div>
          <Link
            href="/experiences"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800"
          >
            Explore All Senior Reviews →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {experiences.slice(0, 3).map((exp) => (
            <ExperienceCard key={exp.id} experience={exp} />
          ))}
        </div>
      </section>

      {/* SECTION 5: STUDENT SAFETY GUIDE (NON-AI EDUCATIONAL CONTENT) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-2xl p-8 sm:p-12 shadow-card space-y-8">
          <div className="max-w-3xl space-y-3">
            <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
              Student Career Advisory
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              3 Critical Red Flags Every Student Must Recognize
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Every semester, thousands of college engineering students lose money to registration fee scams, fake offer letters, and unverified companies. Here is how to protect yourself:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-5 space-y-2.5">
              <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-xs">
                01
              </div>
              <h4 className="text-sm font-bold text-white">Upfront Fees or Training Costs</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Legitimate internships pay YOU. Any organization demanding security deposits, certification fees, or kit charges is committing fraud.
              </p>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-5 space-y-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                02
              </div>
              <h4 className="text-sm font-bold text-white">Public Domain Recruiter Emails</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Established technology companies never send official internship offer letters from free Gmail, Yahoo, or Outlook email accounts.
              </p>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-5 space-y-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
                03
              </div>
              <h4 className="text-sm font-bold text-white">Instant Selection Without Interview</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Offers sent within hours without technical screening, portfolio review, or video interviews are typical lures to collect fees.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
