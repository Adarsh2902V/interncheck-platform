export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { getExperiences } from '@/services/experienceService';
import { experienceSchema } from '@/lib/validations';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const user = await getCurrentUser();

    const data = await getExperiences({
      search: searchParams.get('search') || '',
      domain: searchParams.get('domain') || '',
      rating: searchParams.get('rating') || '',
      status: searchParams.get('status') || 'APPROVED',
      page: searchParams.get('page') || 1,
      limit: searchParams.get('limit') || 10,
      userId: user?.id,
      includeUnapproved: user?.role === 'ADMIN' && searchParams.get('all') === 'true',
    });

    return NextResponse.json({ success: true, ...data });
  } catch (error) {
    console.error('GET /api/experiences error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch experiences' },
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
    const validated = experienceSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { success: false, errors: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const isAlumni = user.role === 'ALUMNI' || user.role === 'ADMIN';

    const experience = await prisma.studentExperience.create({
      data: {
        ...validated.data,
        userId: user.id,
        isVerified: isAlumni, // Verified badge automatically if submitted by verified Alumni/Admin
        status: user.role === 'ADMIN' ? 'APPROVED' : 'PENDING',
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: user.role === 'ADMIN'
          ? 'Experience published directly'
          : 'Thank you! Your experience has been submitted for review.',
        experience,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/experiences error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to submit experience' },
      { status: 500 }
    );
  }
}
