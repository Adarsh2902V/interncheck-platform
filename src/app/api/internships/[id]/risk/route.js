export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { recalculateRisk } from '@/services/internshipService';

export async function GET(request, { params }) {
  try {
    const assessment = await prisma.riskAssessment.findUnique({
      where: { internshipId: params.id },
      include: {
        factors: {
          orderBy: { scoreImpact: 'desc' },
        },
        internship: {
          select: {
            id: true,
            title: true,
            companyName: true,
            riskScore: true,
            riskLevel: true,
            verificationStatus: true,
            _count: {
              select: { reports: true },
            },
          },
        },
      },
    });

    if (!assessment) {
      // If assessment doesn't exist yet, compute it now
      const result = await recalculateRisk(params.id);
      if (!result) {
        return NextResponse.json({ success: false, message: 'Internship not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, assessment: result.assessment });
    }

    const positiveSignals = assessment.factors.filter((f) => f.isPositive);
    const riskFactors = assessment.factors.filter((f) => !f.isPositive);

    return NextResponse.json({
      success: true,
      assessment: {
        ...assessment,
        positiveSignals,
        riskFactors,
        disclaimer: 'Automated risk assessment is an initial screening tool, not a guarantee of legitimacy. Always verify directly with official channels before sharing confidential information.',
      },
    });
  } catch (error) {
    console.error('GET /api/internships/[id]/risk error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch risk assessment' },
      { status: 500 }
    );
  }
}
