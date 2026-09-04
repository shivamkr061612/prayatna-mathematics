'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { database, TestAttemptData } from '@/lib/firebase';
import { ref, onValue, get } from 'firebase/database';
import Link from 'next/link';
import {
  Clock,
  AlertCircle,
  CheckCircle2,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Send,
  RotateCcw,
  Maximize2,
  X,
  Award,
  BarChart2,
  Check,
  XCircle,
  HelpCircle,
  ArrowLeft,
  ShieldCheck,
  FileText,
  Sparkles,
  AlertTriangle,
  Trophy
} from 'lucide-react';
import { calculateTestRankings, AttemptItem } from '@/lib/rankings';

interface SanitizedQuestion {
  id: string;
  questionIndex: number;
  questionText: string;
  imageUrl?: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  marks: number;
  negativeMarks: number;
}

interface SanitizedTest {
  id: string;
  title: string;
  description: string;
  class: 'Class 11' | 'Class 12';
  preparation: 'Board' | 'JEE';
  duration: number; // minutes
  totalMarks: number;
  marksPerQuestion: number;
  negativeMark: number;
  startTime?: string | null;
  endTime?: string | null;
  active: boolean;
  allowMultipleAttempts: boolean;
  questionsCount: number;
  questions: SanitizedQuestion[];
}

