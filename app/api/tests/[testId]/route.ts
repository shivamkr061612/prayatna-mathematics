import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/lib/firebase';
import { ref, get } from 'firebase/database';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ testId: string }> }
) {
  try {
    const { testId } = await context.params;
    if (!testId) {
      return NextResponse.json({ error: 'Missing testId parameter' }, { status: 400 });
    }

    const testRef = ref(database, `tests/${testId}`);
    const snapshot = await get(testRef);

    if (!snapshot.exists()) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 });
    }

    const rawTest = snapshot.val();

    // Sanitize questions: strip `correctAnswer` before sending to the taking client!
    const questionsObj = rawTest.questions || {};
    const sanitizedQuestions = Object.keys(questionsObj).map((qId, index) => {
      const q = questionsObj[qId];
      return {
        id: qId,
        questionIndex: index + 1,
        questionText: q.questionText || '',
        imageUrl: q.imageUrl || '',
        options: {
          A: q.options?.A || '',
          B: q.options?.B || '',
          C: q.options?.C || '',
          D: q.options?.D || ''
        },
        marks: Number(q.marks || rawTest.marksPerQuestion || 4),
        negativeMarks: Number(q.negativeMarks !== undefined ? q.negativeMarks : (rawTest.negativeMark || 0))
      };
    });

    const sanitizedTest = {
      id: testId,
      title: rawTest.title || 'Untitled Test',
      description: rawTest.description || '',
      class: rawTest.class || 'Class 11',
      preparation: rawTest.preparation || 'Board',
      duration: Number(rawTest.duration || 60),
      totalMarks: Number(rawTest.totalMarks || (sanitizedQuestions.length * (rawTest.marksPerQuestion || 4))),
      marksPerQuestion: Number(rawTest.marksPerQuestion || 4),
      negativeMark: Number(rawTest.negativeMark || 0),
      startTime: rawTest.startTime || null,
      endTime: rawTest.endTime || null,
      active: rawTest.active !== false,
      allowMultipleAttempts: Boolean(rawTest.allowMultipleAttempts),
      questionsCount: sanitizedQuestions.length,
      questions: sanitizedQuestions
    };

    return NextResponse.json({ test: sanitizedTest });
  } catch (error: any) {
    console.error('Error fetching test in API route:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch test' }, { status: 500 });
  }
}
