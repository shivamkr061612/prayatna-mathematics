'use client';

import React from 'react';
import Header from '@/components/Header';
import TestsSection from '@/components/TestsSection';
import BottomNav from '@/components/BottomNav';
import AuthModal from '@/components/AuthModal';
import CompleteProfileModal from '@/components/CompleteProfileModal';
import Link from 'next/link';
import { 
  FlaskConical, 
  Home, 
  ChevronRight, 
  Trophy, 
  History, 
  TrendingUp, 
  Clock 
} from 'lucide-react';

export default function TestsPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Universal Header */}
      <Header />

      {/* Main Content Area */}
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
              <span className="text-indigo-700 font-semibold">Mock Tests</span>
            </nav>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-2">
                  <FlaskConical className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Exam Simulation</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Mock Tests & Examination Engine
                </h1>
                <p className="mt-1 text-xs sm:text-sm text-slate-600 max-w-2xl">
                  Timed tests with real CBT exam interface, instant score calculation, negative marking, and in-depth performance analysis.
                </p>
              </div>

              <div className="flex items-center gap-2.5 sm:gap-3">
                <Link
                  href="/test-history"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                >
                  <History className="w-3.5 h-3.5 text-slate-500" />
                  <span>Attempt History</span>
                </Link>
                <Link
                  href="/performance"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition-colors"
                >
                  <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Analytics</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Full Interactive Tests Module */}
        <div className="mt-4 sm:mt-6">
          <TestsSection />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 mb-16 md:mb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} Prayatna Mathematics. Mock test questions and automated evaluation system.
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