export default function TestScreenPage() {
  const params = useParams();
  const testId = params.testId as string;
  const router = useRouter();
  const { user, userData, openAuthModal } = useAuth();

  // Test loading & data
  const [test, setTest] = useState<SanitizedTest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Existing attempt state (if already taken)
  const [existingAttempt, setExistingAttempt] = useState<TestAttemptData | null>(null);

  // Active test execution state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, 'A' | 'B' | 'C' | 'D'>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<string, boolean>>({});
  const [visitedQuestions, setVisitedQuestions] = useState<Record<string, boolean>>({});
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const [initialDurationSeconds, setInitialDurationSeconds] = useState<number>(0);
  const [testStartedAt, setTestStartedAt] = useState<number>(0);

  // UI state
  const [confirmSubmitModalOpen, setConfirmSubmitModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [mobilePaletteOpen, setMobilePaletteOpen] = useState(false);

  // Result state
  const [resultAttempt, setResultAttempt] = useState<TestAttemptData | null>(null);
  const [cohortRankInfo, setCohortRankInfo] = useState<{
    userRank: number;
    totalInCohort: number;
    topScore: number;
    avgScore: number;
  } | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const autoSubmittedRef = useRef(false);
  const handleTestSubmitRef = useRef<(isAutoSubmit?: boolean) => Promise<void>>(() => Promise.resolve());

  const storageKey = user && testId ? `prayatna_test_${testId}_${user.uid}` : null;

  // 1. Check Auth & Load Test
  useEffect(() => {
    if (!testId) return;

    let isMounted = true;

    async function loadTestAndAttempt() {
      try {
        setLoading(true);
        setError(null);

        // Fetch sanitized test via API route
        const res = await fetch(`/api/tests/${testId}`);
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Failed to load test');
        }

        const data = await res.json();
        const loadedTest = data.test as SanitizedTest;

        if (!isMounted) return;
        setTest(loadedTest);

        const totalSecs = (loadedTest.duration || 60) * 60;
        setInitialDurationSeconds(totalSecs);

        // Check if user already submitted
        if (user) {
          const attemptSnap = await get(ref(database, `testAttempts/${testId}/${user.uid}`));
          if (attemptSnap.exists() && !loadedTest.allowMultipleAttempts) {
            const att = attemptSnap.val() as TestAttemptData;
            if (isMounted) {
              setExistingAttempt(att);
              setResultAttempt(att);
              setLoading(false);
            }
            return;
          }

          // Restore progress from localStorage if available
          if (storageKey) {
            try {
              const saved = localStorage.getItem(storageKey);
              if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed.answers) setAnswers(parsed.answers);
                if (parsed.markedForReview) setMarkedForReview(parsed.markedForReview);
                if (parsed.visitedQuestions) setVisitedQuestions(parsed.visitedQuestions);
                if (parsed.remainingSeconds && parsed.remainingSeconds > 0) {
                  setRemainingSeconds(parsed.remainingSeconds);
                } else {
                  setRemainingSeconds(totalSecs);
                }
                if (parsed.testStartedAt) {
                  setTestStartedAt(parsed.testStartedAt);
                } else {
                  setTestStartedAt(Date.now());
                }
              } else {
                setRemainingSeconds(totalSecs);
                setTestStartedAt(Date.now());
              }
            } catch (e) {
              console.warn('Could not restore cached test state', e);
              setRemainingSeconds(totalSecs);
              setTestStartedAt(Date.now());
            }
          } else {
            setRemainingSeconds(totalSecs);
            setTestStartedAt(Date.now());
          }
        } else {
          setRemainingSeconds(totalSecs);
          setTestStartedAt(Date.now());
        }

        setLoading(false);
      } catch (err: any) {
        if (!isMounted) return;
        console.error('Error loading test:', err);
        setError(err.message || 'An unexpected error occurred.');
        setLoading(false);
      }
    }

    loadTestAndAttempt();

    return () => {
      isMounted = false;
    };
  }, [testId, user, storageKey]);

  // Mark first question visited once loaded
  useEffect(() => {
    if (test && test.questions && test.questions.length > 0) {
      const q = test.questions[currentQuestionIndex];
      if (q) {
        setTimeout(() => {
          setVisitedQuestions(prev => ({ ...prev, [q.id]: true }));
        }, 0);
      }
    }
  }, [test, currentQuestionIndex]);

  // 2. Persist state to localStorage during active test
  useEffect(() => {
    if (!storageKey || !test || resultAttempt || existingAttempt) return;

    const stateToSave = {
      answers,
      markedForReview,
      visitedQuestions,
      remainingSeconds,
      testStartedAt: testStartedAt || Date.now()
    };
    try {
      localStorage.setItem(storageKey, JSON.stringify(stateToSave));
    } catch (e) {
      // Storage quota or private mode error
    }
  }, [answers, markedForReview, visitedQuestions, remainingSeconds, testStartedAt, storageKey, test, resultAttempt, existingAttempt]);

  // 3. Active Test Countdown Timer
  useEffect(() => {
    if (loading || !test || resultAttempt || existingAttempt) return;

    if (remainingSeconds <= 0 && initialDurationSeconds > 0 && !autoSubmittedRef.current) {
      autoSubmittedRef.current = true;
      handleTestSubmitRef.current(true);
      return;
    }

    timerRef.current = setInterval(() => {
      setRemainingSeconds(prev => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          if (!autoSubmittedRef.current) {
            autoSubmittedRef.current = true;
            setTimeout(() => handleTestSubmitRef.current(true), 0);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [loading, test, resultAttempt, existingAttempt, remainingSeconds, initialDurationSeconds]);

  // 4. BeforeUnload safety guard during test
  useEffect(() => {
    if (resultAttempt || existingAttempt || loading) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'You have an active test in progress. Your submitted score may be lost if you leave.';
      return e.returnValue;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [resultAttempt, existingAttempt, loading]);

  // Core answer handling
  const handleSelectOption = (optionKey: 'A' | 'B' | 'C' | 'D') => {
    if (!test) return;
    const currentQ = test.questions[currentQuestionIndex];
    if (!currentQ) return;

    setAnswers(prev => ({
      ...prev,
      [currentQ.id]: optionKey
    }));
  };

  const handleClearAnswer = () => {
    if (!test) return;
    const currentQ = test.questions[currentQuestionIndex];
    if (!currentQ) return;

    setAnswers(prev => {
      const copy = { ...prev };
      delete copy[currentQ.id];
      return copy;
    });
  };

  const handleToggleMarkForReview = () => {
    if (!test) return;
    const currentQ = test.questions[currentQuestionIndex];
    if (!currentQ) return;

    setMarkedForReview(prev => ({
      ...prev,
      [currentQ.id]: !prev[currentQ.id]
    }));
  };

  const handleNextQuestion = () => {
    if (!test) return;
    if (currentQuestionIndex < test.questions.length - 1) {
      const nextIdx = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIdx);
      const nextQ = test.questions[nextIdx];
      if (nextQ) {
        setVisitedQuestions(prev => ({ ...prev, [nextQ.id]: true }));
      }
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      const prevIdx = currentQuestionIndex - 1;
      setCurrentQuestionIndex(prevIdx);
    }
  };

  const handleJumpToQuestion = (index: number) => {
    if (!test || index < 0 || index >= test.questions.length) return;
    setCurrentQuestionIndex(index);
    const targetQ = test.questions[index];
    if (targetQ) {
      setVisitedQuestions(prev => ({ ...prev, [targetQ.id]: true }));
    }
    setMobilePaletteOpen(false);
  };

  // 4. Calculate live cohort rank when attemptToDisplay is present
  useEffect(() => {
    const currentAttempt = resultAttempt || existingAttempt;
    if (!currentAttempt || !testId || !user) return;

    const attemptsRef = ref(database, `testAttempts/${testId}`);
    const unsubscribe = onValue(attemptsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const list: AttemptItem[] = Object.values(data);
        const studentClass = currentAttempt.studentClass || currentAttempt.userClass || userData?.class || 'Class 11';
        const studentPrep = currentAttempt.studentPreparation || currentAttempt.userPreparation || userData?.preparation || 'Board';
        const res = calculateTestRankings(list, studentClass, studentPrep, user.uid);
        setCohortRankInfo(res);
      }
    });

    return () => unsubscribe();
  }, [resultAttempt, existingAttempt, testId, user, userData]);

  // Submit Test Function
  const handleTestSubmit = async (isAutoSubmit = false) => {
    if (!test || !user) return;
    if (isSubmitting) return;

    setIsSubmitting(true);
    setConfirmSubmitModalOpen(false);

    try {
      const durationSeconds = (test.duration || 60) * 60;
      const calculatedTimeTaken = Math.max(1, durationSeconds - remainingSeconds);

      const payload = {
        testId: test.id,
        userId: user.uid,
        studentName: userData?.name || user.displayName || 'Student',
        studentEmail: user.email || '',
        studentClass: userData?.class || test.class,
        studentPreparation: userData?.preparation || test.preparation,
        studentPhotoURL: userData?.photoURL || '',
        answers,
        timeTaken: calculatedTimeTaken
      };

      const res = await fetch('/api/tests/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Submission evaluation failed');
      }

      if (data.attempt) {
        setResultAttempt(data.attempt);
        // Clear cached local storage
        if (storageKey) {
          localStorage.removeItem(storageKey);
        }
      }
    } catch (err: any) {
      console.error('Error during test submission:', err);
      alert(`Submission Error: ${err.message || 'Please try again'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    handleTestSubmitRef.current = handleTestSubmit;
  });

  // Format time remaining MM:SS or HH:MM:SS
  const formatTime = (secs: number) => {
    const hours = Math.floor(secs / 3600);
    const minutes = Math.floor((secs % 3600) / 60);
    const seconds = secs % 60;

    const pad = (n: number) => String(n).padStart(2, '0');
    if (hours > 0) {
      return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }
    return `${pad(minutes)}:${pad(seconds)}`;
  };

  // Format seconds to human friendly duration
  const formatDurationDisplay = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    if (mins === 0) return `${secs}s`;
    if (secs === 0) return `${mins}m`;
    return `${mins}m ${secs}s`;
  };

  // Evaluation summary counts
  const totalQuestions = test?.questions?.length || 0;
  const answeredCount = Object.keys(answers).length;
  const markedCount = Object.values(markedForReview).filter(Boolean).length;
  const unansweredCount = Math.max(0, totalQuestions - answeredCount);

  // Status computation for question palette
  const getQuestionStatus = (qId: string) => {
    const isAnswered = Boolean(answers[qId]);
    const isMarked = Boolean(markedForReview[qId]);
    const isVisited = Boolean(visitedQuestions[qId]);

    if (isAnswered && isMarked) return 'answered-marked';
    if (isMarked) return 'marked';
    if (isAnswered) return 'answered';
    if (isVisited) return 'unanswered-visited';
    return 'unvisited';
  };

  // -------------------------------------------------------------
  // RENDER: Loading or Error States
  // -------------------------------------------------------------
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
        <h2 className="text-xl font-bold tracking-tight">Initializing Prayatna Test Environment...</h2>
        <p className="text-slate-400 text-sm mt-1">Preparing questions, timing engine, and security checkpoints</p>
      </div>
    );
  }

  if (error || !test) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-slate-200 p-6 text-center">
          <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Unable to Launch Test</h3>
          <p className="text-sm text-slate-600 mb-6">{error || 'The requested test could not be found or is currently inactive.'}</p>
          <Link
            href="/#tests-section"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Test Series</span>
          </Link>
        </div>
      </div>
    );
  }

  // Not logged in gate
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-slate-200 p-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center mx-auto mb-4 shadow-sm">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Student Authentication Required</h3>
          <p className="text-sm text-slate-600 mb-6">
            You must be signed in with your verified Prayatna Mathematics student profile to attempt <span className="font-semibold text-slate-800">&quot;{test.title}&quot;</span>.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => openAuthModal('login')}
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200"
            >
              Sign In to Start Test
            </button>
            <Link
              href="/#tests-section"
              className="w-full py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 font-medium text-sm hover:bg-slate-50 transition-colors"
            >
              Back to Tests
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER: RESULT PAGE (After Submission or for Existing Attempt)
  // -------------------------------------------------------------
  const attemptToDisplay = resultAttempt || existingAttempt;

  if (attemptToDisplay) {
    const isPassing = (attemptToDisplay.percentage || 0) >= 40;

    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
        {/* Top Result Banner */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/#tests-section"
                className="p-2 -ml-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                title="Back to All Tests"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-base sm:text-lg font-bold text-slate-900 line-clamp-1">{test.title}</h1>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span>{test.class}</span>
                  <span>•</span>
                  <span>{test.preparation} Mathematics</span>
                  <span>•</span>
                  <span>Official Test Report</span>
                </div>
              </div>
            </div>

            <Link
              href="/#tests-section"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-semibold hover:bg-indigo-100 transition-colors"
            >
              <span>Done Reviewing</span>
            </Link>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
          {/* Main Score Hero Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-50 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="text-center md:text-left space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold">
                  <Award className="w-3.5 h-3.5 text-amber-500" />
                  <span>Performance Evaluation</span>
                </div>
                <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                  Your Test Score
                </h2>
                <p className="text-slate-600 text-sm max-w-md">
                  Completed on {new Date(attemptToDisplay.submittedAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>

              {/* Big Score Meter */}
              <div className="flex items-center gap-6 bg-slate-50 border border-slate-200/80 rounded-2xl p-5 sm:p-6">
                <div className="text-center">
                  <div className="text-3xl sm:text-5xl font-black text-indigo-700">
                    {attemptToDisplay.score}
                    <span className="text-base sm:text-xl font-bold text-slate-400">/{attemptToDisplay.totalMarks}</span>
                  </div>
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">
                    Marks Obtained
                  </div>
                </div>

                <div className="w-px h-14 bg-slate-200"></div>

                <div className="text-center">
                  <div className="text-3xl sm:text-5xl font-black text-slate-900">
                    {attemptToDisplay.percentage}%
                  </div>
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">
                    Percentage
                  </div>
                </div>
              </div>
            </div>

            {/* Metrics Breakdown Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mt-8 pt-8 border-t border-slate-100">
              <div className="bg-emerald-50/80 border border-emerald-100 rounded-xl p-4 text-center">
                <div className="flex items-center justify-center text-emerald-600 mb-1">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="text-2xl font-black text-emerald-700">{attemptToDisplay.correct}</div>
                <div className="text-xs font-semibold text-emerald-800">Correct</div>
              </div>

              <div className="bg-rose-50/80 border border-rose-100 rounded-xl p-4 text-center">
                <div className="flex items-center justify-center text-rose-600 mb-1">
                  <XCircle className="w-5 h-5" />
                </div>
                <div className="text-2xl font-black text-rose-700">{attemptToDisplay.wrong}</div>
                <div className="text-xs font-semibold text-rose-800">Wrong</div>
              </div>

              <div className="bg-slate-100/80 border border-slate-200 rounded-xl p-4 text-center">
                <div className="flex items-center justify-center text-slate-500 mb-1">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div className="text-2xl font-black text-slate-700">{attemptToDisplay.unanswered}</div>
                <div className="text-xs font-semibold text-slate-600">Unanswered</div>
              </div>

              <div className="bg-indigo-50/80 border border-indigo-100 rounded-xl p-4 text-center">
                <div className="flex items-center justify-center text-indigo-600 mb-1">
                  <BarChart2 className="w-5 h-5" />
                </div>
                <div className="text-2xl font-black text-indigo-700">{attemptToDisplay.accuracy}%</div>
                <div className="text-xs font-semibold text-indigo-800">Accuracy</div>
              </div>

              <div className="col-span-2 sm:col-span-1 bg-amber-50/80 border border-amber-100 rounded-xl p-4 text-center">
                <div className="flex items-center justify-center text-amber-600 mb-1">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="text-2xl font-black text-amber-700">
                  {formatDurationDisplay(attemptToDisplay.timeTaken)}
                </div>
                <div className="text-xs font-semibold text-amber-800">Time Taken</div>
              </div>
            </div>

            {/* Live Cohort Standings Card */}
            <div className="mt-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-5 sm:p-6 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
              <div className="flex items-center gap-4 text-center md:text-left">
                <div className="w-14 h-14 rounded-2xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-300 shrink-0">
                  <Trophy className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                      Cohort Test Standings
                    </span>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-800 text-indigo-200">
                      {attemptToDisplay.studentClass || test.class} • {attemptToDisplay.studentPreparation || test.preparation}
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-white mt-0.5">
                    Batch Rank: <span className="text-amber-300">#{cohortRankInfo?.userRank || 1}</span> of {cohortRankInfo?.totalInCohort || 1} Students
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">
                    Evaluated by: Higher Score &gt; Higher Accuracy &gt; Lower Time Taken &gt; Earlier Submission
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 sm:gap-4 text-center flex-wrap justify-center">
                <div className="bg-white/10 px-3 sm:px-4 py-2 rounded-xl border border-white/10">
                  <div className="text-[11px] text-slate-300 font-medium">Batch Top</div>
                  <div className="text-base sm:text-lg font-black text-amber-300">
                    {cohortRankInfo?.topScore ?? attemptToDisplay.score}
                  </div>
                </div>
                <div className="bg-white/10 px-3 sm:px-4 py-2 rounded-xl border border-white/10">
                  <div className="text-[11px] text-slate-300 font-medium">Batch Avg</div>
                  <div className="text-base sm:text-lg font-black text-white">
                    {cohortRankInfo?.avgScore ?? attemptToDisplay.score}
                  </div>
                </div>
                <Link
                  href={`/leaderboard?class=${encodeURIComponent(attemptToDisplay.studentClass || test.class)}&prep=${encodeURIComponent(attemptToDisplay.studentPreparation || test.preparation)}`}
                  className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition-colors shrink-0"
                >
                  View Leaderboard
                </Link>
              </div>
            </div>
          </div>

          {/* Question-By-Question Detailed Solution Review */}
          {attemptToDisplay.questionBreakdown && attemptToDisplay.questionBreakdown.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Detailed Answer Analysis</h3>
                  <p className="text-sm text-slate-500">Review your choices against verified solutions</p>
                </div>
                <div className="text-xs font-semibold text-slate-600">
                  {attemptToDisplay.questionBreakdown.length} Questions
                </div>
              </div>

              <div className="space-y-4">
                {attemptToDisplay.questionBreakdown.map((item, idx) => {
                  const isAnswered = Boolean(item.userAnswer);
                  const isCorrect = item.isCorrect;

                  let borderClass = 'border-slate-200';
                  let statusBadge = (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                      <HelpCircle className="w-3.5 h-3.5" />
                      Unanswered (0 Marks)
                    </span>
                  );

                  if (isAnswered) {
                    if (isCorrect) {
                      borderClass = 'border-emerald-200 bg-emerald-50/20';
                      statusBadge = (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                          <Check className="w-3.5 h-3.5" />
                          Correct (+{item.marksAwarded} Marks)
                        </span>
                      );
                    } else {
                      borderClass = 'border-rose-200 bg-rose-50/20';
                      statusBadge = (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
                          <X className="w-3.5 h-3.5" />
                          Incorrect ({item.marksAwarded} Marks)
                        </span>
                      );
                    }
                  }

                  return (
                    <div
                      key={item.questionId || idx}
                      className={`bg-white rounded-2xl border ${borderClass} p-5 sm:p-6 shadow-sm`}
                    >
                      <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-lg bg-slate-100 text-slate-800 text-xs font-extrabold flex items-center justify-center">
                            Q{idx + 1}
                          </span>
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                            Single Correct Option
                          </span>
                        </div>
                        <div>{statusBadge}</div>
                      </div>

                      <div className="text-base font-semibold text-slate-900 leading-relaxed whitespace-pre-line mb-4">
                        {item.questionText}
                      </div>

                      {item.imageUrl && (
                        <div className="mb-4">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.imageUrl}
                            alt={`Question ${idx + 1}`}
                            className="max-h-72 rounded-xl border border-slate-200 object-contain bg-slate-50 cursor-pointer hover:opacity-95"
                            onClick={() => setLightboxImage(item.imageUrl || null)}
                          />
                        </div>
                      )}

                      {/* Options Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                        {(['A', 'B', 'C', 'D'] as const).map(optKey => {
                          const optionText = item.options?.[optKey] || '';
                          const isUserSelection = item.userAnswer === optKey;
                          const isCorrectOption = item.correctAnswer === optKey;

                          let optionBoxClass = 'border-slate-200 bg-white text-slate-700';
                          if (isCorrectOption) {
                            optionBoxClass = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-medium ring-1 ring-emerald-500';
                          } else if (isUserSelection && !isCorrectOption) {
                            optionBoxClass = 'border-rose-500 bg-rose-50 text-rose-900 font-medium ring-1 ring-rose-500';
                          }

                          return (
                            <div
                              key={optKey}
                              className={`flex items-start gap-3 p-3.5 rounded-xl border ${optionBoxClass} text-sm transition-all`}
                            >
                              <div
                                className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 ${
                                  isCorrectOption
                                    ? 'bg-emerald-600 text-white'
                                    : isUserSelection
                                    ? 'bg-rose-600 text-white'
                                    : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                {optKey}
                              </div>
                              <div className="flex-1 break-words">
                                {optionText}
                                {isCorrectOption && (
                                  <span className="block text-[11px] font-bold text-emerald-700 mt-1">
                                    ✓ Correct Answer
                                  </span>
                                )}
                                {isUserSelection && !isCorrectOption && (
                                  <span className="block text-[11px] font-bold text-rose-700 mt-1">
                                    ✗ Your Answer
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Bottom Back Button */}
          <div className="pt-6 pb-12 text-center">
            <Link
              href="/#tests-section"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Tests Series</span>
            </Link>
          </div>
        </main>

        {/* Lightbox */}
        {lightboxImage && (
          <div
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={() => setLightboxImage(null)}
          >
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-4 right-4 p-2 text-white/80 hover:text-white rounded-full bg-white/10"
            >
              <X className="w-6 h-6" />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={lightboxImage}
              alt="Zoomed Question Sheet"
              className="max-w-full max-h-[90vh] object-contain rounded-xl"
            />
          </div>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER: ACTIVE DISTRACTION-FREE TEST SCREEN
  // -------------------------------------------------------------
  const currentQ = test.questions[currentQuestionIndex];
  const isTimeCritical = remainingSeconds < 300; // < 5 minutes
  const isCurrentMarked = currentQ ? Boolean(markedForReview[currentQ.id]) : false;
  const currentSelectedOption = currentQ ? answers[currentQ.id] : undefined;

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-900 text-slate-100 overflow-hidden select-none font-sans">
      {/* Top Test Navigation Bar */}
      <header className="h-16 bg-slate-950 border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between shrink-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-serif text-lg font-bold">
            ∑
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-bold text-white tracking-tight line-clamp-1 max-w-[200px] sm:max-w-md">
              {test.title}
            </h1>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="text-indigo-400 font-semibold">{test.class}</span>
              <span>•</span>
              <span>{test.preparation}</span>
              <span>•</span>
              <span>Total Marks: {test.totalMarks}</span>
            </div>
          </div>
        </div>

        {/* Center Countdown Timer */}
        <div className="flex items-center gap-4">
          <div
            className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-xl font-mono text-sm sm:text-base font-bold tracking-wider border shadow-sm transition-colors ${
              isTimeCritical
                ? 'bg-rose-950/80 border-rose-500/50 text-rose-300 animate-pulse'
                : 'bg-slate-800/90 border-slate-700 text-amber-400'
            }`}
          >
            <Clock className="w-4 h-4 text-amber-400" />
            <span>{formatTime(remainingSeconds)}</span>
          </div>

          {/* Submit Test Button */}
          <button
            onClick={() => setConfirmSubmitModalOpen(true)}
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs sm:text-sm tracking-wide shadow-md shadow-emerald-950 transition-colors"
          >
            <Send className="w-4 h-4" />
            <span>Submit Test</span>
          </button>

          {/* Mobile Palette Toggle */}
          <button
            onClick={() => setMobilePaletteOpen(!mobilePaletteOpen)}
            className="lg:hidden p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700"
            title="Toggle Question Palette"
          >
            <FileText className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Test Workspace Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left: Question Content & Options Area */}
        <div className="flex-1 flex flex-col bg-slate-900 overflow-y-auto">
          {currentQ ? (
            <div className="max-w-4xl w-full mx-auto p-4 sm:p-8 flex-1 flex flex-col justify-between space-y-6">
              <div className="space-y-6">
                {/* Question Header */}
                <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <span className="px-3 py-1 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs sm:text-sm font-bold">
                      Question {currentQuestionIndex + 1} of {test.questions.length}
                    </span>
                    {isCurrentMarked && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-semibold">
                        <Bookmark className="w-3.5 h-3.5 fill-purple-400" />
                        Marked for Review
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs font-medium">
                    <span className="text-emerald-400 font-bold">+{currentQ.marks} Marks</span>
                    <span className="text-slate-600">/</span>
                    <span className="text-rose-400 font-bold">-{currentQ.negativeMarks} Negative</span>
                  </div>
                </div>

                {/* Question Text */}
                <div className="text-base sm:text-lg font-medium text-slate-100 leading-relaxed whitespace-pre-line">
                  {currentQ.questionText}
                </div>

                {/* Question Image (if attached) */}
                {currentQ.imageUrl && (
                  <div className="relative inline-block my-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={currentQ.imageUrl}
                      alt={`Question ${currentQuestionIndex + 1}`}
                      className="max-h-80 rounded-2xl border border-slate-700 object-contain bg-slate-950 p-2 cursor-pointer hover:border-indigo-500 transition-colors"
                      onClick={() => setLightboxImage(currentQ.imageUrl || null)}
                    />
                    <button
                      onClick={() => setLightboxImage(currentQ.imageUrl || null)}
                      className="absolute bottom-4 right-4 p-2 rounded-xl bg-black/70 text-white hover:bg-black transition-colors"
                      title="Enlarge Image"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* 4 Interactive Options */}
                <div className="space-y-3 pt-2">
                  {(['A', 'B', 'C', 'D'] as const).map(optionKey => {
                    const optionValue = currentQ.options?.[optionKey] || '';
                    const isSelected = currentSelectedOption === optionKey;

                    return (
                      <button
                        key={optionKey}
                        type="button"
                        onClick={() => handleSelectOption(optionKey)}
                        className={`w-full flex items-start gap-4 p-4 rounded-2xl border text-left transition-all group ${
                          isSelected
                            ? 'bg-indigo-600/20 border-indigo-500 text-white ring-1 ring-indigo-500 shadow-sm'
                            : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-xl font-bold text-xs flex items-center justify-center shrink-0 transition-colors ${
                            isSelected
                              ? 'bg-indigo-500 text-white'
                              : 'bg-slate-700 text-slate-300 group-hover:bg-slate-600'
                          }`}
                        >
                          {optionKey}
                        </div>
                        <div className="flex-1 text-sm sm:text-base font-normal pt-0.5 leading-relaxed break-words">
                          {optionValue}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bottom In-Question Action Bar */}
              <div className="pt-6 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleToggleMarkForReview}
                    className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold border flex items-center gap-2 transition-colors ${
                      isCurrentMarked
                        ? 'bg-purple-600/20 border-purple-500 text-purple-300'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    <Bookmark className={`w-4 h-4 ${isCurrentMarked ? 'fill-purple-400' : ''}`} />
                    <span>{isCurrentMarked ? 'Unmark Review' : 'Mark for Review'}</span>
                  </button>

                  {currentSelectedOption && (
                    <button
                      type="button"
                      onClick={handleClearAnswer}
                      className="px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 border border-transparent hover:border-rose-800/40 transition-colors flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Clear Response</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePreviousQuestion}
                    disabled={currentQuestionIndex === 0}
                    className="px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white disabled:opacity-40 disabled:pointer-events-none text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleNextQuestion}
                    disabled={currentQuestionIndex === test.questions.length - 1}
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors disabled:opacity-40 disabled:pointer-events-none"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setConfirmSubmitModalOpen(true)}
                    className="sm:hidden px-3 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-1"
                  >
                    <span>Submit</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8 text-slate-500">
              No question loaded
            </div>
          )}
        </div>

        {/* Right: Question Navigation Palette (Desktop Sidebar & Mobile Drawer) */}
        <aside
          className={`fixed lg:relative top-16 lg:top-0 right-0 bottom-0 w-80 bg-slate-950 border-l border-slate-800 p-5 flex flex-col justify-between z-20 transition-transform duration-200 ${
            mobilePaletteOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
          }`}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white tracking-wide uppercase">Question Palette</h3>
              <button
                onClick={() => setMobilePaletteOpen(false)}
                className="lg:hidden p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Metrics Strip */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-900/60">
                <div className="font-bold text-emerald-400 text-base">{answeredCount}</div>
                <div className="text-[10px] text-slate-400">Answered</div>
              </div>
              <div className="p-2 rounded-xl bg-purple-950/40 border border-purple-900/60">
                <div className="font-bold text-purple-300 text-base">{markedCount}</div>
                <div className="text-[10px] text-slate-400">Review</div>
              </div>
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                <div className="font-bold text-slate-400 text-base">{unansweredCount}</div>
                <div className="text-[10px] text-slate-500">Left</div>
              </div>
            </div>

            {/* Questions Grid */}
            <div className="pt-2">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Jump to Question
              </div>
              <div className="grid grid-cols-5 gap-2 max-h-[calc(100vh-360px)] overflow-y-auto pr-1">
                {test.questions.map((q, idx) => {
                  const status = getQuestionStatus(q.id);
                  const isCurrent = idx === currentQuestionIndex;

                  let btnStyle = 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700';
                  if (status === 'answered-marked') {
                    btnStyle = 'bg-purple-900/80 text-purple-200 border-purple-600 font-bold';
                  } else if (status === 'marked') {
                    btnStyle = 'bg-purple-600/30 text-purple-300 border-purple-500 font-bold';
                  } else if (status === 'answered') {
                    btnStyle = 'bg-emerald-600 text-white border-emerald-500 font-bold';
                  } else if (status === 'unanswered-visited') {
                    btnStyle = 'bg-slate-800 text-slate-300 border-slate-700';
                  }

                  return (
                    <button
                      key={q.id || idx}
                      type="button"
                      onClick={() => handleJumpToQuestion(idx)}
                      className={`h-10 rounded-xl text-xs font-bold border transition-all relative flex items-center justify-center ${btnStyle} ${
                        isCurrent ? 'ring-2 ring-indigo-400 ring-offset-2 ring-offset-slate-950 scale-105' : ''
                      }`}
                    >
                      {idx + 1}
                      {status === 'answered-marked' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 absolute top-1 right-1"></span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Legend */}
            <div className="pt-4 border-t border-slate-800/80 space-y-1.5 text-[11px] text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-emerald-600"></span>
                <span>Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-purple-600/50 border border-purple-500"></span>
                <span>Marked for Review</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-slate-900 border border-slate-800"></span>
                <span>Not Visited</span>
              </div>
            </div>
          </div>

          {/* Bottom Submit in Palette */}
          <div className="pt-4 border-t border-slate-800">
            <button
              onClick={() => setConfirmSubmitModalOpen(true)}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950 transition-colors"
            >
              <Send className="w-4 h-4" />
              <span>Final Submit Test</span>
            </button>
          </div>
        </aside>
      </div>

      {/* CONFIRMATION SUBMISSION MODAL */}
      {confirmSubmitModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-2 border border-amber-500/30">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                Are you sure you want to submit?
              </h3>
              <p className="text-xs text-slate-400">
                Once submitted, answers will be locked and automatically evaluated according to the official answer key.
              </p>
            </div>

            {/* Submission Summary Box */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-2.5 text-sm">
              <div className="flex items-center justify-between text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span>Answered Questions</span>
                </div>
                <span className="font-bold text-emerald-400">{answeredCount}</span>
              </div>

              <div className="flex items-center justify-between text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-500"></span>
                  <span>Unanswered Questions</span>
                </div>
                <span className="font-bold text-slate-400">{unansweredCount}</span>
              </div>

              <div className="flex items-center justify-between text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-400"></span>
                  <span>Marked for Review</span>
                </div>
                <span className="font-bold text-purple-300">{markedCount}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setConfirmSubmitModalOpen(false)}
                className="py-2.5 px-4 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold text-sm border border-slate-700 transition-colors"
              >
                Cancel & Continue
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleTestSubmit(false)}
                className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md shadow-emerald-950 flex items-center justify-center gap-2 transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Evaluating...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Yes, Submit</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox for Zoomed Images */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 backdrop-blur-md"
          onClick={() => setLightboxImage(null)}
        >
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white rounded-full bg-white/10"
          >
            <X className="w-6 h-6" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightboxImage}
            alt="Zoomed Question Sheet"
            className="max-w-full max-h-[90vh] object-contain rounded-xl"
          />
        </div>
      )}
    </div>
  );
}
