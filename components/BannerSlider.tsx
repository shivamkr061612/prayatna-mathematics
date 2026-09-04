'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { database } from '@/lib/firebase';
import { ref, onValue } from 'firebase/database';
import { 
  ChevronLeft, 
  ChevronRight, 
  Award, 
  Target, 
  Zap, 
  Sparkles, 
  ArrowRight,
  Calculator,
  PhoneCall,
  CheckCircle2
} from 'lucide-react';

export interface BannerDisplayItem {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  buttonText: string;
  buttonLink: string;
  phone?: string;
  active: boolean;
  order: number;
  tag?: string;
  tagColor?: string;
  bgGradient?: string;
}

const DEFAULT_BANNERS: BannerDisplayItem[] = [
  {
    id: "def-1",
    title: "Master High-Yield Calculus & Coordinate Geometry",
    description: "Systematic conceptual clarity, advanced problem solving, and targeted PYQs to secure your dream engineering seat.",
    buttonText: "Explore JEE Program",
    buttonLink: "#classes-section",
    phone: "+91 98765 43210",
    active: true,
    order: 1,
    tag: "JEE Main & Advanced 2026",
    tagColor: "bg-amber-100 text-amber-900 border-amber-300",
    bgGradient: "from-slate-950 via-indigo-950 to-slate-900"
  },
  {
    id: "def-2",
    title: "Build Rock-Solid Mathematical Foundations",
    description: "From Trigonometric Identities to Complex Numbers & Calculus basics — bridge the gap from Class 10 with confidence.",
    buttonText: "Start Class 11 Journey",
    buttonLink: "#classes-section",
    phone: "+91 98765 43210",
    active: true,
    order: 2,
    tag: "Class 11 Foundation Batch",
    tagColor: "bg-indigo-100 text-indigo-900 border-indigo-300",
    bgGradient: "from-indigo-950 via-blue-950 to-indigo-950"
  },
  {
    id: "def-3",
    title: "Score a Flawless 100 in Class 12 Board Maths",
    description: "Comprehensive NCERT line-by-line mastery, exemplar proofs, presentation tricks, and sample paper discussions.",
    buttonText: "Join Board 100 Mission",
    buttonLink: "#classes-section",
    phone: "+91 98765 43210",
    active: true,
    order: 3,
    tag: "Class 12 Board 100/100 Target",
    tagColor: "bg-emerald-100 text-emerald-900 border-emerald-300",
    bgGradient: "from-slate-950 via-teal-950 to-slate-950"
  },
  {
    id: "def-4",
    title: "Personalized Doubt Resolution & Guidance",
    description: "No student left behind. Clear conceptual roadblocks instantly with expert mathematics faculty guidance.",
    buttonText: "Know More About Mentorship",
    buttonLink: "#classes-section",
    phone: "+91 98765 43210",
    active: true,
    order: 4,
    tag: "1-on-1 Mentorship & Doubts",
    tagColor: "bg-purple-100 text-purple-900 border-purple-300",
    bgGradient: "from-indigo-950 via-purple-950 to-slate-950"
  }
];

