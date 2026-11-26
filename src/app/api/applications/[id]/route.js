export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function PUT(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const existing = await prisma.applicationTracking.findUnique({
      where: { id: params.id },
    });

    if (!existing || existing.userId !== user.id) {
      return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    }

    const body = await request.json();
    const { status, notes } = body;

    const updated = await prisma.applicationTracking.update({
      where: { id: params.id },
      data: {
        status: status || existing.status,
        notes: notes !== undefined ? notes : existing.notes,
      },
      include: {
        internship: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Application status updated',
      application: updated,
    });
  } catch (error) {
    console.error('PUT /api/applications/[id] error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update application' },
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

    const existing = await prisma.applicationTracking.findUnique({
      where: { id: params.id },
    });

    if (!existing || existing.userId !== user.id) {
      return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    }

    await prisma.applicationTracking.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Application removed from tracker',
    });
  } catch (error) {
    console.error('DELETE /api/applications/[id] error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to remove application' },
      { status: 500 }
    );
  }
}
