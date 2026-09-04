'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { database, TestData, TestAttemptData } from '@/lib/firebase';
import { ref, onValue, set, get } from 'firebase/database';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import {
  ClipboardList,
  Clock,
  Award,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  ArrowRight,
  Sparkles,
  HelpCircle,
  GraduationCap,
  ChevronRight,
  ShieldCheck,
  BarChart2,
  Trophy,
  TrendingUp,
  History
} from 'lucide-react';

const SEED_DEFAULT_TESTS: Omit<TestData, 'id'>[] = [
  {
    title: 'JEE Advanced Master Drill: Calculus & Coordinate Geometry',
    description: 'Comprehensive test covering Definite Integrals, Maxima & Minima, Tangents & Normals to Parabola, and Conic Section Locus problems with standard JEE Advanced marking scheme (+4, -1).',
    class: 'Class 12',
    preparation: 'JEE',
    duration: 60,
    totalMarks: 20,
    marksPerQuestion: 4,
    negativeMark: 1,
    active: true,
    createdAt: Date.now() - 86400000 * 2,
    questions: {
      q1: {
        id: 'q1',
        questionText: 'Find the maximum value of f(x) = (1/x)^x for x > 0.',
        options: {
          A: 'e^(1/e)',
          B: 'e^e',
          C: '(1/e)^e',
          D: '1'
        },
        correctAnswer: 'A',
        marks: 4,
        negativeMarks: 1
      },
      q2: {
        id: 'q2',
        questionText: 'The value of the definite integral ∫[0 to π/2] (sin x / (sin x + cos x)) dx is equal to:',
        options: {
          A: 'π',
          B: 'π/2',
          C: 'π/4',
          D: '0'
        },
        correctAnswer: 'C',
        marks: 4,
        negativeMarks: 1
      },
      q3: {
        id: 'q3',
        questionText: 'The locus of the point of intersection of perpendicular tangents to the parabola y^2 = 4ax is:',
        options: {
          A: 'Directrix: x + a = 0',
          B: 'Axis: y = 0',
          C: 'Tangent at vertex: x = 0',
          D: 'Latus Rectum: x - a = 0'
        },
        correctAnswer: 'A',
        marks: 4,
        negativeMarks: 1
      },
      q4: {
        id: 'q4',
        questionText: 'If A and B are square matrices of order 3 such that |A| = 3 and |B| = 2, then |2 A B^(-1)| is equal to:',
        options: {
          A: '12',
          B: '24',
          C: '3/2',
          D: '48'
        },
        correctAnswer: 'A',
        marks: 4,
        negativeMarks: 1
      },
      q5: {
        id: 'q5',
        questionText: 'The differential equation of all circles passing through the origin and having their centres on the x-axis has degree and order respectively:',
        options: {
          A: 'Order 1, Degree 2',
          B: 'Order 1, Degree 1',
          C: 'Order 2, Degree 1',
          D: 'Order 2, Degree 2'
        },
        correctAnswer: 'B',
        marks: 4,
        negativeMarks: 1
      }
    }
  },
  {
    title: 'Class 12 Board Benchmark: Matrices, Determinants & Relations',
    description: 'Targeted CBSE board mock exam testing properties of symmetric/skew-symmetric matrices, matrix inversion solving 3x3 equations, and equivalence relation proofs.',
    class: 'Class 12',
    preparation: 'Board',
    duration: 45,
    totalMarks: 16,
    marksPerQuestion: 4,
    negativeMark: 0,
    active: true,
    createdAt: Date.now() - 86400000,
    questions: {
      q1: {
        id: 'q1',
        questionText: 'If A is a square matrix of order 3x3 such that |adj(A)| = 64, then the determinant |A| can be:',
        options: {
          A: '±8',
          B: '±4',
          C: '64',
          D: '16'
        },
        correctAnswer: 'A',
        marks: 4,
        negativeMarks: 0
      },
      q2: {
        id: 'q2',
        questionText: 'A relation R on the set A = {1, 2, 3} given by R = {(1,1), (2,2), (3,3), (1,2), (2,1)} is:',
        options: {
          A: 'Reflexive and Transitive only',
          B: 'Equivalence Relation',
          C: 'Symmetric and Transitive but not Reflexive',
          D: 'Reflexive and Symmetric but not Transitive'
        },
        correctAnswer: 'B',
        marks: 4,
        negativeMarks: 0
      },
      q3: {
        id: 'q3',
        questionText: 'If A is a skew-symmetric matrix of odd order n, then the determinant |A| is always:',
        options: {
          A: '1',
          B: '-1',
          C: '0',
          D: 'Undefined'
        },
        correctAnswer: 'C',
        marks: 4,
        negativeMarks: 0
      },
      q4: {
        id: 'q4',
        questionText: 'The principal value of sin⁻¹(sin(2π/3)) is equal to:',
        options: {
          A: '2π/3',
          B: 'π/3',
          C: '-π/3',
          D: 'π/6'
        },
        correctAnswer: 'B',
        marks: 4,
        negativeMarks: 0
      }
    }
  },
  {
    title: 'Class 11 Foundation: Trigonometric Functions & Compound Angles',
    description: 'Practice test evaluating fundamental compound angle identities, trigonometric equations in standard intervals, and basic transformations for Class 11.',
    class: 'Class 11',
    preparation: 'Board',
    duration: 30,
    totalMarks: 12,
    marksPerQuestion: 4,
    negativeMark: 0,
    active: true,
    createdAt: Date.now() - 3600000 * 10,
    questions: {
      q1: {
        id: 'q1',
        questionText: 'The value of cos(15°) - sin(15°) is equal to:',
        options: {
          A: '1 / √2',
          B: '√3 / 2',
          C: '1 / 2',
          D: '0'
        },
        correctAnswer: 'A',
        marks: 4,
        negativeMarks: 0
      },
      q2: {
        id: 'q2',
        questionText: 'If tan(A) = 1/2 and tan(B) = 1/3, then the value of (A + B) is:',
        options: {
          A: 'π/6',
          B: 'π/4',
          C: 'π/3',
          D: 'π/2'
        },
        correctAnswer: 'B',
        marks: 4,
        negativeMarks: 0
      },
      q3: {
        id: 'q3',
        questionText: 'The range of the function f(x) = 3 sin(x) + 4 cos(x) is:',
        options: {
          A: '[-5, 5]',
          B: '[-7, 7]',
          C: '[0, 5]',
          D: '[-1, 1]'
        },
        correctAnswer: 'A',
        marks: 4,
        negativeMarks: 0
      }
    }
  },
  {
    title: 'JEE Main Drill: Straight Lines, Circles & Conics',
    description: 'High-yield coordinate geometry practice covering distance of point from line, family of lines, orthogonality of circles, and tangent conditions.',
    class: 'Class 11',
    preparation: 'JEE',
    duration: 45,
    totalMarks: 16,
    marksPerQuestion: 4,
    negativeMark: 1,
    active: true,
    createdAt: Date.now() - 86400000 * 4,
    questions: {
      q1: {
        id: 'q1',
        questionText: 'The distance between the parallel lines 3x + 4y - 9 = 0 and 6x + 8y + 15 = 0 is:',
        options: {
          A: '33/10',
          B: '6/5',
          C: '33/5',
          D: '24/10'
        },
        correctAnswer: 'A',
        marks: 4,
        negativeMarks: 1
      },
      q2: {
        id: 'q2',
        questionText: 'The line y = mx + c touches the circle x^2 + y^2 = a^2 if and only if:',
        options: {
          A: 'c^2 = a^2 (1 + m^2)',
          B: 'c^2 = a^2 (1 - m^2)',
          C: 'c = a m',
          D: 'c^2 = a (1 + m)'
        },
        correctAnswer: 'A',
        marks: 4,
        negativeMarks: 1
      },
      q3: {
        id: 'q3',
        questionText: 'The angle between the lines joining the origin to the points of intersection of the line y = 3x + 2 and the curve x^2 + 2xy + 3y^2 + 4x + 8y - 11 = 0 can be obtained by homogenization of degree:',
        options: {
          A: '1',
          B: '2',
          C: '3',
          D: '0'
        },
        correctAnswer: 'B',
        marks: 4,
        negativeMarks: 1
      },
      q4: {
        id: 'q4',
        questionText: 'Eccentricity of the rectangular hyperbola x^2 - y^2 = a^2 is always equal to:',
        options: {
          A: '1',
          B: '√2',
          C: '2',
          D: '√3'
        },
        correctAnswer: 'B',
        marks: 4,
        negativeMarks: 1
      }
    }
  }
];

