"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { 
  Save, User, BookOpen, AlertCircle, FileText, Download, FileSpreadsheet, 
  Check, ArrowLeft, Paperclip, MessageSquare, Plus, Trash2, Edit3 
} from "lucide-react";
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer 
} from "recharts";
import { useClasses, useStudents, updateStudent, useEvalHistory, saveNewEval, getLatestEval, EvaluationEntry } from "@/lib/classStorage";
import { RotateCcw, History } from "lucide-react";
import { useProfile } from "@/lib/profileStorage";

type Criterion = {
  id: string;
  name: string;
  description: string;
  maxScore: number;
  isDefault: boolean;
  includeInTotal: boolean;
  includeInRadar: boolean;
};

type Section = {
  id: string;
  title: string;
  description: string;
  category: "Contenu verbal" | "Non verbal" | "Support visuel" | "Autre";
  isDefault: boolean;
  criteria: Criterion[];
};

type Student = {
  id: string;
  name: string;
  className: string;
  topic?: string;
  files?: { name: string, size: string }[];
};

type EvaluationData = {
  scores: Record<string, number>;
  remarks: Record<string, string>;
  globalRemark: string;
};

const DEFAULT_SECTIONS: Section[] = [
  {
    id: "sec_a",
    title: "A. Contenu et langage verbal",
    description: "Évaluation de la structure, du vocabulaire et de l'interaction.",
    category: "Contenu verbal",
    isDefault: true,
    criteria: [
      { id: "crit_prag", name: "Compétence pragmatique", description: "Développement, clarté, cohérence et aisance.", maxScore: 8, isDefault: true, includeInTotal: true, includeInRadar: true },
      { id: "crit_socio", name: "Compétence sociolinguistique", description: "Adaptation au contexte et registre de langue.", maxScore: 4, isDefault: true, includeInTotal: true, includeInRadar: true },
      { id: "crit_ling", name: "Compétence linguistique", description: "Morphosyntaxe, lexique et phonologie.", maxScore: 8, isDefault: true, includeInTotal: true, includeInRadar: true },
    ]
  },
  {
    id: "sec_b",
    title: "B. Langage non verbal",
    description: "Posture, regard, gestuelle et intonation.",
    category: "Non verbal",
    isDefault: true,
    criteria: [
      { id: "crit_corps", name: "Langage du corps", description: "Posture dynamique, contact visuel, gestes appropriés.", maxScore: 10, isDefault: true, includeInTotal: true, includeInRadar: true },
      { id: "crit_para", name: "Langage paraverbal", description: "Volume, débit, rythme et intonation expressive.", maxScore: 10, isDefault: true, includeInTotal: true, includeInRadar: true },
    ]
  },
  {
    id: "sec_c",
    title: "C. Support visuel",
    description: "Utilisation et pertinence des supports de présentation.",
    category: "Support visuel",
    isDefault: true,
    criteria: [
      { id: "crit_vis", name: "Qualité et pertinence", description: "Le support aide à la compréhension sans être lu.", maxScore: 10, isDefault: true, includeInTotal: true, includeInRadar: true }
    ]
  }
];

