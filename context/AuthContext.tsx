'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { 
  User, 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail, 
  signOut, 
  onAuthStateChanged,
  getUserProfile,
  saveUserProfile,
  UserProfileData
} from '@/lib/firebase';

interface IntendedEnrollment {
  classLevel?: string;
  preparation?: string;
}

interface AuthContextType {
  user: User | null;
  userData: UserProfileData | null;
  loading: boolean;
  authModalOpen: boolean;
  authMode: 'login' | 'signup' | 'forgot';
  completeProfileOpen: boolean;
  intendedEnrollment: IntendedEnrollment | null;
  openAuthModal: (mode?: 'login' | 'signup' | 'forgot', intended?: IntendedEnrollment) => void;
  closeAuthModal: () => void;
  openCompleteProfile: () => void;
  closeCompleteProfile: () => void;
  clearIntendedEnrollment: () => void;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  signupWithEmail: (email: string, pass: string, name?: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserBio: (data: Partial<UserProfileData>) => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [completeProfileOpen, setCompleteProfileOpen] = useState<boolean>(false);
  const [intendedEnrollment, setIntendedEnrollment] = useState<IntendedEnrollment | null>(null);

  const fetchUserData = useCallback(async (uid: string, fallbackUser?: User) => {
    try {
      let profile = await getUserProfile(uid);
      if (!profile && fallbackUser) {
        // Automatically create initial profile
        await saveUserProfile(uid, {
          uid,
          name: fallbackUser.displayName || '',
          email: fallbackUser.email || '',
          photoURL: fallbackUser.photoURL || '',
          phone: '',
          class: '',
          preparation: '',
          role: 'student',
          profileCompleted: false
        });
        profile = await getUserProfile(uid);
      }
      setUserData(profile);

      // If user profile is not completed, trigger Complete Profile modal
      if (profile && !profile.profileCompleted) {
        setCompleteProfileOpen(true);
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await fetchUserData(currentUser.uid, currentUser);
      } else {
        setUserData(null);
        setCompleteProfileOpen(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [fetchUserData]);

  const openAuthModal = (mode: 'login' | 'signup' | 'forgot' = 'login', intended?: IntendedEnrollment) => {
    setAuthMode(mode);
    if (intended) {
      setIntendedEnrollment(intended);
    }
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  const openCompleteProfile = () => {
    setCompleteProfileOpen(true);
  };

  const closeCompleteProfile = () => {
    setCompleteProfileOpen(false);
  };

  const clearIntendedEnrollment = () => {
    setIntendedEnrollment(null);
  };

  const loginWithEmail = async (email: string, pass: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    if (intendedEnrollment?.classLevel && intendedEnrollment?.preparation) {
      await saveUserProfile(cred.user.uid, {
        class: intendedEnrollment.classLevel,
        preparation: intendedEnrollment.preparation,
        updatedAt: Date.now()
      });
      setIntendedEnrollment(null);
    }
    await fetchUserData(cred.user.uid, cred.user);
    setAuthModalOpen(false);
  };

  const signupWithEmail = async (email: string, pass: string, name?: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    // Initialize profile in RTDB
    await saveUserProfile(cred.user.uid, {
      uid: cred.user.uid,
      name: name || '',
      email: cred.user.email || '',
      photoURL: '',
      phone: '',
      class: intendedEnrollment?.classLevel || '',
      preparation: intendedEnrollment?.preparation || '',
      role: 'student',
      profileCompleted: false
    });
    setIntendedEnrollment(null);
    await fetchUserData(cred.user.uid, cred.user);
    setAuthModalOpen(false);
    setCompleteProfileOpen(true);
  };

  const loginWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    const currentUser = result.user;
    let profile = await getUserProfile(currentUser.uid);
    if (!profile) {
      await saveUserProfile(currentUser.uid, {
        uid: currentUser.uid,
        name: currentUser.displayName || '',
        email: currentUser.email || '',
        photoURL: currentUser.photoURL || '',
        phone: '',
        class: intendedEnrollment?.classLevel || '',
        preparation: intendedEnrollment?.preparation || '',
        role: 'student',
        profileCompleted: false
      });
      setIntendedEnrollment(null);
      profile = await getUserProfile(currentUser.uid);
      setUserData(profile);
      setCompleteProfileOpen(true);
    } else {
      if (intendedEnrollment?.classLevel && intendedEnrollment?.preparation) {
        await saveUserProfile(currentUser.uid, {
          class: intendedEnrollment.classLevel,
          preparation: intendedEnrollment.preparation,
          updatedAt: Date.now()
        });
        setIntendedEnrollment(null);
        profile = await getUserProfile(currentUser.uid);
      }
      setUserData(profile);
      if (!profile?.profileCompleted) {
        setCompleteProfileOpen(true);
      }
    }
    setAuthModalOpen(false);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setUserData(null);
    setCompleteProfileOpen(false);
  };

  const updateUserBio = async (data: Partial<UserProfileData>) => {
    if (!user) throw new Error('User not authenticated');
    // Ensure role cannot be altered by user
    const safeData = { ...data };
    delete (safeData as any).role;
    delete (safeData as any).uid;

    await saveUserProfile(user.uid, safeData);
    await fetchUserData(user.uid, user);
  };

  const refreshUserData = async () => {
    if (user) {
      await fetchUserData(user.uid, user);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userData,
        loading,
        authModalOpen,
        authMode,
        completeProfileOpen,
        intendedEnrollment,
        openAuthModal,
        closeAuthModal,
        openCompleteProfile,
        closeCompleteProfile,
        clearIntendedEnrollment,
        loginWithEmail,
        signupWithEmail,
        loginWithGoogle,
        resetPassword,
        logout,
        updateUserBio,
        refreshUserData
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
