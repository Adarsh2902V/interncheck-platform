import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { overrideRiskAssessment, recalculateRisk } from '@/services/internshipService';

export async function POST(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, message: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { action, score, level, reason } = body;

    if (action === 'RECALCULATE') {
      const result = await recalculateRisk(params.id);
      return NextResponse.json({
        success: true,
        message: 'Risk assessment recalculated successfully using current listing data and reports',
        result,
      });
    }

    if (action === 'OVERRIDE') {
      if (score === undefined || !level || !reason) {
        return NextResponse.json(
          { success: false, message: 'Score, level, and override reason are required' },
          { status: 400 }
        );
      }

      const overridden = await overrideRiskAssessment(params.id, user, { score, level, reason });
      return NextResponse.json({
        success: true,
        message: 'Risk assessment overridden by administrator',
        assessment: overridden,
      });
    }

    return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('POST /api/internships/[id]/verify error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to process verification action' },
      { status: 500 }
    );
  }
}
