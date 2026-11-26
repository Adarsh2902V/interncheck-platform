export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { getInternshipById, recalculateRisk } from '@/services/internshipService';
import { internshipSchema } from '@/lib/validations';

export async function GET(request, { params }) {
  try {
    const user = await getCurrentUser();
    const internship = await getInternshipById(params.id, user?.id);

    if (!internship) {
      return NextResponse.json(
        { success: false, message: 'Internship listing not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, internship });
  } catch (error) {
    console.error('GET /api/internships/[id] error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch internship details' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const existing = await prisma.internship.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    }

    if (existing.postedById !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const validated = internshipSchema.partial().safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { success: false, errors: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const updated = await prisma.internship.update({
      where: { id: params.id },
      data: {
        ...validated.data,
        applicationDeadline: validated.data.applicationDeadline
          ? new Date(validated.data.applicationDeadline)
          : existing.applicationDeadline,
      },
    });

    // Recalculate risk score on detail change
    await recalculateRisk(params.id);

    const fullInternship = await getInternshipById(params.id, user.id);

    return NextResponse.json({
      success: true,
      message: 'Internship updated successfully',
      internship: fullInternship,
    });
  } catch (error) {
    console.error('PUT /api/internships/[id] error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update internship' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const existing = await prisma.internship.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    }

    if (existing.postedById !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    await prisma.internship.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Internship listing removed successfully',
    });
  } catch (error) {
    console.error('DELETE /api/internships/[id] error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete internship' },
      { status: 500 }
    );
  }
}
