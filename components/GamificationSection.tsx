'use client';

import React, { useEffect, useState } from 'react';
import { database, StreakData, UserXPData, UserAchievementRecord } from '@/lib/firebase';
import { ref, onValue, get } from 'firebase/database';
import { useAuth } from '@/context/AuthContext';
import { ACHIEVEMENTS_LIST, AchievementDef, calculateUserLevel, getTodayDateString } from '@/lib/gamification';
import {
  Flame,
  Zap,
  Trophy,
  Award,
  Crown,
  Target,
  CheckCircle2,
  Lock,
  Sparkles,
  Calendar,
  AlertCircle,
  HelpCircle,
  TrendingUp,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import Link from 'next/link';

export default function GamificationSection() {
  const { user, openAuthModal } = useAuth();

  const [streak, setStreak] = useState<StreakData>({
    currentStreak: 0,
    longestStreak: 0,
    lastActivityDate: ''
  });
  const [totalXP, setTotalXP] = useState<number>(0);
  const [unlockedAchievements, setUnlockedAchievements] = useState<Record<string, UserAchievementRecord>>({});
  const [loading, setLoading] = useState(!user ? false : true);

  useEffect(() => {
    if (!user) {
      return;
    }

    // 1. Listen to streaks
    const streakRef = ref(database, `streaks/${user.uid}`);
    const unsubscribeStreak = onValue(streakRef, (snap) => {
      if (snap.exists()) {
        setStreak(snap.val() as StreakData);
      } else {
        setStreak({ currentStreak: 0, longestStreak: 0, lastActivityDate: '' });
      }
    });

    // 2. Listen to XP
    const xpRef = ref(database, `xp/${user.uid}`);
    const unsubscribeXP = onValue(xpRef, (snap) => {
      if (snap.exists()) {
        setTotalXP(Number(snap.val()?.totalXP || 0));
      } else {
        setTotalXP(0);
      }
    });

    // 3. Listen to Achievements
    const achRef = ref(database, `achievements/${user.uid}`);
    const unsubscribeAch = onValue(achRef, (snap) => {
      if (snap.exists()) {
        setUnlockedAchievements(snap.val() as Record<string, UserAchievementRecord>);
      } else {
        setUnlockedAchievements({});
      }
      setLoading(false);
    });

    const activeUserId = user.uid;

    // Auto-sync initial achievements for students with existing test attempts or homework
    async function syncHistoricalAchievements() {
      try {
        const xpCheck = await get(xpRef);
        const currentXPVal = Number(xpCheck.val()?.totalXP || 0);

        const attemptsRef = ref(database, 'testAttempts');
        const attemptsSnap = await get(attemptsRef);
        const userAttempts: any[] = [];
        if (attemptsSnap.exists()) {
          const allData = attemptsSnap.val() || {};
          Object.keys(allData).forEach((testId) => {
            const att = allData[testId]?.[activeUserId];
            if (att) userAttempts.push(att);
          });
        }

        const hwRef = ref(database, 'homeworkProgress');
        const hwSnap = await get(hwRef);
        let completedHwCount = 0;
        if (hwSnap.exists()) {
          const hwData = hwSnap.val() || {};
          Object.keys(hwData).forEach((hwId) => {
            if (hwData[hwId]?.[activeUserId]?.status === 'Completed') {
              completedHwCount++;
            }
          });
        }

        // If user already has historical data but 0 XP, sync them once
        if ((userAttempts.length > 0 || completedHwCount > 0) && currentXPVal === 0) {
          const highestScore = userAttempts.reduce((max, a) => Math.max(max, a.percentage || 0), 0);
          fetch('/api/gamification/activity', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: activeUserId,
              activityType: userAttempts.length > 0 ? 'test_attempt' : 'homework_completed',
              metadata: {
                percentage: highestScore,
                totalTestsCompleted: userAttempts.length
              }
            })
          }).catch((e) => console.log('Sync err', e));
        }
      } catch (err) {
        console.error('Error checking historical sync:', err);
      }
    }

    syncHistoricalAchievements();

    return () => {
      unsubscribeStreak();
      unsubscribeXP();
      unsubscribeAch();
    };
  }, [user]);

  const todayStr = getTodayDateString();
  const isTodayActive = streak.lastActivityDate === todayStr;
  const levelInfo = calculateUserLevel(totalXP);

  // Weekly streak calendar: Last 7 days
  const weeklyDays = React.useMemo(() => {
    const days = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = getTodayDateString(d);
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNumber = d.getDate();
      const isToday = dateStr === todayStr;
      
      // If day is today and isTodayActive is true
      const isActive = isToday ? isTodayActive : false;

      days.push({
        dateStr,
        dayName,
        dayNumber,
        isToday,
        isActive
      });
    }
    return days;
  }, [todayStr, isTodayActive]);

  const renderAchievementIcon = (iconName: string, isUnlocked: boolean) => {
    const className = `w-6 h-6 ${isUnlocked ? 'text-amber-500' : 'text-slate-400'}`;
    switch (iconName) {
      case 'target':
        return <Target className={className} />;
      case 'flame':
        return <Flame className={className} />;
      case 'zap':
        return <Zap className={className} />;
      case 'trophy':
        return <Trophy className={className} />;
      case 'award':
        return <Award className={className} />;
      case 'crown':
        return <Crown className={className} />;
      case 'check-circle-2':
        return <CheckCircle2 className={className} />;
      default:
        return <Sparkles className={className} />;
    }
  };

  if (!user) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs text-center">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-100">
          <Flame className="w-7 h-7" />
        </div>
        <h3 className="text-xl font-bold text-slate-900">Learning Streak, XP & Achievements</h3>
        <p className="text-sm text-slate-600 max-w-md mx-auto mt-2">
          Sign in to your Prayatna student account to track your daily practice streak, earn Mathematics XP, and unlock prestigious achievements.
        </p>
        <button
          onClick={() => openAuthModal('login')}
          className="mt-5 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-all shadow-sm shadow-indigo-200"
        >
          Sign In to Track Streak & XP
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner: Streak & Level Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Streak Card */}
        <div className="lg:col-span-6 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-white rounded-3xl border border-amber-200/80 p-6 sm:p-7 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-36 h-36 bg-amber-400/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />

          <div>
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-200">
                  <Flame className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Learning Streak</h3>
                  <p className="text-xs text-slate-500">Daily purposeful mathematics study</p>
                </div>
              </div>

              {/* Status Badge */}
              {isTodayActive ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-xs">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Active Today
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 animate-pulse shadow-xs">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Pending Today
                </span>
              )}
            </div>

            {/* Metric Displays */}
            <div className="grid grid-cols-2 gap-4 my-4">
              <div className="bg-white/80 backdrop-blur-xs border border-amber-100 rounded-2xl p-4 shadow-xs">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Current Streak</div>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-3xl sm:text-4xl font-black text-amber-600 tracking-tight">
                    {streak.currentStreak || 0}
                  </span>
                  <span className="text-sm font-bold text-slate-600">days</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  {streak.currentStreak > 0 ? 'Consecutive daily activity' : 'Start your streak today'}
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-xs border border-amber-100 rounded-2xl p-4 shadow-xs">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Longest Streak</div>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight">
                    {streak.longestStreak || 0}
                  </span>
                  <span className="text-sm font-bold text-slate-600">days</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Personal best record
                </div>
              </div>
            </div>

            {/* Weekly Streak Calendar */}
            <div className="bg-white/90 rounded-2xl p-4 border border-amber-100/80 shadow-xs">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-3">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-600" />
                  Last 7 Days Activity
                </span>
                <span className="text-[11px] text-slate-500 font-normal">Meaningful learning counts</span>
              </div>

              <div className="grid grid-cols-7 gap-2 text-center">
                {weeklyDays.map((day) => (
                  <div
                    key={day.dateStr}
                    className={`flex flex-col items-center py-2 px-1 rounded-xl border transition-all ${
                      day.isActive
                        ? 'bg-amber-50 border-amber-300 shadow-xs'
                        : day.isToday
                        ? 'bg-slate-50 border-slate-300 border-dashed'
                        : 'bg-slate-50/60 border-slate-100'
                    }`}
                  >
                    <span className="text-[10px] font-semibold text-slate-500 uppercase">{day.dayName}</span>
                    <span className="text-xs font-bold text-slate-800 mt-0.5">{day.dayNumber}</span>
                    <div className="mt-1.5">
                      {day.isActive ? (
                        <div className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center">
                          <Flame className="w-3 h-3" />
                        </div>
                      ) : day.isToday ? (
                        <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
                          <span className="text-[10px] font-bold">Today</span>
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-slate-200/70 text-slate-400 flex items-center justify-center">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Meaningful Activity Notice */}
          <div className="mt-4 pt-3 border-t border-amber-200/60 text-xs text-slate-600 flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                {isTodayActive 
                  ? 'Great job! Today’s learning activity has been counted toward your streak.' 
                  : 'Complete a Homework DPP or attempt a Mock Test to keep your streak burning!'}
              </span>
            </span>
          </div>
        </div>

        {/* XP & Level Progression Card */}
        <div className="lg:col-span-6 bg-gradient-to-br from-indigo-500/10 via-slate-50 to-white rounded-3xl border border-indigo-100 p-6 sm:p-7 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-36 h-36 bg-indigo-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />

          <div>
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-200">
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Mathematics XP</h3>
                  <p className="text-xs text-slate-500">Mastery and experience progression</p>
                </div>
              </div>

              <div className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                Level {levelInfo.level}
              </div>
            </div>

            {/* Total XP & Rank Title */}
            <div className="bg-white/80 backdrop-blur-xs border border-indigo-100 rounded-2xl p-5 shadow-xs mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Experience</div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl sm:text-4xl font-black text-indigo-600 tracking-tight">
                      {totalXP.toLocaleString()}
                    </span>
                    <span className="text-sm font-bold text-slate-600">XP</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Student Rank</div>
                  <div className="text-sm sm:text-base font-black text-slate-900 mt-1">
                    {levelInfo.rankTitle}
                  </div>
                </div>
              </div>

              {/* Progress Bar to Next Level */}
              <div className="mt-4">
                <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1.5">
                  <span>Level {levelInfo.level} Progress</span>
                  <span>{levelInfo.xpToNextLevel} XP to Level {levelInfo.level + 1}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200/80">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-500"
                    style={{ width: `${levelInfo.percentToNext}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                  <span>{(levelInfo.level - 1) * levelInfo.xpPerLevel} XP</span>
                  <span>{levelInfo.percentToNext}% complete</span>
                  <span>{levelInfo.level * levelInfo.xpPerLevel} XP</span>
                </div>
              </div>
            </div>

            {/* How XP Is Awarded Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
              <div className="bg-white rounded-xl p-2.5 border border-slate-200/80">
                <div className="font-bold text-indigo-600">+100 XP</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Attempt Test</div>
              </div>
              <div className="bg-white rounded-xl p-2.5 border border-slate-200/80">
                <div className="font-bold text-emerald-600">+50 XP</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Complete DPP</div>
              </div>
              <div className="bg-white rounded-xl p-2.5 border border-slate-200/80">
                <div className="font-bold text-amber-600">+25 XP</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Streak Daily</div>
              </div>
              <div className="bg-white rounded-xl p-2.5 border border-slate-200/80">
                <div className="font-bold text-purple-600">Up to +200</div>
                <div className="text-[11px] text-slate-500 mt-0.5">High Score</div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-indigo-100 text-xs text-slate-600 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">
              XP is verified server-side on meaningful assessment actions
            </span>
            <Link 
              href="/attendance" 
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors"
            >
              View Attendance
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Achievements Showcase Section */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                <Trophy className="w-4 h-4" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Student Achievements</h3>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Unlock milestones by testing consistently, scoring high marks, and keeping your learning streak alive.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700">
              {Object.keys(unlockedAchievements).length} of {ACHIEVEMENTS_LIST.length} Unlocked
            </div>
          </div>
        </div>

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-6">
          {ACHIEVEMENTS_LIST.map((ach) => {
            const isUnlocked = Boolean(unlockedAchievements[ach.id]);
            const unlockedAt = unlockedAchievements[ach.id]?.unlockedAt;

            return (
              <div
                key={ach.id}
                className={`relative rounded-2xl p-5 border transition-all ${
                  isUnlocked
                    ? 'bg-gradient-to-br from-amber-50/50 via-white to-orange-50/30 border-amber-200 shadow-xs'
                    : 'bg-slate-50/60 border-slate-200/80 opacity-75'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
                        isUnlocked
                          ? 'bg-amber-100/80 border-amber-300 text-amber-600 shadow-xs'
                          : 'bg-slate-200/80 border-slate-300 text-slate-400'
                      }`}
                    >
                      {renderAchievementIcon(ach.icon, isUnlocked)}
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-base font-bold text-slate-900">{ach.title}</h4>
                        {isUnlocked && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        )}
                      </div>
                      <span className="inline-block mt-0.5 text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200/60">
                        +{ach.xpReward} XP
                      </span>
                    </div>
                  </div>

                  {!isUnlocked && (
                    <div className="p-1.5 rounded-lg bg-slate-200/80 text-slate-500 shrink-0" title="Locked">
                      <Lock className="w-4 h-4" />
                    </div>
                  )}
                </div>

                <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                  {ach.description}
                </p>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  {isUnlocked ? (
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Unlocked {unlockedAt ? new Date(unlockedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recently'}
                    </span>
                  ) : (
                    <span className="text-slate-600 flex items-center gap-1">
                      <Lock className="w-3 h-3 text-slate-500" />
                      Locked milestone
                    </span>
                  )}
                  <span className="text-slate-600 capitalize">{ach.category}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
