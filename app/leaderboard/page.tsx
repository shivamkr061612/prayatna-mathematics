'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { useAuth } from '@/context/AuthContext';
import { database } from '@/lib/firebase';
import { ref, onValue } from 'firebase/database';
import { calculateLeaderboard, AttemptItem, LeaderboardStudent } from '@/lib/rankings';
import {
  Trophy,
  Medal,
  Award,
  Search,
  Users,
  Target,
  BarChart2,
  Clock,
  ArrowUpDown,
  Filter,
  Flame,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  TrendingUp,
  User as UserIcon,
  ShieldAlert
} from 'lucide-react';

function LeaderboardContent() {
  const searchParams = useSearchParams();
  const { user, userData, openAuthModal } = useAuth();

  // Filters
  const initialClass = searchParams.get('class') === 'Class 12' ? 'Class 12' : 'Class 11';
  const initialPrep = searchParams.get('prep') === 'JEE' ? 'JEE' : 'Board';

  const [selectedClass, setSelectedClass] = useState<'Class 11' | 'Class 12'>(() => {
    const fromUrl = searchParams.get('class');
    if (fromUrl === 'Class 12') return 'Class 12';
    return 'Class 11';
  });
  const [selectedPrep, setSelectedPrep] = useState<'Board' | 'JEE'>(() => {
    const fromUrl = searchParams.get('prep');
    if (fromUrl === 'JEE') return 'JEE';
    return 'Board';
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [rawAttempts, setRawAttempts] = useState<AttemptItem[]>([]);

  // Real-time listener on Firebase testAttempts
  useEffect(() => {
    const attemptsRef = ref(database, 'testAttempts');

    const unsubscribe = onValue(attemptsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val() || {};
        const flattened: AttemptItem[] = [];

        // format: testAttempts[testId][userId] = attempt
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
      console.error('Error loading test attempts for leaderboard:', err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Compute leaderboard for current active cohort
  const cohortLeaderboard = useMemo(() => {
    return calculateLeaderboard(rawAttempts, selectedClass, selectedPrep);
  }, [rawAttempts, selectedClass, selectedPrep]);

  // Filter by search query
  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return cohortLeaderboard;
    const query = searchQuery.toLowerCase().trim();
    return cohortLeaderboard.filter((s) => {
      return (
        s.name.toLowerCase().includes(query) ||
        s.email.toLowerCase().includes(query) ||
        `#${s.rank}`.includes(query)
      );
    });
  }, [cohortLeaderboard, searchQuery]);

  // Identify current user's position in this cohort
  const currentUserEntry = useMemo(() => {
    if (!user) return null;
    return cohortLeaderboard.find((s) => s.userId === user.uid) || null;
  }, [cohortLeaderboard, user]);

  // Top 3 Podium
  const top1 = cohortLeaderboard[0] || null;
  const top2 = cohortLeaderboard[1] || null;
  const top3 = cohortLeaderboard[2] || null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8 pb-24 sm:pb-28">
        {/* Page Hero Title */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-50 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold mb-3">
                <Trophy className="w-3.5 h-3.5 text-amber-600" />
                <span>Authoritative Batch Rankings</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Academic Hall of Fame
              </h1>
              <p className="text-slate-600 text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
                Live rankings calculated strictly among peers in the same class and preparation track. Tie-breakers evaluate accuracy, solve speed, and submission chronology.
              </p>
            </div>

            {/* Quick Stats or Links */}
            <div className="flex items-center gap-3 w-full lg:w-auto">
              <Link
                href="/performance"
                className="flex-1 lg:flex-none inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs sm:text-sm font-bold transition-all border border-indigo-100 shadow-xs"
              >
                <TrendingUp className="w-4 h-4" />
                <span>My Performance</span>
              </Link>
              <Link
                href="/test-history"
                className="flex-1 lg:flex-none inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold transition-all border border-slate-200 shadow-xs"
              >
                <BarChart2 className="w-4 h-4 text-slate-500" />
                <span>My Test History</span>
              </Link>
            </div>
          </div>

          {/* Cohort Selector Tabs (4 Distinct Cohorts) */}
          <div className="mt-8 pt-8 border-t border-slate-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full md:w-auto">
              <button
                onClick={() => {
                  setSelectedClass('Class 11');
                  setSelectedPrep('Board');
                }}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                  selectedClass === 'Class 11' && selectedPrep === 'Board'
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>11th Board</span>
              </button>

              <button
                onClick={() => {
                  setSelectedClass('Class 11');
                  setSelectedPrep('JEE');
                }}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                  selectedClass === 'Class 11' && selectedPrep === 'JEE'
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>11th JEE</span>
              </button>

              <button
                onClick={() => {
                  setSelectedClass('Class 12');
                  setSelectedPrep('Board');
                }}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                  selectedClass === 'Class 12' && selectedPrep === 'Board'
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>12th Board</span>
              </button>

              <button
                onClick={() => {
                  setSelectedClass('Class 12');
                  setSelectedPrep('JEE');
                }}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                  selectedClass === 'Class 12' && selectedPrep === 'JEE'
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>12th JEE</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search student or rank..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
              />
            </div>
          </div>
        </div>

        {/* Highlight Current Student Standings Banner */}
        {user && currentUserEntry ? (
          <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 rounded-2xl p-5 sm:p-6 text-white shadow-md flex flex-col md:flex-row items-center justify-between gap-6 border border-indigo-800">
            <div className="flex items-center gap-4 text-center md:text-left">
              {currentUserEntry.photoURL ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={currentUserEntry.photoURL}
                  alt={currentUserEntry.name}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-400 shadow-md shrink-0"
                />
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-amber-400 text-slate-950 font-black text-xl flex items-center justify-center shrink-0">
                  {currentUserEntry.name ? currentUserEntry.name.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
              <div>
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                    Your Current Standing
                  </span>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-800 text-indigo-200">
                    {selectedClass} • {selectedPrep}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white mt-0.5">
                  Rank <span className="text-amber-300">#{currentUserEntry.rank}</span> of {cohortLeaderboard.length} Candidates
                </h3>
                <p className="text-xs text-indigo-200 mt-1">
                  Keep taking mock assessments to boost your cumulative score and accuracy standing.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-6 text-center">
              <div className="bg-white/10 px-4 py-2.5 rounded-xl border border-white/10">
                <div className="text-[11px] text-slate-300 font-medium">Total Score</div>
                <div className="text-lg font-black text-amber-300">{currentUserEntry.totalScore}</div>
              </div>
              <div className="bg-white/10 px-4 py-2.5 rounded-xl border border-white/10">
                <div className="text-[11px] text-slate-300 font-medium">Accuracy</div>
                <div className="text-lg font-black text-white">{currentUserEntry.averageAccuracy}%</div>
              </div>
              <div className="bg-white/10 px-4 py-2.5 rounded-xl border border-white/10">
                <div className="text-[11px] text-slate-300 font-medium">Tests Taken</div>
                <div className="text-lg font-black text-white">{currentUserEntry.testsAttempted}</div>
              </div>
            </div>
          </div>
        ) : user ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-5 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">You haven&apos;t taken a test in {selectedClass} • {selectedPrep} yet</p>
                <p className="text-xs text-slate-500">Attempt a mock test to secure your official rank on this leaderboard.</p>
              </div>
            </div>
            <Link
              href="/#tests-section"
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition-colors shrink-0"
            >
              Take a Mock Test
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-5 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-slate-900">Sign in to see where you rank</p>
              <p className="text-xs text-slate-500">Track your standing against the entire Prayatna batch.</p>
            </div>
            <button
              onClick={() => openAuthModal('login')}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition-colors shrink-0"
            >
              Sign In
            </button>
          </div>
        )}

        {/* Podium Top 3 (if at least 1 student) */}
        {!searchQuery && cohortLeaderboard.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            {/* Rank 2 (Silver) */}
            {top2 && (
              <div className="order-2 md:order-1 bg-white rounded-3xl border border-slate-200 p-6 flex flex-col items-center text-center relative shadow-xs hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 font-extrabold text-sm flex items-center justify-center mb-3 border border-slate-200">
                  🥈 #2
                </div>
                {top2.photoURL ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={top2.photoURL}
                    alt={top2.name}
                    className="w-16 h-16 rounded-2xl object-cover mb-3 border-2 border-slate-200"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-700 font-black text-xl flex items-center justify-center mb-3">
                    {top2.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <h3 className="text-base font-extrabold text-slate-900 line-clamp-1">{top2.name}</h3>
                <span className="text-[11px] font-semibold text-slate-500">{top2.class} • {top2.preparation}</span>
                <div className="mt-4 pt-3 border-t border-slate-100 w-full flex items-center justify-around text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold">TOTAL SCORE</span>
                    <span className="text-indigo-700 font-black text-base">{top2.totalScore}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold">ACCURACY</span>
                    <span className="text-slate-800 font-black text-base">{top2.averageAccuracy}%</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold">TESTS</span>
                    <span className="text-slate-800 font-black text-base">{top2.testsAttempted}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Rank 1 (Gold) */}
            {top1 && (
              <div className="order-1 md:order-2 bg-gradient-to-b from-amber-50/80 to-white rounded-3xl border-2 border-amber-300 p-6 sm:p-7 flex flex-col items-center text-center relative shadow-md scale-100 md:-translate-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-slate-950 font-black text-xs mb-3 shadow-xs">
                  🥇 TOP PERFORMER
                </div>
                {top1.photoURL ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={top1.photoURL}
                    alt={top1.name}
                    className="w-20 h-20 rounded-2xl object-cover mb-3 border-4 border-amber-400 shadow-md"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-amber-400 text-slate-950 font-black text-2xl flex items-center justify-center mb-3 shadow-md">
                    {top1.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <h3 className="text-lg font-black text-slate-900 line-clamp-1">{top1.name}</h3>
                <span className="text-xs font-bold text-amber-900">{top1.class} • {top1.preparation}</span>
                <div className="mt-4 pt-3 border-t border-amber-200/60 w-full flex items-center justify-around text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px] font-extrabold">TOTAL SCORE</span>
                    <span className="text-indigo-700 font-black text-xl">{top1.totalScore}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] font-extrabold">ACCURACY</span>
                    <span className="text-slate-900 font-black text-xl">{top1.averageAccuracy}%</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] font-extrabold">TESTS</span>
                    <span className="text-slate-900 font-black text-xl">{top1.testsAttempted}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Rank 3 (Bronze) */}
            {top3 && (
              <div className="order-3 md:order-3 bg-white rounded-3xl border border-slate-200 p-6 flex flex-col items-center text-center relative shadow-xs hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-800 font-extrabold text-sm flex items-center justify-center mb-3 border border-amber-200">
                  🥉 #3
                </div>
                {top3.photoURL ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={top3.photoURL}
                    alt={top3.name}
                    className="w-16 h-16 rounded-2xl object-cover mb-3 border-2 border-amber-200"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-800 font-black text-xl flex items-center justify-center mb-3">
                    {top3.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <h3 className="text-base font-extrabold text-slate-900 line-clamp-1">{top3.name}</h3>
                <span className="text-[11px] font-semibold text-slate-500">{top3.class} • {top3.preparation}</span>
                <div className="mt-4 pt-3 border-t border-slate-100 w-full flex items-center justify-around text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold">TOTAL SCORE</span>
                    <span className="text-indigo-700 font-black text-base">{top3.totalScore}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold">ACCURACY</span>
                    <span className="text-slate-800 font-black text-base">{top3.averageAccuracy}%</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold">TESTS</span>
                    <span className="text-slate-800 font-black text-base">{top3.testsAttempted}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Full Leaderboard Table */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Complete Cohort Table ({selectedClass} • {selectedPrep})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Priority: Score &gt; Accuracy &gt; Time Taken &gt; Submission Timestamp
              </p>
            </div>
            <div className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
              {filteredStudents.length} Students
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="w-10 h-10 border-3 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-xs text-slate-500 font-medium">Loading Prayatna leaderboard standings...</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">No student attempts recorded in this cohort yet</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Be the first student to complete a test in {selectedClass} • {selectedPrep} to claim the #1 spot!
              </p>
              <div className="mt-4">
                <Link
                  href="/#tests-section"
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition-colors inline-block"
                >
                  Start a Test
                </Link>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                    <th className="py-3.5 px-4 text-center w-16">Rank</th>
                    <th className="py-3.5 px-4">Student</th>
                    <th className="py-3.5 px-4 text-center">Batch</th>
                    <th className="py-3.5 px-4 text-right">Tests</th>
                    <th className="py-3.5 px-4 text-right">Avg Score</th>
                    <th className="py-3.5 px-4 text-right">Accuracy</th>
                    <th className="py-3.5 px-4 text-right">Total Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                  {filteredStudents.map((student) => {
                    const isCurrentUser = user && student.userId === user.uid;

                    let rankBadge = (
                      <span className="font-mono font-bold text-slate-600">#{student.rank}</span>
                    );
                    if (student.rank === 1) {
                      rankBadge = <span className="text-base" title="Gold">🥇 #1</span>;
                    } else if (student.rank === 2) {
                      rankBadge = <span className="text-base" title="Silver">🥈 #2</span>;
                    } else if (student.rank === 3) {
                      rankBadge = <span className="text-base" title="Bronze">🥉 #3</span>;
                    }

                    return (
                      <tr
                        key={student.userId}
                        className={`transition-colors ${
                          isCurrentUser
                            ? 'bg-indigo-50/70 font-semibold text-indigo-950 hover:bg-indigo-50'
                            : 'hover:bg-slate-50 text-slate-800'
                        }`}
                      >
                        <td className="py-3.5 px-4 text-center">{rankBadge}</td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            {student.photoURL ? (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img
                                src={student.photoURL}
                                alt={student.name}
                                className="w-9 h-9 rounded-xl object-cover border border-slate-200 shrink-0"
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                                {student.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                <span>{student.name}</span>
                                {isCurrentUser && (
                                  <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-indigo-600 text-white">
                                    YOU
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-slate-400 font-normal">
                                {student.email.slice(0, 3)}***@{student.email.split('@')[1] || 'student.com'}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                            {student.class} • {student.preparation}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-medium text-slate-600">
                          {student.testsAttempted}
                        </td>
                        <td className="py-3.5 px-4 text-right font-medium text-slate-600">
                          {student.averageScore}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <span className={`font-bold ${
                            student.averageAccuracy >= 80
                              ? 'text-emerald-600'
                              : student.averageAccuracy >= 60
                              ? 'text-amber-600'
                              : 'text-slate-600'
                          }`}>
                            {student.averageAccuracy}%
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-black text-indigo-700 text-sm sm:text-base">
                          {student.totalScore}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}

export default function LeaderboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-10 h-10 border-3 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    }>
      <LeaderboardContent />
    </Suspense>
  );
}
