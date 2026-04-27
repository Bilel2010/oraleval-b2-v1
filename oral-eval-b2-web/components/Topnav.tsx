"use client";

import { useState, useRef, useEffect } from "react";
import { Menu, Bell, User, ChevronDown, Settings, LogOut, UserCircle } from "lucide-react";
import Link from "next/link";
import { useProfile } from "@/lib/profileStorage";
import { logoutUser } from "@/lib/authStorage";

interface TopnavProps {
  onMenuClick: () => void;
}

export function Topnav({ onMenuClick }: TopnavProps) {
  const { profile } = useProfile();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    setDropdownOpen(false);
    logoutUser();
  };

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initials = profile.fullName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-slate-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      <button
        type="button"
        className="-m-2.5 p-2.5 text-slate-700 lg:hidden"
        onClick={onMenuClick}
      >
        <span className="sr-only">Ouvrir le menu</span>
        <Menu className="h-6 w-6" aria-hidden="true" />
      </button>

      <div className="h-6 w-px bg-slate-200 lg:hidden" aria-hidden="true" />

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="flex flex-1" />
        <div className="flex items-center gap-x-4 lg:gap-x-6">

          {/* Notifications bell */}
          <button
            type="button"
            className="-m-2.5 p-2.5 text-slate-400 hover:text-slate-500 transition-colors"
          >
            <span className="sr-only">Voir les notifications</span>
            <Bell className="h-6 w-6" aria-hidden="true" />
          </button>

          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-slate-200" aria-hidden="true" />

          {/* Profile dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((v) => !v)}
              className="flex items-center gap-x-3 rounded-xl px-3 py-1.5 text-sm font-semibold text-slate-900 hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-haspopup="true"
              aria-expanded={dropdownOpen}
            >
              {/* Avatar */}
              <div className="h-8 w-8 rounded-full overflow-hidden ring-2 ring-blue-100 shrink-0">
                {profile.avatarBase64 ? (
                  <img src={profile.avatarBase64} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                    {initials}
                  </div>
                )}
              </div>
              <span className="hidden lg:block">{profile.fullName}</span>
              <ChevronDown
                className={`hidden lg:block h-4 w-4 text-slate-400 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {/* Dropdown panel */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl bg-white py-1 shadow-lg ring-1 ring-slate-200 focus:outline-none z-50">
                {/* Profile header */}
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-xs font-medium text-slate-500">Connecté en tant que</p>
                  <p className="text-sm font-semibold text-slate-900 truncate">{profile.fullName}</p>
                  <p className="text-xs text-slate-500 truncate">{profile.email}</p>
                </div>

                <div className="py-1">
                  <Link
                    href="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <UserCircle className="h-4 w-4 text-slate-400" />
                    Mon profil
                  </Link>
                  <Link
                    href="/settings"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Settings className="h-4 w-4 text-slate-400" />
                    Paramètres
                  </Link>
                </div>

                <div className="border-t border-slate-100 py-1">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                  >
                    <LogOut className="h-4 w-4" />
                    Déconnexion
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
