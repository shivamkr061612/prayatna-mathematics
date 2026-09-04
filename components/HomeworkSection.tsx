'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { database, HomeworkData, HomeworkProgressData } from '@/lib/firebase';
import { ref, onValue, set, remove } from 'firebase/database';
import { useAuth } from '@/context/AuthContext';
import { 
  FileCheck2, 
  Calendar, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Search, 
  Filter, 
  ExternalLink, 
  Image as ImageIcon, 
  X, 
  ChevronRight, 
  Maximize2,
  Lock,
  ArrowRight,
  BookOpen,
  Sparkles,
  Undo2
} from 'lucide-react';

const SEED_DEFAULT_HOMEWORK: Omit<HomeworkData, 'id'>[] = [
  {
    title: "DPP 04: Application of Derivatives — Maxima & Minima Optimization",
    description: "Detailed practice set covering critical points, second derivative tests, word problems on optimization (cylinder, cone, rectangles inscribed in ellipses), and Rolle's Theorem applications.",
    images: [
      "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=1200&q=80"
    ],
    class: "Class 12",
    preparation: "JEE",
    assignedDate: "2026-09-01T10:00",
    deadline: "2026-09-08T23:59",
    attachmentUrl: "https://ncert.nic.in/textbook/pdf/lemh106.pdf",
    active: true,
    createdAt: Date.now() - 86400000 * 2
  },
  {
    title: "Class 12 Board Drill: Matrices Inversion & Determinant Equations",
    description: "10 essential board-pattern questions including solving 3-variable linear systems using matrix method, finding adjoint, verifying A*(adj A) = |A|*I, and proving skew-symmetric properties.",
    images: [
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80"
    ],
    class: "Class 12",
    preparation: "Board",
    assignedDate: "2026-09-02T09:30",
    deadline: "2026-09-09T20:00",
    attachmentUrl: "https://ncert.nic.in/textbook/pdf/lemh104.pdf",
    active: true,
    createdAt: Date.now() - 86400000
  },
  {
    title: "DPP 08: Trigonometric Identities, Sum-to-Product & General Solutions",
    description: "Rigorous daily practice problems on compound angles, transformation of sums into products, multiple angles (2A, 3A), and solving trigonometric equations within [0, 2π].",
    images: [
      "https://images.unsplash.com/photo-1596495578065-6e0763fa1178?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1518133910546-b6c2fb7d79e3?auto=format&fit=crop&w=1200&q=80"
    ],
    class: "Class 11",
    preparation: "Board",
    assignedDate: "2026-09-02T11:00",
    deadline: "2026-09-07T18:00",
    attachmentUrl: "https://ncert.nic.in/textbook/pdf/kemh103.pdf",
    active: true,
    createdAt: Date.now() - 3600000 * 12
  },
  {
    title: "JEE Conic Sections: Parabola Focal Chords & Tangent Equations",
    description: "Advanced conceptual worksheet analyzing parametric coordinates (at^2, 2at), locus of intersection of perpendicular tangents, normal chords, and director circles.",
    images: [
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1200&q=80"
    ],
    class: "Class 11",
    preparation: "JEE",
    assignedDate: "2026-08-28T09:00",
    deadline: "2026-09-01T23:59", // Past deadline for testing Overdue state
    attachmentUrl: "https://ncert.nic.in/textbook/pdf/kemh110.pdf",
    active: true,
    createdAt: Date.now() - 86400000 * 5
  }
];

