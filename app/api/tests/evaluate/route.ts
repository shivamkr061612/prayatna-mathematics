import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/lib/firebase';
import { ref, get, set } from 'firebase/database';
import { recordMeaningfulActivity } from '@/lib/gamification';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      testId, 
      userId, 
      answers = {}, 
      timeTaken = 0,
      studentName = '',
      studentEmail = '',
      studentClass = '',
      studentPreparation = '',
      studentPhotoURL = ''
    } = body;

    if (!testId || !userId) {
      return NextResponse.json({ error: 'testId and userId are required' }, { status: 400 });
    }

    // 1. Fetch test from authoritative database
    const testRef = ref(database, `tests/${testId}`);
    const testSnap = await get(testRef);

    if (!testSnap.exists()) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 });
    }

    const testData = testSnap.val();

    // 2. Prevent duplicate submissions unless allowMultipleAttempts is true
    const attemptRef = ref(database, `testAttempts/${testId}/${userId}`);
    const existingAttemptSnap = await get(attemptRef);

    if (existingAttemptSnap.exists() && !testData.allowMultipleAttempts) {
      const existingAttempt = existingAttemptSnap.val();
      return NextResponse.json({ 
        alreadySubmitted: true, 
        message: 'You have already submitted this test. One official attempt is permitted.',
        attempt: existingAttempt 
      });
    }

    // 3. Fetch questions with authoritative correct answers
    const questionsObj = testData.questions || {};
    const questionIds = Object.keys(questionsObj);

    let calculatedScore = 0;
    let totalPossibleMarks = 0;
    let correctCount = 0;
    let wrongCount = 0;
    let unansweredCount = 0;

    const questionBreakdown: Array<{
      questionId: string;
      questionText: string;
      imageUrl?: string;
      options: { A: string; B: string; C: string; D: string };
      userAnswer: string | null;
      correctAnswer: string;
      isCorrect: boolean;
      marksAwarded: number;
    }> = [];

    questionIds.forEach((qId) => {
      const q = questionsObj[qId];
      const qMarks = Number(q.marks || testData.marksPerQuestion || 4);
      const qNegative = Number(q.negativeMarks !== undefined ? q.negativeMarks : (testData.negativeMark || 0));
      totalPossibleMarks += qMarks;

      const userAnswer = answers[qId] || null;
      const correctAnswer = q.correctAnswer;

      if (userAnswer) {
        if (userAnswer.toUpperCase() === (correctAnswer || '').toUpperCase()) {
          correctCount++;
          calculatedScore += qMarks;
          questionBreakdown.push({
            questionId: qId,
            questionText: q.questionText || '',
            imageUrl: q.imageUrl || '',
            options: q.options || { A: '', B: '', C: '', D: '' },
            userAnswer,
            correctAnswer,
            isCorrect: true,
            marksAwarded: qMarks
          });
        } else {
          wrongCount++;
          calculatedScore -= qNegative;
          questionBreakdown.push({
            questionId: qId,
            questionText: q.questionText || '',
            imageUrl: q.imageUrl || '',
            options: q.options || { A: '', B: '', C: '', D: '' },
            userAnswer,
            correctAnswer,
            isCorrect: false,
            marksAwarded: -qNegative
          });
        }
      } else {
        unansweredCount++;
        questionBreakdown.push({
          questionId: qId,
          questionText: q.questionText || '',
          imageUrl: q.imageUrl || '',
          options: q.options || { A: '', B: '', C: '', D: '' },
          userAnswer: null,
          correctAnswer,
          isCorrect: false,
          marksAwarded: 0
        });
      }
    });

    if (totalPossibleMarks === 0) {
      totalPossibleMarks = Number(testData.totalMarks || 100);
    }

    const percentage = totalPossibleMarks > 0 
      ? Math.round((Math.max(0, calculatedScore) / totalPossibleMarks) * 1000) / 10 
      : 0;

    const attemptedTotal = correctCount + wrongCount;
    const accuracy = attemptedTotal > 0 
      ? Math.round((correctCount / attemptedTotal) * 1000) / 10 
      : 0;

    // 4. Build trusted Attempt record
    const attemptRecord = {
      testId,
      testTitle: testData.title || 'Untitled Test',
      userId,
      studentName: studentName || 'Student',
      studentEmail: studentEmail || '',
      studentClass: studentClass || testData.class || 'Class 11',
      studentPreparation: studentPreparation || testData.preparation || 'Board',
      studentPhotoURL: studentPhotoURL || '',
      userName: studentName || 'Student',
      userEmail: studentEmail || '',
      userClass: studentClass || testData.class || 'Class 11',
      userPreparation: studentPreparation || testData.preparation || 'Board',
      userPhotoURL: studentPhotoURL || '',
      answers,
      score: Math.round(calculatedScore * 100) / 100,
      totalMarks: totalPossibleMarks,
      percentage,
      correct: correctCount,
      correctCount,
      wrong: wrongCount,
      wrongCount,
      unanswered: unansweredCount,
      unansweredCount,
      accuracy,
      timeTaken: Math.max(1, Math.round(timeTaken)),
      timeTakenSeconds: Math.max(1, Math.round(timeTaken)),
      submittedAt: Date.now(),
      status: 'Completed',
      questionBreakdown
    };

    // 5. Persist to Firebase Realtime Database
    await set(attemptRef, attemptRecord);

    // 6. Award Gamification: Streak, XP & Achievements
    let gamificationResult = null;
    try {
      // Check total attempts for this user across all tests
      const allAttemptsRef = ref(database, 'testAttempts');
      const allAttemptsSnap = await get(allAttemptsRef);
      let userAttemptCount = 1;
      if (allAttemptsSnap.exists()) {
        const testsData = allAttemptsSnap.val() || {};
        let count = 0;
        Object.keys(testsData).forEach((tId) => {
          if (testsData[tId]?.[userId]) count++;
        });
        userAttemptCount = Math.max(1, count);
      }

      gamificationResult = await recordMeaningfulActivity({
        userId,
        activityType: 'test_attempt',
        metadata: {
          testId,
          score: attemptRecord.score,
          totalMarks: attemptRecord.totalMarks,
          percentage: attemptRecord.percentage,
          totalTestsCompleted: userAttemptCount
        }
      });
    } catch (gamifyError) {
      console.error('Error awarding gamification for test:', gamifyError);
    }

    return NextResponse.json({
      success: true,
      attempt: attemptRecord,
      gamification: gamificationResult
    });
  } catch (error: any) {
    console.error('Error evaluating test in API route:', error);
    return NextResponse.json({ error: error.message || 'Evaluation failed' }, { status: 500 });
  }
}
