"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ClipboardCheck, User, Mail, Lock, Building2, BookOpen, GraduationCap, ArrowRight } from "lucide-react";
import { registerUser, UserRole } from "@/lib/authStorage";

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<UserRole>("teacher");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    institution: "",
    department: "",
    specialty: "",
    studentId: "",
    classCode: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      setIsLoading(false);
      return;
    }

    const result = registerUser({
      fullName: formData.fullName,
      email: formData.email,
      password: formData.password,
      role,
      institution: role === "teacher" ? formData.institution : undefined,
      department: role === "teacher" ? formData.department : undefined,
      specialty: role === "teacher" ? formData.specialty : undefined,
      studentId: role === "student" ? formData.studentId : undefined,
      classCode: role === "student" ? formData.classCode : undefined,
    });

    if (result.success) {
      router.push("/login?registered=true");
    } else {
      setError(result.error || "Une erreur est survenue.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-1 flex-col justify-center px-6 py-12 lg:px-8 bg-slate-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Link href="/" className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 shadow-md">
            <ClipboardCheck className="h-7 w-7 text-white" />
          </Link>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-slate-900">
          Créer votre compte
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500">
          Rejoignez la plateforme OralEval B2
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[550px]">
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

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Nom complet</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input
                    name="fullName"
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    className="block w-full rounded-xl border-0 py-2.5 pl-10 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600 sm:text-sm"
                    placeholder="Jean Dupont"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="block w-full rounded-xl border-0 py-2.5 pl-10 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600 sm:text-sm"
                    placeholder="email@exemple.fr"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Mot de passe</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input
                    name="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="block w-full rounded-xl border-0 py-2.5 pl-10 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600 sm:text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Confirmer le mot de passe</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input
                    name="confirmPassword"
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="block w-full rounded-xl border-0 py-2.5 pl-10 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600 sm:text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {role === "teacher" ? (
                <>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Institution</label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <input
                        name="institution"
                        type="text"
                        required
                        value={formData.institution}
                        onChange={handleChange}
                        className="block w-full rounded-xl border-0 py-2.5 pl-10 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600 sm:text-sm"
                        placeholder="Université de Lyon"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Département</label>
                    <input
                      name="department"
                      type="text"
                      value={formData.department}
                      onChange={handleChange}
                      className="block w-full rounded-xl border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600 sm:text-sm"
                      placeholder="Linguistique"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Spécialité</label>
                    <input
                      name="specialty"
                      type="text"
                      value={formData.specialty}
                      onChange={handleChange}
                      className="block w-full rounded-xl border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600 sm:text-sm"
                      placeholder="FLE / B2"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">ID Étudiant</label>
                    <input
                      name="studentId"
                      type="text"
                      required
                      value={formData.studentId}
                      onChange={handleChange}
                      className="block w-full rounded-xl border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600 sm:text-sm"
                      placeholder="STU-001"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Code Classe / Invitation</label>
                    <input
                      name="classCode"
                      type="text"
                      required
                      value={formData.classCode}
                      onChange={handleChange}
                      className="block w-full rounded-xl border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600 sm:text-sm"
                      placeholder="B2-2024"
                    />
                  </div>
                </>
              )}
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
              {isLoading ? "Création en cours..." : "Créer mon compte"}
              {!isLoading && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>
        </div>

        <p className="mt-8 text-center text-sm text-slate-500">
          Vous avez déjà un compte ?{" "}
          <Link href="/login" className="font-bold text-blue-600 hover:text-blue-500">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
