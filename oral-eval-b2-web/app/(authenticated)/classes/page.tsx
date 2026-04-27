"use client";

import { useState, useMemo } from "react";
import { Users, Plus, PlayCircle, Search, TrendingUp, TrendingDown, X, Check, Edit, Trash2, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useClasses, useStudents, ClassItem, getEvalHistory } from "@/lib/classStorage";

export default function ClassesPage() {
  const { classes, addClass, updateClass, deleteClass } = useClasses();
  const { students } = useStudents();
  const [searchQuery, setSearchQuery] = useState("");

  // Compute live stats per class from storage
  const classStats = useMemo(() => {
    const history = getEvalHistory();
    const result: Record<string, { studentCount: number; pendingCount: number; evalCount: number; avgScore: string; trend: "up" | "down" }> = {};
    for (const cls of classes) {
      const clsStudents = students.filter(s => String(s.classId) === String(cls.id));
      const active = clsStudents.filter(s => s.status !== "Invité");
      const pending = clsStudents.filter(s => s.status === "Invité");
      let totalEvals = 0;
      const scores: number[] = [];
      for (const stu of clsStudents) {
        const evals = history[stu.id] ?? [];
        totalEvals += evals.length;
        if (evals.length > 0) {
          scores.push(evals[evals.length - 1].finalScore20);
        }
      }
      const avgScore = scores.length > 0
        ? `${(scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)}/20`
        : "-";
      const trend = scores.length >= 2 && scores[scores.length - 1] >= scores[0] ? "up" : "down";
      result[String(cls.id)] = {
        studentCount: active.length,
        pendingCount: pending.length,
        evalCount: totalEvals,
        avgScore,
        trend
      };
    }
    return result;
  }, [classes, students]);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);

  // Form State for Add/Edit
  const [formData, setFormData] = useState({
    name: "",
    level: "B2",
    description: "",
    nextSession: ""
  });

  const filteredClasses = classes.filter(cls => 
    cls.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cls.level.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenAdd = () => {
    setFormData({ name: "", level: "B2", description: "", nextSession: "" });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (cls: ClassItem) => {
    setSelectedClass(cls);
    setFormData({ 
      name: cls.name, 
      level: cls.level, 
      description: cls.description || "", 
      nextSession: cls.nextSession 
    });
    setIsEditModalOpen(true);
  };

  const handleOpenDelete = (cls: ClassItem) => {
    setSelectedClass(cls);
    setIsDeleteModalOpen(true);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const newClass: ClassItem = {
      id: Date.now().toString(),
      name: formData.name,
      level: formData.level,
      description: formData.description,
      nextSession: formData.nextSession || "À définir",
      code: `B2-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      students: 0,
      progress: "0%",
      avgScore: "-/20",
      evalCount: 0,
      trend: "up",
      status: "normal"
    };

    addClass(newClass);
    setIsAddModalOpen(false);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass || !formData.name.trim()) return;

    updateClass({
      ...selectedClass,
      name: formData.name,
      level: formData.level,
      description: formData.description,
      nextSession: formData.nextSession || "À définir",
    });

    setIsEditModalOpen(false);
    setSelectedClass(null);
  };

  const handleDeleteConfirm = () => {
    if (selectedClass) {
      deleteClass(selectedClass.id);
      setIsDeleteModalOpen(false);
      setSelectedClass(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case "today": return "bg-red-50 text-red-700 ring-red-600/20";
      case "close": return "bg-amber-50 text-amber-700 ring-amber-600/20";
      default: return "bg-emerald-50 text-emerald-700 ring-emerald-600/20";
    }
  };

  return (
    <div className="pb-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between border-b border-slate-200 pb-5 mb-8">
        <div>
          <h2 className="text-3xl font-bold leading-7 text-slate-900 sm:truncate sm:tracking-tight">
            Vos Classes
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Gérez vos groupes d'étudiants, suivez leurs performances globales et planifiez les évaluations.
          </p>
        </div>
        <div className="mt-4 sm:ml-4 sm:mt-0">
          <button
            onClick={handleOpenAdd}
            type="button"
            className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all"
          >
            <Plus className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
            Nouvelle classe
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1 max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-5 w-5 text-slate-400" aria-hidden="true" />
          </div>
          <input
            type="text"
            className="block w-full rounded-lg border-0 py-2.5 pl-10 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
            placeholder="Rechercher une classe..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {filteredClasses.map((cls) => (
          <div 
            key={cls.id} 
            className="relative flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 overflow-hidden"
          >
            {/* Top right actions */}
            <div className="absolute top-4 right-4 flex items-center gap-1 bg-white/80 backdrop-blur-sm rounded-full p-1 border border-slate-100 shadow-sm">
              <button onClick={() => handleOpenEdit(cls)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors" title="Modifier">
                <Edit className="h-4 w-4" />
              </button>
              <button onClick={() => handleOpenDelete(cls)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors" title="Supprimer">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6 flex-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-inset ring-blue-100 shadow-sm">
                  <Users className="h-6 w-6" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 leading-tight pr-12">{cls.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                      Niveau {cls.level}
                    </span>
                    <span className="text-sm text-slate-500 font-medium">
                      {classStats[String(cls.id)]?.studentCount ?? 0} étudiants
                    </span>
                    {(classStats[String(cls.id)]?.pendingCount ?? 0) > 0 && (
                      <span className="text-xs text-amber-600 font-medium">
                        · {classStats[String(cls.id)].pendingCount} en attente
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              {cls.description && <p className="text-sm text-slate-500 mb-4 line-clamp-2">{cls.description}</p>}

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-100 mb-4 mt-2">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Moyenne</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-slate-900">{classStats[String(cls.id)]?.avgScore ?? "-"}</span>
                    {(classStats[String(cls.id)]?.trend ?? "up") === "up" ? (
                      <TrendingUp className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-amber-500" />
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Évaluations</p>
                  <span className="text-xl font-bold text-slate-900">{classStats[String(cls.id)]?.evalCount ?? 0}</span>
                </div>
              </div>

              {/* Next Session Badge */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500">Prochaine éval.</span>
                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${getStatusColor(cls.status)}`}>
                  {cls.nextSession}
                </span>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex items-center justify-between gap-3">
              <Link 
                href={`/classes/${cls.id}/students`}
                className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
              >
                Gérer les étudiants
              </Link>
              <Link
                href="/evaluations"
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all"
              >
                <PlayCircle className="h-4 w-4" />
                Évaluer
              </Link>
            </div>
          </div>
        ))}
      </div>

      {filteredClasses.length === 0 && (
        <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200 mt-6">
          <Users className="mx-auto h-12 w-12 text-slate-300 mb-4" />
          <h3 className="text-lg font-semibold text-slate-900">Aucune classe trouvée</h3>
          <p className="text-slate-500 mt-1">Modifiez vos filtres ou créez une nouvelle classe.</p>
        </div>
      )}

      {/* Modal Add/Edit */}
      {(isAddModalOpen || isEditModalOpen) && (
        <div className="relative z-50">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }} />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left shadow-xl transition-all">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-slate-900">
                  {isEditModalOpen ? "Modifier la classe" : "Ajouter une nouvelle classe"}
                </h3>
                <button onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }} className="text-slate-400 hover:text-slate-500">
                  <X className="h-6 w-6" />
                </button>
              </div>
              <form onSubmit={isEditModalOpen ? handleEditSubmit : handleAddSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nom de la classe</label>
                    <input
                      type="text" required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="block w-full rounded-lg border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Niveau visé</label>
                    <select
                      value={formData.level}
                      onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                      className="block w-full rounded-lg border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm"
                    >
                      <option value="B1">B1</option>
                      <option value="B2">B2</option>
                      <option value="C1">C1</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                    <textarea
                      rows={2}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="block w-full rounded-lg border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Date/Heure de la prochaine évaluation</label>
                    <input
                      type="text"
                      value={formData.nextSession}
                      onChange={(e) => setFormData({ ...formData, nextSession: e.target.value })}
                      className="block w-full rounded-lg border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm"
                      placeholder="ex: 12 Mai 14:00"
                    />
                  </div>
                </div>
                <div className="mt-8 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}
                    className="rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
                  >
                    <Check className="h-4 w-4" />
                    {isEditModalOpen ? "Enregistrer" : "Créer la classe"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedClass && (
        <div className="relative z-50">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" onClick={() => setIsDeleteModalOpen(false)} />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left shadow-xl transition-all border-t-4 border-red-600">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-bold text-slate-900 mb-2">Supprimer la classe</h3>
                <p className="text-sm text-slate-500 mb-4">
                  Êtes-vous sûr de vouloir supprimer la classe <span className="font-bold text-slate-900">{selectedClass.name}</span> ?
                </p>
                <div className="bg-red-50 border border-red-100 rounded-lg p-3 text-sm text-red-700 font-semibold mb-6 text-left">
                  Cette action supprimera la communauté et ses données associées.
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 flex-1"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  className="inline-flex justify-center items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-500 flex-1"
                >
                  <Trash2 className="h-4 w-4" /> Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
