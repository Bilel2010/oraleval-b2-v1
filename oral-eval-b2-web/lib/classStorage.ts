"use client";

import { useState, useEffect } from "react";

// Class Types
export type ClassItem = {
  id: string | number;
  name: string;
  level: string;
  students: number;
  nextSession: string;
  progress: string;
  avgScore: string;
  evalCount: number;
  trend: "up" | "down";
  status: "today" | "close" | "normal";
  description?: string;
  code?: string;
};

const STORAGE_KEY = "oraleval_classes";

const INITIAL_MOCK_CLASSES: ClassItem[] = [
  { 
    id: "1", 
    name: "B2 Intensif - Matin", 
    level: "B2",
    code: "B2-X9K2",
    students: 24, 
    nextSession: "Aujourd'hui 10:00", 
    progress: "75%",
    avgScore: "14.5/20",
    evalCount: 18,
    trend: "up",
    status: "today"
  },
  { 
    id: "2", 
    name: "B2 Extensif - Soir", 
    level: "B2",
    code: "B2-V3P7",
    students: 18, 
    nextSession: "Demain 18:30", 
    progress: "45%",
    avgScore: "12.8/20",
    evalCount: 8,
    trend: "down",
    status: "close"
  },
  { 
    id: "3", 
    name: "Atelier Oral B2", 
    level: "B2",
    code: "B2-M4L9",
    students: 12, 
    nextSession: "12 Mai 14:00", 
    progress: "90%",
    avgScore: "16.2/20",
    evalCount: 22,
    trend: "up",
    status: "normal"
  },
  { 
    id: "4", 
    name: "Préparation DELF B2", 
    level: "B2",
    code: "B2-R8N1",
    students: 32, 
    nextSession: "15 Mai 09:00", 
    progress: "20%",
    avgScore: "11.5/20",
    evalCount: 5,
    trend: "down",
    status: "normal"
  },
];

export function getClasses(): ClassItem[] {
  if (typeof window === "undefined") return INITIAL_MOCK_CLASSES; // For SSR
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MOCK_CLASSES));
    return INITIAL_MOCK_CLASSES;
  }
  return JSON.parse(data);
}

export function saveClasses(classes: ClassItem[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(classes));
    window.dispatchEvent(new Event('classesUpdated'));
  }
}

export function addClass(newClass: ClassItem) {
  const classes = getClasses();
  classes.unshift(newClass); 
  saveClasses(classes);
}

export function deleteClass(id: string | number) {
  const classes = getClasses().filter(c => String(c.id) !== String(id));
  saveClasses(classes);
}

export function updateClass(updatedClass: ClassItem) {
  const classes = getClasses().map(c =>
    String(c.id) === String(updatedClass.id) ? updatedClass : c
  );
  saveClasses(classes);
}

export function useClasses() {
  const [classes, setClassesState] = useState<ClassItem[]>([]);

  useEffect(() => {
    // Load initially
    setClassesState(getClasses());

    // Listen for custom events
    const handleUpdate = () => {
      setClassesState(getClasses());
    };

    window.addEventListener('classesUpdated', handleUpdate);
    return () => window.removeEventListener('classesUpdated', handleUpdate);
  }, []);

  return { classes, addClass, updateClass, deleteClass };
}

// Student Storage Types
export type StudentItem = {
  id: string;
  classId: string | number;
  name: string;
  email: string;
  latestScore: string;
  status: "Actif" | "Invité" | "Évalué";
};

const STUDENTS_STORAGE_KEY = "oraleval_students";

const INITIAL_MOCK_STUDENTS: StudentItem[] = [
  { id: "STU-001", classId: "1", name: "Marie Dubois", email: "marie.dubois@email.com", latestScore: "16/20", status: "Évalué" },
  { id: "STU-003", classId: "1", name: "Emma Bernard", email: "emma.bernard@email.com", latestScore: "-", status: "Actif" },
  { id: "STU-008", classId: "1", name: "Hugo Lloris", email: "hugo.lloris@email.com", latestScore: "-", status: "Invité" },
  { id: "STU-002", classId: "2", name: "Lucas Martin", email: "lucas.martin@email.com", latestScore: "13.5/20", status: "Évalué" },
];

