'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import { useAuth } from '@/context/AuthContext';
import { database } from '@/lib/firebase';
import { ref, onValue } from 'firebase/database';
import { calculateTestRankings, AttemptItem } from '@/lib/rankings';
import {
  History,
  Trophy,
  Award,
  Clock,
  CheckCircle2,
  XCircle,
  BarChart2,
  ArrowRight,
  Search,
  RotateCcw,
  ShieldCheck,
  Eye,
  Filter,
  FileCheck2
} from 'lucide-react';

interface HistoryItem {
  testId: string;
  testTitle: string;
  studentClass: string;
  studentPreparation: string;
  score: number;
  totalMarks: number;
  percentage: number;
  accuracy: number;
  timeTaken: number;
  submittedAt: number;
  rank: number;
  totalInCohort: number;
}

export default function TestHistoryPage() {
  const { user, userData, openAuthModal } = useAuth();
  const [loading, setLoading] = useState(true);
  const [historyList, setHistoryList] = useState<HistoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTrack, setFilterTrack] = useState<string>('All');

  useEffect(() => {
    if (!user) {
      const timer = setTimeout(() => setLoading(false), 0);
      return () => clearTimeout(timer);
    }

    const attemptsRef = ref(database, 'testAttempts');

    const unsubscribe = onValue(attemptsRef, (snapshot) => {
      if (snapshot.exists()) {
        const allData = snapshot.val() || {};
        const items: HistoryItem[] = [];

        Object.keys(allData).forEach((testId) => {
          const testAttempts = allData[testId] || {};
          const userAttempt = testAttempts[user.uid];

          if (userAttempt) {
            // Calculate ranking for this specific test
            const cohortList: AttemptItem[] = Object.values(testAttempts);
            const sClass = userAttempt.studentClass || userAttempt.userClass || userData?.class || 'Class 11';
            const sPrep = userAttempt.studentPreparation || userAttempt.userPreparation || userData?.preparation || 'Board';
            const rankRes = calculateTestRankings(cohortList, sClass, sPrep, user.uid);

            items.push({
              testId,
              testTitle: userAttempt.testTitle || 'Mathematics Assessment',
              studentClass: sClass,
              studentPreparation: sPrep,
              score: userAttempt.score || 0,
              totalMarks: userAttempt.totalMarks || 100,
              percentage: userAttempt.percentage || 0,
              accuracy: userAttempt.accuracy || 0,
              timeTaken: userAttempt.timeTaken || 0,
              submittedAt: userAttempt.submittedAt || Date.now(),
              rank: rankRes.userRank,
              totalInCohort: rankRes.totalInCohort
            });
          }
        });

        // Sort descending by submission time
        items.sort((a, b) => b.submittedAt - a.submittedAt);
        setHistoryList(items);
      } else {
        setHistoryList([]);
      }
      setLoading(false);
    }, (err) => {
      console.error('Error loading test history:', err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, userData]);

  const filteredList = useMemo(() => {
    return historyList.filter((item) => {
      const matchSearch = item.testTitle.toLowerCase().includes(searchQuery.toLowerCase().trim());
      const matchTrack = filterTrack === 'All' || item.studentPreparation === filterTrack;
      return matchSearch && matchTrack;
    });
  }, [historyList, searchQuery, filterTrack]);

  const formatDurationDisplay = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    if (mins === 0) return `${secs}s`;
    if (secs === 0) return `${mins}m`;
    return `${mins}m ${secs}s`;
  };

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
              Sign in to review your past test evaluations, answer sheets, and percentile rankings.
            </p>
            <button
              onClick={() => openAuthModal('login')}
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200"
            >
              Sign In to View History
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
                <History className="w-3.5 h-3.5 text-indigo-600" />
                <span>Test Records & Evaluations</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                My Test History
              </h1>
              <p className="text-slate-600 text-sm sm:text-base mt-1">
                Access your archived scorecards, solution sheets, and cohort rank certificates anytime.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/performance"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs sm:text-sm font-bold transition-all border border-indigo-100"
              >
                <BarChart2 className="w-4 h-4" />
                <span>My Performance</span>
              </Link>
              <Link
                href="/leaderboard"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs sm:text-sm font-bold transition-all border border-amber-200"
              >
                <Trophy className="w-4 h-4 text-amber-600" />
                <span>Batch Leaderboard</span>
              </Link>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="mt-8 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by test name..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Track:</span>
              {(['All', 'Board', 'JEE'] as const).map((track) => (
                <button
                  key={track}
                  onClick={() => setFilterTrack(track)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    filterTrack === track
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {track}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* History List or Table */}
        {loading ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
            <div className="w-10 h-10 border-3 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs text-slate-500 font-medium">Loading your test history...</p>
          </div>
        ) : filteredList.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No test attempts found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {searchQuery
                ? 'No tests matched your search query.'
                : 'You have not submitted any tests yet. Take a test to start building your academic history.'}
            </p>
            <div className="mt-5">
              <Link
                href="/#tests-section"
                className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition-colors inline-block shadow-sm shadow-indigo-200"
              >
                Explore Test Series
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredList.map((item) => (
              <div
                key={item.testId}
                className="bg-white rounded-2xl border border-slate-200/90 hover:border-indigo-300 p-5 sm:p-6 shadow-xs hover:shadow-sm transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {item.studentClass} • {item.studentPreparation}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(item.submittedAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>

                  <h3 className="text-lg font-black text-slate-900 line-clamp-1">{item.testTitle}</h3>

                  <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                    <span>Duration Taken: <strong className="text-slate-700">{formatDurationDisplay(item.timeTaken)}</strong></span>
                    <span>•</span>
                    <span>Accuracy: <strong className="text-slate-700">{item.accuracy}%</strong></span>
                  </div>
                </div>

                {/* Score & Rank Badges */}
                <div className="flex items-center gap-4 sm:gap-6 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0 border-slate-100">
                  <div className="text-center">
                    <div className="text-2xl font-black text-indigo-700">
                      {item.score}<span className="text-xs text-slate-400 font-medium">/{item.totalMarks}</span>
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {item.percentage}% Marks
                    </div>
                  </div>

                  <div className="text-center bg-amber-50 border border-amber-200/80 px-3.5 py-2 rounded-xl">
                    <div className="text-base font-black text-amber-900">
                      #{item.rank}
                    </div>
                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700">
                      of {item.totalInCohort} Students
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/test/${item.testId}/result`}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors shadow-xs"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Result</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
