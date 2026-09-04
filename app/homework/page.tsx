'use client';

import React from 'react';
import Header from '@/components/Header';
import HomeworkSection from '@/components/HomeworkSection';
import BottomNav from '@/components/BottomNav';
import AuthModal from '@/components/AuthModal';
import CompleteProfileModal from '@/components/CompleteProfileModal';
import Link from 'next/link';
import { 
  FileText, 
  Home, 
  ChevronRight, 
  Sparkles, 
  Calendar, 
  CheckCircle2, 
  Clock 
} from 'lucide-react';

export default function HomeworkPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Universal Header */}
      <Header />

      {/* Main Content Area with BottomNav padding */}
      <main className="flex-1 pb-24 sm:pb-28">
        {/* Page Breadcrumb & Header Hero */}
        <div className="bg-white border-b border-slate-200 py-6 sm:py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Breadcrumb Navigation */}
            <nav className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-3" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-indigo-600 transition-colors flex items-center gap-1">
                <Home className="w-3.5 h-3.5" />
                <span>Home</span>
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-indigo-700 font-semibold">Homework & DPP</span>
            </nav>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-2">
                  <FileText className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Academic Practice</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Homework & DPP Assignments
                </h1>
                <p className="mt-1 text-xs sm:text-sm text-slate-600 max-w-2xl">
                  Daily practice problem sheets, board step-marking assignments, and high-difficulty JEE drill questions.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href="/tests"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                >
                  <span>Go to Mock Tests</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href="/books"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition-colors"
                >
                  <span>Open Books Library</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Full Interactive Homework Module */}
        <div className="mt-4 sm:mt-6">
          <HomeworkSection />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 mb-16 md:mb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} Prayatna Mathematics. Practice sheets are copyrighted to Prayatna Mathematics Coaching.
        </div>
      </footer>

      {/* Fixed Bottom Mobile Navigation Toolbar */}
      <BottomNav />

      {/* Global Modals */}
      <AuthModal />
      <CompleteProfileModal />
    </div>
  );
}
