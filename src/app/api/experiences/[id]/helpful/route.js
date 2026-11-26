import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { toggleHelpfulVote } from '@/services/experienceService';

export async function POST(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, message: 'Please login to vote' }, { status: 401 });
    }

    const result = await toggleHelpfulVote(params.id, user.id);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('POST /api/experiences/[id]/helpful error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to record vote' },
      { status: 500 }
    );
  }
}
