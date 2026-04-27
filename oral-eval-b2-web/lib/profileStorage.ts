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

export function getProfile(): TeacherProfile {
  if (typeof window === "undefined") return DEFAULT_PROFILE;

  try {
    const data = localStorage.getItem(PROFILE_KEY);

    if (!data) return DEFAULT_PROFILE;

    return {
      ...DEFAULT_PROFILE,
      ...JSON.parse(data),
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