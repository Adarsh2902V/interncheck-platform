const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const FREE_EMAIL_DOMAINS = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'proton.me', 'rediffmail.com'];
const SUSPICIOUS_URL_PATTERNS = ['forms.gle', 'docs.google.com/forms', 'bit.ly', 'tinyurl.com', 't.me', 'wa.me', 'drive.google.com'];
const KNOWN_REPUTABLE_ATS = ['greenhouse.io', 'lever.co', 'workday.com', 'smartrecruiters.com'];
const FEE_KEYWORDS = ['registration fee', 'training fee', 'security deposit', 'processing fee', 'pay to apply', 'license fee', 'allocation fee'];
const SCAM_JD_KEYWORDS = ['captcha typing', 'copy paste work', 'data entry guarantee', 'earn from home daily', 'no interview needed', 'send resume on whatsapp', 'rating task', 'daily payout'];
const SENSITIVE_INFO_KEYWORDS = ['bank account details', 'credit card', 'otp', 'aadhaar card copy', 'passwords', 'passbook', 'aadhaar'];

function extractDomain(str) {
  if (!str) return '';
  str = str.toLowerCase().trim();
  if (str.includes('@')) return str.split('@')[1];
  str = str.replace(/^(https?:\/\/)?(www\.)?/, '');
  return str.split('/')[0].split(':')[0];
}

