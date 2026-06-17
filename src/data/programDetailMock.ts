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
  /* ── 1. Tindaklanjut Pemurnian Bisnis 2026 ── */
  {
    id: "rkm-1",
    title: "Tindaklanjut Pemurnian Bisnis 2026",
    initiativeStrategy:
      "IS-02-Penataan dan Optimalisasi Model Bisnis (Struktur Korporasi)",
    pic: "VP Surya, Reza, Raghi",
    start: "1 Januari 2026",
    deadline: "30 Desember 2026",
    actual: 24,
    expected: 58,
    gap: -16,
    overdue: 3,
    sections: [
      {
        id: "A",
        title: "A: Serah Operasi Branch Reg 1,2,3,4",
        tasks: [
          {
            id: 1,
            title: "Pengumpulan data existing operasi Branch Reg 1,2,3,4",
            deliverable: "Data Inventory Branch",
            dateRange: "1 Jan - 15 Jan",
            file: "inventory_branch.pdf",
            status: "DONE",
          },
          {
            id: 2,
            title: "Penyusunan SOP serah terima operasi",
            deliverable: "SOP Serah Terima",
            dateRange: "16 Jan - 30 Jan",
            status: "ON PROGRESS",
            overdue: true,
          },
          {
            id: 3,
            title: "Koordinasi dengan Regional Manager terkait timeline",
            deliverable: "Notulen Rapat Koordinasi",
            dateRange: "1 Feb - 15 Feb",
            status: "NOT STARTED",
          },
          {
            id: 4,
            title: "Pelaksanaan serah terima operasional Branch Reg 1",
            deliverable: "Berita Acara Serah Terima Reg 1",
            dateRange: "1 Mar - 31 Mar",
            status: "NOT STARTED",
          },
        ],
      },
      {
        id: "B",
        title:
          "B: Pelaksanaan Pemurnian Bisnis Subholding Non-Petikemas (Vertikal Merge PTP)",
        tasks: [
          {
            id: 1,
            title: "Analisis struktur bisnis existing",
            deliverable: "Laporan Analisis Bisnis",
            dateRange: "1 Jan - 31 Jan",
            status: "DONE",
          },
          {
            id: 2,
            title: "Penyusunan rencana merger vertikal PTP",
            deliverable: "Dokumen Rencana Merger",
            dateRange: "1 Feb - 28 Feb",
            status: "ON PROGRESS",
          },
          {
            id: 3,
            title: "Koordinasi legal dan regulasi",
            deliverable: "Legal Opinion",
            dateRange: "1 Mar - 31 Mar",
            status: "NOT STARTED",
          },
        ],
      },
      {
        id: "C",
        title: "C: Serah Operasi Terminal Penumpang pada Branch SPMT",
        tasks: [
          {
            id: 1,
            title: "Pendataan aset terminal penumpang",
            deliverable: "Data Inventaris Aset",
            dateRange: "1 Jan - 15 Jan",
            file: "aset_terminal.pdf",
            status: "DONE",
          },
          {
            id: 2,
            title: "Penyerahan dokumen operasional",
            deliverable: "Berita Acara Serah Terima",
            dateRange: "16 Jan - 31 Jan",
            status: "NOT STARTED",
          },
          {
            id: 3,
            title: "Evaluasi pasca serah terima",
            deliverable: "Laporan Evaluasi",
            dateRange: "1 Feb - 15 Feb",
            status: "NOT STARTED",
          },
        ],
      },
    ],
  },

  /* ── 2. Pengembangan Terminal Curah Kering & Cair ── */
  {
    id: "rkm-2",
    title: "Pengembangan Terminal Curah Kering & Cair di Lingkungan SPMT",
    initiativeStrategy:
      "IS-04-Pengembangan Terminal Berbasis Layanan, Komoditas, Kemasan, dan/atau Kawasan Industri",
    pic: "VP Surya, Reza (Bengkulu, Banten), Fero (Benoa), Raghi (Kjing), Hendra (Kalibaru)",
    start: "14 Agustus 2025",
    deadline: "31 Desember 2026",
    actual: 38,
    expected: 52,
    gap: -14,
    overdue: 2,
    sections: [
      {
        id: "A",
        title: "A: Pengembangan TCK Dumai",
        tasks: [
          {
            id: 1,
            title: "Studi kelayakan pengembangan TCK Dumai",
            deliverable: "Laporan Studi Kelayakan",
            dateRange: "14 Agu - 30 Sep 2025",
            file: "studi_kelayakan_dumai.pdf",
            status: "DONE",
          },
          {
            id: 2,
            title: "Penyusunan DED terminal curah kering",
            deliverable: "Dokumen DED",
            dateRange: "1 Okt - 30 Nov 2025",
            status: "DONE",
          },
          {
            id: 3,
            title: "Korespondensi dengan Pemda dan stakeholder terkait",
            deliverable: "Surat Rekomendasi Pemda",
            dateRange: "1 Okt - 31 Des 2025",
            status: "ON PROGRESS",
            overdue: true,
          },
          {
            id: 4,
            title: "Pengajuan perizinan konstruksi",
            deliverable: "Izin Konstruksi",
            dateRange: "1 Jan - 30 Jun 2026",
            status: "NOT STARTED",
          },
        ],
      },
      {
        id: "B",
        title: "B: Pengembangan TCC Benoa",
        tasks: [
          {
            id: 1,
            title: "Assessment kondisi existing TCC Benoa",
            deliverable: "Laporan Assessment",
            dateRange: "19 Jan - 31 Mar 2026",
            status: "ON PROGRESS",
          },
          {
            id: 2,
            title: "Penyusunan business plan pengembangan",
            deliverable: "Business Plan TCC Benoa",
            dateRange: "1 Apr - 30 Jun 2026",
            status: "NOT STARTED",
          },
        ],
      },
      {
        id: "C",
        title: "C: Pengembangan TCK Banten",
        tasks: [
          {
            id: 1,
            title: "Koordinasi dengan manajemen terkait hold status",
            deliverable: "Notulen Rapat",
            dateRange: "1 Jan - 28 Feb 2026",
            status: "ON PROGRESS",
          },
        ],
      },
      {
        id: "D",
        title: "D: Terminal Produk Kalibaru",
        tasks: [
          {
            id: 1,
            title: "Review kontrak dengan Pertamina",
            deliverable: "Hasil Review Kontrak",
            dateRange: "5 Apr - 30 Apr 2026",
            file: "review_kontrak_pertamina.pdf",
            status: "ON PROGRESS",
          },
          {
            id: 2,
            title: "Negosiasi tarif dan pengaturan operasional",
            deliverable: "Perjanjian Tarif",
            dateRange: "1 Mei - 5 Nov 2026",
            status: "NOT STARTED",
          },
        ],
      },
      {
        id: "E",
        title: "E: TCC Bengkulu",
        tasks: [
          {
            id: 1,
            title: "Pengembangan fasilitas curah cair Bengkulu",
            deliverable: "Laporan Progres Pengembangan",
            dateRange: "14 Agu - 17 Apr 2026",
            status: "ON PROGRESS",
          },
          {
            id: 2,
            title: "Commissioning dan uji coba operasional",
            deliverable: "Berita Acara Commissioning",
            dateRange: "18 Apr - 30 Jun 2026",
            status: "NOT STARTED",
          },
        ],
      },
      {
        id: "F",
        title: "F: TCC Semarang (LNG OTN)",
        tasks: [
          {
            id: 1,
            title: "Studi kelayakan LNG OTN Semarang",
            deliverable: "Laporan Studi Kelayakan LNG",
            dateRange: "4 Jan - 30 Jun 2026",
            status: "ON PROGRESS",
          },
          {
            id: 2,
            title: "Koordinasi dengan PLN dan PGN",
            deliverable: "MOU dengan PLN/PGN",
            dateRange: "1 Jul - 31 Des 2026",
            status: "NOT STARTED",
          },
        ],
      },
    ],
  },
];

