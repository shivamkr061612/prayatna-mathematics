'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import BannerSlider from '@/components/BannerSlider';
import ClassSelection from '@/components/ClassSelection';
import BottomNav from '@/components/BottomNav';
import AuthModal from '@/components/AuthModal';
import CompleteProfileModal from '@/components/CompleteProfileModal';
import { 
  CheckCircle2, 
  Target, 
  Sparkles, 
  BookOpen, 
  Award, 
  ShieldCheck, 
  Compass, 
  GraduationCap, 
  ArrowRight,
  Calculator,
  Flame,
  FileCheck2,
  Users,
  FlaskConical,
  ClipboardList,
  Trophy,
  CalendarCheck,
  ChevronRight,
  TrendingUp,
  Clock,
  ExternalLink
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Universal Header */}
      <Header />

      {/* Main Page Content */}
      <main className="flex-1 space-y-8 sm:space-y-12 pb-24 sm:pb-28">
        
        {/* Banner Section (16:9 ratio with auto slider) */}
        <BannerSlider />

        {/* Classes Enrollment Section:
            - First visit: Shows Class 11 & Class 12 as two horizontal cards in a single row
            - Selects class -> chooses Board or JEE -> Enroll Now -> saves to Firebase profile
            - Once enrolled: Hides the selection form and shows enrolled batch card
        */}
        <ClassSelection />

        {/* Quick Access Feature Hub */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Student Learning Portals">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-2">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Learning Portals</span>
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Academic Modules
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                Direct access to daily assignments, timed examination drills, and study notes.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Homework Portal Card */}
            <Link
              href="/homework"
              className="group p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <FileCheck2 className="w-6 h-6" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  Homework & DPPs
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                  Daily problem practice sets, step-marking proof questions, and homework submissions.
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-700">
                <span>Open Homework</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Mock Tests Portal Card */}
            <Link
              href="/tests"
              className="group p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <FlaskConical className="w-6 h-6" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  Mock Tests Series
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                  Full-length CBT mock tests with automated timers, negative marks, and answer analysis.
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-700">
                <span>Start Practice Test</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Books Portal Card */}
            <Link
              href="/books"
              className="group p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  Study Books Library
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                  NCERT official textbooks, Exemplar solutions, JEE references, and topic formula sheets.
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-sky-700">
                <span>Browse Library</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Cohort Leaderboard Card */}
            <Link
              href="/leaderboard"
              className="group p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <Trophy className="w-6 h-6" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  Cohort Leaderboard
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                  Class 11 & 12 student rankings, accuracy ratings, test attempts, and XP point scores.
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-amber-700">
                <span>View Leaderboard</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </section>

        {/* Why Prayatna Mathematics Section */}
        <section 
          id="features-section" 
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10"
          aria-label="Pedagogical Strengths and Features"
        >
          <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-100 text-red-700 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Academic Excellence &amp; Methodology
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Why Choose Prayatna Mathematics?
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-600">
              Transforming mathematical abstractions into intuitive, conquerable steps through structured discipline, real-time analytics, and proven exam pedagogy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 group">
              <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">First-Principles Logic</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Zero rote memorization. Every calculus theorem, trigonometry identity, and coordinate geometry formula is derived from foundational logic to build unwavering conceptual confidence.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 group">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FileCheck2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Dual Board &amp; JEE Focus</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Parallel preparation: pristine presentation and step-marking for CBSE/Bihar State Board exams, synchronized with high-speed elimination strategies for JEE Main &amp; Advanced.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 group">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FlaskConical className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Real CBT Mock Exam Engine</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Experience actual exam-hall conditions with our high-fidelity Computer-Based Testing engine, timer countdowns, negative marking rules (+4 / -1), and question status tracking.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 group">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Curated Books &amp; PYQ Sheets</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Instant access to categorized study modules, chapter-wise formula compendiums, exemplar assignments, and past 15 years solved papers organized by difficulty level.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 group">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Cohort Leaderboards &amp; XP</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Maintain study consistency through gamified study streaks, earn XP for completing daily practice sheets, and benchmark your progress against batch peers.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 group">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Faculty Mentorship &amp; Doubts</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Daily classroom attendance monitoring, personalized 1-on-1 doubt clearing clinics, and regular parent feedback ensure every student receives dedicated academic guidance.
              </p>
            </div>
          </div>

          {/* Learn More Link */}
          <div className="text-center mt-8">
            <Link 
              href="/why-choose-us"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm transition-colors shadow-sm"
            >
              <span>Explore Complete Pedagogy &amp; Features</span>
              <ArrowRight className="w-4 h-4 text-amber-400" />
            </Link>
          </div>
        </section>

        {/* Quick Batch Summary Banner */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 p-6 sm:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-800 shadow-sm">
            <div>
              <span className="text-amber-400 text-xs font-bold uppercase tracking-wider">Admission Guidance</span>
              <h3 className="text-xl sm:text-2xl font-bold mt-1">Need help choosing between Board and JEE tracks?</h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                Connect with our academic counseling team to plan your optimal preparation roadmap and book an orientation session.
              </p>
            </div>
            <a 
              href="tel:+917764026748"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm transition-colors shrink-0"
            >
              <span>Call Academic Advisor (7764026748)</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-10 mb-16 md:mb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-3.5">
              <div className="relative w-12 h-12 rounded-full overflow-hidden border border-slate-200 shadow-sm bg-white shrink-0">
                <Image 
                  src="/logo.svg" 
                  alt="Prayatna Mathematics Official Logo" 
                  width={48} 
                  height={48} 
                  className="w-full h-full object-contain p-0.5"
                />
              </div>
              <div>
                <h4 className="text-base font-extrabold text-slate-900 tracking-tight">Prayatna Mathematics</h4>
                <p className="text-xs text-slate-500">Madnani Lane, Mithanpura, Muzaffarpur • Mob: +91 7764026748</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600">
              <Link href="/why-choose-us" className="hover:text-red-600 transition-colors">Why Choose Us</Link>
              <Link href="/books" className="hover:text-red-600 transition-colors">Study Books</Link>
              <Link href="/homework" className="hover:text-red-600 transition-colors">Homework &amp; DPPs</Link>
              <Link href="/tests" className="hover:text-red-600 transition-colors">Mock Tests</Link>
              <Link href="/leaderboard" className="hover:text-red-600 transition-colors">Leaderboard</Link>
              <Link href="/contact" className="hover:text-red-600 transition-colors">Contact Us</Link>
            </div>
          </div>
          
          {/* Legal and Regulatory Policy Links */}
          <div className="pt-4 pb-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 border-b border-slate-100">
            <div className="flex flex-wrap items-center gap-4 font-medium">
              <Link href="/terms" className="hover:text-slate-800 transition-colors">Terms &amp; Conditions</Link>
              <span>•</span>
              <Link href="/privacy" className="hover:text-slate-800 transition-colors">Privacy Policy</Link>
              <span>•</span>
              <Link href="/refund-policy" className="hover:text-slate-800 transition-colors">Refund &amp; Cancellation Policy</Link>
              <span>•</span>
              <Link href="/contact" className="hover:text-slate-800 transition-colors">Grievance &amp; Help Desk</Link>
            </div>
            <div className="text-[11px] text-slate-700">
              Academic Center: Madnani Lane, Mithanpura, Muzaffarpur
            </div>
          </div>

          <div className="pt-3 text-center sm:text-left text-xs text-slate-600">
            © {new Date().getFullYear()} Prayatna Mathematics. Class 11 &amp; 12 Board, JEE Main/Advanced, CUET &amp; NDA Mathematics Coaching. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Fixed Bottom Mobile Navigation Toolbar (5 items) */}
      <BottomNav />

      {/* Auth and Profile Modals */}
      <AuthModal />
      <CompleteProfileModal />
    </div>
  );
}
