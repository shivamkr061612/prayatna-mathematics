import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail, 
  signOut,
  onAuthStateChanged,
  User
} from "firebase/auth";
import { 
  getDatabase, 
  ref, 
  set, 
  get, 
  update, 
  onValue, 
  child,
  serverTimestamp
} from "firebase/database";

export const firebaseConfig = {
  apiKey: "AIzaSyA6Iy_AKHhaIwnZxW1C-r9-OBzGfAtNdH4",
  authDomain: "tech-shivam-f8e82.firebaseapp.com",
  databaseURL: "https://tech-shivam-f8e82-default-rtdb.firebaseio.com",
  projectId: "tech-shivam-f8e82",
  storageBucket: "tech-shivam-f8e82.firebasestorage.app",
  messagingSenderId: "586258718080",
  appId: "1:586258718080:web:030cbb73b2c808f56ef565",
  measurementId: "G-4BR76H7P73"
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);
export const googleProvider = new GoogleAuthProvider();

export interface UserProfileData {
  uid: string;
  name: string;
  email: string;
  photoURL: string;
  phone: string;
  class: string; // "Class 11" | "Class 12" | ""
  preparation: string; // "Board" | "JEE" | ""
  role: "student" | "admin";
  profileCompleted: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface BannerData {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  buttonText: string;
  buttonLink: string;
  phone?: string;
  active: boolean;
  order: number;
  createdAt: number;
  updatedAt?: number;
}

export interface BookData {
  id: string;
  name: string;
  imageUrl?: string;
  description: string;
  author?: string;
  class: 'Class 11' | 'Class 12';
  preparation: 'Board' | 'JEE';
  pdfUrl: string;
  active: boolean;
  createdAt: number;
  updatedAt?: number;
}

export interface HomeworkData {
  id: string;
  title: string;
  description: string;
  images?: string[];
  class: 'Class 11' | 'Class 12';
  preparation: 'Board' | 'JEE';
  assignedDate: string;
  deadline: string;
  attachmentUrl?: string;
  active: boolean;
  createdAt: number;
  updatedAt?: number;
}

export interface HomeworkProgressData {
  status: 'Completed';
  completedAt: number;
}

export interface QuestionData {
  id: string;
  questionText: string;
  imageUrl?: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer?: 'A' | 'B' | 'C' | 'D'; // Optional on client during test
  marks: number;
  negativeMarks: number;
}

export interface TestData {
  id: string;
  title: string;
  description: string;
  class: 'Class 11' | 'Class 12';
  preparation: 'Board' | 'JEE';
  duration: number; // in minutes
  totalMarks: number;
  marksPerQuestion: number;
  negativeMark: number;
  startTime?: string;
  endTime?: string;
  active: boolean;
  allowMultipleAttempts?: boolean;
  questions?: Record<string, QuestionData>;
  questionsCount?: number;
  createdAt: number;
  updatedAt?: number;
}

export interface TestAttemptData {
  testId: string;
  testTitle?: string;
  userId: string;
  studentName?: string;
  studentEmail?: string;
  studentClass?: string;
  studentPreparation?: string;
  userName?: string;
  userEmail?: string;
  userClass?: string;
  userPreparation?: string;
  userPhotoURL?: string;
  answers: Record<string, 'A' | 'B' | 'C' | 'D'>;
  score: number;
  totalMarks: number;
  percentage: number;
  correct: number;
  wrong: number;
  unanswered: number;
  accuracy: number;
  timeTaken: number; // in seconds
  timeTakenSeconds?: number;
  submittedAt: number;
  status: 'Completed';
  questionBreakdown?: Array<{
    questionId: string;
    questionText: string;
    imageUrl?: string;
    options?: {
      A: string;
      B: string;
      C: string;
      D: string;
    };
    userAnswer?: string | null;
    correctAnswer: string;
    isCorrect: boolean;
    marksAwarded: number;
  }>;
}

// Attendance record schema for attendance/{date}/{userId}
export interface AttendanceRecord {
  status: 'present' | 'absent';
  class: string;
  preparation: string;
  markedAt: number;
  markedBy: string;
  userName?: string;
  userEmail?: string;
}

// Streak schema for streaks/{userId}
export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string; // YYYY-MM-DD
  updatedAt?: number;
}

// XP schema for xp/{userId}
export interface UserXPData {
  totalXP: number;
  updatedAt: number;
}

// Achievement record schema for achievements/{userId}/{achievementId}
export interface UserAchievementRecord {
  unlockedAt: number;
}

// Known admin emails for bootstrapping security
export const ADMIN_EMAILS = [
  "techshivam0616@gmail.com",
  "admin@prayatna.com"
];

// Read user profile from RTDB
export async function getUserProfile(uid: string): Promise<UserProfileData | null> {
  try {
    const userRef = ref(database, `users/${uid}`);
    const snapshot = await get(userRef);
    if (snapshot.exists()) {
      return snapshot.val() as UserProfileData;
    }
    return null;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
}

// Save or update user profile with strict role protection
export async function saveUserProfile(
  uid: string, 
  data: Partial<UserProfileData>, 
  initialRoleIfNew: "student" | "admin" = "student"
): Promise<void> {
  const userRef = ref(database, `users/${uid}`);
  const existingSnap = await get(userRef);
  const now = Date.now();

  if (existingSnap.exists()) {
    const existing = existingSnap.val() as UserProfileData;
    // CRITICAL: User must NOT be able to change their role
    const updateData: Partial<UserProfileData> = {
      ...data,
      uid,
      role: existing.role || "student", // preserve existing role
      updatedAt: now
    };
    // Don't overwrite createdAt
    if (data.createdAt) {
      delete (updateData as any).createdAt;
    }
    await update(userRef, updateData);
  } else {
    // Initial profile creation
    // Automatically grant admin role if email matches known admin email list
    const roleToAssign = (data.email && ADMIN_EMAILS.includes(data.email.toLowerCase())) 
      ? "admin" 
      : initialRoleIfNew;

    const newProfile: UserProfileData = {
      uid,
      name: data.name || "",
      email: data.email || "",
      photoURL: data.photoURL || "",
      phone: data.phone || "",
      class: data.class || "",
      preparation: data.preparation || "",
      role: roleToAssign,
      profileCompleted: Boolean(data.profileCompleted),
      createdAt: now,
      updatedAt: now
    };
    await set(userRef, newProfile);
  }
}

export {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged
};
export type { User };
