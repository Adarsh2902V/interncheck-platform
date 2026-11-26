import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function DELETE(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    // Try deleting by saved record id or by internshipId
    const count = await prisma.savedInternship.deleteMany({
      where: {
        userId: user.id,
        OR: [{ id: params.id }, { internshipId: params.id }],
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Removed from saved internships',
      deletedCount: count.count,
    });
  } catch (error) {
    console.error('DELETE /api/saved/[id] error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to remove saved internship' },
      { status: 500 }
    );
  }
}
