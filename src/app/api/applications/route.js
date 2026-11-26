import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { applicationTrackingSchema } from '@/lib/validations';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where = { userId: user.id };
    if (status && status !== 'ALL') {
      where.status = status;
    }

    const applications = await prisma.applicationTracking.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: {
        internship: {
          include: {
            riskAssessment: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, applications });
  } catch (error) {
    console.error('GET /api/applications error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch tracked applications' },
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
    const validated = applicationTrackingSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { success: false, errors: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { internshipId, status, notes } = validated.data;

    const application = await prisma.applicationTracking.upsert({
      where: {
        userId_internshipId: {
          userId: user.id,
          internshipId,
        },
      },
      update: {
        status,
        notes: notes || undefined,
        updatedAt: new Date(),
      },
      create: {
        userId: user.id,
        internshipId,
        status,
        notes: notes || null,
      },
      include: {
        internship: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Internship added to your application tracker',
        application,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/applications error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to track application' },
      { status: 500 }
    );
  }
}