export default function BannerSlider() {
  const [banners, setBanners] = useState<BannerDisplayItem[]>(DEFAULT_BANNERS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Subscribe to dynamic banners from Firebase Realtime Database
  useEffect(() => {
    try {
      const bannersRef = ref(database, 'banners');
      const unsubscribe = onValue(bannersRef, (snapshot) => {
        if (snapshot.exists()) {
          const val = snapshot.val();
          const items: BannerDisplayItem[] = Object.keys(val).map((key) => {
            const b = val[key];
            return {
              id: key,
              title: b.title || 'Prayatna Mathematics',
              description: b.description || '',
              imageUrl: b.imageUrl || '',
              buttonText: b.buttonText || 'Explore Batches',
              buttonLink: b.buttonLink || '#classes-section',
              phone: b.phone || '',
              active: b.active !== false,
              order: typeof b.order === 'number' ? b.order : 99,
              tag: b.tag || 'Academic Program',
              tagColor: b.tagColor || 'bg-amber-100 text-amber-900 border-amber-300',
              bgGradient: b.bgGradient || 'from-slate-950 via-indigo-950 to-slate-900'
            };
          });

          // Filter only ACTIVE banners and sort by order ascending
          const activeBanners = items
            .filter((b) => b.active)
            .sort((a, b) => a.order - b.order);

          if (activeBanners.length > 0) {
            setBanners(activeBanners);
          } else {
            // Keep default if none are marked active
            setBanners(DEFAULT_BANNERS);
          }
        } else {
          setBanners(DEFAULT_BANNERS);
        }
      }, (err) => {
        console.error("Firebase banners subscription error:", err);
      });

      return () => unsubscribe();
    } catch (err) {
      console.error("Error setting up banners listener:", err);
    }
  }, []);

  const totalSlides = banners.length;
  const safeCurrentIndex = totalSlides > 0 ? (currentIndex % totalSlides + totalSlides) % totalSlides : 0;
  const activeBanner = banners[safeCurrentIndex] || banners[0];

  // Safe slide navigation
  const nextSlide = useCallback(() => {
    if (totalSlides === 0) return;
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    if (totalSlides === 0) return;
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  // Automatic horizontal slider (5 seconds interval)
  useEffect(() => {
    if (isPaused || totalSlides <= 1) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(timer);
  }, [isPaused, totalSlides, nextSlide]);

  // Touch Swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (distance > minSwipeDistance) {
      nextSlide();
    } else if (distance < -minSwipeDistance) {
      prevSlide();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  if (banners.length === 0) {
    return null;
  }

  return (
    <section 
      id="hero-banner-section" 
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-2"
      aria-label="Promotional Banners"
    >
      {/* 1. Main 16:9 Banner Visual Frame */}
      <div 
        className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden shadow-md border border-slate-200 bg-slate-950 group select-none"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {banners.map((banner, index) => {
          const isActive = index === safeCurrentIndex;

          return (
            <div
              key={banner.id}
              className={`absolute inset-0 transition-opacity duration-600 ease-in-out ${
                isActive ? "opacity-100 z-10 pointer-events-auto" : "opacity-0 z-0 pointer-events-none"
              }`}
            >
              {banner.imageUrl ? (
                <a
                  href={banner.buttonLink || "#classes-section"}
                  className="block w-full h-full relative"
                  title={banner.title}
                >
                  <img
                    src={banner.imageUrl}
                    alt={banner.title}
                    className="w-full h-full object-cover"
                    loading={index === 0 ? "eager" : "lazy"}
                  />
                </a>
              ) : (
                /* Sleek fallback mathematical gradient banner */
                <div 
                  className={`w-full h-full flex flex-col items-center justify-center p-6 sm:p-10 text-center bg-gradient-to-br ${
                    banner.bgGradient || "from-slate-950 via-indigo-950 to-slate-900"
                  } relative overflow-hidden`}
                >
                  <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden flex items-center justify-center">
                    <span className="font-serif text-[180px] sm:text-[260px] md:text-[340px] font-bold text-white select-none leading-none">
                      ∫
                    </span>
                  </div>
                  <div className="relative z-10 max-w-xl">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30 mb-3">
                      <Sparkles className="w-3.5 h-3.5" />
                      {banner.tag || "Prayatna Mathematics"}
                    </span>
                    <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
                      {banner.title}
                    </h2>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Overlay Prev / Next Controls on 16:9 Banner */}
        {totalSlides > 1 && (
          <>
            <button
              id="banner-prev-btn"
              onClick={prevSlide}
              aria-label="Previous Banner"
              className="absolute left-2.5 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md flex items-center justify-center border border-white/25 transition-all opacity-80 group-hover:opacity-100 hover:scale-105"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            <button
              id="banner-next-btn"
              onClick={nextSlide}
              aria-label="Next Banner"
              className="absolute right-2.5 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md flex items-center justify-center border border-white/25 transition-all opacity-80 group-hover:opacity-100 hover:scale-105"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </>
        )}
      </div>

      {/* 2. Text Below the Banners (Properly visible, readable & well-aligned) */}
      {activeBanner && (
        <div className="mt-3 sm:mt-4 p-4 sm:p-5 md:p-6 bg-white rounded-2xl border border-slate-200 shadow-sm transition-all duration-300">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Left Content Area */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border shadow-xs ${
                  activeBanner.tagColor || "bg-amber-100 text-amber-900 border-amber-300"
                }`}>
                  <Sparkles className="w-3.5 h-3.5" />
                  {activeBanner.tag || "Academic Program"}
                </span>

                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                  <Zap className="w-3 h-3 text-amber-500" />
                  Slide {safeCurrentIndex + 1} of {totalSlides}
                </span>
              </div>

              <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-extrabold text-slate-900 tracking-tight leading-snug">
                {activeBanner.title}
              </h2>

              {activeBanner.description && (
                <p className="mt-1.5 text-xs sm:text-sm md:text-base text-slate-600 leading-relaxed max-w-3xl">
                  {activeBanner.description}
                </p>
              )}
            </div>

            {/* Right Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
              <a
                href={activeBanner.buttonLink || "#classes-section"}
                className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs sm:text-sm shadow-sm transition-all hover:gap-2.5"
              >
                <span>{activeBanner.buttonText || "Explore Batches"}</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              {activeBanner.phone && (
                <a
                  href={`tel:${activeBanner.phone.replace(/[^0-9+]/g, '')}`}
                  className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 text-emerald-800 border border-emerald-200 font-semibold text-xs sm:text-sm transition-colors"
                  title={`Call ${activeBanner.phone}`}
                >
                  <PhoneCall className="w-4 h-4 text-emerald-600" />
                  <span>Call {activeBanner.phone}</span>
                </a>
              )}
            </div>
          </div>

          {/* Dots Pagination & Slide Counter Bar */}
          {totalSlides > 1 && (
            <div className="mt-3 sm:mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-1.5 sm:gap-2">
                {banners.map((b, idx) => (
                  <button
                    key={b.id}
                    id={`banner-dot-${idx}`}
                    onClick={() => setCurrentIndex(idx)}
                    aria-label={`Go to slide ${idx + 1}`}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      idx === safeCurrentIndex 
                        ? "w-6 sm:w-8 bg-indigo-600" 
                        : "w-2 bg-slate-200 hover:bg-slate-300"
                    }`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                <button
                  onClick={prevSlide}
                  className="p-1 rounded-md hover:bg-slate-100 text-slate-600 transition-colors"
                  aria-label="Previous Slide"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span>{safeCurrentIndex + 1} / {totalSlides}</span>
                <button
                  onClick={nextSlide}
                  className="p-1 rounded-md hover:bg-slate-100 text-slate-600 transition-colors"
                  aria-label="Next Slide"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
