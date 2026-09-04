export interface AttemptItem {
  testId: string;
  testTitle?: string;
  userId: string;
  studentName?: string;
  userName?: string;
  studentEmail?: string;
  userEmail?: string;
  studentClass?: string;
  userClass?: string;
  studentPreparation?: string;
  userPreparation?: string;
  studentPhotoURL?: string;
  userPhotoURL?: string;
  score: number;
  totalMarks: number;
  percentage: number;
  correct?: number;
  correctCount?: number;
  wrong?: number;
  wrongCount?: number;
  unanswered?: number;
  unansweredCount?: number;
  accuracy: number;
  timeTaken?: number;
  timeTakenSeconds?: number;
  submittedAt: number;
  status?: string;
  questionBreakdown?: Array<any>;
}

export interface RankedAttemptItem extends AttemptItem {
  rank: number;
}

export interface LeaderboardStudent {
  userId: string;
  name: string;
  email: string;
  photoURL?: string;
  class: string;
  preparation: string;
  totalScore: number;
  testsAttempted: number;
  averageScore: number;
  averagePercentage: number;
  averageAccuracy: number;
  totalCorrect: number;
  totalWrong: number;
  totalUnanswered: number;
  totalTimeTaken: number;
  lastActiveAt: number;
  rank: number;
}

export interface StudentPerformanceSummary {
  totalTests: number;
  averageScore: number;
  bestScore: number;
  averagePercentage: number;
  averageAccuracy: number;
  totalCorrect: number;
  totalWrong: number;
  totalUnanswered: number;
  currentRank: number;
  totalCohortStudents: number;
  testHistory: Array<{
    testId: string;
    testTitle: string;
    date: number;
    score: number;
    totalMarks: number;
    percentage: number;
    rank: number;
    totalInCohort: number;
    accuracy: number;
    timeTaken: number;
  }>;
}

/**
 * Strict Tie-Breaking Comparator for Test Submissions:
 * 1. Higher score
 * 2. Higher accuracy
 * 3. Lower time taken
 * 4. Earlier submission timestamp
 */
export function compareAttempts(a: AttemptItem, b: AttemptItem): number {
  // 1. Higher score
  const scoreA = Number(a.score) || 0;
  const scoreB = Number(b.score) || 0;
  if (scoreB !== scoreA) {
    return scoreB - scoreA;
  }

  // 2. Higher accuracy
  const accA = Number(a.accuracy) || 0;
  const accB = Number(b.accuracy) || 0;
  if (accB !== accA) {
    return accB - accA;
  }

  // 3. Lower time taken
  const timeA = Number(a.timeTaken ?? a.timeTakenSeconds) || 0;
  const timeB = Number(b.timeTaken ?? b.timeTakenSeconds) || 0;
  if (timeA !== timeB) {
    return timeA - timeB;
  }

  // 4. Earlier submission
  const dateA = Number(a.submittedAt) || 0;
  const dateB = Number(b.submittedAt) || 0;
  return dateA - dateB;
}

/**
 * Calculate rank for a single test among students in the SAME cohort (Class + Prep).
 */
export function calculateTestRankings(
  allAttemptsForTest: AttemptItem[],
  targetClass: string,
  targetPreparation: string,
  targetUserId?: string
): {
  rankedList: RankedAttemptItem[];
  userRank: number;
  totalInCohort: number;
  topScore: number;
  avgScore: number;
} {
  // 1. Filter only same cohort (Class + Prep)
  const cohortAttempts = allAttemptsForTest.filter((item) => {
    const itemClass = item.studentClass || item.userClass || '';
    const itemPrep = item.studentPreparation || item.userPreparation || '';
    return itemClass === targetClass && itemPrep === targetPreparation;
  });

  // 2. Deduplicate by userId if multiple attempts are present (keep best attempt according to comparator)
  const userBestAttemptMap = new Map<string, AttemptItem>();
  cohortAttempts.forEach((att) => {
    const uid = att.userId;
    if (!uid) return;
    const existing = userBestAttemptMap.get(uid);
    if (!existing) {
      userBestAttemptMap.set(uid, att);
    } else if (compareAttempts(att, existing) < 0) {
      // att is better than existing
      userBestAttemptMap.set(uid, att);
    }
  });

  const uniqueCohortAttempts = Array.from(userBestAttemptMap.values());

  // 3. Sort strictly
  uniqueCohortAttempts.sort(compareAttempts);

  // 4. Assign ranks (1-based)
  const rankedList: RankedAttemptItem[] = uniqueCohortAttempts.map((item, index) => ({
    ...item,
    rank: index + 1
  }));

  let userRank = 0;
  if (targetUserId) {
    const found = rankedList.find((r) => r.userId === targetUserId);
    if (found) userRank = found.rank;
  }

  const topScore = rankedList.length > 0 ? (rankedList[0].score || 0) : 0;
  const totalScores = rankedList.reduce((acc, curr) => acc + (curr.score || 0), 0);
  const avgScore = rankedList.length > 0 ? Math.round((totalScores / rankedList.length) * 10) / 10 : 0;

  return {
    rankedList,
    userRank,
    totalInCohort: rankedList.length,
    topScore,
    avgScore
  };
}

