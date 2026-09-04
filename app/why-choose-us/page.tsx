'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import AuthModal from '@/components/AuthModal';
import CompleteProfileModal from '@/components/CompleteProfileModal';
import { useAuth } from '@/context/AuthContext';
import {
  Target,
  FileCheck2,
  FlaskConical,
  BookOpen,
  Award,
  Users,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Clock,
  Phone,
  MapPin,
  HelpCircle,
  ChevronDown,
  Calculator,
  Compass,
  GraduationCap
} from 'lucide-react';

export default function WhyChooseUsPage() {
  const { openAuthModal } = useAuth();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const corePillars = [
    {
      id: 'first-principles',
      icon: Target,
      color: 'red',
      title: 'First-Principles Pedagogical Logic',
      description: 'Zero blind formula memorization. Every mathematical theorem, derivative, and trigonometric identity is derived from geometric and logical foundations to build permanent intuition.'
    },
    {
      id: 'dual-focus',
      icon: FileCheck2,
      color: 'amber',
      title: 'Integrated Board + JEE Synergy',
      description: 'Parallel mastery: immaculate step-by-step presentation for CBSE & State Board 95%+ marks, harmonized with high-speed option elimination and approximation tricks for JEE Main & Advanced.'
    },
    {
      id: 'cbt-testing',
      icon: FlaskConical,
      color: 'blue',
      title: 'Computer-Based Testing (CBT) Series',
      description: 'Experience real exam conditions through our online testing engine featuring official timers, negative marking (+4 / -1 rules), question palettes, and instant subject-wise percentiles.'
    },
    {
      id: 'study-material',
      icon: BookOpen,
      color: 'emerald',
      title: 'Curated Compendiums & 15-Year PYQs',
      description: 'Structured topic-wise modules, comprehensive formula handbooks, NCERT exemplar problem sets, and thoroughly solved past papers arranged by difficulty from foundational to advanced.'
    },
    {
      id: 'gamification',
      icon: Award,
      color: 'purple',
      title: 'Gamified XP & Cohort Benchmarking',
      description: 'Cultivate unbroken daily study habits. Earn XP for submitted homework sheets, preserve activity streaks, and benchmark your percentile against dedicated batch peers.'
    },
    {
      id: 'mentorship',
      icon: Users,
      color: 'indigo',
      title: 'Direct Faculty Mentorship & Doubts',
      description: 'No student is left behind. Dedicated 1-on-1 problem-solving sessions, continuous classroom attendance monitoring, and regular parent progress reports.'
    }
  ];

  const comparisonData = [
    {
      feature: 'Batch Size & Attention',
      generic: 'Overcrowded halls with 150+ students where personal attention is impossible',
      prayatna: 'Disciplined batch sizes ensuring direct faculty-to-student interaction every session'
    },
    {
      feature: 'Pedagogical Method',
      generic: 'Memorization of disconnected shortcuts without building foundational logic',
      prayatna: 'Rigorous derivation from first principles; visual graphs and algebraic reasoning'
    },
    {
      feature: 'Daily Practice & Step Marking',
      generic: 'Generic book assignments rarely inspected or evaluated individually',
      prayatna: 'Curated daily practice sheets (DPP) with step-by-step grading feedback'
    },
    {
      feature: 'Mock Examination Engine',
      generic: 'Occasional paper tests with days of delay before answer keys are shared',
      prayatna: 'Live CBT interface with instant scoring, negative marking, and step-by-step solutions'
    },
    {
      feature: 'Curriculum Coverage',
      generic: 'Fragmented syllabus leaving either Board presentations or JEE depth compromised',
      prayatna: 'Synchronized syllabus covering Board, JEE Main/Advanced, CUET, and NDA'
    },
    {
      feature: 'Parent Accountability',
      generic: 'Zero transparency into daily attendance or study completion',
      prayatna: 'Real-time attendance logs and proactive progress guidance for families'
    }
  ];

  const faqs = [
    {
      q: 'Can a student prepare for Class 11/12 Boards and JEE simultaneously at Prayatna?',
      a: 'Yes, absolutely. Our curriculum is engineered as a unified mathematical track. We cover foundational theory with full subjective proof-writing for Board exams, immediately followed by multi-concept application problems and objective speed-solving techniques required for JEE Main and Advanced.'
    },
    {
      q: 'How does the Daily Practice Problem (DPP) system work?',
      a: 'After every concept lecture, students receive a targeted practice set containing 10–15 hand-selected problems ranging from foundational to competitive difficulty. Students solve them, upload proof photos or submit online, and receive feedback with model step solutions.'
    },
    {
      q: 'What examination platforms are covered?',
      a: 'Prayatna Mathematics specializes in Class 11th & 12th Board Examinations (CBSE and Bihar State Board), JEE Main & Advanced, CUET (UG Mathematics), and NDA Mathematics.'
    },
    {
      q: 'Where is the offline learning center located and how can I visit?',
      a: 'Our main center is located at Madnani Lane, Mithanpura, Muzaffarpur, Bihar. Students and parents can visit during operational hours (8:00 AM – 7:30 PM) for batch counseling, orientation, and study material inspection.'
    },
    {
      q: 'How do I begin enrollment?',
      a: 'You can create an account directly on this website, choose your target class (Class 11 or Class 12) and preparation focus (Board, JEE, or Comprehensive), or call our academic guidance helpline at +91 7764026748 for personalized counseling.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-red-100 selection:text-red-900">
      <Header />

      <main className="flex-1 pb-16">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-white border-b border-slate-200/80 pt-10 pb-12 sm:pt-14 sm:pb-16">
          <div className="absolute inset-0 bg-radial-gradient from-red-50/50 via-transparent to-transparent pointer-events-none" />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 border border-red-200/60 text-red-700 text-xs font-semibold mb-5 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-red-600" />
                <span>Premier Coaching Excellence • Muzaffarpur</span>
              </div>

              <div className="flex justify-center mb-6">
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden shadow-md border-2 border-slate-100 bg-white p-1">
                  <Image
                    src="/logo.svg"
                    alt="Prayatna Mathematics Official Emblem"
                    width={96}
                    height={96}
                    className="w-full h-full object-contain"
                    priority
                  />
                </div>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                Why Choose <span className="text-red-600">Prayatna Mathematics</span>?
              </h1>
              
              <p className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed">
                Mathematics is not a subject of mechanical memorization—it is the art of structured reasoning. At Prayatna Mathematics, we guide Class 11 &amp; 12 students to master foundational concepts, conquer competitive examinations, and achieve academic excellence.
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <button
                  onClick={() => openAuthModal('signup')}
                  className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-md shadow-red-200 transition-all hover:scale-105 flex items-center gap-2"
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>Enroll in Target Batch</span>
                </button>
                <a
                  href="tel:+917764026748"
                  className="px-6 py-3 rounded-xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm transition-colors flex items-center gap-2"
                >
                  <Phone className="w-4 h-4 text-red-600" />
                  <span>Call Faculty (+91 7764026748)</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Core Pillars Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Our 6 Academic Pillars
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-600">
              Every aspect of the Prayatna learning framework is engineered to build unshakeable conceptual depth and peak examination speed.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {corePillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div 
                  key={pillar.id}
                  className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-all hover:-translate-y-1 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">{pillar.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{pillar.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Comparison Section: Prayatna vs Generic Coaching */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="px-6 py-8 sm:px-10 border-b border-slate-100 text-center sm:text-left">
              <span className="text-xs font-bold uppercase tracking-wider text-red-600">The Prayatna Advantage</span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                How We Differ from Generic Mass Institutes
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Real education requires individual accountability, not anonymous lecture auditoriums.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-700">
                    <th className="py-3.5 px-6 w-1/4">Aspect</th>
                    <th className="py-3.5 px-6 w-3/8 text-slate-500">Traditional Mass Coaching</th>
                    <th className="py-3.5 px-6 w-3/8 bg-red-50/50 text-red-900 border-l border-red-100">Prayatna Mathematics</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                  {comparisonData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6 font-semibold text-slate-900">{row.feature}</td>
                      <td className="py-4 px-6 text-slate-600">
                        <div className="flex items-start gap-2">
                          <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                          <span>{row.generic}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-900 bg-red-50/20 font-medium border-l border-red-100">
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{row.prayatna}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Examinations Targeted Banner */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white p-8 sm:p-12 shadow-lg border border-slate-800">
            <div className="max-w-3xl">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Target Examinations</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold mt-2 leading-tight">
                Complete Preparation Spectrum
              </h2>
              <p className="mt-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
                Whether aiming for a 100/100 in Board examinations, a 99+ percentile in JEE Main Mathematics, or qualifying for the NDA written exam, our tailored curriculum is designed for each benchmark.
              </p>

              <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
                  <div className="text-xl font-black text-amber-400">11th &amp; 12th</div>
                  <div className="text-xs text-slate-300 mt-1">CBSE &amp; State Boards</div>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
                  <div className="text-xl font-black text-emerald-400">JEE Main</div>
                  <div className="text-xs text-slate-300 mt-1">NTA CBT Platform</div>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
                  <div className="text-xl font-black text-blue-400">JEE Adv.</div>
                  <div className="text-xs text-slate-300 mt-1">Multi-Concept Depth</div>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
                  <div className="text-xl font-black text-purple-400">CUET &amp; NDA</div>
                  <div className="text-xs text-slate-300 mt-1">Speed &amp; Accuracy</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold mb-2">
              <HelpCircle className="w-3.5 h-3.5 text-slate-600" />
              Frequently Asked Questions
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Got Questions? We Have Answers.
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div 
                key={idx}
                className="rounded-xl bg-white border border-slate-200/80 overflow-hidden shadow-2xs"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex items-center justify-between p-4 sm:p-5 text-left font-semibold text-slate-900 text-sm hover:bg-slate-50 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${openFaqIndex === idx ? 'rotate-180 text-red-600' : ''}`} />
                </button>
                {openFaqIndex === idx && (
                  <div className="px-4 pb-5 pt-1 text-xs sm:text-sm text-slate-600 border-t border-slate-100 leading-relaxed bg-slate-50/50">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Center Location & Direct Call Banner */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="rounded-2xl bg-white border border-slate-200/80 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0 mt-1">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Visit Our Offline Classroom Center</h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  Madnani Lane, Mithanpura, Muzaffarpur, Bihar — 842002
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Counseling Hours: Monday – Saturday, 8:00 AM – 7:30 PM
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/contact"
                className="px-5 py-2.5 rounded-xl border border-slate-300 hover:border-slate-400 text-slate-800 text-xs font-semibold transition-colors"
              >
                Center Directions
              </Link>
              <a
                href="tel:+917764026748"
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors shadow-sm shadow-red-200 flex items-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call +91 7764026748</span>
              </a>
            </div>
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

      <BottomNav />
      <AuthModal />
      <CompleteProfileModal />
    </div>
  );
}
