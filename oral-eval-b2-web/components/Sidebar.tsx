"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  ClipboardCheck, 
  LogOut 
} from "lucide-react";

const navigation = [
  { name: "Tableau de bord", href: "/dashboard", icon: LayoutDashboard },
  { name: "Classes", href: "/classes", icon: Users },
  { name: "Étudiants", href: "/students", icon: GraduationCap },
  { name: "Évaluations", href: "/evaluations", icon: ClipboardCheck },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-slate-200 bg-white px-6 pb-4 pt-8">
      <div className="flex h-12 shrink-0 items-center">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
            <ClipboardCheck className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-slate-900 tracking-tight">OralEval B2</span>
        </div>
      </div>
      <nav className="flex flex-1 flex-col mt-4">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              {navigation.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`
                        group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold
                        ${isActive 
                          ? "bg-blue-50 text-blue-600" 
                          : "text-slate-700 hover:text-blue-600 hover:bg-slate-50"}
                      `}
                    >
                      <item.icon
                        className={`h-5 w-5 shrink-0 ${isActive ? "text-blue-600" : "text-slate-400 group-hover:text-blue-600"}`}
                        aria-hidden="true"
                      />
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </li>
          <li className="mt-auto">
            <Link
              href="/login"
              className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-slate-700 hover:bg-slate-50 hover:text-blue-600"
            >
              <LogOut className="h-5 w-5 shrink-0 text-slate-400 group-hover:text-blue-600" aria-hidden="true" />
              Déconnexion
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}
