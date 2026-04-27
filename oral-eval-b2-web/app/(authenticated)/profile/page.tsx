"use client";

import { useState, useRef, useCallback } from "react";
import {
  User, Mail, Phone, Building2, BookOpen, Award, FileText,
  Globe, Lock, Camera, X, Check, Edit3, ArrowLeft, Eye, EyeOff, Save
} from "lucide-react";
import Link from "next/link";
import { useProfile, saveProfile, TeacherProfile } from "@/lib/profileStorage";

const LANGUAGE_OPTIONS = ["Français", "English", "Español", "Deutsch", "Italiano", "Arabe"];
const GRADE_OPTIONS = [
  "Professeur des universités",
  "Maître de conférences",
  "Maître de conférences HDR",
  "Professeur agrégé",
  "Professeur certifié",
  "ATER",
  "Chargé de cours",
  "Directeur de recherche CNRS",
  "Autre",
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/60">
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function Field({
  label, icon: Icon, children
}: { label: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5" /> {label}
      </label>
      {children}
    </div>
  );
}

const inputClass = (editing: boolean) =>
  `block w-full rounded-lg border-0 px-3 py-2.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset transition-colors ${
    editing
      ? "ring-slate-300 bg-white focus:ring-2 focus:ring-blue-600 outline-none"
      : "ring-slate-100 bg-slate-50 text-slate-700 cursor-default"
  }`;

export default function ProfilePage() {
  const { profile } = useProfile();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<TeacherProfile>(profile);
  const [saved, setSaved] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string>(profile.avatarBase64);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Password section state
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [pwdError, setPwdError] = useState("");
  const [pwdSuccess, setPwdSuccess] = useState(false);

  const startEdit = () => {
    setDraft({ ...profile });
    setAvatarPreview(profile.avatarBase64);
    setEditing(true);
  };

  const cancelEdit = () => {
    setDraft({ ...profile });
    setAvatarPreview(profile.avatarBase64);
    setEditing(false);
  };

  const handleSave = () => {
    const updated = { ...draft, avatarBase64: avatarPreview };
    saveProfile(updated);
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleAvatarUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setAvatarPreview(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleRemoveAvatar = () => {
    setAvatarPreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const set = (field: keyof TeacherProfile) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setDraft(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError("");
    if (newPwd.length < 8) { setPwdError("Le mot de passe doit contenir au moins 8 caractères."); return; }
    if (newPwd !== confirmPwd) { setPwdError("Les mots de passe ne correspondent pas."); return; }
    setPwdSuccess(true);
    setCurrentPwd(""); setNewPwd(""); setConfirmPwd("");
    setTimeout(() => setPwdSuccess(false), 3000);
  };

  const displayProfile = editing ? draft : profile;
  const initials = displayProfile.fullName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href="/dashboard" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-blue-600 mb-3 transition-colors">
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Retour au tableau de bord
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Mon profil</h1>
          <p className="text-sm text-slate-500 mt-1">Gérez vos informations personnelles et professionnelles.</p>
        </div>
        <div className="flex items-center gap-3">
          {editing ? (
            <>
              <button onClick={cancelEdit} className="inline-flex items-center rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 transition-colors">
                <X className="mr-1.5 h-4 w-4" /> Annuler
              </button>
              <button onClick={handleSave} className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors">
                <Save className="mr-1.5 h-4 w-4" /> Enregistrer
              </button>
            </>
          ) : (
            <button onClick={startEdit} className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors">
              <Edit3 className="mr-1.5 h-4 w-4" /> Modifier le profil
            </button>
          )}
        </div>
      </div>

      {/* Success toast */}
      {saved && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl bg-emerald-600 px-5 py-3 text-white shadow-xl">
          <Check className="h-5 w-5" />
          <span className="text-sm font-semibold">Profil enregistré avec succès.</span>
        </div>
      )}

      <div className="space-y-6">
        {/* Avatar card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-6">
            <div className="relative group shrink-0">
              <div className="h-24 w-24 rounded-2xl overflow-hidden ring-4 ring-blue-50 shadow-md">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-2xl font-bold">
                    {initials}
                  </div>
                )}
              </div>
              {editing && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 flex items-center justify-center bg-slate-900/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Camera className="h-7 w-7 text-white" />
                </button>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-slate-900 truncate">{displayProfile.fullName}</h2>
              <p className="text-sm text-slate-500 mt-0.5">{displayProfile.grade || "Enseignant(e)"}</p>
              <p className="text-sm text-blue-600 mt-0.5">{displayProfile.institution || "Institution non renseignée"}</p>
            </div>

            {editing && (
              <div className="flex flex-col gap-2 shrink-0">
                <button onClick={() => fileInputRef.current?.click()} className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100 transition-colors ring-1 ring-blue-200">
                  <Camera className="h-4 w-4" /> Changer la photo
                </button>
                {avatarPreview && (
                  <button onClick={handleRemoveAvatar} className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-100 transition-colors ring-1 ring-red-200">
                    <X className="h-4 w-4" /> Supprimer
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Personal info */}
        <Section title="Informations personnelles">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="Nom complet" icon={User}>
              <input type="text" value={displayProfile.fullName} onChange={set("fullName")} disabled={!editing} className={inputClass(editing)} />
            </Field>
            <Field label="Adresse e-mail" icon={Mail}>
              <input type="email" value={displayProfile.email} onChange={set("email")} disabled={!editing} className={inputClass(editing)} />
            </Field>
            <Field label="Téléphone" icon={Phone}>
              <input type="tel" value={displayProfile.phone} onChange={set("phone")} disabled={!editing} placeholder={editing ? "+33 6 00 00 00 00" : "Non renseigné"} className={inputClass(editing)} />
            </Field>
            <Field label="Langue préférée" icon={Globe}>
              <select value={displayProfile.language} onChange={set("language")} disabled={!editing} className={inputClass(editing)}>
                {LANGUAGE_OPTIONS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </Field>
            <div className="sm:col-span-2">
              <Field label="Biographie courte" icon={FileText}>
                <textarea
                  rows={3}
                  value={displayProfile.bio}
                  onChange={set("bio")}
                  disabled={!editing}
                  placeholder={editing ? "Quelques mots sur vous..." : "Aucune biographie renseignée"}
                  className={inputClass(editing) + " resize-none"}
                />
              </Field>
            </div>
          </div>
        </Section>

        {/* Professional info */}
        <Section title="Informations professionnelles">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="Établissement / École" icon={Building2}>
              <input type="text" value={displayProfile.institution} onChange={set("institution")} disabled={!editing} placeholder={editing ? "Université de Paris..." : "Non renseigné"} className={inputClass(editing)} />
            </Field>
            <Field label="Département / UFR" icon={Building2}>
              <input type="text" value={displayProfile.department} onChange={set("department")} disabled={!editing} placeholder={editing ? "Département de linguistique..." : "Non renseigné"} className={inputClass(editing)} />
            </Field>
            <Field label="Spécialité" icon={BookOpen}>
              <input type="text" value={displayProfile.specialty} onChange={set("specialty")} disabled={!editing} placeholder={editing ? "Français langue étrangère..." : "Non renseigné"} className={inputClass(editing)} />
            </Field>
            <Field label="Grade / Titre académique" icon={Award}>
              <select value={displayProfile.grade} onChange={set("grade")} disabled={!editing} className={inputClass(editing)}>
                {GRADE_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </Field>
          </div>
        </Section>

        {/* Security */}
        <Section title="Sécurité du compte">
          <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
            <p className="text-sm text-slate-500 mb-4">Modifiez votre mot de passe de connexion. Il doit contenir au moins 8 caractères.</p>

            {[
              { label: "Mot de passe actuel", value: currentPwd, set: setCurrentPwd },
              { label: "Nouveau mot de passe", value: newPwd, set: setNewPwd },
              { label: "Confirmer le nouveau mot de passe", value: confirmPwd, set: setConfirmPwd },
            ].map(({ label, value, set: setter }) => (
              <div key={label}>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5" /> {label}
                </label>
                <div className="relative">
                  <input
                    type={showPwd ? "text" : "password"}
                    value={value}
                    onChange={(e) => setter(e.target.value)}
                    required
                    className="block w-full rounded-lg border-0 px-3 py-2.5 pr-10 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 bg-white focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    tabIndex={-1}
                  >
                    {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            ))}

            {pwdError && (
              <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 ring-1 ring-red-200">{pwdError}</p>
            )}
            {pwdSuccess && (
              <p className="text-sm text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2 ring-1 ring-emerald-200 flex items-center gap-2">
                <Check className="h-4 w-4" /> Mot de passe modifié avec succès.
              </p>
            )}

            <button type="submit" className="inline-flex items-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-700 transition-colors">
              <Lock className="mr-1.5 h-4 w-4" /> Modifier le mot de passe
            </button>
          </form>
        </Section>
      </div>
    </div>
  );
}
