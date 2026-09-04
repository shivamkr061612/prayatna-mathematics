'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { 
  GraduationCap, 
  Sparkles,
  Check,
  ArrowRight,
  BookOpen,
  ClipboardList,
  FileText,
  User,
  Award,
  Compass,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';

interface LocalEnrollment {
  class: 'Class 11' | 'Class 12';
  preparation: 'Board' | 'JEE';
}

export default function ClassSelection() {
  const { user, userData, updateUserBio, openAuthModal } = useAuth();

  const [selectedClass, setSelectedClass] = useState<'Class 11' | 'Class 12' | null>(null);
  const [selectedPrep, setSelectedPrep] = useState<'Board' | 'JEE' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Local storage state for guest visitors (lazy initialized to prevent cascading renders)
  const [localEnrollment, setLocalEnrollment] = useState<LocalEnrollment | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const stored = window.localStorage.getItem('prayatna_enrolled');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.class && parsed?.preparation) {
          return parsed;
        }
      }
    } catch {
      // Ignore localStorage parse errors
    }
    return null;
  });

  // Determine if user has already enrolled
  const isEnrolled = Boolean(
    (userData?.class && userData?.preparation) || 
    (localEnrollment?.class && localEnrollment?.preparation)
  );

  const activeClass = (userData?.class || localEnrollment?.class || 'Class 11') as 'Class 11' | 'Class 12';
  const activePrep = (userData?.preparation || localEnrollment?.preparation || 'JEE') as 'Board' | 'JEE';

  const handleSelectClass = (cls: 'Class 11' | 'Class 12') => {
    setSelectedClass(cls);
    setErrorMessage(null);
  };

  const handleSelectPrep = (prep: 'Board' | 'JEE') => {
    setSelectedPrep(prep);
    setErrorMessage(null);
  };

  const handleEnroll = async () => {
    if (!selectedClass || !selectedPrep) {
      setErrorMessage("Please select both your Class and Preparation target.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const enrollmentData: LocalEnrollment = {
      class: selectedClass,
      preparation: selectedPrep
    };

    // Save to local storage for immediate persistence
    try {
      localStorage.setItem('prayatna_enrolled', JSON.stringify(enrollmentData));
      setLocalEnrollment(enrollmentData);
    } catch (e) {
      console.warn("Could not save to localStorage", e);
    }

    if (user) {
      // User is logged in: update their Firebase profile
      try {
        await updateUserBio({
          class: selectedClass,
          preparation: selectedPrep,
          updatedAt: Date.now()
        });
      } catch (err: any) {
        console.error("Enrollment error:", err);
        setErrorMessage(err?.message || "Could not save enrollment to account. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // User is not logged in: save locally and prompt login/signup modal with pre-selected class
      setIsSubmitting(false);
      openAuthModal('signup', {
        classLevel: selectedClass,
        preparation: selectedPrep
      });
    }
  };

  // =========================================================================
  // VIEW A: ALREADY ENROLLED DASHBOARD WIDGET
  // (Do not show selection again on the Home page; display enrolled status)
  // =========================================================================
  if (isEnrolled) {
    return (
      <section 
        id="enrolled-status-section"
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
        aria-label="Enrolled Batch Status"
      >
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white p-6 sm:p-8 shadow-xl shadow-indigo-950/20 border border-indigo-700/50">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-2.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Enrolled & Active Student</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {activeClass} • {activePrep === 'JEE' ? 'JEE (Main & Advanced)' : 'Board Examination 100/100'}
              </h2>

              <p className="text-sm text-indigo-100/90 max-w-xl leading-relaxed">
                Your syllabus, mock tests, DPPs, and curated textbook solutions are tailored for{' '}
                <span className="text-amber-300 font-semibold">{activeClass} ({activePrep})</span>.
              </p>

              <div className="pt-1">
                <Link 
                  href="/profile"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-200 hover:text-white underline underline-offset-4 transition-colors"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Change batch or target in Student Profile →</span>
                </Link>
              </div>
            </div>

            {/* Quick Action Navigation Buttons */}
            <div className="grid grid-cols-3 gap-2.5 sm:gap-3 shrink-0">
              <Link 
                href="/homework"
                className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 transition-all text-center group"
              >
                <FileText className="w-5 h-5 text-amber-300 mb-1.5 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-white">Homework</span>
                <span className="text-[10px] text-indigo-200">DPPs</span>
              </Link>

              <Link 
                href="/tests"
                className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 transition-all text-center group"
              >
                <ClipboardList className="w-5 h-5 text-emerald-300 mb-1.5 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-white">Mock Tests</span>
                <span className="text-[10px] text-indigo-200">Exam Engine</span>
              </Link>

              <Link 
                href="/books"
                className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 transition-all text-center group"
              >
                <BookOpen className="w-5 h-5 text-sky-300 mb-1.5 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-white">Books</span>
                <span className="text-[10px] text-indigo-200">Library</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // =========================================================================
  // VIEW B: FIRST-TIME ENROLLMENT EXPERIENCE
  // (Show Class 11 and Class 12 as TWO HORIZONTAL CARDS IN A SINGLE ROW)
  // =========================================================================
  return (
    <section 
      id="classes-section" 
      className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12"
      aria-label="Class Selection"
    >
      <div className="text-center max-w-xl mx-auto mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-2.5">
          <GraduationCap className="w-3.5 h-3.5" />
          Enrollment Flow
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Select Your Academic Class
        </h2>
        <p className="mt-1.5 text-xs sm:text-sm text-slate-600">
          Step 1: Choose your higher secondary class to personalize your curriculum.
        </p>
      </div>

      {/* Step 1: Class 11 and Class 12 AS TWO HORIZONTAL CARDS IN A SINGLE ROW */}
      <div className="grid grid-cols-2 gap-3 sm:gap-6 max-w-2xl mx-auto">
        {/* Class 11 Card */}
        <button
          type="button"
          id="select-class-11-btn"
          onClick={() => handleSelectClass('Class 11')}
          className={`text-left p-4 sm:p-6 rounded-2xl border-2 transition-all relative flex flex-col justify-between ${
            selectedClass === 'Class 11'
              ? 'border-indigo-600 bg-indigo-50/50 shadow-md ring-2 ring-indigo-600/20'
              : 'border-slate-200 bg-white hover:border-indigo-300 hover:shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-extrabold text-base sm:text-lg">
              11
            </div>
            {selectedClass === 'Class 11' && (
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                <Check className="w-3.5 h-3.5" />
              </span>
            )}
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Class 11
            </h3>
            <p className="text-xs text-slate-500 mt-1 line-clamp-2">
              Foundations, Trigonometry, Coordinate Geometry & Algebra
            </p>
          </div>
        </button>

        {/* Class 12 Card */}
        <button
          type="button"
          id="select-class-12-btn"
          onClick={() => handleSelectClass('Class 12')}
          className={`text-left p-4 sm:p-6 rounded-2xl border-2 transition-all relative flex flex-col justify-between ${
            selectedClass === 'Class 12'
              ? 'border-indigo-600 bg-indigo-50/50 shadow-md ring-2 ring-indigo-600/20'
              : 'border-slate-200 bg-white hover:border-indigo-300 hover:shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-extrabold text-base sm:text-lg">
              12
            </div>
            {selectedClass === 'Class 12' && (
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                <Check className="w-3.5 h-3.5" />
              </span>
            )}
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Class 12
            </h3>
            <p className="text-xs text-slate-500 mt-1 line-clamp-2">
              Differential & Integral Calculus, Vectors, 3D & Boards
            </p>
          </div>
        </button>
      </div>

      {/* Step 2: Preparation Selection (Board or JEE) */}
      {selectedClass && (
        <div className="mt-8 max-w-2xl mx-auto p-5 sm:p-7 rounded-2xl bg-white border border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Step 2: Choose Preparation Target for {selectedClass}
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mb-5">
            Select what you are primarily preparing for:
          </p>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6">
            {/* Board Option */}
            <button
              type="button"
              id="select-prep-board-btn"
              onClick={() => handleSelectPrep('Board')}
              className={`p-4 rounded-xl border-2 text-left transition-all flex flex-col sm:flex-row items-start sm:items-center gap-3 ${
                selectedPrep === 'Board'
                  ? 'border-indigo-600 bg-indigo-50/60 shadow-sm ring-1 ring-indigo-600'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                selectedPrep === 'Board' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
              }`}>
                <Award className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-slate-900">Board</h4>
                  {selectedPrep === 'Board' && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">CBSE & State Boards</p>
              </div>
            </button>

            {/* JEE Option */}
            <button
              type="button"
              id="select-prep-jee-btn"
              onClick={() => handleSelectPrep('JEE')}
              className={`p-4 rounded-xl border-2 text-left transition-all flex flex-col sm:flex-row items-start sm:items-center gap-3 ${
                selectedPrep === 'JEE'
                  ? 'border-indigo-600 bg-indigo-50/60 shadow-sm ring-1 ring-indigo-600'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                selectedPrep === 'JEE' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
              }`}>
                <Compass className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-slate-900">JEE</h4>
                  {selectedPrep === 'JEE' && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">Main & Advanced</p>
              </div>
            </button>
          </div>

          {/* Step 3: Enroll Button */}
          {selectedPrep && (
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in duration-200">
              <div className="text-xs sm:text-sm text-slate-600 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Ready: <strong>{selectedClass}</strong> • Target: <strong>{selectedPrep}</strong>
                </span>
              </div>

              <button
                type="button"
                id="btn-confirm-enroll"
                onClick={handleEnroll}
                disabled={isSubmitting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-sm shadow-md shadow-indigo-200 transition-all disabled:opacity-60"
              >
                {isSubmitting ? (
                  <span>Saving enrollment...</span>
                ) : (
                  <>
                    <span>Enroll Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}

          {errorMessage && (
            <div className="mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {errorMessage}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
