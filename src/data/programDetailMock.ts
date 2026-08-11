/* ===============================================================
   PROGRAM DETAIL MOCK DATA
   Struktur mengikuti Excel: Program → Sections (A,B,C...) → Subtasks
   =============================================================== */

export type TaskStatus = "DONE" | "ON PROGRESS" | "NOT STARTED";

export interface Task {
  id: number;
  title: string;
  deliverable: string;
  dateRange: string;
  file?: string;
  status: TaskStatus;
  overdue?: boolean;
}

export interface Section {
  id: string;
  title: string;
  tasks: Task[];
}

export interface ProgramDetail {
  id: string;
  title: string;
  initiativeStrategy: string;
  pic: string;
  vpEmail?: string;
  picEmail?: string;
  programStatus?: "ON TRACK" | "OVERDUE" | "DUE SOON" | "BEHIND EXPECTED" | "COMPLETED";
  start: string;
  deadline: string;
  actual: number;
  expected: number;
  gap: number;
  overdue: number;
  sections: Section[];
}

/* ─────────────────────────────────────────────────────────────── */
/*  RKM PROGRAMS                                                   */
/* ─────────────────────────────────────────────────────────────── */

const rkmPrograms: ProgramDetail[] = [
  {
    id: "rkm-test-1",
    title: "Proyek Uji Overdue",
    initiativeStrategy: "IS-01-Uji Coba Sistem Notifikasi",
    pic: "Test PIC",
    vpEmail: "vp.test@pelindo.co.id",
    picEmail: "pic.test@pelindo.co.id",
    programStatus: "OVERDUE",
    start: "1 Januari 2026",
    deadline: "10 Januari 2026",
    actual: 10,
    expected: 100,
    gap: -90,
    overdue: 1,
    sections: []
  }
];

/* ─────────────────────────────────────────────────────────────── */
/*  NON-RKM PROGRAMS                                               */
/* ─────────────────────────────────────────────────────────────── */

const nonRkmPrograms: ProgramDetail[] = [];

/* ─────────────────────────────────────────────────────────────── */
/*  COMBINED MAP — for easy lookup by ID                           */
/* ─────────────────────────────────────────────────────────────── */

export const allPrograms: ProgramDetail[] = [...rkmPrograms, ...nonRkmPrograms];

export const programById = (id: string): ProgramDetail | undefined =>
  allPrograms.find((p) => p.id === id);

export { rkmPrograms, nonRkmPrograms };
