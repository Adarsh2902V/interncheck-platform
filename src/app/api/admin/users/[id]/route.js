import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function PATCH(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { role } = body;

    if (!['STUDENT', 'ALUMNI', 'ADMIN'].includes(role)) {
      return NextResponse.json({ success: false, message: 'Invalid role' }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: params.id },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    await prisma.adminAction.create({
      data: {
        adminId: user.id,
        actionType: 'USER_ROLE_CHANGE',
        targetType: 'USER',
        targetId: params.id,
        details: `Updated role of ${updated.email} to ${role}`,
      },
    });

    return NextResponse.json({
      success: true,
      message: `User role updated to ${role}`,
      user: updated,
    });
  } catch (error) {
    console.error('PATCH /api/admin/users/[id] error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update user role' },
      { status: 500 }
    );
  }
}
