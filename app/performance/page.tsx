'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import { useAuth } from '@/context/AuthContext';
import { database } from '@/lib/firebase';
import { ref, onValue } from 'firebase/database';
import { calculateStudentPerformance, AttemptItem, StudentPerformanceSummary } from '@/lib/rankings';
import GamificationSection from '@/components/GamificationSection';
import {
  TrendingUp,
  Award,
  Trophy,
  Target,
  BarChart2,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  ArrowRight,
  Sparkles,
  Calendar,
  CalendarCheck,
  ChevronRight,
  ShieldCheck,
  History,
  Activity,
  Flame,
  Zap
} from 'lucide-react';

export default function PerformancePage() {
  const { user, userData, openAuthModal } = useAuth();
  const [loading, setLoading] = useState(true);
  const [rawAttempts, setRawAttempts] = useState<AttemptItem[]>([]);

  // Fetch all attempts to calculate user's personal analytics + cohort ranking
  useEffect(() => {
    if (!user) {
      const timer = setTimeout(() => setLoading(false), 0);
      return () => clearTimeout(timer);
    }

    const attemptsRef = ref(database, 'testAttempts');

    const unsubscribe = onValue(attemptsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val() || {};
        const flattened: AttemptItem[] = [];

        Object.keys(data).forEach((testId) => {
          const testAttempts = data[testId] || {};
          Object.keys(testAttempts).forEach((userId) => {
            const att = testAttempts[userId];
            if (att && typeof att === 'object') {
              flattened.push({
                ...att,
                testId: att.testId || testId,
                userId: att.userId || userId
              });
            }
          });
        });

        setRawAttempts(flattened);
      } else {
        setRawAttempts([]);
      }
      setLoading(false);
    }, (err) => {
      console.error('Error reading attempts for performance:', err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Calculate metrics
  const userClass = userData?.class || 'Class 11';
  const userPrep = userData?.preparation || 'Board';

  const metrics: StudentPerformanceSummary = useMemo(() => {
    if (!user) {
      return {
        totalTests: 0,
        averageScore: 0,
        bestScore: 0,
        averagePercentage: 0,
        averageAccuracy: 0,
        totalCorrect: 0,
        totalWrong: 0,
        totalUnanswered: 0,
        currentRank: 0,
        totalCohortStudents: 0,
        testHistory: []
      };
    }
    return calculateStudentPerformance(rawAttempts, user.uid, userClass, userPrep);
  }, [rawAttempts, user, userClass, userPrep]);

  // Trend data points for SVG Chart (chronological oldest to newest)
  const trendPoints = useMemo(() => {
    return [...metrics.testHistory].reverse();
  }, [metrics.testHistory]);

  const maxScorePossible = useMemo(() => {
    if (trendPoints.length === 0) return 100;
    return Math.max(...trendPoints.map((p) => p.totalMarks || 100), 100);
  }, [trendPoints]);

  if (!user && !loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <Header />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-200 p-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Student Authentication Required</h3>
            <p className="text-sm text-slate-600 mb-6">
              Sign in to unlock your personalized mathematics performance metrics, historical accuracy trendlines, and batch standings.
            </p>
            <button
              onClick={() => openAuthModal('login')}
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200"
            >
              Sign In to View Performance
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
        {/* Top Header Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-50 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold mb-3">
                <Activity className="w-3.5 h-3.5 text-indigo-600" />
                <span>Student Academic Analytics</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                My Performance
              </h1>
              <p className="text-slate-600 text-sm sm:text-base mt-1">
                Real-time assessment trajectory, accuracy breakdown, and cohort competitiveness for <span className="font-semibold text-slate-800">{userClass} • {userPrep}</span>.
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <Link
                href="/attendance"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 text-xs sm:text-sm font-bold transition-all border border-indigo-200 shadow-xs"
              >
                <CalendarCheck className="w-4 h-4 text-indigo-600" />
                <span>My Attendance</span>
              </Link>
              <Link
                href={`/leaderboard?class=${encodeURIComponent(userClass)}&prep=${encodeURIComponent(userPrep)}`}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs sm:text-sm font-bold transition-all border border-amber-200"
              >
                <Trophy className="w-4 h-4 text-amber-600" />
                <span>View Cohort Leaderboard</span>
              </Link>
              <Link
                href="/test-history"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold transition-all border border-slate-200"
              >
                <History className="w-4 h-4 text-slate-500" />
                <span>Test History</span>
              </Link>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mt-8 pt-8 border-t border-slate-100">
            {/* Rank */}
            <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-xs">
              <div className="flex items-center justify-between text-amber-400 mb-2">
                <Trophy className="w-5 h-5" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Cohort</span>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-amber-300">
                  {metrics.currentRank ? `#${metrics.currentRank}` : '—'}
                </div>
                <div className="text-xs text-slate-300 font-semibold mt-1">
                  Current Rank {metrics.totalCohortStudents ? `(${metrics.totalCohortStudents})` : ''}
                </div>
              </div>
            </div>

            {/* Total Tests */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-xs">
              <div className="text-indigo-600 mb-2">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900">
                  {metrics.totalTests}
                </div>
                <div className="text-xs text-slate-500 font-semibold mt-1">Tests Attempted</div>
              </div>
            </div>

            {/* Best Score */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-xs">
              <div className="text-emerald-600 mb-2">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-emerald-600">
                  {metrics.bestScore}
                </div>
                <div className="text-xs text-slate-500 font-semibold mt-1">Best Score</div>
              </div>
            </div>

            {/* Avg Score */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-xs">
              <div className="text-indigo-600 mb-2">
                <BarChart2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900">
                  {metrics.averageScore}
                </div>
                <div className="text-xs text-slate-500 font-semibold mt-1">Average Score</div>
              </div>
            </div>

            {/* Avg Percentage */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-xs">
              <div className="text-amber-500 mb-2">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900">
                  {metrics.averagePercentage}%
                </div>
                <div className="text-xs text-slate-500 font-semibold mt-1">Avg Percentage</div>
              </div>
            </div>

            {/* Avg Accuracy */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-xs">
              <div className="text-indigo-600 mb-2">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-indigo-700">
                  {metrics.averageAccuracy}%
                </div>
                <div className="text-xs text-slate-500 font-semibold mt-1">Avg Accuracy</div>
              </div>
            </div>
          </div>
        </div>

        {/* Answer Breakdown & Accuracy Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-3xl border border-emerald-100 p-6 shadow-xs flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <div className="text-3xl font-black text-emerald-700">{metrics.totalCorrect}</div>
              <div className="text-sm font-bold text-slate-800">Total Correct Answers</div>
              <p className="text-xs text-slate-500 mt-0.5">High precision across attempted questions</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-rose-100 p-6 shadow-xs flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
              <XCircle className="w-7 h-7" />
            </div>
            <div>
              <div className="text-3xl font-black text-rose-700">{metrics.totalWrong}</div>
              <div className="text-sm font-bold text-slate-800">Total Wrong Answers</div>
              <p className="text-xs text-slate-500 mt-0.5">Areas targeted for review & correction</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 border border-slate-200">
              <HelpCircle className="w-7 h-7" />
            </div>
            <div>
              <div className="text-3xl font-black text-slate-700">{metrics.totalUnanswered}</div>
              <div className="text-sm font-bold text-slate-800">Total Unanswered</div>
              <p className="text-xs text-slate-500 mt-0.5">Skipped to safeguard negative marking</p>
            </div>
          </div>
        </div>

        {/* Score & Accuracy Progression Trend Chart */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
                <span>Test Performance Trajectory</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Score progression and accuracy timeline across consecutive assessments
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-indigo-600 inline-block"></span>
                <span className="text-slate-700">Score</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
                <span className="text-slate-700">Accuracy %</span>
              </div>
            </div>
          </div>

          {trendPoints.length === 0 ? (
            <div className="py-16 text-center border border-dashed border-slate-200 rounded-2xl">
              <BarChart2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">No test trend data yet</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Attempt mock tests to start generating your personalized accuracy and score growth chart.
              </p>
              <Link
                href="/#tests-section"
                className="mt-4 inline-block px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition-colors"
              >
                Attempt First Test
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Responsive SVG Chart */}
              <div className="w-full overflow-x-auto">
                <div className="min-w-[600px] h-64 relative">
                  <svg className="w-full h-full" viewBox="0 0 600 240" preserveAspectRatio="none">
                    {/* Grid lines */}
                    <line x1="40" y1="20" x2="580" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="40" y1="75" x2="580" y2="75" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="40" y1="130" x2="580" y2="130" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="40" y1="185" x2="580" y2="185" stroke="#f1f5f9" strokeWidth="1" />

                    {/* Y-axis labels */}
                    <text x="30" y="24" fontSize="10" fill="#94a3b8" textAnchor="end">100%</text>
                    <text x="30" y="79" fontSize="10" fill="#94a3b8" textAnchor="end">75%</text>
                    <text x="30" y="134" fontSize="10" fill="#94a3b8" textAnchor="end">50%</text>
                    <text x="30" y="189" fontSize="10" fill="#94a3b8" textAnchor="end">25%</text>

                    {/* Plot Points & Lines */}
                    {(() => {
                      const count = trendPoints.length;
                      const stepX = count > 1 ? (540 / (count - 1)) : 270;
                      
                      const scoreCoords = trendPoints.map((item, i) => {
                        const x = count > 1 ? 40 + i * stepX : 300;
                        const pct = Math.min(100, Math.max(0, item.percentage || 0));
                        const y = 190 - (pct / 100) * 170;
                        return { x, y, item };
                      });

                      const accCoords = trendPoints.map((item, i) => {
                        const x = count > 1 ? 40 + i * stepX : 300;
                        const acc = Math.min(100, Math.max(0, item.accuracy || 0));
                        const y = 190 - (acc / 100) * 170;
                        return { x, y, item };
                      });

                      const scorePath = scoreCoords.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`).join(' ');
                      const accPath = accCoords.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`).join(' ');

                      return (
                        <>
                          {/* Accuracy Line (Emerald) */}
                          <path
                            d={accPath}
                            fill="none"
                            stroke="#10b981"
                            strokeWidth="2.5"
                            strokeDasharray="4 4"
                          />

                          {/* Score Line (Indigo) */}
                          <path
                            d={scorePath}
                            fill="none"
                            stroke="#4f46e5"
                            strokeWidth="3"
                          />

                          {/* Dots */}
                          {scoreCoords.map((pt, idx) => (
                            <g key={`score-${idx}`}>
                              <circle cx={pt.x} cy={pt.y} r="5" fill="#4f46e5" stroke="#ffffff" strokeWidth="2" />
                              <text x={pt.x} y={pt.y - 10} fontSize="11" fontWeight="bold" fill="#312e81" textAnchor="middle">
                                {pt.item.score}
                              </text>
                            </g>
                          ))}

                          {accCoords.map((pt, idx) => (
                            <g key={`acc-${idx}`}>
                              <circle cx={pt.x} cy={pt.y} r="4" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
                            </g>
                          ))}
                        </>
                      );
                    })()}
                  </svg>
                </div>
              </div>

              {/* Chronological Test Labels below chart */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {trendPoints.map((item, idx) => (
                  <Link
                    key={item.testId || idx}
                    href={`/test/${item.testId}/result`}
                    className="p-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-slate-50 transition-all text-left group"
                  >
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold mb-1">
                      <span>Test #{idx + 1}</span>
                      <span>Rank #{item.rank}</span>
                    </div>
                    <div className="text-xs font-bold text-slate-800 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                      {item.testTitle}
                    </div>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px]">
                      <span className="font-black text-indigo-700">{item.score}/{item.totalMarks}</span>
                      <span className="font-bold text-emerald-600">{item.accuracy}% Acc</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Learning Streak, XP & Achievements Section */}
        <GamificationSection />

        {/* Test Performance Detailed History Table */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Attempted Test Records</h2>
              <p className="text-xs text-slate-500 mt-0.5">Click any test to open its full evaluation and solution analysis</p>
            </div>
            <Link
              href="/#tests-section"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              <span>Explore More Tests</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {metrics.testHistory.length === 0 ? (
            <div className="p-10 text-center text-slate-500 text-xs">
              No test attempts found. Complete your first test to see detailed history.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                    <th className="py-3.5 px-4">Test Title</th>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4 text-center">Cohort Rank</th>
                    <th className="py-3.5 px-4 text-right">Score</th>
                    <th className="py-3.5 px-4 text-right">Percentage</th>
                    <th className="py-3.5 px-4 text-right">Accuracy</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                  {metrics.testHistory.map((item) => (
                    <tr key={item.testId} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{item.testTitle}</div>
                        <div className="text-[11px] text-slate-400">ID: {item.testId}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 text-xs">
                        {new Date(item.date).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-block px-2.5 py-1 rounded-full text-xs font-black bg-amber-50 text-amber-900 border border-amber-200">
                          #{item.rank} of {item.totalInCohort}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-black text-indigo-700">
                        {item.score} <span className="text-slate-400 font-normal">/{item.totalMarks}</span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-800">
                        {item.percentage}%
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className={`font-bold ${
                          item.accuracy >= 80 ? 'text-emerald-600' : 'text-slate-700'
                        }`}>
                          {item.accuracy}%
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/test/${item.testId}/result`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition-colors"
                        >
                          <span>Review</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
