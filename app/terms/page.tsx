'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import AuthModal from '@/components/AuthModal';
import CompleteProfileModal from '@/components/CompleteProfileModal';
import { ShieldCheck, FileText, Scale, AlertCircle, Phone, MapPin } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-red-100 selection:text-red-900">
      <Header />

      <main className="flex-1 py-10 sm:py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Page Header */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-10 shadow-xs mb-8">
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <Scale className="w-6 h-6" />
              <span className="text-xs font-bold uppercase tracking-wider">Legal Agreements &amp; Policies</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Terms and Conditions
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              Last Updated: September 2026 • Effective for all enrolled students, platform users, and prospective candidates.
            </p>
          </div>

          {/* Policy Body */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-10 shadow-xs space-y-8 text-xs sm:text-sm text-slate-700 leading-relaxed">
            
            <section>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-red-100 text-red-600 inline-flex items-center justify-center text-xs font-black">1</span>
                Introduction and Acceptance
              </h2>
              <p>
                Welcome to <strong>Prayatna Mathematics</strong> (&quot;Institute&quot;, &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;), having its educational coaching premises situated at Madnani Lane, Mithanpura, Muzaffarpur, Bihar. By accessing our website, portal, mobile interface, or enrolling in our academic coaching batches for Class 11, Class 12, CBSE/State Board preparation, JEE Main &amp; Advanced, CUET, or NDA, you unconditionally agree to be bound by these Terms and Conditions.
              </p>
            </section>

            <section>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-red-100 text-red-600 inline-flex items-center justify-center text-xs font-black">2</span>
                Student Account and Verification
              </h2>
              <p className="mb-2">
                To access personalized study resources, Daily Practice Problems (DPP), Computer-Based Testing (CBT), and attendance tracking:
              </p>
              <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-600">
                <li>You must provide accurate, current, and authentic credentials, including your full legal name, valid mobile number, and target class.</li>
                <li>You are responsible for safeguarding your login credentials and preventing unauthorized third-party access.</li>
                <li>Account sharing, transfer of subscription rights, or impersonation of another student during examinations is strictly prohibited.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-red-100 text-red-600 inline-flex items-center justify-center text-xs font-black">3</span>
                Intellectual Property Rights
              </h2>
              <p>
                All study modules, test papers, question banks, solution derivations, video lectures, formula compendiums, and digital software engines available on this platform are the sole proprietary intellectual property of <strong>Prayatna Mathematics</strong>. Downloading, reproducing, republishing, reselling, or disseminating any material without express prior written consent is punishable under applicable copyright laws.
              </p>
            </section>

            <section>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-red-100 text-red-600 inline-flex items-center justify-center text-xs font-black">4</span>
                Examination Conduct and Academic Integrity
              </h2>
              <p className="mb-2">
                All students taking CBT Mock Tests or submitting Daily Practice Problems agree to uphold the highest standards of academic integrity:
              </p>
              <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-600">
                <li>Tests must be taken without the unauthorized assistance of calculators, mathematical solvers, or external aid unless explicitly designated.</li>
                <li>Any student detected using unfair means, multiple account manipulation, or attempting to hack test timers will have their score voided and access suspended.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-red-100 text-red-600 inline-flex items-center justify-center text-xs font-black">5</span>
                Classroom and Attendance Discipline
              </h2>
              <p>
                Enrolled students are expected to maintain at least 85% attendance in classroom sessions and homework submissions. Habitual unexcused absence, disruptive behavior in physical or digital spaces, or damage to institute property will attract immediate disciplinary action.
              </p>
            </section>

            <section>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-red-100 text-red-600 inline-flex items-center justify-center text-xs font-black">6</span>
                Disclaimers and Limitation of Liability
              </h2>
              <p>
                While Prayatna Mathematics provides premier pedagogical guidance, comprehensive study materials, and rigorous testing, individual examination results (including board percentages and competitive percentiles) depend intrinsically upon each student&apos;s personal effort, discipline, and performance. The Institute does not guarantee specific ranks or college admissions.
              </p>
            </section>

            <section>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-red-100 text-red-600 inline-flex items-center justify-center text-xs font-black">7</span>
                Governing Law and Legal Jurisdiction
              </h2>
              <p>
                These terms shall be governed by and construed in accordance with the laws of India. Any disputes, claims, or proceedings arising out of or in connection with enrollment or platform usage shall be subject exclusively to the jurisdiction of the competent courts in <strong>Muzaffarpur, Bihar</strong>.
              </p>
            </section>

            <section className="pt-4 border-t border-slate-100">
              <h3 className="font-bold text-slate-900 mb-1">Inquiries and Grievances</h3>
              <p className="text-slate-600">
                For questions regarding these Terms &amp; Conditions or academic regulations, contact our administrative office at:
              </p>
              <div className="mt-3 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                <div className="font-bold text-slate-800">Prayatna Mathematics Academic Office</div>
                <div className="text-slate-600">Madnani Lane, Mithanpura, Muzaffarpur, Bihar — 842002</div>
                <div className="text-slate-600">Helpline: +91 7764026748</div>
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
              <Link href="/terms" className="text-red-600 font-bold">Terms &amp; Conditions</Link>
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

      <BottomNav />
      <AuthModal />
      <CompleteProfileModal />
    </div>
  );
}
