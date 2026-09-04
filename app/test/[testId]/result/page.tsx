'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { database, TestAttemptData } from '@/lib/firebase';
import { ref, get, onValue } from 'firebase/database';
import { calculateTestRankings, AttemptItem } from '@/lib/rankings';
import {
  Trophy,
  Award,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  BarChart2,
  ArrowLeft,
  Check,
  X,
  Share2,
  Maximize2,
  ShieldCheck,
  Flame,
  FileCheck2,
  History,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';

export default function TestResultPage() {
  const params = useParams();
  const router = useRouter();
  const testId = params?.testId as string;
  const { user, userData, openAuthModal } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState<TestAttemptData | null>(null);
  const [testTitle, setTestTitle] = useState<string>('Mathematics Assessment');
  const [testClass, setTestClass] = useState<string>('Class 11');
  const [testPrep, setTestPrep] = useState<string>('Board');
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Cohort rank state
  const [cohortRankInfo, setCohortRankInfo] = useState<{
    userRank: number;
    totalInCohort: number;
    topScore: number;
    avgScore: number;
  } | null>(null);

  // 1. Fetch user's attempt for this test
  useEffect(() => {
    if (!testId) return;

    if (!user) {
      const timer = setTimeout(() => setLoading(false), 0);
      return () => clearTimeout(timer);
    }

    let isMounted = true;

    async function loadAttempt() {
      try {
        setError(null);

        // Fetch user attempt
        const attemptRef = ref(database, `testAttempts/${testId}/${user!.uid}`);
        const attemptSnap = await get(attemptRef);

        if (!attemptSnap.exists()) {
          // No attempt found, redirect to test page or show notice
          if (isMounted) {
            setError('No submission found for this test. Please take the test first.');
            setLoading(false);
          }
          return;
        }

        const attemptData = attemptSnap.val() as TestAttemptData;
        if (isMounted) {
          setAttempt(attemptData);
          setTestTitle(attemptData.testTitle || 'Mathematics Assessment');
          const studentClass = attemptData.studentClass || attemptData.userClass || userData?.class || 'Class 11';
          const studentPrep = attemptData.studentPreparation || attemptData.userPreparation || userData?.preparation || 'Board';
          setTestClass(studentClass);
          setTestPrep(studentPrep);
        }

        // Also fetch all attempts for this test to compute live cohort ranking
        const allAttemptsRef = ref(database, `testAttempts/${testId}`);
        onValue(allAttemptsRef, (snapshot) => {
          if (!isMounted) return;
          if (snapshot.exists()) {
            const data = snapshot.val();
            const list: AttemptItem[] = Object.values(data);
            const studentClass = attemptData.studentClass || attemptData.userClass || userData?.class || 'Class 11';
            const studentPrep = attemptData.studentPreparation || attemptData.userPreparation || userData?.preparation || 'Board';
            const rankings = calculateTestRankings(list, studentClass, studentPrep, user!.uid);
            setCohortRankInfo(rankings);
          }
        });
      } catch (err: any) {
        console.error('Error loading result attempt:', err);
        if (isMounted) {
          setError(err.message || 'Failed to load test report');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadAttempt();

    return () => {
      isMounted = false;
    };
  }, [testId, user, userData]);

  const formatDurationDisplay = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    if (mins === 0) return `${secs}s`;
    if (secs === 0) return `${mins}m`;
    return `${mins}m ${secs}s`;
  };

  // Auth gate
  if (!user && !loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-200/80 p-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Student Authentication Required</h3>
          <p className="text-sm text-slate-600 mb-6">
            Please log in with your Prayatna student account to view your verified test report.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => openAuthModal('login')}
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200"
            >
              Sign In to View Result
            </button>
            <Link
              href="/#tests-section"
              className="w-full py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 font-medium text-sm hover:bg-slate-50 transition-colors"
            >
              Back to Mock Tests
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
        <h2 className="text-lg font-bold text-slate-800 tracking-tight">Generating Official Scorecard...</h2>
        <p className="text-slate-500 text-sm mt-1">Evaluating marking scheme, cohort percentiles, and solutions</p>
      </div>
    );
  }

  // Error state
  if (error || !attempt) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-200/80 p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Scorecard Unavailable</h3>
          <p className="text-sm text-slate-600 mb-6">{error || 'Unable to locate test attempt.'}</p>
          <div className="flex flex-col gap-3">
            <Link
              href={`/test/${testId}`}
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition-colors"
            >
              Go to Test Page
            </Link>
            <Link
              href="/#tests-section"
              className="w-full py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 font-medium text-sm hover:bg-slate-50 transition-colors"
            >
              Back to Test Series
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const rank = cohortRankInfo?.userRank || 1;
  const totalStudents = cohortRankInfo?.totalInCohort || 1;
  const topScore = cohortRankInfo?.topScore ?? attempt.score;
  const avgScore = cohortRankInfo?.avgScore ?? attempt.score;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 font-sans">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200/90 sticky top-0 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/#tests-section"
              className="p-2 -ml-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Back to Tests"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-extrabold text-slate-900 line-clamp-1">{testTitle}</h1>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {testClass} • {testPrep}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Submitted on {new Date(attempt.submittedAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/test-history"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition-colors"
            >
              <History className="w-3.5 h-3.5 text-slate-500" />
              <span>All Test History</span>
            </Link>
            <Link
              href={`/leaderboard?class=${encodeURIComponent(testClass)}&prep=${encodeURIComponent(testPrep)}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 text-xs font-bold transition-all shadow-xs"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-600" />
              <span>Cohort Leaderboard</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        {/* Main Score & Rank Hero Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-10 relative overflow-hidden">
          <div className="absolute -right-16 -top-16 w-80 h-80 bg-indigo-50 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold">
                <Award className="w-3.5 h-3.5 text-amber-500" />
                <span>Verified Assessment Scorecard</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Performance Evaluation
              </h2>
              <p className="text-slate-600 text-sm max-w-md">
                Detailed step analysis evaluated against authoritative Prayatna answer keys.
              </p>
            </div>

            {/* Score & Percentage Display */}
            <div className="flex items-center gap-6 bg-slate-50 border border-slate-200/80 rounded-2xl p-5 sm:p-7 shadow-xs">
              <div className="text-center">
                <div className="text-4xl sm:text-5xl font-black text-indigo-700">
                  {attempt.score}
                  <span className="text-base sm:text-xl font-bold text-slate-400">/{attempt.totalMarks}</span>
                </div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">
                  Marks Obtained
                </div>
              </div>

              <div className="w-px h-14 bg-slate-200"></div>

              <div className="text-center">
                <div className="text-4xl sm:text-5xl font-black text-slate-900">
                  {attempt.percentage}%
                </div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">
                  Percentage
                </div>
              </div>
            </div>
          </div>

          {/* Real Batch Ranking Highlight Banner */}
          <div className="mt-8 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-5 sm:p-6 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
            <div className="flex items-center gap-4 text-center md:text-left">
              <div className="w-14 h-14 rounded-2xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-300 shrink-0">
                <Trophy className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                    Official Cohort Standings
                  </span>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-800 text-indigo-200">
                    {testClass} • {testPrep}
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-white mt-0.5">
                  Batch Rank: <span className="text-amber-300">#{rank}</span> of {totalStudents} Students
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  Ranked by: Higher Score &gt; Higher Accuracy &gt; Lower Time Taken &gt; Earlier Submission
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-center">
              <div className="bg-white/10 px-4 py-2.5 rounded-xl border border-white/10">
                <div className="text-xs text-slate-300 font-medium">Batch Top Score</div>
                <div className="text-lg font-black text-amber-300">{topScore}</div>
              </div>
              <div className="bg-white/10 px-4 py-2.5 rounded-xl border border-white/10">
                <div className="text-xs text-slate-300 font-medium">Batch Average</div>
                <div className="text-lg font-black text-white">{avgScore}</div>
              </div>
              <Link
                href={`/leaderboard?class=${encodeURIComponent(testClass)}&prep=${encodeURIComponent(testPrep)}`}
                className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition-colors shrink-0"
              >
                View Leaderboard
              </Link>
            </div>
          </div>

          {/* Metrics Breakdown Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mt-8 pt-8 border-t border-slate-100">
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-center">
              <div className="flex items-center justify-center text-emerald-600 mb-1">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="text-2xl font-black text-emerald-700">{attempt.correct}</div>
              <div className="text-xs font-bold text-emerald-800">Correct</div>
            </div>

            <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 text-center">
              <div className="flex items-center justify-center text-rose-600 mb-1">
                <XCircle className="w-5 h-5" />
              </div>
              <div className="text-2xl font-black text-rose-700">{attempt.wrong}</div>
              <div className="text-xs font-bold text-rose-800">Wrong</div>
            </div>

            <div className="bg-slate-100 border border-slate-200 rounded-2xl p-4 text-center">
              <div className="flex items-center justify-center text-slate-500 mb-1">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div className="text-2xl font-black text-slate-700">{attempt.unanswered}</div>
              <div className="text-xs font-bold text-slate-600">Unanswered</div>
            </div>

            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 text-center">
              <div className="flex items-center justify-center text-indigo-600 mb-1">
                <BarChart2 className="w-5 h-5" />
              </div>
              <div className="text-2xl font-black text-indigo-700">{attempt.accuracy}%</div>
              <div className="text-xs font-bold text-indigo-800">Accuracy</div>
            </div>

            <div className="col-span-2 sm:col-span-1 bg-amber-50 border border-amber-100 rounded-2xl p-4 text-center">
              <div className="flex items-center justify-center text-amber-600 mb-1">
                <Clock className="w-5 h-5" />
              </div>
              <div className="text-2xl font-black text-amber-700">
                {formatDurationDisplay(attempt.timeTaken)}
              </div>
              <div className="text-xs font-bold text-amber-800">Time Taken</div>
            </div>
          </div>
        </div>

        {/* Question-By-Question Detailed Solution Review */}
        {attempt.questionBreakdown && attempt.questionBreakdown.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-slate-900">Question-Wise Solution Sheet</h3>
                <p className="text-sm text-slate-500">Examine correct answers, user responses, and marking distribution</p>
              </div>
              <div className="text-xs font-bold px-3 py-1 bg-slate-100 text-slate-700 rounded-lg">
                {attempt.questionBreakdown.length} Questions Total
              </div>
            </div>

            <div className="space-y-4">
              {attempt.questionBreakdown.map((item, idx) => {
                const isAnswered = Boolean(item.userAnswer);
                const isCorrect = item.isCorrect;

                let borderClass = 'border-slate-200';
                let statusBadge = (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
                    <HelpCircle className="w-3.5 h-3.5" />
                    Unanswered (0 Marks)
                  </span>
                );

                if (isAnswered) {
                  if (isCorrect) {
                    borderClass = 'border-emerald-200 bg-emerald-50/20';
                    statusBadge = (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                        <Check className="w-3.5 h-3.5" />
                        Correct (+{item.marksAwarded} Marks)
                      </span>
                    );
                  } else {
                    borderClass = 'border-rose-200 bg-rose-50/20';
                    statusBadge = (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
                        <X className="w-3.5 h-3.5" />
                        Incorrect ({item.marksAwarded} Marks)
                      </span>
                    );
                  }
                }

                return (
                  <div
                    key={item.questionId || idx}
                    className={`bg-white rounded-2xl border ${borderClass} p-5 sm:p-7 shadow-xs`}
                  >
                    <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-black flex items-center justify-center border border-indigo-100">
                          Q{idx + 1}
                        </span>
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          Multiple Choice
                        </span>
                      </div>
                      <div>{statusBadge}</div>
                    </div>

                    <div className="text-base font-semibold text-slate-900 leading-relaxed whitespace-pre-line mb-4">
                      {item.questionText}
                    </div>

                    {item.imageUrl && (
                      <div className="mb-5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.imageUrl}
                          alt="Question Diagram"
                          onClick={() => setLightboxImage(item.imageUrl || null)}
                          className="max-h-72 rounded-xl border border-slate-200 object-contain cursor-zoom-in hover:opacity-95 transition-opacity"
                        />
                      </div>
                    )}

                    {/* Options list */}
                    {item.options && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                        {(['A', 'B', 'C', 'D'] as const).map((optKey) => {
                          const optText = item.options ? item.options[optKey] : '';
                          const isUserChoice = item.userAnswer === optKey;
                          const isOfficialAnswer = item.correctAnswer === optKey;

                          let optStyles = 'border-slate-200 bg-white text-slate-700';
                          let icon = null;

                          if (isOfficialAnswer) {
                            optStyles = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-semibold ring-1 ring-emerald-500';
                            icon = <span className="text-[11px] font-bold text-emerald-700">Correct Answer</span>;
                          } else if (isUserChoice && !isCorrect) {
                            optStyles = 'border-rose-500 bg-rose-50 text-rose-950 font-semibold ring-1 ring-rose-500';
                            icon = <span className="text-[11px] font-bold text-rose-700">Your Answer</span>;
                          }

                          return (
                            <div
                              key={optKey}
                              className={`flex items-center justify-between p-3.5 rounded-xl border ${optStyles} text-sm transition-all`}
                            >
                              <div className="flex items-center gap-3">
                                <span className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 ${
                                  isOfficialAnswer
                                    ? 'bg-emerald-600 text-white'
                                    : isUserChoice
                                    ? 'bg-rose-600 text-white'
                                    : 'bg-slate-100 text-slate-700'
                                }`}>
                                  {optKey}
                                </span>
                                <span>{optText}</span>
                              </div>
                              {icon && <div className="shrink-0">{icon}</div>}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Quick Navigation Footer Actions */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/#tests-section"
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm font-semibold transition-colors"
            >
              Back to Test Series
            </Link>
            <Link
              href="/test-history"
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm font-semibold transition-colors"
            >
              My Test History
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/performance"
              className="px-5 py-2.5 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-sm font-bold transition-colors flex items-center gap-2"
            >
              <TrendingUp className="w-4 h-4" />
              <span>Performance Analytics</span>
            </Link>
            <Link
              href={`/leaderboard?class=${encodeURIComponent(testClass)}&prep=${encodeURIComponent(testPrep)}`}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold transition-colors shadow-sm shadow-indigo-200 flex items-center gap-2"
            >
              <Trophy className="w-4 h-4 text-amber-300" />
              <span>Full Leaderboard</span>
            </Link>
          </div>
        </div>
      </main>

      {/* Lightbox for zooming diagrams */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 backdrop-blur-xs"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] bg-white rounded-2xl p-4 overflow-hidden">
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={lightboxImage} alt="Enlarged Diagram" className="max-h-[80vh] w-auto object-contain rounded-lg" />
          </div>
        </div>
      )}
    </div>
  );
}
