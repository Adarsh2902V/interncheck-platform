/**
 * InternCheck Rule-Based Risk Assessment Engine
 * 
 * Evaluates 10 core parameters using heuristic rule matching:
 * 1. Company website availability
 * 2. Company email authenticity
 * 3. Registration or application fees
 * 4. Unrealistic stipend promises
 * 5. Missing company information
 * 6. Suspicious application URLs
 * 7. Unrealistic job descriptions
 * 8. Requests for sensitive information
 * 9. Company verification status
 * 10. Previous student reports
 */

const FREE_EMAIL_DOMAINS = [
  'gmail.com',
  'yahoo.com',
  'yahoo.in',
  'hotmail.com',
  'outlook.com',
  'proton.me',
  'protonmail.com',
  'rediffmail.com',
  'zoho.com',
  'yandex.com',
  'aol.com',
  'mail.com',
  'gmx.com',
  'icloud.com'
];

const SUSPICIOUS_URL_PATTERNS = [
  'forms.gle',
  'docs.google.com/forms',
  'bit.ly',
  'tinyurl.com',
  'cutt.ly',
  't.me',
  'telegram.me',
  'wa.me',
  'api.whatsapp.com',
  'chat.whatsapp.com',
  'drive.google.com',
  'dropbox.com',
  'mega.nz'
];

const KNOWN_REPUTABLE_ATS = [
  'greenhouse.io',
  'lever.co',
  'workday.com',
  'myworkdayjobs.com',
  'smartrecruiters.com',
  'ashbyhq.com',
  'breezy.hr',
  'recruitee.com',
  'jobvite.com',
  'workable.com'
];

const FEE_KEYWORDS = [
  'registration fee',
  'training fee',
  'security deposit',
  'caution money',
  'processing fee',
  'certificate fee',
  'pay to apply',
  'paid training',
  'seat reservation fee',
  'kit charges',
  'refundable deposit'
];

const SCAM_JD_KEYWORDS = [
  'captcha typing',
  'copy paste work',
  'data entry guarantee',
  'earn from home daily',
  'no interview needed',
  'guaranteed placement',
  'easy money',
  'send resume on whatsapp',
  'immediate offer letter',
  'no skill required',
  'unlimited earning',
  'work 1 hour earn 5000'
];

const SENSITIVE_INFO_KEYWORDS = [
  'bank account details',
  'credit card',
  'debit card',
  'otp',
  'net banking',
  'aadhaar card copy',
  'pan card copy upfront',
  'password',
  'security pin'
];

/**
 * Extract clean domain name from URL or email
 */
function extractDomain(urlOrEmail) {
  if (!urlOrEmail) return '';
  let str = urlOrEmail.toLowerCase().trim();
  if (str.includes('@')) {
    return str.split('@')[1];
  }
  str = str.replace(/^(https?:\/\/)?(www\.)?/, '');
  return str.split('/')[0].split(':')[0];
}

/**
 * Calculate risk score and factors for an internship listing
 * @param {Object} internship - Internship data
 * @param {number} reportCount - Number of reports submitted
 * @returns {Object} Assessment result
 */
