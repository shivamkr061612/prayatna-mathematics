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
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-4"
      aria-label="Promotional Banners"
    >
      <div 
        className="relative w-full rounded-2xl overflow-hidden shadow-xl border border-slate-200 group select-none bg-slate-900"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* 16:9 Aspect Ratio Container */}
        <div className="relative w-full aspect-[16/9] min-h-[380px] sm:min-h-[420px] md:min-h-[460px]">
          {banners.map((banner, index) => {
            const isActive = index === safeCurrentIndex;

            return (
              <div
                key={banner.id}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out flex items-center justify-between p-6 sm:p-10 md:p-14 bg-gradient-to-br ${
                  banner.bgGradient || "from-slate-950 via-indigo-950 to-slate-900"
                } ${
                  isActive ? "opacity-100 z-10 pointer-events-auto" : "opacity-0 z-0 pointer-events-none"
                }`}
                style={
                  banner.imageUrl
                    ? {
                        backgroundImage: `linear-gradient(to right, rgba(15, 23, 42, 0.94) 30%, rgba(15, 23, 42, 0.82) 70%, rgba(15, 23, 42, 0.7) 100%), url(${banner.imageUrl})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }
                    : undefined
                }
              >
                {/* Background Geometric Decor (if no custom image) */}
                {!banner.imageUrl && (
                  <div className="absolute right-0 top-0 w-1/2 h-full opacity-10 pointer-events-none overflow-hidden flex items-center justify-center">
                    <span className="font-serif text-[280px] sm:text-[380px] font-bold text-white select-none leading-none">
                      ∫
                    </span>
                  </div>
                )}

                {/* Content Area */}
                <div className="relative z-10 max-w-2xl flex flex-col justify-center h-full">
                  <div className="flex flex-wrap items-center gap-2.5 mb-3 sm:mb-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border shadow-sm ${
                      banner.tagColor || "bg-amber-100 text-amber-900 border-amber-300"
                    }`}>
                      <Sparkles className="w-3.5 h-3.5" />
                      {banner.tag || "Prayatna Mathematics"}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/10 text-slate-200 border border-white/15 backdrop-blur-sm">
                      <Zap className="w-3 h-3 text-amber-300" />
                      Order #{banner.order}
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight sm:leading-tight mb-3">
                    {banner.title}
                  </h2>

                  <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed mb-6 line-clamp-2 sm:line-clamp-3 max-w-xl">
                    {banner.description}
                  </p>

                  {/* CTA Actions */}
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                    <a
                      href={banner.buttonLink || "#classes-section"}
                      className="inline-flex items-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-slate-950 font-bold text-sm sm:text-base shadow-lg shadow-amber-400/20 transition-all hover:gap-3"
                    >
                      <span>{banner.buttonText || "Explore Batches"}</span>
                      <ArrowRight className="w-4 h-4" />
                    </a>

                    {banner.phone && (
                      <a
                        href={`tel:${banner.phone.replace(/[^0-9+]/g, '')}`}
                        className="inline-flex items-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl bg-white/15 hover:bg-white/25 active:bg-white/30 text-white font-semibold text-sm border border-white/20 backdrop-blur-sm transition-all"
                        title={`Call ${banner.phone}`}
                      >
                        <PhoneCall className="w-4 h-4 text-emerald-400" />
                        <span>Call {banner.phone}</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Navigation Prev/Next Arrows (only if more than 1 banner) */}
        {totalSlides > 1 && (
          <>
            <button
              id="banner-prev-btn"
              onClick={prevSlide}
              aria-label="Previous Banner"
              className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md flex items-center justify-center border border-white/20 transition-all opacity-80 group-hover:opacity-100 hover:scale-105"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button
              id="banner-next-btn"
              onClick={nextSlide}
              aria-label="Next Banner"
              className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md flex items-center justify-center border border-white/20 transition-all opacity-80 group-hover:opacity-100 hover:scale-105"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Navigation Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/30 backdrop-blur-md border border-white/10">
              {banners.map((b, index) => (
                <button
                  key={b.id}
                  id={`banner-dot-${index}`}
                  onClick={() => setCurrentIndex(index)}
                  aria-label={`Go to slide ${index + 1}`}
                  className={`transition-all duration-300 rounded-full ${
                    index === safeCurrentIndex 
                      ? "w-6 h-2 bg-amber-400" 
                      : "w-2 h-2 bg-white/50 hover:bg-white/80"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
