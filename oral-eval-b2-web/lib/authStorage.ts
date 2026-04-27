"use client";

import React from "react";

export type UserRole = "teacher" | "student";

export interface UserAccount {
  id: string;
  fullName: string;
  email: string;
  password: string; // Simulated: plain text for now as per user request (frontend only)
  role: UserRole;
  // Role-specific fields
  institution?: string;
  department?: string;
  specialty?: string;
  studentId?: string;
  classCode?: string;
}

export interface AuthSession {
  user: UserAccount;
  loginTime: number;
}

const USERS_KEY = "oraleval_users";
const SESSION_KEY = "oraleval_currentUser";

export function getAllUsers(): UserAccount[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function registerUser(user: Omit<UserAccount, "id">): { success: boolean; error?: string } {
  const users = getAllUsers();
  if (users.find(u => u.email === user.email)) {
    return { success: false, error: "Cet email est déjà utilisé." };
  }

  const newUser: UserAccount = {
    ...user,
    id: Math.random().toString(36).substring(2, 11)
  };

  users.push(newUser);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  return { success: true };
}

export function loginUser(email: string, password: string, role: UserRole): { success: boolean; error?: string; user?: UserAccount } {
  const users = getAllUsers();
  const user = users.find(u => u.email === email && u.password === password && u.role === role);

  if (!user) {
    return { success: false, error: "Identifiants invalides ou rôle incorrect." };
  }

  const session: AuthSession = {
    user,
    loginTime: Date.now()
  };

  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  window.dispatchEvent(new Event("authChanged"));
  return { success: true, user };
}

export function logoutUser() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SESSION_KEY);
  window.dispatchEvent(new Event("authChanged"));
}

export function getCurrentUser(): UserAccount | null {
  if (typeof window === "undefined") return null;
  try {
    const data = localStorage.getItem(SESSION_KEY);
    if (!data) return null;
    const session: AuthSession = JSON.parse(data);
    return session.user;
  } catch {
    return null;
  }
}

export function useAuth() {
  const [user, setUser] = React.useState<UserAccount | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const checkAuth = () => {
      setUser(getCurrentUser());
      setLoading(false);
    };

    checkAuth();
    window.addEventListener("authChanged", checkAuth);
    window.addEventListener("storage", checkAuth);
    return () => {
      window.removeEventListener("authChanged", checkAuth);
      window.removeEventListener("storage", checkAuth);
    };
  }, []);

  return { user, loading, logout: logoutUser };
}
