export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getInternships, createInternship } from '@/services/internshipService';
import { internshipSchema } from '@/lib/validations';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const user = await getCurrentUser();

    const data = await getInternships({
      search: searchParams.get('search') || '',
      domain: searchParams.get('domain') || '',
      location: searchParams.get('location') || '',
      workMode: searchParams.get('workMode') || '',
      isPaid: searchParams.get('isPaid') || '',
      riskLevel: searchParams.get('riskLevel') || '',
      verificationStatus: searchParams.get('verificationStatus') || 'APPROVED',
      sortBy: searchParams.get('sortBy') || 'latest',
      page: searchParams.get('page') || 1,
      limit: searchParams.get('limit') || 9,
      userId: user?.id,
      includeUnapproved: user?.role === 'ADMIN' && searchParams.get('all') === 'true',
    });

    return NextResponse.json({ success: true, ...data });
  } catch (error) {
    console.error('GET /api/internships error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch internships' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validated = internshipSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { success: false, errors: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const payload = {
      ...validated.data,
      applicationDeadline: validated.data.applicationDeadline
        ? new Date(validated.data.applicationDeadline)
        : null,
    };

    const created = await createInternship(payload, user);

    return NextResponse.json(
      {
        success: true,
        message: user.role === 'ADMIN' 
          ? 'Internship published successfully' 
          : 'Internship submitted for admin review and risk assessment',
        internship: created,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/internships error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create internship' },
      { status: 500 }
    );
  }
}
