'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { useAuth } from '@/context/AuthContext';
import { database, AttendanceRecord } from '@/lib/firebase';
import { ref, onValue } from 'firebase/database';
import {
  CalendarCheck,
  Calendar as CalendarIcon,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Award,
  AlertCircle,
  GraduationCap,
  ShieldCheck,
  Flame,
  ArrowRight,
  UserCheck
} from 'lucide-react';

interface UserAttendanceItem {
  date: string; // YYYY-MM-DD
  status: 'present' | 'absent';
  class: string;
  preparation: string;
  markedAt: number;
  markedBy: string;
}

export default function AttendancePage() {
  const { user, userData, openAuthModal } = useAuth();

  const [loading, setLoading] = useState(true);
  const [attendanceRecords, setAttendanceRecords] = useState<UserAttendanceItem[]>([]);
  const [currentMonthDate, setCurrentMonthDate] = useState(() => new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);

  // Fetch student's attendance records from Firebase Realtime Database
  useEffect(() => {
    if (!user) {
      const timer = setTimeout(() => setLoading(false), 0);
      return () => clearTimeout(timer);
    }

    const attendanceRef = ref(database, 'attendance');

    const unsubscribe = onValue(attendanceRef, (snapshot) => {
      if (snapshot.exists()) {
        const rootData = snapshot.val() || {};
        const items: UserAttendanceItem[] = [];

        // Traverse each date folder: attendance/{date}/{userId}
        Object.keys(rootData).forEach((dateKey) => {
          const dayObj = rootData[dateKey] || {};
          const userRec = dayObj[user.uid];

          if (userRec && typeof userRec === 'object') {
            items.push({
              date: dateKey,
              status: userRec.status === 'absent' ? 'absent' : 'present',
              class: userRec.class || userData?.class || 'Class 11',
              preparation: userRec.preparation || userData?.preparation || 'Board',
              markedAt: userRec.markedAt || 0,
              markedBy: userRec.markedBy || 'Faculty'
            });
          }
        });

        // Sort chronological descending (most recent first)
        items.sort((a, b) => b.date.localeCompare(a.date));
        setAttendanceRecords(items);

        // Default select latest date if available
        if (items.length > 0) {
          setSelectedDateStr(items[0].date);
        }
      } else {
        setAttendanceRecords([]);
      }
      setLoading(false);
    }, (error) => {
      console.error('Error fetching attendance records:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, userData]);

  // Aggregate Metrics
  const stats = useMemo(() => {
    const totalSessions = attendanceRecords.length;
    const presentCount = attendanceRecords.filter(r => r.status === 'present').length;
    const absentCount = attendanceRecords.filter(r => r.status === 'absent').length;
    const percentage = totalSessions > 0 
      ? Math.round((presentCount / totalSessions) * 1000) / 10 
      : 100;

    let healthStatus = 'Excellent';
    let healthColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (percentage < 75) {
      healthStatus = 'Needs Attention (<75%)';
      healthColor = 'text-rose-700 bg-rose-50 border-rose-200';
    } else if (percentage < 85) {
      healthStatus = 'Moderate';
      healthColor = 'text-amber-700 bg-amber-50 border-amber-200';
    }

    return {
      totalSessions,
      presentCount,
      absentCount,
      percentage,
      healthStatus,
      healthColor
    };
  }, [attendanceRecords]);

  // Fast map lookup by date string: 'YYYY-MM-DD' -> record
  const recordsByDate = useMemo(() => {
    const map = new Map<string, UserAttendanceItem>();
    attendanceRecords.forEach(r => map.set(r.date, r));
    return map;
  }, [attendanceRecords]);

  // Calendar calculations for currentMonthDate
  const calendarData = useMemo(() => {
    const year = currentMonthDate.getFullYear();
    const month = currentMonthDate.getMonth(); // 0-indexed

    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sun, 1 = Mon ...
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

    const monthName = currentMonthDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

    const days = [];
    // Padding before first day
    for (let i = 0; i < firstDayIndex; i++) {
      days.push({ dayNumber: null, dateStr: null });
    }

    // Days of this month
    for (let d = 1; d <= totalDaysInMonth; d++) {
      const padM = String(month + 1).padStart(2, '0');
      const padD = String(d).padStart(2, '0');
      const dateStr = `${year}-${padM}-${padD}`;
      const rec = recordsByDate.get(dateStr);

      days.push({
        dayNumber: d,
        dateStr,
        record: rec || null
      });
    }

    return {
      monthName,
      days
    };
  }, [currentMonthDate, recordsByDate]);

  const handlePrevMonth = () => {
    setCurrentMonthDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonthDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const selectedRecord = useMemo(() => {
    if (!selectedDateStr) return null;
    return recordsByDate.get(selectedDateStr) || null;
  }, [selectedDateStr, recordsByDate]);

  const formatDisplayDate = (dStr: string) => {
    try {
      const [y, m, d] = dStr.split('-').map(Number);
      const dateObj = new Date(y, m - 1, d);
      return dateObj.toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dStr;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 pb-24 sm:pb-28">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 mb-6">
          <Link href="/" className="hover:text-indigo-600 transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/performance" className="hover:text-indigo-600 transition-colors">
            Performance
          </Link>
          <span>/</span>
          <span className="font-semibold text-slate-900">Attendance</span>
        </div>

        {/* Page Hero Header */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100 shadow-xs">
                <CalendarCheck className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    Batch Attendance & Regularity
                  </h1>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${stats.healthColor}`}>
                    {stats.healthStatus}
                  </span>
                </div>
                <p className="text-sm text-slate-600 mt-1 max-w-2xl">
                  Track your physical & live batch classroom attendance records, monthly calendar status, and maintain your board & JEE preparation regularity.
                </p>
              </div>
            </div>

            {/* Quick action buttons */}
            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/performance"
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-all shadow-xs flex items-center gap-1.5"
              >
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                Performance Analytics
              </Link>
              <Link
                href="/leaderboard"
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs shadow-indigo-200 flex items-center gap-1.5"
              >
                <Award className="w-4 h-4 text-amber-300" />
                Leaderboard
              </Link>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-100">
            {/* Present Days */}
            <div className="bg-emerald-50/50 rounded-2xl border border-emerald-100 p-4">
              <div className="flex items-center gap-2 text-emerald-700 mb-1">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Present Days</span>
              </div>
              <div className="text-3xl font-black text-emerald-700">
                {stats.presentCount}
              </div>
              <div className="text-[11px] text-emerald-600 mt-0.5">Classes attended</div>
            </div>

            {/* Absent Days */}
            <div className="bg-rose-50/50 rounded-2xl border border-rose-100 p-4">
              <div className="flex items-center gap-2 text-rose-700 mb-1">
                <XCircle className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Absent Days</span>
              </div>
              <div className="text-3xl font-black text-rose-700">
                {stats.absentCount}
              </div>
              <div className="text-[11px] text-rose-600 mt-0.5">Missed sessions</div>
            </div>

            {/* Attendance Percentage */}
            <div className="bg-indigo-50/50 rounded-2xl border border-indigo-100 p-4">
              <div className="flex items-center gap-2 text-indigo-700 mb-1">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Attendance Rate</span>
              </div>
              <div className="text-3xl font-black text-indigo-700">
                {stats.percentage}%
              </div>
              <div className="text-[11px] text-indigo-600 mt-0.5">Target: 85%+ Regularity</div>
            </div>

            {/* Total Marked Sessions */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4">
              <div className="flex items-center gap-2 text-slate-700 mb-1">
                <CalendarIcon className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Total Recorded</span>
              </div>
              <div className="text-3xl font-black text-slate-900">
                {stats.totalSessions}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Lectures officially marked</div>
            </div>
          </div>
        </div>

        {/* Not Logged In Notice */}
        {!user && !loading && (
          <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center shadow-xs mb-8">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
              <UserCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Student Sign In Required</h3>
            <p className="text-sm text-slate-600 max-w-md mx-auto mt-1 mb-4">
              Please sign in with your registered student account to view your verified classroom attendance logs and monthly calendar.
            </p>
            <button
              onClick={() => openAuthModal('login')}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs"
            >
              Sign In to View Attendance
            </button>
          </div>
        )}

        {/* Main Grid: Monthly Calendar & Day Inspection */}
        {user && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
            {/* Monthly Interactive Calendar */}
            <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs">
              <div className="flex items-center justify-between pb-5 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                    <CalendarIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Monthly Attendance Calendar</h2>
                    <p className="text-xs text-slate-500">Select any day to inspect batch session verification</p>
                  </div>
                </div>

                {/* Month Navigation */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrevMonth}
                    className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
                    title="Previous Month"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm font-bold text-slate-800 min-w-[130px] text-center">
                    {calendarData.monthName}
                  </span>
                  <button
                    onClick={handleNextMonth}
                    className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
                    title="Next Month"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Day-of-week headers */}
              <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-500 py-3 border-b border-slate-100 uppercase tracking-wider">
                <span>Sun</span>
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
              </div>

              {/* Calendar Days Grid */}
              <div className="grid grid-cols-7 gap-2 pt-3">
                {calendarData.days.map((cell, idx) => {
                  if (!cell.dayNumber) {
                    return <div key={`empty-${idx}`} className="h-16 sm:h-20 bg-slate-50/40 rounded-xl" />;
                  }

                  const rec = cell.record;
                  const isSelected = selectedDateStr === cell.dateStr;

                  let badgeStyle = 'border-slate-100 hover:border-indigo-200 bg-white text-slate-700';
                  if (rec) {
                    if (rec.status === 'present') {
                      badgeStyle = isSelected
                        ? 'border-emerald-500 ring-2 ring-emerald-400 bg-emerald-50/90 text-emerald-900 font-bold'
                        : 'border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 text-emerald-800';
                    } else if (rec.status === 'absent') {
                      badgeStyle = isSelected
                        ? 'border-rose-500 ring-2 ring-rose-400 bg-rose-50/90 text-rose-900 font-bold'
                        : 'border-rose-200 bg-rose-50/50 hover:bg-rose-50 text-rose-800';
                    }
                  } else if (isSelected) {
                    badgeStyle = 'border-indigo-500 ring-2 ring-indigo-300 bg-indigo-50/40';
                  }

                  return (
                    <button
                      key={cell.dateStr}
                      onClick={() => cell.dateStr && setSelectedDateStr(cell.dateStr)}
                      className={`h-16 sm:h-20 p-1.5 sm:p-2 rounded-xl border flex flex-col justify-between text-left transition-all ${badgeStyle}`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs sm:text-sm font-bold">{cell.dayNumber}</span>
                        {rec && (
                          <span
                            className={`w-2 h-2 rounded-full ${
                              rec.status === 'present' ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                          />
                        )}
                      </div>

                      {/* Small status tag */}
                      <div className="text-[10px] truncate">
                        {rec ? (
                          <span
                            className={`inline-block px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                              rec.status === 'present'
                                ? 'bg-emerald-100/80 text-emerald-700'
                                : 'bg-rose-100/80 text-rose-700'
                            }`}
                          >
                            {rec.status}
                          </span>
                        ) : (
                          <span className="text-slate-500 hidden sm:inline">—</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Legend Bar */}
              <div className="flex items-center gap-6 mt-6 pt-4 border-t border-slate-100 text-xs text-slate-600 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span>Present (Marked Verified)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500" />
                  <span>Absent (Unexcused / Missed)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-slate-300" />
                  <span>No Batch Class / Holiday</span>
                </div>
              </div>
            </div>

            {/* Selected Day Inspection & Batch Details Card */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Session Inspection
                  </div>
                  <CalendarCheck className="w-4 h-4 text-indigo-600" />
                </div>

                {selectedDateStr ? (
                  <div className="mt-4 space-y-4">
                    <div>
                      <div className="text-xs text-slate-500">Selected Date</div>
                      <div className="text-lg font-black text-slate-900 mt-0.5">
                        {formatDisplayDate(selectedDateStr)}
                      </div>
                    </div>

                    {selectedRecord ? (
                      <div className="space-y-4 pt-2">
                        {/* Status Card */}
                        <div
                          className={`p-4 rounded-2xl border ${
                            selectedRecord.status === 'present'
                              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                              : 'bg-rose-50/70 border-rose-200 text-rose-900'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {selectedRecord.status === 'present' ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                            ) : (
                              <XCircle className="w-5 h-5 text-rose-600" />
                            )}
                            <span className="text-sm font-bold uppercase tracking-wider">
                              Status: {selectedRecord.status}
                            </span>
                          </div>
                          <p className="text-xs mt-1 text-slate-600">
                            {selectedRecord.status === 'present'
                              ? 'You attended this batch lecture on time and verified attendance.'
                              : 'You were absent for this scheduled batch session.'}
                          </p>
                        </div>

                        {/* Metadata Rows */}
                        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2.5 text-xs">
                          <div className="flex justify-between">
                            <span className="text-slate-500">Batch Cohort:</span>
                            <span className="font-bold text-slate-800">
                              {selectedRecord.class} • {selectedRecord.preparation}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Marked By:</span>
                            <span className="font-bold text-slate-800">{selectedRecord.markedBy}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Marked Timestamp:</span>
                            <span className="font-medium text-slate-700">
                              {selectedRecord.markedAt
                                ? new Date(selectedRecord.markedAt).toLocaleTimeString('en-IN', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })
                                : 'Recorded'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center py-6">
                        <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                        <p className="text-xs font-semibold text-slate-700">No session marked on this date</p>
                        <p className="text-[11px] text-slate-500 mt-1">
                          No lecture or attendance was recorded for this day.
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    Select a date on the calendar to inspect attendance details.
                  </div>
                )}
              </div>

              {/* Attendance Regularity Policy Banner */}
              <div className="bg-gradient-to-br from-indigo-500/10 via-slate-50 to-white rounded-3xl border border-indigo-100 p-5 shadow-xs">
                <div className="flex items-center gap-2.5 mb-2">
                  <ShieldCheck className="w-5 h-5 text-indigo-600" />
                  <h4 className="text-sm font-bold text-slate-900">Prayatna Attendance Policy</h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Students maintaining at least <strong>85% attendance</strong> show significantly higher retention and 99th percentile JEE/Board test series results. Regularity unlocks special study materials and batch doubt rooms.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Full Attendance History Table */}
        {user && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Attendance History Log</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Complete official record of all marked classroom dates and statuses
                </p>
              </div>

              <div className="px-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 self-start sm:self-auto">
                {attendanceRecords.length} Sessions Logged
              </div>
            </div>

            {loading ? (
              <div className="py-12 text-center text-slate-400 text-sm">
                Loading attendance history...
              </div>
            ) : attendanceRecords.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-sm">
                <CalendarIcon className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="font-semibold text-slate-700">No attendance records found</p>
                <p className="text-xs text-slate-500 mt-1">
                  Your instructor will mark attendance during scheduled batch sessions.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto mt-4">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Cohort / Class</th>
                      <th className="py-3 px-4">Recorded By</th>
                      <th className="py-3 px-4 text-right">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {attendanceRecords.map((item) => (
                      <tr key={item.date} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-800">
                          {formatDisplayDate(item.date)}
                        </td>
                        <td className="py-3.5 px-4">
                          {item.status === 'present' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Present
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              <XCircle className="w-3.5 h-3.5" />
                              Absent
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-xs font-medium text-slate-600">
                          <span className="inline-block px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 font-semibold">
                            {item.class} • {item.preparation}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-600">
                          {item.markedBy}
                        </td>
                        <td className="py-3.5 px-4 text-right text-xs text-slate-500 font-mono">
                          {item.markedAt ? new Date(item.markedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
