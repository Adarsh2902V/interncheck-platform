import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where = {};
    if (status && status !== 'ALL') {
      where.status = status;
    }

    const reports = await prisma.internshipReport.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        internship: {
          include: {
            riskAssessment: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            college: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, reports });
  } catch (error) {
    console.error('GET /api/admin/reports error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch admin reports' },
      { status: 500 }
    );
  }
}
