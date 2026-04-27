"use client";

import { useState, use, useEffect, useMemo } from "react";
import { 
  Users, Mail, Link as LinkIcon, QrCode, Search, Copy, Check, 
  ArrowLeft, Clock, ShieldCheck, FileCheck, X, UserPlus, Trash2, Edit 
} from "lucide-react";
import Link from "next/link";
import { useStudents, StudentItem, getClasses } from "@/lib/classStorage";

export default function ClassStudentsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const classId = resolvedParams.id;
  
  // Use store hooks
  const { students, addStudent, updateStudent, deleteStudent } = useStudents();
  
  // Filter for this specific class
  const classStudents = useMemo(() => students.filter(s => String(s.classId) === String(classId)), [students, classId]);

  const [classData, setClassData] = useState<any>({ name: "Classe inconnue", code: "----", level: "-" });

  useEffect(() => {
    // We only need this on mount / when it changes
    const classesList = getClasses();
    const foundClass = classesList.find(c => String(c.id) === String(classId));
    if (foundClass) {
      setClassData(foundClass);
    }
  }, [classId]);

  const [searchQuery, setSearchQuery] = useState("");
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"code" | "link" | "email" | "manual">("link");
  const [emailsInput, setEmailsInput] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  // Manual Add / Edit State
  const [selectedStudent, setSelectedStudent] = useState<StudentItem | null>(null);
  const [manualName, setManualName] = useState("");
  const [manualEmail, setManualEmail] = useState("");
  const [manualStatus, setManualStatus] = useState<"Actif" | "Invité" | "Évalué">("Actif");

  const filteredStudents = classStudents.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingCount = classStudents.filter(s => s.status === "Invité").length;
  const activeCount = classStudents.filter(s => s.status !== "Invité").length;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://oraleval.app/join/${classData.code}`);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(classData.code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSendInvites = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailsInput.trim()) return;

    const emails = emailsInput.split(",").map(e => e.trim()).filter(e => e);
    emails.forEach(email => {
      addStudent({
        id: `STU-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        classId: classId,
        name: "-",
        email: email,
        latestScore: "-",
        status: "Invité"
      });
    });

    setEmailsInput("");
    setIsInviteModalOpen(false);
  };

  const handleAddManual = (e: React.FormEvent) => {
    e.preventDefault();
    addStudent({
      id: `STU-${Date.now()}`,
      classId: classId,
      name: manualName,
      email: manualEmail,
      latestScore: "-",
      status: "Actif"
    });
    setManualName("");
    setManualEmail("");
    setIsInviteModalOpen(false);
  };

  const openEditModal = (s: StudentItem) => {
    setSelectedStudent(s);
    setManualName(s.name === "-" ? "" : s.name);
    setManualEmail(s.email);
    setManualStatus(s.status);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStudent) {
      updateStudent({
        ...selectedStudent,
        name: manualName || "-",
        email: manualEmail,
        status: manualStatus
      });
      setIsEditModalOpen(false);
    }
  };

  const handleDeleteStudent = (id: string) => {
    if (confirm("Voulez-vous vraiment retirer cet étudiant de la classe ?")) {
      deleteStudent(id);
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case "Évalué": 
        return <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20"><FileCheck className="h-3.5 w-3.5" /> Évalué</span>;
      case "Actif": 
        return <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20"><ShieldCheck className="h-3.5 w-3.5" /> Actif</span>;
      case "Invité": 
        return <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20"><Clock className="h-3.5 w-3.5" /> Invité (En attente)</span>;
      default: 
        return null;
    }
  };

  return (
    <div className="pb-10 max-w-7xl mx-auto">
      {/* Header and Breadcrumbs */}
      <div className="mb-8">
        <Link href="/classes" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-blue-600 mb-4 transition-colors">
          <ArrowLeft className="mr-1 h-4 w-4" /> Retour aux classes
        </Link>
        <div className="md:flex md:items-center md:justify-between bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold leading-7 text-slate-900 sm:truncate sm:text-3xl sm:tracking-tight flex items-center gap-3">
              {classData.name}
              <span className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-1 text-sm font-semibold text-slate-600">
                Niveau {classData.level}
              </span>
            </h2>
            <div className="mt-2 flex flex-col sm:flex-row sm:flex-wrap sm:space-x-6 gap-y-2">
              <div className="mt-2 flex items-center text-sm text-slate-500 font-medium">
                <Users className="mr-1.5 h-4 w-4 shrink-0 text-slate-400" />
                {activeCount} étudiants actifs
              </div>
              <div className="mt-2 flex items-center text-sm text-amber-600 font-medium">
                <Clock className="mr-1.5 h-4 w-4 shrink-0 text-amber-500" />
                {pendingCount} invitations en attente
              </div>
            </div>
          </div>
          <div className="mt-6 flex flex-col-reverse justify-stretch space-y-4 space-y-reverse sm:flex-row-reverse sm:justify-end sm:space-x-3 sm:space-y-0 sm:space-x-reverse md:mt-0 md:flex-row md:space-x-3">
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 transition-colors"
            >
              {isCopied ? <Check className="-ml-0.5 mr-2 h-4 w-4 text-emerald-500" /> : <Copy className="-ml-0.5 mr-2 h-4 w-4" />}
              Copier le lien
            </button>
            <button
              onClick={() => setIsInviteModalOpen(true)}
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors"
            >
              <UserPlus className="-ml-0.5 mr-2 h-5 w-5" />
              Ajouter des étudiants
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md mb-6">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Search className="h-5 w-5 text-slate-400" />
        </div>
        <input
          type="text"
          className="block w-full rounded-lg border-0 py-2.5 pl-10 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm"
          placeholder="Rechercher par nom ou email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Students Table */}
      <div className="overflow-hidden shadow-sm ring-1 ring-slate-200 rounded-2xl bg-white">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="py-4 pl-6 pr-3 text-left text-sm font-semibold text-slate-900">Étudiant</th>
              <th scope="col" className="px-3 py-4 text-left text-sm font-semibold text-slate-900">Statut</th>
              <th scope="col" className="px-3 py-4 text-left text-sm font-semibold text-slate-900">Dernière Note</th>
              <th scope="col" className="relative py-4 pl-3 pr-6"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {filteredStudents.length > 0 ? filteredStudents.map((person) => (
              <tr key={person.id} className="hover:bg-slate-50 transition-colors group">
                <td className="whitespace-nowrap py-4 pl-6 pr-3 text-sm">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0">
                      {person.name !== "-" ? (
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                          {person.name.charAt(0)}
                        </div>
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-slate-100 border border-dashed border-slate-300 flex items-center justify-center text-slate-400">
                          <Mail className="h-5 w-5" />
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="font-medium text-slate-900">{person.name !== "-" ? person.name : "En attente d'inscription"}</div>
                      <div className="text-slate-500">{person.email}</div>
                    </div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm">
                  {getStatusBadge(person.status)}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-slate-900">
                  {person.latestScore}
                </td>
                <td className="relative whitespace-nowrap py-4 pl-3 pr-6 text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEditModal(person)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Modifier">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDeleteStudent(person.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Retirer de la classe">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  {person.status !== "Invité" ? (
                    <Link href="/evaluations" className="text-blue-600 hover:text-blue-900 bg-blue-50 px-3 py-1.5 rounded-md hover:bg-blue-100 transition-colors ml-2">
                      Évaluer
                    </Link>
                  ) : (
                    <button className="text-slate-400 hover:text-slate-600 px-3 py-1.5 ml-2">Relancer</button>
                  )}
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={4} className="py-12 text-center text-sm text-slate-500">
                  Aucun étudiant trouvé. Utilisez le bouton "Ajouter des étudiants" pour commencer.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Invite Modal */}
      {isInviteModalOpen && (
        <div className="relative z-50">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" onClick={() => setIsInviteModalOpen(false)} />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <div className="relative w-full max-w-lg transform overflow-hidden rounded-2xl bg-white shadow-xl transition-all flex flex-col">
              
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Ajouter des étudiants</h3>
                  <p className="text-sm text-slate-500 mt-1">Gérez les inscriptions de la classe {classData.name}</p>
                </div>
                <button onClick={() => setIsInviteModalOpen(false)} className="text-slate-400 hover:text-slate-500 hover:bg-slate-100 p-2 rounded-full transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex border-b border-slate-200 overflow-x-auto">
                <button 
                  onClick={() => setActiveTab("manual")}
                  className={`flex-1 min-w-[100px] py-4 text-sm font-medium text-center border-b-2 transition-colors ${activeTab === 'manual' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
                >
                  <UserPlus className="h-4 w-4 inline mr-2 mb-0.5" /> Manuel
                </button>
                <button 
                  onClick={() => setActiveTab("link")}
                  className={`flex-1 min-w-[100px] py-4 text-sm font-medium text-center border-b-2 transition-colors ${activeTab === 'link' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
                >
                  <LinkIcon className="h-4 w-4 inline mr-2 mb-0.5" /> Lien
                </button>
                <button 
                  onClick={() => setActiveTab("email")}
                  className={`flex-1 min-w-[100px] py-4 text-sm font-medium text-center border-b-2 transition-colors ${activeTab === 'email' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
                >
                  <Mail className="h-4 w-4 inline mr-2 mb-0.5" /> E-mail
                </button>
                <button 
                  onClick={() => setActiveTab("code")}
                  className={`flex-1 min-w-[100px] py-4 text-sm font-medium text-center border-b-2 transition-colors ${activeTab === 'code' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
                >
                  <QrCode className="h-4 w-4 inline mr-2 mb-0.5" /> Code
                </button>
              </div>

              <div className="p-6">
                {activeTab === 'manual' && (
                  <form onSubmit={handleAddManual} className="space-y-4">
                    <p className="text-sm text-slate-600 mb-4">Ajoutez manuellement un étudiant à votre classe. Son compte sera créé automatiquement.</p>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Nom complet</label>
                      <input 
                        type="text" required value={manualName} onChange={(e) => setManualName(e.target.value)}
                        className="block w-full rounded-lg border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Adresse e-mail</label>
                      <input 
                        type="email" required value={manualEmail} onChange={(e) => setManualEmail(e.target.value)}
                        className="block w-full rounded-lg border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm"
                      />
                    </div>
                    <div className="pt-2 text-right">
                      <button type="submit" className="inline-flex justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors">
                        Ajouter l'étudiant
                      </button>
                    </div>
                  </form>
                )}

                {activeTab === 'link' && (
                  <div className="space-y-4">
                    <p className="text-sm text-slate-600">Copiez ce lien et partagez-le avec vos étudiants (par exemple sur votre ENT ou par messagerie).</p>
                    <div className="flex rounded-lg shadow-sm ring-1 ring-inset ring-slate-300 bg-slate-50">
                      <input 
                        type="text" readOnly value={`https://oraleval.app/join/${classData.code}`}
                        className="block w-full border-0 bg-transparent py-3 pl-4 text-slate-900 sm:text-sm font-medium outline-none"
                      />
                      <button onClick={handleCopyLink} className="px-4 text-sm font-semibold text-blue-600 hover:bg-blue-50 transition-colors border-l border-slate-300">
                        {isCopied ? "Copié !" : "Copier"}
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === 'code' && (
                  <div className="space-y-4 text-center">
                    <p className="text-sm text-slate-600 text-left">Les étudiants possédant déjà un compte peuvent rejoindre la classe en entrant ce code.</p>
                    <div className="inline-block bg-slate-100 px-8 py-4 rounded-xl border-2 border-dashed border-slate-300 my-4">
                      <span className="text-4xl font-black text-slate-800 tracking-widest">{classData.code}</span>
                    </div>
                    <div>
                      <button onClick={handleCopyCode} className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700">
                        {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        {isCopied ? "Code copié" : "Copier le code"}
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === 'email' && (
                  <form onSubmit={handleSendInvites} className="space-y-4">
                    <p className="text-sm text-slate-600">Entrez les adresses e-mail des étudiants. Séparées par des virgules.</p>
                    <textarea 
                      rows={4} required value={emailsInput} onChange={(e) => setEmailsInput(e.target.value)}
                      placeholder="etudiant1@ecole.fr, etudiant2@ecole.fr..."
                      className="block w-full rounded-lg border-0 py-3 px-4 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm"
                    />
                    <div className="pt-2 text-right">
                      <button type="submit" className="inline-flex justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors">
                        Envoyer les invitations
                      </button>
                    </div>
                  </form>
                )}
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {isEditModalOpen && selectedStudent && (
        <div className="relative z-50">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" onClick={() => setIsEditModalOpen(false)} />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left shadow-xl transition-all">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-slate-900">Modifier l'étudiant</h3>
                <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-500">
                  <X className="h-6 w-6" />
                </button>
              </div>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nom complet</label>
                  <input 
                    type="text" value={manualName} onChange={(e) => setManualName(e.target.value)}
                    className="block w-full rounded-lg border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Adresse e-mail</label>
                  <input 
                    type="email" required value={manualEmail} onChange={(e) => setManualEmail(e.target.value)}
                    className="block w-full rounded-lg border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Statut</label>
                  <select 
                    value={manualStatus} onChange={(e) => setManualStatus(e.target.value as "Actif" | "Invité" | "Évalué")}
                    className="block w-full rounded-lg border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm"
                  >
                    <option value="Actif">Actif</option>
                    <option value="Invité">Invité</option>
                    <option value="Évalué">Évalué</option>
                  </select>
                </div>
                <div className="mt-8 flex justify-end gap-3">
                  <button type="button" onClick={() => setIsEditModalOpen(false)} className="rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50">
                    Annuler
                  </button>
                  <button type="submit" className="inline-flex justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500">
                    Enregistrer
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
