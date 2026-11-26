export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { recalculateRisk } from '@/services/internshipService';

export async function PATCH(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { status, resolutionNotes } = body;

    if (!['RESOLVED', 'REJECTED', 'PENDING'].includes(status)) {
      return NextResponse.json({ success: false, message: 'Invalid status' }, { status: 400 });
    }

    const report = await prisma.internshipReport.update({
      where: { id: params.id },
      data: {
        status,
        resolutionNotes: resolutionNotes || null,
      },
    });

    // Record admin action
    await prisma.adminAction.create({
      data: {
        adminId: user.id,
        actionType: status === 'RESOLVED' ? 'RESOLVE_REPORT' : 'REJECT_REPORT',
        targetType: 'REPORT',
        targetId: params.id,
        details: resolutionNotes,
      },
    });

    // Recalculate risk on report resolution
    await recalculateRisk(report.internshipId);

    return NextResponse.json({
      success: true,
      message: `Report marked as ${status.toLowerCase()}`,
      report,
    });
  } catch (error) {
    console.error('PATCH /api/reports/[id] error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update report' },
      { status: 500 }
    );
  }
}
