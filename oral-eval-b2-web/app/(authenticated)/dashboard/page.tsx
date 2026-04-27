"use client";

import { Users, GraduationCap, ClipboardCheck, TrendingUp } from "lucide-react";
import { useClasses, useStudents } from "@/lib/classStorage";
import { useProfile } from "@/lib/profileStorage";
import { useMemo } from "react";

export default function DashboardPage() {
  const { classes } = useClasses();
  const { students } = useStudents();
  const { profile } = useProfile();

  const evaluatedStudents = useMemo(
    () => students.filter((s) => s.status === "Évalué"),
    [students]
  );

  const generalAverage = useMemo(() => {
    const scores = evaluatedStudents
      .map((s) => Number(s.latestScore))
      .filter((score) => !Number.isNaN(score));

    if (scores.length === 0) return "-";

    const avg = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    return `${avg.toFixed(1)}/20`;
  }, [evaluatedStudents]);

  const stats = [
    { name: "Classes actives", value: classes.length.toString(), icon: Users },
    { name: "Total étudiants", value: students.length.toString(), icon: GraduationCap },
    { name: "Évaluations terminées", value: evaluatedStudents.length.toString(), icon: ClipboardCheck },
    { name: "Moyenne générale", value: generalAverage, icon: TrendingUp },
  ];

  const recentEvaluations = useMemo(() => {
    return evaluatedStudents.slice(0, 5).map((s) => {
      const cls = classes.find((c) => String(c.id) === String(s.classId));

      return {
        id: s.id,
        student: s.name,
        class: cls ? cls.name : "Inconnue",
        date: "Récemment",
        score: s.latestScore ? `${s.latestScore}/20` : "-",
      };
    });
  }, [evaluatedStudents, classes]);

  return (
    <div>
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-slate-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Bonjour, {profile.fullName || "Professeur"}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Voici un aperçu de vos activités d'évaluation récentes.
          </p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <div
            key={item.name}
            className="relative overflow-hidden rounded-2xl bg-white px-4 pb-12 pt-5 shadow-sm border border-slate-100 sm:px-6 sm:pt-6"
          >
            <dt>
              <div className="absolute rounded-xl bg-blue-50 p-3">
                <item.icon className="h-6 w-6 text-blue-600" aria-hidden="true" />
              </div>
              <p className="ml-16 truncate text-sm font-medium text-slate-500">
                {item.name}
              </p>
            </dt>
            <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
              <p className="text-2xl font-semibold text-slate-900">
                {item.value}
              </p>
            </dd>
          </div>
        ))}
      </div>

      <div className="mt-12">
        <h3 className="text-base font-semibold leading-6 text-slate-900">
          Évaluations récentes
        </h3>

        <div className="mt-4 overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-100">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-slate-900 sm:pl-6">
                  Étudiant
                </th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900 hidden sm:table-cell">
                  Classe
                </th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900 hidden md:table-cell">
                  Date
                </th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                  Note Finale
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 bg-white">
              {recentEvaluations.length > 0 ? (
                recentEvaluations.map((evalItem) => (
                  <tr key={evalItem.id} className="hover:bg-slate-50 transition-colors">
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-slate-900 sm:pl-6">
                      {evalItem.student}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500 hidden sm:table-cell">
                      <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                        {evalItem.class}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500 hidden md:table-cell">
                      {evalItem.date}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm font-semibold text-slate-900">
                      {evalItem.score}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-sm text-slate-500">
                    Aucune évaluation récente.
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