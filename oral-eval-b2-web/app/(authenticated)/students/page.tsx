"use client";

import { Search, Mail } from "lucide-react";
import { useClasses, useStudents } from "@/lib/classStorage";
import { useMemo, useState } from "react";
import Link from "next/link";

export default function StudentsPage() {
  const { classes } = useClasses();
  const { students } = useStudents();
  const [searchQuery, setSearchQuery] = useState("");

  const mappedStudents = useMemo(() => {
    return students.map(s => {
      const cls = classes.find(c => String(c.id) === String(s.classId));
      return {
        ...s,
        className: cls ? cls.name : "Classe inconnue",
      };
    });
  }, [students, classes]);

  const filteredStudents = mappedStudents.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.className.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold leading-7 text-slate-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Aperçu Global des Étudiants
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Liste de tous les étudiants inscrits sur la plateforme (vue administrateur). 
            Pour gérer les invitations, rendez-vous dans la classe correspondante.
          </p>
        </div>
        <div className="mt-4 flex sm:ml-4 sm:mt-0 gap-3">
          <div className="relative rounded-md shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-slate-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              name="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full rounded-md border-0 py-2 pl-10 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
              placeholder="Rechercher un étudiant..."
            />
          </div>
        </div>
      </div>

      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow-sm ring-1 ring-black ring-opacity-5 sm:rounded-2xl border border-slate-100 bg-white">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-slate-900 sm:pl-6">
                      Nom
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                      ID
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                      Classe
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                      Dernière Note
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                      Statut
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {filteredStudents.length > 0 ? filteredStudents.map((person) => (
                    <tr key={person.id} className="hover:bg-slate-50 transition-colors">
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
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
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                        {person.id}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                        <Link href={`/classes/${person.classId}/students`} className="text-blue-600 hover:underline">
                          {person.className}
                        </Link>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-900 font-medium">
                        {person.latestScore}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                          person.status === "Évalué" ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20" :
                          person.status === "Actif" ? "bg-blue-50 text-blue-700 ring-blue-600/20" :
                          "bg-amber-50 text-amber-700 ring-amber-600/20"
                        }`}>
                          {person.status}
                        </span>
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <Link href="/evaluations" className="text-blue-600 hover:text-blue-900">
                          Évaluer<span className="sr-only">, {person.name}</span>
                        </Link>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-sm text-slate-500">
                        Aucun étudiant trouvé.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
