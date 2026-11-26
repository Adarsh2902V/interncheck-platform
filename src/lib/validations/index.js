import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['STUDENT', 'ALUMNI']).default('STUDENT'),
  college: z.string().optional(),
  branch: z.string().optional(),
  graduationYear: z.coerce.number().int().min(2000).max(2035).optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const internshipSchema = z.object({
  title: z.string().min(3, 'Title is required (at least 3 characters)'),
  companyName: z.string().min(2, 'Company name is required'),
  companyWebsite: z.string().url('Must be a valid URL (e.g. https://company.com)').or(z.literal('')).optional(),
  companyEmail: z.string().email('Invalid email address').or(z.literal('')).optional(),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  requiredSkills: z.string().min(2, 'Skills are required (comma separated)'),
  domain: z.string().min(2, 'Domain is required'),
  location: z.string().min(2, 'Location is required'),
  workMode: z.enum(['REMOTE', 'HYBRID', 'ONSITE']).default('REMOTE'),
  stipend: z.string().min(1, 'Stipend description is required'),
  stipendAmount: z.coerce.number().optional().default(0),
  isPaid: z.boolean().default(true),
  requiresFee: z.boolean().default(false),
  duration: z.string().min(1, 'Duration is required'),
  applicationDeadline: z.string().optional().nullable(),
  applicationUrl: z.string().url('Must be a valid URL'),
  listingSource: z.string().default('Direct Submission'),
});

export const reportSchema = z.object({
  internshipId: z.string().uuid('Invalid internship ID'),
  category: z.enum([
    'MONEY_ASKING',
    'FAKE_COMPANY',
    'FAKE_JD',
    'FAKE_OFFER',
    'PERSONAL_INFO_MISUSE',
    'SUSPICIOUS_COMMUNICATION',
    'OTHER',
  ]),
  description: z.string().min(15, 'Please provide details of the suspicious activity (at least 15 characters)'),
  evidenceUrl: z.string().url('Must be a valid URL or cloud link').or(z.literal('')).optional(),
});

export const experienceSchema = z.object({
  companyName: z.string().min(2, 'Company name is required'),
  internshipRole: z.string().min(2, 'Internship role is required'),
  domain: z.string().optional(),
  duration: z.string().min(1, 'Duration is required'),
  stipend: z.string().min(1, 'Stipend details are required'),
  selectionProcess: z.string().min(15, 'Selection process details required'),
  interviewQuestions: z.string().min(15, 'Please share interview questions'),
  workExperience: z.string().min(20, 'Please describe work experience and learning'),
  offerReceived: z.boolean().default(false),
  certificateReceived: z.boolean().default(true),
  rating: z.coerce.number().int().min(1).max(5),
  feedback: z.string().min(15, 'Feedback is required'),
  adviceForJuniors: z.string().min(10, 'Advice for juniors is required'),
});

export const applicationTrackingSchema = z.object({
  internshipId: z.string().uuid('Invalid internship ID'),
  status: z.enum(['INTERESTED', 'APPLIED', 'ASSESSMENT', 'INTERVIEW', 'SELECTED', 'REJECTED']).default('INTERESTED'),
  notes: z.string().optional(),
});
