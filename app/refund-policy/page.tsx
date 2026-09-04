'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import AuthModal from '@/components/AuthModal';
import CompleteProfileModal from '@/components/CompleteProfileModal';
import { CreditCard, RotateCcw, Clock, AlertTriangle, CheckCircle2, Phone } from 'lucide-react';

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-red-100 selection:text-red-900">
      <Header />

      <main className="flex-1 py-10 sm:py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Page Header */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-10 shadow-xs mb-8">
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <RotateCcw className="w-6 h-6" />
              <span className="text-xs font-bold uppercase tracking-wider">Fee Regulations &amp; Adjustments</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Refund &amp; Cancellation Policy
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              Last Updated: September 2026 • Clear, transparent fee terms for student enrollments and academic sessions.
            </p>
          </div>

          {/* Policy Body */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-10 shadow-xs space-y-8 text-xs sm:text-sm text-slate-700 leading-relaxed">
            
            <section>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-red-100 text-red-600 inline-flex items-center justify-center text-xs font-black">1</span>
                General Principles
              </h2>
              <p>
                At <strong>Prayatna Mathematics</strong>, we are committed to transparent, fair academic practices. When a student enrolls in our Class 11, Class 12, Board, or JEE target batches, faculty hours and batch seats are allocated specifically for them. We have established this Refund &amp; Cancellation Policy to outline timelines and terms in the event of enrollment withdrawal.
              </p>
            </section>

            <section>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-red-100 text-red-600 inline-flex items-center justify-center text-xs font-black">2</span>
                Batch Withdrawal Refund Schedule
              </h2>
              
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-bold text-emerald-900">Withdrawal Prior to Batch Commencement</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-200 text-emerald-900 text-xs font-bold">100% Refundable</span>
                  </div>
                  <p className="text-emerald-800 text-xs">
                    If written request is received before the first lecture of the batch commences, 100% of the tuition fee paid is refunded, minus a nominal processing charge (₹500) for administrative setup.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-bold text-blue-900">Withdrawal Within 7 Days of Batch Start</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-200 text-blue-900 text-xs font-bold">75% Refundable</span>
                  </div>
                  <p className="text-blue-800 text-xs">
                    If written request is submitted within 7 calendar days from the date of the first scheduled lecture, 75% of the tuition fee is eligible for refund after deducting study materials provided.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-bold text-amber-900">Withdrawal Between 8 to 14 Days</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-900 text-xs font-bold">50% Refundable</span>
                  </div>
                  <p className="text-amber-800 text-xs">
                    Eligible for a 50% refund of the unconsumed tuition fees.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-bold text-rose-900">Withdrawal After 14 Days</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-200 text-rose-900 text-xs font-bold">Non-Refundable</span>
                  </div>
                  <p className="text-rose-800 text-xs">
                    Due to locked batch quotas, syllabus commitments, and teacher allocations, no refunds are granted after 14 calendar days from the commencement of classes.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-red-100 text-red-600 inline-flex items-center justify-center text-xs font-black">3</span>
                Digital Resources and Physical Study Compendiums
              </h2>
              <p>
                Printed module books, formula sheets, NCERT exemplar problem binders, and digital CBT mock test account access tokens issued to the student at the time of admission are non-refundable once activated or handed over.
              </p>
            </section>

            <section>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-red-100 text-red-600 inline-flex items-center justify-center text-xs font-black">4</span>
                Refund Request Process &amp; Timeline
              </h2>
              <p className="mb-2">
                To request an enrollment cancellation or refund:
              </p>
              <ol className="list-decimal list-inside space-y-1.5 pl-2 text-slate-600">
                <li>Submit a formal written application signed by the parent/guardian at our offline center or via email with the fee receipt.</li>
                <li>Our academic administration office verifies attendance and eligibility within 48 business hours.</li>
                <li>Approved refunds are credited directly to the original bank account via NEFT/RTGS/UPI within <strong>5 to 7 business days</strong>.</li>
              </ol>
            </section>

            <section className="pt-4 border-t border-slate-100">
              <h3 className="font-bold text-slate-900 mb-1">Fee Desk Assistance</h3>
              <p className="text-slate-600">
                For assistance regarding fee payments, installment schedules, or refund status:
              </p>
              <div className="mt-3 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                <div className="font-bold text-slate-800">Prayatna Mathematics Accounts Desk</div>
                <div className="text-slate-600">Madnani Lane, Mithanpura, Muzaffarpur, Bihar — 842002</div>
                <div className="text-slate-600">Direct Helpline: +91 7764026748 (Monday – Saturday, 9:00 AM – 6:00 PM)</div>
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
              <Link href="/privacy" className="hover:text-slate-800 transition-colors">Privacy Policy</Link>
              <span>•</span>
              <Link href="/refund-policy" className="text-red-600 font-bold">Refund &amp; Cancellation Policy</Link>
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
