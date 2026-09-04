'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import AuthModal from '@/components/AuthModal';
import CompleteProfileModal from '@/components/CompleteProfileModal';
import GamificationSection from '@/components/GamificationSection';
import BottomNav from '@/components/BottomNav';
import { useAuth } from '@/context/AuthContext';
import { uploadToImgBB } from '@/lib/imgbb';
import { 
  User, 
  Mail, 
  Phone, 
  GraduationCap, 
  Award, 
  Calendar, 
  Shield, 
  Camera, 
  Check, 
  ArrowLeft, 
  Loader2, 
  AlertCircle,
  Clock
} from 'lucide-react';

interface ProfileFormProps {
  initialName: string;
  initialPhone: string;
  initialClass: 'Class 11' | 'Class 12' | '';
  initialPrep: 'Board' | 'JEE' | '';
  initialPhotoURL: string;
  email: string;
  role: string;
  createdAt: number;
  updatedAt: number;
  onSave: (data: {
    name: string;
    phone: string;
    class: string;
    preparation: string;
    photoURL: string;
  }) => Promise<void>;
}

function InnerProfileView({
  initialName,
  initialPhone,
  initialClass,
  initialPrep,
  initialPhotoURL,
  email,
  role,
  createdAt,
  updatedAt,
  onSave
}: ProfileFormProps) {
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [classLevel, setClassLevel] = useState<'Class 11' | 'Class 12' | ''>(initialClass);
  const [preparation, setPreparation] = useState<'Board' | 'JEE' | ''>(initialPrep);
  const [photoURL, setPhotoURL] = useState(initialPhotoURL);
  
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const res = await uploadToImgBB(file);
      setPhotoURL(res.displayUrl);
      setSuccessMessage("Photo uploaded to ImgBB successfully. Click Save Changes to apply.");
    } catch (err: any) {
      console.error("ImgBB upload error:", err);
      setErrorMessage(err.message || "Failed to upload image. Please try again.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!name.trim()) {
      setErrorMessage("Please enter your full name.");
      return;
    }

    if (!phone.trim()) {
      setErrorMessage("Please enter your mobile phone number.");
      return;
    }

    const digits = phone.replace(/\D/g, '');
    if (digits.length < 10) {
      setErrorMessage("Mobile number should have at least 10 digits.");
      return;
    }

    setSaving(true);
    try {
      await onSave({
        name: name.trim(),
        phone: phone.trim(),
        class: classLevel,
        preparation: preparation,
        photoURL: photoURL || '',
      });
      setSuccessMessage("Your profile information has been successfully updated!");
    } catch (err: any) {
      console.error("Save profile error:", err);
      setErrorMessage(err.message || "Failed to save profile changes.");
    } finally {
      setSaving(false);
    }
  };

  const createdAtFormatted = createdAt 
    ? new Date(createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Recently';

  const updatedAtFormatted = updatedAt 
    ? new Date(updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Recently';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column: Profile Card & Overview */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm text-center">
          
          {/* Avatar with ImgBB upload trigger */}
          <div className="relative w-28 h-28 mx-auto rounded-full overflow-hidden border-4 border-indigo-100 shadow-md bg-slate-100 flex items-center justify-center group mb-4">
            {photoURL ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={photoURL} alt={name || 'Student'} className="w-full h-full object-cover" />
            ) : (
              <User className="w-14 h-14 text-slate-300" />
            )}
            
            {uploadingImage && (
              <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center text-white">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            )}

            <label 
              id="avatar-upload-overlay"
              className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[11px] font-semibold cursor-pointer"
            >
              <Camera className="w-5 h-5 mb-1" />
              <span>Change</span>
              <input 
                type="file" 
                accept="image/*" 
                disabled={uploadingImage}
                onChange={handleImageFileChange} 
                className="hidden" 
              />
            </label>
          </div>

          <h2 className="text-xl font-bold text-slate-900">{name || 'Student Name'}</h2>
          <p className="text-xs text-slate-500 truncate mt-0.5">{email}</p>

          {/* Status Badge */}
          <div className="mt-4 pt-4 border-t border-slate-100 flex justify-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
              {classLevel || 'Class Pending'}
            </span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
              {preparation ? `Target: ${preparation}` : 'Target Pending'}
            </span>
          </div>

          {/* Account Metadata */}
          <div className="mt-5 text-left text-xs text-slate-500 space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-600">
                <Calendar className="w-3.5 h-3.5" /> Enrolled Since
              </span>
              <span className="font-medium text-slate-800">{createdAtFormatted}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-600">
                <Clock className="w-3.5 h-3.5" /> Last Updated
              </span>
              <span className="font-medium text-slate-800">{updatedAtFormatted}</span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
              <span className="flex items-center gap-1.5 text-slate-600">
                <Shield className="w-3.5 h-3.5" /> User Role
              </span>
              <span className="font-bold text-indigo-700 uppercase">{role || 'student'} (Locked)</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 mt-3 text-center">
            User roles are system-protected and cannot be self-modified.
          </p>
        </div>
      </div>

      {/* Right Column: Edit Profile Form */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-slate-100">
            <GraduationCap className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-bold text-slate-900">Personal & Academic Details</h3>
          </div>

          {successMessage && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm flex items-center gap-2.5 animate-in fade-in">
              <Check className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-6">
            
            {/* Full Name & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="profile-page-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                    placeholder="Your full name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Email Address <span className="text-xs text-slate-400 font-normal">(Read-only)</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    disabled
                    value={email}
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Mobile Phone Number <span className="text-rose-500">*</span>
              </label>
              <div className="relative max-w-md">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="profile-page-phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="10-digit mobile number"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                />
              </div>
              <p className="text-xs text-slate-400 mt-1">Used for class SMS notices and student verification.</p>
            </div>

            {/* Class Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Enrolled Class Level
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  id="profile-page-class-11"
                  onClick={() => setClassLevel('Class 11')}
                  className={`p-4 rounded-xl border text-sm font-semibold flex items-center justify-between transition-all ${
                    classLevel === 'Class 11'
                      ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700 ring-1 ring-indigo-600'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="text-left">
                    <div className="font-bold">Class 11</div>
                    <div className="text-xs text-slate-500 font-normal">Foundation & Algebra</div>
                  </div>
                  {classLevel === 'Class 11' && <Check className="w-5 h-5 text-indigo-600" />}
                </button>

                <button
                  type="button"
                  id="profile-page-class-12"
                  onClick={() => setClassLevel('Class 12')}
                  className={`p-4 rounded-xl border text-sm font-semibold flex items-center justify-between transition-all ${
                    classLevel === 'Class 12'
                      ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700 ring-1 ring-indigo-600'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="text-left">
                    <div className="font-bold">Class 12</div>
                    <div className="text-xs text-slate-500 font-normal">Calculus & Target Prep</div>
                  </div>
                  {classLevel === 'Class 12' && <Check className="w-5 h-5 text-indigo-600" />}
                </button>
              </div>
            </div>

            {/* Preparation Goal */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Target Examination
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  id="profile-page-prep-board"
                  onClick={() => setPreparation('Board')}
                  className={`p-4 rounded-xl border text-sm font-semibold flex items-center justify-between transition-all ${
                    preparation === 'Board'
                      ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700 ring-1 ring-indigo-600'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="text-left">
                    <div className="font-bold">Board Exams</div>
                    <div className="text-xs text-slate-500 font-normal">CBSE / State Curriculum</div>
                  </div>
                  {preparation === 'Board' && <Check className="w-5 h-5 text-indigo-600" />}
                </button>

                <button
                  type="button"
                  id="profile-page-prep-jee"
                  onClick={() => setPreparation('JEE')}
                  className={`p-4 rounded-xl border text-sm font-semibold flex items-center justify-between transition-all ${
                    preparation === 'JEE'
                      ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700 ring-1 ring-indigo-600'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="text-left">
                    <div className="font-bold">JEE (Main & Advanced)</div>
                    <div className="text-xs text-slate-500 font-normal">Engineering Competitive</div>
                  </div>
                  {preparation === 'JEE' && <Check className="w-5 h-5 text-indigo-600" />}
                </button>
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-4">
              <Link
                href="/"
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 rounded-lg"
              >
                Cancel
              </Link>

              <button
                id="profile-save-btn"
                type="submit"
                disabled={saving || uploadingImage}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-sm shadow-sm shadow-indigo-200 transition-all disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <span>Save Changes</span>
                    <Check className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user, userData, loading, updateUserBio, openAuthModal } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-600">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
          <span className="text-sm font-medium">Loading profile...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-8 rounded-2xl shadow-sm border border-slate-200 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
              <User className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Sign in to Access Profile</h2>
            <p className="text-sm text-slate-600">
              Please sign in with your student credentials to view and manage your enrolled batches and personal information.
            </p>
            <button
              onClick={() => openAuthModal('login')}
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition-colors shadow-sm"
            >
              Sign In Now
            </button>
          </div>
        </main>
        <BottomNav />
        <AuthModal />
        <CompleteProfileModal />
      </div>
    );
  }

  const initialName = userData?.name || user.displayName || '';
  const initialPhone = userData?.phone || '';
  const initialClass = (userData?.class as 'Class 11' | 'Class 12') || '';
  const initialPrep = (userData?.preparation as 'Board' | 'JEE') || '';
  const initialPhotoURL = userData?.photoURL || user.photoURL || '';
  const role = userData?.role || 'student';
  const createdAt = userData?.createdAt || 0;
  const updatedAt = userData?.updatedAt || 0;

  const handleSaveData = async (data: {
    name: string;
    phone: string;
    class: string;
    preparation: string;
    photoURL: string;
  }) => {
    await updateUserBio({
      ...data,
      profileCompleted: true,
      updatedAt: Date.now()
    });
    if (data.class && data.preparation) {
      try {
        localStorage.setItem('prayatna_enrolled', JSON.stringify({
          class: data.class,
          preparation: data.preparation
        }));
      } catch (e) {
        console.warn("Could not save enrolled to localStorage", e);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 pb-24 sm:pb-28">
        
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>

          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-200 text-slate-700 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-slate-500" />
            Role: <span className="uppercase text-indigo-700 font-bold">{role}</span>
          </span>
        </div>

        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Student Profile & Settings
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Manage your personal coaching records, active target batch, and contact details.
          </p>
        </div>

        <InnerProfileView
          key={user.uid + (userData?.updatedAt || 0)}
          initialName={initialName}
          initialPhone={initialPhone}
          initialClass={initialClass}
          initialPrep={initialPrep}
          initialPhotoURL={initialPhotoURL}
          email={user.email || ''}
          role={role}
          createdAt={createdAt}
          updatedAt={updatedAt}
          onSave={handleSaveData}
        />

        {/* Gamification, Streak & Achievements */}
        <div className="mt-10">
          <GamificationSection />
        </div>
      </main>

      <BottomNav />
      <AuthModal />
      <CompleteProfileModal />
    </div>
  );
}
