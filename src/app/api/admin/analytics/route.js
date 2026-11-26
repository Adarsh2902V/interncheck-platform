import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const [
      totalUsers,
      totalInternships,
      pendingInternships,
      approvedInternships,
      rejectedInternships,
      highRiskInternships,
      mediumRiskInternships,
      lowRiskInternships,
      totalReports,
      pendingReports,
      pendingExperiences,
      approvedExperiences,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.internship.count(),
      prisma.internship.count({ where: { verificationStatus: 'PENDING' } }),
      prisma.internship.count({ where: { verificationStatus: 'APPROVED' } }),
      prisma.internship.count({ where: { verificationStatus: 'REJECTED' } }),
      prisma.internship.count({ where: { riskLevel: 'HIGH' } }),
      prisma.internship.count({ where: { riskLevel: 'MEDIUM' } }),
      prisma.internship.count({ where: { riskLevel: 'LOW' } }),
      prisma.internshipReport.count(),
      prisma.internshipReport.count({ where: { status: 'PENDING' } }),
      prisma.studentExperience.count({ where: { status: 'PENDING' } }),
      prisma.studentExperience.count({ where: { status: 'APPROVED' } }),
    ]);

    // Risk distribution for Recharts
    const riskDistribution = [
      { name: 'Low Risk', count: lowRiskInternships, color: '#10b981' },
      { name: 'Medium Risk', count: mediumRiskInternships, color: '#f59e0b' },
      { name: 'High Risk / Scam', count: highRiskInternships, color: '#ef4444' },
    ];

    // Domain distribution for Recharts
    const domainCounts = await prisma.internship.groupBy({
      by: ['domain'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 6,
    });

    const domainDistribution = domainCounts.map((d) => ({
      domain: d.domain,
      count: d._count.id,
    }));

    // Reports category distribution
    const reportCategories = await prisma.internshipReport.groupBy({
      by: ['category'],
      _count: { id: true },
    });

    const recentReports = await prisma.internshipReport.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        internship: {
          select: { title: true, companyName: true, riskScore: true },
        },
        user: {
          select: { name: true, email: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        totalInternships,
        pendingInternships,
        approvedInternships,
        rejectedInternships,
        highRiskInternships,
        mediumRiskInternships,
        lowRiskInternships,
        totalReports,
        pendingReports,
        pendingExperiences,
        approvedExperiences,
      },
      charts: {
        riskDistribution,
        domainDistribution,
        reportCategories: reportCategories.map((r) => ({
          category: r.category.replace('_', ' '),
          count: r._count.id,
        })),
      },
      recentReports,
    });
  } catch (error) {
    console.error('GET /api/admin/analytics error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch admin analytics' },
      { status: 500 }
    );
  }
}
