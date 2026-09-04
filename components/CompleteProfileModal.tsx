'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { uploadToImgBB } from '@/lib/imgbb';
import { 
  Camera, 
  UploadCloud, 
  Check, 
  AlertCircle, 
  User, 
  Phone, 
  GraduationCap, 
  Loader2,
  X
} from 'lucide-react';

interface FormProps {
  initialName: string;
  initialPhone: string;
  initialClass: 'Class 11' | 'Class 12' | '';
  initialPrep: 'Board' | 'JEE' | '';
  initialPhotoURL: string;
  onSave: (data: {
    name: string;
    phone: string;
    class: string;
    preparation: string;
    photoURL: string;
  }) => Promise<void>;
}

function InnerCompleteProfileForm({
  initialName,
  initialPhone,
  initialClass,
  initialPrep,
  initialPhotoURL,
  onSave
}: FormProps) {
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [classLevel, setClassLevel] = useState<'Class 11' | 'Class 12' | ''>(initialClass);
  const [preparation, setPreparation] = useState<'Board' | 'JEE' | ''>(initialPrep);
  const [photoURL, setPhotoURL] = useState(initialPhotoURL);
  
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setErrorMessage(null);
    try {
      const res = await uploadToImgBB(file);
      setPhotoURL(res.displayUrl);
    } catch (err: any) {
      console.error("ImgBB upload error:", err);
      setErrorMessage(err.message || "Failed to upload image. Please try again.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

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
      setErrorMessage("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (!classLevel) {
      setErrorMessage("Please select your class (Class 11 or Class 12).");
      return;
    }

    if (!preparation) {
      setErrorMessage("Please select your preparation goal (Board or JEE).");
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
    } catch (err: any) {
      console.error("Profile update error:", err);
      setErrorMessage(err.message || "Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-5">
      {errorMessage && (
        <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-700">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Profile Picture Upload via ImgBB */}
      <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
        <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-indigo-200 bg-white shrink-0 flex items-center justify-center shadow-inner">
          {photoURL ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img 
              src={photoURL} 
              alt="Profile Preview" 
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-10 h-10 text-slate-300" />
          )}
          {uploadingImage && (
            <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center text-white">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          )}
        </div>

        <div className="flex-1 text-center sm:text-left">
          <h4 className="text-sm font-semibold text-slate-800 mb-1">Student Profile Photo</h4>
          <p className="text-xs text-slate-500 mb-2">Upload a clear passport photo or portrait (Max 16MB)</p>
          
          <label 
            id="profile-image-upload-label"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-xs cursor-pointer transition-all"
          >
            <UploadCloud className="w-3.5 h-3.5 text-indigo-600" />
            <span>{uploadingImage ? 'Uploading to ImgBB...' : 'Choose Photo'}</span>
            <input 
              type="file" 
              accept="image/*" 
              disabled={uploadingImage}
              onChange={handleImageFileChange} 
              className="hidden" 
            />
          </label>
        </div>
      </div>

      {/* Full Name */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Full Name <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
          <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="profile-name-input"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Rahul Sharma"
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Mobile Number */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Mobile Number <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
          <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="profile-phone-input"
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="10-digit mobile number"
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 placeholder:text-slate-400"
          />
        </div>
        <p className="text-[11px] text-slate-400 mt-1">Used for batch updates and academic alerts.</p>
      </div>

      {/* Class Selection (Class 11 / Class 12) */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
          Current Class <span className="text-rose-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            id="profile-class-11-btn"
            onClick={() => setClassLevel('Class 11')}
            className={`py-2.5 px-4 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
              classLevel === 'Class 11'
                ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-xs ring-1 ring-indigo-600'
                : 'border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {classLevel === 'Class 11' && <Check className="w-4 h-4 text-indigo-600" />}
            <span>Class 11</span>
          </button>

          <button
            type="button"
            id="profile-class-12-btn"
            onClick={() => setClassLevel('Class 12')}
            className={`py-2.5 px-4 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
              classLevel === 'Class 12'
                ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-xs ring-1 ring-indigo-600'
                : 'border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {classLevel === 'Class 12' && <Check className="w-4 h-4 text-indigo-600" />}
            <span>Class 12</span>
          </button>
        </div>
      </div>

      {/* Preparation Goal (Board / JEE) */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
          Preparation Goal <span className="text-rose-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            id="profile-prep-board-btn"
            onClick={() => setPreparation('Board')}
            className={`py-2.5 px-4 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
              preparation === 'Board'
                ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-xs ring-1 ring-indigo-600'
                : 'border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {preparation === 'Board' && <Check className="w-4 h-4 text-indigo-600" />}
            <span>Board Exams</span>
          </button>

          <button
            type="button"
            id="profile-prep-jee-btn"
            onClick={() => setPreparation('JEE')}
            className={`py-2.5 px-4 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
              preparation === 'JEE'
                ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-xs ring-1 ring-indigo-600'
                : 'border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {preparation === 'JEE' && <Check className="w-4 h-4 text-indigo-600" />}
            <span>JEE (Main & Adv)</span>
          </button>
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-2">
        <button
          id="profile-submit-btn"
          type="submit"
          disabled={saving || uploadingImage}
          className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-sm shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving Profile...</span>
            </>
          ) : (
            <>
              <span>Save & Complete Profile</span>
              <Check className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}

export default function CompleteProfileModal() {
  const { 
    user, 
    userData, 
    completeProfileOpen, 
    closeCompleteProfile, 
    updateUserBio,
    intendedEnrollment 
  } = useAuth();

  if (!completeProfileOpen || !user) return null;

  const initialName = userData?.name || user.displayName || '';
  const initialPhone = userData?.phone || '';
  const initialClass = ((userData?.class as 'Class 11' | 'Class 12') || (intendedEnrollment?.classLevel as 'Class 11' | 'Class 12') || 'Class 11');
  const initialPrep = ((userData?.preparation as 'Board' | 'JEE') || (intendedEnrollment?.preparation as 'Board' | 'JEE') || 'JEE');
  const initialPhotoURL = userData?.photoURL || user.photoURL || '';

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
    closeCompleteProfile();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div 
        id="complete-profile-modal"
        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Complete Your Profile</h3>
              <p className="text-xs text-slate-500">Provide your student details to customize your coaching experience</p>
            </div>
          </div>
          {userData?.profileCompleted && (
            <button 
              onClick={closeCompleteProfile}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Inner Form with key for fresh initial values */}
        <InnerCompleteProfileForm 
          key={user.uid + (userData?.updatedAt || 0)}
          initialName={initialName}
          initialPhone={initialPhone}
          initialClass={initialClass}
          initialPrep={initialPrep}
          initialPhotoURL={initialPhotoURL}
          onSave={handleSaveData}
        />
      </div>
    </div>
  );
}