/* ─────────────────────────────────────────────────────────────── */
/*  NON-RKM PROGRAMS                                               */
/* ─────────────────────────────────────────────────────────────── */

const nonRkmPrograms: ProgramDetail[] = [
  /* ── 1. Pengelolaan Limbah B3 Pelabuhan ── */
  {
    id: "nonrkm-1",
    title: "Pengelolaan Limbah B3 Pelabuhan",
    initiativeStrategy: "Program Lingkungan & Keselamatan Pelabuhan",
    pic: "VP Hendra, Dimas, Ayu",
    start: "1 Januari 2026",
    deadline: "30 Juni 2026",
    actual: 55,
    expected: 70,
    gap: -15,
    overdue: 1,
    sections: [
      {
        id: "A",
        title: "A: Identifikasi dan Inventarisasi Limbah B3",
        tasks: [
          {
            id: 1,
            title: "Pendataan sumber limbah B3 di seluruh terminal",
            deliverable: "Daftar Inventarisasi Limbah B3",
            dateRange: "1 Jan - 31 Jan",
            file: "inventarisasi_b3.pdf",
            status: "DONE",
          },
          {
            id: 2,
            title: "Klasifikasi jenis dan volume limbah B3",
            deliverable: "Laporan Klasifikasi Limbah",
            dateRange: "1 Feb - 28 Feb",
            status: "DONE",
          },
          {
            id: 3,
            title: "Penyusunan peta risiko limbah B3",
            deliverable: "Peta Risiko Limbah",
            dateRange: "1 Mar - 31 Mar",
            status: "ON PROGRESS",
          },
        ],
      },
      {
        id: "B",
        title: "B: Pengembangan Sistem Pengelolaan",
        tasks: [
          {
            id: 1,
            title: "Penyusunan SOP pengelolaan limbah B3",
            deliverable: "SOP Limbah B3",
            dateRange: "1 Feb - 15 Mar",
            status: "ON PROGRESS",
            overdue: true,
          },
          {
            id: 2,
            title: "Pengadaan fasilitas penyimpanan limbah",
            deliverable: "Fasilitas Penyimpanan Terverifikasi",
            dateRange: "1 Apr - 30 Jun",
            status: "NOT STARTED",
          },
          {
            id: 3,
            title: "Pelatihan petugas pengelola limbah B3",
            deliverable: "Sertifikat Pelatihan",
            dateRange: "1 Mei - 30 Jun",
            status: "NOT STARTED",
          },
        ],
      },
    ],
  },

  /* ── 2. Digitalisasi Proses Operasional Terminal ── */
  {
    id: "nonrkm-2",
    title: "Digitalisasi Proses Operasional Terminal",
    initiativeStrategy: "Program Transformasi Digital Pelindo",
    pic: "VP Andi, Rina, Budi",
    start: "1 Januari 2026",
    deadline: "31 Desember 2026",
    actual: 60,
    expected: 65,
    gap: -5,
    overdue: 0,
    sections: [
      {
        id: "A",
        title: "A: Pengembangan Sistem TOS (Terminal Operating System)",
        tasks: [
          {
            id: 1,
            title: "Analisis kebutuhan sistem TOS",
            deliverable: "Dokumen Business Requirement",
            dateRange: "1 Jan - 31 Jan",
            file: "brd_tos.pdf",
            status: "DONE",
          },
          {
            id: 2,
            title: "Seleksi vendor dan pengembangan sistem",
            deliverable: "Kontrak Vendor & Prototype",
            dateRange: "1 Feb - 31 Mar",
            status: "DONE",
          },
          {
            id: 3,
            title: "User Acceptance Testing (UAT)",
            deliverable: "Laporan UAT",
            dateRange: "1 Apr - 30 Apr",
            status: "DONE",
          },
          {
            id: 4,
            title: "Go-live dan monitoring sistem TOS",
            deliverable: "Laporan Go-Live",
            dateRange: "1 Mei - 30 Jun",
            status: "ON PROGRESS",
          },
        ],
      },
      {
        id: "B",
        title: "B: Integrasi Data & Pelaporan Digital",
        tasks: [
          {
            id: 1,
            title: "Pengembangan dashboard monitoring real-time",
            deliverable: "Dashboard Monitoring",
            dateRange: "1 Mar - 31 Mei",
            status: "ON PROGRESS",
          },
          {
            id: 2,
            title: "Integrasi sistem dengan Pelindo Group",
            deliverable: "API Integration Document",
            dateRange: "1 Jun - 31 Agu",
            status: "NOT STARTED",
          },
          {
            id: 3,
            title: "Pelatihan user dan sosialisasi",
            deliverable: "Modul Training & Laporan Sosialisasi",
            dateRange: "1 Sep - 30 Nov",
            status: "NOT STARTED",
          },
        ],
      },
    ],
  },
];

/* ─────────────────────────────────────────────────────────────── */
/*  COMBINED MAP — for easy lookup by ID                           */
/* ─────────────────────────────────────────────────────────────── */

export const allPrograms: ProgramDetail[] = [...rkmPrograms, ...nonRkmPrograms];

export const programById = (id: string): ProgramDetail | undefined =>
  allPrograms.find((p) => p.id === id);

export { rkmPrograms, nonRkmPrograms };
