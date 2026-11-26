import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const saved = await prisma.savedInternship.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        internship: {
          include: {
            riskAssessment: true,
            _count: {
              select: { reports: true, savedBy: true },
            },
          },
        },
      },
    });

    const items = saved.map((s) => ({
      ...s.internship,
      savedAt: s.createdAt,
      savedId: s.id,
      isSaved: true,
      reportCount: s.internship._count.reports,
    }));

    return NextResponse.json({ success: true, saved: items });
  } catch (error) {
    console.error('GET /api/saved error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch saved internships' },
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
    const { internshipId } = body;

    if (!internshipId) {
      return NextResponse.json({ success: false, message: 'Internship ID required' }, { status: 400 });
    }

    const existing = await prisma.savedInternship.findUnique({
      where: {
        userId_internshipId: {
          userId: user.id,
          internshipId,
        },
      },
    });

    if (existing) {
      // Toggle off: remove
      await prisma.savedInternship.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({ success: true, saved: false, message: 'Removed from bookmarks' });
    } else {
      // Toggle on: add
      await prisma.savedInternship.create({
        data: {
          userId: user.id,
          internshipId,
        },
      });
      return NextResponse.json({ success: true, saved: true, message: 'Saved to bookmarks' });
    }
  } catch (error) {
    console.error('POST /api/saved error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to toggle bookmark' },
      { status: 500 }
    );
  }
}
