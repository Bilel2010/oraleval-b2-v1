"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ClipboardCheck, Mail, Lock, User, GraduationCap, ArrowRight, CheckCircle2 } from "lucide-react";
import { loginUser, UserRole } from "@/lib/authStorage";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [role, setRole] = useState<UserRole>("teacher");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [justRegistered, setJustRegistered] = useState(false);

  useEffect(() => {
    if (searchParams.get("registered") === "true") {
      setJustRegistered(true);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const result = loginUser(email, password, role);

    if (result.success) {
      if (role === "teacher") {
        router.push("/dashboard");
      } else {
        router.push("/student");
      }
    } else {
      setError(result.error || "Identifiants invalides.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-1 flex-col justify-center px-6 py-12 lg:px-8 bg-slate-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <div className="flex justify-center">
          <Link href="/" className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 shadow-md">
            <ClipboardCheck className="h-7 w-7 text-white" />
          </Link>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-slate-900">
          Connexion
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500">
          Accédez à votre espace OralEval B2
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
        {justRegistered && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <p className="text-sm font-semibold text-emerald-700">Compte créé avec succès ! Connectez-vous.</p>
          </div>
        )}

        <div className="bg-white px-6 py-10 shadow-xl rounded-3xl sm:px-12 border border-slate-100">
          
          {/* Role Selection */}
          <div className="flex p-1 bg-slate-100 rounded-xl mb-8">
            <button
              type="button"
              onClick={() => setRole("teacher")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                role === "teacher" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <GraduationCap className="h-4 w-4" /> Enseignant
            </button>
            <button
              type="button"
              onClick={() => setRole("student")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                role === "student" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <User className="h-4 w-4" /> Étudiant
            </button>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Adresse e-mail</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  className="block w-full rounded-xl border-0 py-2.5 pl-10 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600 sm:text-sm"
                  placeholder="email@exemple.fr"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Mot de passe</label>
                <div className="text-xs">
                  <a href="#" className="font-bold text-blue-600 hover:text-blue-500">
                    Oublié ?
                  </a>
                </div>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  className="block w-full rounded-xl border-0 py-2.5 pl-10 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600 sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl">
                <p className="text-xs font-semibold text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-3 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 hover:bg-blue-500 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
            >
              {isLoading ? "Connexion..." : "Se connecter"}
              {!isLoading && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>
        </div>

        <p className="mt-8 text-center text-sm text-slate-500">
          Vous n'avez pas de compte ?{" "}
          <Link href="/register" className="font-bold text-blue-600 hover:text-blue-500">
            S'inscrire
          </Link>
        </p>
      </div>
    </div>
  );
}
