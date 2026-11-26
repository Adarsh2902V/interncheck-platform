import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { experienceSchema } from '@/lib/validations';

export async function PUT(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const existing = await prisma.studentExperience.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ success: false, message: 'Experience not found' }, { status: 404 });
    }

    if (existing.userId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const validated = experienceSchema.partial().safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { success: false, errors: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const updated = await prisma.studentExperience.update({
      where: { id: params.id },
      data: validated.data,
    });

    return NextResponse.json({
      success: true,
      message: 'Experience updated successfully',
      experience: updated,
    });
  } catch (error) {
    console.error('PUT /api/experiences/[id] error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update experience' },
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

    const existing = await prisma.studentExperience.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    }

    if (existing.userId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    await prisma.studentExperience.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Experience deleted successfully',
    });
  } catch (error) {
    console.error('DELETE /api/experiences/[id] error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete experience' },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { status, isVerified } = body;

    const data = {};
    if (status) data.status = status;
    if (typeof isVerified === 'boolean') data.isVerified = isVerified;

    const updated = await prisma.studentExperience.update({
      where: { id: params.id },
      data,
    });

    await prisma.adminAction.create({
      data: {
        adminId: user.id,
        actionType: status === 'APPROVED' ? 'APPROVE_EXPERIENCE' : 'REJECT_EXPERIENCE',
        targetType: 'EXPERIENCE',
        targetId: params.id,
        details: `Updated experience status to ${status}, verified: ${isVerified}`,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Experience status updated',
      experience: updated,
    });
  } catch (error) {
    console.error('PATCH /api/experiences/[id] error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update experience moderation status' },
      { status: 500 }
    );
  }
}