export default function HomeworkSection() {
  const { user, userData, openAuthModal } = useAuth();

  const [homeworkList, setHomeworkList] = useState<HomeworkData[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, HomeworkProgressData>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState<'All' | 'Class 11' | 'Class 12'>('All');
  const [selectedPrep, setSelectedPrep] = useState<'All' | 'Board' | 'JEE'>('All');
  const [selectedStatus, setSelectedStatus] = useState<'All' | 'Pending' | 'Completed' | 'Overdue'>('All');
  const [personalizedMode, setPersonalizedMode] = useState(false);

  // Active Detail Modal
  const [activeHomework, setActiveHomework] = useState<HomeworkData | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [currentTimestamp, setCurrentTimestamp] = useState<number>(0);

  const userPrefAppliedRef = useRef(false);

  // Initialize and periodically update timestamp without causing purity lint errors
  useEffect(() => {
    const initTimer = setTimeout(() => {
      setCurrentTimestamp(Date.now());
    }, 0);
    const interval = setInterval(() => {
      setCurrentTimestamp(Date.now());
    }, 60000);
    return () => {
      clearTimeout(initTimer);
      clearInterval(interval);
    };
  }, []);

  // Personalize filter if student is enrolled in a specific class / preparation
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

  // Subscribe to RTDB homework list
  useEffect(() => {
    const homeworkRef = ref(database, 'homework');
    const unsubscribe = onValue(
      homeworkRef,
      async (snapshot) => {
        if (!snapshot.exists()) {
          // Seed default sample homework if empty
          try {
            for (const item of SEED_DEFAULT_HOMEWORK) {
              const newRef = ref(database, `homework/${Date.now()}_${Math.random().toString(36).substring(2, 6)}`);
              await set(newRef, {
                ...item,
                updatedAt: Date.now()
              });
            }
          } catch (seedErr) {
            console.error('Error seeding initial homework:', seedErr);
          }
          setLoading(false);
          return;
        }

        const data = snapshot.val();
        const list: HomeworkData[] = [];
        Object.keys(data).forEach((key) => {
          const item = data[key];
          // Support images as array or object
          let images: string[] = [];
          if (Array.isArray(item.images)) {
            images = item.images.filter(Boolean);
          } else if (item.images && typeof item.images === 'object') {
            images = Object.values(item.images).filter((img): img is string => typeof img === 'string');
          } else if (typeof item.imageUrl === 'string' && item.imageUrl) {
            images = [item.imageUrl];
          }

          list.push({
            id: key,
            title: item.title || 'Untitled Homework',
            description: item.description || '',
            images,
            class: item.class || 'Class 11',
            preparation: item.preparation || 'Board',
            assignedDate: item.assignedDate || new Date(item.createdAt || Date.now()).toISOString(),
            deadline: item.deadline || new Date(Date.now() + 86400000 * 3).toISOString(),
            attachmentUrl: item.attachmentUrl || '',
            active: item.active !== false,
            createdAt: item.createdAt || Date.now(),
            updatedAt: item.updatedAt
          });
        });

        // Sort descending by assignedDate or createdAt
        list.sort((a, b) => new Date(b.assignedDate || b.createdAt).getTime() - new Date(a.assignedDate || a.createdAt).getTime());
        setHomeworkList(list);
        setLoading(false);
      },
      (err) => {
        console.error('Error loading homework data:', err);
        setError('Failed to load homework assignments.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Subscribe to user's homeworkProgress when logged in
  useEffect(() => {
    if (!user) {
      const timer = setTimeout(() => {
        setProgressMap({});
      }, 0);
      return () => clearTimeout(timer);
    }

    const progressRef = ref(database, 'homeworkProgress');
    const unsubscribe = onValue(progressRef, (snapshot) => {
      if (!snapshot.exists()) {
        setProgressMap({});
        return;
      }
      const data = snapshot.val();
      const userProgress: Record<string, HomeworkProgressData> = {};
      
      // Iterate through each homeworkId and see if this student has an entry
      Object.keys(data).forEach((hwId) => {
        if (data[hwId] && data[hwId][user.uid]) {
          userProgress[hwId] = data[hwId][user.uid];
        }
      });

      setProgressMap(userProgress);
    });

    return () => unsubscribe();
  }, [user]);

  // Compute status for any homework item
  const getHomeworkStatus = useCallback((hw: HomeworkData): 'Completed' | 'Pending' | 'Overdue' => {
    if (progressMap[hw.id]?.status === 'Completed') {
      return 'Completed';
    }
    const deadlineTime = new Date(hw.deadline).getTime();
    const effectiveNow = currentTimestamp || 0;
    if (!isNaN(deadlineTime) && effectiveNow > 0 && deadlineTime < effectiveNow) {
      return 'Overdue';
    }
    return 'Pending';
  }, [progressMap, currentTimestamp]);

  // Toggle completion status
  const handleToggleCompletion = useCallback(async (hwId: string, currentStatus: 'Completed' | 'Pending' | 'Overdue', e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    if (!user) {
      openAuthModal('login');
      return;
    }

    setUpdatingId(hwId);
    try {
      const targetRef = ref(database, `homeworkProgress/${hwId}/${user.uid}`);
      if (currentStatus === 'Completed') {
        // Toggle off to pending
        await remove(targetRef);
      } else {
        // Mark as completed
        const payload: HomeworkProgressData = {
          status: 'Completed',
          completedAt: currentTimestamp || Date.now()
        };
        await set(targetRef, payload);

        // Award gamification for completing meaningful homework activity
        fetch('/api/gamification/activity', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.uid,
            activityType: 'homework_completed',
            metadata: { homeworkId: hwId }
          })
        }).catch(e => console.error('Gamification homework error:', e));
      }
    } catch (err) {
      console.error('Error updating homework status:', err);
    } finally {
      setUpdatingId(null);
    }
  }, [user, openAuthModal, currentTimestamp]);

  // Helper date formatter
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  // Filtered Homework list
  const filteredHomework = useMemo(() => {
    return homeworkList.filter((item) => {
      // Must be active for students
      if (!item.active) return false;

      // Class filter
      if (selectedClass !== 'All' && item.class !== selectedClass) return false;

      // Prep filter
      if (selectedPrep !== 'All' && item.preparation !== selectedPrep) return false;

      // Status filter
      if (selectedStatus !== 'All') {
        const itemStatus = getHomeworkStatus(item);
        if (itemStatus !== selectedStatus) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchDesc = item.description.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc) return false;
      }

      return true;
    });
  }, [homeworkList, selectedClass, selectedPrep, selectedStatus, searchQuery, getHomeworkStatus]);

  // Overall Statistics for current active list
  const stats = useMemo(() => {
    const activeHomeworks = homeworkList.filter((h) => h.active);
    let completedCount = 0;
    let overdueCount = 0;
    let pendingCount = 0;

    activeHomeworks.forEach((h) => {
      const st = getHomeworkStatus(h);
      if (st === 'Completed') completedCount++;
      else if (st === 'Overdue') overdueCount++;
      else pendingCount++;
    });

    return {
      total: activeHomeworks.length,
      completed: completedCount,
      overdue: overdueCount,
      pending: pendingCount
    };
  }, [homeworkList, getHomeworkStatus]);

  return (
    <section 
      id="homework-section" 
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12"
      aria-label="Daily Homework and Practice Problems"
    >
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold mb-2">
            <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Daily Homework & Practice Problems (DPP)</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Homework & Practice Problem Sets
          </h2>
          <p className="mt-1 text-sm text-slate-600 max-w-2xl">
            Complete daily practice problems, view uploaded problem sheets, track deadlines, and submit your completion status.
          </p>
        </div>

        {/* Personalized Student Badge */}
        {user && userData?.class && (
          <div className="flex items-center gap-2 px-3 py-2 bg-indigo-50/80 border border-indigo-100 rounded-xl text-xs text-indigo-900">
            <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>
              Enrolled: <strong className="font-semibold">{userData.class}</strong> • <strong className="font-semibold">{userData.preparation || 'General'}</strong>
            </span>
          </div>
        )}
      </div>

      {/* Student Progress Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-6">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Active</div>
            <div className="text-2xl font-bold text-slate-900 mt-0.5">{stats.total}</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Completed</div>
            <div className="text-2xl font-bold text-emerald-700 mt-0.5">{stats.completed}</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Pending</div>
            <div className="text-2xl font-bold text-amber-700 mt-0.5">{stats.pending}</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-rose-600 uppercase tracking-wider">Overdue</div>
            <div className="text-2xl font-bold text-rose-700 mt-0.5">{stats.overdue}</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="mt-6 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search homework by title, chapter or topic..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-slate-800 placeholder:text-slate-400"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                aria-label="Clear search query"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Filter Status Badges */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <span className="text-xs font-medium text-slate-500 mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Status:
            </span>
            {(['All', 'Pending', 'Completed', 'Overdue'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  selectedStatus === st
                    ? st === 'Completed'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : st === 'Overdue'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : st === 'Pending'
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Second Row: Class & Preparation Filter Chips */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-3">
            {/* Class Tabs */}
            <div className="inline-flex rounded-lg bg-slate-100 p-1">
              {(['All', 'Class 11', 'Class 12'] as const).map((cls) => (
                <button
                  key={cls}
                  onClick={() => {
                    setSelectedClass(cls);
                    setPersonalizedMode(false);
                  }}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                    selectedClass === cls
                      ? 'bg-white text-indigo-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {cls}
                </button>
              ))}
            </div>

            {/* Preparation Tabs */}
            <div className="inline-flex rounded-lg bg-slate-100 p-1">
              {(['All', 'Board', 'JEE'] as const).map((prep) => (
                <button
                  key={prep}
                  onClick={() => {
                    setSelectedPrep(prep);
                    setPersonalizedMode(false);
                  }}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                    selectedPrep === prep
                      ? 'bg-white text-indigo-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {prep === 'Board' ? 'Board Exam' : prep === 'JEE' ? 'JEE Adv.' : 'All Tracks'}
                </button>
              ))}
            </div>
          </div>

          {/* Reset Filters / Showing count */}
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <span>Showing <strong>{filteredHomework.length}</strong> assignments</span>
            {(selectedClass !== 'All' || selectedPrep !== 'All' || selectedStatus !== 'All' || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedClass('All');
                  setSelectedPrep('All');
                  setSelectedStatus('All');
                  setSearchQuery('');
                  setPersonalizedMode(false);
                }}
                className="text-indigo-600 hover:text-indigo-800 font-semibold underline underline-offset-2 ml-1"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm animate-pulse space-y-4">
              <div className="flex justify-between items-center">
                <div className="h-5 w-20 bg-slate-200 rounded"></div>
                <div className="h-5 w-24 bg-slate-200 rounded"></div>
              </div>
              <div className="h-6 w-3/4 bg-slate-200 rounded"></div>
              <div className="h-12 bg-slate-100 rounded"></div>
              <div className="h-28 bg-slate-200 rounded-xl"></div>
              <div className="flex justify-between items-center pt-2">
                <div className="h-4 w-28 bg-slate-200 rounded"></div>
                <div className="h-9 w-24 bg-slate-200 rounded-lg"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error Notice */}
      {error && !loading && (
        <div className="mt-6 p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-center">
          <AlertCircle className="w-8 h-8 text-rose-600 mx-auto mb-2" />
          <p className="font-semibold text-sm">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-3 px-4 py-1.5 text-xs font-semibold bg-rose-600 text-white rounded-lg hover:bg-rose-700"
          >
            Retry Loading
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredHomework.length === 0 && (
        <div className="mt-8 text-center py-14 px-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <FileCheck2 className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No Homework Found</h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1 mb-4">
            No assignments match your current filters. Try changing your class, preparation track, or status filters.
          </p>
          <button
            onClick={() => {
              setSelectedClass('All');
              setSelectedPrep('All');
              setSelectedStatus('All');
              setSearchQuery('');
            }}
            className="px-4 py-2 text-xs font-semibold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
          >
            Show All Homework
          </button>
        </div>
      )}

      {/* Homework Cards Grid */}
      {!loading && !error && filteredHomework.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {filteredHomework.map((hw) => {
            const status = getHomeworkStatus(hw);
            const isCompleted = status === 'Completed';
            const isOverdue = status === 'Overdue';
            const isPending = status === 'Pending';
            const hasImages = hw.images && hw.images.length > 0;
            const completedInfo = progressMap[hw.id];

            return (
              <div 
                key={hw.id}
                id={`homework-card-${hw.id}`}
                onClick={() => setActiveHomework(hw)}
                className="group relative bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between cursor-pointer"
              >
                <div>
                  {/* Top Badges Row */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                        hw.class === 'Class 11' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                      }`}>
                        {hw.class}
                      </span>
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                        hw.preparation === 'JEE' ? 'bg-purple-50 text-purple-700 border border-purple-100' : 'bg-amber-50 text-amber-800 border border-amber-100'
                      }`}>
                        {hw.preparation === 'JEE' ? 'JEE Adv.' : 'Board Focus'}
                      </span>
                    </div>

                    {/* Status Badge */}
                    <div>
                      {isCompleted && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Completed</span>
                        </span>
                      )}
                      {isOverdue && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                          <span>Overdue</span>
                        </span>
                      )}
                      {isPending && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          <span>Pending</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug">
                    {hw.title}
                  </h3>

                  {/* Short Description */}
                  <p className="mt-2 text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
                    {hw.description}
                  </p>

                  {/* Image Preview / Problem Sheet Thumbnail */}
                  {hasImages && (
                    <div className="mt-3.5 relative rounded-xl overflow-hidden h-36 bg-slate-900 border border-slate-200 group-hover:border-slate-300">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={hw.images![0]} 
                        alt={hw.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 opacity-90 group-hover:opacity-100"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                      <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-white text-[11px] font-semibold">
                        <span className="flex items-center gap-1 bg-black/50 px-2 py-0.5 rounded-md backdrop-blur-sm">
                          <ImageIcon className="w-3 h-3 text-white" />
                          {hw.images!.length} {hw.images!.length > 1 ? 'Sheets / Images' : 'Sheet'}
                        </span>
                        <span className="flex items-center gap-0.5 text-white/80 group-hover:text-white">
                          <span>View</span>
                          <Maximize2 className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  )}

                  {!hasImages && hw.attachmentUrl && (
                    <div className="mt-3.5 p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs text-indigo-700">
                      <span className="flex items-center gap-1.5 font-medium truncate">
                        <BookOpen className="w-4 h-4 text-indigo-500 shrink-0" />
                        <span>Attached Reference PDF Available</span>
                      </span>
                      <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                    </div>
                  )}
                </div>

                {/* Bottom Meta & Action */}
                <div className="mt-4 pt-3.5 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Assigned: {formatDate(hw.assignedDate)}</span>
                    </div>
                    <div className={`flex items-center gap-1 font-semibold ${isOverdue ? 'text-rose-600' : 'text-slate-700'}`}>
                      <Clock className={`w-3.5 h-3.5 ${isOverdue ? 'text-rose-500' : 'text-slate-400'}`} />
                      <span>Due: {formatDate(hw.deadline)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={(e) => handleToggleCompletion(hw.id, status, e)}
                      disabled={updatingId === hw.id}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                        isCompleted
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm hover:shadow'
                      }`}
                    >
                      {updatingId === hw.id ? (
                        <span>Updating...</span>
                      ) : isCompleted ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Completed</span>
                        </>
                      ) : (
                        <>
                          <FileCheck2 className="w-4 h-4 text-white" />
                          <span>Mark Completed</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveHomework(hw)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                      title="View Details"
                      aria-label="View Homework Details"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {isCompleted && completedInfo?.completedAt && (
                    <div className="text-[10px] text-emerald-700 text-center mt-2 font-medium">
                      Finished on {formatDateTime(new Date(completedInfo.completedAt).toISOString())}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* =========================================================================
          HOMEWORK DETAIL MODAL
          ========================================================================= */}
      {activeHomework && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setActiveHomework(null)}
        >
          <div 
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-start justify-between gap-4 bg-slate-50/50">
              <div>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    activeHomework.class === 'Class 11' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {activeHomework.class}
                  </span>
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    activeHomework.preparation === 'JEE' ? 'bg-purple-100 text-purple-700' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {activeHomework.preparation === 'JEE' ? 'JEE Advanced' : 'Board Exam'}
                  </span>

                  {/* Status Indicator */}
                  {getHomeworkStatus(activeHomework) === 'Completed' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-sm">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Completed</span>
                    </span>
                  )}
                  {getHomeworkStatus(activeHomework) === 'Overdue' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-600 text-white shadow-sm">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Overdue</span>
                    </span>
                  )}
                  {getHomeworkStatus(activeHomework) === 'Pending' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-white shadow-sm">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Pending Submission</span>
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-extrabold text-slate-900 leading-snug">
                  {activeHomework.title}
                </h3>
              </div>

              <button 
                onClick={() => setActiveHomework(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
              {/* Timeline info row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-slate-500 font-medium">Assigned On</div>
                    <div className="font-bold text-slate-800">{formatDateTime(activeHomework.assignedDate)}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    getHomeworkStatus(activeHomework) === 'Overdue' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-700'
                  }`}>
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-slate-500 font-medium">Submission Deadline</div>
                    <div className={`font-bold ${getHomeworkStatus(activeHomework) === 'Overdue' ? 'text-rose-600 font-extrabold' : 'text-slate-800'}`}>
                      {formatDateTime(activeHomework.deadline)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Instructions & Problem Details</h4>
                <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl text-sm leading-relaxed text-slate-700 whitespace-pre-line">
                  {activeHomework.description}
                </div>
              </div>

              {/* Uploaded Images Gallery */}
              {activeHomework.images && activeHomework.images.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-indigo-500" />
                      Uploaded Problem Sheets ({activeHomework.images.length})
                    </h4>
                    <span className="text-[11px] text-slate-400">Click image to expand</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {activeHomework.images.map((imgUrl, i) => (
                      <div 
                        key={i}
                        onClick={() => setLightboxImage(imgUrl)}
                        className="group relative rounded-xl overflow-hidden aspect-[4/3] bg-slate-900 border border-slate-200 cursor-pointer hover:border-indigo-500 transition-all shadow-sm"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={imgUrl} 
                          alt={`Problem sheet ${i + 1}`}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                          <Maximize2 className="w-5 h-5 drop-shadow" />
                        </div>
                        <span className="absolute bottom-1.5 left-1.5 text-[10px] font-bold bg-black/60 text-white px-2 py-0.5 rounded backdrop-blur-xs">
                          Sheet {i + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Attachment PDF Link */}
              {activeHomework.attachmentUrl && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Reference Document / Attachment</h4>
                  <a
                    href={activeHomework.attachmentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3.5 bg-indigo-50/70 border border-indigo-200 rounded-xl text-indigo-700 hover:bg-indigo-100 transition-colors text-sm font-semibold"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <BookOpen className="w-5 h-5 text-indigo-600 shrink-0" />
                      <span className="truncate">View Attached PDF / Reference Document</span>
                    </div>
                    <ExternalLink className="w-4 h-4 shrink-0 text-indigo-500" />
                  </a>
                </div>
              )}

              {/* Completion Status Alert if Completed */}
              {getHomeworkStatus(activeHomework) === 'Completed' && progressMap[activeHomework.id] && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-900 text-sm">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                  <div>
                    <div className="font-bold">You have marked this homework as Completed!</div>
                    <div className="text-xs text-emerald-700 mt-0.5">
                      Submitted on: {formatDateTime(new Date(progressMap[activeHomework.id].completedAt).toISOString())}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setActiveHomework(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
              >
                Close
              </button>

              {user ? (
                <div className="flex items-center gap-2">
                  {getHomeworkStatus(activeHomework) === 'Completed' ? (
                    <button
                      type="button"
                      onClick={() => handleToggleCompletion(activeHomework.id, 'Completed')}
                      disabled={updatingId === activeHomework.id}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-200 hover:bg-slate-300 text-slate-700 transition-colors flex items-center gap-1.5"
                    >
                      <Undo2 className="w-3.5 h-3.5" />
                      <span>Mark as Incomplete</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleToggleCompletion(activeHomework.id, getHomeworkStatus(activeHomework))}
                      disabled={updatingId === activeHomework.id}
                      className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4 text-white" />
                      <span>Mark as Completed</span>
                    </button>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setActiveHomework(null);
                    openAuthModal('login');
                  }}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow flex items-center gap-2"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Sign In to Track Homework</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          LIGHTBOX FOR FULL-SCREEN IMAGE VIEW
          ========================================================================= */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setLightboxImage(null)}
        >
          <button 
            onClick={() => setLightboxImage(null)}
            className="absolute top-4 right-4 text-white hover:text-slate-300 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all z-10"
            aria-label="Close Lightbox"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div 
            className="max-w-4xl max-h-[88vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={lightboxImage} 
              alt="Expanded problem sheet"
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl border border-white/10"
            />
          </div>
        </div>
      )}
    </section>
  );
}
