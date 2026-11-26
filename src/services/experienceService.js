import prisma from '@/lib/prisma';

export async function getExperiences({
  search = '',
  domain = '',
  rating = '',
  status = 'APPROVED',
  page = 1,
  limit = 10,
  userId = null,
  includeUnapproved = false,
}) {
  const where = {};

  if (!includeUnapproved) {
    where.status = status;
  }

  if (search) {
    where.OR = [
      { companyName: { contains: search, mode: 'insensitive' } },
      { internshipRole: { contains: search, mode: 'insensitive' } },
      { workExperience: { contains: search, mode: 'insensitive' } },
      { adviceForJuniors: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (domain && domain !== 'ALL') {
    where.domain = { equals: domain, mode: 'insensitive' };
  }

  if (rating && rating !== 'ALL') {
    where.rating = Number(rating);
  }

  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  const [total, experiences] = await Promise.all([
    prisma.studentExperience.count({ where }),
    prisma.studentExperience.findMany({
      where,
      orderBy: [{ helpfulCount: 'desc' }, { createdAt: 'desc' }],
      skip,
      take,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            role: true,
            avatar: true,
            college: true,
            branch: true,
            graduationYear: true,
          },
        },
        helpfulVotes: userId ? { where: { userId } } : false,
      },
    }),
  ]);

  const items = experiences.map((exp) => ({
    ...exp,
    isHelpfulVoted: userId ? exp.helpfulVotes && exp.helpfulVotes.length > 0 : false,
  }));

  // Calculate company stats (top rated companies)
  const topCompanies = await prisma.studentExperience.groupBy({
    by: ['companyName'],
    where: { status: 'APPROVED' },
    _avg: { rating: true },
    _count: { id: true },
    orderBy: {
      _count: { id: 'desc' },
    },
    take: 6,
  });

  return {
    items,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / take) || 1,
    },
    topCompanies: topCompanies.map((c) => ({
      companyName: c.companyName,
      avgRating: Number(c._avg.rating?.toFixed(1) || 0),
      count: c._count.id,
    })),
  };
}

export async function toggleHelpfulVote(experienceId, userId) {
  const existing = await prisma.experienceHelpful.findUnique({
    where: {
      experienceId_userId: {
        experienceId,
        userId,
      },
    },
  });

  if (existing) {
    // Remove vote
    await prisma.experienceHelpful.delete({
      where: { id: existing.id },
    });
    const updated = await prisma.studentExperience.update({
      where: { id: experienceId },
      data: { helpfulCount: { decrement: 1 } },
    });
    return { voted: false, helpfulCount: updated.helpfulCount };
  } else {
    // Add vote
    await prisma.experienceHelpful.create({
      data: {
        experienceId,
        userId,
      },
    });
    const updated = await prisma.studentExperience.update({
      where: { id: experienceId },
      data: { helpfulCount: { increment: 1 } },
    });
    return { voted: true, helpfulCount: updated.helpfulCount };
  }
}
