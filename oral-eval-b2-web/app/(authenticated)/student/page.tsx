"use client";

import { useAuth } from "@/lib/authStorage";
import { useStudents, useEvalHistory } from "@/lib/classStorage";
import { GraduationCap, BookOpen, Clock, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import { useMemo } from "react";

export default function StudentDashboard() {
  const { user } = useAuth();
  const { students } = useStudents();
  const { evalHistory } = useEvalHistory();

  // Find the student record matching this user (by email or name)
  const studentRecord = useMemo(() => {
    return students.find(s => s.email === user?.email || s.name === user?.fullName);
  }, [students, user]);

  const history = useMemo(() => {
    if (!studentRecord) return [];
    return evalHistory.filter(h => String(h.studentId) === String(studentRecord.id))
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [evalHistory, studentRecord]);

  return (
    <div className="space-y-8">
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-slate-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Espace Étudiant
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Bienvenue, {user?.fullName}. Suivez vos résultats et votre progression.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Class Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Ma Classe</h3>
              <p className="text-xs text-slate-500">{user?.classCode || "Non assignée"}</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Statut</span>
              <span className={`font-semibold ${studentRecord?.status === "Évalué" ? "text-emerald-600" : "text-amber-600"}`}>
                {studentRecord?.status || "En attente"}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Dernière note</span>
              <span className="font-bold text-slate-900">{studentRecord?.latestScore ? `${studentRecord.latestScore}/20` : "-"}</span>
            </div>
          </div>
        </div>

        {/* Evaluation Progress */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-10 w-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Evaluations</h3>
              <p className="text-xs text-slate-500">{history.length} enregistrée(s)</p>
            </div>
          </div>
          <div className="space-y-2">
            {history.slice(0, 2).map((h, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                <span className="text-xs font-medium text-slate-700">{new Date(h.timestamp).toLocaleDateString()}</span>
                <span className="text-xs font-bold text-slate-900">{h.finalScore}/20</span>
              </div>
            ))}
            {history.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-2 italic">Aucune évaluation pour le moment.</p>
            )}
          </div>
        </div>

        {/* Resources Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Ressources DELF B2</h3>
              <p className="text-xs text-slate-500">Préparez votre oral</p>
            </div>
          </div>
          <ul className="space-y-2">
            <li><a href="#" className="text-xs text-blue-600 hover:underline flex items-center gap-2"><FileText className="h-3 w-3" /> Grille de notation officielle</a></li>
            <li><a href="#" className="text-xs text-blue-600 hover:underline flex items-center gap-2"><FileText className="h-3 w-3" /> Exemples de sujets d'exposé</a></li>
          </ul>
        </div>
      </div>

      {/* Detailed Results */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="text-base font-bold text-slate-900">Historique des résultats</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Note Finale</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Appréciation</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Statut</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {history.map((h, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{new Date(h.timestamp).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">{h.finalScore}/20</td>
                  <td className="px-6 py-4 text-sm text-slate-500 max-w-xs truncate">{h.globalFeedback || "Non renseignée"}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                      <CheckCircle2 className="h-3 w-3" /> Validé
                    </span>
                  </td>
                </tr>
              ))}
              {history.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-sm text-slate-400 italic">
                    <AlertCircle className="h-8 w-8 mx-auto mb-2 text-slate-200" />
                    Vos résultats apparaîtront ici une fois que votre professeur aura validé vos évaluations.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