/**
 * Calculate Leaderboard for a Cohort (Class 11 Board / Class 11 JEE / Class 12 Board / Class 12 JEE)
 */
export function calculateLeaderboard(
  allAttempts: AttemptItem[],
  targetClass: string,
  targetPreparation: string
): LeaderboardStudent[] {
  // 1. Filter by Cohort
  const cohortAttempts = allAttempts.filter((att) => {
    const itemClass = att.studentClass || att.userClass || '';
    const itemPrep = att.studentPreparation || att.userPreparation || '';
    return itemClass === targetClass && itemPrep === targetPreparation;
  });

  // 2. Group by student and distinct test
  const studentMap = new Map<
    string,
    {
      userId: string;
      name: string;
      email: string;
      photoURL?: string;
      class: string;
      preparation: string;
      testAttempts: Map<string, AttemptItem>;
    }
  >();

  cohortAttempts.forEach((att) => {
    const uid = att.userId;
    if (!uid) return;

    if (!studentMap.has(uid)) {
      studentMap.set(uid, {
        userId: uid,
        name: att.studentName || att.userName || 'Student',
        email: att.studentEmail || att.userEmail || '',
        photoURL: att.studentPhotoURL || att.userPhotoURL || '',
        class: targetClass,
        preparation: targetPreparation,
        testAttempts: new Map()
      });
    }

    const s = studentMap.get(uid)!;
    // For each test, keep the best attempt
    const existingTestAtt = s.testAttempts.get(att.testId);
    if (!existingTestAtt || compareAttempts(att, existingTestAtt) < 0) {
      s.testAttempts.set(att.testId, att);
    }
  });

  // 3. Aggregate metrics for each student
  const students: Array<Omit<LeaderboardStudent, 'rank'>> = Array.from(studentMap.values()).map((s) => {
    const attempts = Array.from(s.testAttempts.values());
    const testsCount = attempts.length;

    let totalScore = 0;
    let totalPercentage = 0;
    let totalAccuracy = 0;
    let totalCorrect = 0;
    let totalWrong = 0;
    let totalUnanswered = 0;
    let totalTimeTaken = 0;
    let lastActiveAt = 0;

    attempts.forEach((att) => {
      totalScore += Number(att.score) || 0;
      totalPercentage += Number(att.percentage) || 0;
      totalAccuracy += Number(att.accuracy) || 0;
      totalCorrect += Number(att.correct ?? att.correctCount) || 0;
      totalWrong += Number(att.wrong ?? att.wrongCount) || 0;
      totalUnanswered += Number(att.unanswered ?? att.unansweredCount) || 0;
      totalTimeTaken += Number(att.timeTaken ?? att.timeTakenSeconds) || 0;
      if (att.submittedAt && att.submittedAt > lastActiveAt) {
        lastActiveAt = att.submittedAt;
      }
    });

    const averageScore = testsCount > 0 ? Math.round((totalScore / testsCount) * 10) / 10 : 0;
    const averagePercentage = testsCount > 0 ? Math.round((totalPercentage / testsCount) * 10) / 10 : 0;
    const averageAccuracy = testsCount > 0 ? Math.round((totalAccuracy / testsCount) * 10) / 10 : 0;

    return {
      userId: s.userId,
      name: s.name,
      email: s.email,
      photoURL: s.photoURL,
      class: s.class,
      preparation: s.preparation,
      totalScore: Math.round(totalScore * 10) / 10,
      testsAttempted: testsCount,
      averageScore,
      averagePercentage,
      averageAccuracy,
      totalCorrect,
      totalWrong,
      totalUnanswered,
      totalTimeTaken,
      lastActiveAt
    };
  });

  // 4. Sort students strictly
  students.sort((a, b) => {
    // 1. Higher total score
    if (b.totalScore !== a.totalScore) {
      return b.totalScore - a.totalScore;
    }
    // 2. Higher average accuracy
    if (b.averageAccuracy !== a.averageAccuracy) {
      return b.averageAccuracy - a.averageAccuracy;
    }
    // 3. Lower total time taken
    if (a.totalTimeTaken !== b.totalTimeTaken) {
      return a.totalTimeTaken - b.totalTimeTaken;
    }
    // 4. Earlier last active / submission
    return a.lastActiveAt - b.lastActiveAt;
  });

  // 5. Assign rank
  return students.map((s, idx) => ({
    ...s,
    rank: idx + 1
  }));
}