export default function EvaluationsPage() {
  const { profile } = useProfile();
  const [mode, setMode] = useState<"scoring" | "edit" | "synthesis">("scoring");
  const [gridTemplate, setGridTemplate] = useState<Section[]>(DEFAULT_SECTIONS);
  const { classes } = useClasses();
  const { students } = useStudents();
  const { history } = useEvalHistory();

  const mappedStudents = useMemo(() => {
    return students.map(s => {
      const cls = classes.find(c => String(c.id) === String(s.classId));
      return {
        id: s.id,
        name: s.name,
        className: cls ? cls.name : "Classe inconnue",
        topic: "Sujet au choix",
        files: [] as { name: string; size: string }[]
      };
    });
  }, [students, classes]);

  const uniqueClasses = useMemo(() => classes.map(c => c.name), [classes]);
  const [activeClass, setActiveClass] = useState<string>("");

  useEffect(() => {
    if (classes.length > 0 && !activeClass) setActiveClass(classes[0].name);
  }, [classes, activeClass]);

  const filteredStudents = useMemo(
    () => mappedStudents.filter(s => s.className === activeClass),
    [mappedStudents, activeClass]
  );

  const [activeStudentId, setActiveStudentId] = useState<string>("");

  // When class changes, pick first student
  useEffect(() => {
    if (filteredStudents.length > 0) {
      setActiveStudentId(filteredStudents[0].id);
    } else {
      setActiveStudentId("");
    }
  }, [activeClass]); // eslint-disable-line react-hooks/exhaustive-deps

  // In-session evaluation scores (one entry per student, resets on "Nouvelle évaluation")
  const [evaluations, setEvaluations] = useState<Record<string, EvaluationData>>({});
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load latest saved eval into scoring session when student changes
  useEffect(() => {
    if (!activeStudentId) return;
    const latest = getLatestEval(activeStudentId);
    if (latest && !evaluations[activeStudentId]) {
      setEvaluations(prev => ({
        ...prev,
        [activeStudentId]: {
          scores: latest.scores,
          remarks: latest.remarks,
          globalRemark: latest.globalRemark,
        }
      }));
    }
  }, [activeStudentId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleClassChange = (newClass: string) => {
    setActiveClass(newClass);
    const ns = mappedStudents.filter(s => s.className === newClass);
    setActiveStudentId(ns.length > 0 ? ns[0].id : "");
  };

  const generateId = () => Math.random().toString(36).substring(2, 9);

  const currentEval: EvaluationData = evaluations[activeStudentId] ?? { scores: {}, remarks: {}, globalRemark: "" };

  const studentHistory: EvaluationEntry[] = history[activeStudentId] ?? [];
  const latestSavedEval: EvaluationEntry | null = studentHistory.length > 0 ? studentHistory[studentHistory.length - 1] : null;

  const handleStartNewEval = () => {
    setEvaluations(prev => ({
      ...prev,
      [activeStudentId]: { scores: {}, remarks: {}, globalRemark: "" }
    }));
  };

  const handleScoreChange = (critId: string, val: string) => {
    setEvaluations(prev => ({
      ...prev,
      [activeStudentId]: {
        ...currentEval,
        scores: { ...currentEval.scores, [critId]: parseFloat(val) || 0 }
      }
    }));
  };

  const handleRemarkChange = (critId: string, val: string) => {
    setEvaluations(prev => ({
      ...prev,
      [activeStudentId]: {
        ...currentEval,
        remarks: { ...currentEval.remarks, [critId]: val }
      }
    }));
  };

  const handleGlobalRemarkChange = (val: string) => {
    setEvaluations(prev => ({
      ...prev,
      [activeStudentId]: {
        ...currentEval,
        globalRemark: val
      }
    }));
  };

  const activeStudent: Student = useMemo(() => (
    mappedStudents.find(s => s.id === activeStudentId) ??
    filteredStudents[0] ??
    { id: "0", name: "Aucun étudiant", className: "", topic: "", files: [] as { name: string; size: string }[] }
  ), [activeStudentId, filteredStudents, mappedStudents]);

  const safeStudent: Student = {
    ...activeStudent,
    topic: activeStudent.topic ?? "",
    files: activeStudent.files ?? [],
  };

  const { total50, currentTotal, dynamicMax, chartData } = useMemo(() => {
    let t50 = 0;
    let currTotal = 0;
    let dynMax = 0;
    const radarItems: any[] = [];

    gridTemplate.forEach(sec => {
      sec.criteria.forEach(crit => {
        const score = currentEval.scores[crit.id] || 0;
        if (crit.isDefault) t50 += score;
        if (crit.includeInTotal) { currTotal += score; dynMax += crit.maxScore; }
        if (crit.includeInRadar) {
          radarItems.push({
            subject: crit.name.length > 15 ? crit.name.substring(0, 15) + '...' : crit.name,
            score: (score / crit.maxScore) * 100,
            fullMark: 100
          });
        }
      });
    });

    return { total50: t50, currentTotal: currTotal, dynamicMax: dynMax, chartData: radarItems };
  }, [gridTemplate, currentEval.scores]);

  // --- Report Generation Logic ---
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const synthesisRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = async () => {
    if (!synthesisRef.current) return;
    setIsExporting("pdf");
    try {
      const { jsPDF } = await import("jspdf");
      const html2canvas = (await import("html2canvas")).default;
      
      const canvas = await html2canvas(synthesisRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff"
      });
      
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Evaluation_${safeStudent.name.replace(/\s+/g, "_")}_${new Date().toLocaleDateString("fr-FR").replace(/\//g, "-")}.pdf`);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("PDF Export failed", err);
    } finally {
      setIsExporting(null);
    }
  };

  const handleDownloadXLSX = async () => {
    setIsExporting("xlsx");
    try {
      const { utils, writeFile } = await import("xlsx");
      
      const data = [
        ["RAPPORT D'ÉVALUATION DELF B2"],
        [""],
        ["Candidat", safeStudent.name],
        ["ID", safeStudent.id],
        ["Classe", safeStudent.className],
        ["Sujet", safeStudent.topic || ""],
        ["Date", new Date().toLocaleDateString("fr-FR")],
        ["Évaluateur", profile.fullName || "Professeur"],
        [""],
        ["CRITÈRES", "NOTE", "MAX", "REMARQUES"]
      ];

      gridTemplate.forEach(section => {
        data.push([section.title.toUpperCase(), "", "", ""]);
        section.criteria.forEach(crit => {
          data.push([
            crit.name,
            currentEval.scores[crit.id] || 0,
            crit.maxScore,
            currentEval.remarks[crit.id] || ""
          ]);
        });
      });

      data.push([""]);
      data.push(["NOTE FINALE", convertedScore20.toFixed(1), "/20", ""]);
      data.push(["Appréciation globale", currentEval.globalRemark || "", "", ""]);

      const ws = utils.aoa_to_sheet(data);
      const wb = utils.book_new();
      utils.book_append_sheet(wb, ws, "Evaluation");
      writeFile(wb, `Evaluation_${safeStudent.name.replace(/\s+/g, "_")}.xlsx`);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("XLSX Export failed", err);
    } finally {
      setIsExporting(null);
    }
  };

  const handleDownloadCSV = () => {
    setIsExporting("csv");
    try {
      let csv = "Critère,Note,Max,Remarque\n";
      gridTemplate.forEach(section => {
        section.criteria.forEach(crit => {
          csv += `"${crit.name}",${currentEval.scores[crit.id] || 0},${crit.maxScore},"${(currentEval.remarks[crit.id] || "").replace(/"/g, '""')}"\n`;
        });
      });
      csv += `\nNOTE FINALE,${convertedScore20.toFixed(1)},/20,\n`;
      csv += `Appréciation globale,"${(currentEval.globalRemark || "").replace(/"/g, '""')}"`;

      const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `Evaluation_${safeStudent.name.replace(/\s+/g, "_")}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setIsExporting(null);
    }
  };

  const handleDownloadDOCX = async () => {
    setIsExporting("docx");
    try {
      const { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, AlignmentType } = await import("docx");
      const { saveAs } = (await import("file-saver")).default || { saveAs: (blob: any, name: any) => {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = name;
        link.click();
      }};

      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            new Paragraph({ text: "RAPPORT D'ÉVALUATION DELF B2", heading: HeadingLevel.HEADING_1, alignment: AlignmentType.CENTER }),
            new Paragraph({ text: `Candidat : ${safeStudent.name}`, spacing: { before: 400 } }),
            new Paragraph({ text: `Classe : ${safeStudent.className}` }),
            new Paragraph({ text: `Date : ${new Date().toLocaleDateString("fr-FR")}` }),
            new Paragraph({ text: `Évaluateur : ${profile.fullName || "Professeur"}`, spacing: { after: 400 } }),
            
            new Paragraph({ text: "RÉSULTATS PAR CRITÈRE", heading: HeadingLevel.HEADING_2, spacing: { before: 400, after: 200 } }),
            
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Critère", bold: true })] })] }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Note", bold: true })] })] }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Max", bold: true })] })] }),
                  ],
                }),
                ...gridTemplate.flatMap(section => 
                  section.criteria.map(crit => 
                    new TableRow({
                      children: [
                        new TableCell({ children: [new Paragraph(crit.name)] }),
                        new TableCell({ children: [new Paragraph(String(currentEval.scores[crit.id] || 0))] }),
                        new TableCell({ children: [new Paragraph(String(crit.maxScore))] }),
                      ],
                    })
                  )
                ),
              ],
            }),

            new Paragraph({ text: `\nNOTE FINALE : ${convertedScore20.toFixed(1)} / 20`, heading: HeadingLevel.HEADING_2, spacing: { before: 400 } }),
            new Paragraph({ text: "Appréciation globale :", bold: true, spacing: { before: 200 } }),
            new Paragraph({ text: currentEval.globalRemark || "Aucune appréciation.", italic: true }),
          ],
        }],
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, `Evaluation_${safeStudent.name.replace(/\s+/g, "_")}.docx`);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("DOCX Export failed", err);
    } finally {
      setIsExporting(null);
    }
  };

  const convertedScore20 = dynamicMax > 0 ? (currentTotal / dynamicMax) * 20 : 0;

  const handleSaveEvaluation = () => {
    if (!activeStudentId || activeStudentId === "0") return;
    const score20 = dynamicMax > 0 ? (currentTotal / dynamicMax) * 20 : 0;
    const formattedScore = `${score20.toFixed(1)}/20`;
    const stu = students.find(s => s.id === activeStudentId);
    saveNewEval(activeStudentId, {
      scores: currentEval.scores,
      remarks: currentEval.remarks,
      globalRemark: currentEval.globalRemark,
      finalScore20: score20,
      totalScore: currentTotal,
      maxScore: dynamicMax,
      status: "Évalué",
    });
    updateStudent({
      id: activeStudentId,
      classId: classes.find(c => c.name === activeClass)?.id ?? stu?.classId ?? "",
      name: activeStudent.name,
      email: stu?.email ?? "",
      latestScore: formattedScore,
      status: "Évalué"
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };


  const addSection = () => {
    setGridTemplate(prev => [
      ...prev, 
      { id: `sec_${generateId()}`, title: "Nouvelle Section", description: "", category: "Autre", isDefault: false, criteria: [] }
    ]);
  };

  const deleteSection = (secId: string) => {
    setGridTemplate(prev => prev.filter(s => s.id !== secId));
  };

  const updateSection = (secId: string, field: keyof Section, value: any) => {
    setGridTemplate(prev => prev.map(s => s.id === secId ? { ...s, [field]: value } : s));
  };

  const addCriterion = (secId: string) => {
    setGridTemplate(prev => prev.map(s => {
      if (s.id === secId) {
        return {
          ...s,
          criteria: [...s.criteria, { id: `crit_${generateId()}`, name: "Nouveau critère", description: "", maxScore: 5, isDefault: false, includeInTotal: true, includeInRadar: true }]
        };
      }
      return s;
    }));
  };

  const deleteCriterion = (secId: string, critId: string) => {
    setGridTemplate(prev => prev.map(s => {
      if (s.id === secId) {
        return { ...s, criteria: s.criteria.filter(c => c.id !== critId) };
      }
      return s;
    }));
  };

  const updateCriterion = (secId: string, critId: string, field: keyof Criterion, value: any) => {
    setGridTemplate(prev => prev.map(s => {
      if (s.id === secId) {
        return {
          ...s,
          criteria: s.criteria.map(c => {
            if (c.id === critId) {
              const updated = { ...c, [field]: value };
              if (field === 'maxScore') {
                const newMax = parseFloat(value) || 0;
                setEvaluations(evals => {
                  const newEvals = { ...evals };
                  for (const stId in newEvals) {
                    if ((newEvals[stId]?.scores[critId] || 0) > newMax) {
                      newEvals[stId] = {
                        ...newEvals[stId],
                        scores: { ...newEvals[stId].scores, [critId]: newMax }
                      };
                    }
                  }
                  return newEvals;
                });
              }
              return updated;
            }
            return c;
          })
        };
      }
      return s;
    }));
  };

  const renderEditGrid = () => (
    <div className="space-y-8 pb-20">
      <div className="flex justify-between items-center border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Éditeur de grille d'évaluation</h2>
          <p className="text-sm text-slate-500">Modifiez la grille, ajoutez des sections ou des critères personnalisés.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setMode("scoring")} className="px-4 py-2 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition-colors">
            Annuler les modifications
          </button>
          <button onClick={() => setMode("scoring")} className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-500 flex items-center gap-2 transition-colors">
            <Save className="h-4 w-4" /> Enregistrer la grille
          </button>
        </div>
      </div>

      {gridTemplate.map(section => (
        <div key={section.id} className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
          <div className="bg-slate-50 p-6 border-b border-slate-200 flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div className="flex-1 mr-4 space-y-3">
                {section.isDefault ? (
                  <>
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      {section.title}
                      <span className="text-xs font-semibold bg-slate-200 text-slate-600 px-2 py-0.5 rounded">Critère par défaut DELF</span>
                    </h3>
                    <input 
                      type="text" 
                      value={section.description} 
                      onChange={(e) => updateSection(section.id, "description", e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-md px-3 py-1.5 text-sm"
                      placeholder="Description de la section..."
                    />
                  </>
                ) : (
                  <>
                    <input 
                      type="text" 
                      value={section.title} 
                      onChange={(e) => updateSection(section.id, "title", e.target.value)}
                      className="w-full font-bold text-lg border border-slate-300 rounded-md px-3 py-1.5"
                      placeholder="Titre de la section..."
                    />
                    <input 
                      type="text" 
                      value={section.description} 
                      onChange={(e) => updateSection(section.id, "description", e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-md px-3 py-1.5 text-sm"
                      placeholder="Description de la section..."
                    />
                  </>
                )}
              </div>
              {!section.isDefault && (
                <button onClick={() => deleteSection(section.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                  <Trash2 className="h-5 w-5" />
                </button>
              )}
            </div>
            {!section.isDefault && (
               <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1 block">Catégorie</label>
                  <select 
                    value={section.category} 
                    onChange={(e) => updateSection(section.id, "category", e.target.value)}
                    className="border border-slate-300 rounded-md px-3 py-1.5 text-sm"
                  >
                    <option value="Contenu verbal">Contenu verbal</option>
                    <option value="Non verbal">Non verbal</option>
                    <option value="Support visuel">Support visuel</option>
                    <option value="Autre">Autre</option>
                  </select>
               </div>
            )}
          </div>
          <div className="p-6 space-y-6">
            {section.criteria.map(crit => (
              <div key={crit.id} className="flex gap-4 items-start pb-6 border-b border-slate-100 last:pb-0 last:border-0">
                <div className="flex-1 space-y-3">
                  <div className="flex gap-3">
                    <input 
                      type="text" 
                      value={crit.name} 
                      onChange={(e) => updateCriterion(section.id, crit.id, "name", e.target.value)}
                      disabled={crit.isDefault}
                      className={`flex-1 font-semibold border ${crit.isDefault ? 'bg-slate-50 border-transparent text-slate-700' : 'border-slate-300'} rounded-md px-3 py-1.5 text-sm`}
                      placeholder="Nom du critère..."
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-500">Max:</span>
                      <input 
                        type="number" 
                        value={crit.maxScore} 
                        onChange={(e) => updateCriterion(section.id, crit.id, "maxScore", parseFloat(e.target.value))}
                        disabled={crit.isDefault}
                        min="0" step="0.5"
                        className={`w-20 border ${crit.isDefault ? 'bg-slate-50 border-transparent' : 'border-slate-300'} rounded-md px-3 py-1.5 text-sm`}
                      />
                    </div>
                  </div>
                  <input 
                    type="text" 
                    value={crit.description} 
                    onChange={(e) => updateCriterion(section.id, crit.id, "description", e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-md px-3 py-1.5 text-sm"
                    placeholder="Description du critère..."
                  />
                  {!crit.isDefault && (
                    <div className="flex gap-4 pt-2">
                      <label className="flex items-center gap-2 text-sm text-slate-600">
                        <input 
                          type="checkbox" 
                          checked={crit.includeInTotal} 
                          onChange={(e) => updateCriterion(section.id, crit.id, "includeInTotal", e.target.checked)}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        /> Inclure dans le total
                      </label>
                      <label className="flex items-center gap-2 text-sm text-slate-600">
                        <input 
                          type="checkbox" 
                          checked={crit.includeInRadar} 
                          onChange={(e) => updateCriterion(section.id, crit.id, "includeInRadar", e.target.checked)}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        /> Inclure dans le graphique radar
                      </label>
                    </div>
                  )}
                </div>
                {!crit.isDefault && (
                  <button onClick={() => deleteCriterion(section.id, crit.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg shrink-0">
                    <Trash2 className="h-5 w-5" />
                  </button>
                )}
                {crit.isDefault && (
                  <div className="text-xs font-medium text-slate-400 p-2 shrink-0 flex flex-col items-end">
                    <span>Critère protégé</span>
                  </div>
                )}
              </div>
            ))}
            <button onClick={() => addCriterion(section.id)} className="mt-2 text-sm font-semibold text-blue-600 flex items-center gap-2 hover:text-blue-700 transition-colors">
              <Plus className="h-4 w-4" /> Ajouter un critère personnalisé
            </button>
          </div>
        </div>
      ))}
      <button onClick={addSection} className="w-full py-4 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 font-semibold flex justify-center items-center gap-2 hover:border-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors">
        <Plus className="h-5 w-5" /> Ajouter une section personnalisée
      </button>
    </div>
  );

  const renderScoringGrid = () => (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
      <div className="lg:col-span-8 space-y-8">
        {gridTemplate.map(section => {
          const sectionMax = section.criteria.filter(c => c.includeInTotal).reduce((sum, c) => sum + c.maxScore, 0);
          const sectionCurrent = section.criteria.filter(c => c.includeInTotal).reduce((sum, c) => sum + (currentEval.scores[c.id] || 0), 0);

          const accentClassByCategory: Record<Section["category"], string> = {
            "Contenu verbal": "accent-blue-600",
            "Non verbal": "accent-emerald-600",
            "Support visuel": "accent-amber-600",
            "Autre": "accent-violet-600",
          };
          const badgeClassByCategory: Record<Section["category"], string> = {
            "Contenu verbal": "bg-blue-50 text-blue-700 ring-blue-700/20",
            "Non verbal": "bg-emerald-50 text-emerald-700 ring-emerald-700/20",
            "Support visuel": "bg-amber-50 text-amber-700 ring-amber-700/20",
            "Autre": "bg-violet-50 text-violet-700 ring-violet-700/20",
          };
          const colorClass = accentClassByCategory[section.category];
          const badgeClass = badgeClassByCategory[section.category];

          return (
            <div key={section.id} className="bg-white shadow-sm ring-1 ring-slate-200 rounded-2xl overflow-hidden">
              <div className="bg-slate-50/50 px-6 py-5 border-b border-slate-100 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{section.title}</h3>
                  <p className="text-sm text-slate-500 mt-1">{section.description}</p>
                </div>
                <div className="flex flex-col items-end shrink-0 pl-4">
                  <span className="text-xs font-medium text-slate-500 mb-1 uppercase">TOTAL SECTION</span>
                  <span className={`font-mono font-bold text-lg px-3 py-1 rounded-lg ring-1 ring-inset ${badgeClass}`}>
                    {sectionCurrent} <span className="text-sm opacity-60">/ {sectionMax}</span>
                  </span>
                </div>
              </div>
              <div className="px-6 py-6 divide-y divide-slate-100">
                {section.criteria.map(crit => (
                  <div key={crit.id} className="py-6 first:pt-0 last:pb-0">
                    <div className="flex justify-between items-end mb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <label className="text-base font-medium text-slate-900">{crit.name}</label>
                          {!crit.isDefault && <span className="text-[10px] font-semibold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded uppercase">Personnalisé</span>}
                        </div>
                        <p className="text-sm text-slate-500 mt-0.5">{crit.description}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-2xl font-bold text-slate-900">{currentEval.scores[crit.id] || 0}</span>
                        <span className="text-slate-400 font-medium ml-1">/ {crit.maxScore}</span>
                      </div>
                    </div>
                    <input
                      type="range" min="0" max={crit.maxScore} step="0.5"
                      value={currentEval.scores[crit.id] || 0}
                      onChange={(e) => handleScoreChange(crit.id, e.target.value)}
                      className={`w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer ${colorClass} mb-4`}
                    />
                    <input 
                      type="text" 
                      placeholder="Remarque (optionnel)..." 
                      value={currentEval.remarks[crit.id] || ""}
                      onChange={(e) => handleRemarkChange(crit.id, e.target.value)}
                      className="block w-full rounded-md border-0 py-1.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        
        {/* Global Feedback */}
        <div className="bg-white shadow-sm ring-1 ring-slate-200 rounded-2xl overflow-hidden">
          <div className="bg-slate-50/50 px-6 py-5 border-b border-slate-100">
            <h3 className="text-lg font-semibold text-slate-900">Appréciation globale</h3>
            <p className="text-sm text-slate-500 mt-1">Commentaires généraux pour le candidat.</p>
          </div>
          <div className="px-6 py-6">
            <textarea
              rows={4}
              value={currentEval.globalRemark || ""}
              onChange={(e) => handleGlobalRemarkChange(e.target.value)}
              placeholder="Rédigez l'appréciation globale ici..."
              className="block w-full rounded-md border-0 py-2 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm"
            />
          </div>
        </div>
      </div>

      {/* Sidebar Synthesis Preview */}
      <div className="lg:col-span-4">
        <div className="sticky top-24 space-y-6">
          <div className="bg-white shadow-sm ring-1 ring-slate-200 rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-slate-100 flex items-center justify-center ring-2 ring-white shadow-sm">
                <User className="h-7 w-7 text-slate-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">{safeStudent.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">{safeStudent.id}</span>
                  <span className="text-sm text-slate-500">{safeStudent.className}</span>
                </div>
              </div>
            </div>
            <div className="mt-6 border-t border-slate-100 pt-5 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Thème de l'exposé</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <BookOpen className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    disabled
                    className="block w-full rounded-lg border-0 py-2.5 pl-10 text-slate-900 ring-1 ring-inset ring-slate-300 bg-slate-50 sm:text-sm font-medium"
                    value={safeStudent.topic ?? ""}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white shadow-sm ring-1 ring-slate-200 rounded-2xl overflow-hidden flex flex-col">
            <div className="p-6 pb-2">
              <h3 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-blue-600" /> Synthèse des résultats
              </h3>
              {chartData.length > 0 ? (
                <div className="h-56 w-full -ml-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                      <Radar name="Performance" dataKey="score" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.4} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                 <div className="h-56 w-full flex items-center justify-center text-sm text-slate-400 border-2 border-dashed border-slate-100 rounded-xl">Aucun critère sur le radar</div>
              )}
            </div>

            <div className="bg-slate-900 p-6 text-center mt-auto">
              <div className="grid grid-cols-2 gap-4 divide-x divide-slate-700">
                <div>
                  <p className="text-sm font-medium text-slate-400 mb-1">Total Personnalisé</p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-3xl font-bold text-white">{currentTotal.toFixed(1)}</span>
                    <span className="text-lg text-slate-500">/{dynamicMax}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-400 mb-1">Note Finale</p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-3xl font-bold text-blue-400">{convertedScore20.toFixed(1)}</span>
                    <span className="text-lg text-slate-500">/20</span>
                  </div>
                </div>
              </div>
              {dynamicMax !== 50 && (
                <p className="mt-4 text-xs text-slate-500 border-t border-slate-700 pt-3">
                  Score DELF B2 (Critères par défaut) : {total50.toFixed(1)} / 50
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSynthesis = () => (
    <div className="pb-10 max-w-5xl mx-auto">
      <div className="flex items-center justify-between border-b border-slate-200 pb-5 mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setMode("scoring")}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
            title="Retour à l'édition"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <div>
            <h2 className="text-2xl font-bold leading-7 text-slate-900 sm:truncate sm:tracking-tight">
              Synthèse de l'évaluation
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Aperçu du rapport final avant export.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleDownloadPDF}
            disabled={isExporting !== null}
            className="inline-flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 transition-colors disabled:opacity-50"
          >
            {isExporting === "pdf" ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-700 border-t-transparent" />
            ) : (
              <FileText className="h-4 w-4" />
            )}
            PDF
          </button>
          <button
            onClick={handleDownloadDOCX}
            disabled={isExporting !== null}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100 transition-colors disabled:opacity-50"
          >
            {isExporting === "docx" ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-700 border-t-transparent" />
            ) : (
              <FileText className="h-4 w-4" />
            )}
            DOCX
          </button>
          <button
            onClick={handleDownloadXLSX}
            disabled={isExporting !== null}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors disabled:opacity-50"
          >
            {isExporting === "xlsx" ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-700 border-t-transparent" />
            ) : (
              <FileSpreadsheet className="h-4 w-4" />
            )}
            XLSX
          </button>
          <button
            onClick={handleDownloadCSV}
            disabled={isExporting !== null}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200 transition-colors disabled:opacity-50"
          >
            {isExporting === "csv" ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-700 border-t-transparent" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            CSV
          </button>
        </div>
      </div>

      <div ref={synthesisRef} className="bg-white shadow-lg ring-1 ring-slate-200 rounded-lg overflow-hidden flex flex-col mx-auto border-t-8 border-t-blue-600">
        <div className="p-10 border-b border-slate-100 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Rapport d'évaluation DELF B2</h1>
            <p className="text-slate-500 mt-2 font-medium">Épreuve de production orale</p>
          </div>
          <div className="text-right text-sm text-slate-500 space-y-1">
            <p>Date : <span className="font-medium text-slate-900">{new Date().toLocaleDateString("fr-FR")}</span></p>
            <p>Évaluateur : <span className="font-medium text-slate-900">{profile.fullName || "Professeur"}</span></p>
          </div>
        </div>

        <div className="p-10 bg-slate-50 border-b border-slate-100 grid grid-cols-2 gap-8">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Informations Candidat</h3>
            <div className="space-y-3">
              <p className="text-sm"><span className="text-slate-500 w-24 inline-block">Nom :</span> <span className="font-semibold text-slate-900 text-base">{safeStudent.name}</span></p>
              <p className="text-sm"><span className="text-slate-500 w-24 inline-block">Identifiant :</span> <span className="font-medium text-slate-900">{safeStudent.id}</span></p>
              <p className="text-sm"><span className="text-slate-500 w-24 inline-block">Classe :</span> <span className="font-medium text-slate-900">{safeStudent.className}</span></p>
              <p className="text-sm"><span className="text-slate-500 w-24 inline-block">Sujet :</span> <span className="font-medium text-slate-900 italic">{safeStudent.topic ?? ""}</span></p>
            </div>
          </div>
          <div>
             <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Livrables / Supports</h3>
             <ul className="space-y-2">
               {safeStudent.files && safeStudent.files.length > 0 ? safeStudent.files.map((f, i) => (
                 <li key={i} className="flex items-center gap-3 text-sm">
                   <Paperclip className="h-4 w-4 text-blue-500" />
                   <span className="font-medium text-slate-700">{f.name}</span>
                   <span className="text-slate-400">({f.size})</span>
                 </li>
               )) : (
                 <li className="text-sm text-slate-500 italic">Aucun document déposé</li>
               )}
             </ul>
          </div>
        </div>

        <div className="p-10 grid grid-cols-12 gap-10 border-b border-slate-100">
          <div className="col-span-7">
             <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">Grille de notation</h3>
             <div className="space-y-6">
               {gridTemplate.map(section => {
                 const secCurrent = section.criteria.filter(c => c.includeInTotal).reduce((s, c) => s + (currentEval.scores[c.id] || 0), 0);
                 const secMax = section.criteria.filter(c => c.includeInTotal).reduce((s, c) => s + c.maxScore, 0);
                 return (
                   <div key={section.id}>
                     <div className="flex justify-between items-center border-b-2 border-slate-900 pb-2 mb-3">
                       <span className="font-bold text-slate-900">{section.title}</span>
                       <span className="font-bold text-slate-900">{secCurrent} / {secMax}</span>
                     </div>
                     <div className="space-y-2 text-sm">
                       {section.criteria.map(crit => (
                         <div key={crit.id}>
                           <div className="flex justify-between">
                             <span className="text-slate-600">{crit.name}</span>
                             <span className="font-medium">{currentEval.scores[crit.id] || 0}/{crit.maxScore}</span>
                           </div>
                           {currentEval.remarks[crit.id] && (
                             <p className="text-slate-500 text-xs italic pl-4 border-l-2 border-slate-200 mt-1">{currentEval.remarks[crit.id]}</p>
                           )}
                         </div>
                       ))}
                     </div>
                   </div>
                 );
               })}
             </div>
          </div>
          
          <div className="col-span-5 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6 text-center">Profil de performance</h3>
              <div className="h-64 w-full">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                      <Radar name="Performance" dataKey="score" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.4} />
                    </RadarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-sm text-slate-400 border-2 border-dashed border-slate-100 rounded-xl">Aucun critère sur le radar</div>
                )}
              </div>
            </div>
            
            <div className="bg-slate-900 rounded-xl p-6 text-white mt-8">
               <div className="text-center mb-4">
                 <p className="text-slate-400 text-sm font-medium mb-1">NOTE FINALE</p>
                 <div className="flex items-baseline justify-center gap-1">
                   <span className="text-5xl font-bold">{convertedScore20.toFixed(1)}</span>
                   <span className="text-xl text-slate-500">/20</span>
                 </div>
               </div>
               <div className="border-t border-slate-700 pt-4 text-center">
                 <p className="text-sm text-slate-400">Total personnalisé : <span className="font-bold text-white">{currentTotal.toFixed(1)} / {dynamicMax}</span></p>
               </div>
            </div>
          </div>
        </div>

        <div className="p-10 bg-blue-50/50">
           <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
             <MessageSquare className="h-4 w-4" /> Appréciation globale
           </h3>
           <div className="bg-white p-6 rounded-lg ring-1 ring-slate-200 shadow-sm text-slate-700 italic min-h-[100px]">
             {currentEval.globalRemark?.trim() ? currentEval.globalRemark : "Aucune appréciation globale saisie."}
           </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="pb-10 max-w-7xl mx-auto">

      {/* ── Compact, responsive header ── */}
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 pb-4 mb-6">
        {/* Title */}
        <h2 className="text-2xl font-bold text-slate-900 whitespace-nowrap">
          Évaluation DELF B2
        </h2>

        {/* Selectors — only in scoring mode */}
        {mode === "scoring" && (
          <>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-slate-500 whitespace-nowrap">Classe :</label>
              <select
                value={activeClass ?? ""}
                onChange={(e) => handleClassChange(e.target.value)}
                className="border-0 shadow-sm ring-1 ring-inset ring-slate-300 text-slate-900 font-semibold text-sm rounded-lg focus:ring-2 focus:ring-blue-600 py-1.5 px-2 bg-white"
              >
                {uniqueClasses.map(cls => <option key={cls} value={cls}>{cls}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-slate-500 whitespace-nowrap">Étudiant :</label>
              <select
                value={activeStudentId ?? ""}
                onChange={(e) => setActiveStudentId(e.target.value)}
                className="border-0 shadow-sm ring-1 ring-inset ring-slate-300 text-slate-900 font-semibold text-sm rounded-lg focus:ring-2 focus:ring-blue-600 py-1.5 px-2 bg-white"
              >
                {filteredStudents.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Action buttons */}
        {mode === "scoring" && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setMode("edit")}
              className="inline-flex items-center rounded-lg bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 transition-all"
            >
              <Edit3 className="-ml-0.5 mr-1.5 h-4 w-4" /> Modifier la grille
            </button>
            <button
              onClick={handleSaveEvaluation}
              className="inline-flex items-center rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 transition-all"
            >
              {saveSuccess
                ? <><Check className="-ml-0.5 mr-1.5 h-4 w-4" /> Enregistrée !</>
                : <><Save className="-ml-0.5 mr-1.5 h-4 w-4" /> Enregistrer</>}
            </button>
            <button
              onClick={() => setMode("synthesis")}
              className="inline-flex items-center rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-all"
            >
              <Check className="-ml-0.5 mr-1.5 h-4 w-4" /> Voir la synthèse
            </button>
          </div>
        )}
      </div>

      {/* ── Previous evaluation banner ── */}
      {mode === "scoring" && latestSavedEval && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-blue-200 bg-blue-50 px-5 py-3">
          <div className="flex items-center gap-3 text-sm text-blue-800">
            <History className="h-5 w-5 text-blue-500 shrink-0" />
            <span>
              <span className="font-semibold">Dernière évaluation enregistrée :</span>{" "}
              <span className="font-bold">{latestSavedEval.finalScore20.toFixed(1)}/20</span>
              {" "}&mdash;{" "}
              {new Date(latestSavedEval.evaluatedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
            </span>
          </div>
          <button
            onClick={handleStartNewEval}
            className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-sm font-semibold text-blue-700 shadow-sm ring-1 ring-inset ring-blue-300 hover:bg-blue-100 transition-colors"
          >
            <RotateCcw className="h-4 w-4" /> Nouvelle évaluation
          </button>
        </div>
      )}

      {/* ── History panel inside scoring if history has >1 entry ── */}
      {mode === "scoring" && studentHistory.length > 1 && (
        <details className="mb-5 rounded-xl border border-slate-200 bg-white">
          <summary className="flex cursor-pointer items-center gap-2 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-xl">
            <History className="h-4 w-4 text-slate-400" /> Historique des évaluations ({studentHistory.length})
          </summary>
          <div className="divide-y divide-slate-100 px-5 pb-3">
            {[...studentHistory].reverse().map((e, i) => (
              <div key={e.id} className="flex items-center justify-between py-2 text-sm">
                <span className="text-slate-500">
                  {i === 0 ? "Dernière : " : ""}{new Date(e.evaluatedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                </span>
                <span className="font-bold text-slate-900">{e.finalScore20.toFixed(1)}/20</span>
              </div>
            ))}
          </div>
        </details>
      )}

      {saveSuccess && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl bg-emerald-600 px-5 py-3 text-white shadow-xl">
          <Check className="h-5 w-5" />
          <span className="text-sm font-semibold">Évaluation enregistrée avec succès.</span>
        </div>
      )}

      {mode === "edit" && renderEditGrid()}
      {mode === "scoring" && renderScoringGrid()}
      {mode === "synthesis" && renderSynthesis()}
    </div>
  );
}
