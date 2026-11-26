import prisma from '@/lib/prisma';
import { evaluateInternshipRisk } from './riskAssessmentService';

export async function getInternships({
  search = '',
  domain = '',
  location = '',
  workMode = '',
  isPaid = '',
  riskLevel = '',
  verificationStatus = 'APPROVED',
  sortBy = 'latest',
  page = 1,
  limit = 9,
  userId = null,
  includeUnapproved = false,
}) {
  const where = {};

  if (!includeUnapproved) {
    where.verificationStatus = verificationStatus;
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { companyName: { contains: search, mode: 'insensitive' } },
      { requiredSkills: { contains: search, mode: 'insensitive' } },
      { domain: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (domain && domain !== 'ALL') {
    where.domain = { equals: domain, mode: 'insensitive' };
  }

  if (location && location !== 'ALL') {
    where.location = { contains: location, mode: 'insensitive' };
  }

  if (workMode && workMode !== 'ALL') {
    where.workMode = workMode;
  }

  if (isPaid !== '' && isPaid !== 'ALL') {
    where.isPaid = isPaid === 'true' || isPaid === true;
  }

  if (riskLevel && riskLevel !== 'ALL') {
    where.riskLevel = riskLevel;
  }

  const orderBy = [];
  if (sortBy === 'stipend') {
    orderBy.push({ stipendAmount: 'desc' });
  } else if (sortBy === 'riskAsc') {
    orderBy.push({ riskScore: 'asc' });
  } else if (sortBy === 'riskDesc') {
    orderBy.push({ riskScore: 'desc' });
  } else {
    orderBy.push({ createdAt: 'desc' });
  }

  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  const [total, internships] = await Promise.all([
    prisma.internship.count({ where }),
    prisma.internship.findMany({
      where,
      orderBy,
      skip,
      take,
      include: {
        riskAssessment: {
          include: {
            factors: true,
          },
        },
        _count: {
          select: {
            reports: true,
            savedBy: true,
            applications: true,
          },
        },
        savedBy: userId ? { where: { userId } } : false,
      },
    }),
  ]);

  const items = internships.map((item) => ({
    ...item,
    isSaved: userId ? item.savedBy && item.savedBy.length > 0 : false,
    reportCount: item._count.reports,
    savedCount: item._count.savedBy,
    applicationCount: item._count.applications,
  }));

  return {
    items,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / take) || 1,
    },
  };
}

export async function getInternshipById(id, userId = null) {
  const internship = await prisma.internship.findUnique({
    where: { id },
    include: {
      postedBy: {
        select: {
          id: true,
          name: true,
          role: true,
          avatar: true,
          college: true,
        },
      },
      riskAssessment: {
        include: {
          factors: {
            orderBy: { scoreImpact: 'desc' },
          },
        },
      },
      reports: {
        where: { status: 'RESOLVED' },
        select: {
          id: true,
          category: true,
          description: true,
          createdAt: true,
        },
      },
      _count: {
        select: {
          reports: true,
          savedBy: true,
          applications: true,
        },
      },
      savedBy: userId ? { where: { userId } } : false,
      applications: userId ? { where: { userId } } : false,
    },
  });

  if (!internship) return null;

  // Fetch experiences from same company if any
  const relatedExperiences = await prisma.studentExperience.findMany({
    where: {
      companyName: { equals: internship.companyName, mode: 'insensitive' },
      status: 'APPROVED',
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          role: true,
          avatar: true,
          college: true,
        },
      },
    },
    take: 5,
  });

  const factors = internship.riskAssessment?.factors || [];
  const positiveSignals = factors.filter((f) => f.isPositive);
  const riskFactors = factors.filter((f) => !f.isPositive);

  return {
    ...internship,
    isSaved: userId ? (internship.savedBy?.length || 0) > 0 : false,
    userApplication: userId && internship.applications?.length > 0 ? internship.applications[0] : null,
    reportCount: internship._count.reports,
    positiveSignals,
    riskFactors,
    relatedExperiences,
  };
}

export async function createInternship(data, user) {
  const isAutoApproved = user.role === 'ADMIN';

  const internship = await prisma.internship.create({
    data: {
      ...data,
      verificationStatus: isAutoApproved ? 'APPROVED' : 'PENDING',
      postedById: user.id,
    },
  });

  // Calculate rule-based risk assessment
  const evaluation = evaluateInternshipRisk(internship, 0);

  // Update internship risk fields
  await prisma.internship.update({
    where: { id: internship.id },
    data: {
      riskScore: evaluation.score,
      riskLevel: evaluation.level,
    },
  });

  // Save assessment and factors
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

  return getInternshipById(internship.id, user.id);
}

export async function recalculateRisk(internshipId) {
  const internship = await prisma.internship.findUnique({
    where: { id: internshipId },
  });
  if (!internship) return null;

  const reportCount = await prisma.internshipReport.count({
    where: { internshipId, status: { in: ['PENDING', 'RESOLVED'] } },
  });

  const evaluation = evaluateInternshipRisk(internship, reportCount);

  await prisma.internship.update({
    where: { id: internshipId },
    data: {
      riskScore: evaluation.score,
      riskLevel: evaluation.level,
    },
  });

  let assessment = await prisma.riskAssessment.findUnique({
    where: { internshipId },
  });

  if (assessment) {
    // Delete old factors and recreate
    await prisma.riskFactor.deleteMany({
      where: { riskAssessmentId: assessment.id },
    });

    assessment = await prisma.riskAssessment.update({
      where: { id: assessment.id },
      data: {
        score: evaluation.score,
        level: evaluation.level,
        isOverridden: false,
        assessedAt: new Date(),
      },
    });
  } else {
    assessment = await prisma.riskAssessment.create({
      data: {
        internshipId,
        score: evaluation.score,
        level: evaluation.level,
        assessedAt: new Date(),
      },
    });
  }

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

  return { evaluation, assessment };
}

export async function overrideRiskAssessment(internshipId, adminUser, { score, level, reason }) {
  const assessment = await prisma.riskAssessment.upsert({
    where: { internshipId },
    update: {
      score: Number(score),
      level,
      isOverridden: true,
      overriddenBy: adminUser.name || adminUser.email,
      overrideReason: reason,
      assessedAt: new Date(),
    },
    create: {
      internshipId,
      score: Number(score),
      level,
      isOverridden: true,
      overriddenBy: adminUser.name || adminUser.email,
      overrideReason: reason,
      assessedAt: new Date(),
    },
  });

  await prisma.internship.update({
    where: { id: internshipId },
    data: {
      riskScore: Number(score),
      riskLevel: level,
      adminNotes: `Risk overridden by Admin: ${reason}`,
    },
  });

  await prisma.adminAction.create({
    data: {
      adminId: adminUser.id,
      actionType: 'OVERRIDE_RISK',
      targetType: 'INTERNSHIP',
      targetId: internshipId,
      details: `Overrode risk to ${score} (${level}). Reason: ${reason}`,
    },
  });

  return assessment;
}