function evaluateInternshipRiskSync(internship, reportCount = 0) {
  const factors = [];
  let score = 20; // baseline

  const textToCheck = `${internship.title || ''} ${internship.description || ''}`.toLowerCase();
  const website = (internship.companyWebsite || '').toLowerCase().trim();
  const email = (internship.companyEmail || '').toLowerCase().trim();
  const appUrl = (internship.applicationUrl || '').toLowerCase().trim();
  const websiteDomain = extractDomain(website);
  const emailDomain = extractDomain(email);

  // 1. Website
  if (!website || website.length < 5) {
    factors.push({
      factorKey: 'MISSING_WEBSITE',
      title: 'Missing or Invalid Company Website',
      description: 'The listing does not provide a verifiable corporate website link.',
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

  // 2. Email
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
  } else if (FREE_EMAIL_DOMAINS.some(d => emailDomain === d)) {
    factors.push({
      factorKey: 'FREE_EMAIL_DOMAIN',
      title: 'Free Email Domain Used',
      description: `Employer uses a public email provider (${emailDomain}) instead of a corporate domain.`,
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

  // 3. Fees
  const hasFeeFlag = internship.requiresFee === true;
  const mentionsFee = FEE_KEYWORDS.some(k => textToCheck.includes(k));
  if (hasFeeFlag || mentionsFee) {
    factors.push({
      factorKey: 'REGISTRATION_FEE_REQUIRED',
      title: 'Registration / Tool Fee Mentioned',
      description: 'Listing indicates an upfront fee, hardware allocation charge, or security deposit. Legitimate companies never charge candidates.',
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

  // 4. Stipend
  const stipendAmount = Number(internship.stipendAmount) || 0;
  if (stipendAmount > 80000 || textToCheck.includes('daily payout')) {
    factors.push({
      factorKey: 'UNREALISTIC_STIPEND',
      title: 'Unusually Inflated Stipend',
      description: 'Stipend appears disproportionately high for college-level internship standards.',
      scoreImpact: 18,
      isPositive: false,
      category: 'STIPEND'
    });
    score += 18;
  } else if (stipendAmount >= 8000 && stipendAmount <= 55000) {
    factors.push({
      factorKey: 'REALISTIC_STIPEND',
      title: 'Standard Realistic Stipend',
      description: 'Advertised stipend aligns with standard industry rates for student interns.',
      scoreImpact: -6,
      isPositive: true,
      category: 'STIPEND'
    });
    score -= 6;
  }

  // 5. Description depth
  const descLength = (internship.description || '').trim().length;
  if (descLength < 140) {
    factors.push({
      factorKey: 'SPARSE_DESCRIPTION',
      title: 'Vague Role Description',
      description: 'The job posting lacks detailed responsibilities or company background.',
      scoreImpact: 12,
      isPositive: false,
      category: 'COMPANY'
    });
    score += 12;
  } else if (descLength > 300) {
    factors.push({
      factorKey: 'DETAILED_DESCRIPTION',
      title: 'Comprehensive Role Specification',
      description: 'Clear, well-defined learning outcomes and skill expectations provided.',
      scoreImpact: -6,
      isPositive: true,
      category: 'COMPANY'
    });
    score -= 6;
  }

  // 6. Application URL
  const isSuspiciousUrl = SUSPICIOUS_URL_PATTERNS.some(p => appUrl.includes(p));
  const isReputableAts = KNOWN_REPUTABLE_ATS.some(ats => appUrl.includes(ats));
  const isWebsiteDomainAts = websiteDomain && appUrl.includes(websiteDomain);

  if (isSuspiciousUrl) {
    factors.push({
      factorKey: 'SUSPICIOUS_APP_URL',
      title: 'Informal Application Channel',
      description: 'Uses Google Forms, WhatsApp link, Telegram, or shortener URLs instead of an authentic ATS.',
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

  // 7. Scam keywords
  const foundScamKeywords = SCAM_JD_KEYWORDS.filter(k => textToCheck.includes(k));
  if (foundScamKeywords.length > 0) {
    factors.push({
      factorKey: 'SUSPICIOUS_JD_KEYWORDS',
      title: 'Flagged Job Keywords Detected',
      description: `Contains high-risk phrasing: "${foundScamKeywords.join(', ')}".`,
      scoreImpact: 22,
      isPositive: false,
      category: 'COMPANY'
    });
    score += 22;
  }

  // 8. Sensitive info
  const foundSensitiveKeywords = SENSITIVE_INFO_KEYWORDS.filter(k => textToCheck.includes(k));
  if (foundSensitiveKeywords.length > 0) {
    factors.push({
      factorKey: 'SENSITIVE_INFO_REQUESTED',
      title: 'Sensitive Personal/Financial Data Requested',
      description: `Prompting candidates for sensitive credentials: "${foundSensitiveKeywords.join(', ')}".`,
      scoreImpact: 28,
      isPositive: false,
      category: 'FEE'
    });
    score += 28;
  }

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

  if (reportCount > 0) {
    const reportImpact = Math.min(reportCount * 12, 36);
    factors.push({
      factorKey: 'STUDENT_REPORTS_FILED',
      title: `${reportCount} Student Scam Report${reportCount > 1 ? 's' : ''} Filed`,
      description: `${reportCount} community member${reportCount > 1 ? 's have' : ' has'} reported this listing for fraud.`,
      scoreImpact: reportImpact,
      isPositive: false,
      category: 'REPORTS'
    });
    score += reportImpact;
  }

  if (hasFeeFlag || mentionsFee) score = Math.max(score, 65);
  if (foundScamKeywords.length > 0 || foundSensitiveKeywords.length > 0) score = Math.max(score, 70);

  const normalizedScore = Math.min(Math.max(score, 0), 100);
  let level = 'LOW';
  if (normalizedScore > 60) level = 'HIGH';
  else if (normalizedScore > 30) level = 'MEDIUM';

  return { score: normalizedScore, level, factors };
}

async function main() {
  console.log('--- Adding Targeted High-Risk and Medium-Risk Samples for Viva Demonstration ---');
  
  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  const student = await prisma.user.findFirst({ where: { role: 'STUDENT' } });

  const newSamples = [
    // --- 3 DISTINCT HIGH-RISK SCAM EXAMPLES ---
    {
      title: 'Cloud AI GPU & Prompt Annotation Intern',
      companyName: 'MetaCloud Labs International',
      companyWebsite: '', // Missing website (+12)
      companyEmail: 'metacloud.careers@gmail.com', // Free gmail (+15)
      description: 'Train next-gen generative AI models from home. Candidates must pay a mandatory cloud GPU allocation fee and software license fee of ₹2,499 before receiving access credentials. 100% placement assurance with high daily payouts.',
      requiredSkills: 'Basic computer typing, ChatGPT, English writing',
      domain: 'Artificial Intelligence',
      location: 'Remote Work From Home',
      workMode: 'REMOTE',
      stipend: '₹55,000 / month',
      stipendAmount: 55000,
      isPaid: true,
      requiresFee: true, // Fee required (+35)
      duration: '3 months',
      applicationUrl: 'https://tinyurl.com/metacloud-fee-gateway', // Suspicious URL (+16)
      listingSource: 'Unsolicited WhatsApp Job Message',
      verificationStatus: 'REJECTED',
      adminNotes: 'Confirmed fake cloud license scam. Demands ₹2,499 upfront for bogus access keys.',
      postedById: student.id,
      scamReport: {
        category: 'MONEY_ASKING',
        description: 'Recruiter called on Telegram demanding a ₹2,499 GPU server access fee before sending the offer letter.',
      }
    },
    {
      title: 'FinTech Android Security & KYC Associate Intern',
      companyName: 'PayTrust Digital Payment Services',
      companyWebsite: 'http://paytrust-verification-portal.xyz', // Unverified domain
      companyEmail: 'hr@paytrust-verification-portal.xyz',
      description: 'Work with our compliance security unit. To complete Indian citizenship KYC and set up your direct stipend disbursement account, selected interns must upload their bank passbook copy, unmasked Aadhaar card copy, and submit live OTP verification immediately.',
      requiredSkills: 'Android basics, Cyber compliance, KYC documents',
      domain: 'Cybersecurity',
      location: 'New Delhi / Remote',
      workMode: 'REMOTE',
      stipend: '₹30,000 / month',
      stipendAmount: 30000,
      isPaid: true,
      requiresFee: false,
      duration: '3 months',
      applicationUrl: 'https://drive.google.com/drive/folders/paytrust-kyc-documents', // Google drive (+16)
      listingSource: 'Telegram Channel',
      verificationStatus: 'REJECTED',
      adminNotes: 'Critical identity theft and banking credential phishing operation.',
      postedById: student.id,
      scamReport: {
        category: 'PERSONAL_INFO_MISUSE',
        description: 'They demanded unmasked Aadhaar, bank passbook, and asked for an OTP to complete "Direct Benefit Transfer" setup.',
      }
    },
    {
      title: 'YouTube Video Reviewer & App Rating Intern',
      companyName: 'GlobalReach Digital Media Marketing',
      companyWebsite: 'http://globalreach-ratings.blogspot.com', // Blogspot (+12)
      companyEmail: 'globalreach.tasks@yahoo.com', // Yahoo (+15)
      description: 'Simple daily payout rating task for college students! Watch YouTube videos, like channels, and rate apps on Play Store. No interview needed. Work 2 hours daily and earn ₹4,000 daily payout. Join our official Telegram bot to start receiving tasks and instant payment.',
      requiredSkills: 'Smartphone, YouTube, Telegram',
      domain: 'Web Development',
      location: 'All India Remote',
      workMode: 'REMOTE',
      stipend: '₹90,000 / month (₹3,000/day)',
      stipendAmount: 90000,
      isPaid: true,
      requiresFee: false,
      duration: '1 month',
      applicationUrl: 'https://t.me/GlobalReachRatingTasksBot', // Telegram (+16)
      listingSource: 'Instagram Sponsored Ad',
      verificationStatus: 'REJECTED',
      adminNotes: 'Classic task prepaid recharge fraud lure. Demands money after fake task credit increases.',
      postedById: student.id,
      scamReport: {
        category: 'FAKE_JD',
        description: 'Lured students with fake YouTube liking tasks, then added them to a VIP investment Telegram group demanding money.',
      }
    },

    // --- 3 DISTINCT MEDIUM-RISK BORDERLINE EXAMPLES ---
    {
      title: 'React Native Mobile App Development Trainee',
      companyName: 'AppStudio Freelance Digital Hub',
      companyWebsite: 'https://appstudiohub.in', // Active website (-5)
      companyEmail: 'appstudiohub.hr@gmail.com', // Free Gmail (+15)
      description: 'We are a fast-growing mobile app development agency looking for an energetic React Native trainee to assist with cross-platform screens, Expo navigation, and bug fixes for small business client apps. Must know JavaScript and React fundamentals.',
      requiredSkills: 'React Native, JavaScript, Expo, Git',
      domain: 'Mobile App Development',
      location: 'Noida, Uttar Pradesh',
      workMode: 'REMOTE',
      stipend: '₹10,000 / month',
      stipendAmount: 10000, // Standard stipend (-6)
      isPaid: true,
      requiresFee: false, // Zero fee (-6)
      duration: '3 months',
      applicationUrl: 'https://forms.gle/appStudioHireForm2026', // Google Form (+16)
      listingSource: 'LinkedIn Job Board',
      verificationStatus: 'PENDING',
      adminNotes: 'Legitimate early-stage boutique studio, but relies on public Gmail and Google Forms. Moderated under Medium Risk.',
      postedById: student.id,
    },
    {
      title: 'Junior Web3 & Blockchain Smart Contract Intern',
      companyName: 'CryptoSphere Decentralized Labs',
      companyWebsite: 'https://cryptospheredao.io', // Website provided (-5)
      companyEmail: 'dao-builders@cryptospheredao.io', // Custom domain (-6)
      description: 'Join our decentralized research team. Assist in reviewing Solidity smart contracts, writing hardhat deployment scripts, and analyzing EVM gas efficiency benchmarks. We are offering an exceptionally high stipend of ₹85,000/month for college freshers with Solidity knowledge.',
      requiredSkills: 'Solidity, Ethereum, Hardhat, Web3.js, JavaScript',
      domain: 'Software Engineering',
      location: 'Remote, Global',
      workMode: 'REMOTE',
      stipend: '₹85,000 / month',
      stipendAmount: 85000, // Unusually inflated stipend (+18)
      isPaid: true,
      requiresFee: false, // Zero fee (-6)
      duration: '3 months',
      applicationUrl: 'https://bit.ly/cryptosphere-web3-intern', // Shortener bitly link (+16)
      listingSource: 'Discord Web3 Group',
      verificationStatus: 'PENDING',
      adminNotes: 'Legitimate Web3 niche, but inflated stipend promise and bit.ly shortener warrant student caution.',
      postedById: student.id,
    },
    {
      title: 'GenAI Technical Documentation & Content Intern',
      companyName: 'HyperScale AI Ventures',
      companyWebsite: 'https://hyperscaleai.co', // Website (-5)
      companyEmail: 'founders@hyperscaleai.co', // Custom domain (-6)
      description: 'Looking for an intern to write API documentation and quickstart guides for our internal LLM toolkits.', // Sparse description < 140 chars (+12)
      requiredSkills: 'Markdown, Technical Writing, REST APIs, Python basics',
      domain: 'Artificial Intelligence',
      location: 'Bengaluru / Remote',
      workMode: 'REMOTE',
      stipend: 'Unpaid / Equity recommendation',
      stipendAmount: 0,
      isPaid: false,
      requiresFee: false, // Zero fee (-6)
      duration: '2 months',
      applicationUrl: 'https://hyperscaleai.co/careers/doc-intern', // Company domain (-12)
      listingSource: 'College Placement Cell Bulletin',
      verificationStatus: 'PENDING',
      adminNotes: 'Unpaid opportunity with sparse job description. Students should ensure clear mentorship deliverables.',
      postedById: student.id,
    },
  ];

  for (const sample of newSamples) {
    const { scamReport, ...internshipData } = sample;
    
    // Check if already inserted
    const existing = await prisma.internship.findFirst({
      where: { title: internshipData.title, companyName: internshipData.companyName },
    });

    let internship = existing;
    if (!existing) {
      internship = await prisma.internship.create({
        data: internshipData,
      });
      console.log(`Created: ${internship.title} (${internship.companyName})`);
    }

    // Insert scam report if present
    let reportCount = 0;
    if (scamReport) {
      const existingReport = await prisma.internshipReport.findFirst({
        where: { internshipId: internship.id, userId: student.id },
      });
      if (!existingReport) {
        await prisma.internshipReport.create({
          data: {
            internshipId: internship.id,
            userId: student.id,
            category: scamReport.category,
            description: scamReport.description,
            status: 'RESOLVED',
            resolutionNotes: 'Scam investigation confirmed red flags. Listing blacklisted.',
          },
        });
      }
      reportCount = 1;
    }

    // Run heuristic risk evaluation
    const evaluation = evaluateInternshipRiskSync(internship, reportCount);

    // Update internship with score & level
    await prisma.internship.update({
      where: { id: internship.id },
      data: {
        riskScore: evaluation.score,
        riskLevel: evaluation.level,
      },
    });

    // Delete any old assessment & factors
    const oldAssessment = await prisma.riskAssessment.findUnique({
      where: { internshipId: internship.id },
    });
    if (oldAssessment) {
      await prisma.riskFactor.deleteMany({ where: { riskAssessmentId: oldAssessment.id } });
      await prisma.riskAssessment.delete({ where: { id: oldAssessment.id } });
    }

    const assessment = await prisma.riskAssessment.create({
      data: {
        internshipId: internship.id,
        score: evaluation.score,
        level: evaluation.level,
        isOverridden: false,
        assessedAt: new Date(),
      },
    });

    for (const factor of evaluation.factors) {
      await prisma.riskFactor.create({
        data: {
          riskAssessmentId: assessment.id,
          factorKey: factor.factorKey,
          title: factor.title,
          description: factor.description,
          scoreImpact: factor.scoreImpact,
          isPositive: factor.isPositive,
          category: factor.category,
        },
      });
    }

    console.log(`✓ Evaluated ${internship.title}: Score=${evaluation.score}, Level=${evaluation.level}`);
  }

  console.log('=== All Viva Samples Added and Evaluated Successfully! ===');
}

main()
  .catch((e) => {
    console.error('Error adding viva samples:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
