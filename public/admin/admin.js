/**
 * Prayatna Mathematics - Standalone Admin Portal Core Logic (Pure JavaScript)
 * Firebase Authentication + Firebase Realtime Database
 */

const firebaseConfig = {
  apiKey: "AIzaSyA6Iy_AKHhaIwnZxW1C-r9-OBzGfAtNdH4",
  authDomain: "tech-shivam-f8e82.firebaseapp.com",
  databaseURL: "https://tech-shivam-f8e82-default-rtdb.firebaseio.com",
  projectId: "tech-shivam-f8e82",
  storageBucket: "tech-shivam-f8e82.firebasestorage.app",
  messagingSenderId: "586258718080",
  appId: "1:586258718080:web:030cbb73b2c808f56ef565",
  measurementId: "G-4BR76H7P73"
};

// ImgBB API Key
const IMGBB_API_KEY = "799ab2f2c7b4e888fa19cffe4a7b3ce2";

// Initialize Firebase app
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.database();

// State
let currentAdminUser = null;
let allStudentsList = [];
let allBannersList = [];
let allBooksList = [];
let allHomeworkList = [];
let allHomeworkProgressData = {};
let allStreaksMap = {};
let allXpMap = {};
let allAchievementsMap = {};
let currentDossierStudentUid = null;
let currentStudentActiveTab = 'profile';
let activeModule = 'dashboard';
let bannerToDeleteId = null;
let bookToDeleteId = null;
let homeworkToDeleteId = null;
let activeAnalyticsHomeworkId = null;
let currentHomeworkImages = [];

// DOM Elements
const adminPasscodeGate = document.getElementById('admin-passcode-gate');
const gatePasscodeInput = document.getElementById('gate-passcode-input');
const gateErrorMsg = document.getElementById('gate-error-msg');
const adminDashboardApp = document.getElementById('admin-dashboard-app');
const adminNameDisplay = document.getElementById('admin-name-display');
const adminAvatarDisplay = document.getElementById('admin-avatar-display');
const logoutBtn = document.getElementById('admin-logout-btn');
const sidebarToggleBtn = document.getElementById('sidebar-toggle-btn');
const adminSidebar = document.getElementById('admin-sidebar');
const headerTitle = document.getElementById('header-title-text');

// Views
const dashboardView = document.getElementById('view-dashboard');
const studentsView = document.getElementById('view-students');
const bannersView = document.getElementById('view-banners');
const booksView = document.getElementById('view-books');
const homeworkView = document.getElementById('view-homework');
const testsView = document.getElementById('view-tests');
const attemptsView = document.getElementById('view-attempts');
const leaderboardView = document.getElementById('view-leaderboard');
const attendanceView = document.getElementById('view-attendance');
const comingSoonView = document.getElementById('view-coming-soon');
const comingSoonModuleName = document.getElementById('coming-soon-module-name');

// Stat Elements
const statTotalStudents = document.getElementById('stat-total-students');
const statClass11 = document.getElementById('stat-class-11');
const statClass12 = document.getElementById('stat-class-12');
const statBoard = document.getElementById('stat-board');
const statJee = document.getElementById('stat-jee');
const statBanners = document.getElementById('stat-banners');
const statBooks = document.getElementById('stat-books');
const statHomework = document.getElementById('stat-homework');
const statTests = document.getElementById('stat-tests');
const statAttempts = document.getElementById('stat-attempts');
const statAttendanceRate = document.getElementById('stat-attendance-rate');
const statAttendanceSubtext = document.getElementById('stat-attendance-subtext');
const statAvgScore = document.getElementById('stat-avg-score');
const statAvgScoreSubtext = document.getElementById('stat-avg-score-subtext');
const statActiveLearners = document.getElementById('stat-active-learners');
const statActiveLearnersSubtext = document.getElementById('stat-active-learners-subtext');
const attendanceBadgeCount = document.getElementById('attendance-badge-count');
const bannersActiveCountBadge = document.getElementById('banners-active-count-badge');
const studentsBadgeCount = document.getElementById('students-badge-count');
const booksBadgeCount = document.getElementById('books-badge-count');
const homeworkBadgeCount = document.getElementById('homework-badge-count');
const testsBadgeCount = document.getElementById('tests-badge-count');
const attemptsBadgeCount = document.getElementById('attempts-badge-count');

// Dashboard Filter Elements
const dashFilterClass = document.getElementById('dash-filter-class');
const dashFilterPrep = document.getElementById('dash-filter-prep');
const dashFilterPeriod = document.getElementById('dash-filter-period');
const dashFilterIndicator = document.getElementById('dash-filter-indicator');

// Distribution Elements
const distBarC11 = document.getElementById('dist-bar-c11');
const distBarC12 = document.getElementById('dist-bar-c12');
const distC11Text = document.getElementById('dist-c11-text');
const distC12Text = document.getElementById('dist-c12-text');
const distClassTotal = document.getElementById('dist-class-total');

const distBarBoard = document.getElementById('dist-bar-board');
const distBarJee = document.getElementById('dist-bar-jee');
const distBoardText = document.getElementById('dist-board-text');
const distJeeText = document.getElementById('dist-jee-text');
const distPrepTotal = document.getElementById('dist-prep-total');

const distBarCompleted = document.getElementById('dist-bar-completed');
const distBarIncomplete = document.getElementById('dist-bar-incomplete');
const distCompletedText = document.getElementById('dist-completed-text');
const distIncompleteText = document.getElementById('dist-incomplete-text');
const distProfileTotal = document.getElementById('dist-profile-total');

// Distribution Score Bands & Engagement Meters
const distBarScoreHigh = document.getElementById('dist-bar-score-high');
const distBarScoreGood = document.getElementById('dist-bar-score-good');
const distBarScoreAvg = document.getElementById('dist-bar-score-avg');
const distBarScoreLow = document.getElementById('dist-bar-score-low');
const distScoreHighText = document.getElementById('dist-score-high-text');
const distScoreGoodText = document.getElementById('dist-score-good-text');
const distScoreAvgText = document.getElementById('dist-score-avg-text');
const distScoreLowText = document.getElementById('dist-score-low-text');
const distScoreTotal = document.getElementById('dist-score-total');

const distHwRateVal = document.getElementById('dist-hw-rate-val');
const distHwRateBar = document.getElementById('dist-hw-rate-bar');
const distAttRateVal = document.getElementById('dist-att-rate-val');
const distAttRateBar = document.getElementById('dist-att-rate-bar');

// Tables & Containers
const dashboardStudentsTableBody = document.getElementById('dashboard-students-table-body');
const studentsTableBody = document.getElementById('students-table-body');
const studentSearchInput = document.getElementById('student-search-input');
const studentFilterSelect = document.getElementById('student-filter-select');
const studentSortSelect = document.getElementById('student-sort-select');
const bannersListContainer = document.getElementById('banners-list-container');
const booksListContainer = document.getElementById('books-list-container');
const booksAdminSearchInput = document.getElementById('books-admin-search-input');
const booksAdminClassFilter = document.getElementById('books-admin-class-filter');
const booksAdminPrepFilter = document.getElementById('books-admin-prep-filter');
const booksAdminStatusFilter = document.getElementById('books-admin-status-filter');

const homeworkListContainer = document.getElementById('homework-list-container');
const homeworkAdminSearchInput = document.getElementById('homework-admin-search-input');
const homeworkAdminClassFilter = document.getElementById('homework-admin-class-filter');
const homeworkAdminPrepFilter = document.getElementById('homework-admin-prep-filter');
const homeworkAdminStatusFilter = document.getElementById('homework-admin-status-filter');

// Modals
const bannerModal = document.getElementById('banner-modal');
const studentModal = document.getElementById('student-modal');
const deleteBannerModal = document.getElementById('delete-banner-modal');
const bookModal = document.getElementById('book-modal');
const deleteBookModal = document.getElementById('delete-book-modal');
const homeworkModal = document.getElementById('homework-modal');
const deleteHomeworkModal = document.getElementById('delete-homework-modal');
const homeworkAnalyticsModal = document.getElementById('homework-analytics-modal');
const toastContainer = document.getElementById('toast-container');

// Mobile Sidebar Toggle
if (sidebarToggleBtn) {
  sidebarToggleBtn.addEventListener('click', () => {
    adminSidebar.classList.toggle('open');
  });
}

// Close sidebar on item click (mobile)
document.querySelectorAll('.nav-item').forEach((item) => {
  item.addEventListener('click', () => {
    if (window.innerWidth <= 768) {
      adminSidebar.classList.remove('open');
    }
  });
});

// Toast notification helper
function showToast(message, type = 'success') {
  if (!toastContainer) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  let iconName = 'check-circle-2';
  if (type === 'error') iconName = 'alert-circle';
  if (type === 'info') iconName = 'info';

  toast.innerHTML = `
    <i data-lucide="${iconName}" style="width: 18px; height: 18px; flex-shrink: 0;"></i>
    <span>${escapeHtml(message)}</span>
  `;
  toastContainer.appendChild(toast);
  
  if (window.lucide) {
    lucide.createIcons();
  }

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.2s ease';
    setTimeout(() => toast.remove(), 200);
  }, 3500);
}

// =========================================================================
// MASTER ACCESS CODE VERIFICATION & UNLOCK (CODE: 061612)
// =========================================================================
const ADMIN_ACCESS_CODE = "061612";
let hasInitializedDataListeners = false;

function isPasscodeAuthorized() {
  const verifiedCode = sessionStorage.getItem('prayatna_admin_passcode_verified') || 
                       localStorage.getItem('prayatna_admin_passcode_verified');
  return verifiedCode === ADMIN_ACCESS_CODE;
}

window.toggleGateCodeVisibility = function() {
  const input = document.getElementById('gate-passcode-input');
  const icon = document.getElementById('gate-eye-icon');
  if (!input) return;
  if (input.type === 'password') {
    input.type = 'text';
    if (icon) icon.setAttribute('data-lucide', 'eye-off');
  } else {
    input.type = 'password';
    if (icon) icon.setAttribute('data-lucide', 'eye');
  }
  if (window.lucide) lucide.createIcons();
};

window.submitAdminPasscode = function(event) {
  if (event) event.preventDefault();
  const input = document.getElementById('gate-passcode-input');
  const errBox = document.getElementById('gate-error-msg');
  if (!input) return;

  const enteredCode = (input.value || '').trim();
  if (enteredCode === ADMIN_ACCESS_CODE) {
    sessionStorage.setItem('prayatna_admin_passcode_verified', ADMIN_ACCESS_CODE);
    localStorage.setItem('prayatna_admin_passcode_verified', ADMIN_ACCESS_CODE);
    if (errBox) errBox.style.display = 'none';
    unlockAdminDashboard();
  } else {
    if (errBox) {
      errBox.textContent = "Invalid access code! Please enter the correct admin code.";
      errBox.style.display = 'block';
    }
    input.focus();
    input.select();
  }
};

function unlockAdminDashboard() {
  currentAdminUser = {
    uid: 'admin_master_061612',
    name: 'Master Admin',
    displayName: 'Master Admin',
    email: 'admin@prayatna.com',
    role: 'admin'
  };

  if (adminPasscodeGate) {
    adminPasscodeGate.style.display = 'none';
  }
  if (adminDashboardApp) {
    adminDashboardApp.style.display = 'flex';
  }

  if (adminNameDisplay) {
    adminNameDisplay.textContent = 'Master Admin';
  }
  if (adminAvatarDisplay) {
    adminAvatarDisplay.textContent = '∑';
  }

  if (window.lucide) {
    lucide.createIcons();
  }

  // Subscribe to live Firebase Database once unlocked
  if (!hasInitializedDataListeners) {
    hasInitializedDataListeners = true;
    listenToStudentsData();
    listenToBannersData();
    listenToBooksData();
    listenToHomeworkData();
    listenToTestsData();
    listenToTestAttemptsData();
    listenToAttendanceData();
    listenToGamificationData();
  }
}

// Check on initial page load
if (isPasscodeAuthorized()) {
  unlockAdminDashboard();
} else {
  if (adminPasscodeGate) adminPasscodeGate.style.display = 'flex';
  if (adminDashboardApp) adminDashboardApp.style.display = 'none';
  setTimeout(() => {
    const input = document.getElementById('gate-passcode-input');
    if (input) input.focus();
  }, 100);
}

// =========================================================================
// 1. STUDENTS MANAGEMENT & ANALYTICS
// =========================================================================

function listenToGamificationData() {
  db.ref('streaks').on('value', (snapshot) => {
    allStreaksMap = snapshot.val() || {};
    updateGamificationMetrics();
    applyDashboardFilters();
    if (currentDossierStudentUid) {
      refreshCurrentDossier();
    }
  });

  db.ref('xp').on('value', (snapshot) => {
    allXpMap = snapshot.val() || {};
    updateGamificationMetrics();
    applyDashboardFilters();
    if (currentDossierStudentUid) {
      refreshCurrentDossier();
    }
  });

  db.ref('achievements').on('value', (snapshot) => {
    allAchievementsMap = snapshot.val() || {};
    updateGamificationMetrics();
    if (currentDossierStudentUid) {
      refreshCurrentDossier();
    }
  });
}

function listenToStudentsData() {
  const usersRef = db.ref('users');
  usersRef.on('value', (snapshot) => {
    const data = snapshot.val() || {};
    const usersArray = Object.values(data);

    // Filter students (exclude admin role)
    const students = usersArray.filter((u) => u.role !== 'admin');
    allStudentsList = students;

    // Apply dashboard filters and update metrics
    applyDashboardFilters();

    // Render Full Students Directory
    renderStudentsDirectoryTable();

    // Update gamification table if active
    updateGamificationMetrics();

    // If student dossier is currently open, refresh its data
    if (currentDossierStudentUid) {
      refreshCurrentDossier();
    }
  });
}

// -------------------------------------------------------------------------
// Dashboard Filtering & Comprehensive Analytics (Part 8 Production Features)
// -------------------------------------------------------------------------

window.applyDashboardFilters = function() {
  const selectedClass = dashFilterClass ? dashFilterClass.value : 'all';
  const selectedPrep = dashFilterPrep ? dashFilterPrep.value : 'all';
  const selectedPeriod = dashFilterPeriod ? dashFilterPeriod.value : 'all';

  const now = Date.now();
  let periodThreshold = 0;
  if (selectedPeriod === 'today') {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    periodThreshold = startOfToday.getTime();
  } else if (selectedPeriod === '7days') {
    periodThreshold = now - 7 * 86400 * 1000;
  } else if (selectedPeriod === '30days') {
    periodThreshold = now - 30 * 86400 * 1000;
  }

  // Filter students based on criteria
  const filteredStudents = allStudentsList.filter((s) => {
    if (selectedClass !== 'all' && s.class !== selectedClass) return false;
    if (selectedPrep !== 'all' && s.preparation !== selectedPrep) return false;
    if (periodThreshold > 0 && (s.createdAt || 0) < periodThreshold) return false;
    return true;
  });

  const filteredUids = new Set(filteredStudents.map((s) => s.uid));

  // Update filter indicator badge
  if (dashFilterIndicator) {
    const parts = [];
    if (selectedClass !== 'all') parts.push(selectedClass);
    if (selectedPrep !== 'all') parts.push(selectedPrep);
    if (selectedPeriod !== 'all') {
      parts.push(selectedPeriod === 'today' ? 'Today' : selectedPeriod === '7days' ? 'Last 7 Days' : 'Last 30 Days');
    }
    dashFilterIndicator.textContent = parts.length > 0
      ? `Filtered: ${parts.join(' • ')} (${filteredStudents.length} Students)`
      : `Viewing All Cohorts (${allStudentsList.length} Students)`;
  }

  // Aggregate student stats
  const totalCount = filteredStudents.length;
  const class11Count = filteredStudents.filter((s) => s.class === 'Class 11').length;
  const class12Count = filteredStudents.filter((s) => s.class === 'Class 12').length;
  const boardCount = filteredStudents.filter((s) => s.preparation === 'Board').length;
  const jeeCount = filteredStudents.filter((s) => s.preparation === 'JEE').length;
  const completedCount = filteredStudents.filter((s) => s.profileCompleted).length;
  const incompleteCount = totalCount - completedCount;

  // Filter books matching class/prep criteria if filtered
  const filteredBooks = allBooksList.filter((b) => {
    if (selectedClass !== 'all' && b.class !== selectedClass) return false;
    if (selectedPrep !== 'all' && b.preparation !== selectedPrep) return false;
    return true;
  });

  // Filter homework matching class/prep criteria
  const filteredHomework = allHomeworkList.filter((h) => {
    if (selectedClass !== 'all' && h.class !== selectedClass) return false;
    if (selectedPrep !== 'all' && h.preparation !== selectedPrep) return false;
    return true;
  });

  // Filter tests matching class/prep criteria
  const filteredTests = allTestsList.filter((t) => {
    if (selectedClass !== 'all' && t.class !== selectedClass) return false;
    if (selectedPrep !== 'all' && t.preparation !== selectedPrep) return false;
    return true;
  });

  // Filter attempts submitted by students in this cohort
  const filteredAttempts = allTestAttemptsList.filter((a) => {
    if (filteredStudents.length < allStudentsList.length && !filteredUids.has(a.userId)) return false;
    if (selectedPeriod !== 'all' && periodThreshold > 0 && (a.submittedAt || 0) < periodThreshold) return false;
    return true;
  });

  // Calculate Average Score across filtered attempts
  let avgScorePct = 0;
  if (filteredAttempts.length > 0) {
    const sumPct = filteredAttempts.reduce((acc, a) => {
      let pct = a.percentage;
      if (pct === undefined || isNaN(pct)) {
        pct = a.totalMarks > 0 ? (a.score / a.totalMarks) * 100 : 0;
      }
      return acc + (Number(pct) || 0);
    }, 0);
    avgScorePct = Math.round(sumPct / filteredAttempts.length);
  }

  // Calculate Attendance Rate for this cohort
  let totalAttendanceRecords = 0;
  let presentAttendanceRecords = 0;
  Object.keys(allAttendanceDatesMap).forEach((dateKey) => {
    if (periodThreshold > 0) {
      const dTime = new Date(dateKey).getTime();
      if (!isNaN(dTime) && dTime < periodThreshold) return;
    }
    const dayRecords = allAttendanceDatesMap[dateKey] || {};
    Object.keys(dayRecords).forEach((uid) => {
      if (filteredStudents.length === allStudentsList.length || filteredUids.has(uid)) {
        totalAttendanceRecords++;
        if (dayRecords[uid].status === 'present') {
          presentAttendanceRecords++;
        }
      }
    });
  });
  const attendanceRatePct = totalAttendanceRecords > 0 
    ? Math.round((presentAttendanceRecords / totalAttendanceRecords) * 100) 
    : 100;

  // Calculate Active Students (students with test attempt, homework submission, attendance, or streak > 0)
  const activeStudentUids = new Set();
  filteredAttempts.forEach((a) => { if (a.userId) activeStudentUids.add(a.userId); });
  Object.keys(allAttendanceDatesMap).forEach((dateKey) => {
    const dayRecords = allAttendanceDatesMap[dateKey] || {};
    Object.keys(dayRecords).forEach((uid) => {
      if (filteredUids.has(uid) && dayRecords[uid].status === 'present') {
        activeStudentUids.add(uid);
      }
    });
  });
  filteredStudents.forEach((s) => {
    const strk = allStreaksMap[s.uid];
    if (strk && ((strk.currentStreak || strk.streak || 0) > 0)) {
      activeStudentUids.add(s.uid);
    }
    const xpVal = allXpMap[s.uid];
    if (xpVal) {
      const pts = typeof xpVal === 'number' ? xpVal : (xpVal.totalXp || xpVal.points || 0);
      if (pts > 0) activeStudentUids.add(s.uid);
    }
  });
  const activeCount = Math.min(activeStudentUids.size, totalCount);

  // Update Stat Cards
  if (statTotalStudents) statTotalStudents.textContent = totalCount;
  if (statClass11) statClass11.textContent = class11Count;
  if (statClass12) statClass12.textContent = class12Count;
  if (statBoard) statBoard.textContent = boardCount;
  if (statJee) statJee.textContent = jeeCount;
  if (statBanners) statBanners.textContent = allBannersList.length;
  if (statBooks) statBooks.textContent = filteredBooks.length;
  if (statHomework) statHomework.textContent = filteredHomework.length;
  if (statTests) statTests.textContent = filteredTests.length;
  if (statAttempts) statAttempts.textContent = filteredAttempts.length;

  if (statAttendanceRate) statAttendanceRate.textContent = `${attendanceRatePct}%`;
  if (statAttendanceSubtext) {
    statAttendanceSubtext.textContent = totalAttendanceRecords > 0 
      ? `${presentAttendanceRecords} of ${totalAttendanceRecords} sessions present` 
      : 'No sessions logged';
  }

  if (statAvgScore) statAvgScore.textContent = `${avgScorePct}%`;
  if (statAvgScoreSubtext) {
    statAvgScoreSubtext.textContent = filteredAttempts.length > 0 
      ? `Across ${filteredAttempts.length} mock tests` 
      : 'No test attempts logged';
  }

  if (statActiveLearners) statActiveLearners.textContent = activeCount;
  if (statActiveLearnersSubtext) {
    const actPct = totalCount > 0 ? Math.round((activeCount / totalCount) * 100) : 0;
    statActiveLearnersSubtext.textContent = `${actPct}% of filtered students active`;
  }

  if (studentsBadgeCount) studentsBadgeCount.textContent = `${allStudentsList.length} Students`;

  // Update Distribution Meters
  updateDistributionMeters({
    total: totalCount,
    class11: class11Count,
    class12: class12Count,
    board: boardCount,
    jee: jeeCount,
    completed: completedCount,
    incomplete: incompleteCount
  });

  // Update Exam Score Distribution Bands
  updateScoreDistributionBands(filteredAttempts);

  // Update Engagement & Compliance meters
  updateEngagementMeters(filteredStudents, filteredHomework, attendanceRatePct);

  // Render recent students table in dashboard
  renderDashboardRecentStudents(filteredStudents);
};

window.resetDashboardFilters = function() {
  if (dashFilterClass) dashFilterClass.value = 'all';
  if (dashFilterPrep) dashFilterPrep.value = 'all';
  if (dashFilterPeriod) dashFilterPeriod.value = 'all';
  applyDashboardFilters();
};

window.filterAndNavStudents = function(filterVal) {
  window.navigateToModule('students', 'Students Directory');
  if (studentFilterSelect) {
    studentFilterSelect.value = filterVal;
    renderStudentsDirectoryTable();
  }
};

function updateDistributionMeters(stats) {
  // Class 11 vs 12
  const classTotal = stats.class11 + stats.class12;
  const c11Pct = classTotal > 0 ? Math.round((stats.class11 / classTotal) * 100) : 50;
  const c12Pct = classTotal > 0 ? Math.round((stats.class12 / classTotal) * 100) : 50;
  
  if (distBarC11) distBarC11.style.width = `${c11Pct}%`;
  if (distBarC12) distBarC12.style.width = `${c12Pct}%`;
  if (distC11Text) distC11Text.textContent = `Class 11: ${stats.class11} (${c11Pct}%)`;
  if (distC12Text) distC12Text.textContent = `Class 12: ${stats.class12} (${c12Pct}%)`;
  if (distClassTotal) distClassTotal.textContent = `${classTotal} Enrolled`;

  // Board vs JEE
  const prepTotal = stats.board + stats.jee;
  const boardPct = prepTotal > 0 ? Math.round((stats.board / prepTotal) * 100) : 50;
  const jeePct = prepTotal > 0 ? Math.round((stats.jee / prepTotal) * 100) : 50;

  if (distBarBoard) distBarBoard.style.width = `${boardPct}%`;
  if (distBarJee) distBarJee.style.width = `${jeePct}%`;
  if (distBoardText) distBoardText.textContent = `Board: ${stats.board} (${boardPct}%)`;
  if (distJeeText) distJeeText.textContent = `JEE: ${stats.jee} (${jeePct}%)`;
  if (distPrepTotal) distPrepTotal.textContent = `${prepTotal} Enrolled`;

  // Profile Completion
  const compTotal = stats.total;
  const compPct = compTotal > 0 ? Math.round((stats.completed / compTotal) * 100) : 0;
  const incompPct = compTotal > 0 ? 100 - compPct : 0;

  if (distBarCompleted) distBarCompleted.style.width = `${compPct}%`;
  if (distBarIncomplete) distBarIncomplete.style.width = `${incompPct}%`;
  if (distCompletedText) distCompletedText.textContent = `Complete: ${stats.completed} (${compPct}%)`;
  if (distIncompleteText) distIncompleteText.textContent = `Pending: ${stats.incomplete} (${incompPct}%)`;
  if (distProfileTotal) distProfileTotal.textContent = `${stats.completed} Verified`;
}

function updateScoreDistributionBands(attempts) {
  const total = attempts.length;
  let countHigh = 0;  // >= 90%
  let countGood = 0;  // 75 - 89%
  let countAvg = 0;   // 50 - 74%
  let countLow = 0;   // < 50%

  attempts.forEach((a) => {
    let pct = a.percentage;
    if (pct === undefined || isNaN(pct)) {
      pct = a.totalMarks > 0 ? (a.score / a.totalMarks) * 100 : 0;
    }
    pct = Number(pct) || 0;
    if (pct >= 90) countHigh++;
    else if (pct >= 75) countGood++;
    else if (pct >= 50) countAvg++;
    else countLow++;
  });

  const pctHigh = total > 0 ? Math.round((countHigh / total) * 100) : 0;
  const pctGood = total > 0 ? Math.round((countGood / total) * 100) : 0;
  const pctAvg = total > 0 ? Math.round((countAvg / total) * 100) : 0;
  const pctLow = total > 0 ? Math.max(0, 100 - pctHigh - pctGood - pctAvg) : 0;

  if (distBarScoreHigh) distBarScoreHigh.style.width = `${pctHigh}%`;
  if (distBarScoreGood) distBarScoreGood.style.width = `${pctGood}%`;
  if (distBarScoreAvg) distBarScoreAvg.style.width = `${pctAvg}%`;
  if (distBarScoreLow) distBarScoreLow.style.width = `${pctLow}%`;

  if (distScoreHighText) distScoreHighText.textContent = `≥90%: ${countHigh} (${pctHigh}%)`;
  if (distScoreGoodText) distScoreGoodText.textContent = `75-89%: ${countGood} (${pctGood}%)`;
  if (distScoreAvgText) distScoreAvgText.textContent = `50-74%: ${countAvg} (${pctAvg}%)`;
  if (distScoreLowText) distScoreLowText.textContent = `<50%: ${countLow} (${pctLow}%)`;
  if (distScoreTotal) distScoreTotal.textContent = `${total} Submissions`;
}