export function evaluateInternshipRisk(internship, reportCount = 0) {
  const factors = [];
  let score = 15; // Baseline neutral score

  const textToCheck = `${internship.title || ''} ${internship.description || ''} ${internship.adminNotes || ''}`.toLowerCase();
  const website = (internship.companyWebsite || '').toLowerCase().trim();
  const email = (internship.companyEmail || '').toLowerCase().trim();
  const appUrl = (internship.applicationUrl || '').toLowerCase().trim();
  const websiteDomain = extractDomain(website);
  const emailDomain = extractDomain(email);

  // 1. Company Website Availability
  if (!website || website.length < 5 || (!website.startsWith('http://') && !website.startsWith('https://'))) {
    factors.push({
      factorKey: 'MISSING_WEBSITE',
      title: 'Missing or Invalid Company Website',
      description: 'The listing does not provide a functional, verifiable corporate website link.',
      scoreImpact: 12,
      isPositive: false,
      category: 'WEBSITE'
    });
    score += 12;
  } else {
    factors.push({
      factorKey: 'VALID_WEBSITE',
      title: 'Active Company Website Provided',
      description: `Official website domain provided: ${websiteDomain}`,
      scoreImpact: -5,
      isPositive: true,
      category: 'WEBSITE'
    });
    score -= 5;
  }

  // 2. Company Email Authenticity
  if (!email) {
    factors.push({
      factorKey: 'NO_EMAIL',
      title: 'No Contact Email Specified',
      description: 'The employer has not provided a verified contact email address.',
      scoreImpact: 6,
      isPositive: false,
      category: 'EMAIL'
    });
    score += 6;
  } else if (FREE_EMAIL_DOMAINS.some(d => emailDomain === d || emailDomain.endsWith('.' + d))) {
    factors.push({
      factorKey: 'FREE_EMAIL_DOMAIN',
      title: 'Free Email Domain Used',
      description: `Employer uses a public email provider (${emailDomain}) instead of a dedicated organizational domain.`,
      scoreImpact: 15,
      isPositive: false,
      category: 'EMAIL'
    });
    score += 15;
  } else if (websiteDomain && (emailDomain === websiteDomain || emailDomain.endsWith('.' + websiteDomain))) {
    factors.push({
      factorKey: 'MATCHING_CORPORATE_EMAIL',
      title: 'Domain-Matched Corporate Email',
      description: `Official employer contact matches corporate website domain (${emailDomain}).`,
      scoreImpact: -12,
      isPositive: true,
      category: 'EMAIL'
    });
    score -= 12;
  } else {
    factors.push({
      factorKey: 'CUSTOM_DOMAIN_EMAIL',
      title: 'Custom Corporate Email',
      description: `Employer provides a custom domain email address (${emailDomain}).`,
      scoreImpact: -6,
      isPositive: true,
      category: 'EMAIL'
    });
    score -= 6;
  }

  // 3. Registration or Application Fees (CRITICAL RED FLAG)
  const hasFeeFlag = internship.requiresFee === true;
  const mentionsFee = FEE_KEYWORDS.some(keyword => textToCheck.includes(keyword));

  if (hasFeeFlag || mentionsFee) {
    factors.push({
      factorKey: 'REGISTRATION_FEE_REQUIRED',
      title: 'Registration / Application Fee Mentioned',
      description: 'Listing indicates an upfront fee, training cost, security deposit, or processing charge. Legitimate companies never charge candidates.',
      scoreImpact: 35,
      isPositive: false,
      category: 'FEE'
    });
    score += 35;
  } else {
    factors.push({
      factorKey: 'NO_FEE_REQUIRED',
      title: 'Zero Upfront Cost',
      description: 'Listing explicitly states free application with no security deposits or training charges.',
      scoreImpact: -6,
      isPositive: true,
      category: 'FEE'
    });
    score -= 6;
  }

  // 4. Unrealistic Stipend Promises
  const stipendAmount = Number(internship.stipendAmount) || 0;
  const hasUnrealisticStipend = stipendAmount > 120000;
  const isSuspiciousHighPromise = textToCheck.includes('earn 50000') || textToCheck.includes('daily payout') || textToCheck.includes('weekly stipend');

  if (hasUnrealisticStipend || isSuspiciousHighPromise) {
    factors.push({
      factorKey: 'UNREALISTIC_STIPEND',
      title: 'Unusually Inflated Stipend',
      description: `Stipend (${internship.stipend}) appears disproportionately high for college-level internship standards and may be clickbait.`,
      scoreImpact: 18,
      isPositive: false,
      category: 'STIPEND'
    });
    score += 18;
  } else if (stipendAmount >= 8000 && stipendAmount <= 60000) {
    factors.push({
      factorKey: 'REALISTIC_STIPEND',
      title: 'Standard Realistic Stipend',
      description: `Advertised stipend (${internship.stipend}) aligns with standard industry rates for student interns.`,
      scoreImpact: -6,
      isPositive: true,
      category: 'STIPEND'
    });
    score -= 6;
  }

  // 5. Missing Company Information & Role Details
  const descLength = (internship.description || '').trim().length;
  if (descLength < 140) {
    factors.push({
      factorKey: 'SPARSE_DESCRIPTION',
      title: 'Vague Role Description',
      description: 'The job posting lacks detailed responsibilities, qualifications, or company background.',
      scoreImpact: 12,
      isPositive: false,
      category: 'COMPANY'
    });
    score += 12;
  } else if (descLength > 300) {
    factors.push({
      factorKey: 'DETAILED_DESCRIPTION',
      title: 'Comprehensive Role Specification',
      description: 'Clear, well-defined learning outcomes, responsibilities, and skill expectations provided.',
      scoreImpact: -6,
      isPositive: true,
      category: 'COMPANY'
    });
    score -= 6;
  }

  // 6. Suspicious Application URLs
  const isSuspiciousUrl = SUSPICIOUS_URL_PATTERNS.some(p => appUrl.includes(p));
  const isReputableAts = KNOWN_REPUTABLE_ATS.some(ats => appUrl.includes(ats));
  const isWebsiteDomainAts = websiteDomain && appUrl.includes(websiteDomain);

  if (isSuspiciousUrl) {
    factors.push({
      factorKey: 'SUSPICIOUS_APP_URL',
      title: 'Informal Application Channel',
      description: 'Uses Google Forms, WhatsApp link, Telegram, or shortener URLs instead of an authentic ATS or corporate portal.',
      scoreImpact: 16,
      isPositive: false,
      category: 'URL'
    });
    score += 16;
  } else if (isReputableAts || isWebsiteDomainAts) {
    factors.push({
      factorKey: 'VERIFIED_APPLICATION_CHANNEL',
      title: 'Verified Enterprise Career Portal',
      description: 'Application hosted on an enterprise ATS or the company official domain.',
      scoreImpact: -12,
      isPositive: true,
      category: 'URL'
    });
    score -= 12;
  }

  // 7. Unrealistic / Scam Job Description Patterns
  const foundScamKeywords = SCAM_JD_KEYWORDS.filter(k => textToCheck.includes(k));
  if (foundScamKeywords.length > 0) {
    factors.push({
      factorKey: 'SUSPICIOUS_JD_KEYWORDS',
      title: 'Flagged Job Keywords Detected',
      description: `Contains high-risk phrasing: "${foundScamKeywords.join(', ')}". Frequently seen in online job scams.`,
      scoreImpact: 22,
      isPositive: false,
      category: 'COMPANY'
    });
    score += 22;
  }

  // 8. Requests for Sensitive Information
  const foundSensitiveKeywords = SENSITIVE_INFO_KEYWORDS.filter(k => textToCheck.includes(k));
  if (foundSensitiveKeywords.length > 0) {
    factors.push({
      factorKey: 'SENSITIVE_INFO_REQUESTED',
      title: 'Sensitive Personal/Financial Data Requested',
      description: `Prompting candidates for sensitive credentials: "${foundSensitiveKeywords.join(', ')}". High identity theft risk.`,
      scoreImpact: 28,
      isPositive: false,
      category: 'FEE'
    });
    score += 28;
  }

  // 9. Company Verification Status
  if (internship.verificationStatus === 'APPROVED') {
    factors.push({
      factorKey: 'ADMIN_VERIFIED_COMPANY',
      title: 'Admin Verified Organization',
      description: 'Corporate credentials and legitimacy manually verified by platform moderators.',
      scoreImpact: -18,
      isPositive: true,
      category: 'COMPANY'
    });
    score -= 18;
  } else if (internship.verificationStatus === 'REJECTED') {
    factors.push({
      factorKey: 'ADMIN_REJECTED',
      title: 'Administrator Flagged Listing',
      description: 'This opportunity was formally rejected by administrators due to policy violations.',
      scoreImpact: 45,
      isPositive: false,
      category: 'COMPANY'
    });
    score += 45;
  }

  // 10. Previous Student Reports
  if (reportCount > 0) {
    const reportImpact = Math.min(reportCount * 12, 36);
    factors.push({
      factorKey: 'STUDENT_REPORTS_FILED',
      title: `${reportCount} Student Scam Report${reportCount > 1 ? 's' : ''} Filed`,
      description: `${reportCount} community member${reportCount > 1 ? 's have' : ' has'} reported this opportunity for investigation.`,
      scoreImpact: reportImpact,
      isPositive: false,
      category: 'REPORTS'
    });
    score += reportImpact;
  }

  // Enforce floor if critical red flags exist
  if (hasFeeFlag || mentionsFee) {
    score = Math.max(score, 65);
  }
  if (foundScamKeywords.length > 0 || foundSensitiveKeywords.length > 0) {
    score = Math.max(score, 70);
  }

  // Clamp normalized score between 0 and 100
  const normalizedScore = Math.min(Math.max(score, 0), 100);

  // Determine Risk Level
  let level = 'LOW';
  if (normalizedScore > 60) {
    level = 'HIGH';
  } else if (normalizedScore > 30) {
    level = 'MEDIUM';
  }

  const positiveSignals = factors.filter(f => f.isPositive);
  const riskFactors = factors.filter(f => !f.isPositive);

  return {
    score: normalizedScore,
    level,
    factors,
    positiveSignals,
    riskFactors,
    disclaimer: 'Automated risk assessment is an initial screening tool, not a guarantee of legitimacy. Always exercise due diligence before submitting personal information.',
    assessedAt: new Date(),
  };
}
