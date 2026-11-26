const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// Inlined rule evaluation for node seed execution
const FREE_EMAIL_DOMAINS = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'proton.me', 'rediffmail.com'];
const SUSPICIOUS_URL_PATTERNS = ['forms.gle', 'docs.google.com/forms', 'bit.ly', 'tinyurl.com', 't.me', 'wa.me', 'drive.google.com'];
const KNOWN_REPUTABLE_ATS = ['greenhouse.io', 'lever.co', 'workday.com', 'smartrecruiters.com'];
const FEE_KEYWORDS = ['registration fee', 'training fee', 'security deposit', 'processing fee', 'pay to apply'];
const SCAM_JD_KEYWORDS = ['captcha typing', 'copy paste work', 'data entry guarantee', 'earn from home daily', 'no interview needed', 'send resume on whatsapp'];
const SENSITIVE_INFO_KEYWORDS = ['bank account details', 'credit card', 'otp', 'aadhaar card copy', 'passwords'];

function extractDomain(str) {
  if (!str) return '';
  str = str.toLowerCase().trim();
  if (str.includes('@')) return str.split('@')[1];
  str = str.replace(/^(https?:\/\/)?(www\.)?/, '');
  return str.split('/')[0].split(':')[0];
}

function evaluateInternshipRiskSync(internship, reportCount = 0) {
  const factors = [];
  let score = 15;

  const textToCheck = `${internship.title || ''} ${internship.description || ''}`.toLowerCase();
  const website = (internship.companyWebsite || '').toLowerCase().trim();
  const email = (internship.companyEmail || '').toLowerCase().trim();
  const appUrl = (internship.applicationUrl || '').toLowerCase().trim();
  const websiteDomain = extractDomain(website);
  const emailDomain = extractDomain(email);

  if (!website || website.length < 5) {
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

  const hasFeeFlag = internship.requiresFee === true;
  const mentionsFee = FEE_KEYWORDS.some(k => textToCheck.includes(k));
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

  const stipendAmount = Number(internship.stipendAmount) || 0;
  if (stipendAmount > 120000 || textToCheck.includes('earn 50000')) {
    factors.push({
      factorKey: 'UNREALISTIC_STIPEND',
      title: 'Unusually Inflated Stipend',
      description: `Stipend appears disproportionately high for college-level internship standards.`,
      scoreImpact: 18,
      isPositive: false,
      category: 'STIPEND'
    });
    score += 18;
  } else if (stipendAmount >= 8000 && stipendAmount <= 60000) {
    factors.push({
      factorKey: 'REALISTIC_STIPEND',
      title: 'Standard Realistic Stipend',
      description: `Advertised stipend aligns with standard industry rates for student interns.`,
      scoreImpact: -6,
      isPositive: true,
      category: 'STIPEND'
    });
    score -= 6;
  }

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
  console.log('--- Cleaning previous database records ---');
  await prisma.adminAction.deleteMany();
  await prisma.experienceHelpful.deleteMany();
  await prisma.studentExperience.deleteMany();
  await prisma.applicationTracking.deleteMany();
  await prisma.internshipReport.deleteMany();
  await prisma.riskFactor.deleteMany();
  await prisma.riskAssessment.deleteMany();
  await prisma.savedInternship.deleteMany();
  await prisma.internship.deleteMany();
  await prisma.user.deleteMany();

  const defaultPassword = await bcrypt.hash('Password123!', 10);

  console.log('--- Seeding Users (1 Admin, 2 Alumni, 5 Students) ---');
  
  // 1 Admin: Only one Admin account created for Adarsh
  const adminUser = await prisma.user.create({
    data: {
      name: 'Adarsh Verma',
      email: 'adarsh@interncheck.com',
      password: defaultPassword,
      role: 'ADMIN',
      college: 'Computer Science and Engineering',
      branch: 'B.Tech CSE',
      graduationYear: 2026,
    },
  });

  // 2 Alumni
  const alumni1 = await prisma.user.create({
    data: {
      name: 'Aarav Malhotra (Alumni)',
      email: 'aarav.alumni@interncheck.edu',
      password: defaultPassword,
      role: 'ALUMNI',
      college: 'IIT Delhi',
      branch: 'Information Technology',
      graduationYear: 2023,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
    },
  });

  const alumni2 = await prisma.user.create({
    data: {
      name: 'Sneha Patel (Alumni)',
      email: 'sneha.alumni@interncheck.edu',
      password: defaultPassword,
      role: 'ALUMNI',
      college: 'BITS Pilani',
      branch: 'Computer Science',
      graduationYear: 2022,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250',
    },
  });

  // 5 Students
  const student1 = await prisma.user.create({
    data: {
      name: 'Rohan Verma (Demo Student)',
      email: 'rohan.student@interncheck.edu',
      password: defaultPassword,
      role: 'STUDENT',
      college: 'NSUT Delhi',
      branch: 'Computer Engineering',
      graduationYear: 2026,
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=250',
    },
  });

  const student2 = await prisma.user.create({
    data: {
      name: 'Ananya Gupta (Student)',
      email: 'ananya.student@interncheck.edu',
      password: defaultPassword,
      role: 'STUDENT',
      college: 'IIIT Hyderabad',
      branch: 'Computer Science',
      graduationYear: 2025,
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=250',
    },
  });

  const student3 = await prisma.user.create({
    data: {
      name: 'Vikram Singh (Student)',
      email: 'vikram.student@interncheck.edu',
      password: defaultPassword,
      role: 'STUDENT',
      college: 'DTU Delhi',
      branch: 'Software Engineering',
      graduationYear: 2026,
    },
  });

  const student4 = await prisma.user.create({
    data: {
      name: 'Pooja Iyer (Student)',
      email: 'pooja.student@interncheck.edu',
      password: defaultPassword,
      role: 'STUDENT',
      college: 'VIT Vellore',
      branch: 'Information Technology',
      graduationYear: 2025,
    },
  });

  const student5 = await prisma.user.create({
    data: {
      name: 'Karan Mehra (Student)',
      email: 'karan.student@interncheck.edu',
      password: defaultPassword,
      role: 'STUDENT',
      college: 'Thapar University',
      branch: 'Computer Engineering',
      graduationYear: 2026,
    },
  });

  console.log('--- Seeding 15 Realistic Internships (Low, Medium, High Risk) ---');

  const internshipsData = [
    // 1. LOW RISK - Razorpay
    {
      title: 'Frontend Engineering Intern (React/Next.js)',
      companyName: 'Razorpay Software Pvt Ltd',
      companyWebsite: 'https://razorpay.com',
      companyEmail: 'careers@razorpay.com',
      description: 'Join the merchant dashboard team at Razorpay. You will build high-performance React and Next.js interfaces handling millions of daily transactions. Strong foundation in JavaScript, DOM APIs, and CSS required.',
      requiredSkills: 'React, Next.js, JavaScript, Tailwind CSS, REST APIs',
      domain: 'Web Development',
      location: 'Bengaluru, Karnataka',
      workMode: 'HYBRID',
      stipend: '₹45,000 / month',
      stipendAmount: 45000,
      isPaid: true,
      requiresFee: false,
      duration: '6 months',
      applicationUrl: 'https://razorpay.greenhouse.io/jobs/frontend-intern',
      listingSource: 'Official Careers Portal',
      verificationStatus: 'APPROVED',
      postedById: adminUser.id,
    },
    // 2. LOW RISK - Swiggy
    {
      title: 'Backend Engineering Intern (Node.js/Go)',
      companyName: 'Swiggy',
      companyWebsite: 'https://swiggy.com',
      companyEmail: 'talent@swiggy.in',
      description: 'Work with the logistics microservices team. Implement scalable REST and gRPC endpoints, write PostgreSQL and Redis database queries, and optimize low-latency dispatch algorithms.',
      requiredSkills: 'Node.js, Express, PostgreSQL, Redis, Docker',
      domain: 'Backend Development',
      location: 'Bengaluru, Karnataka',
      workMode: 'ONSITE',
      stipend: '₹50,000 / month',
      stipendAmount: 50000,
      isPaid: true,
      requiresFee: false,
      duration: '6 months',
      applicationUrl: 'https://swiggy.lever.co/jobs/backend-intern',
      listingSource: 'Verified Recruiter',
      verificationStatus: 'APPROVED',
      postedById: adminUser.id,
    },
    // 3. LOW RISK - Postman
    {
      title: 'API Platform Engineering Intern',
      companyName: 'Postman',
      companyWebsite: 'https://postman.com',
      companyEmail: 'university@postman.com',
      description: 'Help build developer tooling for over 30 million API developers globally. Write modular Node.js SDKs, participate in code reviews, and contribute to Postman open-source collections.',
      requiredSkills: 'Node.js, TypeScript, REST APIs, Git, Testing',
      domain: 'Software Engineering',
      location: 'Bengaluru, India',
      workMode: 'REMOTE',
      stipend: '₹40,000 / month',
      stipendAmount: 40000,
      isPaid: true,
      requiresFee: false,
      duration: '3 months',
      applicationUrl: 'https://postman.workday.com/careers/intern-api',
      listingSource: 'University Placement Cell',
      verificationStatus: 'APPROVED',
      postedById: adminUser.id,
    },
    // 4. LOW RISK - Hasura
    {
      title: 'Data Engineering & GraphQL Intern',
      companyName: 'Hasura Inc',
      companyWebsite: 'https://hasura.io',
      companyEmail: 'jobs@hasura.io',
      description: 'Assist in building automated connectors between PostgreSQL and Hasura GraphQL engine. Conduct performance benchmarks and write developer guides.',
      requiredSkills: 'PostgreSQL, GraphQL, Docker, Python',
      domain: 'Data Science',
      location: 'Remote, India',
      workMode: 'REMOTE',
      stipend: '₹35,000 / month',
      stipendAmount: 35000,
      isPaid: true,
      requiresFee: false,
      duration: '4 months',
      applicationUrl: 'https://hasura.io/careers/openings/data-intern',
      listingSource: 'Direct Submission',
      verificationStatus: 'APPROVED',
      postedById: alumni1.id,
    },
    // 5. LOW RISK - Zerodha
    {
      title: 'Systems & Infrastructure Intern',
      companyName: 'Zerodha Broking Ltd',
      companyWebsite: 'https://zerodha.com',
      companyEmail: 'hiring@zerodha.com',
      description: 'Work with the FOSS-driven infrastructure team. Build internal observability dashboards, write monitoring scripts in Python and Bash, and assist with Linux server tuning.',
      requiredSkills: 'Linux, Python, Bash, Networking, PostgreSQL',
      domain: 'DevOps / Cloud',
      location: 'Bengaluru, Karnataka',
      workMode: 'ONSITE',
      stipend: '₹35,000 / month',
      stipendAmount: 35000,
      isPaid: true,
      requiresFee: false,
      duration: '6 months',
      applicationUrl: 'https://zerodha.com/careers/infra-intern',
      listingSource: 'Alumni Referral',
      verificationStatus: 'APPROVED',
      postedById: alumni2.id,
    },
    // 6. LOW RISK - Cred
    {
      title: 'Mobile App Developer Intern (Flutter)',
      companyName: 'Dreamplug Technologies (CRED)',
      companyWebsite: 'https://cred.club',
      companyEmail: 'campus@cred.club',
      description: 'Craft fluid, 60fps animations and micro-interactions for the CRED mobile application using Flutter and native Android bridging.',
      requiredSkills: 'Flutter, Dart, Mobile UI, State Management, Git',
      domain: 'Mobile App Development',
      location: 'Bengaluru, Karnataka',
      workMode: 'HYBRID',
      stipend: '₹60,000 / month',
      stipendAmount: 60000,
      isPaid: true,
      requiresFee: false,
      duration: '6 months',
      applicationUrl: 'https://cred.club/careers/flutter-intern',
      listingSource: 'Campus Drive',
      verificationStatus: 'APPROVED',
      postedById: adminUser.id,
    },

    // 7. MEDIUM RISK - Stealth Web Agency
    {
      title: 'Full Stack Web Developer Intern',
      companyName: 'NextWave Digital Solutions',
      companyWebsite: 'https://nextwavedigital.in',
      companyEmail: 'nextwavehr@gmail.com', // Free email flag
      description: 'We are a fast-growing digital agency looking for an enthusiastic Full Stack intern to build client landing pages and dashboards. Must know HTML, CSS, JavaScript, and Node.js. Certificate upon completion.',
      requiredSkills: 'HTML, CSS, JavaScript, Express, MongoDB',
      domain: 'Web Development',
      location: 'Noida, Uttar Pradesh',
      workMode: 'REMOTE',
      stipend: '₹8,000 / month',
      stipendAmount: 8000,
      isPaid: true,
      requiresFee: false,
      duration: '2 months',
      applicationUrl: 'https://forms.gle/xK9zM8Q7s1NextWave', // Google form flag
      listingSource: 'LinkedIn Job Post',
      verificationStatus: 'PENDING',
      postedById: student1.id,
    },
    // 8. MEDIUM RISK - AI Startup Lab
    {
      title: 'Junior Machine Learning Research Intern',
      companyName: 'CognitiveByte AI Labs',
      companyWebsite: 'https://cognitivebyte.io',
      companyEmail: 'founders@cognitivebyte.io',
      description: 'Work on fine-tuning open source LLMs and computer vision models. Candidates should have completed relevant coursework in linear algebra and PyTorch. Early stage stealth startup.',
      requiredSkills: 'Python, PyTorch, Scikit-Learn, Pandas',
      domain: 'Artificial Intelligence',
      location: 'Hyderabad, Telangana',
      workMode: 'REMOTE',
      stipend: 'Unpaid / Equity consideration',
      stipendAmount: 0,
      isPaid: false,
      requiresFee: false,
      duration: '3 months',
      applicationUrl: 'https://cognitivebyte.io/apply-intern',
      listingSource: 'Discord Community',
      verificationStatus: 'PENDING',
      postedById: student2.id,
    },
    // 9. MEDIUM RISK - Indie Game Studio
    {
      title: 'Unity 3D Game Design Intern',
      companyName: 'PixelForge Interactive',
      companyWebsite: 'https://pixelforgegames.in',
      companyEmail: 'contact@pixelforgegames.in',
      description: 'Looking for aspiring game devs to build gameplay mechanics in Unity. Short description provided.',
      requiredSkills: 'Unity 3D, C#, 3D Modeling, Game Physics',
      domain: 'Game Development',
      location: 'Pune, Maharashtra',
      workMode: 'HYBRID',
      stipend: '₹12,000 / month',
      stipendAmount: 12000,
      isPaid: true,
      requiresFee: false,
      duration: '3 months',
      applicationUrl: 'https://bit.ly/pixelforge-intern-apply', // Bitly link
      listingSource: 'College Telegram Group',
      verificationStatus: 'PENDING',
      postedById: student3.id,
    },
    // 10. MEDIUM RISK - Cloud Consulting Co
    {
      title: 'Cloud Security Associate Intern',
      companyName: 'SecureNet Infra Solutions',
      companyWebsite: 'https://securenetinfra.co',
      companyEmail: 'support@securenetinfra.co',
      description: 'Assist in configuring AWS IAM policies and running open-source vulnerability scans. Candidates must have basic AWS cloud knowledge.',
      requiredSkills: 'AWS, IAM, Linux, Bash',
      domain: 'Cybersecurity',
      location: 'Gurugram, Haryana',
      workMode: 'REMOTE',
      stipend: '₹15,000 / month',
      stipendAmount: 15000,
      isPaid: true,
      requiresFee: false,
      duration: '3 months',
      applicationUrl: 'https://securenetinfra.co/apply',
      listingSource: 'Internshala',
      verificationStatus: 'PENDING',
      postedById: student4.id,
    },

    // 11. HIGH RISK / SCAM - Registration Fee Scam
    {
      title: 'Software Developer Intern (100% Guaranteed Job)',
      companyName: 'Apex Global Tech Solutions',
      companyWebsite: '', // No website
      companyEmail: 'apextech.hr.team@gmail.com', // Gmail
      description: 'Urgent hiring for freshers! Work on live international software projects from home. Candidates must pay a mandatory registration fee and security deposit of ₹1,499 for software tool access and ID card creation. 100% guaranteed placement with ₹8 LPA package after 2 months.',
      requiredSkills: 'Any basic computer knowledge',
      domain: 'Web Development',
      location: 'Remote Work From Home',
      workMode: 'REMOTE',
      stipend: '₹40,000 / month',
      stipendAmount: 40000,
      isPaid: true,
      requiresFee: true, // Fee required flag
      duration: '2 months',
      applicationUrl: 'https://forms.gle/scamFeeFormApex123',
      listingSource: 'Unsolicited WhatsApp Message',
      verificationStatus: 'REJECTED',
      adminNotes: 'Confirmed fee scam. Requires ₹1,499 upfront for fake training kit and tools.',
      postedById: student5.id,
    },
    // 12. HIGH RISK / SCAM - Captcha Typing & Data Entry
    {
      title: 'Online Data Processing & Captcha Typing Intern',
      companyName: 'QuickEarn Infotech Services',
      companyWebsite: 'http://quickearn-typing-jobs.blogspot.com', // Free blogspot
      companyEmail: 'quickearndata@yahoo.com',
      description: 'Simple captcha typing and copy paste work for college students! Earn from home daily with no interview needed. Work 2 hours daily and earn ₹15,000 weekly stipend. Send resume on whatsapp immediately to start typing.',
      requiredSkills: 'English typing, internet connection',
      domain: 'Data Entry',
      location: 'All India Remote',
      workMode: 'REMOTE',
      stipend: '₹60,000 / month',
      stipendAmount: 60000,
      isPaid: true,
      requiresFee: false,
      duration: '1 month',
      applicationUrl: 'https://wa.me/919876543210?text=Interested_In_Typing_Job',
      listingSource: 'Instagram Sponsored Ad',
      verificationStatus: 'REJECTED',
      adminNotes: 'Classic data entry scam lure. Later demands money when fake accuracy threshold fails.',
      postedById: student1.id,
    },
    // 13. HIGH RISK / SCAM - Unrealistic Stipend & Telegram Scam
    {
      title: 'AI Python Model Trainer Intern',
      companyName: 'QuantumCore Global Ltd',
      companyWebsite: '',
      companyEmail: 'quantumcore_recruitment@proton.me',
      description: 'Immediate offer letter issued! No skill required. Earn ₹1,50,000 / month by rating AI responses. Join our telegram channel to submit your bank account details and receive initial orientation payout.',
      requiredSkills: 'Smartphone, Telegram',
      domain: 'Artificial Intelligence',
      location: 'Remote',
      workMode: 'REMOTE',
      stipend: '₹1,50,000 / month',
      stipendAmount: 150000,
      isPaid: true,
      requiresFee: false,
      duration: '1 month',
      applicationUrl: 'https://t.me/QuantumCoreHiringOfficialBot',
      listingSource: 'Telegram Channel',
      verificationStatus: 'REJECTED',
      adminNotes: 'Phishing scam targeting student bank accounts and task-based financial fraud.',
      postedById: student2.id,
    },
    // 14. HIGH RISK / SCAM - Sensitive Info Harvesting
    {
      title: 'Cybersecurity Junior Analyst Intern',
      companyName: 'SecureShield Cyber Defence',
      companyWebsite: 'https://secureshield-fake-portal.xyz',
      companyEmail: 'hr@secureshield-fake-portal.xyz',
      description: 'Government project cyber assessment intern. To verify Indian citizenship before interview, candidates must upload clear aadhaar card copy and net banking verification proof to our cloud link.',
      requiredSkills: 'Networking basics, Information Security',
      domain: 'Cybersecurity',
      location: 'New Delhi',
      workMode: 'REMOTE',
      stipend: '₹25,000 / month',
      stipendAmount: 25000,
      isPaid: true,
      requiresFee: false,
      duration: '3 months',
      applicationUrl: 'https://drive.google.com/drive/folders/secureshield-kyc-upload',
      listingSource: 'Unverified Job Board',
      verificationStatus: 'REJECTED',
      adminNotes: 'Identity theft threat: Harvesting government IDs and banking proof under fake defense guise.',
      postedById: student3.id,
    },
    // 15. HIGH RISK / SCAM - Paid Certificate & Kit scam
    {
      title: 'Web Design & Cloud Trainee Intern',
      companyName: 'InnoTech Career Accelerators',
      companyWebsite: 'http://innotech-training.tk',
      companyEmail: 'info@innotech-training.tk',
      description: 'Guaranteed placement after 4 weeks of remote project work! Selected interns must pay ₹2,500 training fee for official ISO-certified verification badge, LMS portal login, and project repository access.',
      requiredSkills: 'HTML, CSS',
      domain: 'Web Development',
      location: 'Remote',
      workMode: 'REMOTE',
      stipend: '₹18,000 / month',
      stipendAmount: 18000,
      isPaid: true,
      requiresFee: true,
      duration: '1 month',
      applicationUrl: 'https://tinyurl.com/innotech-fee-gateway',
      listingSource: 'Spam Email',
      verificationStatus: 'REJECTED',
      adminNotes: 'Course selling masquerading as an internship. Demands ₹2,500 LMS kit charges.',
      postedById: student4.id,
    },
  ];

  const createdInternships = [];
  for (const item of internshipsData) {
    const internship = await prisma.internship.create({
      data: item,
    });
    createdInternships.push(internship);
  }

  console.log('--- Seeding Reports for Suspicious Internships ---');
  // Reports against Apex Global Tech (scam 11)
  const report1 = await prisma.internshipReport.create({
    data: {
      internshipId: createdInternships[10].id,
      userId: student1.id,
      category: 'MONEY_ASKING',
      description: 'The recruiter called me and demanded ₹1,499 via Google Pay before sending the offer letter. They claimed it is a refundable training deposit.',
      evidenceUrl: 'https://drive.google.com/screenshot-gpay-demand.png',
      status: 'RESOLVED',
      resolutionNotes: 'Verified scam complaint. Listing removed and flagged.',
    },
  });

  const report2 = await prisma.internshipReport.create({
    data: {
      internshipId: createdInternships[10].id,
      userId: student2.id,
      category: 'FAKE_OFFER',
      description: 'They sent a fake offer letter on WhatsApp with an invalid MCA registration number and demanded money.',
      status: 'RESOLVED',
      resolutionNotes: 'Duplicate complaint confirmed. Employer blacklisted.',
    },
  });

  // Report against QuickEarn (scam 12)
  await prisma.internshipReport.create({
    data: {
      internshipId: createdInternships[11].id,
      userId: student3.id,
      category: 'FAKE_JD',
      description: 'They are running a captcha scam. When you submit captchas, their system arbitrarily marks 90% as wrong and demands a server maintenance charge.',
      status: 'RESOLVED',
      resolutionNotes: 'Scam confirmed. Blocked.',
    },
  });

  // Report against QuantumCore (scam 13)
  await prisma.internshipReport.create({
    data: {
      internshipId: createdInternships[12].id,
      userId: student4.id,
      category: 'PERSONAL_INFO_MISUSE',
      description: 'Immediately redirected me to a Telegram bot asking for bank account number and OTP under the guise of direct stipend credit.',
      status: 'RESOLVED',
      resolutionNotes: 'High severity financial phishing detected.',
    },
  });

  // Report against SecureShield (scam 14)
  await prisma.internshipReport.create({
    data: {
      internshipId: createdInternships[13].id,
      userId: student5.id,
      category: 'SUSPICIOUS_COMMUNICATION',
      description: 'They asked me to upload an unmasked Aadhaar card copy to an open Google Drive link before conducting any technical evaluation.',
      status: 'RESOLVED',
      resolutionNotes: 'Flagged for identity theft attempts.',
    },
  });

  console.log('--- Computing Risk Assessments & Factors for all 15 Listings ---');
  for (const internship of createdInternships) {
    const reportCount = await prisma.internshipReport.count({
      where: { internshipId: internship.id },
    });

    const evaluation = evaluateInternshipRiskSync(internship, reportCount);

    // Update internship with computed risk
    await prisma.internship.update({
      where: { id: internship.id },
      data: {
        riskScore: evaluation.score,
        riskLevel: evaluation.level,
      },
    });

    // Create RiskAssessment record
    const assessment = await prisma.riskAssessment.create({
      data: {
        internshipId: internship.id,
        score: evaluation.score,
        level: evaluation.level,
        isOverridden: false,
        assessedAt: new Date(),
      },
    });

    // Create individual RiskFactors
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
  }

  console.log('--- Seeding 10 Authentic Student Experiences ---');
  const experiencesData = [
    {
      userId: alumni1.id,
      companyName: 'Razorpay Software Pvt Ltd',
      internshipRole: 'Frontend Engineering Intern',
      domain: 'Web Development',
      duration: '6 months',
      stipend: '₹45,000 / month',
      selectionProcess: 'Resume screening followed by an online assignment (building a reusable component in React) and 2 technical rounds focusing on JavaScript fundamentals, event loops, and web performance.',
      interviewQuestions: '1. Explain closures with a practical debouncing implementation.\n2. How does React Reconciliation (Fiber) work?\n3. How would you optimize First Contentful Paint (FCP) on an e-commerce dashboard?',
      workExperience: 'Amazing team culture. Got to contribute code directly into the merchant payment gateway portal. Mentors were accessible and code reviews were thorough.',
      offerReceived: true,
      certificateReceived: true,
      rating: 5,
      feedback: 'Outstanding experience for anyone looking to build production React skills at scale. PPO conversion rates are fair if you deliver sprint goals.',
      adviceForJuniors: 'Deep dive into vanilla JavaScript before jumping into frameworks. Know how browser rendering works.',
      isVerified: true,
      status: 'APPROVED',
      helpfulCount: 14,
    },
    {
      userId: alumni2.id,
      companyName: 'Swiggy',
      internshipRole: 'Backend Engineering Intern',
      domain: 'Backend Development',
      duration: '6 months',
      stipend: '₹50,000 / month',
      selectionProcess: 'Online coding test on HackerEarth (2 medium DSA questions, 1 SQL problem) followed by 2 system design and DSA rounds.',
      interviewQuestions: '1. Design an in-memory rate limiter using Redis Token Bucket algorithm.\n2. Indexing strategies for geo-spatial queries in PostgreSQL.\n3. Concurrency control and optimistic locking in distributed systems.',
      workExperience: 'Fast-paced, high ownership environment. Handled order routing edge cases and learned how to debug production alerts with Grafana.',
      offerReceived: true,
      certificateReceived: true,
      rating: 5,
      feedback: 'Top tier engineering standards. The engineering blog accurately reflects the challenges you solve day-to-day.',
      adviceForJuniors: 'Practice SQL optimization and understand database internals, not just basic CRUD.',
      isVerified: true,
      status: 'APPROVED',
      helpfulCount: 19,
    },
    {
      userId: student1.id,
      companyName: 'Postman',
      internshipRole: 'API Platform Intern',
      domain: 'Software Engineering',
      duration: '3 months',
      stipend: '₹40,000 / month',
      selectionProcess: 'Take-home assignment to build a CLI API test generator in Node.js, followed by a live code walkthrough with senior architects.',
      interviewQuestions: '1. How do you design idempotent REST API endpoints?\n2. What is the difference between OAuth 2.0 Authorization Code vs Client Credentials grant?\n3. Write an asynchronous queue processor in Node.js with concurrency limit.',
      workExperience: 'Super developer-centric culture. High emphasis on documentation and clean code. Every PR gets reviewed by multiple engineers.',
      offerReceived: false,
      certificateReceived: true,
      rating: 4,
      feedback: 'Great learning on developer tools. Flexible work hours and very supportive team.',
      adviceForJuniors: 'Build real open-source projects or API tools. Postman loves candidates with active GitHub profiles.',
      isVerified: true,
      status: 'APPROVED',
      helpfulCount: 8,
    },
    {
      userId: student2.id,
      companyName: 'Hasura Inc',
      internshipRole: 'GraphQL & Data Intern',
      domain: 'Data Science',
      duration: '4 months',
      stipend: '₹35,000 / month',
      selectionProcess: 'Resume review, followed by 1 technical coding round in Python/SQL and 1 system discussion on database schemas and GraphQL resolvers.',
      interviewQuestions: '1. What causes the N+1 problem in GraphQL and how do DataLoaders resolve it?\n2. Write a PostgreSQL recursive CTE query to traverse a hierarchical comment thread.',
      workExperience: 'Remote-first culture with great work-life balance. Learned deep database internals and query planning.',
      offerReceived: true,
      certificateReceived: true,
      rating: 5,
      feedback: 'One of the best remote internship experiences. Transparent communication across all timezones.',
      adviceForJuniors: 'Understand EXPLAIN ANALYZE in PostgreSQL and relational algebra.',
      isVerified: true,
      status: 'APPROVED',
      helpfulCount: 11,
    },
    {
      userId: alumni1.id,
      companyName: 'Zerodha Broking Ltd',
      internshipRole: 'Systems Engineering Intern',
      domain: 'DevOps / Cloud',
      duration: '6 months',
      stipend: '₹35,000 / month',
      selectionProcess: 'Practical assignment involving Linux debugging and writing an automated monitoring daemon in Go or Python. One deep technical viva.',
      interviewQuestions: '1. What happens at the kernel level when a TCP SYN packet arrives on a listening socket?\n2. How do Linux namespaces and cgroups power containerization?',
      workExperience: 'Pure focus on open-source software with zero corporate fluff. Learned how minimalist architecture scales efficiently.',
      offerReceived: true,
      certificateReceived: true,
      rating: 5,
      feedback: 'Unbeatable if you love systems programming and FOSS philosophy.',
      adviceForJuniors: 'Read the source code of tools you use. Don’t rely on black-box cloud services blindly.',
      isVerified: true,
      status: 'APPROVED',
      helpfulCount: 16,
    },
    {
      userId: student3.id,
      companyName: 'Dreamplug Technologies (CRED)',
      internshipRole: 'Mobile Development Intern',
      domain: 'Mobile App Development',
      duration: '6 months',
      stipend: '₹60,000 / month',
      selectionProcess: 'Design and prototype a gamified swipe UI interaction in Flutter/Kotlin within 48 hours, followed by 2 technical interviews.',
      interviewQuestions: '1. State management comparisons in Flutter (Bloc vs Riverpod).\n2. Custom render objects and how Flutter compiles to native ARM instructions.',
      workExperience: 'High intensity and extremely aesthetic-driven. High expectations but stipend and perks are unmatched.',
      offerReceived: true,
      certificateReceived: true,
      rating: 4,
      feedback: 'Pushes your frontend skills to absolute perfection. Fast-paced delivery cycles.',
      adviceForJuniors: 'Pay close attention to 60fps animations and micro-interactions.',
      isVerified: true,
      status: 'APPROVED',
      helpfulCount: 7,
    },
    {
      userId: student4.id,
      companyName: 'NextWave Digital Solutions',
      internshipRole: 'Full Stack Intern',
      domain: 'Web Development',
      duration: '2 months',
      stipend: '₹8,000 / month',
      selectionProcess: 'Direct telephonic interview with agency manager asking about HTML/CSS and basic WordPress/Express setup.',
      interviewQuestions: '1. How to center a div?\n2. What is the difference between GET and POST?',
      workExperience: 'Work was mostly making minor CSS updates to WordPress templates and basic landing pages. Very small team.',
      offerReceived: false,
      certificateReceived: true,
      rating: 3,
      feedback: 'Legitimate small agency, but learning scope is limited to repetitive web updates. Good only for absolute beginners needing a first certificate.',
      adviceForJuniors: 'Clarify project tech stack in writing before joining so you do not get assigned data entry or plain HTML styling.',
      isVerified: true,
      status: 'APPROVED',
      helpfulCount: 5,
    },
    {
      userId: student5.id,
      companyName: 'CognitiveByte AI Labs',
      internshipRole: 'Research Intern',
      domain: 'Artificial Intelligence',
      duration: '3 months',
      stipend: 'Unpaid / Equity consideration',
      selectionProcess: 'Discussion with founder about undergraduate research paper and GitHub repos on PyTorch.',
      interviewQuestions: '1. Explain backpropagation mathematical derivation.\n2. Difference between LoRA and full fine-tuning.',
      workExperience: 'Interesting technical problem statement, but lack of stipend and irregular mentorship made it difficult to sustain alongside college.',
      offerReceived: false,
      certificateReceived: true,
      rating: 2,
      feedback: 'Real tech, but unpaid internships should be evaluated carefully. Founders are too busy to guide consistently.',
      adviceForJuniors: 'Try to negotiate at least an expense reimbursement stipend.',
      isVerified: true,
      status: 'APPROVED',
      helpfulCount: 9,
    },
    {
      userId: alumni2.id,
      companyName: 'PixelForge Interactive',
      internshipRole: 'Game Dev Intern',
      domain: 'Game Development',
      duration: '3 months',
      stipend: '₹12,000 / month',
      selectionProcess: 'Portfolio review of playable itch.io game builds followed by 1 coding test in C#.',
      interviewQuestions: '1. How do you prevent garbage collection spikes in Unity game loops?\n2. Spatial partitioning techniques in 2D collision detection.',
      workExperience: 'Fun environment building hyper-casual mobile titles. Stipend was paid on time.',
      offerReceived: false,
      certificateReceived: true,
      rating: 4,
      feedback: 'Good stepping stone for gaming enthusiasts looking for commercial studio experience.',
      adviceForJuniors: 'Publish at least one playable mini-game on Itch.io or WebGL.',
      isVerified: true,
      status: 'APPROVED',
      helpfulCount: 6,
    },
    {
      userId: student1.id,
      companyName: 'SecureNet Infra Solutions',
      internshipRole: 'Cloud Security Intern',
      domain: 'Cybersecurity',
      duration: '3 months',
      stipend: '₹15,000 / month',
      selectionProcess: 'Multiple choice quiz on basic networking and AWS concepts, followed by a 30-minute interview.',
      interviewQuestions: '1. Explain CIDR block subnetting.\n2. How does an AWS Security Group differ from a Network ACL?',
      workExperience: 'Assisted in client infrastructure audits. Good foundational exposure to cloud compliance.',
      offerReceived: false,
      certificateReceived: true,
      rating: 4,
      feedback: 'Decent consulting exposure. Paid on time, though stipend is modest.',
      adviceForJuniors: 'Get comfortable with basic Linux command line and AWS IAM before applying.',
      isVerified: false,
      status: 'PENDING',
      helpfulCount: 2,
    },
  ];

  for (const exp of experiencesData) {
    await prisma.studentExperience.create({
      data: exp,
    });
  }

  console.log('--- Seeding Saved Internships & Application Tracking ---');
  // Student 1 saves Razorpay and Postman
  await prisma.savedInternship.create({
    data: {
      userId: student1.id,
      internshipId: createdInternships[0].id,
    },
  });
  await prisma.savedInternship.create({
    data: {
      userId: student1.id,
      internshipId: createdInternships[2].id,
    },
  });

  // Student 1 application tracking
  await prisma.applicationTracking.create({
    data: {
      userId: student1.id,
      internshipId: createdInternships[0].id,
      status: 'INTERVIEW',
      notes: 'Cleared technical screening round. Scheduled for live system coding with engineering manager next Tuesday.',
    },
  });
  await prisma.applicationTracking.create({
    data: {
      userId: student1.id,
      internshipId: createdInternships[1].id,
      status: 'APPLIED',
      notes: 'Submitted resume via career portal. Awaiting response.',
    },
  });
  await prisma.applicationTracking.create({
    data: {
      userId: student1.id,
      internshipId: createdInternships[2].id,
      status: 'ASSESSMENT',
      notes: 'Received take-home API CLI generator assignment. Due in 5 days.',
    },
  });

  // Student 2 saves Hasura & tracks Swiggy
  await prisma.savedInternship.create({
    data: {
      userId: student2.id,
      internshipId: createdInternships[3].id,
    },
  });
  await prisma.applicationTracking.create({
    data: {
      userId: student2.id,
      internshipId: createdInternships[1].id,
      status: 'SELECTED',
      notes: 'Received official offer letter via email! Starting next month.',
    },
  });

  console.log('--- Seeding Admin Actions Log ---');
  await prisma.adminAction.create({
    data: {
      adminId: adminUser.id,
      actionType: 'RESOLVE_REPORT',
      targetType: 'REPORT',
      targetId: report1.id,
      details: 'Reviewed scam report on Apex Global Tech. Verified upfront registration fee demand. Listing blacklisted.',
    },
  });
  await prisma.adminAction.create({
    data: {
      adminId: adminUser.id,
      actionType: 'REJECT_INTERNSHIP',
      targetType: 'INTERNSHIP',
      targetId: createdInternships[10].id,
      details: 'Flagged and rejected Apex Global Tech for violating safety policy by demanding application fees.',
    },
  });

  console.log('=== Database Seeding Completed Successfully! ===');
  console.log('Admin Account: adarsh@interncheck.com / Password123!');
  console.log('Alumni Account: aarav.alumni@interncheck.edu / Password123!');
  console.log('Student Account: rohan.student@interncheck.edu / Password123!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
