"use client";

import { useEffect, useState } from "react";

export type TeacherProfile = {
  fullName: string;
  email: string;
  phone: string;
  institution: string;
  department: string;
  specialty: string;
  grade: string;
  bio: string;
  language: string;
  avatarBase64: string;
};

const PROFILE_KEY = "oraleval_profile";

export const DEFAULT_PROFILE: TeacherProfile = {
  fullName: "Professeur",
  email: "",
  phone: "",
  institution: "",
  department: "",
  specialty: "Français langue étrangère",
  grade: "",
  bio: "",
  language: "Français",
  avatarBase64: "",
};

import { getCurrentUser } from "./authStorage";

export function getProfile(): TeacherProfile {
  if (typeof window === "undefined") return DEFAULT_PROFILE;

  // Prefer data from the current authenticated user session
  const currentUser = getCurrentUser();
  
  try {
    const data = localStorage.getItem(PROFILE_KEY);
    const localProfile = data ? JSON.parse(data) : {};

    // Merge: DEFAULT < Local Storage < Current User session
    return {
      ...DEFAULT_PROFILE,
      ...localProfile,
      fullName: currentUser?.fullName || localProfile.fullName || DEFAULT_PROFILE.fullName,
      email: currentUser?.email || localProfile.email || DEFAULT_PROFILE.email,
      institution: currentUser?.institution || localProfile.institution || DEFAULT_PROFILE.institution,
      department: currentUser?.department || localProfile.department || DEFAULT_PROFILE.department,
      specialty: currentUser?.specialty || localProfile.specialty || DEFAULT_PROFILE.specialty,
    };
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function saveProfile(profile: TeacherProfile) {
  if (typeof window === "undefined") return;

  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  window.dispatchEvent(new Event("profileUpdated"));
}

export function useProfile() {
  const [profile, setProfile] = useState<TeacherProfile>(DEFAULT_PROFILE);

  useEffect(() => {
    setProfile(getProfile());

    const handler = () => {
      setProfile(getProfile());
    };

    window.addEventListener("profileUpdated", handler);
    window.addEventListener("storage", handler);

    return () => {
      window.removeEventListener("profileUpdated", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  return {
    profile,
    saveProfile,
  };
}