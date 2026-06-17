export const dashboardMetrics = {
  totalProgram: 24,
  totalTask: 156,
  onTrack: 24,
  behindExpected: 24,
  overdue: 24,
  dueSoon: 24,
};

export const chartData = {
  trendChart: {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6"],
    expected: [10, 20, 35, 50, 65, 75],
    actual: [15, 25, 40, 55, 65, 70],
  },
  statusBreakdown: {
    labels: ["Done", "On Progress", "Not Started", "Hold"],
    values: [45, 30, 15, 10],
    colors: ["#4CAF50", "#2196F3", "#FF9800", "#9C27B0"],
  },
};

export const targetAchievement = {
  actualProgress: 68,
  expectedProgress: 75,
  gap: -7,
};

export const alerts = [
  {
    id: 1,
    title: "Penggalian & Konsolidasilisasi terminal curah sconing dan general cargo Belawan",
    status: "OVERDUE",
    date: "30 Jan 2026",
    programId: "rkm-2",
  },
  {
    id: 2,
    title: "TDK Benglulu",
    status: "BEHIND",
    date: "20 Feb 2026",
    programId: "rkm-2",
  },
  {
    id: 3,
    title: "(Repeat Regional 3)Binding IBN & Mitra",
    status: "DUE SOON",
    date: "30 Jan 2026",
    programId: "rkm-1",
  },
];

export const programs = [
  "All Programs",
  "Program A",
  "Program B",
  "Program C",
];

export const statuses = [
  "All",
  "On Track",
  "Behind Expected",
  "Overdue",
  "Due Soon",
];