function updateEngagementMeters(students, homeworkList, attendanceRate) {
  // Homework compliance: count total required assignments across students
  let totalAssigned = 0;
  let totalSubmitted = 0;

  students.forEach((s) => {
    const relevantHw = homeworkList.filter((h) => h.class === s.class);
    relevantHw.forEach((h) => {
      totalAssigned++;
      if (allHomeworkProgressData[h.id]?.[s.uid]?.status === 'Completed' || allHomeworkProgressData[h.id]?.[s.uid]?.completed) {
        totalSubmitted++;
      }
    });
  });

  const hwRate = totalAssigned > 0 ? Math.round((totalSubmitted / totalAssigned) * 100) : 100;

  if (distHwRateVal) distHwRateVal.textContent = `${hwRate}%`;
  if (distHwRateBar) distHwRateBar.style.width = `${hwRate}%`;

  if (distAttRateVal) distAttRateVal.textContent = `${attendanceRate}%`;
  if (distAttRateBar) distAttRateBar.style.width = `${attendanceRate}%`;
}

// Render Dashboard Recent Students (Limit to 5)
function renderDashboardRecentStudents(studentList = allStudentsList) {
  if (!dashboardStudentsTableBody) return;

  if (studentList.length === 0) {
    dashboardStudentsTableBody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 28px; color: var(--slate-400);">
          No registered students found matching filter criteria.
        </td>
      </tr>
    `;
    return;
  }

  const sorted = [...studentList].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)).slice(0, 5);
  dashboardStudentsTableBody.innerHTML = sorted.map((s) => createStudentRowHtml(s)).join('');
  
  if (window.lucide) {
    lucide.createIcons();
  }
}

// -------------------------------------------------------------------------
// Gamification Helpers & Standings Logic (Part 8 Requirements)
// -------------------------------------------------------------------------

function getStudentStreak(uid) {
  const data = allStreaksMap[uid];
  if (!data) return { currentStreak: 0, bestStreak: 0, lastActiveDate: null };
  return {
    currentStreak: data.currentStreak || data.streak || 0,
    bestStreak: data.bestStreak || data.maxStreak || (data.currentStreak || 0),
    lastActiveDate: data.lastActiveDate || data.updatedAt || null
  };
}

function getStudentXp(uid) {
  const data = allXpMap[uid];
  if (!data) return { totalXp: 0, level: 1 };
  if (typeof data === 'number') return { totalXp: data, level: Math.floor(data / 100) + 1 };
  const points = data.totalXp ?? data.points ?? data.xp ?? 0;
  return {
    totalXp: Number(points) || 0,
    level: data.level || (Math.floor(points / 100) + 1)
  };
}

function getStudentTier(xp) {
  if (xp >= 1000) return { name: 'Grandmaster Mathematician', badgeClass: 'badge-jee', color: '#7c3aed' };
  if (xp >= 500) return { name: 'Master Mathematician', badgeClass: 'badge-completed', color: '#059669' };
  if (xp >= 200) return { name: 'Advanced Thinker', badgeClass: 'badge-board', color: '#2563eb' };
  if (xp >= 50) return { name: 'Active Problem Solver', badgeClass: 'badge-class11', color: '#0d9488' };
  return { name: 'Novice Mathematician', badgeClass: 'badge-pending', color: '#64748b' };
}

function getStudentAchievements(uid) {
  const data = allAchievementsMap[uid];
  if (!data) return [];
  if (Array.isArray(data)) return data;
  return Object.keys(data).map(key => ({
    id: key,
    ...(typeof data[key] === 'object' ? data[key] : { unlockedAt: data[key] })
  }));
}

function updateGamificationMetrics() {
  if (activeModule === 'leaderboard') {
    renderGamificationStandingsTable();
  }
}

window.switchLeaderboardSubTab = function(tabName) {
  const btnExams = document.getElementById('tab-btn-leaderboard-exams');
  const btnGamify = document.getElementById('tab-btn-leaderboard-gamify');
  const paneExams = document.getElementById('leaderboard-subpane-exams');
  const paneGamify = document.getElementById('leaderboard-subpane-gamify');

  if (tabName === 'exams') {
    if (btnExams) btnExams.classList.add('active');
    if (btnGamify) btnGamify.classList.remove('active');
    if (paneExams) paneExams.style.display = 'block';
    if (paneGamify) paneGamify.style.display = 'none';
    renderLeaderboardSection();
  } else {
    if (btnExams) btnExams.classList.remove('active');
    if (btnGamify) btnGamify.classList.add('active');
    if (paneExams) paneExams.style.display = 'none';
    if (paneGamify) paneGamify.style.display = 'block';
    renderGamificationStandingsTable();
  }

  if (window.lucide) {
    lucide.createIcons();
  }
};

window.renderGamificationStandingsTable = function() {
  const tbody = document.getElementById('gamify-table-body');
  const badgeCount = document.getElementById('gamify-badge-count');
  const searchInput = document.getElementById('gamify-search-input');
  const classFilter = document.getElementById('gamify-class-filter');
  const prepFilter = document.getElementById('gamify-prep-filter');

  const statActiveStreaks = document.getElementById('gamify-stat-active-streaks');
  const statTopLearner = document.getElementById('gamify-stat-top-learner');
  const statTopLearnerXp = document.getElementById('gamify-stat-top-learner-xp');
  const statBestStreak = document.getElementById('gamify-stat-best-streak');
  const statBestStreakHolder = document.getElementById('gamify-stat-best-streak-holder');
  const statTotalBadges = document.getElementById('gamify-stat-total-badges');

  const searchQuery = (searchInput?.value || '').toLowerCase().trim();
  const selectedClass = classFilter?.value || 'all';
  const selectedPrep = prepFilter?.value || 'all';

  // Filter students
  let filtered = allStudentsList.filter((s) => {
    if (selectedClass !== 'all' && s.class !== selectedClass) return false;
    if (selectedPrep !== 'all' && s.preparation !== selectedPrep) return false;
    if (searchQuery) {
      const matchName = (s.name || '').toLowerCase().includes(searchQuery);
      const matchEmail = (s.email || '').toLowerCase().includes(searchQuery);
      const matchPhone = (s.phone || '').includes(searchQuery);
      if (!matchName && !matchEmail && !matchPhone) return false;
    }
    return true;
  });

  // Calculate stats
  let activeStreaksCount = 0;
  let highestXpStudent = null;
  let maxAcademyStreak = 0;
  let maxStreakHolder = null;
  let totalBadgesEarned = 0;

  allStudentsList.forEach((s) => {
    const strk = getStudentStreak(s.uid);
    const xpObj = getStudentXp(s.uid);
    const ach = getStudentAchievements(s.uid);

    if (strk.currentStreak > 0) activeStreaksCount++;
    if (strk.bestStreak > maxAcademyStreak) {
      maxAcademyStreak = strk.bestStreak;
      maxStreakHolder = s.name || s.email;
    }
    if (!highestXpStudent || xpObj.totalXp > highestXpStudent.xp) {
      highestXpStudent = { name: s.name || s.email, xp: xpObj.totalXp };
    }
    totalBadgesEarned += ach.length;
  });

  if (statActiveStreaks) statActiveStreaks.textContent = activeStreaksCount;
  if (statTopLearner) statTopLearner.textContent = highestXpStudent ? highestXpStudent.name : '—';
  if (statTopLearnerXp) statTopLearnerXp.textContent = highestXpStudent ? `${highestXpStudent.xp} XP` : '0 XP';
  if (statBestStreak) statBestStreak.textContent = `${maxAcademyStreak} Days`;
  if (statBestStreakHolder) statBestStreakHolder.textContent = maxStreakHolder || 'No streaks yet';
  if (statTotalBadges) statTotalBadges.textContent = totalBadgesEarned;

  if (badgeCount) badgeCount.textContent = `${filtered.length} Learners`;

  if (!tbody) return;

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="9" style="text-align: center; padding: 40px; color: var(--slate-400);">
          No students found matching gamification filters.
        </td>
      </tr>
    `;
    return;
  }

  // Sort by XP descending -> Streak descending -> Longest streak -> Name
  const standings = filtered.map((s) => ({
    student: s,
    streak: getStudentStreak(s.uid),
    xp: getStudentXp(s.uid),
    tier: getStudentTier(getStudentXp(s.uid).totalXp),
    achievements: getStudentAchievements(s.uid)
  }));

  standings.sort((a, b) => {
    if (b.xp.totalXp !== a.xp.totalXp) return b.xp.totalXp - a.xp.totalXp;
    if (b.streak.currentStreak !== a.streak.currentStreak) return b.streak.currentStreak - a.streak.currentStreak;
    if (b.streak.bestStreak !== a.streak.bestStreak) return b.streak.bestStreak - a.streak.bestStreak;
    return (a.student.name || '').localeCompare(b.student.name || '');
  });

  tbody.innerHTML = standings.map((item, index) => {
    const rank = index + 1;
    let rankBadge = `<span style="font-weight: 700; color: var(--slate-600); font-size: 13px;">#${rank}</span>`;
    if (rank === 1) rankBadge = `<span class="rank-badge rank-1" title="Academy Leader">🥇 1</span>`;
    else if (rank === 2) rankBadge = `<span class="rank-badge rank-2" title="Runner-up">🥈 2</span>`;
    else if (rank === 3) rankBadge = `<span class="rank-badge rank-3" title="Third Place">🥉 3</span>`;

    const classBadge = item.student.class === 'Class 12' ? 'badge-class12' : 'badge-class11';
    const prepBadge = (item.student.preparation || '').includes('JEE') ? 'badge-jee' : 'badge-board';

    const avatarInitial = (item.student.name || item.student.email || 'S').charAt(0).toUpperCase();

    return `
      <tr>
        <td style="text-align: center;">${rankBadge}</td>
        <td>
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 34px; height: 34px; border-radius: 50%; background: #eef2ff; color: var(--primary); font-weight: 700; font-size: 12.5px; display: flex; align-items: center; justify-content: center; border: 1px solid #c7d2fe;">
              ${avatarInitial}
            </div>
            <div>
              <div style="font-weight: 700; color: var(--slate-900); font-size: 13.5px;">
                ${escapeHtml(item.student.name || 'Unnamed Student')}
              </div>
              <div style="font-size: 11.5px; color: var(--slate-400);">
                ${escapeHtml(item.student.email || 'No email')}
              </div>
            </div>
          </div>
        </td>
        <td>
          <div style="display: flex; gap: 4px; flex-wrap: wrap;">
            <span class="badge ${classBadge}">${escapeHtml(item.student.class || 'Class 11')}</span>
            <span class="badge ${prepBadge}">${escapeHtml(item.student.preparation || 'Board')}</span>
          </div>
        </td>
        <td style="text-align: center;">
          <span class="badge-streak">
            🔥 ${item.streak.currentStreak} Days
          </span>
        </td>
        <td style="text-align: center; font-size: 12.5px; color: var(--slate-600); font-weight: 600;">
          ${item.streak.bestStreak} Days
        </td>
        <td style="text-align: right;">
          <span style="font-weight: 800; color: var(--primary); font-size: 14px;">
            ${item.xp.totalXp}
          </span>
          <span style="font-size: 11px; color: var(--slate-400); margin-left: 2px;">XP</span>
        </td>
        <td>
          <span class="badge ${item.tier.badgeClass}" style="font-size: 11.5px;">
            ${item.tier.name}
          </span>
        </td>
        <td style="text-align: center;">
          <span class="badge" style="background: #f1f5f9; color: var(--slate-700); font-weight: 700;">
            ${item.achievements.length} Badges
          </span>
        </td>
        <td style="text-align: center;">
          <button type="button" class="btn-icon-action" title="View Student Dossier" onclick="viewStudentProfile('${item.student.uid}')">
            <i data-lucide="eye" style="width: 14px; height: 14px;"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');

  if (window.lucide) {
    lucide.createIcons();
  }
};

// Render Full Students Directory Table
function renderStudentsDirectoryTable() {
  if (!studentsTableBody) return;

  const searchQuery = (studentSearchInput?.value || '').toLowerCase().trim();
  const filterVal = studentFilterSelect?.value || 'all';
  const sortVal = studentSortSelect?.value || 'newest';

  let filtered = allStudentsList.filter((s) => {
    const matchesSearch = 
      (s.name || '').toLowerCase().includes(searchQuery) ||
      (s.email || '').toLowerCase().includes(searchQuery) ||
      (s.phone || '').includes(searchQuery);

    const matchesFilter = 
      filterVal === 'all' || 
      (filterVal === 'Class 11' && s.class === 'Class 11') ||
      (filterVal === 'Class 12' && s.class === 'Class 12') ||
      (filterVal === 'Board' && s.preparation === 'Board') ||
      (filterVal === 'JEE' && s.preparation === 'JEE') ||
      (filterVal === 'completed' && s.profileCompleted) ||
      (filterVal === 'incomplete' && !s.profileCompleted);

    return matchesSearch && matchesFilter;
  });

  // Sorting
  if (sortVal === 'newest') {
    filtered.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  } else if (sortVal === 'oldest') {
    filtered.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
  } else if (sortVal === 'name') {
    filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }

  if (filtered.length === 0) {
    studentsTableBody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 36px; color: var(--slate-400);">
          <div style="font-size: 14px; font-weight: 500;">No students match your query.</div>
          <div style="font-size: 12px; margin-top: 4px;">Try changing search terms or filtering options.</div>
        </td>
      </tr>
    `;
    return;
  }

  studentsTableBody.innerHTML = filtered.map((s) => createStudentRowHtml(s)).join('');

  if (window.lucide) {
    lucide.createIcons();
  }
}

function createStudentRowHtml(s) {
  const avatarLetter = (s.name || s.email || 'S').charAt(0).toUpperCase();
  const joinedDate = s.createdAt 
    ? new Date(s.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Recent';

  const classBadgeClass = s.class === 'Class 11' ? 'badge-class11' : s.class === 'Class 12' ? 'badge-class12' : 'badge-pending';
  const prepBadgeClass = s.preparation === 'Board' ? 'badge-board' : s.preparation === 'JEE' ? 'badge-jee' : 'badge-pending';

  const avatarHtml = s.photoURL 
    ? `<img src="${s.photoURL}" alt="${s.name || 'Student'}" class="student-avatar" />`
    : `<div class="student-avatar">${avatarLetter}</div>`;

  return `
    <tr>
      <td>
        <div class="student-cell">
          ${avatarHtml}
          <div class="student-info-text">
            <div class="student-name">${escapeHtml(s.name || 'Unnamed Student')}</div>
            <div class="student-email">${escapeHtml(s.email || 'No email')}</div>
          </div>
        </div>
      </td>
      <td>
        <span style="font-family: monospace; font-size: 13px; color: var(--slate-700);">
          ${s.phone ? escapeHtml(s.phone) : '<span style="color: var(--slate-400)">Not set</span>'}
        </span>
      </td>
      <td>
        <span class="badge ${classBadgeClass}">
          ${s.class ? escapeHtml(s.class) : 'Pending'}
        </span>
      </td>
      <td>
        <span class="badge ${prepBadgeClass}">
          ${s.preparation ? escapeHtml(s.preparation) : 'Pending'}
        </span>
      </td>
      <td>
        <span class="badge ${s.profileCompleted ? 'badge-completed' : 'badge-pending'}">
          ${s.profileCompleted ? 'Completed' : 'Incomplete'}
        </span>
      </td>
      <td style="font-size: 12.5px; color: var(--slate-500);">
        ${joinedDate}
      </td>
      <td>
        <button class="btn-icon-action" title="View Profile" onclick="viewStudentProfile('${s.uid}')">
          <i data-lucide="eye" style="width: 14px; height: 14px;"></i>
        </button>
      </td>
    </tr>
  `;
}

// =========================================================================
// 360-DEGREE STUDENT DOSSIER MANAGEMENT (PART 8)
// =========================================================================

window.viewStudentProfile = function(uid) {
  const student = allStudentsList.find((s) => s.uid === uid);
  if (!student || !studentModal) return;

  currentDossierStudentUid = uid;
  populateStudentDossier(student);
  switchStudentTab('profile');

  studentModal.classList.add('active');
  if (window.lucide) {
    lucide.createIcons();
  }
};

window.viewStudentDetail = window.viewStudentProfile;

window.closeStudentModal = function() {
  currentDossierStudentUid = null;
  toggleEditStudentProfile(false);
  if (studentModal) studentModal.classList.remove('active');
};

window.refreshCurrentDossier = function() {
  if (!currentDossierStudentUid) return;
  const student = allStudentsList.find((s) => s.uid === currentDossierStudentUid);
  if (student) {
    populateStudentDossier(student);
  }
};

window.switchStudentTab = function(tabId) {
  currentStudentActiveTab = tabId;

  // Toggle button styles
  const tabButtons = document.querySelectorAll('.modal-tabs-header .modal-tab-btn');
  tabButtons.forEach(btn => {
    const attr = btn.getAttribute('onclick') || '';
    if (attr.includes(`'${tabId}'`)) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Toggle panes
  const panes = [
    { id: 'profile', el: document.getElementById('student-tab-pane-profile') },
    { id: 'tests', el: document.getElementById('student-tab-pane-tests') },
    { id: 'homework', el: document.getElementById('student-tab-pane-homework') },
    { id: 'attendance', el: document.getElementById('student-tab-pane-attendance') },
    { id: 'gamification', el: document.getElementById('student-tab-pane-gamification') }
  ];

  panes.forEach(p => {
    if (p.el) {
      if (p.id === tabId) {
        p.el.classList.add('active');
      } else {
        p.el.classList.remove('active');
      }
    }
  });

  if (window.lucide) {
    lucide.createIcons();
  }
};

window.toggleEditStudentProfile = function(isEdit) {
  const viewMode = document.getElementById('student-profile-view-mode');
  const editMode = document.getElementById('student-profile-edit-mode');
  const btnToggle = document.getElementById('btn-toggle-edit-profile');

  if (isEdit) {
    if (viewMode) viewMode.style.display = 'none';
    if (editMode) editMode.style.display = 'block';
    if (btnToggle) btnToggle.style.display = 'none';
  } else {
    if (viewMode) viewMode.style.display = 'block';
    if (editMode) editMode.style.display = 'none';
    if (btnToggle) btnToggle.style.display = 'inline-flex';
  }
};

window.saveStudentProfileChanges = async function(event) {
  if (event) event.preventDefault();
  if (!currentDossierStudentUid) return;

  const nameInput = document.getElementById('edit-student-name');
  const phoneInput = document.getElementById('edit-student-phone');
  const classInput = document.getElementById('edit-student-class');
  const prepInput = document.getElementById('edit-student-prep');
  const saveBtn = document.getElementById('btn-save-student-profile');

  const newName = nameInput ? nameInput.value.trim() : '';
  const newPhone = phoneInput ? phoneInput.value.trim() : '';
  const newClass = classInput ? classInput.value : 'Class 11';
  const newPrep = prepInput ? prepInput.value : 'Board';

  if (!newName) {
    showToast("Student name cannot be empty", "error");
    return;
  }

  if (saveBtn) {
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<span>Saving updates...</span>';
  }

  try {
    const updates = {
      name: newName,
      phone: newPhone,
      class: newClass,
      preparation: newPrep,
      profileCompleted: true,
      updatedAt: Date.now()
    };

    await db.ref(`users/${currentDossierStudentUid}`).update(updates);

    // Update local student in cache
    const student = allStudentsList.find(s => s.uid === currentDossierStudentUid);
    if (student) {
      Object.assign(student, updates);
    }

    showToast("Student profile successfully updated in Firebase!", "success");
    toggleEditStudentProfile(false);
    populateStudentDossier(student || { uid: currentDossierStudentUid, ...updates });
    applyDashboardFilters();
    renderStudentsDirectoryTable();
  } catch (error) {
    console.error("Error saving student profile:", error);
    showToast("Failed to save changes: " + (error.message || error), "error");
  } finally {
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.innerHTML = '<i data-lucide="check" style="width: 14px; height: 14px;"></i><span>Save Profile Changes</span>';
      if (window.lucide) lucide.createIcons();
    }
  }
};

function populateStudentDossier(student) {
  const uid = student.uid;

  // 1. Basic Header & Profile Fields
  const avatarDisplay = document.getElementById('student-modal-avatar');
  const nameDisplay = document.getElementById('student-modal-name');
  const emailDisplay = document.getElementById('student-modal-email');
  const emailValDisplay = document.getElementById('student-modal-email-value');
  const phoneDisplay = document.getElementById('student-modal-phone');
  const classDisplay = document.getElementById('student-modal-class');
  const prepDisplay = document.getElementById('student-modal-prep');
  const statusBadge = document.getElementById('student-modal-status-badge');
  const createdDisplay = document.getElementById('student-modal-created');
  const updatedDisplay = document.getElementById('student-modal-updated');
  const uidDisplay = document.getElementById('student-modal-uid');

  if (nameDisplay) nameDisplay.textContent = student.name || 'Unnamed Student';
  if (emailDisplay) emailDisplay.textContent = student.email || 'No email provided';
  if (emailValDisplay) emailValDisplay.textContent = student.email || 'No email provided';
  if (phoneDisplay) phoneDisplay.textContent = student.phone || 'Not Provided';
  if (classDisplay) classDisplay.textContent = student.class || 'Class 11';
  if (prepDisplay) prepDisplay.textContent = student.preparation || 'Board';
  if (uidDisplay) uidDisplay.textContent = uid;

  if (createdDisplay) {
    createdDisplay.textContent = student.createdAt 
      ? new Date(student.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
      : 'Unknown';
  }
  if (updatedDisplay) {
    updatedDisplay.textContent = student.updatedAt 
      ? new Date(student.updatedAt).toLocaleString()
      : 'Not recorded';
  }

  if (avatarDisplay) {
    if (student.photoURL) {
      avatarDisplay.innerHTML = `<img src="${student.photoURL}" alt="" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;" />`;
    } else {
      avatarDisplay.innerHTML = (student.name || student.email || 'S').charAt(0).toUpperCase();
    }
  }

  if (statusBadge) {
    statusBadge.textContent = student.profileCompleted ? 'Profile Complete' : 'Profile Pending';
    statusBadge.className = student.profileCompleted ? 'badge-status status-active' : 'badge-status';
  }

  // Pre-fill Edit Form Inputs
  const editName = document.getElementById('edit-student-name');
  const editPhone = document.getElementById('edit-student-phone');
  const editClass = document.getElementById('edit-student-class');
  const editPrep = document.getElementById('edit-student-prep');

  if (editName) editName.value = student.name || '';
  if (editPhone) editPhone.value = student.phone || '';
  if (editClass) editClass.value = student.class || 'Class 11';
  if (editPrep) editPrep.value = student.preparation || 'Board';

  // Quick Action Buttons
  const btnWhatsapp = document.getElementById('student-contact-whatsapp');
  const btnCall = document.getElementById('student-contact-call');
  const btnEmail = document.getElementById('student-contact-email');

  const cleanPhone = (student.phone || '').replace(/[^0-9]/g, '');
  if (cleanPhone && btnWhatsapp) {
    btnWhatsapp.href = `https://wa.me/${cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone}`;
    btnWhatsapp.style.display = 'inline-flex';
  } else if (btnWhatsapp) {
    btnWhatsapp.style.display = 'none';
  }

  if (cleanPhone && btnCall) {
    btnCall.href = `tel:+${cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone}`;
    btnCall.style.display = 'inline-flex';
  } else if (btnCall) {
    btnCall.style.display = 'none';
  }

  if (student.email && btnEmail) {
    btnEmail.href = `mailto:${student.email}`;
    btnEmail.style.display = 'inline-flex';
  } else if (btnEmail) {
    btnEmail.style.display = 'none';
  }

  // -----------------------------------------------------------------------
  // 2. Test Attempts History & Performance Metrics
  // -----------------------------------------------------------------------
  const studentAttempts = allTestAttemptsList.filter(a => a.userId === uid);
  const testsTbody = document.getElementById('student-dossier-tests-tbody');
  const kpiTests = document.getElementById('dossier-kpi-tests');
  const kpiScore = document.getElementById('dossier-kpi-score');
  const tabCountTests = document.getElementById('dossier-tab-count-tests');

  let avgStudentScore = 0;
  if (studentAttempts.length > 0) {
    const totalScorePct = studentAttempts.reduce((acc, a) => {
      let pct = a.percentage;
      if (pct === undefined || isNaN(pct)) {
        pct = a.totalMarks > 0 ? (a.score / a.totalMarks) * 100 : 0;
      }
      return acc + (Number(pct) || 0);
    }, 0);
    avgStudentScore = Math.round(totalScorePct / studentAttempts.length);
  }

  if (kpiTests) kpiTests.textContent = studentAttempts.length;
  if (kpiScore) kpiScore.textContent = `${avgStudentScore}% avg`;
  if (tabCountTests) tabCountTests.textContent = studentAttempts.length;

  if (testsTbody) {
    if (studentAttempts.length === 0) {
      testsTbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 28px; color: var(--slate-400);">
            <i data-lucide="clipboard-x" style="width: 28px; height: 28px; color: var(--slate-300); margin-bottom: 6px;"></i>
            <div>No mock test submissions found for this student yet.</div>
          </td>
        </tr>
      `;
    } else {
      testsTbody.innerHTML = studentAttempts.map((att) => {
        const testObj = allTestsList.find(t => t.id === att.testId);
        const testTitle = testObj ? testObj.title : (att.testTitle || 'Test Submission');

        let pct = att.percentage;
        if (pct === undefined || isNaN(pct)) {
          pct = att.totalMarks > 0 ? Math.round((att.score / att.totalMarks) * 100) : 0;
        }

        const dateStr = att.submittedAt 
          ? new Date(att.submittedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) + ' ' +
            new Date(att.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : '—';

        const timeMin = Math.round((att.timeTakenSeconds || 0) / 60);

        let pctBadgeClass = 'badge-pending';
        if (pct >= 80) pctBadgeClass = 'badge-completed';
        else if (pct >= 60) pctBadgeClass = 'badge-board';
        else if (pct >= 40) pctBadgeClass = 'badge-jee';

        return `
          <tr>
            <td>
              <div style="font-weight: 700; color: var(--slate-900);">${escapeHtml(testTitle)}</div>
              <div style="font-size: 11px; color: var(--slate-400);">ID: ${escapeHtml(att.testId)}</div>
            </td>
            <td style="font-size: 12px; color: var(--slate-600);">${dateStr}</td>
            <td style="text-align: right; font-weight: 700; font-size: 13.5px;">
              ${att.score} <span style="font-size: 11px; color: var(--slate-400); font-weight: 400;">/ ${att.totalMarks || 0}</span>
            </td>
            <td style="text-align: right;">
              <span class="badge ${pctBadgeClass}">${pct}%</span>
            </td>
            <td style="text-align: right; font-weight: 600; color: var(--slate-700);">
              ${att.accuracy ?? 0}%
            </td>
            <td style="font-size: 12px; color: var(--slate-600);">
              ${timeMin > 0 ? `${timeMin} mins` : `${att.timeTakenSeconds || 0}s`}
            </td>
            <td style="text-align: center;">
              <button type="button" class="btn-icon-action" title="View Submission Paper" onclick="openAttemptDetailModal('${escapeHtml(att.testId)}', '${escapeHtml(uid)}')">
                <i data-lucide="eye" style="width: 14px; height: 14px;"></i>
              </button>
            </td>
          </tr>
        `;
      }).join('');
    }
  }

  // -----------------------------------------------------------------------
  // 3. Homework Progress Tracking
  // -----------------------------------------------------------------------
  const studentHwList = allHomeworkList.filter(h => !student.class || h.class === student.class);
  const hwTbody = document.getElementById('student-dossier-hw-tbody');
  const kpiHw = document.getElementById('dossier-kpi-hw');
  const kpiHwSub = document.getElementById('dossier-kpi-hw-sub');
  const tabCountHw = document.getElementById('dossier-tab-count-hw');

  let hwCompletedCount = 0;
  studentHwList.forEach((h) => {
    const prog = allHomeworkProgressData[h.id]?.[uid];
    if (prog && (prog.status === 'Completed' || prog.completed)) {
      hwCompletedCount++;
    }
  });

  const hwRate = studentHwList.length > 0 ? Math.round((hwCompletedCount / studentHwList.length) * 100) : 100;

  if (kpiHw) kpiHw.textContent = `${hwCompletedCount}/${studentHwList.length}`;
  if (kpiHwSub) kpiHwSub.textContent = `${hwRate}% completion`;
  if (tabCountHw) tabCountHw.textContent = studentHwList.length;

  if (hwTbody) {
    if (studentHwList.length === 0) {
      hwTbody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; padding: 28px; color: var(--slate-400);">
            <i data-lucide="book-open" style="width: 28px; height: 28px; color: var(--slate-300); margin-bottom: 6px;"></i>
            <div>No homework assignments found for ${escapeHtml(student.class || 'this class')}.</div>
          </td>
        </tr>
      `;
    } else {
      hwTbody.innerHTML = studentHwList.map((h) => {
        const prog = allHomeworkProgressData[h.id]?.[uid];
        const isDone = prog && (prog.status === 'Completed' || prog.completed);
        const isOverdue = !isDone && h.dueDate && (new Date(h.dueDate).getTime() < Date.now());

        let statusPill = `<span class="badge badge-completed">Completed</span>`;
        if (isOverdue) {
          statusPill = `<span class="badge" style="background: #fff1f2; color: #be123c;">Overdue</span>`;
        } else if (!isDone) {
          statusPill = `<span class="badge badge-pending">Pending</span>`;
        }

        const dueFormatted = h.dueDate 
          ? new Date(h.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
          : 'No deadline';

        let submissionNote = '<span style="color: var(--slate-400); font-size: 11.5px;">Pending</span>';
        if (isDone) {
          const doneDate = prog.completedAt ? new Date(prog.completedAt).toLocaleDateString() : 'Recorded';
          submissionNote = `<span style="color: var(--emerald-700); font-weight: 600; font-size: 11.5px;">Submitted on ${doneDate}</span>`;
        }

        return `
          <tr>
            <td>
              <div style="font-weight: 700; color: var(--slate-900);">${escapeHtml(h.title)}</div>
              ${h.description ? `<div style="font-size: 11.5px; color: var(--slate-500);">${escapeHtml(h.description.substring(0, 50))}...</div>` : ''}
            </td>
            <td><span class="badge badge-class11">${escapeHtml(h.class)}</span></td>
            <td style="font-size: 12px; color: var(--slate-600);">${dueFormatted}</td>
            <td>${statusPill}</td>
            <td>${submissionNote}</td>
          </tr>
        `;
      }).join('');
    }
  }

  // -----------------------------------------------------------------------
  // 4. Attendance History
  // -----------------------------------------------------------------------
  const attDates = Object.keys(allAttendanceDatesMap).sort().reverse();
  const attTbody = document.getElementById('student-dossier-att-tbody');
  const kpiAtt = document.getElementById('dossier-kpi-att');
  const kpiAttSub = document.getElementById('dossier-kpi-att-sub');
  const tabCountAtt = document.getElementById('dossier-tab-count-att');
  const summaryBadgeAtt = document.getElementById('dossier-att-summary-badge');

  let totalSessions = 0;
  let presentSessions = 0;
  const attendanceHistory = [];

  attDates.forEach((dateKey) => {
    const dayRecords = allAttendanceDatesMap[dateKey] || {};
    if (dayRecords[uid]) {
      totalSessions++;
      const isPresent = dayRecords[uid].status === 'present';
      if (isPresent) presentSessions++;
      attendanceHistory.push({
        date: dateKey,
        status: isPresent ? 'present' : 'absent',
        markedBy: dayRecords[uid].markedBy || 'Faculty',
        markedAt: dayRecords[uid].markedAt
      });
    }
  });

  const attRate = totalSessions > 0 ? Math.round((presentSessions / totalSessions) * 100) : 100;

  if (kpiAtt) kpiAtt.textContent = `${attRate}%`;
  if (kpiAttSub) kpiAttSub.textContent = `${presentSessions} of ${totalSessions} present`;
  if (tabCountAtt) tabCountAtt.textContent = `${attRate}%`;
  if (summaryBadgeAtt) summaryBadgeAtt.textContent = `${presentSessions}/${totalSessions} Sessions (${attRate}%)`;

  if (attTbody) {
    if (attendanceHistory.length === 0) {
      attTbody.innerHTML = `
        <tr>
          <td colspan="4" style="text-align: center; padding: 28px; color: var(--slate-400);">
            <i data-lucide="calendar-x" style="width: 28px; height: 28px; color: var(--slate-300); margin-bottom: 6px;"></i>
            <div>No classroom attendance entries logged for this student yet.</div>
          </td>
        </tr>
      `;
    } else {
      attTbody.innerHTML = attendanceHistory.map((item) => {
        const isPresent = item.status === 'present';
        const dateObj = new Date(item.date);
        const formattedDate = !isNaN(dateObj.getTime())
          ? dateObj.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
          : item.date;

        const timeStr = item.markedAt ? new Date(item.markedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—';

        return `
          <tr style="${isPresent ? 'background: #ffffff;' : 'background: #fffbfb;'}">
            <td style="font-weight: 600; color: var(--slate-900); font-size: 12.5px;">${formattedDate}</td>
            <td>
              <span class="badge ${isPresent ? 'badge-completed' : ''}" style="${!isPresent ? 'background: #fff1f2; color: #be123c;' : ''}">
                ${isPresent ? 'Present' : 'Absent'}
              </span>
            </td>
            <td><span class="badge badge-board">${escapeHtml(student.class || 'Enrolled Batch')}</span></td>
            <td style="font-size: 11.5px; color: var(--slate-500);">
              By ${escapeHtml(item.markedBy)} ${timeStr !== '—' ? `at ${timeStr}` : ''}
            </td>
          </tr>
        `;
      }).join('');
    }
  }

  // -----------------------------------------------------------------------
  // 5. Streaks, XP & Gamification Achievements
  // -----------------------------------------------------------------------
  const streakData = getStudentStreak(uid);
  const xpData = getStudentXp(uid);
  const tier = getStudentTier(xpData.totalXp);
  const achievements = getStudentAchievements(uid);

  const kpiStreak = document.getElementById('dossier-kpi-streak');
  const kpiStreakSub = document.getElementById('dossier-kpi-streak-sub');
  const kpiXp = document.getElementById('dossier-kpi-xp');
  const kpiRank = document.getElementById('dossier-kpi-rank');

  const gamifyStreak = document.getElementById('dossier-gamify-streak');
  const gamifyBestStreak = document.getElementById('dossier-gamify-best-streak');
  const gamifyXp = document.getElementById('dossier-gamify-xp');
  const gamifyTier = document.getElementById('dossier-gamify-tier');
  const badgesGrid = document.getElementById('dossier-gamify-badges-grid');

  if (kpiStreak) kpiStreak.textContent = `${streakData.currentStreak} 🔥`;
  if (kpiStreakSub) kpiStreakSub.textContent = `${streakData.bestStreak} best streak`;
  if (kpiXp) kpiXp.textContent = `${xpData.totalXp} 💎`;
  if (kpiRank) kpiRank.textContent = tier.name;

  if (gamifyStreak) gamifyStreak.textContent = streakData.currentStreak;
  if (gamifyBestStreak) gamifyBestStreak.textContent = streakData.bestStreak;
  if (gamifyXp) gamifyXp.textContent = xpData.totalXp;
  if (gamifyTier) gamifyTier.textContent = tier.name;

  // Render Badges Catalog with dynamic unlock status
  if (badgesGrid) {
    const standardBadges = [
      {
        id: 'first_test',
        icon: 'clipboard-check',
        title: 'First Attempt',
        desc: 'Completed first mock exam',
        unlocked: studentAttempts.length > 0 || achievements.some(a => a.id === 'first_test')
      },
      {
        id: 'streak_3',
        icon: 'flame',
        title: '3-Day Consistency',
        desc: '3 continuous study days',
        unlocked: streakData.bestStreak >= 3 || achievements.some(a => a.id === 'streak_3')
      },
      {
        id: 'streak_7',
        icon: 'zap',
        title: 'Weekly Warrior',
        desc: '7 continuous study days',
        unlocked: streakData.bestStreak >= 7 || achievements.some(a => a.id === 'streak_7')
      },
      {
        id: 'xp_100',
        icon: 'star',
        title: 'Centurion 100 XP',
        desc: 'Accumulated 100+ Academy XP',
        unlocked: xpData.totalXp >= 100 || achievements.some(a => a.id === 'xp_100')
      },
      {
        id: 'xp_500',
        icon: 'crown',
        title: 'Master Mind 500 XP',
        desc: 'Accumulated 500+ Academy XP',
        unlocked: xpData.totalXp >= 500 || achievements.some(a => a.id === 'xp_500')
      },
      {
        id: 'distinction',
        icon: 'award',
        title: 'Distinction Scorer',
        desc: 'Scored ≥85% in any mock test',
        unlocked: studentAttempts.some(a => (a.percentage || 0) >= 85) || achievements.some(a => a.id === 'distinction')
      },
      {
        id: 'homework_pro',
        icon: 'book-check',
        title: 'Homework Master',
        desc: 'Submitted assigned homework',
        unlocked: hwCompletedCount > 0 || achievements.some(a => a.id === 'homework_pro')
      },
      {
        id: 'perfect_presence',
        icon: 'check-circle-2',
        title: 'Dedicated Attendee',
        desc: 'Maintained ≥80% attendance',
        unlocked: totalSessions > 0 && attRate >= 80
      }
    ];

    badgesGrid.innerHTML = standardBadges.map((b) => {
      if (b.unlocked) {
        return `
          <div style="background: #ffffff; border: 1px solid #a7f3d0; border-radius: var(--radius-sm); padding: 12px; display: flex; align-items: center; gap: 12px; box-shadow: 0 1px 2px rgba(0,0,0,0.04);">
            <div style="width: 38px; height: 38px; border-radius: 50%; background: #ecfdf5; color: #047857; display: flex; align-items: center; justify-content: center; flex-shrink: 0; border: 1px solid #6ee7b7;">
              <i data-lucide="${b.icon}" style="width: 20px; height: 20px;"></i>
            </div>
            <div style="flex: 1; min-width: 0;">
              <div style="font-weight: 700; color: var(--slate-900); font-size: 13px; display: flex; align-items: center; justify-content: space-between;">
                <span>${escapeHtml(b.title)}</span>
                <span class="badge badge-completed" style="font-size: 10px; padding: 1px 6px;">Unlocked</span>
              </div>
              <div style="font-size: 11.5px; color: var(--slate-500); margin-top: 2px;">${escapeHtml(b.desc)}</div>
            </div>
          </div>
        `;
      } else {
        return `
          <div style="background: var(--slate-50); border: 1px solid var(--slate-200); border-radius: var(--radius-sm); padding: 12px; display: flex; align-items: center; gap: 12px; opacity: 0.7;">
            <div style="width: 38px; height: 38px; border-radius: 50%; background: var(--slate-100); color: var(--slate-400); display: flex; align-items: center; justify-content: center; flex-shrink: 0; border: 1px solid var(--slate-200);">
              <i data-lucide="${b.icon}" style="width: 20px; height: 20px;"></i>
            </div>
            <div style="flex: 1; min-width: 0;">
              <div style="font-weight: 600; color: var(--slate-600); font-size: 13px; display: flex; align-items: center; justify-content: space-between;">
                <span>${escapeHtml(b.title)}</span>
                <span class="badge badge-pending" style="font-size: 10px; padding: 1px 6px;">Locked</span>
              </div>
              <div style="font-size: 11.5px; color: var(--slate-400); margin-top: 2px;">${escapeHtml(b.desc)}</div>
            </div>
          </div>
        `;
      }
    }).join('');
  }

  if (window.lucide) {
    lucide.createIcons();
  }
}

// Event listeners for students search & filter
if (studentSearchInput) {
  studentSearchInput.addEventListener('input', renderStudentsDirectoryTable);
}
if (studentFilterSelect) {
  studentFilterSelect.addEventListener('change', renderStudentsDirectoryTable);
}
if (studentSortSelect) {
  studentSortSelect.addEventListener('change', renderStudentsDirectoryTable);
}

// =========================================================================
// 2. DYNAMIC HOMEPAGE BANNERS MANAGEMENT
// =========================================================================

const INITIAL_DEFAULT_BANNERS = [
  {
    title: "Master High-Yield Calculus & Coordinate Geometry",
    description: "Systematic conceptual clarity, advanced problem solving, and targeted PYQs to secure your dream engineering seat.",
    buttonText: "Explore JEE Program",
    buttonLink: "#classes-section",
    phone: "+91 98765 43210",
    active: true,
    order: 1,
    createdAt: Date.now()
  },
  {
    title: "Build Rock-Solid Mathematical Foundations",
    description: "From Trigonometric Identities to Complex Numbers & Calculus basics — bridge the gap from Class 10 with confidence.",
    buttonText: "Start Class 11 Journey",
    buttonLink: "#classes-section",
    phone: "+91 98765 43210",
    active: true,
    order: 2,
    createdAt: Date.now() + 10
  },
  {
    title: "Score a Flawless 100 in Class 12 Board Maths",
    description: "Comprehensive NCERT line-by-line mastery, exemplar proofs, presentation tricks, and sample paper discussions.",
    buttonText: "Join Board 100 Mission",
    buttonLink: "#classes-section",
    phone: "+91 98765 43210",
    active: true,
    order: 3,
    createdAt: Date.now() + 20
  }
];

function listenToBannersData() {
  const bannersRef = db.ref('banners');
  bannersRef.on('value', async (snapshot) => {
    if (!snapshot.exists()) {
      // Seed default banners into RTDB if empty
      for (const banner of INITIAL_DEFAULT_BANNERS) {
        const newRef = bannersRef.push();
        await newRef.set({
          id: newRef.key,
          ...banner
        });
      }
      return;
    }

    const data = snapshot.val() || {};
    const bannersArray = Object.keys(data).map((key) => ({
      id: key,
      ...data[key],
      order: typeof data[key].order === 'number' ? data[key].order : 99
    }));

    // Sort by order ascending
    bannersArray.sort((a, b) => a.order - b.order);
    allBannersList = bannersArray;

    const activeCount = bannersArray.filter((b) => b.active !== false).length;
    if (statBanners) statBanners.textContent = activeCount;
    if (bannersActiveCountBadge) bannersActiveCountBadge.textContent = `${activeCount} Active`;

    renderBannersGrid();
  });
}

function renderBannersGrid() {
  if (!bannersListContainer) return;

  if (allBannersList.length === 0) {
    bannersListContainer.innerHTML = `
      <div style="text-align: center; padding: 48px 20px; background: var(--slate-50); border: 2px dashed var(--slate-200); border-radius: var(--radius-md);">
        <i data-lucide="image" style="width: 42px; height: 42px; color: var(--slate-400); margin-bottom: 10px;"></i>
        <h4 style="font-size: 16px; font-weight: 700; color: var(--slate-800);">No Homepage Banners</h4>
        <p style="font-size: 13px; color: var(--slate-500); margin: 6px 0 16px;">Create your first dynamic banner to appear on the student homepage carousel.</p>
        <button class="btn-primary" onclick="openBannerModal()">
          <i data-lucide="plus" style="width: 14px; height: 14px;"></i>
          <span>Create First Banner</span>
        </button>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
    return;
  }

  bannersListContainer.innerHTML = allBannersList.map((banner, index) => {
    const isFirst = index === 0;
    const isLast = index === allBannersList.length - 1;

    const thumbHtml = banner.imageUrl 
      ? `<img src="${banner.imageUrl}" alt="${escapeHtml(banner.title)}" class="banner-preview-thumb" />`
      : `<div class="banner-preview-thumb"><span>16:9 BANNER</span></div>`;

    return `
      <div class="banner-admin-card ${banner.active ? '' : 'inactive'}" id="banner-card-${banner.id}">
        <!-- Order controls -->
        <div class="order-controls">
          <button 
            class="btn-order" 
            title="Move Up" 
            onclick="moveBannerOrder('${banner.id}', -1)" 
            ${isFirst ? 'disabled style="opacity: 0.3; cursor: not-allowed;"' : ''}
          >
            <i data-lucide="chevron-up" style="width: 12px; height: 12px;"></i>
          </button>
          <button 
            class="btn-order" 
            title="Move Down" 
            onclick="moveBannerOrder('${banner.id}', 1)" 
            ${isLast ? 'disabled style="opacity: 0.3; cursor: not-allowed;"' : ''}
          >
            <i data-lucide="chevron-down" style="width: 12px; height: 12px;"></i>
          </button>
        </div>

        <!-- Thumbnail -->
        ${thumbHtml}

        <!-- Details -->
        <div class="banner-details">
          <h4>${escapeHtml(banner.title)}</h4>
          <p>${escapeHtml(banner.description)}</p>

          <div class="banner-meta-pills">
            <span class="banner-meta-pill">
              <i data-lucide="hash" style="width: 11px; height: 11px;"></i>
              Order #${banner.order}
            </span>
            <span class="banner-meta-pill">
              <i data-lucide="mouse-pointer" style="width: 11px; height: 11px;"></i>
              ${escapeHtml(banner.buttonText || 'Explore')}
            </span>
            ${banner.phone ? `
              <span class="banner-meta-pill">
                <i data-lucide="phone" style="width: 11px; height: 11px;"></i>
                ${escapeHtml(banner.phone)}
              </span>
            ` : ''}
            <span class="badge ${banner.active ? 'badge-completed' : 'badge-pending'}">
              ${banner.active ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        <!-- Actions -->
        <div class="banner-actions-group">
          <!-- Active/Inactive Toggle -->
          <label class="switch" title="Toggle active status">
            <input 
              type="checkbox" 
              ${banner.active ? 'checked' : ''} 
              onchange="toggleBannerActive('${banner.id}', this.checked)" 
            />
            <span class="slider"></span>
          </label>

          <button class="btn-icon-action" title="Edit Banner" onclick="openBannerModal('${banner.id}')">
            <i data-lucide="edit-3" style="width: 15px; height: 15px;"></i>
          </button>

          <button class="btn-icon-action danger" title="Delete Banner" onclick="openDeleteBannerModal('${banner.id}')">
            <i data-lucide="trash-2" style="width: 15px; height: 15px;"></i>
          </button>
        </div>
      </div>
    `;
  }).join('');

  if (window.lucide) {
    lucide.createIcons();
  }
}

// Toggle banner active status
window.toggleBannerActive = async function(bannerId, newStatus) {
  try {
    await db.ref(`banners/${bannerId}`).update({
      active: newStatus,
      updatedAt: Date.now()
    });
    showToast(`Banner ${newStatus ? 'enabled' : 'disabled'} successfully!`, 'info');
  } catch (error) {
    console.error("Error toggling banner active:", error);
    showToast("Failed to update banner status.", "error");
  }
};

// Reorder banners
window.moveBannerOrder = async function(bannerId, direction) {
  const currentIndex = allBannersList.findIndex((b) => b.id === bannerId);
  if (currentIndex === -1) return;

  const targetIndex = currentIndex + direction;
  if (targetIndex < 0 || targetIndex >= allBannersList.length) return;

  const currentBanner = allBannersList[currentIndex];
  const targetBanner = allBannersList[targetIndex];

  // Swap order numbers
  const currentOrder = currentBanner.order;
  let targetOrder = targetBanner.order;
  if (targetOrder === currentOrder) {
    targetOrder = currentOrder + direction;
  }

  try {
    const updates = {};
    updates[`banners/${currentBanner.id}/order`] = targetOrder;
    updates[`banners/${targetBanner.id}/order`] = currentOrder;
    await db.ref().update(updates);
    showToast("Banner display order updated!", "success");
  } catch (error) {
    console.error("Error updating banner order:", error);
    showToast("Failed to re-order banners.", "error");
  }
};

// Add / Edit Modal Controls
window.openBannerModal = function(bannerId = null) {
  if (!bannerModal) return;

  const titleHeader = document.getElementById('banner-modal-title');
  const idInput = document.getElementById('banner-form-id');
  const titleInput = document.getElementById('banner-form-title');
  const descInput = document.getElementById('banner-form-description');
  const imageInput = document.getElementById('banner-form-image');
  const btnTextInput = document.getElementById('banner-form-btn-text');
  const btnLinkInput = document.getElementById('banner-form-btn-link');
  const phoneInput = document.getElementById('banner-form-phone');
  const orderInput = document.getElementById('banner-form-order');
  const activeInput = document.getElementById('banner-form-active');
  const uploadStatus = document.getElementById('banner-upload-status');
  const previewBox = document.getElementById('banner-img-preview-box');
  const previewImg = document.getElementById('banner-img-preview');

  if (uploadStatus) uploadStatus.textContent = '';

  if (bannerId) {
    const banner = allBannersList.find((b) => b.id === bannerId);
    if (!banner) return;

    if (titleHeader) titleHeader.textContent = 'Edit Banner';
    if (idInput) idInput.value = banner.id;
    if (titleInput) titleInput.value = banner.title || '';
    if (descInput) descInput.value = banner.description || '';
    if (imageInput) imageInput.value = banner.imageUrl || '';
    if (btnTextInput) btnTextInput.value = banner.buttonText || 'Explore Program';
    if (btnLinkInput) btnLinkInput.value = banner.buttonLink || '#classes-section';
    if (phoneInput) phoneInput.value = banner.phone || '';
    if (orderInput) orderInput.value = banner.order || 1;
    if (activeInput) activeInput.checked = banner.active !== false;

    if (banner.imageUrl && previewBox && previewImg) {
      previewImg.src = banner.imageUrl;
      previewBox.style.display = 'block';
    } else if (previewBox) {
      previewBox.style.display = 'none';
    }
  } else {
    if (titleHeader) titleHeader.textContent = 'Add New Banner';
    if (idInput) idInput.value = '';
    if (titleInput) titleInput.value = '';
    if (descInput) descInput.value = '';
    if (imageInput) imageInput.value = '';
    if (btnTextInput) btnTextInput.value = 'Explore Program';
    if (btnLinkInput) btnLinkInput.value = '#classes-section';
    if (phoneInput) phoneInput.value = '';
    
    // Default order = highest order + 1
    const highestOrder = allBannersList.reduce((max, b) => Math.max(max, b.order || 0), 0);
    if (orderInput) orderInput.value = highestOrder + 1;
    if (activeInput) activeInput.checked = true;

    if (previewBox) previewBox.style.display = 'none';
  }

  bannerModal.classList.add('active');
  if (window.lucide) lucide.createIcons();
};

window.closeBannerModal = function() {
  if (bannerModal) bannerModal.classList.remove('active');
};

window.updateBannerImgPreview = function(url) {
  const previewBox = document.getElementById('banner-img-preview-box');
  const previewImg = document.getElementById('banner-img-preview');
  if (!previewBox || !previewImg) return;

  if (url && url.startsWith('http')) {
    previewImg.src = url;
    previewBox.style.display = 'block';
  } else {
    previewBox.style.display = 'none';
  }
};

// ImgBB Upload handler
window.handleBannerFileUpload = async function(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  const statusDisplay = document.getElementById('banner-upload-status');
  const imageInput = document.getElementById('banner-form-image');

  if (statusDisplay) {
    statusDisplay.textContent = 'Uploading to ImgBB...';
    statusDisplay.style.color = 'var(--primary)';
  }

  try {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
      method: 'POST',
      body: formData
    });

    const resData = await response.json();
    if (resData.success && resData.data?.url) {
      const uploadedUrl = resData.data.url;
      if (imageInput) imageInput.value = uploadedUrl;
      updateBannerImgPreview(uploadedUrl);
      if (statusDisplay) {
        statusDisplay.textContent = 'Uploaded successfully!';
        statusDisplay.style.color = 'var(--emerald-600)';
      }
      showToast("Image uploaded to ImgBB!", "success");
    } else {
      throw new Error(resData.error?.message || 'ImgBB upload failed');
    }
  } catch (error) {
    console.error("ImgBB upload error:", error);
    if (statusDisplay) {
      statusDisplay.textContent = 'Upload failed. Enter URL manually.';
      statusDisplay.style.color = 'var(--rose-600)';
    }
    showToast("Image upload failed. Try direct URL.", "error");
  }
};

// Submit Add/Edit Banner Form
window.submitBannerModalForm = function() {
  const form = document.getElementById('banner-form');
  if (form) {
    form.requestSubmit();
  }
};

window.handleBannerFormSubmit = async function(event) {
  event.preventDefault();

  const idInput = document.getElementById('banner-form-id');
  const titleInput = document.getElementById('banner-form-title');
  const descInput = document.getElementById('banner-form-description');
  const imageInput = document.getElementById('banner-form-image');
  const btnTextInput = document.getElementById('banner-form-btn-text');
  const btnLinkInput = document.getElementById('banner-form-btn-link');
  const phoneInput = document.getElementById('banner-form-phone');
  const orderInput = document.getElementById('banner-form-order');
  const activeInput = document.getElementById('banner-form-active');
  const saveBtn = document.getElementById('btn-save-banner');

  const bannerId = idInput?.value?.trim();
  const title = titleInput?.value?.trim();
  const description = descInput?.value?.trim();
  const imageUrl = imageInput?.value?.trim() || '';
  const buttonText = btnTextInput?.value?.trim() || 'Explore Program';
  const buttonLink = btnLinkInput?.value?.trim() || '#classes-section';
  const phone = phoneInput?.value?.trim() || '';
  const order = parseInt(orderInput?.value, 10) || 1;
  const active = activeInput ? activeInput.checked : true;

  if (!title || !description) {
    alert("Please provide both Title and Description for the banner.");
    return;
  }

  if (saveBtn) {
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<span>Saving...</span>';
  }

  try {
    const bannerPayload = {
      title,
      description,
      imageUrl,
      buttonText,
      buttonLink,
      phone,
      order,
      active,
      updatedAt: Date.now()
    };

    if (bannerId) {
      // Update existing banner
      await db.ref(`banners/${bannerId}`).update(bannerPayload);
      showToast("Banner updated successfully!", "success");
    } else {
      // Create new banner
      const newBannerRef = db.ref('banners').push();
      bannerPayload.id = newBannerRef.key;
      bannerPayload.createdAt = Date.now();
      await newBannerRef.set(bannerPayload);
      showToast("New banner created successfully!", "success");
    }

    closeBannerModal();
  } catch (error) {
    console.error("Error saving banner:", error);
    showToast("Failed to save banner.", "error");
  } finally {
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.innerHTML = '<i data-lucide="check" style="width: 15px; height: 15px;"></i><span>Save Banner</span>';
      if (window.lucide) lucide.createIcons();
    }
  }
};

// Delete Banner Confirmation
window.openDeleteBannerModal = function(bannerId) {
  bannerToDeleteId = bannerId;
  const banner = allBannersList.find((b) => b.id === bannerId);
  const preview = document.getElementById('delete-banner-title-preview');
  if (preview) {
    preview.textContent = banner ? `"${banner.title}"` : '';
  }
  if (deleteBannerModal) {
    deleteBannerModal.classList.add('active');
    if (window.lucide) lucide.createIcons();
  }
};

window.closeDeleteBannerModal = function() {
  bannerToDeleteId = null;
  if (deleteBannerModal) deleteBannerModal.classList.remove('active');
};

window.confirmDeleteBanner = async function() {
  if (!bannerToDeleteId) return;

  const btnConfirm = document.getElementById('btn-confirm-delete-banner');
  if (btnConfirm) btnConfirm.disabled = true;

  try {
    await db.ref(`banners/${bannerToDeleteId}`).remove();
    showToast("Banner deleted successfully!", "info");
    closeDeleteBannerModal();
  } catch (error) {
    console.error("Error deleting banner:", error);
    showToast("Failed to delete banner.", "error");
  } finally {
    if (btnConfirm) btnConfirm.disabled = false;
  }
};

// =========================================================================
// 3. DIGITAL BOOKS & NOTES MANAGEMENT
// =========================================================================

const INITIAL_DEFAULT_BOOKS = [
  {
    name: "NCERT Mathematics Exemplar Problems & Solutions — Class 12",
    author: "NCERT & Prayatna Academic Board",
    class: "Class 12",
    preparation: "Board",
    description: "Complete chapter-wise exemplar questions with detailed proofs, step-marking breakdowns, and board exam tips.",
    pdfUrl: "https://ncert.nic.in/pdf/publication/exemplarproblem/classXII/mathematics/leep201.pdf",
    imageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80",
    active: true,
    createdAt: Date.now() - 300000
  },
  {
    name: "Advanced Calculus & Analysis for JEE Main & Advanced",
    author: "Prof. S.K. Goyal (Prayatna Advanced Series)",
    class: "Class 12",
    preparation: "JEE",
    description: "Limits, Continuity, Derivatives, Definite Integrals, and Differential Equations with 400+ past year questions.",
    pdfUrl: "https://ncert.nic.in/textbook/pdf/lemh105.pdf",
    imageUrl: "https://images.unsplash.com/photo-1532012164546-f432f2e3777a?auto=format&fit=crop&w=400&q=80",
    active: true,
    createdAt: Date.now() - 200000
  },
  {
    name: "Coordinate Geometry & Conic Sections Mastery",
    author: "S.L. Loney (Annotated Prayatna Edition)",
    class: "Class 11",
    preparation: "JEE",
    description: "Straight lines, Circles, Parabola, Ellipse and Hyperbola with parametric equations, tangent properties, and locus problems.",
    pdfUrl: "https://ncert.nic.in/textbook/pdf/kemh110.pdf",
    imageUrl: "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=400&q=80",
    active: true,
    createdAt: Date.now() - 100000
  },
  {
    name: "Class 11 Foundation & Board Mathematics Handbook",
    author: "Prayatna Faculty Forum",
    class: "Class 11",
    preparation: "Board",
    description: "Sets, Relations, Trigonometric Functions, and Permutations & Combinations structured for 100% board accuracy.",
    pdfUrl: "https://ncert.nic.in/textbook/pdf/kemh103.pdf",
    imageUrl: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=400&q=80",
    active: true,
    createdAt: Date.now()
  }
];

function listenToBooksData() {
  const booksRef = db.ref('books');
  booksRef.on('value', async (snapshot) => {
    if (!snapshot.exists()) {
      // Seed default books into RTDB if empty
      for (const book of INITIAL_DEFAULT_BOOKS) {
        const newRef = booksRef.push();
        await newRef.set({
          id: newRef.key,
          ...book,
          updatedAt: Date.now()
        });
      }
      return;
    }

    const data = snapshot.val() || {};
    const booksArray = Object.keys(data).map((key) => ({
      id: key,
      ...data[key]
    }));

    // Sort by createdAt descending
    booksArray.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    allBooksList = booksArray;

    const activeCount = booksArray.filter((b) => b.active !== false).length;
    if (statBooks) statBooks.textContent = activeCount;
    if (booksBadgeCount) booksBadgeCount.textContent = `${booksArray.length} Books`;

    renderBooksGrid();
  });
}

function renderBooksGrid() {
  if (!booksListContainer) return;

  const searchQuery = (booksAdminSearchInput ? booksAdminSearchInput.value : '').toLowerCase().trim();
  const classFilter = booksAdminClassFilter ? booksAdminClassFilter.value : 'all';
  const prepFilter = booksAdminPrepFilter ? booksAdminPrepFilter.value : 'all';
  const statusFilter = booksAdminStatusFilter ? booksAdminStatusFilter.value : 'all';

  const filtered = allBooksList.filter((book) => {
    if (classFilter !== 'all' && book.class !== classFilter) return false;
    if (prepFilter !== 'all' && book.preparation !== prepFilter) return false;
    if (statusFilter === 'active' && book.active === false) return false;
    if (statusFilter === 'inactive' && book.active !== false) return false;
    if (searchQuery) {
      const matchName = (book.name || '').toLowerCase().includes(searchQuery);
      const matchAuthor = (book.author || '').toLowerCase().includes(searchQuery);
      const matchDesc = (book.description || '').toLowerCase().includes(searchQuery);
      if (!matchName && !matchAuthor && !matchDesc) return false;
    }
    return true;
  });

  if (filtered.length === 0) {
    booksListContainer.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 48px 20px; background: var(--slate-50); border: 2px dashed var(--slate-200); border-radius: var(--radius-md);">
        <i data-lucide="book-open" style="width: 42px; height: 42px; color: var(--slate-400); margin-bottom: 10px;"></i>
        <h4 style="font-size: 16px; font-weight: 700; color: var(--slate-800);">No Books Found</h4>
        <p style="font-size: 13px; color: var(--slate-500); margin-top: 4px; margin-bottom: 16px;">
          Try adjusting your class/track filters, search keywords, or add a new mathematics book.
        </p>
        <button class="btn-primary" onclick="openBookModal()">
          <i data-lucide="plus" style="width: 14px; height: 14px;"></i>
          <span>Add New Book</span>
        </button>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
    return;
  }

  booksListContainer.innerHTML = filtered.map((book) => {
    const isInactive = book.active === false;
    const isClass11 = book.class === 'Class 11';
    const isJEE = book.preparation === 'JEE';

    const coverHtml = book.imageUrl 
      ? `<img class="book-admin-cover" src="${escapeHtml(book.imageUrl)}" alt="${escapeHtml(book.name)}" onerror="this.outerHTML='<div class=\\'book-admin-cover\\'><div class=\\'book-admin-cover-fallback\\'><span>∑</span></div></div>';" />`
      : `<div class="book-admin-cover"><div class="book-admin-cover-fallback"><span>∑</span><div style="font-size: 9px; opacity: 0.8; margin-top: 2px;">Prayatna</div></div></div>`;

    return `
      <div class="book-admin-card ${isInactive ? 'inactive' : ''}" id="book-card-${book.id}">
        <div class="book-admin-header">
          ${coverHtml}
          <div class="book-admin-header-info">
            <div>
              <h4 title="${escapeHtml(book.name)}">${escapeHtml(book.name)}</h4>
              <div class="book-admin-author">
                <i data-lucide="user" style="width: 12px; height: 12px; color: var(--slate-400);"></i>
                <span class="truncate">${escapeHtml(book.author || 'Prayatna Academic Cell')}</span>
              </div>
            </div>
            <div class="book-admin-badges">
              <span class="${isClass11 ? 'badge-class11' : 'badge-class12'}">${escapeHtml(book.class)}</span>
              <span class="${isJEE ? 'badge-prep-jee' : 'badge-prep-board'}">${escapeHtml(book.preparation)}</span>
              ${isInactive ? '<span style="background: #fee2e2; color: #991b1b; font-size: 11px; font-weight: 700; padding: 2px 7px; border-radius: 4px;">Draft</span>' : '<span style="background: #dcfce7; color: #166534; font-size: 11px; font-weight: 700; padding: 2px 7px; border-radius: 4px;">Active</span>'}
            </div>
          </div>
        </div>

        <div class="book-admin-body">
          <p class="book-admin-desc">${escapeHtml(book.description || 'No description provided.')}</p>
        </div>

        <div class="book-admin-footer">
          <div>
            ${book.pdfUrl ? `
              <a href="${escapeHtml(book.pdfUrl)}" target="_blank" rel="noopener noreferrer" class="btn-pdf-link" title="Open PDF in new tab">
                <i data-lucide="file-text" style="width: 13px; height: 13px;"></i>
                <span>View PDF</span>
              </a>
            ` : '<span style="font-size: 11px; color: var(--slate-400);">No PDF Link</span>'}
          </div>

          <div class="book-admin-actions">
            <!-- Active Toggle -->
            <label class="switch" title="Toggle active status" style="margin-right: 4px;">
              <input type="checkbox" ${!isInactive ? 'checked' : ''} onchange="toggleBookActive('${book.id}', this.checked)" />
              <span class="slider"></span>
            </label>

            <!-- Edit Button -->
            <button class="btn-icon-action" onclick="openBookModal('${book.id}')" title="Edit Book">
              <i data-lucide="edit-3" style="width: 15px; height: 15px;"></i>
            </button>

            <!-- Delete Button -->
            <button class="btn-icon-action danger" onclick="openDeleteBookModal('${book.id}')" title="Delete Book">
              <i data-lucide="trash-2" style="width: 15px; height: 15px;"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  if (window.lucide) {
    lucide.createIcons();
  }
}

window.handleBooksFilterChange = function() {
  renderBooksGrid();
};

window.openBookModal = function(bookId = null) {
  const form = document.getElementById('book-form');
  const title = document.getElementById('book-modal-title');
  const idInput = document.getElementById('book-form-id');
  const nameInput = document.getElementById('book-form-name');
  const authorInput = document.getElementById('book-form-author');
  const classInput = document.getElementById('book-form-class');
  const prepInput = document.getElementById('book-form-prep');
  const pdfInput = document.getElementById('book-form-pdf-url');
  const descInput = document.getElementById('book-form-description');
  const imageInput = document.getElementById('book-form-image');
  const activeInput = document.getElementById('book-form-active');
  const uploadStatus = document.getElementById('book-upload-status');
  const previewBox = document.getElementById('book-img-preview-box');
  const previewImg = document.getElementById('book-img-preview');

  if (uploadStatus) uploadStatus.textContent = '';

  if (bookId) {
    const book = allBooksList.find((b) => b.id === bookId);
    if (!book) return;
    if (title) title.textContent = 'Edit Book';
    if (idInput) idInput.value = book.id;
    if (nameInput) nameInput.value = book.name || '';
    if (authorInput) authorInput.value = book.author || '';
    if (classInput) classInput.value = book.class || 'Class 11';
    if (prepInput) prepInput.value = book.preparation || 'Board';
    if (pdfInput) pdfInput.value = book.pdfUrl || '';
    if (descInput) descInput.value = book.description || '';
    if (imageInput) imageInput.value = book.imageUrl || '';
    if (activeInput) activeInput.checked = book.active !== false;

    if (book.imageUrl && previewBox && previewImg) {
      previewImg.src = book.imageUrl;
      previewBox.style.display = 'block';
    } else if (previewBox) {
      previewBox.style.display = 'none';
    }
  } else {
    if (title) title.textContent = 'Add New Book';
    if (idInput) idInput.value = '';
    if (form) form.reset();
    if (activeInput) activeInput.checked = true;
    if (classInput) classInput.value = 'Class 11';
    if (prepInput) prepInput.value = 'Board';
    if (previewBox) previewBox.style.display = 'none';
  }

  if (bookModal) {
    bookModal.classList.add('active');
    if (window.lucide) lucide.createIcons();
  }
};

window.closeBookModal = function() {
  if (bookModal) bookModal.classList.remove('active');
};

window.updateBookImgPreview = function(url) {
  const previewBox = document.getElementById('book-img-preview-box');
  const previewImg = document.getElementById('book-img-preview');
  if (!previewBox || !previewImg) return;

  if (url && url.trim().length > 5) {
    previewImg.src = url.trim();
    previewBox.style.display = 'block';
  } else {
    previewBox.style.display = 'none';
  }
};

window.handleBookFileUpload = async function(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  const uploadStatus = document.getElementById('book-upload-status');
  const imageInput = document.getElementById('book-form-image');

  if (uploadStatus) {
    uploadStatus.textContent = 'Uploading to ImgBB...';
    uploadStatus.style.color = 'var(--primary)';
  }

  const formData = new FormData();
  formData.append('image', file);

  try {
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
      method: 'POST',
      body: formData
    });

    const result = await response.json();
    if (result.success && result.data?.url) {
      const uploadedUrl = result.data.url;
      if (imageInput) imageInput.value = uploadedUrl;
      updateBookImgPreview(uploadedUrl);
      if (uploadStatus) {
        uploadStatus.textContent = 'Uploaded successfully!';
        uploadStatus.style.color = 'var(--emerald-600)';
      }
      showToast('Book cover image uploaded to ImgBB!', 'success');
    } else {
      throw new Error(result.error?.message || 'ImgBB upload failed');
    }
  } catch (error) {
    console.error('ImgBB upload error:', error);
    if (uploadStatus) {
      uploadStatus.textContent = 'Upload failed. Enter URL manually.';
      uploadStatus.style.color = 'var(--rose-600)';
    }
    showToast('Failed to upload image. Please enter an image URL directly.', 'error');
  }
};

window.testPdfUrl = function() {
  const pdfInput = document.getElementById('book-form-pdf-url');
  if (pdfInput && pdfInput.value.trim()) {
    window.open(pdfInput.value.trim(), '_blank', 'noopener,noreferrer');
  } else {
    alert('Please enter a valid PDF URL first.');
  }
};

window.submitBookModalForm = function() {
  const form = document.getElementById('book-form');
  if (form) {
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    handleBookFormSubmit(new Event('submit'));
  }
};

window.handleBookFormSubmit = async function(event) {
  if (event) event.preventDefault();

  const bookId = document.getElementById('book-form-id')?.value;
  const name = document.getElementById('book-form-name')?.value.trim();
  const author = document.getElementById('book-form-author')?.value.trim();
  const classVal = document.getElementById('book-form-class')?.value;
  const prepVal = document.getElementById('book-form-prep')?.value;
  const pdfUrl = document.getElementById('book-form-pdf-url')?.value.trim();
  const description = document.getElementById('book-form-description')?.value.trim();
  const imageUrl = document.getElementById('book-form-image')?.value.trim();
  const active = document.getElementById('book-form-active')?.checked ?? true;
  const saveBtn = document.getElementById('btn-save-book');

  if (!name || !description || !pdfUrl) {
    alert('Please fill out all required fields: Book Name, Description, and PDF Document Link.');
    return;
  }

  if (saveBtn) {
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<span>Saving...</span>';
  }

  try {
    const bookPayload = {
      name,
      author: author || 'Prayatna Academic Cell',
      class: classVal,
      preparation: prepVal,
      description,
      pdfUrl,
      imageUrl: imageUrl || '',
      active,
      updatedAt: Date.now()
    };

    if (bookId) {
      // Update existing book
      await db.ref(`books/${bookId}`).update(bookPayload);
      showToast('Book updated successfully!', 'success');
    } else {
      // Create new book
      const newBookRef = db.ref('books').push();
      bookPayload.id = newBookRef.key;
      bookPayload.createdAt = Date.now();
      await newBookRef.set(bookPayload);
      showToast('New book published to library!', 'success');
    }

    closeBookModal();
  } catch (error) {
    console.error('Error saving book:', error);
    showToast('Failed to save book data.', 'error');
  } finally {
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.innerHTML = '<i data-lucide="check" style="width: 15px; height: 15px;"></i><span>Save Book</span>';
      if (window.lucide) lucide.createIcons();
    }
  }
};

window.toggleBookActive = async function(bookId, newActiveState) {
  try {
    await db.ref(`books/${bookId}`).update({
      active: newActiveState,
      updatedAt: Date.now()
    });
    showToast(newActiveState ? 'Book published to students!' : 'Book unpublished (saved as draft).', 'info');
  } catch (error) {
    console.error('Error toggling book active status:', error);
    showToast('Failed to update book status.', 'error');
  }
};

window.openDeleteBookModal = function(bookId) {
  bookToDeleteId = bookId;
  const book = allBooksList.find((b) => b.id === bookId);
  const preview = document.getElementById('delete-book-title-preview');
  if (preview) {
    preview.textContent = book ? `"${book.name}" (${book.class} • ${book.preparation})` : '';
  }
  if (deleteBookModal) {
    deleteBookModal.classList.add('active');
    if (window.lucide) lucide.createIcons();
  }
};

window.closeDeleteBookModal = function() {
  bookToDeleteId = null;
  if (deleteBookModal) deleteBookModal.classList.remove('active');
};

window.confirmDeleteBook = async function() {
  if (!bookToDeleteId) return;

  const btnConfirm = document.getElementById('btn-confirm-delete-book');
  if (btnConfirm) btnConfirm.disabled = true;

  try {
    await db.ref(`books/${bookToDeleteId}`).remove();
    showToast('Book removed from library successfully!', 'info');
    closeDeleteBookModal();
  } catch (error) {
    console.error('Error deleting book:', error);
    showToast('Failed to delete book.', 'error');
  } finally {
    if (btnConfirm) btnConfirm.disabled = false;
  }
};

// =========================================================================
// 4. DAILY HOMEWORK & DPP MANAGEMENT (Part 4)
// =========================================================================

function listenToHomeworkData() {
  const homeworkRef = db.ref('homework');
  const progressRef = db.ref('homeworkProgress');

  homeworkRef.on('value', (snapshot) => {
    const data = snapshot.val() || {};
    const homeworkArray = Object.keys(data).map((key) => {
      const item = data[key];
      let images = [];
      if (Array.isArray(item.images)) {
        images = item.images.filter(Boolean);
      } else if (item.images && typeof item.images === 'object') {
        images = Object.values(item.images).filter((img) => typeof img === 'string');
      } else if (item.imageUrl) {
        images = [item.imageUrl];
      }
      return {
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
      };
    });

    // Sort descending by assignedDate or createdAt
    homeworkArray.sort((a, b) => new Date(b.assignedDate || b.createdAt).getTime() - new Date(a.assignedDate || a.createdAt).getTime());
    allHomeworkList = homeworkArray;

    const activeCount = homeworkArray.filter((h) => h.active).length;
    if (statHomework) statHomework.textContent = activeCount;
    if (homeworkBadgeCount) homeworkBadgeCount.textContent = `${homeworkArray.length} Assignments`;

    renderHomeworkGrid();

    if (activeAnalyticsHomeworkId) {
      updateAnalyticsModalData();
    }
  });

  progressRef.on('value', (snapshot) => {
    allHomeworkProgressData = snapshot.val() || {};
    renderHomeworkGrid();

    if (activeAnalyticsHomeworkId) {
      updateAnalyticsModalData();
    }
  });
}

function getHomeworkStats(homework) {
  // Target cohort: students enrolled in this class and preparation
  const cohort = allStudentsList.filter((s) => {
    const classMatch = !homework.class || s.class === homework.class;
    const prepMatch = !homework.preparation || s.preparation === homework.preparation;
    return classMatch && prepMatch;
  });

  const totalAssigned = cohort.length;
  const hwProgress = allHomeworkProgressData[homework.id] || {};

  let completedCount = 0;
  let overdueCount = 0;
  let pendingCount = 0;
  const isPastDeadline = new Date(homework.deadline).getTime() < Date.now();

  cohort.forEach((student) => {
    const prog = hwProgress[student.uid];
    if (prog && prog.status === 'Completed') {
      completedCount++;
    } else if (isPastDeadline) {
      overdueCount++;
    } else {
      pendingCount++;
    }
  });

  const completionRate = totalAssigned > 0 ? Math.round((completedCount / totalAssigned) * 100) : 0;

  return {
    cohort,
    totalAssigned,
    completedCount,
    pendingCount,
    overdueCount,
    completionRate,
    isPastDeadline
  };
}

function renderHomeworkGrid() {
  if (!homeworkListContainer) return;

  const searchQuery = (homeworkAdminSearchInput ? homeworkAdminSearchInput.value : '').toLowerCase().trim();
  const classFilter = homeworkAdminClassFilter ? homeworkAdminClassFilter.value : 'all';
  const prepFilter = homeworkAdminPrepFilter ? homeworkAdminPrepFilter.value : 'all';
  const statusFilter = homeworkAdminStatusFilter ? homeworkAdminStatusFilter.value : 'all';

  const filtered = allHomeworkList.filter((hw) => {
    if (classFilter !== 'all' && hw.class !== classFilter) return false;
    if (prepFilter !== 'all' && hw.preparation !== prepFilter) return false;
    if (statusFilter === 'active' && !hw.active) return false;
    if (statusFilter === 'inactive' && hw.active) return false;
    if (searchQuery) {
      const matchTitle = (hw.title || '').toLowerCase().includes(searchQuery);
      const matchDesc = (hw.description || '').toLowerCase().includes(searchQuery);
      return matchTitle || matchDesc;
    }
    return true;
  });

  if (filtered.length === 0) {
    homeworkListContainer.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 50px 20px; background: #ffffff; border-radius: var(--radius-md); border: 1px dashed var(--slate-300);">
        <div style="width: 52px; height: 52px; margin: 0 auto 14px; background: var(--slate-100); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--slate-400);">
          <i data-lucide="file-check" style="width: 26px; height: 26px;"></i>
        </div>
        <h4 style="font-size: 15px; font-weight: 700; color: var(--slate-700); margin-bottom: 6px;">No Homework Found</h4>
        <p style="font-size: 13px; color: var(--slate-500); max-width: 360px; margin: 0 auto 16px;">
          ${searchQuery || classFilter !== 'all' || prepFilter !== 'all' || statusFilter !== 'all'
            ? 'No homework assignments match the selected filters. Try resetting the filters.'
            : 'No daily practice problems or homework assignments have been assigned yet.'}
        </p>
        <button class="btn-primary" onclick="openHomeworkModal()">
          <i data-lucide="plus" style="width: 14px; height: 14px;"></i>
          <span>Assign First Homework</span>
        </button>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
    return;
  }

  homeworkListContainer.innerHTML = filtered.map((hw) => {
    const stats = getHomeworkStats(hw);
    const assignedDateStr = new Date(hw.assignedDate).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
    const deadlineDate = new Date(hw.deadline);
    const deadlineDateStr = deadlineDate.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });

    const isOverdue = stats.isPastDeadline;

    // Image thumbnail strip preview
    let imagesHtml = '';
    if (hw.images && hw.images.length > 0) {
      imagesHtml = `
        <div style="margin-top: 10px;">
          <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--slate-400); margin-bottom: 6px;">
            ${hw.images.length} Attached ${hw.images.length === 1 ? 'Sheet' : 'Sheets'}
          </div>
          <div class="homework-admin-images-strip">
            ${hw.images.map((imgUrl, idx) => `
              <a href="${escapeHtml(imgUrl)}" target="_blank" rel="noopener noreferrer" title="View Sheet ${idx + 1}">
                <img 
                  src="${escapeHtml(imgUrl)}" 
                  alt="Sheet ${idx + 1}" 
                  class="homework-admin-thumb"
                  onerror="this.src='https://placehold.co/100x100?text=Image'" 
                />
              </a>
            `).join('')}
          </div>
        </div>
      `;
    }

    return `
      <div class="homework-admin-card">
        <div class="homework-admin-header">
          <div>
            <div class="homework-admin-title">${escapeHtml(hw.title)}</div>
            <div class="homework-admin-meta">
              <span class="badge-status" style="background: ${hw.class === 'Class 12' ? '#f5f3ff' : '#eff6ff'}; color: ${hw.class === 'Class 12' ? '#7c3aed' : '#2563eb'};">
                ${escapeHtml(hw.class)}
              </span>
              <span class="badge-status" style="background: ${hw.preparation === 'JEE' ? '#fff7ed' : '#f0fdf4'}; color: ${hw.preparation === 'JEE' ? '#c2410c' : '#15803d'};">
                ${escapeHtml(hw.preparation)}
              </span>
              <span class="badge-status ${hw.active ? 'status-active' : 'status-inactive'}">
                ${hw.active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
          <div>
            <label class="switch" title="${hw.active ? 'Published: Click to unpublish' : 'Unpublished: Click to publish'}">
              <input type="checkbox" ${hw.active ? 'checked' : ''} onchange="toggleHomeworkActive('${hw.id}', this.checked)" />
              <span class="slider"></span>
            </label>
          </div>
        </div>

        <div class="homework-admin-body">
          <div class="homework-admin-desc">${escapeHtml(hw.description)}</div>

          <div class="homework-admin-dates">
            <div>
              <span style="font-weight: 700; color: var(--slate-700);">Assigned:</span> ${assignedDateStr}
            </div>
            <div>
              <span style="font-weight: 700; color: ${isOverdue ? 'var(--rose-600)' : 'var(--slate-700)'};">Deadline:</span>
              <span style="color: ${isOverdue ? 'var(--rose-600)' : 'inherit'}; font-weight: ${isOverdue ? '700' : 'normal'};">
                ${deadlineDateStr}
              </span>
            </div>
          </div>

          <!-- Submission rate bar -->
          <div style="background: var(--slate-50); border: 1px solid var(--slate-200); border-radius: var(--radius-sm); padding: 10px 12px; margin-bottom: 6px;">
            <div style="display: flex; align-items: center; justify-content: space-between; font-size: 12px; margin-bottom: 6px;">
              <span style="font-weight: 700; color: var(--slate-700);">Student Completion:</span>
              <span style="font-weight: 800; color: ${stats.completionRate >= 70 ? 'var(--emerald-600)' : 'var(--slate-700)'};">
                ${stats.completedCount}/${stats.totalAssigned} (${stats.completionRate}%)
              </span>
            </div>
            <div style="height: 6px; background: var(--slate-200); border-radius: 9999px; overflow: hidden; display: flex;">
              <div style="width: ${stats.completionRate}%; background: var(--emerald-500); transition: width 0.3s ease;"></div>
            </div>
          </div>

          ${imagesHtml}
        </div>

        <div class="homework-admin-footer">
          <button 
            type="button" 
            class="btn-analytics-badge" 
            onclick="openHomeworkAnalyticsModal('${hw.id}')"
            title="View student submission roster and analytics"
          >
            <i data-lucide="bar-chart-2" style="width: 14px; height: 14px;"></i>
            <span>Roster & Analytics</span>
          </button>

          <div class="homework-admin-actions">
            ${hw.attachmentUrl ? `
              <a 
                href="${escapeHtml(hw.attachmentUrl)}" 
                target="_blank" 
                rel="noopener noreferrer" 
                class="btn-secondary" 
                style="padding: 6px 10px; font-size: 12px;"
                title="Open PDF / Link"
              >
                <i data-lucide="external-link" style="width: 13px; height: 13px;"></i>
              </a>
            ` : ''}

            <button 
              type="button" 
              class="btn-secondary" 
              style="padding: 6px 10px; font-size: 12px;" 
              onclick="openHomeworkModal('${hw.id}')" 
              title="Edit Assignment"
            >
              <i data-lucide="edit-3" style="width: 13px; height: 13px;"></i>
            </button>

            <button 
              type="button" 
              class="btn-danger" 
              style="padding: 6px 10px; font-size: 12px;" 
              onclick="openDeleteHomeworkModal('${hw.id}')" 
              title="Delete Assignment"
            >
              <i data-lucide="trash-2" style="width: 13px; height: 13px;"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  if (window.lucide) {
    lucide.createIcons();
  }
}

window.handleHomeworkFilterChange = function() {
  renderHomeworkGrid();
};

window.openHomeworkModal = function(homeworkId = null) {
  const modalTitle = document.getElementById('homework-modal-title');
  const idInput = document.getElementById('homework-form-id');
  const titleInput = document.getElementById('homework-form-title');
  const classInput = document.getElementById('homework-form-class');
  const prepInput = document.getElementById('homework-form-prep');
  const assignedDateInput = document.getElementById('homework-form-assigned-date');
  const deadlineInput = document.getElementById('homework-form-deadline');
  const descInput = document.getElementById('homework-form-description');
  const attachInput = document.getElementById('homework-form-attachment');
  const activeInput = document.getElementById('homework-form-active');
  const uploadStatus = document.getElementById('homework-upload-status');
  const imgUrlInput = document.getElementById('homework-img-url-input');

  if (uploadStatus) uploadStatus.textContent = '';
  if (imgUrlInput) imgUrlInput.value = '';

  const now = new Date();
  const deadlineDefault = new Date(now.getTime() + 86400000 * 3); // 3 days later
  const formatForInput = (d) => {
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  if (homeworkId) {
    const hw = allHomeworkList.find((h) => h.id === homeworkId);
    if (!hw) return;

    if (modalTitle) modalTitle.textContent = 'Edit Homework Assignment';
    if (idInput) idInput.value = hw.id;
    if (titleInput) titleInput.value = hw.title || '';
    if (classInput) classInput.value = hw.class || 'Class 11';
    if (prepInput) prepInput.value = hw.preparation || 'Board';

    if (assignedDateInput) {
      try {
        assignedDateInput.value = formatForInput(new Date(hw.assignedDate));
      } catch (e) {
        assignedDateInput.value = formatForInput(now);
      }
    }

    if (deadlineInput) {
      try {
        deadlineInput.value = formatForInput(new Date(hw.deadline));
      } catch (e) {
        deadlineInput.value = formatForInput(deadlineDefault);
      }
    }

    if (descInput) descInput.value = hw.description || '';
    if (attachInput) attachInput.value = hw.attachmentUrl || '';
    if (activeInput) activeInput.checked = hw.active !== false;

    currentHomeworkImages = [...(hw.images || [])];
  } else {
    if (modalTitle) modalTitle.textContent = 'Assign New Homework';
    if (idInput) idInput.value = '';
    if (titleInput) titleInput.value = '';
    if (classInput) classInput.value = 'Class 11';
    if (prepInput) prepInput.value = 'Board';
    if (assignedDateInput) assignedDateInput.value = formatForInput(now);
    if (deadlineInput) deadlineInput.value = formatForInput(deadlineDefault);
    if (descInput) descInput.value = '';
    if (attachInput) attachInput.value = '';
    if (activeInput) activeInput.checked = true;

    currentHomeworkImages = [];
  }

  renderHomeworkImagesPreview();
  if (homeworkModal) homeworkModal.classList.add('active');
  if (window.lucide) lucide.createIcons();
};

window.closeHomeworkModal = function() {
  if (homeworkModal) homeworkModal.classList.remove('active');
  currentHomeworkImages = [];
};

window.renderHomeworkImagesPreview = function() {
  const container = document.getElementById('homework-images-preview-list');
  if (!container) return;

  if (currentHomeworkImages.length === 0) {
    container.innerHTML = `<span style="font-size: 12px; color: var(--slate-400); font-style: italic;">No images attached yet.</span>`;
    return;
  }

  container.innerHTML = currentHomeworkImages.map((url, idx) => `
    <div class="image-chip-preview">
      <img src="${escapeHtml(url)}" alt="Preview ${idx + 1}" onerror="this.src='https://placehold.co/60x60?text=Err'" />
      <button type="button" class="image-chip-remove" onclick="removeHomeworkImage(${idx})" title="Remove Image">&times;</button>
    </div>
  `).join('');
};

window.removeHomeworkImage = function(index) {
  if (index >= 0 && index < currentHomeworkImages.length) {
    currentHomeworkImages.splice(index, 1);
    renderHomeworkImagesPreview();
  }
};

window.addHomeworkImageUrl = function() {
  const imgUrlInput = document.getElementById('homework-img-url-input');
  if (!imgUrlInput) return;
  const url = imgUrlInput.value.trim();
  if (!url) {
    showToast('Please enter an image URL.', 'error');
    return;
  }
  try {
    new URL(url);
  } catch (e) {
    showToast('Please enter a valid URL starting with http:// or https://', 'error');
    return;
  }

  currentHomeworkImages.push(url);
  imgUrlInput.value = '';
  renderHomeworkImagesPreview();
  showToast('Image URL added.', 'info');
};

window.handleHomeworkFileUpload = async function(event) {
  const files = event.target.files;
  if (!files || files.length === 0) return;

  const statusSpan = document.getElementById('homework-upload-status');
  if (statusSpan) statusSpan.textContent = `Uploading ${files.length} image(s) to ImgBB...`;

  let uploadedCount = 0;
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const formData = new FormData();
    formData.append('image', file);

    try {
      if (statusSpan) statusSpan.textContent = `Uploading image ${i + 1} of ${files.length}...`;
      const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: 'POST',
        body: formData
      });
      const data = await response.json();

      if (data && data.data && data.data.url) {
        currentHomeworkImages.push(data.data.url);
        uploadedCount++;
      } else {
        console.error('ImgBB upload error response:', data);
      }
    } catch (err) {
      console.error('Failed to upload file to ImgBB:', err);
    }
  }

  event.target.value = '';
  if (statusSpan) statusSpan.textContent = `Uploaded ${uploadedCount} image(s) successfully!`;
  renderHomeworkImagesPreview();
  showToast(`Attached ${uploadedCount} image(s) to homework.`, 'success');
};

window.submitHomeworkModalForm = function() {
  const form = document.getElementById('homework-form');
  if (form) {
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
  }
};

window.handleHomeworkFormSubmit = async function(event) {
  event.preventDefault();

  const idInput = document.getElementById('homework-form-id');
  const titleInput = document.getElementById('homework-form-title');
  const classInput = document.getElementById('homework-form-class');
  const prepInput = document.getElementById('homework-form-prep');
  const assignedDateInput = document.getElementById('homework-form-assigned-date');
  const deadlineInput = document.getElementById('homework-form-deadline');
  const descInput = document.getElementById('homework-form-description');
  const attachInput = document.getElementById('homework-form-attachment');
  const activeInput = document.getElementById('homework-form-active');
  const btnSave = document.getElementById('btn-save-homework');

  const homeworkId = idInput ? idInput.value : '';
  const title = titleInput ? titleInput.value.trim() : '';
  const targetClass = classInput ? classInput.value : 'Class 11';
  const preparation = prepInput ? prepInput.value : 'Board';
  const assignedDate = assignedDateInput && assignedDateInput.value ? new Date(assignedDateInput.value).toISOString() : new Date().toISOString();
  const deadline = deadlineInput && deadlineInput.value ? new Date(deadlineInput.value).toISOString() : new Date(Date.now() + 86400000 * 3).toISOString();
  const description = descInput ? descInput.value.trim() : '';
  const attachmentUrl = attachInput ? attachInput.value.trim() : '';
  const active = activeInput ? activeInput.checked : true;

  if (!title) {
    showToast('Please enter an assignment title.', 'error');
    return;
  }

  if (new Date(deadline).getTime() <= new Date(assignedDate).getTime()) {
    showToast('Deadline must be after the assigned date.', 'error');
    return;
  }

  if (btnSave) btnSave.disabled = true;

  try {
    const homeworkPayload = {
      title,
      class: targetClass,
      preparation,
      assignedDate,
      deadline,
      description,
      attachmentUrl,
      images: currentHomeworkImages,
      active,
      updatedAt: Date.now()
    };

    if (homeworkId) {
      await db.ref(`homework/${homeworkId}`).update(homeworkPayload);
      showToast('Homework assignment updated successfully!', 'success');
    } else {
      homeworkPayload.createdAt = Date.now();
      const newRef = db.ref('homework').push();
      homeworkPayload.id = newRef.key;
      await newRef.set(homeworkPayload);
      showToast('New homework assigned to students successfully!', 'success');
    }

    closeHomeworkModal();
  } catch (error) {
    console.error('Error saving homework:', error);
    showToast('Failed to save homework assignment.', 'error');
  } finally {
    if (btnSave) btnSave.disabled = false;
  }
};

window.toggleHomeworkActive = async function(homeworkId, newActiveState) {
  try {
    await db.ref(`homework/${homeworkId}`).update({
      active: newActiveState,
      updatedAt: Date.now()
    });
    showToast(`Homework assignment marked ${newActiveState ? 'active' : 'inactive'}.`, 'info');
  } catch (err) {
    console.error('Error toggling homework active state:', err);
    showToast('Failed to update status.', 'error');
  }
};

window.openDeleteHomeworkModal = function(homeworkId) {
  const hw = allHomeworkList.find((h) => h.id === homeworkId);
  if (!hw) return;

  homeworkToDeleteId = homeworkId;
  const titlePreview = document.getElementById('delete-homework-title-preview');
  if (titlePreview) {
    titlePreview.textContent = `"${hw.title}" (${hw.class} - ${hw.preparation})`;
  }

  if (deleteHomeworkModal) deleteHomeworkModal.classList.add('active');
  if (window.lucide) lucide.createIcons();
};

window.closeDeleteHomeworkModal = function() {
  homeworkToDeleteId = null;
  if (deleteHomeworkModal) deleteHomeworkModal.classList.remove('active');
};

window.confirmDeleteHomework = async function() {
  if (!homeworkToDeleteId) return;

  const btnConfirm = document.getElementById('btn-confirm-delete-homework');
  if (btnConfirm) btnConfirm.disabled = true;

  try {
    await db.ref(`homework/${homeworkToDeleteId}`).remove();
    // Also remove tracking progress for this homework
    await db.ref(`homeworkProgress/${homeworkToDeleteId}`).remove();

    showToast('Homework assignment and tracking data removed.', 'info');
    closeDeleteHomeworkModal();
  } catch (error) {
    console.error('Error deleting homework:', error);
    showToast('Failed to delete homework assignment.', 'error');
  } finally {
    if (btnConfirm) btnConfirm.disabled = false;
  }
};

// =========================================================================
// Homework Submission Analytics & Student List
// =========================================================================

let analyticsRosterStudents = [];

window.openHomeworkAnalyticsModal = function(homeworkId) {
  activeAnalyticsHomeworkId = homeworkId;
  updateAnalyticsModalData();
  if (homeworkAnalyticsModal) homeworkAnalyticsModal.classList.add('active');
  if (window.lucide) lucide.createIcons();
};

window.closeHomeworkAnalyticsModal = function() {
  activeAnalyticsHomeworkId = null;
  analyticsRosterStudents = [];
  if (homeworkAnalyticsModal) homeworkAnalyticsModal.classList.remove('active');
};

function updateAnalyticsModalData() {
  if (!activeAnalyticsHomeworkId) return;
  const hw = allHomeworkList.find((h) => h.id === activeAnalyticsHomeworkId);
  if (!hw) return;

  const titleEl = document.getElementById('hw-analytics-title');
  const subtitleEl = document.getElementById('hw-analytics-subtitle');
  const statTotal = document.getElementById('hw-stat-total-students');
  const statCompleted = document.getElementById('hw-stat-completed');
  const statCompletedRate = document.getElementById('hw-stat-completed-rate');
  const statPending = document.getElementById('hw-stat-pending');
  const statOverdue = document.getElementById('hw-stat-overdue');
  const progressBar = document.getElementById('hw-analytics-progress-bar');

  if (titleEl) titleEl.textContent = hw.title;
  if (subtitleEl) {
    const dStr = new Date(hw.deadline).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    subtitleEl.textContent = `Target: ${hw.class} (${hw.preparation}) • Deadline: ${dStr}`;
  }

  const stats = getHomeworkStats(hw);

  if (statTotal) statTotal.textContent = stats.totalAssigned;
  if (statCompleted) statCompleted.textContent = stats.completedCount;
  if (statCompletedRate) statCompletedRate.textContent = `${stats.completionRate}% completion`;
  if (statPending) statPending.textContent = stats.pendingCount;
  if (statOverdue) statOverdue.textContent = stats.overdueCount;
  if (progressBar) progressBar.style.width = `${stats.completionRate}%`;

  const hwProgress = allHomeworkProgressData[hw.id] || {};
  const isPastDeadline = stats.isPastDeadline;

  // Build the student roster data
  analyticsRosterStudents = stats.cohort.map((student) => {
    const prog = hwProgress[student.uid];
    let status = 'Pending';
    let completedAt = null;

    if (prog && prog.status === 'Completed') {
      status = 'Completed';
      completedAt = prog.completedAt;
    } else if (isPastDeadline) {
      status = 'Overdue';
    } else {
      status = 'Pending';
    }

    return {
      ...student,
      submissionStatus: status,
      completedAt
    };
  });

  renderAnalyticsStudentTable();
}

function renderAnalyticsStudentTable() {
  const tbody = document.getElementById('hw-analytics-students-tbody');
  const searchInput = document.getElementById('hw-analytics-student-search');
  if (!tbody) return;

  const query = (searchInput ? searchInput.value : '').toLowerCase().trim();

  const filteredStudents = analyticsRosterStudents.filter((s) => {
    if (!query) return true;
    const nameMatch = (s.name || '').toLowerCase().includes(query);
    const emailMatch = (s.email || '').toLowerCase().includes(query);
    const phoneMatch = (s.phoneNumber || '').toLowerCase().includes(query);
    return nameMatch || emailMatch || phoneMatch;
  });

  if (filteredStudents.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 24px; color: var(--slate-400);">
          ${query ? 'No enrolled students match the search filter.' : 'No students found in this target cohort.'}
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filteredStudents.map((s) => {
    let statusBadge = '';
    if (s.submissionStatus === 'Completed') {
      statusBadge = `<span class="badge-status" style="background: #ecfdf5; color: #047857; font-weight: 700;">Completed</span>`;
    } else if (s.submissionStatus === 'Overdue') {
      statusBadge = `<span class="badge-status" style="background: #fff1f2; color: #be123c; font-weight: 700;">Overdue</span>`;
    } else {
      statusBadge = `<span class="badge-status" style="background: #fffbeb; color: #b45309; font-weight: 700;">Pending</span>`;
    }

    let completedDateDisplay = '<span style="color: var(--slate-400);">-</span>';
    if (s.completedAt) {
      completedDateDisplay = new Date(s.completedAt).toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    }

    const cleanPhone = (s.phoneNumber || '').replace(/\D/g, '');
    const whatsAppLink = cleanPhone ? `https://wa.me/91${cleanPhone.slice(-10)}?text=Hello%20${encodeURIComponent(s.name || 'Student')},%20regarding%20your%20Prayatna%20Mathematics%20Homework...` : null;

    return `
      <tr>
        <td>
          <div style="font-weight: 700; color: var(--slate-900);">${escapeHtml(s.name || 'Anonymous Student')}</div>
          <div style="font-size: 11px; color: var(--slate-500);">${escapeHtml(s.email || 'No Email')}</div>
        </td>
        <td>${escapeHtml(s.class || 'Class 11')}</td>
        <td>${escapeHtml(s.preparation || 'Board')}</td>
        <td>${statusBadge}</td>
        <td>${completedDateDisplay}</td>
        <td>
          <div style="display: flex; align-items: center; gap: 6px;">
            ${cleanPhone ? `
              <a href="tel:+91${cleanPhone.slice(-10)}" class="btn-secondary" style="padding: 4px 8px; font-size: 11px;" title="Call Student">
                <i data-lucide="phone" style="width: 12px; height: 12px;"></i>
              </a>
            ` : ''}
            ${whatsAppLink ? `
              <a href="${whatsAppLink}" target="_blank" rel="noopener noreferrer" class="btn-secondary" style="padding: 4px 8px; font-size: 11px; color: #16a34a;" title="WhatsApp Student">
                <i data-lucide="message-circle" style="width: 12px; height: 12px;"></i>
              </a>
            ` : ''}
            <button type="button" class="btn-secondary" style="padding: 4px 8px; font-size: 11px;" onclick="viewStudentDetail('${s.uid}')" title="View Full Profile">
              <i data-lucide="user" style="width: 12px; height: 12px;"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  if (window.lucide) {
    lucide.createIcons();
  }
}

window.filterAnalyticsStudents = function() {
  renderAnalyticsStudentTable();
};

// =========================================================================
// 5. TEST & QUIZ ENGINE MANAGEMENT (Part 5)
// =========================================================================

let allTestsList = [];
let allTestAttemptsList = [];
let testFilterClass = 'all';
let testFilterPrep = 'all';
let testFilterStatus = 'all';
let testSearchQuery = '';

let attemptFilterTestId = 'all';
let attemptFilterClass = 'all';
let attemptFilterPrep = 'all';
let attemptSearchQuery = '';

let testToDeleteId = null;
let activeQuestionTestId = null;
let editingQuestionId = null;

// Modal DOM references
const testModal = document.getElementById('test-modal');
const deleteTestModal = document.getElementById('delete-test-modal');
const testQuestionsModal = document.getElementById('test-questions-modal');
const attemptDetailModal = document.getElementById('attempt-detail-modal');

function listenToTestsData() {
  const testsRef = db.ref('tests');
  testsRef.on('value', (snapshot) => {
    const data = snapshot.val() || {};
    const testsArray = Object.keys(data).map((key) => {
      const item = data[key];
      return {
        ...item,
        id: item.id || key,
        questions: item.questions || {}
      };
    });

    // Sort newest first
    testsArray.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    allTestsList = testsArray;

    // Update Badges & Dashboard Stats
    if (testsBadgeCount) {
      testsBadgeCount.textContent = `${allTestsList.length} Tests`;
    }
    if (statTests) {
      statTests.textContent = allTestsList.filter(t => t.active).length;
    }

    // Populate Test Filter in Attempts View & Leaderboard View
    populateAttemptsTestFilter();
    populateLeaderboardTestFilter();

    // Re-render tests if current module is tests
    if (activeModule === 'tests') {
      renderTestsGrid();
    }
  });
}

function listenToTestAttemptsData() {
  const attemptsRef = db.ref('testAttempts');
  attemptsRef.on('value', (snapshot) => {
    const data = snapshot.val() || {};
    const flattened = [];

    // data format: testAttempts[testId][userId] = attemptData
    Object.keys(data).forEach((testId) => {
      const testAttempts = data[testId] || {};
      Object.keys(testAttempts).forEach((userId) => {
        const attempt = testAttempts[userId];
        if (attempt && typeof attempt === 'object') {
          flattened.push({
            ...attempt,
            testId: attempt.testId || testId,
            userId: attempt.userId || userId
          });
        }
      });
    });

    // Sort newest submission first
    flattened.sort((a, b) => (b.submittedAt || 0) - (a.submittedAt || 0));
    allTestAttemptsList = flattened;

    // Update Attempts Badge & Stat
    if (attemptsBadgeCount) {
      attemptsBadgeCount.textContent = `${allTestAttemptsList.length} Submissions`;
    }
    if (statAttempts) {
      statAttempts.textContent = allTestAttemptsList.length;
    }

    // Re-render attempts table or leaderboard if active
    if (activeModule === 'attempts') {
      renderAttemptsTable();
    } else if (activeModule === 'leaderboard') {
      renderLeaderboardSection();
    }
  });
}

function populateAttemptsTestFilter() {
  const select = document.getElementById('attempts-admin-test-filter');
  if (!select) return;

  const currentVal = select.value;
  select.innerHTML = '<option value="all">All Tests</option>' +
    allTestsList.map(t => `<option value="${escapeHtml(t.id)}">${escapeHtml(t.title)} (${escapeHtml(t.class)} • ${escapeHtml(t.preparation)})</option>`).join('');

  if (currentVal && Array.from(select.options).some(o => o.value === currentVal)) {
    select.value = currentVal;
  }
}

// Filter Handlers
window.handleTestsFilterChange = function() {
  const searchInput = document.getElementById('tests-admin-search-input');
  const classFilter = document.getElementById('tests-admin-class-filter');
  const prepFilter = document.getElementById('tests-admin-prep-filter');
  const statusFilter = document.getElementById('tests-admin-status-filter');

  testSearchQuery = (searchInput?.value || '').trim().toLowerCase();
  testFilterClass = classFilter?.value || 'all';
  testFilterPrep = prepFilter?.value || 'all';
  testFilterStatus = statusFilter?.value || 'all';

  renderTestsGrid();
};

window.renderTestsGrid = function() {
  const container = document.getElementById('tests-list-container');
  if (!container) return;

  let filtered = allTestsList.filter((test) => {
    if (testFilterClass !== 'all' && test.class !== testFilterClass) return false;
    if (testFilterPrep !== 'all' && test.preparation !== testFilterPrep) return false;
    if (testFilterStatus === 'active' && !test.active) return false;
    if (testFilterStatus === 'inactive' && test.active) return false;

    if (testSearchQuery) {
      const matchTitle = (test.title || '').toLowerCase().includes(testSearchQuery);
      const matchDesc = (test.description || '').toLowerCase().includes(testSearchQuery);
      if (!matchTitle && !matchDesc) return false;
    }
    return true;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 50px 20px; color: var(--slate-400); background: #ffffff; border-radius: var(--radius-md); border: 1px dashed var(--slate-200);">
        <i data-lucide="clipboard-list" style="width: 42px; height: 42px; margin: 0 auto 12px; color: var(--slate-300); display: block;"></i>
        <h4 style="font-size: 15px; font-weight: 700; color: var(--slate-700); margin-bottom: 4px;">No tests found</h4>
        <p style="font-size: 13px; color: var(--slate-500); margin-bottom: 14px;">Try changing your search filters or create a new test series.</p>
        <button class="btn-primary" onclick="openTestModal()" style="display: inline-flex; margin: 0 auto;">
          <i data-lucide="plus" style="width: 14px; height: 14px;"></i>
          <span>Create New Test</span>
        </button>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
    return;
  }

  container.innerHTML = filtered.map((test) => {
    const questionKeys = Object.keys(test.questions || {});
    const questionCount = questionKeys.length;
    
    // Calculate total marks from question bank or fallback to test totalMarks
    let calculatedMarks = 0;
    if (questionCount > 0) {
      questionKeys.forEach((k) => {
        calculatedMarks += (test.questions[k].marks || test.marksPerQuestion || 4);
      });
    } else {
      calculatedMarks = test.totalMarks || (test.marksPerQuestion ? test.marksPerQuestion * 25 : 100);
    }

    // Count attempts on this test
    const attemptsCount = allTestAttemptsList.filter(a => a.testId === test.id).length;

    return `
      <div class="test-admin-card" id="test-card-${test.id}">
        <div class="test-admin-header">
          <div style="flex: 1;">
            <div class="test-admin-title">${escapeHtml(test.title)}</div>
            <div class="test-admin-badges">
              <span class="badge-status" style="background: ${test.class === 'Class 12' ? '#f5f3ff' : '#eff6ff'}; color: ${test.class === 'Class 12' ? '#7c3aed' : '#2563eb'};">
                ${escapeHtml(test.class)}
              </span>
              <span class="badge-status" style="background: ${test.preparation === 'JEE' ? '#fff7ed' : '#f0fdf4'}; color: ${test.preparation === 'JEE' ? '#c2410c' : '#15803d'};">
                ${escapeHtml(test.preparation)}
              </span>
              <span class="badge-status ${test.active ? 'status-active' : 'status-inactive'}">
                ${test.active ? 'Active' : 'Draft'}
              </span>
            </div>
          </div>
          <div>
            <label class="switch" title="${test.active ? 'Active: Click to unpublish' : 'Draft: Click to publish'}">
              <input type="checkbox" ${test.active ? 'checked' : ''} onchange="toggleTestActive('${test.id}', this.checked)" />
              <span class="slider"></span>
            </label>
          </div>
        </div>

        <div class="test-admin-body">
          <div class="test-admin-desc">${escapeHtml(test.description)}</div>

          <div class="test-admin-stats-strip">
            <div>
              <div class="test-admin-stat-label">Questions</div>
              <div class="test-admin-stat-val">${questionCount} Qs</div>
            </div>
            <div>
              <div class="test-admin-stat-label">Duration</div>
              <div class="test-admin-stat-val">${test.duration || 60} min</div>
            </div>
            <div>
              <div class="test-admin-stat-label">Total Marks</div>
              <div class="test-admin-stat-val">${calculatedMarks}</div>
            </div>
          </div>

          <div class="test-admin-marking-info">
            <span>Marking: <strong style="color: var(--emerald-600);">+${test.marksPerQuestion || 4}</strong> / <strong style="color: var(--rose-600);">-${test.negativeMarking ?? 1}</strong></span>
            <span style="font-weight: 600; color: var(--slate-600);">${attemptsCount} ${attemptsCount === 1 ? 'Submission' : 'Submissions'}</span>
          </div>
        </div>

        <div class="test-admin-footer">
          <button type="button" class="btn-secondary" style="font-size: 12px; padding: 6px 10px;" onclick="openTestQuestionsModal('${test.id}')" title="Manage Question Bank">
            <i data-lucide="layers" style="width: 14px; height: 14px;"></i>
            <span>Questions (${questionCount})</span>
          </button>

          <div style="display: flex; align-items: center; gap: 6px;">
            <button type="button" class="btn-secondary" style="font-size: 12px; padding: 6px 10px;" onclick="viewTestAttempts('${test.id}')" title="View Student Submissions">
              <i data-lucide="users" style="width: 14px; height: 14px;"></i>
              <span>Results</span>
            </button>
            <button type="button" class="btn-secondary" style="font-size: 12px; padding: 6px 8px;" onclick="editTest('${test.id}')" title="Edit Test Details">
              <i data-lucide="edit-3" style="width: 14px; height: 14px;"></i>
            </button>
            <button type="button" class="btn-secondary" style="font-size: 12px; padding: 6px 8px; color: var(--rose-600);" onclick="openDeleteTestModal('${test.id}')" title="Delete Test">
              <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  if (window.lucide) {
    lucide.createIcons();
  }
};

// Test Modal & Form Handlers
window.openTestModal = function(testId = null) {
  const modalTitle = document.getElementById('test-modal-title');
  const idInput = document.getElementById('test-form-id');
  const titleInput = document.getElementById('test-form-title');
  const descInput = document.getElementById('test-form-description');
  const classInput = document.getElementById('test-form-class');
  const prepInput = document.getElementById('test-form-prep');
  const durationInput = document.getElementById('test-form-duration');
  const marksInput = document.getElementById('test-form-marks-per-q');
  const negativeInput = document.getElementById('test-form-negative');
  const startTimeInput = document.getElementById('test-form-start-time');
  const endTimeInput = document.getElementById('test-form-end-time');
  const activeInput = document.getElementById('test-form-active');
  const multipleAttemptsInput = document.getElementById('test-form-multiple-attempts');

  if (testId) {
    const test = allTestsList.find(t => t.id === testId);
    if (!test) return;

    if (modalTitle) modalTitle.textContent = 'Edit Examination / Test';
    if (idInput) idInput.value = test.id;
    if (titleInput) titleInput.value = test.title || '';
    if (descInput) descInput.value = test.description || '';
    if (classInput) classInput.value = test.class || 'Class 11';
    if (prepInput) prepInput.value = test.preparation || 'JEE';
    if (durationInput) durationInput.value = test.duration || 60;
    if (marksInput) marksInput.value = test.marksPerQuestion || 4;
    if (negativeInput) negativeInput.value = test.negativeMarking ?? 1;
    if (startTimeInput) startTimeInput.value = test.startTime || '';
    if (endTimeInput) endTimeInput.value = test.endTime || '';
    if (activeInput) activeInput.checked = test.active !== false;
    if (multipleAttemptsInput) multipleAttemptsInput.checked = !!test.allowMultipleAttempts;
  } else {
    if (modalTitle) modalTitle.textContent = 'Create New Examination / Test';
    if (idInput) idInput.value = '';
    if (titleInput) titleInput.value = '';
    if (descInput) descInput.value = '';
    if (classInput) classInput.value = 'Class 11';
    if (prepInput) prepInput.value = 'JEE';
    if (durationInput) durationInput.value = '60';
    if (marksInput) marksInput.value = '4';
    if (negativeInput) negativeInput.value = '1';
    if (startTimeInput) startTimeInput.value = '';
    if (endTimeInput) endTimeInput.value = '';
    if (activeInput) activeInput.checked = true;
    if (multipleAttemptsInput) multipleAttemptsInput.checked = false;
  }

  if (testModal) {
    testModal.classList.add('active');
    if (window.lucide) lucide.createIcons();
  }
};

window.closeTestModal = function() {
  if (testModal) {
    testModal.classList.remove('active');
  }
};

window.handleTestPrepChange = function() {
  const prepInput = document.getElementById('test-form-prep');
  const negativeInput = document.getElementById('test-form-negative');
  if (prepInput && negativeInput) {
    if (prepInput.value === 'Board') {
      negativeInput.value = '0';
    } else {
      negativeInput.value = '1';
    }
  }
};

window.submitTestModalForm = function() {
  const form = document.getElementById('test-form');
  if (form) {
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    form.dispatchEvent(new Event('submit', { cancelable: true }));
  }
};

window.handleTestFormSubmit = async function(event) {
  event.preventDefault();

  const idInput = document.getElementById('test-form-id');
  const titleInput = document.getElementById('test-form-title');
  const descInput = document.getElementById('test-form-description');
  const classInput = document.getElementById('test-form-class');
  const prepInput = document.getElementById('test-form-prep');
  const durationInput = document.getElementById('test-form-duration');
  const marksInput = document.getElementById('test-form-marks-per-q');
  const negativeInput = document.getElementById('test-form-negative');
  const startTimeInput = document.getElementById('test-form-start-time');
  const endTimeInput = document.getElementById('test-form-end-time');
  const activeInput = document.getElementById('test-form-active');
  const multipleAttemptsInput = document.getElementById('test-form-multiple-attempts');
  const btnSave = document.getElementById('btn-save-test');

  const testId = idInput?.value.trim();
  const title = titleInput?.value.trim();
  const description = descInput?.value.trim();
  const targetClass = classInput?.value;
  const preparation = prepInput?.value;
  const duration = parseInt(durationInput?.value, 10) || 60;
  const marksPerQuestion = parseFloat(marksInput?.value) || 4;
  const negativeMarking = parseFloat(negativeInput?.value) || 0;
  const startTime = startTimeInput?.value || null;
  const endTime = endTimeInput?.value || null;
  const active = activeInput ? activeInput.checked : true;
  const allowMultipleAttempts = multipleAttemptsInput ? multipleAttemptsInput.checked : false;

  if (!title || !description) {
    showToast('Please fill in test title and syllabus description.', 'error');
    return;
  }

  if (btnSave) {
    btnSave.disabled = true;
    btnSave.innerHTML = '<span class="spinner" style="width: 14px; height: 14px;"></span><span>Saving...</span>';
  }

  try {
    if (testId) {
      // Update existing test
      const existing = allTestsList.find(t => t.id === testId);
      const questionsCount = Object.keys(existing?.questions || {}).length;
      let totalMarks = 0;
      if (questionsCount > 0) {
        Object.values(existing.questions).forEach(q => {
          totalMarks += (q.marks || marksPerQuestion);
        });
      } else {
        totalMarks = marksPerQuestion * 25;
      }

      await db.ref(`tests/${testId}`).update({
        title,
        description,
        class: targetClass,
        preparation,
        duration,
        marksPerQuestion,
        negativeMarking,
        totalMarks,
        totalQuestions: questionsCount,
        startTime,
        endTime,
        active,
        allowMultipleAttempts,
        updatedAt: Date.now()
      });

      showToast('Test details updated successfully!', 'success');
    } else {
      // Create new test
      const newTestRef = db.ref('tests').push();
      const newId = newTestRef.key;

      const newTestData = {
        id: newId,
        title,
        description,
        class: targetClass,
        preparation,
        duration,
        marksPerQuestion,
        negativeMarking,
        totalMarks: marksPerQuestion * 25,
        totalQuestions: 0,
        startTime,
        endTime,
        active,
        allowMultipleAttempts,
        questions: {},
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      await newTestRef.set(newTestData);
      showToast('New test created! You can now add questions to its bank.', 'success');
      
      // Auto open question bank for newly created test
      closeTestModal();
      openTestQuestionsModal(newId);
      return;
    }

    closeTestModal();
  } catch (err) {
    console.error('Error saving test:', err);
    showToast('Failed to save test. Please try again.', 'error');
  } finally {
    if (btnSave) {
      btnSave.disabled = false;
      btnSave.innerHTML = '<i data-lucide="check" style="width: 15px; height: 15px;"></i><span>Save Test</span>';
      if (window.lucide) lucide.createIcons();
    }
  }
};

window.editTest = function(testId) {
  openTestModal(testId);
};

window.toggleTestActive = async function(testId, newActiveState) {
  try {
    await db.ref(`tests/${testId}`).update({
      active: newActiveState,
      updatedAt: Date.now()
    });
    showToast(newActiveState ? 'Test is now active and published to students!' : 'Test unpublished (saved as draft).', 'info');
  } catch (error) {
    console.error('Error toggling test status:', error);
    showToast('Failed to update test status.', 'error');
  }
};

window.openDeleteTestModal = function(testId) {
  testToDeleteId = testId;
  const test = allTestsList.find(t => t.id === testId);
  const preview = document.getElementById('delete-test-title-preview');
  if (preview) {
    preview.textContent = test ? `"${test.title}" (${test.class} • ${test.preparation})` : '';
  }
  if (deleteTestModal) {
    deleteTestModal.classList.add('active');
    if (window.lucide) lucide.createIcons();
  }
};

window.closeDeleteTestModal = function() {
  testToDeleteId = null;
  if (deleteTestModal) {
    deleteTestModal.classList.remove('active');
  }
};

window.confirmDeleteTest = async function() {
  if (!testToDeleteId) return;

  const btnConfirm = document.getElementById('btn-confirm-delete-test');
  if (btnConfirm) btnConfirm.disabled = true;

  try {
    // Remove test and attempts
    await db.ref(`tests/${testToDeleteId}`).remove();
    await db.ref(`testAttempts/${testToDeleteId}`).remove();

    showToast('Test and associated submissions removed permanently.', 'info');
    closeDeleteTestModal();
  } catch (error) {
    console.error('Error deleting test:', error);
    showToast('Failed to delete test.', 'error');
  } finally {
    if (btnConfirm) btnConfirm.disabled = false;
  }
};

// =========================================================================
// QUESTION BANK MANAGEMENT MODAL
// =========================================================================

window.openTestQuestionsModal = function(testId) {
  activeQuestionTestId = testId;
  editingQuestionId = null;

  const test = allTestsList.find(t => t.id === testId);
  if (!test) return;

  const titleEl = document.getElementById('test-questions-modal-title');
  const subtitleEl = document.getElementById('test-questions-modal-subtitle');
  if (titleEl) titleEl.textContent = `Question Bank: ${test.title}`;
  if (subtitleEl) subtitleEl.textContent = `${test.class} • ${test.preparation} • Duration: ${test.duration}m`;

  cancelQuestionEditor();
  renderTestQuestionsList();

  if (testQuestionsModal) {
    testQuestionsModal.classList.add('active');
    if (window.lucide) lucide.createIcons();
  }
};

window.closeTestQuestionsModal = function() {
  activeQuestionTestId = null;
  editingQuestionId = null;
  if (testQuestionsModal) {
    testQuestionsModal.classList.remove('active');
  }
};

window.renderTestQuestionsList = function() {
  const container = document.getElementById('test-questions-list');
  const countBadge = document.getElementById('test-questions-count-badge');
  if (!container || !activeQuestionTestId) return;

  const test = allTestsList.find(t => t.id === activeQuestionTestId);
  if (!test) return;

  const questionsMap = test.questions || {};
  const questionKeys = Object.keys(questionsMap);

  if (countBadge) {
    countBadge.textContent = `${questionKeys.length} Questions`;
  }

  if (questionKeys.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px 20px; color: var(--slate-400); background: #ffffff; border-radius: var(--radius-sm); border: 1px dashed var(--slate-200);">
        <i data-lucide="help-circle" style="width: 36px; height: 36px; margin: 0 auto 10px; color: var(--slate-300); display: block;"></i>
        <h4 style="font-size: 14px; font-weight: 700; color: var(--slate-700); margin-bottom: 4px;">Question Bank is Empty</h4>
        <p style="font-size: 12.5px; color: var(--slate-500); margin-bottom: 12px;">Add questions with four options and mark the official answer.</p>
        <button type="button" class="btn-primary" onclick="toggleAddQuestionForm()" style="font-size: 12px; padding: 6px 14px; margin: 0 auto; display: inline-flex;">
          <i data-lucide="plus" style="width: 14px; height: 14px;"></i>
          <span>Add First Question</span>
        </button>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
    return;
  }

  container.innerHTML = questionKeys.map((qId, index) => {
    const q = questionsMap[qId];
    const opts = q.options || { A: '', B: '', C: '', D: '' };
    const correctOpt = q.correctAnswer || 'A';

    return `
      <div class="question-item-card" id="q-item-${qId}">
        <div class="question-item-header">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span class="question-item-number">Question #${index + 1}</span>
            <span class="question-item-marks">
              <strong style="color: var(--emerald-600);">+${q.marks || test.marksPerQuestion || 4} marks</strong>
              ${(q.negativeMarks ?? test.negativeMarking ?? 1) > 0 ? ` / <strong style="color: var(--rose-600);">-${q.negativeMarks ?? test.negativeMarking ?? 1}</strong>` : ''}
            </span>
          </div>

          <div style="display: flex; align-items: center; gap: 6px;">
            <button type="button" class="btn-secondary" style="padding: 4px 8px; font-size: 11px;" onclick="editQuestion('${qId}')" title="Edit Question">
              <i data-lucide="edit-3" style="width: 12px; height: 12px;"></i>
              <span>Edit</span>
            </button>
            <button type="button" class="btn-secondary" style="padding: 4px 8px; font-size: 11px; color: var(--rose-600);" onclick="deleteQuestion('${qId}')" title="Delete Question">
              <i data-lucide="trash-2" style="width: 12px; height: 12px;"></i>
            </button>
          </div>
        </div>

        <div class="question-item-text">${escapeHtml(q.question)}</div>

        ${q.imageUrl ? `
          <div style="margin: 8px 0 12px 0;">
            <a href="${escapeHtml(q.imageUrl)}" target="_blank" rel="noopener noreferrer">
              <img src="${escapeHtml(q.imageUrl)}" alt="Question Diagram" style="max-height: 160px; max-width: 100%; object-fit: contain; border-radius: var(--radius-sm); border: 1px solid var(--slate-200); background: #ffffff;" />
            </a>
          </div>
        ` : ''}

        <div class="question-options-grid">
          <div class="question-option-chip ${correctOpt === 'A' ? 'correct' : ''}">
            <strong style="min-width: 18px;">(A)</strong>
            <span style="flex: 1;">${escapeHtml(opts.A || 'Option A')}</span>
            ${correctOpt === 'A' ? '<i data-lucide="check" style="width: 14px; height: 14px; color: #059669;"></i>' : ''}
          </div>
          <div class="question-option-chip ${correctOpt === 'B' ? 'correct' : ''}">
            <strong style="min-width: 18px;">(B)</strong>
            <span style="flex: 1;">${escapeHtml(opts.B || 'Option B')}</span>
            ${correctOpt === 'B' ? '<i data-lucide="check" style="width: 14px; height: 14px; color: #059669;"></i>' : ''}
          </div>
          <div class="question-option-chip ${correctOpt === 'C' ? 'correct' : ''}">
            <strong style="min-width: 18px;">(C)</strong>
            <span style="flex: 1;">${escapeHtml(opts.C || 'Option C')}</span>
            ${correctOpt === 'C' ? '<i data-lucide="check" style="width: 14px; height: 14px; color: #059669;"></i>' : ''}
          </div>
          <div class="question-option-chip ${correctOpt === 'D' ? 'correct' : ''}">
            <strong style="min-width: 18px;">(D)</strong>
            <span style="flex: 1;">${escapeHtml(opts.D || 'Option D')}</span>
            ${correctOpt === 'D' ? '<i data-lucide="check" style="width: 14px; height: 14px; color: #059669;"></i>' : ''}
          </div>
        </div>
      </div>
    `;
  }).join('');

  if (window.lucide) {
    lucide.createIcons();
  }
};

window.toggleAddQuestionForm = function() {
  const card = document.getElementById('question-editor-card');
  const btnToggle = document.getElementById('btn-toggle-add-question-text');
  if (!card) return;

  if (card.style.display === 'none' || !card.style.display) {
    editingQuestionId = null;
    resetQuestionEditorForm();
    card.style.display = 'block';
    if (btnToggle) btnToggle.textContent = 'Close Editor';
    document.getElementById('question-editor-heading').textContent = 'Add New Question to Bank';
    document.getElementById('question-form-text')?.focus();
  } else {
    card.style.display = 'none';
    if (btnToggle) btnToggle.textContent = 'Add Question';
  }
};

window.cancelQuestionEditor = function() {
  const card = document.getElementById('question-editor-card');
  const btnToggle = document.getElementById('btn-toggle-add-question-text');
  if (card) card.style.display = 'none';
  if (btnToggle) btnToggle.textContent = 'Add Question';
  editingQuestionId = null;
};

function resetQuestionEditorForm() {
  const form = document.getElementById('question-form');
  if (form) form.reset();

  const idInput = document.getElementById('question-form-id');
  const test = allTestsList.find(t => t.id === activeQuestionTestId);
  const marksInput = document.getElementById('question-form-marks');
  const negInput = document.getElementById('question-form-negative');
  const imgUrlInput = document.getElementById('question-form-image-url');
  const previewBox = document.getElementById('question-image-preview-box');

  if (idInput) idInput.value = '';
  if (marksInput) marksInput.value = test?.marksPerQuestion || 4;
  if (negInput) negInput.value = test?.negativeMarking ?? 1;
  if (imgUrlInput) imgUrlInput.value = '';
  if (previewBox) previewBox.style.display = 'none';
}

window.handleQuestionImageUrlInput = function() {
  const input = document.getElementById('question-form-image-url');
  const previewBox = document.getElementById('question-image-preview-box');
  const previewImg = document.getElementById('question-image-preview');

  if (input && previewBox && previewImg) {
    const val = input.value.trim();
    if (val) {
      previewImg.src = val;
      previewBox.style.display = 'block';
    } else {
      previewBox.style.display = 'none';
    }
  }
};

window.handleQuestionImageFileUpload = async function(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  const uploadingDiv = document.getElementById('question-image-uploading');
  const urlInput = document.getElementById('question-form-image-url');
  const previewBox = document.getElementById('question-image-preview-box');
  const previewImg = document.getElementById('question-image-preview');

  if (uploadingDiv) uploadingDiv.style.display = 'flex';

  try {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
      method: 'POST',
      body: formData
    });

    const data = await response.json();
    if (data?.data?.url) {
      if (urlInput) urlInput.value = data.data.url;
      if (previewImg) previewImg.src = data.data.url;
      if (previewBox) previewBox.style.display = 'block';
      showToast('Diagram image uploaded successfully!', 'success');
    } else {
      showToast('Failed to upload image to CDN.', 'error');
    }
  } catch (err) {
    console.error('Error uploading question image:', err);
    showToast('Failed to upload question image.', 'error');
  } finally {
    if (uploadingDiv) uploadingDiv.style.display = 'none';
    event.target.value = '';
  }
};

window.clearQuestionImage = function() {
  const urlInput = document.getElementById('question-form-image-url');
  const previewBox = document.getElementById('question-image-preview-box');
  const previewImg = document.getElementById('question-image-preview');

  if (urlInput) urlInput.value = '';
  if (previewImg) previewImg.src = '';
  if (previewBox) previewBox.style.display = 'none';
};

window.handleQuestionFormSubmit = async function(event) {
  event.preventDefault();
  if (!activeQuestionTestId) return;

  const textInput = document.getElementById('question-form-text');
  const imgUrlInput = document.getElementById('question-form-image-url');
  const optAInput = document.getElementById('question-form-opt-a');
  const optBInput = document.getElementById('question-form-opt-b');
  const optCInput = document.getElementById('question-form-opt-c');
  const optDInput = document.getElementById('question-form-opt-d');
  const correctInput = document.getElementById('question-form-correct-answer');
  const marksInput = document.getElementById('question-form-marks');
  const negInput = document.getElementById('question-form-negative');
  const btnSubmit = document.getElementById('btn-save-question-submit');

  const question = textInput?.value.trim();
  const imageUrl = imgUrlInput?.value.trim() || null;
  const optA = optAInput?.value.trim();
  const optB = optBInput?.value.trim();
  const optC = optCInput?.value.trim();
  const optD = optDInput?.value.trim();
  const correctAnswer = correctInput?.value || 'A';
  const marks = parseFloat(marksInput?.value) || 4;
  const negativeMarks = parseFloat(negInput?.value) || 0;

  if (!question || !optA || !optB || !optC || !optD) {
    showToast('Please provide question text and all four options.', 'error');
    return;
  }

  if (btnSubmit) {
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = '<span class="spinner" style="width: 12px; height: 12px;"></span><span>Saving...</span>';
  }

  try {
    const qId = editingQuestionId || db.ref(`tests/${activeQuestionTestId}/questions`).push().key;

    const questionPayload = {
      id: qId,
      question,
      imageUrl,
      options: {
        A: optA,
        B: optB,
        C: optC,
        D: optD
      },
      correctAnswer,
      marks,
      negativeMarks,
      updatedAt: Date.now()
    };

    // Save question under tests/{activeQuestionTestId}/questions/{qId}
    await db.ref(`tests/${activeQuestionTestId}/questions/${qId}`).set(questionPayload);

    // Recalculate test metadata (totalQuestions, totalMarks)
    const test = allTestsList.find(t => t.id === activeQuestionTestId);
    const questions = { ...(test?.questions || {}), [qId]: questionPayload };
    const qCount = Object.keys(questions).length;
    let tMarks = 0;
    Object.values(questions).forEach(q => {
      tMarks += (q.marks || 4);
    });

    await db.ref(`tests/${activeQuestionTestId}`).update({
      totalQuestions: qCount,
      totalMarks: tMarks,
      updatedAt: Date.now()
    });

    showToast(editingQuestionId ? 'Question updated!' : 'Question added to test!', 'success');
    cancelQuestionEditor();
  } catch (err) {
    console.error('Error saving question:', err);
    showToast('Failed to save question.', 'error');
  } finally {
    if (btnSubmit) {
      btnSubmit.disabled = false;
      btnSubmit.innerHTML = '<i data-lucide="check" style="width: 14px; height: 14px;"></i><span>Save Question to Bank</span>';
      if (window.lucide) lucide.createIcons();
    }
  }
};

window.editQuestion = function(qId) {
  const test = allTestsList.find(t => t.id === activeQuestionTestId);
  const q = test?.questions?.[qId];
  if (!q) return;

  editingQuestionId = qId;
  const card = document.getElementById('question-editor-card');
  const heading = document.getElementById('question-editor-heading');
  const textInput = document.getElementById('question-form-text');
  const imgUrlInput = document.getElementById('question-form-image-url');
  const previewBox = document.getElementById('question-image-preview-box');
  const previewImg = document.getElementById('question-image-preview');
  const optAInput = document.getElementById('question-form-opt-a');
  const optBInput = document.getElementById('question-form-opt-b');
  const optCInput = document.getElementById('question-form-opt-c');
  const optDInput = document.getElementById('question-form-opt-d');
  const correctInput = document.getElementById('question-form-correct-answer');
  const marksInput = document.getElementById('question-form-marks');
  const negInput = document.getElementById('question-form-negative');

  if (heading) heading.textContent = 'Edit Question';
  if (textInput) textInput.value = q.question || '';
  if (imgUrlInput) imgUrlInput.value = q.imageUrl || '';
  if (q.imageUrl && previewBox && previewImg) {
    previewImg.src = q.imageUrl;
    previewBox.style.display = 'block';
  } else if (previewBox) {
    previewBox.style.display = 'none';
  }

  const opts = q.options || {};
  if (optAInput) optAInput.value = opts.A || '';
  if (optBInput) optBInput.value = opts.B || '';
  if (optCInput) optCInput.value = opts.C || '';
  if (optDInput) optDInput.value = opts.D || '';
  if (correctInput) correctInput.value = q.correctAnswer || 'A';
  if (marksInput) marksInput.value = q.marks || test?.marksPerQuestion || 4;
  if (negInput) negInput.value = q.negativeMarks ?? test?.negativeMarking ?? 1;

  if (card) {
    card.style.display = 'block';
    card.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

window.deleteQuestion = async function(qId) {
  if (!confirm('Are you sure you want to remove this question from the test?')) return;
  if (!activeQuestionTestId) return;

  try {
    await db.ref(`tests/${activeQuestionTestId}/questions/${qId}`).remove();

    // Recalculate
    const test = allTestsList.find(t => t.id === activeQuestionTestId);
    const questions = { ...(test?.questions || {}) };
    delete questions[qId];

    const qCount = Object.keys(questions).length;
    let tMarks = 0;
    Object.values(questions).forEach(q => {
      tMarks += (q.marks || 4);
    });

    await db.ref(`tests/${activeQuestionTestId}`).update({
      totalQuestions: qCount,
      totalMarks: tMarks,
      updatedAt: Date.now()
    });

    showToast('Question deleted.', 'info');
  } catch (err) {
    console.error('Error deleting question:', err);
    showToast('Failed to delete question.', 'error');
  }
};

// =========================================================================
// STUDENT TEST SUBMISSIONS & ATTEMPTS
// =========================================================================

window.viewTestAttempts = function(testId) {
  navigateToModule('attempts', 'Student Test Attempts');
  const select = document.getElementById('attempts-admin-test-filter');
  if (select) {
    select.value = testId;
    handleAttemptsFilterChange();
  }
};

window.handleAttemptsFilterChange = function() {
  const searchInput = document.getElementById('attempts-admin-search-input');
  const testFilter = document.getElementById('attempts-admin-test-filter');
  const classFilter = document.getElementById('attempts-admin-class-filter');
  const prepFilter = document.getElementById('attempts-admin-prep-filter');

  attemptSearchQuery = (searchInput?.value || '').trim().toLowerCase();
  attemptFilterTestId = testFilter?.value || 'all';
  attemptFilterClass = classFilter?.value || 'all';
  attemptFilterPrep = prepFilter?.value || 'all';

  renderAttemptsTable();
};

window.renderAttemptsTable = function() {
  const tbody = document.getElementById('attempts-table-body');
  if (!tbody) return;

  let filtered = allTestAttemptsList.filter((att) => {
    if (attemptFilterTestId !== 'all' && att.testId !== attemptFilterTestId) return false;
    if (attemptFilterClass !== 'all' && att.userClass !== attemptFilterClass) return false;
    if (attemptFilterPrep !== 'all' && att.userPreparation !== attemptFilterPrep) return false;

    if (attemptSearchQuery) {
      const matchName = (att.userName || '').toLowerCase().includes(attemptSearchQuery);
      const matchEmail = (att.userEmail || '').toLowerCase().includes(attemptSearchQuery);
      const matchTitle = (att.testTitle || '').toLowerCase().includes(attemptSearchQuery);
      if (!matchName && !matchEmail && !matchTitle) return false;
    }
    return true;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="9" style="text-align: center; padding: 40px; color: var(--slate-400);">
          No student submissions match the selected filters.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map((att) => {
    const pct = Math.round(att.percentage || 0);
    let pctBadgeColor = '#059669'; // Green
    let pctBadgeBg = '#ecfdf5';
    if (pct < 40) {
      pctBadgeColor = '#e11d48'; // Red
      pctBadgeBg = '#ffe4e6';
    } else if (pct < 70) {
      pctBadgeColor = '#d97706'; // Amber
      pctBadgeBg = '#fef3c7';
    }

    // Time Taken format
    const totalSec = att.timeTakenSeconds || 0;
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    const timeFormatted = `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;

    // Submitted At date
    const dateFormatted = att.submittedAt ? new Date(att.submittedAt).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }) : '—';

    // Accuracy
    const correct = att.correctCount || 0;
    const wrong = att.wrongCount || 0;
    const totalAttempted = correct + wrong;
    const accuracy = totalAttempted > 0 ? Math.round((correct / totalAttempted) * 100) : 0;

    return `
      <tr>
        <td>
          <div style="font-weight: 700; color: var(--slate-900);">${escapeHtml(att.userName || 'Student')}</div>
          <div style="font-size: 11px; color: var(--slate-500);">${escapeHtml(att.userEmail || '')}</div>
        </td>
        <td style="max-width: 180px;">
          <div style="font-weight: 600; color: var(--slate-800); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${escapeHtml(att.testTitle || '')}">
            ${escapeHtml(att.testTitle || 'Mock Test')}
          </div>
        </td>
        <td>
          <span class="badge-status" style="background: ${att.userClass === 'Class 12' ? '#f5f3ff' : '#eff6ff'}; color: ${att.userClass === 'Class 12' ? '#7c3aed' : '#2563eb'}; font-size: 11px;">
            ${escapeHtml(att.userClass || '—')}
          </span>
          <span class="badge-status" style="background: ${att.userPreparation === 'JEE' ? '#fff7ed' : '#f0fdf4'}; color: ${att.userPreparation === 'JEE' ? '#c2410c' : '#15803d'}; font-size: 11px;">
            ${escapeHtml(att.userPreparation || '—')}
          </span>
        </td>
        <td>
          <span style="font-weight: 800; color: var(--slate-900);">${att.score || 0}</span>
          <span style="font-size: 11px; color: var(--slate-500);">/ ${att.totalMarks || 0}</span>
        </td>
        <td>
          <span class="badge-status" style="background: ${pctBadgeBg}; color: ${pctBadgeColor}; font-weight: 800;">
            ${pct}%
          </span>
        </td>
        <td>
          <div style="font-weight: 700; color: var(--slate-800);">${accuracy}%</div>
          <div style="font-size: 10.5px; color: var(--slate-500);">${correct}C • ${wrong}W • ${att.unansweredCount || 0}U</div>
        </td>
        <td style="color: var(--slate-600); font-size: 12px;">${timeFormatted}</td>
        <td style="color: var(--slate-500); font-size: 11.5px;">${dateFormatted}</td>
        <td>
          <button type="button" class="btn-primary" style="font-size: 11.5px; padding: 4px 10px;" onclick="openAttemptDetailModal('${att.testId}', '${att.userId}')">
            <i data-lucide="eye" style="width: 12px; height: 12px;"></i>
            <span>Review</span>
          </button>
        </td>
      </tr>
    `;
  }).join('');

  if (window.lucide) {
    lucide.createIcons();
  }
};

window.openAttemptDetailModal = function(testId, userId) {
  const attempt = allTestAttemptsList.find(a => a.testId === testId && a.userId === userId);
  if (!attempt) return;

  const titleEl = document.getElementById('attempt-detail-modal-title');
  const subtitleEl = document.getElementById('attempt-detail-modal-subtitle');
  const statScore = document.getElementById('att-detail-stat-score');
  const statPct = document.getElementById('att-detail-stat-pct');
  const statCorrect = document.getElementById('att-detail-stat-correct');
  const statWrong = document.getElementById('att-detail-stat-wrong');
  const statTime = document.getElementById('att-detail-stat-time');
  const listContainer = document.getElementById('attempt-detail-breakdown-list');

  if (titleEl) titleEl.textContent = `Review: ${attempt.userName || 'Student'} — ${attempt.testTitle || 'Test'}`;
  if (subtitleEl) subtitleEl.textContent = `${attempt.userEmail || ''} • ${attempt.userClass || ''} • ${attempt.userPreparation || ''} • Submitted on ${new Date(attempt.submittedAt || Date.now()).toLocaleString('en-IN')}`;

  if (statScore) statScore.textContent = `${attempt.score} / ${attempt.totalMarks}`;
  if (statPct) statPct.textContent = `${Math.round(attempt.percentage || 0)}%`;
  if (statCorrect) statCorrect.textContent = attempt.correctCount || 0;
  if (statWrong) statWrong.textContent = attempt.wrongCount || 0;

  const totalSec = attempt.timeTakenSeconds || 0;
  const mins = Math.floor(totalSec / 60);
  const secs = totalSec % 60;
  if (statTime) statTime.textContent = `${mins}m ${secs}s`;

  // Render question-by-question breakdown
  if (listContainer) {
    const breakdown = attempt.questionBreakdown || [];

    if (breakdown.length === 0) {
      listContainer.innerHTML = `
        <div style="text-align: center; padding: 30px; color: var(--slate-400);">
          Detailed question breakdown was not archived for this submission.
        </div>
      `;
    } else {
      listContainer.innerHTML = breakdown.map((item, idx) => {
        const selected = item.selectedOption;
        const correct = item.correctOption;
        const isCorrect = item.isCorrect;
        const isUnanswered = !selected;
        const opts = item.options || { A: '', B: '', C: '', D: '' };

        let statusBadgeHtml = '';
        if (isCorrect) {
          statusBadgeHtml = `<span class="badge-status status-active" style="font-weight: 700;">+${item.marksAwarded} Correct</span>`;
        } else if (isUnanswered) {
          statusBadgeHtml = `<span class="badge-status" style="background: var(--slate-100); color: var(--slate-600); font-weight: 700;">Unanswered (0)</span>`;
        } else {
          statusBadgeHtml = `<span class="badge-status" style="background: #fff1f2; color: #be123c; font-weight: 700;">${item.marksAwarded} Incorrect</span>`;
        }

        return `
          <div class="question-item-card" style="border-color: ${isCorrect ? '#a7f3d0' : isUnanswered ? 'var(--slate-200)' : '#fecdd3'}; background: ${isCorrect ? '#f0fdf4' : isUnanswered ? '#ffffff' : '#fff5f5'};">
            <div class="question-item-header">
              <span class="question-item-number">Q${idx + 1}</span>
              ${statusBadgeHtml}
            </div>

            <div class="question-item-text" style="color: var(--slate-900);">${escapeHtml(item.questionText)}</div>

            ${item.imageUrl ? `
              <div style="margin: 8px 0 12px 0;">
                <img src="${escapeHtml(item.imageUrl)}" alt="Question Diagram" style="max-height: 140px; border-radius: 6px; border: 1px solid var(--slate-200); background: #ffffff;" />
              </div>
            ` : ''}

            <div class="question-options-grid">
              ${['A', 'B', 'C', 'D'].map((key) => {
                const optText = opts[key] || '';
                const isSelectedByUser = selected === key;
                const isOfficialCorrect = correct === key;

                let chipClass = '';
                let borderStyle = 'border: 1px solid var(--slate-200); background: #ffffff;';
                let indicator = '';

                if (isOfficialCorrect) {
                  borderStyle = 'border: 2px solid #10b981; background: #ecfdf5; font-weight: 700; color: #065f46;';
                  indicator = '<span style="color: #059669; font-size: 11px; margin-left: auto;">(Official Correct)</span>';
                }
                if (isSelectedByUser && !isOfficialCorrect) {
                  borderStyle = 'border: 2px solid #ef4444; background: #fef2f2; font-weight: 700; color: #991b1b;';
                  indicator = '<span style="color: #dc2626; font-size: 11px; margin-left: auto;">(Student Answer)</span>';
                }

                return `
                  <div class="question-option-chip" style="${borderStyle}">
                    <strong>(${key})</strong>
                    <span>${escapeHtml(optText)}</span>
                    ${indicator}
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        `;
      }).join('');
    }
  }

  if (attemptDetailModal) {
    attemptDetailModal.classList.add('active');
    if (window.lucide) lucide.createIcons();
  }
};

window.closeAttemptDetailModal = function() {
  if (attemptDetailModal) {
    attemptDetailModal.classList.remove('active');
  }
};

// =========================================================================
// 5.5. ADMIN LEADERBOARD & ANALYTICS ENGINE (Part 6)
// =========================================================================

let leaderboardFilterClass = 'all';
let leaderboardFilterPrep = 'all';
let leaderboardFilterTestId = 'all';
let leaderboardFilterDate = 'all';
let leaderboardSearchQuery = '';

function populateLeaderboardTestFilter() {
  const select = document.getElementById('leaderboard-admin-test-filter');
  if (!select) return;

  const currentVal = select.value;
  select.innerHTML = '<option value="all">All Tests (Aggregated)</option>' +
    allTestsList.map(t => `<option value="${escapeHtml(t.id)}">${escapeHtml(t.title)} (${escapeHtml(t.class)} • ${escapeHtml(t.preparation)})</option>`).join('');

  if (currentVal && Array.from(select.options).some(o => o.value === currentVal)) {
    select.value = currentVal;
  }
}

function matchesDateFilter(timestamp, filter) {
  if (filter === 'all' || !timestamp) return true;
  const now = Date.now();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  if (filter === 'today') {
    return timestamp >= todayStart.getTime();
  }
  if (filter === '7days') {
    return timestamp >= now - (7 * 24 * 60 * 60 * 1000);
  }
  if (filter === '30days') {
    return timestamp >= now - (30 * 24 * 60 * 60 * 1000);
  }
  return true;
}

window.handleLeaderboardFilterChange = function() {
  const searchInput = document.getElementById('leaderboard-admin-search-input');
  const classFilter = document.getElementById('leaderboard-admin-class-filter');
  const prepFilter = document.getElementById('leaderboard-admin-prep-filter');
  const testFilter = document.getElementById('leaderboard-admin-test-filter');
  const dateFilter = document.getElementById('leaderboard-admin-date-filter');

  leaderboardSearchQuery = (searchInput?.value || '').trim().toLowerCase();
  leaderboardFilterClass = classFilter?.value || 'all';
  leaderboardFilterPrep = prepFilter?.value || 'all';
  leaderboardFilterTestId = testFilter?.value || 'all';
  leaderboardFilterDate = dateFilter?.value || 'all';

  renderLeaderboardSection();
};

window.resetLeaderboardFilters = function() {
  const searchInput = document.getElementById('leaderboard-admin-search-input');
  const classFilter = document.getElementById('leaderboard-admin-class-filter');
  const prepFilter = document.getElementById('leaderboard-admin-prep-filter');
  const testFilter = document.getElementById('leaderboard-admin-test-filter');
  const dateFilter = document.getElementById('leaderboard-admin-date-filter');

  if (searchInput) searchInput.value = '';
  if (classFilter) classFilter.value = 'all';
  if (prepFilter) prepFilter.value = 'all';
  if (testFilter) testFilter.value = 'all';
  if (dateFilter) dateFilter.value = 'all';

  leaderboardSearchQuery = '';
  leaderboardFilterClass = 'all';
  leaderboardFilterPrep = 'all';
  leaderboardFilterTestId = 'all';
  leaderboardFilterDate = 'all';

  renderLeaderboardSection();
};

function updateAdminAnalytics(attempts) {
  const statAttemptsEl = document.getElementById('analytics-stat-total-attempts');
  const statAttemptsSub = document.getElementById('analytics-stat-attempts-sub');
  const statAvgScoreEl = document.getElementById('analytics-stat-avg-score');
  const statAvgScoreSub = document.getElementById('analytics-stat-avg-score-sub');
  const statHighestEl = document.getElementById('analytics-stat-highest-score');
  const statHighestSub = document.getElementById('analytics-stat-highest-sub');
  const statAvgAccEl = document.getElementById('analytics-stat-avg-accuracy');
  const statTopTestEl = document.getElementById('analytics-stat-top-test');
  const statTopTestCount = document.getElementById('analytics-stat-top-test-count');

  const total = attempts.length;

  if (statAttemptsEl) statAttemptsEl.textContent = total;
  if (statAttemptsSub) {
    let filterDesc = [];
    if (leaderboardFilterClass !== 'all') filterDesc.push(leaderboardFilterClass);
    if (leaderboardFilterPrep !== 'all') filterDesc.push(leaderboardFilterPrep);
    if (leaderboardFilterDate !== 'all') filterDesc.push(leaderboardFilterDate);
    statAttemptsSub.textContent = filterDesc.length > 0 ? `Filtered by ${filterDesc.join(', ')}` : 'Across all cohort tests';
  }

  if (total === 0) {
    if (statAvgScoreEl) statAvgScoreEl.textContent = '0%';
    if (statAvgScoreSub) statAvgScoreSub.textContent = '0.0 avg points';
    if (statHighestEl) statHighestEl.textContent = '0';
    if (statHighestSub) statHighestSub.textContent = 'No attempts matching filters';
    if (statAvgAccEl) statAvgAccEl.textContent = '0%';
    if (statTopTestEl) statTopTestEl.textContent = '—';
    if (statTopTestCount) statTopTestCount.textContent = '0 attempts';
    return;
  }

  // 1. Average Score & Points
  let totalPctSum = 0;
  let totalPointsSum = 0;
  let totalAccSum = 0;
  let highestScore = -Infinity;
  let highestAttempt = null;

  // Test frequency map for "Most Attempted Test"
  const testCounts = {};

  attempts.forEach((att) => {
    const pct = typeof att.percentage === 'number' ? att.percentage : (att.totalMarks > 0 ? (att.score / att.totalMarks) * 100 : 0);
    totalPctSum += pct;
    totalPointsSum += (att.score || 0);

    const acc = typeof att.accuracy === 'number' ? att.accuracy : (
      (att.correctCount + att.wrongCount) > 0 ? (att.correctCount / (att.correctCount + att.wrongCount)) * 100 : 0
    );
    totalAccSum += acc;

    if (att.score > highestScore) {
      highestScore = att.score;
      highestAttempt = att;
    }

    testCounts[att.testId] = (testCounts[att.testId] || 0) + 1;
  });

  const avgPct = Math.round(totalPctSum / total);
  const avgPoints = (totalPointsSum / total).toFixed(1);
  const avgAcc = Math.round(totalAccSum / total);

  if (statAvgScoreEl) statAvgScoreEl.textContent = `${avgPct}%`;
  if (statAvgScoreSub) statAvgScoreSub.textContent = `${avgPoints} avg marks`;

  if (statHighestEl) statHighestEl.textContent = highestScore >= 0 ? highestScore : '0';
  if (statHighestSub) {
    if (highestAttempt) {
      statHighestSub.textContent = `${highestAttempt.userName || 'Student'} (${highestAttempt.percentage || 0}%)`;
    } else {
      statHighestSub.textContent = 'No attempts recorded';
    }
  }

  if (statAvgAccEl) statAvgAccEl.textContent = `${avgAcc}%`;

  // Find most attempted test
  let topTestId = null;
  let maxCount = 0;
  Object.keys(testCounts).forEach((tId) => {
    if (testCounts[tId] > maxCount) {
      maxCount = testCounts[tId];
      topTestId = tId;
    }
  });

  if (topTestId) {
    const topTestObj = allTestsList.find(t => t.id === topTestId);
    const title = topTestObj ? topTestObj.title : 'Selected Test';
    if (statTopTestEl) {
      statTopTestEl.textContent = title.length > 28 ? title.substring(0, 25) + '...' : title;
      statTopTestEl.title = title;
    }
    if (statTopTestCount) {
      statTopTestCount.textContent = `${maxCount} ${maxCount === 1 ? 'attempt' : 'attempts'}`;
    }
  } else {
    if (statTopTestEl) statTopTestEl.textContent = '—';
    if (statTopTestCount) statTopTestCount.textContent = '0 attempts';
  }
}

window.renderLeaderboardSection = function() {
  const tbody = document.getElementById('leaderboard-table-body');
  const badgeCount = document.getElementById('leaderboard-badge-count');
  if (!tbody) return;

  // Filter attempts based on criteria (Class, Prep, Test, Date)
  const filteredAttempts = allTestAttemptsList.filter((att) => {
    if (leaderboardFilterClass !== 'all' && att.userClass !== leaderboardFilterClass) return false;
    if (leaderboardFilterPrep !== 'all' && att.userPreparation !== leaderboardFilterPrep) return false;
    if (leaderboardFilterTestId !== 'all' && att.testId !== leaderboardFilterTestId) return false;
    if (!matchesDateFilter(att.submittedAt, leaderboardFilterDate)) return false;
    return true;
  });

  // 1. Update Analytics Metrics Cards
  updateAdminAnalytics(filteredAttempts);

  // 2. Ranking System Implementation
  // Rankings are calculated strictly among students of the same Class + Preparation cohort
  // Tie-breaking priority:
  // 1. Higher score
  // 2. Higher accuracy
  // 3. Lower time taken
  // 4. Earlier submission
  let leaderboardEntries = [];

  if (leaderboardFilterTestId !== 'all') {
    // Single Test Leaderboard Mode
    // Group by student (if multiple attempts, pick highest score / latest)
    const studentAttemptsMap = {};
    filteredAttempts.forEach((att) => {
      const existing = studentAttemptsMap[att.userId];
      if (!existing || att.score > existing.score || (att.score === existing.score && att.submittedAt > existing.submittedAt)) {
        studentAttemptsMap[att.userId] = att;
      }
    });

    const entries = Object.values(studentAttemptsMap);

    // Group into cohorts: "Class_Prep"
    const cohortGroups = {};
    entries.forEach((att) => {
      const cohortKey = `${att.userClass || 'Class 11'}_${att.userPreparation || 'Board'}`;
      if (!cohortGroups[cohortKey]) cohortGroups[cohortKey] = [];
      cohortGroups[cohortKey].push(att);
    });

    // Sort within each cohort group by standard tie-breakers
    Object.keys(cohortGroups).forEach((key) => {
      cohortGroups[key].sort((a, b) => {
        // Priority 1: Higher score
        if (b.score !== a.score) return b.score - a.score;
        // Priority 2: Higher accuracy
        const accA = a.accuracy ?? 0;
        const accB = b.accuracy ?? 0;
        if (accB !== accA) return accB - accA;
        // Priority 3: Lower time taken
        const timeA = a.timeTakenSeconds ?? 0;
        const timeB = b.timeTakenSeconds ?? 0;
        if (timeA !== timeB) return timeA - timeB;
        // Priority 4: Earlier submission
        return (a.submittedAt ?? 0) - (b.submittedAt ?? 0);
      });

      // Assign cohort rank
      cohortGroups[key].forEach((item, index) => {
        item.cohortRank = index + 1;
      });
    });

    leaderboardEntries = entries.map((att) => ({
      userId: att.userId,
      userName: att.userName,
      userEmail: att.userEmail,
      userPhotoURL: att.userPhotoURL,
      userClass: att.userClass,
      userPreparation: att.userPreparation,
      rank: att.cohortRank,
      testsAttempted: 1,
      displayScore: `${att.score} / ${att.totalMarks}`,
      averageScore: Math.round(att.percentage || 0),
      accuracy: Math.round(att.accuracy || 0),
      timeTakenSeconds: att.timeTakenSeconds || 0,
      submittedAt: att.submittedAt,
      rawAttempt: att
    }));

  } else {
    // Aggregated Leaderboard Mode (Across All Tests)
    // Group all filtered attempts by userId
    const studentDataMap = {};
    filteredAttempts.forEach((att) => {
      if (!studentDataMap[att.userId]) {
        studentDataMap[att.userId] = {
          userId: att.userId,
          userName: att.userName,
          userEmail: att.userEmail,
          userPhotoURL: att.userPhotoURL,
          userClass: att.userClass || 'Class 11',
          userPreparation: att.userPreparation || 'Board',
          attempts: [],
          uniqueTests: new Set()
        };
      }
      studentDataMap[att.userId].attempts.push(att);
      studentDataMap[att.userId].uniqueTests.add(att.testId);
    });

    const entries = Object.values(studentDataMap).map((st) => {
      let totalScore = 0;
      let totalMaxMarks = 0;
      let totalAccuracy = 0;
      let totalTime = 0;
      let latestSubmittedAt = 0;

      st.attempts.forEach((att) => {
        totalScore += (att.score || 0);
        totalMaxMarks += (att.totalMarks || 0);
        totalAccuracy += (att.accuracy || 0);
        totalTime += (att.timeTakenSeconds || 0);
        if (att.submittedAt > latestSubmittedAt) {
          latestSubmittedAt = att.submittedAt;
        }
      });

      const attemptsCount = st.attempts.length;
      const avgScore = totalMaxMarks > 0 ? Math.round((totalScore / totalMaxMarks) * 100) : 0;
      const avgAccuracy = attemptsCount > 0 ? Math.round(totalAccuracy / attemptsCount) : 0;

      return {
        userId: st.userId,
        userName: st.userName,
        userEmail: st.userEmail,
        userPhotoURL: st.userPhotoURL,
        userClass: st.userClass,
        userPreparation: st.userPreparation,
        testsAttempted: st.uniqueTests.size,
        totalScore: totalScore,
        totalMaxMarks: totalMaxMarks,
        displayScore: `${totalScore} pts`,
        averageScore: avgScore,
        accuracy: avgAccuracy,
        timeTakenSeconds: totalTime,
        submittedAt: latestSubmittedAt,
        rawAttempt: st.attempts[0]
      };
    });

    // Group by Cohort: Class + Preparation
    const cohortGroups = {};
    entries.forEach((item) => {
      const cohortKey = `${item.userClass}_${item.userPreparation}`;
      if (!cohortGroups[cohortKey]) cohortGroups[cohortKey] = [];
      cohortGroups[cohortKey].push(item);
    });

    // Sort within each cohort group
    Object.keys(cohortGroups).forEach((key) => {
      cohortGroups[key].sort((a, b) => {
        // Priority 1: Higher score
        if (b.averageScore !== a.averageScore) return b.averageScore - a.averageScore;
        if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
        // Priority 2: Higher accuracy
        if (b.accuracy !== a.accuracy) return b.accuracy - a.accuracy;
        // Priority 3: Lower total time taken
        if (a.timeTakenSeconds !== b.timeTakenSeconds) return a.timeTakenSeconds - b.timeTakenSeconds;
        // Priority 4: Earlier submission
        return (a.submittedAt || 0) - (b.submittedAt || 0);
      });

      cohortGroups[key].forEach((item, index) => {
        item.rank = index + 1;
      });
    });

    leaderboardEntries = entries;
  }

  // Apply search query filter if typed
  if (leaderboardSearchQuery) {
    leaderboardEntries = leaderboardEntries.filter((item) => {
      const nameMatch = (item.userName || '').toLowerCase().includes(leaderboardSearchQuery);
      const emailMatch = (item.userEmail || '').toLowerCase().includes(leaderboardSearchQuery);
      return nameMatch || emailMatch;
    });
  }

  // Sort overall list by Rank ascending, then Class & Prep
  leaderboardEntries.sort((a, b) => {
    if (a.rank !== b.rank) return a.rank - b.rank;
    return (b.averageScore || 0) - (a.averageScore || 0);
  });

  // Update Badge
  if (badgeCount) {
    badgeCount.textContent = `${leaderboardEntries.length} Students Ranked`;
  }

  if (leaderboardEntries.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="10" style="text-align: center; padding: 48px 20px; color: var(--slate-400);">
          <i data-lucide="trophy" style="width: 42px; height: 42px; margin: 0 auto 12px; color: var(--slate-300); display: block;"></i>
          <h4 style="font-size: 15px; font-weight: 700; color: var(--slate-700); margin-bottom: 4px;">No ranking data found</h4>
          <p style="font-size: 13px; color: var(--slate-500);">Try resetting your filters or waiting for students to submit mock tests.</p>
        </td>
      </tr>
    `;
    if (window.lucide) lucide.createIcons();
    return;
  }

  tbody.innerHTML = leaderboardEntries.map((item) => {
    // Rank styling
    let rankBadge = `<span style="font-weight: 800; font-size: 13px; color: var(--slate-600);">#${item.rank}</span>`;
    if (item.rank === 1) {
      rankBadge = `<span style="display: inline-flex; align-items: center; justify-content: center; width: 30px; height: 30px; border-radius: 50%; background: #fef3c7; color: #b45309; font-weight: 800; font-size: 12px; border: 1.5px solid #fde68a; box-shadow: 0 1px 2px rgba(0,0,0,0.05);" title="Rank 1: Cohort Gold">🥇 1</span>`;
    } else if (item.rank === 2) {
      rankBadge = `<span style="display: inline-flex; align-items: center; justify-content: center; width: 30px; height: 30px; border-radius: 50%; background: #f1f5f9; color: #475569; font-weight: 800; font-size: 12px; border: 1.5px solid #cbd5e1; box-shadow: 0 1px 2px rgba(0,0,0,0.05);" title="Rank 2: Cohort Silver">🥈 2</span>`;
    } else if (item.rank === 3) {
      rankBadge = `<span style="display: inline-flex; align-items: center; justify-content: center; width: 30px; height: 30px; border-radius: 50%; background: #fff7ed; color: #c2410c; font-weight: 800; font-size: 12px; border: 1.5px solid #fed7aa; box-shadow: 0 1px 2px rgba(0,0,0,0.05);" title="Rank 3: Cohort Bronze">🥉 3</span>`;
    }

    // Avatar
    let avatarContent = (item.userName || item.userEmail || 'S').charAt(0).toUpperCase();
    if (item.userPhotoURL) {
      avatarContent = `<img src="${escapeHtml(item.userPhotoURL)}" alt="" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;" />`;
    }

    // Average Score Badge Color
    let avgColor = 'var(--emerald-600)';
    let avgBg = '#ecfdf5';
    if (item.averageScore < 50) {
      avgColor = 'var(--rose-600)';
      avgBg = '#fff1f2';
    } else if (item.averageScore < 75) {
      avgColor = 'var(--amber-600)';
      avgBg = '#fffbeb';
    }

    // Formatted time
    const totalSec = item.timeTakenSeconds || 0;
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    const formattedTime = totalSec > 0 ? `${mins}m ${secs}s` : '—';

    // Date
    const formattedDate = item.submittedAt ? new Date(item.submittedAt).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }) : '—';

    return `
      <tr>
        <td style="text-align: center;">${rankBadge}</td>
        <td>
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 32px; height: 32px; border-radius: 50%; background: var(--slate-200); color: var(--slate-700); font-size: 13px; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0; overflow: hidden;">
              ${avatarContent}
            </div>
            <div>
              <div style="font-weight: 700; color: var(--slate-900);">${escapeHtml(item.userName || 'Anonymous Student')}</div>
              <div style="font-size: 11px; color: var(--slate-500);">${escapeHtml(item.userEmail || '')}</div>
            </div>
          </div>
        </td>
        <td>
          <div style="display: flex; flex-wrap: wrap; gap: 4px;">
            <span class="badge-status" style="background: ${item.userClass === 'Class 12' ? '#f5f3ff' : '#eff6ff'}; color: ${item.userClass === 'Class 12' ? '#7c3aed' : '#2563eb'}; font-size: 11px;">
              ${escapeHtml(item.userClass || 'Class 11')}
            </span>
            <span class="badge-status" style="background: ${item.userPreparation === 'JEE' ? '#fff7ed' : '#f0fdf4'}; color: ${item.userPreparation === 'JEE' ? '#c2410c' : '#15803d'}; font-size: 11px;">
              ${escapeHtml(item.userPreparation || 'Board')}
            </span>
          </div>
        </td>
        <td style="text-align: center;">
          <span style="font-weight: 800; color: var(--slate-800);">${item.testsAttempted}</span>
          <span style="font-size: 11px; color: var(--slate-500); display: block;">${item.testsAttempted === 1 ? 'test' : 'tests'}</span>
        </td>
        <td style="text-align: right; font-weight: 800; color: var(--slate-900);">
          ${item.displayScore}
        </td>
        <td style="text-align: right;">
          <span class="badge-status" style="background: ${avgBg}; color: ${avgColor}; font-weight: 800;">
            ${item.averageScore}%
          </span>
        </td>
        <td style="text-align: right;">
          <span style="font-weight: 700; color: var(--slate-800);">${item.accuracy}%</span>
        </td>
        <td style="font-size: 12px; color: var(--slate-600);">${formattedTime}</td>
        <td style="font-size: 11.5px; color: var(--slate-500);">${formattedDate}</td>
        <td style="text-align: center;">
          <div style="display: flex; align-items: center; justify-content: center; gap: 6px;">
            ${item.rawAttempt ? `
              <button 
                type="button" 
                class="btn-secondary" 
                style="font-size: 11.5px; padding: 4px 8px;" 
                onclick="openAttemptDetailModal('${item.rawAttempt.testId}', '${item.userId}')"
                title="Review Answer Sheet"
              >
                <i data-lucide="eye" style="width: 12px; height: 12px;"></i>
                <span>Review</span>
              </button>
            ` : ''}
            <button 
              type="button" 
              class="btn-secondary" 
              style="font-size: 11.5px; padding: 4px 8px;" 
              onclick="viewStudentDetail('${item.userId}')"
              title="View Student Profile"
            >
              <i data-lucide="user" style="width: 12px; height: 12px;"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  if (window.lucide) {
    lucide.createIcons();
  }
};

// =========================================================================
// 5G. ATTENDANCE MANAGEMENT & LOGS (PART 7)
// =========================================================================

let allAttendanceDatesMap = {}; // Cache of all dates in attendance/{date}
let currentAttendanceDate = '';
let currentSavedAttendance = {}; // Records from attendance/{currentAttendanceDate}
let attendanceDraft = {}; // Map of userId -> 'present' | 'absent'
let isAttendanceDirty = false;

function getLocalDateString(d = new Date()) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function listenToAttendanceData() {
  const attendanceRef = db.ref('attendance');
  attendanceRef.on('value', (snapshot) => {
    allAttendanceDatesMap = snapshot.val() || {};
    const totalDates = Object.keys(allAttendanceDatesMap).length;
    if (attendanceBadgeCount) {
      attendanceBadgeCount.style.display = 'inline-block';
      attendanceBadgeCount.textContent = `${totalDates} Dates`;
    }

    // If currently viewing attendance and not dirty, refresh with latest
    if (activeModule === 'attendance' && !isAttendanceDirty && currentAttendanceDate) {
      currentSavedAttendance = allAttendanceDatesMap[currentAttendanceDate] || {};
      Object.keys(currentSavedAttendance).forEach((uid) => {
        attendanceDraft[uid] = currentSavedAttendance[uid].status;
      });
      renderAttendanceManagement();
    }
  });
}

window.initAttendanceModule = async function() {
  const dateInput = document.getElementById('attendance-date-input');
  if (!currentAttendanceDate) {
    currentAttendanceDate = getLocalDateString();
  }
  if (dateInput) {
    dateInput.value = currentAttendanceDate;
  }
  await loadAttendanceForDate(currentAttendanceDate);
};

async function loadAttendanceForDate(dateStr) {
  currentAttendanceDate = dateStr;
  const statusPill = document.getElementById('attendance-status-pill');
  if (statusPill) {
    statusPill.textContent = 'Loading...';
    statusPill.className = 'badge badge-pending';
  }

  try {
    const snap = await db.ref(`attendance/${dateStr}`).once('value');
    currentSavedAttendance = snap.val() || {};
    attendanceDraft = {};

    const savedKeys = Object.keys(currentSavedAttendance);
    if (savedKeys.length > 0) {
      savedKeys.forEach((uid) => {
        attendanceDraft[uid] = currentSavedAttendance[uid].status;
      });
      isAttendanceDirty = false;
      const presentCount = savedKeys.filter((uid) => currentSavedAttendance[uid].status === 'present').length;
      const absentCount = savedKeys.filter((uid) => currentSavedAttendance[uid].status === 'absent').length;
      if (statusPill) {
        statusPill.textContent = `Saved (${presentCount} Present, ${absentCount} Absent)`;
        statusPill.className = 'badge badge-completed';
      }
    } else {
      allStudentsList.forEach((s) => {
        attendanceDraft[s.uid] = 'present';
      });
      isAttendanceDirty = true;
      if (statusPill) {
        statusPill.textContent = 'Unsaved New Record';
        statusPill.className = 'badge badge-jee';
      }
    }
  } catch (error) {
    console.error('Error loading attendance for date:', error);
    showToast('Failed to load attendance records for selected date', 'error');
  }

  renderAttendanceManagement();
}

window.handleAttendanceDateChange = async function(newDate) {
  if (!newDate) return;
  if (isAttendanceDirty) {
    const confirmDiscard = confirm('You have unsaved attendance changes for the current date. Discard and switch date?');
    if (!confirmDiscard) {
      const dateInput = document.getElementById('attendance-date-input');
      if (dateInput) dateInput.value = currentAttendanceDate;
      return;
    }
  }
  await loadAttendanceForDate(newDate);
};

window.handleAttendanceFiltersChange = function() {
  renderAttendanceManagement();
};

window.reloadAttendanceForCurrentDate = async function() {
  if (!currentAttendanceDate) currentAttendanceDate = getLocalDateString();
  await loadAttendanceForDate(currentAttendanceDate);
  showToast('Attendance reloaded from database', 'info');
};

window.toggleStudentAttendanceStatus = function(userId, newStatus) {
  attendanceDraft[userId] = newStatus;
  isAttendanceDirty = true;
  const statusPill = document.getElementById('attendance-status-pill');
  if (statusPill) {
    statusPill.textContent = 'Unsaved Changes';
    statusPill.className = 'badge badge-jee';
  }
  renderAttendanceManagement();
};

window.markAllAttendance = function(targetStatus) {
  const visibleStudents = getFilteredAttendanceStudents();
  if (visibleStudents.length === 0) {
    showToast('No students matching current filter', 'info');
    return;
  }

  visibleStudents.forEach((s) => {
    attendanceDraft[s.uid] = targetStatus;
  });

  isAttendanceDirty = true;
  const statusPill = document.getElementById('attendance-status-pill');
  if (statusPill) {
    statusPill.textContent = 'Unsaved Changes';
    statusPill.className = 'badge badge-jee';
  }

  renderAttendanceManagement();
  showToast(`Marked ${visibleStudents.length} students as ${targetStatus}. Click "Save Attendance" to persist.`, 'info');
};

function getFilteredAttendanceStudents() {
  const classFilter = document.getElementById('attendance-filter-class')?.value || 'All';
  const prepFilter = document.getElementById('attendance-filter-prep')?.value || 'All';
  const search = (document.getElementById('attendance-student-search')?.value || '').toLowerCase().trim();

  return allStudentsList.filter((student) => {
    if (student.role === 'admin') return false;

    if (classFilter !== 'All') {
      const studentClass = student.class || '';
      if (classFilter === 'Dropper / Target') {
        if (!studentClass.includes('Dropper') && !studentClass.includes('Target')) return false;
      } else if (studentClass !== classFilter) {
        return false;
      }
    }

    if (prepFilter !== 'All') {
      const studentPrep = student.preparation || '';
      if (prepFilter === 'Both') {
        if (!studentPrep.toLowerCase().includes('both') && !(studentPrep.includes('Board') && studentPrep.includes('JEE'))) {
          return false;
        }
      } else if (!studentPrep.toLowerCase().includes(prepFilter.toLowerCase())) {
        return false;
      }
    }

    if (search) {
      const name = (student.name || '').toLowerCase();
      const email = (student.email || '').toLowerCase();
      const phone = (student.phone || '').toLowerCase();
      const roll = (student.rollNumber || '').toLowerCase();
      if (!name.includes(search) && !email.includes(search) && !phone.includes(search) && !roll.includes(search)) {
        return false;
      }
    }

    return true;
  });
}

function renderAttendanceManagement() {
  const visibleStudents = getFilteredAttendanceStudents();
  const tableBody = document.getElementById('attendance-table-body');
  const statPresent = document.getElementById('attendance-stat-present');
  const statAbsent = document.getElementById('attendance-stat-absent');
  const statTotal = document.getElementById('attendance-stat-total');
  const statPct = document.getElementById('attendance-stat-percentage');
  const lastSavedInfo = document.getElementById('attendance-last-saved-info');

  let presentCount = 0;
  let absentCount = 0;

  visibleStudents.forEach((student) => {
    const status = attendanceDraft[student.uid] || 'present';
    if (status === 'present') presentCount++;
    else absentCount++;
  });

  const totalCount = visibleStudents.length;
  const pct = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

  if (statPresent) statPresent.textContent = presentCount;
  if (statAbsent) statAbsent.textContent = absentCount;
  if (statTotal) statTotal.textContent = totalCount;
  if (statPct) statPct.textContent = `${pct}%`;

  if (lastSavedInfo) {
    if (isAttendanceDirty) {
      lastSavedInfo.innerHTML = `<span style="color: var(--amber-700); font-weight: 600;">Unsaved modifications</span> • Don't forget to click "Save Attendance"`;
    } else {
      const savedCount = Object.keys(currentSavedAttendance).length;
      if (savedCount > 0) {
        lastSavedInfo.innerHTML = `<span style="color: var(--emerald-700); font-weight: 600;">Saved in Firebase</span> • ${savedCount} records stored for ${currentAttendanceDate}`;
      } else {
        lastSavedInfo.textContent = `No attendance records recorded yet for ${currentAttendanceDate}`;
      }
    }
  }

  if (!tableBody) return;

  if (visibleStudents.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 40px; color: var(--slate-400);">
          <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
            <i data-lucide="users" style="width: 28px; height: 28px; color: var(--slate-300);"></i>
            <span>No students matched the selected class/stream filters.</span>
          </div>
        </td>
      </tr>
    `;
    if (window.lucide) lucide.createIcons();
    return;
  }

  tableBody.innerHTML = visibleStudents.map((student, index) => {
    const status = attendanceDraft[student.uid] || 'present';
    const savedRecord = currentSavedAttendance[student.uid];
    const isPresent = status === 'present';

    let recordMeta = '<span style="color: var(--slate-400); font-size: 11.5px;">Pending save</span>';
    if (savedRecord && savedRecord.markedAt) {
      const d = new Date(savedRecord.markedAt);
      const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      recordMeta = `
        <div style="font-size: 11.5px; color: var(--slate-600); line-height: 1.3;">
          <div>By: <strong>${escapeHtml(savedRecord.markedBy || 'Instructor')}</strong></div>
          <div style="color: var(--slate-400);">${timeStr}</div>
        </div>
      `;
    }

    const initials = (student.name || 'S')
      .split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

    const classBadge = student.class === 'Class 12' 
      ? 'badge-class12' 
      : student.class === 'Class 11' 
        ? 'badge-class11' 
        : 'badge-pending';

    const prepBadge = (student.preparation || '').includes('JEE') ? 'badge-jee' : 'badge-board';

    return `
      <tr style="${isPresent ? 'background: #ffffff;' : 'background: #fffafa;'}">
        <td style="text-align: center; font-size: 12px; color: var(--slate-400); font-weight: 600;">
          ${index + 1}
        </td>
        <td>
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 34px; height: 34px; border-radius: 50%; background: ${isPresent ? '#ecfdf5' : '#fff1f2'}; color: ${isPresent ? '#047857' : '#be123c'}; font-size: 12px; font-weight: 700; display: flex; align-items: center; justify-content: center; border: 1px solid ${isPresent ? '#a7f3d0' : '#fecdd3'};">
              ${initials}
            </div>
            <div>
              <div style="font-size: 13.5px; font-weight: 700; color: var(--slate-900);">
                ${escapeHtml(student.name || 'Unnamed Student')}
              </div>
              <div style="font-size: 11.5px; color: var(--slate-500);">
                ${escapeHtml(student.email || student.phone || 'No contact')}
              </div>
            </div>
          </div>
        </td>
        <td>
          <span class="badge ${classBadge}">${escapeHtml(student.class || 'Class 11')}</span>
        </td>
        <td>
          <span class="badge ${prepBadge}">${escapeHtml(student.preparation || 'Board')}</span>
        </td>
        <td style="text-align: center;">
          <div style="display: inline-flex; align-items: center; background: var(--slate-100); padding: 3px; border-radius: 8px; border: 1px solid var(--slate-200); gap: 2px;">
            <button 
              type="button" 
              onclick="toggleStudentAttendanceStatus('${student.uid}', 'present')"
              style="border: none; cursor: pointer; padding: 5px 14px; border-radius: 6px; font-size: 12px; font-weight: 700; display: flex; align-items: center; gap: 5px; transition: all 0.15s; ${
                isPresent 
                  ? 'background: #059669; color: #ffffff; box-shadow: 0 1px 3px rgba(0,0,0,0.1);' 
                  : 'background: transparent; color: var(--slate-600);'
              }"
            >
              <i data-lucide="check" style="width: 13px; height: 13px;"></i>
              <span>Present</span>
            </button>
            <button 
              type="button" 
              onclick="toggleStudentAttendanceStatus('${student.uid}', 'absent')"
              style="border: none; cursor: pointer; padding: 5px 14px; border-radius: 6px; font-size: 12px; font-weight: 700; display: flex; align-items: center; gap: 5px; transition: all 0.15s; ${
                !isPresent 
                  ? 'background: #e11d48; color: #ffffff; box-shadow: 0 1px 3px rgba(0,0,0,0.1);' 
                  : 'background: transparent; color: var(--slate-600);'
              }"
            >
              <i data-lucide="x" style="width: 13px; height: 13px;"></i>
              <span>Absent</span>
            </button>
          </div>
        </td>
        <td>
          ${recordMeta}
        </td>
        <td style="text-align: right;">
          <button 
            type="button" 
            class="btn-secondary" 
            style="font-size: 11.5px; padding: 4px 10px; display: inline-flex; align-items: center; gap: 4px;"
            onclick="viewStudentAttendanceHistory('${student.uid}')"
            title="View Attendance History"
          >
            <i data-lucide="history" style="width: 13px; height: 13px;"></i>
            <span>History</span>
          </button>
        </td>
      </tr>
    `;
  }).join('');

  if (window.lucide) lucide.createIcons();
}

window.saveCurrentDateAttendance = async function() {
  if (!currentAttendanceDate) {
    showToast('Please select a valid date first', 'error');
    return;
  }

  const saveBtn = document.getElementById('attendance-save-btn');
  const originalHtml = saveBtn ? saveBtn.innerHTML : '';
  if (saveBtn) {
    saveBtn.disabled = true;
    saveBtn.innerHTML = `<span class="spinner" style="width: 14px; height: 14px; border-width: 2px;"></span> Saving...`;
  }

  try {
    const studentsToSave = getFilteredAttendanceStudents();
    if (studentsToSave.length === 0) {
      showToast('No students to save in current batch', 'warning');
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.innerHTML = originalHtml;
      }
      return;
    }

    const updates = {};
    const now = Date.now();
    const adminName = currentAdminUser?.displayName || currentAdminUser?.email || 'Instructor';
    let presentCount = 0;
    let absentCount = 0;
    const presentUserIds = [];

    studentsToSave.forEach((student) => {
      const status = attendanceDraft[student.uid] || 'present';
      if (status === 'present') {
        presentCount++;
        presentUserIds.push(student.uid);
      } else {
        absentCount++;
      }

      updates[`attendance/${currentAttendanceDate}/${student.uid}`] = {
        status: status,
        class: student.class || 'Class 11',
        preparation: student.preparation || 'Board',
        markedAt: now,
        markedBy: adminName
      };
    });

    await db.ref().update(updates);

    // If marked present today, award streak and activity in background
    const todayStr = getLocalDateString();
    if (currentAttendanceDate === todayStr && presentUserIds.length > 0) {
      presentUserIds.forEach((uid) => {
        fetch('/api/gamification/activity', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: uid,
            activityType: 'attendance_present',
            metadata: { date: todayStr, role: 'classroom_attendance' }
          })
        }).catch((err) => console.warn('Gamification ping error:', err));
      });
    }

    isAttendanceDirty = false;
    currentSavedAttendance = { ...currentSavedAttendance, ...updates };

    const statusPill = document.getElementById('attendance-status-pill');
    if (statusPill) {
      statusPill.textContent = `Saved (${presentCount} Present, ${absentCount} Absent)`;
      statusPill.className = 'badge badge-completed';
    }

    showToast(`Attendance saved: ${presentCount} Present, ${absentCount} Absent for ${currentAttendanceDate}!`, 'success');
    renderAttendanceManagement();

  } catch (error) {
    console.error('Error saving attendance:', error);
    showToast('Failed to save attendance records. Check network or admin rules.', 'error');
  } finally {
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.innerHTML = originalHtml;
      if (window.lucide) lucide.createIcons();
    }
  }
};

window.viewStudentAttendanceHistory = async function(userId) {
  const student = allStudentsList.find((s) => s.uid === userId);
  const modal = document.getElementById('student-attendance-history-modal');
  const nameEl = document.getElementById('att-history-modal-student-name');
  const subEl = document.getElementById('att-history-modal-student-sub');
  const totalEl = document.getElementById('att-hist-total');
  const presentEl = document.getElementById('att-hist-present');
  const absentEl = document.getElementById('att-hist-absent');
  const pctEl = document.getElementById('att-hist-pct');
  const badgeEl = document.getElementById('att-hist-count-badge');
  const tbody = document.getElementById('att-history-table-body');

  if (nameEl) nameEl.textContent = `${student?.name || 'Student'} — Attendance Record`;
  if (subEl) subEl.textContent = `${student?.class || 'Class 11'} • ${student?.preparation || 'Board'} • ${student?.email || ''}`;

  if (tbody) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; padding: 24px; color: var(--slate-400);">
          Fetching student sessions...
        </td>
      </tr>
    `;
  }

  if (modal) modal.style.display = 'flex';

  try {
    let attTree = allAttendanceDatesMap;
    if (!attTree || Object.keys(attTree).length === 0) {
      const snap = await db.ref('attendance').once('value');
      attTree = snap.val() || {};
      allAttendanceDatesMap = attTree;
    }

    const historyItems = [];
    Object.keys(attTree).forEach((dateKey) => {
      const dayRecords = attTree[dateKey] || {};
      if (dayRecords[userId]) {
        historyItems.push({
          date: dateKey,
          ...dayRecords[userId]
        });
      }
    });

    historyItems.sort((a, b) => b.date.localeCompare(a.date));

    const totalSessions = historyItems.length;
    const presentDays = historyItems.filter((i) => i.status === 'present').length;
    const absentDays = historyItems.filter((i) => i.status === 'absent').length;
    const percentage = totalSessions > 0 ? Math.round((presentDays / totalSessions) * 100) : 0;

    if (totalEl) totalEl.textContent = totalSessions;
    if (presentEl) presentEl.textContent = presentDays;
    if (absentEl) absentEl.textContent = absentDays;
    if (pctEl) pctEl.textContent = `${percentage}%`;
    if (badgeEl) badgeEl.textContent = `${totalSessions} Sessions`;

    if (tbody) {
      if (historyItems.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="5" style="text-align: center; padding: 30px; color: var(--slate-400);">
              No attendance records recorded for this student yet.
            </td>
          </tr>
        `;
      } else {
        tbody.innerHTML = historyItems.map((item) => {
          const isPresent = item.status === 'present';
          let formattedTime = '—';
          if (item.markedAt) {
            const d = new Date(item.markedAt);
            formattedTime = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', ' + d.toLocaleDateString();
          }

          return `
            <tr>
              <td style="font-weight: 700; color: var(--slate-800); font-size: 13px;">
                ${item.date}
              </td>
              <td>
                <span class="badge ${isPresent ? 'badge-completed' : 'badge-pending'}" style="${isPresent ? 'background: #ecfdf5; color: #047857;' : 'background: #fff1f2; color: #be123c;'}">
                  ${isPresent ? 'Present' : 'Absent'}
                </span>
              </td>
              <td style="font-size: 12px; color: var(--slate-600);">
                ${escapeHtml(item.class || student?.class || 'Class 11')} (${escapeHtml(item.preparation || student?.preparation || 'Board')})
              </td>
              <td style="font-size: 12px; color: var(--slate-700); font-weight: 600;">
                ${escapeHtml(item.markedBy || 'Instructor')}
              </td>
              <td style="text-align: right; font-size: 11.5px; color: var(--slate-500);">
                ${formattedTime}
              </td>
            </tr>
          `;
        }).join('');
      }
    }
  } catch (err) {
    console.error('Error fetching student attendance history:', err);
    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; padding: 24px; color: var(--rose-600);">
            Failed to load attendance history records.
          </td>
        </tr>
      `;
    }
  }

  if (window.lucide) lucide.createIcons();
};

window.closeStudentAttendanceHistoryModal = function() {
  const modal = document.getElementById('student-attendance-history-modal');
  if (modal) modal.style.display = 'none';
};

// =========================================================================
// 6. NAVIGATION & ROUTING
// =========================================================================

window.navigateToModule = function(moduleName, displayName) {
  activeModule = moduleName;

  // Update active styling on sidebar items
  document.querySelectorAll('.nav-item').forEach((item) => {
    item.classList.remove('active');
  });
  const currentNav = document.getElementById(`nav-${moduleName}`);
  if (currentNav) {
    currentNav.classList.add('active');
  }

  // Update Header Title
  if (headerTitle) {
    headerTitle.textContent = displayName || 'Dashboard';
  }

  // Toggle Views
  if (dashboardView) dashboardView.style.display = 'none';
  if (studentsView) studentsView.style.display = 'none';
  if (bannersView) bannersView.style.display = 'none';
  if (booksView) booksView.style.display = 'none';
  if (homeworkView) homeworkView.style.display = 'none';
  if (testsView) testsView.style.display = 'none';
  if (attemptsView) attemptsView.style.display = 'none';
  if (leaderboardView) leaderboardView.style.display = 'none';
  if (attendanceView) attendanceView.style.display = 'none';
  if (comingSoonView) comingSoonView.style.display = 'none';

  if (moduleName === 'dashboard') {
    if (dashboardView) dashboardView.style.display = 'block';
  } else if (moduleName === 'students') {
    if (studentsView) studentsView.style.display = 'block';
    renderStudentsDirectoryTable();
  } else if (moduleName === 'banners') {
    if (bannersView) bannersView.style.display = 'block';
    renderBannersGrid();
  } else if (moduleName === 'books') {
    if (booksView) booksView.style.display = 'block';
    renderBooksGrid();
  } else if (moduleName === 'homework') {
    if (homeworkView) homeworkView.style.display = 'block';
    renderHomeworkGrid();
  } else if (moduleName === 'tests') {
    if (testsView) testsView.style.display = 'block';
    renderTestsGrid();
  } else if (moduleName === 'attempts') {
    if (attemptsView) attemptsView.style.display = 'block';
    renderAttemptsTable();
  } else if (moduleName === 'leaderboard') {
    if (leaderboardView) leaderboardView.style.display = 'block';
    renderLeaderboardSection();
  } else if (moduleName === 'attendance') {
    if (attendanceView) attendanceView.style.display = 'block';
    initAttendanceModule();
  } else {
    // Coming Soon Modules
    if (comingSoonView) {
      comingSoonView.style.display = 'block';
      if (comingSoonModuleName) {
        comingSoonModuleName.textContent = displayName || 'Module';
      }
    }
  }

  if (window.lucide) {
    lucide.createIcons();
  }
};

// Sign Out / Lock Admin Panel Handler
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    if (confirm("Lock the Admin Portal? You will need to enter code 061612 to re-enter.")) {
      sessionStorage.removeItem('prayatna_admin_passcode_verified');
      localStorage.removeItem('prayatna_admin_passcode_verified');
      if (adminDashboardApp) adminDashboardApp.style.display = 'none';
      if (adminPasscodeGate) adminPasscodeGate.style.display = 'flex';
      const input = document.getElementById('gate-passcode-input');
      if (input) {
        input.value = '';
        input.focus();
      }
      showToast("Admin portal locked. Enter code 061612 to unlock.", "info");
    }
  });
}

// Helper to escape HTML safely
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
