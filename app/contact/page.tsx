'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import AuthModal from '@/components/AuthModal';
import CompleteProfileModal from '@/components/CompleteProfileModal';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle2,
  Sparkles,
  MessageSquare,
  HelpCircle,
  Compass
} from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    targetClass: 'Class 11',
    goal: 'JEE Main & Advanced',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) return;

    setLoading(true);
    // Simulate inquiry dispatch
    setTimeout(() => {
      setLoading(false);
      setIsSubmitted(true);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-red-100 selection:text-red-900">
      <Header />

      <main className="flex-1 py-10 sm:py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header Banner */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-10 shadow-xs mb-8 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 text-red-600 mb-2">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Academic Guidance &amp; Support Desk</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Contact Prayatna Mathematics
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-2xl">
              Have questions regarding our target batches, DPP curriculum, mock test series, or classroom admissions? Reach out to our faculty advisors directly.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Details Column */}
            <div className="space-y-4 lg:col-span-1">
              
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mb-3">
                  <MapPin className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Classroom Learning Center</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Madnani Lane, Mithanpura,<br />
                  Muzaffarpur, Bihar — 842002
                </p>
                <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
                  Landmark: Close to Mithanpura Chowk
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
                  <Phone className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Direct Phone &amp; WhatsApp</h3>
                <p className="text-xs text-slate-600 mt-1">
                  Faculty &amp; Admissions Helpline:
                </p>
                <a 
                  href="tel:+917764026748" 
                  className="mt-2 inline-flex items-center gap-1.5 text-base font-extrabold text-red-600 hover:text-red-700 transition-colors"
                >
                  <span>+91 7764026748</span>
                </a>
                <p className="text-[11px] text-slate-600 mt-1">Available 8:00 AM – 8:00 PM</p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                  <Clock className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Center Operating Hours</h3>
                <div className="mt-2 space-y-1 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Mon – Sat:</span>
                    <span className="font-semibold text-slate-800">8:00 AM – 7:30 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sunday:</span>
                    <span className="font-semibold text-slate-800">9:00 AM – 2:00 PM (Mock Tests)</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Inquiry Form Column */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-10 shadow-xs">
                {isSubmitted ? (
                  <div className="text-center py-10">
                    <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center mb-4">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">Inquiry Received Successfully!</h3>
                    <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-md mx-auto">
                      Thank you, <strong>{formData.name}</strong>. Our faculty coordinator will contact you at <strong>{formData.phone}</strong> shortly to discuss target batches and course details.
                    </p>
                    <button
                      onClick={() => {
                        setIsSubmitted(false);
                        setFormData({
                          name: '',
                          phone: '',
                          targetClass: 'Class 11',
                          goal: 'JEE Main & Advanced',
                          message: ''
                        });
                      }}
                      className="mt-6 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors"
                    >
                      Send Another Inquiry
                    </button>
                  </div>
                ) : (
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 mb-1">Request Academic Counseling</h2>
                    <p className="text-xs text-slate-500 mb-6">
                      Fill in your details below and our senior advisor will contact you with batch schedules, syllabus blueprints, and fee structures.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Student Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Rahul Kumar"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Mobile / WhatsApp Number <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="tel"
                            required
                            placeholder="e.g. 9876543210"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Current Class / Level
                          </label>
                          <select
                            value={formData.targetClass}
                            onChange={(e) => setFormData({ ...formData, targetClass: e.target.value })}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600"
                          >
                            <option value="Class 11">Class 11 (Foundation)</option>
                            <option value="Class 12">Class 12 (Board + Competitive)</option>
                            <option value="Dropper / Repeater">Dropper / 12th Pass</option>
                            <option value="Pre-Foundation">Class 10 moving to 11</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Primary Focus Goal
                          </label>
                          <select
                            value={formData.goal}
                            onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600"
                          >
                            <option value="JEE Main & Advanced">JEE Main &amp; Advanced</option>
                            <option value="CBSE / State Board 95%+">CBSE / State Board (95%+)</option>
                            <option value="Integrated Board + JEE">Integrated Board + JEE</option>
                            <option value="CUET & NDA">CUET &amp; NDA Mathematics</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Questions / Specific Queries (Optional)
                        </label>
                        <textarea
                          rows={4}
                          placeholder="Ask about batch timings, fee installments, or study materials..."
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600"
                        />
                      </div>

                      <div className="pt-2">
                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 disabled:bg-slate-300 text-white font-bold text-xs sm:text-sm transition-colors shadow-sm shadow-red-200 flex items-center justify-center gap-2"
                        >
                          <Send className="w-4 h-4" />
                          <span>{loading ? 'Submitting...' : 'Submit Inquiry'}</span>
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>
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
              <Link href="/refund-policy" className="hover:text-slate-800 transition-colors">Refund &amp; Cancellation Policy</Link>
              <span>•</span>
              <Link href="/contact" className="text-red-600 font-bold">Grievance &amp; Help Desk</Link>
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
