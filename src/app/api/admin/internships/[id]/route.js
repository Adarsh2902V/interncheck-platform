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
    const { verificationStatus, adminNotes } = body;

    if (!['APPROVED', 'REJECTED', 'PENDING'].includes(verificationStatus)) {
      return NextResponse.json({ success: false, message: 'Invalid verification status' }, { status: 400 });
    }

    const updated = await prisma.internship.update({
      where: { id: params.id },
      data: {
        verificationStatus,
        adminNotes: adminNotes || undefined,
      },
    });

    // Record admin audit log
    await prisma.adminAction.create({
      data: {
        adminId: user.id,
        actionType: verificationStatus === 'APPROVED' ? 'APPROVE_INTERNSHIP' : 'REJECT_INTERNSHIP',
        targetType: 'INTERNSHIP',
        targetId: params.id,
        details: adminNotes || `Set status to ${verificationStatus}`,
      },
    });

    // Recalculate risk assessment based on new verification status
    await recalculateRisk(params.id);

    return NextResponse.json({
      success: true,
      message: `Internship status updated to ${verificationStatus}`,
      internship: updated,
    });
  } catch (error) {
    console.error('PATCH /api/admin/internships/[id] error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update internship status' },
      { status: 500 }
    );
  }
}
