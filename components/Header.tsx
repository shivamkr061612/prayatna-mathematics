'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { 
  GraduationCap, 
  Menu, 
  X, 
  User as UserIcon, 
  LogOut, 
  ShieldAlert, 
  ChevronRight,
  Sparkles,
  BookOpen,
  FileCheck2,
  ClipboardList,
  Trophy,
  History,
  TrendingUp,
  CalendarCheck
} from 'lucide-react';

export default function Header() {
  const { user, userData, logout, openAuthModal, openCompleteProfile } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const isAdmin = userData?.role === 'admin' || (userData?.email && userData.email.includes('techshivam'));

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          
          {/* Logo & Brand */}
          <Link 
            href="/" 
            id="header-brand-logo"
            className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-lg p-1"
          >
            <div className="relative w-11 h-11 rounded-full overflow-hidden shadow-md shadow-slate-200 group-hover:scale-105 transition-transform duration-200 border border-slate-200/80 bg-white shrink-0">
              <Image 
                src="/logo.svg" 
                alt="Prayatna Mathematics Official Logo" 
                width={44} 
                height={44} 
                className="w-full h-full object-contain p-0.5"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-slate-900 font-sans group-hover:text-red-600 transition-colors">
                Prayatna <span className="text-red-600 font-bold">Mathematics</span>
              </span>
              <span className="text-xs font-semibold text-slate-600 tracking-wide">
                11th & 12th • JEE • CUET • NDA
              </span>
            </div>
          </Link>

          {/* Desktop Navigation & Actions */}
          <div className="hidden md:flex items-center gap-6">
            <nav className="flex items-center gap-6">
              <Link 
                href="/#classes-section" 
                className="text-sm font-medium text-slate-700 hover:text-indigo-600 transition-colors flex items-center gap-1.5"
              >
                <GraduationCap className="w-4 h-4 text-indigo-500" />
                Target Batches
              </Link>
              <Link 
                href="/books" 
                className="text-sm font-medium text-slate-700 hover:text-indigo-600 transition-colors flex items-center gap-1.5"
              >
                <BookOpen className="w-4 h-4 text-indigo-600" />
                Study Books
              </Link>
              <Link 
                href="/homework" 
                className="text-sm font-medium text-slate-700 hover:text-indigo-600 transition-colors flex items-center gap-1.5"
              >
                <FileCheck2 className="w-4 h-4 text-emerald-600" />
                Homework
              </Link>
              <Link 
                href="/tests" 
                className="text-sm font-medium text-slate-700 hover:text-indigo-600 transition-colors flex items-center gap-1.5"
              >
                <ClipboardList className="w-4 h-4 text-indigo-600" />
                Mock Tests
              </Link>
              <Link 
                href="/leaderboard" 
                className="text-sm font-medium text-slate-700 hover:text-indigo-600 transition-colors flex items-center gap-1.5"
              >
                <Trophy className="w-4 h-4 text-amber-500" />
                Leaderboard
              </Link>
              <Link 
                href="/why-choose-us" 
                className="text-sm font-medium text-slate-700 hover:text-indigo-600 transition-colors flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                Why Prayatna
              </Link>
            </nav>

            {/* Auth Buttons / User Profile */}
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              {user ? (
                <div className="relative">
                  <button
                    id="header-user-menu-btn"
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full hover:bg-slate-100 border border-slate-200 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {userData?.photoURL ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img 
                        src={userData.photoURL} 
                        alt={userData.name || 'User'} 
                        className="w-8 h-8 rounded-full object-cover border border-indigo-200"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                        {userData?.name ? userData.name.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase() || 'U'}
                      </div>
                    )}
                    <div className="text-left leading-none">
                      <div className="text-sm font-semibold text-slate-800 line-clamp-1 max-w-[120px]">
                        {userData?.name || user.email?.split('@')[0]}
                      </div>
                      <div className="text-[11px] font-medium text-indigo-600 capitalize">
                        {userData?.role || 'student'}
                      </div>
                    </div>
                  </button>

                  {/* Dropdown Menu */}
                  {userDropdownOpen && (
                    <div 
                      className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                      onMouseLeave={() => setUserDropdownOpen(false)}
                    >
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs text-slate-700">Signed in as</p>
                        <p className="text-sm font-semibold text-slate-900 truncate">{user.email}</p>
                        {userData?.class && (
                          <span className="inline-block mt-1 text-[11px] font-medium px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                            {userData.class} • {userData.preparation || 'General'}
                          </span>
                        )}
                      </div>

                      <Link
                        href="/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                      >
                        <UserIcon className="w-4 h-4 text-slate-600" />
                        My Profile & Enrollment
                      </Link>

                      <Link
                        href="/attendance"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                      >
                        <CalendarCheck className="w-4 h-4 text-emerald-600" />
                        My Attendance
                      </Link>

                      <Link
                        href="/performance"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                      >
                        <TrendingUp className="w-4 h-4 text-indigo-600" />
                        My Performance
                      </Link>

                      <Link
                        href="/test-history"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                      >
                        <History className="w-4 h-4 text-slate-600" />
                        My Test History
                      </Link>

                      <Link
                        href="/leaderboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                      >
                        <Trophy className="w-4 h-4 text-amber-500" />
                        Cohort Leaderboard
                      </Link>

                      {isAdmin && (
                        <a
                          href="/admin/index.html"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-indigo-700 font-medium hover:bg-indigo-50 transition-colors"
                        >
                          <ShieldAlert className="w-4 h-4 text-indigo-600" />
                          Admin Dashboard
                        </a>
                      )}

                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <button
                    id="header-login-btn"
                    onClick={() => openAuthModal('login')}
                    className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-indigo-700 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    Login
                  </button>
                  <button
                    id="header-signup-btn"
                    onClick={() => openAuthModal('signup')}
                    className="px-4.5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-sm shadow-indigo-200 transition-all"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex md:hidden items-center gap-2">
            {user && (
              <Link
                href="/profile"
                className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs border border-indigo-200"
              >
                {userData?.photoURL ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={userData.photoURL} alt="User" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span>{userData?.name ? userData.name.charAt(0).toUpperCase() : 'U'}</span>
                )}
              </Link>
            )}
            <button
              id="header-mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-4 shadow-lg animate-in slide-in-from-top-4 duration-200">
          <nav className="space-y-1">
            <Link
              href="/#classes-section"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600"
            >
              <div className="flex items-center gap-2.5">
                <GraduationCap className="w-4 h-4 text-indigo-600" />
                <span>Target Batches (Class 11 & 12)</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </Link>
            <Link
              href="/books"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600"
            >
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                <span>Books & Study Material</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </Link>
            <Link
              href="/homework"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600"
            >
              <div className="flex items-center gap-2.5">
                <FileCheck2 className="w-4 h-4 text-emerald-600" />
                <span>Homework & DPPs</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </Link>
            <Link
              href="/tests"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600"
            >
              <div className="flex items-center gap-2.5">
                <ClipboardList className="w-4 h-4 text-indigo-600" />
                <span>Mock Tests Series</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </Link>
            <Link
              href="/leaderboard"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600"
            >
              <div className="flex items-center gap-2.5">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span>Cohort Leaderboard</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </Link>
            <Link
              href="/attendance"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600"
            >
              <div className="flex items-center gap-2.5">
                <CalendarCheck className="w-4 h-4 text-emerald-600" />
                <span>My Attendance</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </Link>
            <Link
              href="/performance"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600"
            >
              <div className="flex items-center gap-2.5">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                <span>My Performance Analytics</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </Link>
            <Link
              href="/test-history"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600"
            >
              <div className="flex items-center gap-2.5">
                <History className="w-4 h-4 text-slate-600" />
                <span>My Test History</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </Link>
            <Link
              href="/why-choose-us"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600"
            >
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Why Prayatna Mathematics</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </Link>

            <div className="pt-2 mt-2 border-t border-slate-100">
              <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Legal &amp; Support
              </div>
              <div className="grid grid-cols-2 gap-1 px-1 py-1 text-xs text-slate-600">
                <Link 
                  href="/terms" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-2 py-1.5 rounded hover:bg-slate-100 hover:text-slate-900"
                >
                  Terms &amp; Conditions
                </Link>
                <Link 
                  href="/privacy" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-2 py-1.5 rounded hover:bg-slate-100 hover:text-slate-900"
                >
                  Privacy Policy
                </Link>
                <Link 
                  href="/refund-policy" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-2 py-1.5 rounded hover:bg-slate-100 hover:text-slate-900"
                >
                  Refund Policy
                </Link>
                <Link 
                  href="/contact" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-2 py-1.5 rounded hover:bg-slate-100 hover:text-slate-900"
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </nav>

          <div className="pt-3 border-t border-slate-100">
            {user ? (
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg">
                  <div className="w-9 h-9 rounded-full bg-indigo-600 text-white font-semibold flex items-center justify-center text-sm">
                    {userData?.photoURL ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={userData.photoURL} alt="User" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      userData?.name?.charAt(0).toUpperCase() || 'U'
                    )}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-semibold text-slate-800 truncate">{userData?.name || user.email}</p>
                    <p className="text-xs text-slate-700 truncate">{user.email}</p>
                  </div>
                </div>

                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-indigo-50 text-indigo-700 font-semibold text-sm hover:bg-indigo-100 transition-colors"
                >
                  <UserIcon className="w-4 h-4" />
                  View & Edit Profile
                </Link>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-rose-600 font-medium text-sm hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthModal('login');
                  }}
                  className="py-2.5 px-4 rounded-lg border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors"
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthModal('signup');
                  }}
                  className="py-2.5 px-4 rounded-lg bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
