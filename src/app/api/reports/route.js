import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { reportSchema } from '@/lib/validations';
import { recalculateRisk } from '@/services/internshipService';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const where = {};

    // If not admin, only see user's own reports
    if (user.role !== 'ADMIN') {
      where.userId = user.id;
    } else if (searchParams.get('status')) {
      where.status = searchParams.get('status');
    }

    const reports = await prisma.internshipReport.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        internship: {
          select: {
            id: true,
            title: true,
            companyName: true,
            riskScore: true,
            riskLevel: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, reports });
  } catch (error) {
    console.error('GET /api/reports error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch reports' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = reportSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { success: false, errors: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { internshipId, category, description, evidenceUrl } = validated.data;

    // Check if internship exists
    const internship = await prisma.internship.findUnique({
      where: { id: internshipId },
    });
    if (!internship) {
      return NextResponse.json({ success: false, message: 'Internship not found' }, { status: 404 });
    }

    // Check duplicate report
    const existingReport = await prisma.internshipReport.findUnique({
      where: {
        internshipId_userId: {
          internshipId,
          userId: user.id,
        },
      },
    });

    if (existingReport) {
      return NextResponse.json(
        { success: false, message: 'You have already filed a report for this internship listing' },
        { status: 409 }
      );
    }

    const report = await prisma.internshipReport.create({
      data: {
        internshipId,
        userId: user.id,
        category,
        description,
        evidenceUrl: evidenceUrl || null,
        status: 'PENDING',
      },
    });

    // Automatically trigger risk recalculation now that a new student report has been filed!
    await recalculateRisk(internshipId);

    return NextResponse.json(
      {
        success: true,
        message: 'Report submitted successfully. Our safety moderators have been alerted and risk score has been adjusted.',
        report,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/reports error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to submit report' },
      { status: 500 }
    );
  }
}
