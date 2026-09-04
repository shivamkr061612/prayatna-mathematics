'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { database, BookData } from '@/lib/firebase';
import { ref, onValue } from 'firebase/database';
import { useAuth } from '@/context/AuthContext';
import { 
  BookOpen, 
  Search, 
  Filter, 
  ExternalLink, 
  FileText, 
  User as UserIcon, 
  Sparkles, 
  AlertCircle, 
  RotateCcw,
  CheckCircle2,
  Bookmark,
  GraduationCap
} from 'lucide-react';

export default function BooksSection() {
  const { userData } = useAuth();

  const [books, setBooks] = useState<BookData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters and Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState<'All' | 'Class 11' | 'Class 12'>('All');
  const [selectedPrep, setSelectedPrep] = useState<'All' | 'Board' | 'JEE'>('All');
  const [personalizedMode, setPersonalizedMode] = useState(false);

  const userPrefAppliedRef = useRef(false);

  // Set initial personalized preference once user profile is loaded
  useEffect(() => {
    if (!userPrefAppliedRef.current && userData?.class) {
      userPrefAppliedRef.current = true;
      const timer = setTimeout(() => {
        if (userData.class === 'Class 11' || userData.class === 'Class 12') {
          setSelectedClass(userData.class as 'Class 11' | 'Class 12');
          if (userData.preparation === 'Board' || userData.preparation === 'JEE') {
            setSelectedPrep(userData.preparation as 'Board' | 'JEE');
          }
          setPersonalizedMode(true);
        }
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [userData?.class, userData?.preparation]);

  // Realtime subscription to books collection from Firebase Realtime Database
  useEffect(() => {
    const booksRef = ref(database, 'books');
    const unsubscribe = onValue(
      booksRef,
      (snapshot) => {
        try {
          const data = snapshot.val();
          if (data) {
            const booksList: BookData[] = Object.keys(data).map((key) => ({
              id: key,
              ...data[key],
            }));

            // Filter only active / published books for student panel
            const activeBooks = booksList.filter((b) => b.active !== false);
            
            // Sort by createdAt descending
            activeBooks.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
            setBooks(activeBooks);
          } else {
            setBooks([]);
          }
          setLoading(false);
        } catch (err: any) {
          console.error('Error processing books data:', err);
          setError('Failed to load books. Please check your connection.');
          setLoading(false);
        }
      },
      (err) => {
        console.error('Firebase error listening to books:', err);
        setError('Unable to synchronize books library with server.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Filtered and searched books memo
  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      // Class filter
      if (selectedClass !== 'All' && book.class !== selectedClass) {
        return false;
      }

      // Preparation filter
      if (selectedPrep !== 'All' && book.preparation !== selectedPrep) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = (book.name || '').toLowerCase().includes(query);
        const matchesAuthor = (book.author || '').toLowerCase().includes(query);
        const matchesDesc = (book.description || '').toLowerCase().includes(query);
        if (!matchesName && !matchesAuthor && !matchesDesc) {
          return false;
        }
      }

      return true;
    });
  }, [books, selectedClass, selectedPrep, searchQuery]);

  const handleResetFilters = () => {
    setSelectedClass('All');
    setSelectedPrep('All');
    setSearchQuery('');
    setPersonalizedMode(false);
  };

  const isFiltered = selectedClass !== 'All' || selectedPrep !== 'All' || searchQuery.trim() !== '';

  return (
    <section 
      id="books-section" 
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 scroll-mt-20"
      aria-label="Books and Study Material Library"
    >
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-3">
            <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
            Curated Study Material
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Mathematics Books & Digital Library
          </h2>
          <p className="mt-1.5 text-sm sm:text-base text-slate-600 max-w-2xl">
            Authoritative reference texts, CBSE exemplar solutions, and JEE problem sets handpicked by Prayatna faculty for rigorous concept mastery.
          </p>
        </div>

        {/* Personalized Profile Indicator (if user has enrolled) */}
        {userData?.class && (
          <div className="self-start md:self-auto">
            {personalizedMode ? (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-medium shadow-sm">
                <GraduationCap className="w-4 h-4 text-indigo-600" />
                <span>Recommended for your {userData.class} • {userData.preparation || 'General'} batch</span>
                <button 
                  onClick={() => setPersonalizedMode(false)}
                  className="ml-1 text-indigo-600 hover:text-indigo-900 underline font-semibold"
                >
                  View All
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setSelectedClass(userData.class as 'Class 11' | 'Class 12');
                  if (userData?.preparation === 'Board' || userData?.preparation === 'JEE') {
                    setSelectedPrep(userData.preparation as 'Board' | 'JEE');
                  }
                  setPersonalizedMode(true);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-700 hover:text-indigo-800 bg-white border border-slate-200 hover:border-indigo-300 px-3 py-1.5 rounded-lg transition-all shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Filter for my {userData.class} profile
              </button>
            )}
          </div>
        )}
      </div>

      {/* Control Bar: Search & Filter Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 mb-8 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 justify-between">
          
          {/* Real-time Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              id="books-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search books by title, author, or topics..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>

          {/* Filter Controls: Class & Preparation */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Class Filter Pills */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80">
              <span className="text-xs font-semibold text-slate-500 px-2 flex items-center gap-1">
                <Filter className="w-3 h-3" /> Class:
              </span>
              {(['All', 'Class 11', 'Class 12'] as const).map((cls) => (
                <button
                  key={cls}
                  onClick={() => {
                    setSelectedClass(cls);
                    setPersonalizedMode(false);
                  }}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                    selectedClass === cls
                      ? 'bg-white text-indigo-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  {cls}
                </button>
              ))}
            </div>

            {/* Preparation Filter Pills */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80">
              <span className="text-xs font-semibold text-slate-500 px-2">Track:</span>
              {(['All', 'Board', 'JEE'] as const).map((prep) => (
                <button
                  key={prep}
                  onClick={() => {
                    setSelectedPrep(prep);
                    setPersonalizedMode(false);
                  }}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                    selectedPrep === prep
                      ? 'bg-white text-indigo-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  {prep === 'All' ? 'All Tracks' : prep}
                </button>
              ))}
            </div>

            {/* Reset Filters */}
            {isFiltered && (
              <button
                onClick={handleResetFilters}
                className="text-xs font-medium text-slate-500 hover:text-indigo-600 p-2 rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-1"
                title="Reset all filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Active Filter summary count */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <div>
            Showing <strong className="text-slate-800">{filteredBooks.length}</strong> of{' '}
            <strong className="text-slate-800">{books.length}</strong> published mathematics books
          </div>
          {(selectedClass !== 'All' || selectedPrep !== 'All' || searchQuery) && (
            <div className="flex items-center gap-1.5 text-indigo-600 font-medium">
              <span>Filtered by:</span>
              {selectedClass !== 'All' && <span className="bg-indigo-50 px-2 py-0.5 rounded text-[11px]">{selectedClass}</span>}
              {selectedPrep !== 'All' && <span className="bg-indigo-50 px-2 py-0.5 rounded text-[11px]">{selectedPrep}</span>}
              {searchQuery && <span className="bg-indigo-50 px-2 py-0.5 rounded text-[11px]">&ldquo;{searchQuery}&rdquo;</span>}
            </div>
          )}
        </div>
      </div>

      {/* Loading Skeleton State */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col h-[420px]">
              <div className="h-56 bg-slate-200 w-full" />
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                  <div className="h-10 bg-slate-100 rounded w-full mt-3" />
                </div>
                <div className="h-9 bg-slate-200 rounded-xl w-full" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="rounded-2xl bg-rose-50 border border-rose-200 p-8 text-center max-w-lg mx-auto">
          <AlertCircle className="w-10 h-10 text-rose-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-rose-900">Failed to Load Books Library</h3>
          <p className="text-sm text-rose-700 mt-1 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-rose-600 text-white rounded-xl text-sm font-semibold hover:bg-rose-700 transition-colors shadow-sm"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredBooks.length === 0 && (
        <div className="text-center py-16 px-4 bg-white rounded-2xl border border-dashed border-slate-300 max-w-xl mx-auto shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No matching books found</h3>
          <p className="text-sm text-slate-500 mt-1.5 max-w-md mx-auto">
            {books.length === 0 
              ? 'Digital books are currently being updated in the administrative repository. Please check back shortly.'
              : 'We could not find any books matching your selected Class, Track, or search terms.'}
          </p>
          {isFiltered && (
            <button
              onClick={handleResetFilters}
              className="mt-5 inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset All Filters
            </button>
          )}
        </div>
      )}

      {/* Books Grid */}
      {!loading && !error && filteredBooks.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredBooks.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      )}
    </section>
  );
}

/**
 * Individual Book Card Component
 */
function BookCard({ book }: { book: BookData }) {
  const [imageError, setImageError] = useState(false);

  const isClass11 = book.class === 'Class 11';
  const isJEE = book.preparation === 'JEE';

  return (
    <div 
      className="group bg-white rounded-2xl border border-slate-200/90 hover:border-indigo-300 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col h-full"
    >
      {/* Cover Image or Mathematical Fallback Art */}
      <div className="relative aspect-[3/4] w-full bg-slate-900 overflow-hidden flex items-center justify-center">
        {book.imageUrl && !imageError ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img 
            src={book.imageUrl} 
            alt={book.name}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-between p-6 bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-center relative overflow-hidden">
            {/* Background mathematical watermark */}
            <span className="absolute -right-4 -bottom-6 font-serif text-8xl font-bold text-white/5 select-none pointer-events-none">
              ∫
            </span>
            <span className="absolute -left-4 -top-6 font-serif text-8xl font-bold text-white/5 select-none pointer-events-none">
              ∑
            </span>

            <div className="w-full flex items-center justify-between text-[11px] font-semibold text-indigo-200/80">
              <span>Prayatna Library</span>
              <span className="px-2 py-0.5 rounded bg-white/10 text-amber-300">{book.class}</span>
            </div>

            <div className="my-auto space-y-2 px-2 z-10">
              <div className="w-10 h-10 rounded-xl bg-white/10 text-amber-400 mx-auto flex items-center justify-center font-serif text-xl font-bold border border-white/10">
                ∑
              </div>
              <h4 className="font-bold text-white text-base line-clamp-2 leading-tight">
                {book.name}
              </h4>
              {book.author && (
                <p className="text-xs text-indigo-200 line-clamp-1">
                  By {book.author}
                </p>
              )}
            </div>

            <div className="w-full text-center">
              <span className="inline-block text-[10px] tracking-wider uppercase font-semibold text-slate-400 bg-black/40 px-3 py-1 rounded-full border border-white/5">
                {book.preparation} Mathematics
              </span>
            </div>
          </div>
        )}

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm backdrop-blur-md ${
            isClass11 
              ? 'bg-indigo-600/90 text-white' 
              : 'bg-emerald-600/90 text-white'
          }`}>
            {book.class}
          </span>
          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm backdrop-blur-md ${
            isJEE 
              ? 'bg-purple-600/90 text-white' 
              : 'bg-amber-500/90 text-white'
          }`}>
            {book.preparation}
          </span>
        </div>
      </div>

      {/* Book Content Info */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3 
            className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug"
            title={book.name}
          >
            {book.name}
          </h3>

          {/* Author */}
          {book.author ? (
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1.5 font-medium">
              <UserIcon className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span className="line-clamp-1">{book.author}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1.5 italic">
              Prayatna Faculty Archive
            </div>
          )}

          {/* Description */}
          <p className="text-xs text-slate-600 mt-2.5 line-clamp-3 leading-relaxed">
            {book.description || 'Comprehensive conceptual notes, worked examples, and problem sets.'}
          </p>
        </div>

        {/* Action Button: Open PDF */}
        <div className="pt-3 border-t border-slate-100">
          <a
            href={book.pdfUrl || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white font-semibold text-xs rounded-xl border border-indigo-200/80 hover:border-indigo-600 transition-all shadow-sm group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600"
          >
            <FileText className="w-4 h-4" />
            <span>Open PDF Material</span>
            <ExternalLink className="w-3 h-3 opacity-70 ml-0.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