/**
 * Calculate Student's Personal Performance Metrics & Historical Trend
 */
export function calculateStudentPerformance(
  allAttempts: AttemptItem[],
  userId: string,
  userClass: string,
  userPreparation: string
): StudentPerformanceSummary {
  // 1. Get user's own attempts
  const userAttempts = allAttempts.filter((att) => att.userId === userId);

  // Group by test (taking best attempt per test for metrics)
  const testMap = new Map<string, AttemptItem>();
  userAttempts.forEach((att) => {
    const existing = testMap.get(att.testId);
    if (!existing || compareAttempts(att, existing) < 0) {
      testMap.set(att.testId, att);
    }
  });

  const distinctAttempts = Array.from(testMap.values());
  const totalTests = distinctAttempts.length;

  let totalScore = 0;
  let bestScore = 0;
  let totalPercentage = 0;
  let totalAccuracy = 0;
  let totalCorrect = 0;
  let totalWrong = 0;
  let totalUnanswered = 0;

  distinctAttempts.forEach((att) => {
    const sc = Number(att.score) || 0;
    totalScore += sc;
    if (sc > bestScore) bestScore = sc;
    totalPercentage += Number(att.percentage) || 0;
    totalAccuracy += Number(att.accuracy) || 0;
    totalCorrect += Number(att.correct ?? att.correctCount) || 0;
    totalWrong += Number(att.wrong ?? att.wrongCount) || 0;
    totalUnanswered += Number(att.unanswered ?? att.unansweredCount) || 0;
  });

  const averageScore = totalTests > 0 ? Math.round((totalScore / totalTests) * 10) / 10 : 0;
  const averagePercentage = totalTests > 0 ? Math.round((totalPercentage / totalTests) * 10) / 10 : 0;
  const averageAccuracy = totalTests > 0 ? Math.round((totalAccuracy / totalTests) * 10) / 10 : 0;

  // 2. Calculate cohort rank
  const cohortLeaderboard = calculateLeaderboard(allAttempts, userClass, userPreparation);
  const foundStudent = cohortLeaderboard.find((s) => s.userId === userId);
  const currentRank = foundStudent ? foundStudent.rank : 0;

  // 3. Build test history with rank for each test in cohort
  const testHistory = distinctAttempts
    .sort((a, b) => (b.submittedAt || 0) - (a.submittedAt || 0))
    .map((att) => {
      // Find all attempts for this specific test
      const attemptsForThisTest = allAttempts.filter((a) => a.testId === att.testId);
      const testRankings = calculateTestRankings(
        attemptsForThisTest,
        userClass,
        userPreparation,
        userId
      );

      return {
        testId: att.testId,
        testTitle: att.testTitle || 'Mathematics Test',
        date: att.submittedAt || Date.now(),
        score: att.score,
        totalMarks: att.totalMarks,
        percentage: att.percentage,
        rank: testRankings.userRank || 1,
        totalInCohort: Math.max(1, testRankings.totalInCohort),
        accuracy: att.accuracy,
        timeTaken: Number(att.timeTaken ?? att.timeTakenSeconds) || 0
      };
    });

  return {
    totalTests,
    averageScore,
    bestScore,
    averagePercentage,
    averageAccuracy,
    totalCorrect,
    totalWrong,
    totalUnanswered,
    currentRank,
    totalCohortStudents: cohortLeaderboard.length,
    testHistory
  };
}
