import { NextRequest, NextResponse } from 'next/server';
import { recordMeaningfulActivity } from '@/lib/gamification';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, activityType, metadata = {} } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const validActivities = ['test_attempt', 'homework_completed', 'attendance_present'];
    if (!activityType || !validActivities.includes(activityType)) {
      return NextResponse.json({ error: 'Valid activityType is required' }, { status: 400 });
    }

    const result = await recordMeaningfulActivity({
      userId,
      activityType,
      metadata
    });

    return NextResponse.json({
      success: true,
      ...result
    });
  } catch (error: any) {
    console.error('Error in gamification activity route:', error);
    return NextResponse.json({ error: error.message || 'Failed to record activity' }, { status: 500 });
  }
}
