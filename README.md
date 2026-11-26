# InternCheck – Is This Internship Real? 🛡️
> **"Don't just find internships. Verify them."**
> **3rd Year B.Tech Computer Science and Engineering Major Project**

InternCheck is a full-stack web application designed to protect college engineering students from fake internship listings, registration fee scams, phishing recruiters, and misleading job postings through an automated **10-Parameter Rule-Based Risk Assessment Engine**, authentic peer reviews, and comprehensive application tracking.

---

## 🚀 Key Highlights & Major Project Requirements

- **Modular Monolithic Architecture**: Simple, robust, and viva-ready without complex microservices or unnecessary cloud dependencies.
- **Rule-Based Risk Assessment Engine**: Heuristic engine analyzing 10 weighted parameters, scoring opportunities from 0 to 100 (*Low Risk*, *Medium Risk*, *High Risk*), providing transparent risk factors and positive signals.
- **Relational PostgreSQL Database via Prisma ORM**: 10 interconnected models with cascading deletes, foreign keys, unique constraints, and indexes.
- **Role-Based Access Control (RBAC)**: Secure access tailored for three roles: `STUDENT`, `ALUMNI`, and `ADMIN`.
- **Peer Knowledge Repository**: Transparent interview questions, selection process details, stipends, and advice submitted by seniors and verified with alumni badges.
- **Application Pipeline Tracker**: Students track stages (*Interested*, *Applied*, *Assessment*, *Interview*, *Selected*, *Rejected*) with personal notes and interview preparation logs.
- **Visual Analytics**: Interactive Recharts dashboards for risk distributions, tech domain trends, and scam report metrics.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | Next.js (App Router), React 18, JavaScript (ES6+), Tailwind CSS, Lucide React, Sonner Toast |
| **Backend** | Next.js Route Handlers, Node.js, REST APIs, JSON Web Tokens (JWT), bcryptjs |
| **Database** | PostgreSQL 18, Prisma ORM |
| **Data Visualization** | Recharts Library |
| **Validation** | Zod (Client-side & Server-side schema validation) |

---

## 🧩 Three Core Integrated Modules

```
Internship Listing ──► Automated 10-Point Risk Assessment ──► Student Experience Repository ──► Informed Application Decision
```

1. **Module 1: Internship Listing Service**
   - Multi-parameter search (company, title, skills).
   - Domain filtering (Web Dev, AI/ML, Data Science, DevOps, Cybersecurity, etc.).
   - Work mode toggle (Remote, Hybrid, Onsite).
   - Stipend filtering and sorting.
   - Bookmark / Save functionality.
   - Student & Alumni listing submissions with admin moderation.

2. **Module 2: Verification & Risk Assessment Engine**
   - Evaluates 10 heuristic rules:
     1. Company website availability & domain verification.
     2. Company email authenticity (Corporate domain vs Free Gmail/Yahoo).
     3. Registration / training fee detection (**Critical Red Flag: +35 pts**).
     4. Unrealistic stipend promises (Exorbitant payouts: +18 pts).
     5. Missing or sparse company information (+12 pts).
     6. Suspicious application URLs (Google Forms, WhatsApp, Telegram, Bitly vs Enterprise ATS: Greenhouse, Lever, Workday).
     7. Flagged scam JD keywords (Captcha typing, copy paste, guaranteed placement).
     8. Sensitive data requests (Bank account, OTP, Aadhaar upfront).
     9. Admin moderation status (Verified organization vs Flagged listing).
     10. Community scam reports count (Dynamic recalculation).
   - Normalizes scores from 0 to 100:
     - `0 – 30`: **Low Risk (Green)**
     - `31 – 60`: **Medium Risk (Amber)**
     - `61 – 100`: **High Risk (Red)**
   - Displays positive verification signals and negative risk indicators.
   - Official screening disclaimer banner.

3. **Module 3: Student Experience Repository**
   - Real interview questions and technical test rounds.
   - Selection process breakdowns.
   - Stipends received and PPO offer confirmations.
   - 1-to-5 star rating system and advice for juniors.
   - "Helpful" peer voting system with verified senior badges.

---

## 🔑 Demo Login Credentials (For Viva & Evaluation)

| Role | Email | Password | Access Capabilities |
| :--- | :--- | :--- | :--- |
| **Admin (Adarsh)** | `adarsh@interncheck.com` | `Password123!` | Platform governance, approval queues, scam investigations, risk score overrides, user analytics |
| **Alumni** | `aarav.alumni@interncheck.edu` | `Password123!` | Submit verified senior experiences, review submissions, view alumni dashboard |
| **Student** | `rohan.student@interncheck.edu` | `Password123!` | Browse directory, save bookmarks, report scams, track application pipeline |

---

## 🗄️ Relational Database Schema (PostgreSQL + Prisma)

The database includes 10 interconnected models:
1. `User`: Core accounts (`STUDENT`, `ALUMNI`, `ADMIN`).
2. `Internship`: Detailed opportunity specifications, risk score, verification status.
3. `SavedInternship`: Many-to-many junction between Users and Internships.
4. `RiskAssessment`: Computed 0-100 score, risk level, admin override logs.
5. `RiskFactor`: Individual heuristic score impacts and category breakdown.
6. `InternshipReport`: Student scam complaints with resolution notes and categories.
7. `StudentExperience`: Authentic interview and work feedback submitted by seniors.
8. `ExperienceHelpful`: Upvote junction for experience moderation.
9. `ApplicationTracking`: Student pipeline stages and notes.
10. `AdminAction`: Audit trail of administrative moderation actions.

---

## ⚙️ Local Setup and Execution

### 1. Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (Local or Cloud instance e.g. Neon/Supabase)

### 2. Clone and Install Dependencies
```bash
cd InternCheck
npm install
```

### 3. Environment Variables
Create a `.env` file in the project root:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/interncheck"
JWT_SECRET="interncheck_super_secret_jwt_key_btech_cse_2026"
NEXTAUTH_SECRET="interncheck_super_secret_jwt_key_btech_cse_2026"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="InternCheck"
```

### 4. Database Migration & Seeding
```bash
# Push Prisma schema to PostgreSQL
npm run db:push

# Seed with 1 Admin, 2 Alumni, 5 Students, 15 Internships, 10 Experiences, and Sample Reports
npm run db:seed
```

### 5. Run the Application
```bash
# Development mode
npm run dev

# Or build for production
npm run build
npm start
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🧪 Testing Results & Verification Checklist

- [x] **User Authentication**: Registration, bcrypt hashing, JWT cookie session, 1-click viva logins.
- [x] **Role-Based Authorization**: Protected student `/dashboard`, alumni `/senior`, and `/admin` routes.
- [x] **Internship CRUD & Filtering**: Search by keyword/skills, domain filter, work mode, stipend sorting, pagination.
- [x] **Risk Assessment Engine**: 10-parameter evaluation, normalized scoring, factors display, dynamic recalculation.
- [x] **Scam Reporting System**: Prevents duplicate reports from the same user, triggers risk score adjustment.
- [x] **Experience Repository**: Star ratings, interview questions, helpful votes, verified alumni badges.
- [x] **Application Tracker**: Status transitions (`INTERESTED`, `APPLIED`, `INTERVIEW`, `SELECTED`, etc.) with notes.
- [x] **Admin Governance**: Listing approval, risk overrides, scam report resolution, user role switching.
- [x] **Build Verification**: Production `next build` executed with zero errors.