export function getStudents(): StudentItem[] {
  if (typeof window === "undefined") return INITIAL_MOCK_STUDENTS;
  const data = localStorage.getItem(STUDENTS_STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STUDENTS_STORAGE_KEY, JSON.stringify(INITIAL_MOCK_STUDENTS));
    return INITIAL_MOCK_STUDENTS;
  }
  return JSON.parse(data);
}

export function saveStudents(students: StudentItem[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem(STUDENTS_STORAGE_KEY, JSON.stringify(students));
    window.dispatchEvent(new Event('studentsUpdated'));
  }
}

export function addStudent(newStudent: StudentItem) {
  const students = getStudents();
  students.unshift(newStudent);
  saveStudents(students);
}

export function deleteStudent(id: string) {
  const students = getStudents().filter(s => s.id !== id);
  saveStudents(students);
}

export function updateStudent(updatedStudent: StudentItem) {
  const students = getStudents().map(s =>
    s.id === updatedStudent.id ? updatedStudent : s
  );
  saveStudents(students);
}

export function useStudents() {
  const [students, setStudentsState] = useState<StudentItem[]>([]);

  useEffect(() => {
    setStudentsState(getStudents());

    const handleUpdate = () => {
      setStudentsState(getStudents());
    };

    window.addEventListener('studentsUpdated', handleUpdate);
    return () => window.removeEventListener('studentsUpdated', handleUpdate);
  }, []);

  return { students, addStudent, updateStudent, deleteStudent };
}

// ─── Evaluation History ────────────────────────────────────────────────────
export type EvaluationEntry = {
  id: string;
  scores: Record<string, number>;
  remarks: Record<string, string>;
  globalRemark: string;
  finalScore20: number;
  totalScore: number;
  maxScore: number;
  status: "Évalué";
  evaluatedAt: string; // ISO date string
};

// Record<studentId, EvaluationEntry[]>
export type EvalHistory = Record<string, EvaluationEntry[]>;

const EVAL_HISTORY_KEY = "oraleval_eval_history";

export function getEvalHistory(): EvalHistory {
  if (typeof window === "undefined") return {};
  const data = localStorage.getItem(EVAL_HISTORY_KEY);
  return data ? JSON.parse(data) : {};
}

export function saveEvalHistory(history: EvalHistory) {
  if (typeof window !== "undefined") {
    localStorage.setItem(EVAL_HISTORY_KEY, JSON.stringify(history));
    window.dispatchEvent(new Event("evalHistoryUpdated"));
  }
}

export function getStudentEvals(studentId: string): EvaluationEntry[] {
  return getEvalHistory()[studentId] ?? [];
}

export function getLatestEval(studentId: string): EvaluationEntry | null {
  const evals = getStudentEvals(studentId);
  return evals.length > 0 ? evals[evals.length - 1] : null;
}

export function saveNewEval(studentId: string, entry: Omit<EvaluationEntry, "id" | "evaluatedAt">) {
  const history = getEvalHistory();
  const existing = history[studentId] ?? [];
  const newEntry: EvaluationEntry = {
    ...entry,
    id: `eval_${Date.now()}`,
    evaluatedAt: new Date().toISOString(),
  };
  history[studentId] = [...existing, newEntry];
  saveEvalHistory(history);
  return newEntry;
}

export function useEvalHistory() {
  const [history, setHistory] = useState<EvalHistory>({});

  useEffect(() => {
    setHistory(getEvalHistory());
    const handler = () => setHistory(getEvalHistory());
    window.addEventListener("evalHistoryUpdated", handler);
    return () => window.removeEventListener("evalHistoryUpdated", handler);
  }, []);

  return { history, getStudentEvals, getLatestEval, saveNewEval };
}
