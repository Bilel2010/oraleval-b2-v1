"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { Topnav } from "@/components/Topnav";
import { X } from "lucide-react";
import { useAuth } from "@/lib/authStorage";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
    
    // Simple role protection: if student tries to access teacher pages
    if (!loading && user && user.role === "student" && !pathname.startsWith("/student")) {
      router.push("/student");
    }
    
    // If teacher tries to access student page
    if (!loading && user && user.role === "teacher" && pathname === "/student") {
      router.push("/dashboard");
    }
  }, [user, loading, router, pathname]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-sm font-medium text-slate-500">Chargement de votre session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="relative z-50 lg:hidden">
          <div className="fixed inset-0 bg-slate-900/80 transition-opacity" onClick={() => setSidebarOpen(false)} />

          <div className="fixed inset-0 flex">
            <div className="relative mr-16 flex w-full max-w-xs flex-1 transform bg-white transition duration-300 ease-in-out">
              <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                <button
                  type="button"
                  className="-m-2.5 p-2.5"
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="sr-only">Fermer la barre latérale</span>
                  <X className="h-6 w-6 text-white" aria-hidden="true" />
                </button>
              </div>
              {/* Sidebar component inside mobile wrapper */}
              <Sidebar />
            </div>
          </div>
        </div>
      )}

      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <Sidebar />
      </div>

      <div className="lg:pl-72 flex flex-col min-h-screen">
        <Topnav onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1">
          <div className="px-4 py-8 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