export default function TestsSection() {
  const { user, userData, openAuthModal } = useAuth();

  const [testsList, setTestsList] = useState<TestData[]>([]);
  const [attemptsMap, setAttemptsMap] = useState<Record<string, TestAttemptData>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState<'All' | 'Class 11' | 'Class 12'>('All');
  const [selectedPrep, setSelectedPrep] = useState<'All' | 'Board' | 'JEE'>('All');
  const [selectedStatus, setSelectedStatus] = useState<'All' | 'Attempted' | 'Not Attempted'>('All');

  const userPrefAppliedRef = useRef(false);

  // 1. Listen to Tests and seed if empty
  useEffect(() => {
    const testsRef = ref(database, 'tests');

    const unsubscribe = onValue(
      testsRef,
      async (snapshot) => {
        if (!snapshot.exists()) {
          // Seed default mock tests
          try {
            const seedPromises = SEED_DEFAULT_TESTS.map((testData) => {
              const newRef = ref(database, `tests/seed_${testData.class.replace(/\s+/g, '')}_${testData.preparation}_${Math.random().toString(36).substring(2, 7)}`);
              return set(newRef, {
                ...testData,
                id: newRef.key
              });
            });
            await Promise.all(seedPromises);
          } catch (seedErr) {
            console.error('Error seeding initial test data:', seedErr);
          }
          setLoading(false);
          return;
        }

        const data = snapshot.val();
        const testsArray: TestData[] = Object.keys(data).map((key) => {
          const item = data[key];
          const questionsCount = item.questions ? Object.keys(item.questions).length : 0;
          return {
            id: key,
            title: item.title || 'Untitled Test',
            description: item.description || '',
            class: item.class || 'Class 11',
            preparation: item.preparation || 'Board',
            duration: Number(item.duration || 60),
            totalMarks: Number(item.totalMarks || (questionsCount * (item.marksPerQuestion || 4))),
            marksPerQuestion: Number(item.marksPerQuestion || 4),
            negativeMark: Number(item.negativeMark || 0),
            startTime: item.startTime || null,
            endTime: item.endTime || null,
            active: item.active !== false,
            allowMultipleAttempts: Boolean(item.allowMultipleAttempts),
            questions: item.questions || {},
            questionsCount,
            createdAt: item.createdAt || Date.now(),
            updatedAt: item.updatedAt
          };
        });

        // Filter active tests for students, sorted by newest
        testsArray.sort((a, b) => b.createdAt - a.createdAt);
        setTestsList(testsArray);
        setLoading(false);
      },
      (err) => {
        console.error('Firebase tests error:', err);
        setError('Failed to sync test data.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // 2. Fetch User Attempts if logged in
  useEffect(() => {
    if (!user) {
      setTimeout(() => {
        setAttemptsMap({});
      }, 0);
      return;
    }

    // Read attempts for current user
    const attemptsRef = ref(database, 'testAttempts');
    const unsub = onValue(attemptsRef, (snapshot) => {
      if (!snapshot.exists()) {
        setAttemptsMap({});
        return;
      }
      const data = snapshot.val();
      const userAttempts: Record<string, TestAttemptData> = {};

      Object.keys(data).forEach((testId) => {
        if (data[testId] && data[testId][user.uid]) {
          userAttempts[testId] = data[testId][user.uid];
        }
      });

      setAttemptsMap(userAttempts);
    });

    return () => unsub();
  }, [user]);

  // Apply user profile preferences on initial load
  useEffect(() => {
    if (userData && !userPrefAppliedRef.current) {
      userPrefAppliedRef.current = true;
      const defaultClass = userData.class;
      const defaultPrep = userData.preparation;
      setTimeout(() => {
        if (defaultClass === 'Class 11' || defaultClass === 'Class 12') {
          setSelectedClass(defaultClass);
        }
        if (defaultPrep === 'Board' || defaultPrep === 'JEE') {
          setSelectedPrep(defaultPrep);
        }
      }, 0);
    }
  }, [userData]);

  // Filtered tests
  const filteredTests = useMemo(() => {
    return testsList.filter((test) => {
      if (!test.active) return false;

      // Class filter
      if (selectedClass !== 'All' && test.class !== selectedClass) return false;

      // Preparation filter
      if (selectedPrep !== 'All' && test.preparation !== selectedPrep) return false;

      // Status filter
      const isAttempted = Boolean(attemptsMap[test.id]);
      if (selectedStatus === 'Attempted' && !isAttempted) return false;
      if (selectedStatus === 'Not Attempted' && isAttempted) return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const titleMatch = test.title.toLowerCase().includes(query);
        const descMatch = test.description.toLowerCase().includes(query);
        return titleMatch || descMatch;
      }

      return true;
    });
  }, [testsList, selectedClass, selectedPrep, selectedStatus, searchQuery, attemptsMap]);

  return (
    <section 
      id="tests-section" 
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 scroll-mt-20"
      aria-label="Tests & Examination Engine"
    >
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-3">
            <ClipboardList className="w-3.5 h-3.5 text-indigo-600" />
            <span>Real-time Examination Engine</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Mock Tests & Benchmark Series
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl">
            Simulate exact board examination patterns and rigorous timed JEE Advanced problem sets with real-time scoring, accuracy analysis, and comprehensive solutions.
          </p>
        </div>

        {/* Cohort & Quick Actions */}
        <div className="flex items-center gap-2.5 flex-wrap self-start md:self-auto">
          {userData?.class && (
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200/80 shadow-xs">
              <GraduationCap className="w-4 h-4 text-indigo-600" />
              <span className="text-xs text-slate-700">Enrolled In:</span>
              <span className="text-xs font-bold text-slate-900">{userData.class} • {userData.preparation || 'General'}</span>
            </div>
          )}

          <Link
            href="/leaderboard"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold transition-colors shadow-xs"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-600" />
            <span>Leaderboard</span>
          </Link>

          <Link
            href="/performance"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-100 text-xs font-bold transition-colors shadow-xs"
          >
            <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
            <span>My Performance</span>
          </Link>

          <Link
            href="/test-history"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold transition-colors shadow-xs"
          >
            <History className="w-3.5 h-3.5 text-slate-500" />
            <span>History</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 sm:p-5 mb-8 space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="tests-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tests by title, topic, or syllabus..."
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all placeholder:text-slate-400 bg-slate-50/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Filter Selectors */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Class Filter */}
            <div className="flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-semibold">
              {(['All', 'Class 11', 'Class 12'] as const).map((cls) => (
                <button
                  key={cls}
                  onClick={() => setSelectedClass(cls)}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    selectedClass === cls
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {cls}
                </button>
              ))}
            </div>

            {/* Preparation Filter */}
            <div className="flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-semibold">
              {(['All', 'Board', 'JEE'] as const).map((prep) => (
                <button
                  key={prep}
                  onClick={() => setSelectedPrep(prep)}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    selectedPrep === prep
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {prep}
                </button>
              ))}
            </div>

            {/* Status Filter */}
            {user && (
              <div className="flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-semibold">
                {(['All', 'Attempted', 'Not Attempted'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setSelectedStatus(st)}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      selectedStatus === st
                        ? 'bg-white text-indigo-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tests Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse space-y-4">
              <div className="h-5 bg-slate-200 rounded w-1/3"></div>
              <div className="h-6 bg-slate-200 rounded w-3/4"></div>
              <div className="h-14 bg-slate-100 rounded w-full"></div>
              <div className="h-10 bg-slate-200 rounded w-full"></div>
            </div>
          ))}
        </div>
      ) : filteredTests.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
            <ClipboardList className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800 mb-1">No Tests Match Your Criteria</h3>
          <p className="text-xs text-slate-500 mb-4">
            Try adjusting your search terms or toggling between Class 11 and Class 12 or Board and JEE tracks.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedClass('All');
              setSelectedPrep('All');
              setSelectedStatus('All');
            }}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTests.map((test) => {
            const attempt = attemptsMap[test.id];
            const isAttempted = Boolean(attempt);
            const questionsCount = test.questionsCount || (test.questions ? Object.keys(test.questions).length : 0);

            return (
              <div
                key={test.id}
                className="bg-white rounded-2xl border border-slate-200/80 hover:border-indigo-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
              >
                <div className="p-6 space-y-4">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        test.class === 'Class 12'
                          ? 'bg-purple-50 text-purple-700 border border-purple-100'
                          : 'bg-blue-50 text-blue-700 border border-blue-100'
                      }`}>
                        {test.class}
                      </span>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        test.preparation === 'JEE'
                          ? 'bg-amber-50 text-amber-700 border border-amber-100'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                      }`}>
                        {test.preparation}
                      </span>
                    </div>

                    {/* Attempt Status Badge */}
                    {isAttempted ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Score: {attempt.score}/{attempt.totalMarks}</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600">
                        Not Attempted
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-700 transition-colors line-clamp-2">
                      {test.title}
                    </h3>
                    <p className="mt-1.5 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {test.description}
                    </p>
                  </div>

                  {/* Test Specs Strip */}
                  <div className="grid grid-cols-3 gap-2 py-3 px-3.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
                    <div>
                      <div className="text-[11px] font-medium text-slate-500">Questions</div>
                      <div className="text-sm font-black text-slate-800">{questionsCount}</div>
                    </div>
                    <div>
                      <div className="text-[11px] font-medium text-slate-500">Duration</div>
                      <div className="text-sm font-black text-slate-800 flex items-center justify-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{test.duration}m</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] font-medium text-slate-500">Total Marks</div>
                      <div className="text-sm font-black text-indigo-700">{test.totalMarks}</div>
                    </div>
                  </div>

                  {/* Marking Scheme Info */}
                  <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                    <span>Marking: <strong className="text-emerald-700 font-bold">+{test.marksPerQuestion}</strong> / <strong className="text-rose-600 font-bold">-{test.negativeMark}</strong></span>
                    {test.allowMultipleAttempts && (
                      <span className="text-[11px] text-indigo-600 font-medium">Multiple Attempts</span>
                    )}
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center gap-2">
                  {isAttempted ? (
                    <>
                      <Link
                        href={`/test/${test.id}/result`}
                        className="flex-1 py-2.5 px-4 rounded-xl bg-white border border-slate-200 hover:border-indigo-300 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs"
                      >
                        <BarChart2 className="w-4 h-4 text-indigo-600" />
                        <span>View Result ({attempt.percentage}%)</span>
                      </Link>

                      {test.allowMultipleAttempts && (
                        <Link
                          href={`/test/${test.id}`}
                          className="py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                        >
                          <span>Retake</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      )}
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        if (!user) {
                          openAuthModal('login');
                        } else {
                          window.location.href = `/test/${test.id}`;
                        }
                      }}
                      className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs shadow-indigo-200 transition-all group-hover:scale-[1.01]"
                    >
                      <span>Start Test</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
