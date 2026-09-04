'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import AuthModal from '@/components/AuthModal';
import CompleteProfileModal from '@/components/CompleteProfileModal';
import { ShieldCheck, Lock, Eye, Database, Server, CheckCircle2 } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-red-100 selection:text-red-900">
      <Header />

      <main className="flex-1 py-10 sm:py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Page Header */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-10 shadow-xs mb-8">
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <Lock className="w-6 h-6" />
              <span className="text-xs font-bold uppercase tracking-wider">Data Protection &amp; Confidentiality</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Privacy Policy
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              Last Updated: September 2026 • We respect the privacy of our students, parents, and website visitors.
            </p>
          </div>

          {/* Privacy Content */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-10 shadow-xs space-y-8 text-xs sm:text-sm text-slate-700 leading-relaxed">
            
            <section>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-red-100 text-red-600 inline-flex items-center justify-center text-xs font-black">1</span>
                Overview
              </h2>
              <p>
                This Privacy Policy outlines how <strong>Prayatna Mathematics</strong> collects, stores, protects, and utilizes student data and personal details collected through our learning platform, student portals, classroom enrollment records, and mobile interfaces. We are committed to maintaining the confidentiality of student educational information in compliance with Indian Information Technology laws and the Digital Personal Data Protection (DPDP) framework.
              </p>
            </section>

            <section>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-red-100 text-red-600 inline-flex items-center justify-center text-xs font-black">2</span>
                Information We Collect
              </h2>
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="font-bold text-slate-900 mb-1">A. Student Profile &amp; Contact Data</div>
                  <p className="text-slate-600">Full legal name, contact phone number, email address, enrollment target (Class 11 or Class 12), and competitive examination goal (Board, JEE Main, JEE Advanced, CUET, or NDA).</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="font-bold text-slate-900 mb-1">B. Academic &amp; Examination Records</div>
                  <p className="text-slate-600">Attendance timestamps, Daily Practice Problem (DPP) submission proofs and step-scores, CBT mock test answers, time-per-question metrics, cohort percentiles, and earned XP badges.</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="font-bold text-slate-900 mb-1">C. Technical &amp; Device Information</div>
                  <p className="text-slate-600">IP address, browser user-agent, session identifiers, and local authentication tokens used solely to maintain uninterrupted login sessions.</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-red-100 text-red-600 inline-flex items-center justify-center text-xs font-black">3</span>
                How We Use Your Data
              </h2>
              <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-600">
                <li>To grant authenticated access to mock examination series, digital textbooks, and homework portals.</li>
                <li>To compute accurate performance analytics, question accuracy rates, and cohort leaderboards.</li>
                <li>To communicate crucial academic updates, batch schedules, exam dates, and attendance reports to parents and students.</li>
                <li>To preserve exam session progress in real time in case of internet instability during CBT examinations.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-red-100 text-red-600 inline-flex items-center justify-center text-xs font-black">4</span>
                Third-Party Infrastructure &amp; Security
              </h2>
              <p className="mb-2">
                We store and transmit data using enterprise-grade cloud providers with standard TLS/SSL encryption:
              </p>
              <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-600">
                <li><strong>Firebase Authentication &amp; Realtime Database (Google Cloud)</strong>: Secure user credential hashing, session verification, and realtime academic score synchronization.</li>
                <li><strong>ImgBB Storage</strong>: Secure, programmatic hosting for student assignment proof uploads.</li>
              </ul>
              <p className="mt-2 text-slate-600">
                We do NOT sell, rent, or lease student information to any third-party marketing agencies or promotional advertisers.
              </p>
            </section>

            <section>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-red-100 text-red-600 inline-flex items-center justify-center text-xs font-black">5</span>
                Data Retention and Student Rights
              </h2>
              <p>
                Students and parents have the right to request review of their stored academic records, request corrections to profile information, or request account deactivation upon course completion by contacting our administration desk.
              </p>
            </section>

            <section className="pt-4 border-t border-slate-100">
              <h3 className="font-bold text-slate-900 mb-1">Privacy Officer &amp; Contact</h3>
              <p className="text-slate-600">
                If you have questions regarding our data privacy procedures or wish to exercise your data rights:
              </p>
              <div className="mt-3 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                <div className="font-bold text-slate-800">Prayatna Mathematics Data Desk</div>
                <div className="text-slate-600">Madnani Lane, Mithanpura, Muzaffarpur, Bihar — 842002</div>
                <div className="text-slate-600">Direct Helpline: +91 7764026748</div>
              </div>
            </section>

          </div>
        </div>
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
          
          <div className="pt-4 pb-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 border-b border-slate-100">
            <div className="flex flex-wrap items-center gap-4 font-medium">
              <Link href="/terms" className="hover:text-slate-800 transition-colors">Terms &amp; Conditions</Link>
              <span>•</span>
              <Link href="/privacy" className="text-red-600 font-bold">Privacy Policy</Link>
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

      <BottomNav />
      <AuthModal />
      <CompleteProfileModal />
    </div>
  );
}
