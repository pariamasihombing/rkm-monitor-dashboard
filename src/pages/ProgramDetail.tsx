import { apiUrl } from "../utils/api";
import {
  Box,
  Card,
  CardContent,
  Button,
  Typography,
  Collapse,
  Chip,
  CircularProgress,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  Assessment,
  ContentPaste,
  TrendingUp,
  ArrowBack as ArrowBackIcon,
  CalendarToday as CalendarIcon,
  InsertDriveFile as FileIcon,
  KeyboardArrowDown as ArrowDownIcon,
  KeyboardArrowRight as ArrowRightIcon,
  ArrowForward as ArrowForwardIcon,
  Warning as WarningIcon,
  ManageAccounts as ManageAccountsIcon,
} from "@mui/icons-material";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ProfileMenu from "../components/ProfileMenu";
import logoDanantara from "../assets/logo-danantara.png";
import logoPelindo from "../assets/logo-pelindo.png";
import batikOrnament from "../assets/batik-ornament.png";
import { programById, rkmPrograms, type TaskStatus } from "../data/programDetailMock";
import { canManage } from "../utils/rbac";



/* ================= STATUS CHIP STYLES ================= */

const getStatusStyle = (status: TaskStatus) => {
  switch (status) {
    case "DONE":
      return {
        bgcolor: "#ECFDF5",
        color: "#059669",
        border: "1px solid #A7F3D0",
      };
    case "ON PROGRESS":
      return {
        bgcolor: "#EFF6FF",
        color: "#2563EB",
        border: "1px solid #BFDBFE",
      };
    case "NOT STARTED":
      return {
        bgcolor: "#F8FAFC",
        color: "#64748B",
        border: "1px solid #CBD5E1",
      };
    default:
      return {
        bgcolor: "#FEF2F2",
        color: "#DC2626",
        border: "1px solid #FECACA",
      };
  }
};

const getIndicatorStyle = (indicator: string) => {
  switch ((indicator || "").toUpperCase()) {
    case "OVERDUE":
      return {
        bgcolor: "#FFF5F5",
        color: "#E9004A",
        border: "1px solid #FECDD3",
      };
    case "DUE SOON":
      return {
        bgcolor: "#E6FFFA",
        color: "#047481",
        border: "1px solid #B2F5EA",
      };
    case "BEHIND EXPECTED":
      return {
        bgcolor: "#FFFBEB",
        color: "#D97706",
        border: "1px solid #FDE68A",
      };
    case "COMPLETED":
    case "ON TRACK":
      return {
        bgcolor: "#ECFDF5",
        color: "#059669",
        border: "1px solid #A7F3D0",
      };
    default:
      return {
        bgcolor: "#F8FAFC",
        color: "#64748B",
        border: "1px solid #CBD5E1",
      };
  }
};

/* ================= SEPARATOR ================= */

const Pipe = () => (
  <Typography sx={{ fontSize: "0.8rem", color: "#DBDBDB", mx: 0.3 }}>|</Typography>
);

/* ================= ACTION LINK BUTTON ================= */

const ActionBtn = ({
  label,
  color,
  onClick,
}: {
  label: string;
  color: string;
  onClick?: (e: React.MouseEvent) => void;
}) => (
  <Button
    size="small"
    onClick={(e) => {
      e.stopPropagation();
      onClick?.(e);
    }}
    sx={{
      textTransform: "none",
      fontWeight: 700,
      color,
      fontSize: "0.82rem",
      p: 0,
      minWidth: "auto",
      "&:hover": { bgcolor: "transparent" },
    }}
  >
    {label}
  </Button>
);

type ProgramId = string | number;

interface DetailTask {
  id: ProgramId;
  title: string;
  deliverable?: string;
  dateRange?: string;
  status: TaskStatus;
  file?: string | null;
  overdue?: boolean;
  actual?: number;
  expected?: number;
  gap?: number;
  indicator?: string;
}

interface DetailSection {
  id: ProgramId;
  title: string;
  name?: string;
  deliverable?: string;
  start?: string;
  deadline?: string;
  actual?: number;
  status?: TaskStatus;
  notes?: string;
  tasks: DetailTask[];
}

interface DetailProgram {
  id?: ProgramId;
  title: string;
  name?: string;
  status?: { name?: string } | TaskStatus;
  initiativeStrategy?: string;
  pic?: string;
  picUtama?: string;
  picSupporting?: string;
  picSupervisor?: string;
  start?: string;
  deadline?: string;
  actual?: number;
  expected?: number;
  gap?: number;
  indicator?: string;
  overdue?: number;
  sections?: DetailSection[];
}

interface ApiStatus {
  name?: string;
}

interface ApiSubtask {
  id_subtask: number;
  name: string;
  deliverable?: string;
  plan_start?: string;
  plan_finish?: string;
  status?: ApiStatus;
  indicator?: string;
  actual_progress?: number;
  expected_progress?: number;
  gap?: number;
  file?: string | null;
}

interface ApiStage {
  id_stage: number;
  name: string;
  deliverable?: string;
  plan_start?: string;
  plan_finish?: string;
  notes?: string;
  actual_progress?: number;
  status?: ApiStatus;
  subtasks?: ApiSubtask[];
}

interface ApiProgram {
  id_program: number;
  name: string;
  pic?: string;
  code_initiative_strategy?: string;
  plan_start?: string;
  plan_finish?: string;
  actual_progress?: number;
  overall_progress?: number;
  expected_progress?: number;
  gap?: number;
  indicator?: string;
  status?: ApiStatus;
  stages?: ApiStage[];
}

const normalizeTaskStatus = (status?: string): TaskStatus => {
  const normalized = (status || "").toUpperCase();
  if (normalized === "DONE" || normalized === "ON PROGRESS" || normalized === "NOT STARTED") {
    return normalized;
  }
  return "NOT STARTED";
};

const getProgramStatusLabel = (status?: DetailProgram["status"]) => {
  if (typeof status === "string") return status;
  return status?.name || "ON PROGRESS";
};

/* ================= COMPONENT ================= */

// Map route path → sidebar label
const routeToMenuLabel: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/rkm": "RKM / Program",
  "/non-rkm": "Non RKM",
  "/weekly-monitoring": "Weekly Monitoring",
};

export default function ProgramDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const fromRoute = location.state?.from || "/rkm";
  const programId = location.state?.programId as ProgramId | undefined;

  const [program, setProgram] = useState<DetailProgram | null>(null);
  const [loading, setLoading] = useState(true);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchProgramDetail();
  // location.key berubah setiap kali navigate() dipanggil, memastikan
  // data selalu di-fetch ulang saat user kembali dari halaman lain.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [programId, location.key]);

  const fetchProgramDetail = async () => {
    setLoading(true);
    try {
      if (typeof programId === "string" && (programId.startsWith("rkm-") || programId.startsWith("nonrkm-"))) {
        const mock = programById(programId) ?? rkmPrograms[0];
        setProgram(mock as DetailProgram);
        if (mock.sections && mock.sections.length > 0) {
          setOpenSections({ [String(mock.sections[0].id)]: true });
        }
      } else if (programId) {
        const response = await fetch(apiUrl(`/api/programs/${programId}`));
        const data = await response.json() as ApiProgram;

        const picParts = (data.pic || "").split("|").map((s: string) => s.trim());

        const normalized = {
          ...data,
          id: data.id_program,
          title: data.name,
          initiativeStrategy: data.code_initiative_strategy || "-",
          picUtama: picParts[0] || "-",
          picSupporting: picParts[1] || "-",
          picSupervisor: picParts[2] || "-",
          start: data.plan_start,
          deadline: data.plan_finish,
          actual: data.actual_progress ?? data.overall_progress ?? 0,
          expected: data.expected_progress ?? 0,
          gap: data.gap ?? ((data.actual_progress ?? data.overall_progress ?? 0) - (data.expected_progress ?? 0)),
          indicator: data.indicator || "On Track",
          overdue: data.indicator === "Overdue" ? 1 : 0,
          sections: data.stages?.map((s) => ({
            id: s.id_stage,
            title: s.name,
            name: s.name,
            deliverable: s.deliverable,
            start: s.plan_start,
            deadline: s.plan_finish,
            notes: s.notes,
            actual: s.actual_progress ?? 0,
            status: normalizeTaskStatus(s.status?.name),
            tasks: s.subtasks?.map((t) => ({
              id: t.id_subtask,
              title: t.name,
              deliverable: t.deliverable,
              dateRange: `${t.plan_start} - ${t.plan_finish}`,
              status: normalizeTaskStatus(t.status?.name),
              file: t.file,
              overdue: t.indicator === "Overdue",
              actual: t.actual_progress ?? 0,
              expected: t.expected_progress ?? 0,
              gap: t.gap ?? ((t.actual_progress ?? 0) - (t.expected_progress ?? 0)),
              indicator: t.indicator || "On Track",
            })) || []
          })) || []
        };

        setProgram(normalized);
        if (normalized.sections && normalized.sections.length > 0) {
          setOpenSections({ [String(normalized.sections[0].id)]: true });
        }
      } else {
        // Tidak ada programId yang valid — navigasi kembali
        console.warn("[ProgramDetail] Tidak ada programId yang valid.");
        navigate(fromRoute, { replace: true });
        return;
      }
    } catch (error) {
      console.error("Error fetching program detail:", error);
      // Jangan fallback ke mock data — tampilkan null agar user tahu ada masalah
      setProgram(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSection = async (sectionId: ProgramId) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus tahapan ini? Semua subtask di dalamnya juga akan terhapus.")) return;

    try {
      const response = await fetch(apiUrl(`/api/stages/${sectionId}`), {
        method: "DELETE",
      });
      if (response.ok) {
        fetchProgramDetail();
      } else {
        alert("Gagal menghapus tahapan.");
      }
    } catch (error) {
      console.error("Error deleting stage:", error);
      alert("Terjadi kesalahan koneksi.");
    }
  };

  const handleDeleteTask = async (taskId: ProgramId) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus subtask ini?")) return;

    try {
      const response = await fetch(apiUrl(`/api/subtasks/${taskId}`), {
        method: "DELETE",
      });
      if (response.ok) {
        fetchProgramDetail();
      } else {
        alert("Gagal menghapus subtask.");
      }
    } catch (error) {
      console.error("Error deleting subtask:", error);
      alert("Terjadi kesalahan koneksi.");
    }
  };

  const [profileAnchor, setProfileAnchor] = useState<HTMLElement | null>(null);
  const [activeMenu, setActiveMenu] = useState(
    routeToMenuLabel[fromRoute] ?? "RKM / Program"
  );

  const toggleSection = (id: ProgramId) => {
    const key = String(id);
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!program) return null;

  const sections = program.sections || [];
  const gap = program.gap || 0;
  const gapColor = gap < 0 ? "#E9004A" : "#009E6D";
  const gapDisplay = gap < 0 ? `${gap}%` : `+${gap}%`;
  const indicator = program.indicator || (gap < 0 ? "Behind Expected" : "On Track");

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#F7F9FB" }}>
      {/* ================= SIDEBAR ================= */}
      <Box
        sx={{
          width: 240,
          position: "fixed",
          height: "100vh",
          p: 3,
          pb: 0,
          pr: 0,
          color: "white",
          background: "linear-gradient(180deg, #0C4B7D 0%, #2586BF 100%)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Typography
            fontWeight={700}
            mb={3}
            sx={{ fontSize: "1.1rem", lineHeight: 1.2, letterSpacing: 0.5 }}
          >
            RKM Monitor
            <br />
            Dashboard System
          </Typography>
        </Box>

        <Box sx={{ px: -2 }}>
          {(() => {
            const menus = [
              { icon: DashboardIcon, label: "Dashboard" },
              { icon: Assessment, label: "RKM / Program" },
              { icon: ContentPaste, label: "Non RKM" },
              { icon: TrendingUp, label: "Weekly Monitoring" },
            ];
            if (canManage()) {
              menus.push({ icon: ManageAccountsIcon, label: "Kelola Akun" });
            }
            return menus.map((item) => (
              <Button
                key={item.label}
                startIcon={<item.icon sx={{ fontSize: "1.4rem" }} />}
                onClick={() => {
                  setActiveMenu(item.label);
                  const routeMap: Record<string, string> = {
                    Dashboard: "/dashboard",
                    "RKM / Program": "/rkm",
                    "Non RKM": "/non-rkm",
                    "Weekly Monitoring": "/weekly-monitoring",
                    "Kelola Akun": "/manage-users",
                  };
                  const route = routeMap[item.label];
                  if (route) navigate(route);
                }}
                sx={{
                  color: "white",
                  justifyContent: "flex-start",
                  mb: 1,
                  px: 2,
                  py: 1,
                  borderRadius: 3,
                  fontSize: "0.9rem",
                  whiteSpace: "nowrap",
                  border: "2px solid transparent",
                  fontWeight: activeMenu === item.label ? 900 : 600,
                  width: "calc(100% - 10px)",
                  ml: -1.5,
                  ...(activeMenu === item.label && {
                    bgcolor: "rgba(255,255,255,0.25)",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
                    border: "2px solid rgba(255,255,255,0.4)",
                    backdropFilter: "blur(10px)",
                    "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
                  }),
                  ...!(activeMenu === item.label) && {
                    "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
                  },
                }}
              >
                {item.label}
              </Button>
            ))
          })()}
        </Box>

        <Box
          sx={{
            marginTop: "auto",
            marginLeft: "-24px",
            width: "111%",
            height: "auto",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            overflow: "hidden",
          }}
        >
          <img
            src={batikOrnament}
            width="100%"
            style={{ display: "block", opacity: 1 }}
          />
        </Box>
      </Box>

      {/* ================= MAIN ================= */}
      <Box sx={{ flex: 1, ml: "240px", height: "100vh", overflowY: "auto" }}>
        {/* HEADER */}
        <Box
          sx={{
            background:
              "linear-gradient(90deg, #0C4B7D 0%, #135B8E 25%, #2586BF 100%)",
            px: 4,
            py: 2,
            height: 70,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box
              component="img"
              src={logoDanantara}
              alt="Danantara"
              sx={{ height: 30, width: "auto" }}
            />
            <Box
              component="img"
              src={logoPelindo}
              alt="Pelindo"
              sx={{ height: 50, width: "auto" }}
            />
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <ProfileMenu
              profileAnchor={profileAnchor}
              setProfileAnchor={setProfileAnchor}
              userName="Pariama Valentino"
            />
          </Box>
        </Box>

        {/* ================= CONTENT ================= */}
        <Box sx={{ p: 4, maxWidth: 1000, mx: "auto", pb: 10 }}>
          {/* BACK BUTTON */}
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(fromRoute)}
            sx={{
              mb: 2,
              color: "#64748B",
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.875rem",
              "&:hover": { bgcolor: "rgba(0,0,0,0.04)" },
            }}
          >
            Kembali
          </Button>

          {/* ================= PROGRAM INFO CARD ================= */}
          <Card
            className="anim-fadein-up anim-d1 card-hover"
            sx={{
              mb: 3,
              borderRadius: 2,
              boxShadow: "0 2px 12px rgba(21,101,192,0.06)",
              border: "1px solid #E8ECF4",
            }}
          >
            <CardContent sx={{ p: 3, pb: "20px !important" }}>
              {/* Title row */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  mb: 1.5,
                }}
              >
                <Typography
                  fontWeight={700}
                  fontSize="1.15rem"
                  sx={{ color: "#0F172A", flex: 1 }}
                >
                  {program.title}
                </Typography>
              </Box>

              {/* Status Chips */}
              <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                <Chip
                  label={getProgramStatusLabel(program.status).toUpperCase()}
                  size="small"
                  sx={{
                    bgcolor: "#EFF6FF",
                    color: "#2563EB",
                    fontWeight: 700,
                    fontSize: "0.72rem",
                    border: "1px solid #BFDBFE",
                    borderRadius: "6px",
                    height: 24,
                  }}
                />
                <Chip
                  label={indicator.toUpperCase()}
                  size="small"
                  sx={{
                    ...getIndicatorStyle(indicator),
                    fontWeight: 700,
                    fontSize: "0.72rem",
                    borderRadius: "6px",
                    height: 24,
                  }}
                />
              </Box>

              {/* Meta info */}
              <Box
                sx={{ display: "flex", flexDirection: "column", gap: 0.6, mb: 2 }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Typography fontSize="0.82rem" color="#64748B">
                    Initiative Strategy :
                  </Typography>
                  <Typography fontSize="0.82rem" color="#0F172A" fontWeight={500}>
                    {program.initiativeStrategy}
                  </Typography>
                </Box>
                {/* PIC breakdown by role */}
                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 0.5 }}>
                  <Typography
                    fontSize="0.82rem"
                    color="#64748B"
                    sx={{ flexShrink: 0 }}
                  >
                    PIC Utama :
                  </Typography>
                  <Typography fontSize="0.82rem" color="#0F172A" fontWeight={600}>
                    {" "}
                    {program.picUtama || program.pic || "-"}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 0.5 }}>
                  <Typography
                    fontSize="0.82rem"
                    color="#64748B"
                    sx={{ flexShrink: 0 }}
                  >
                    Supporting :
                  </Typography>
                  <Typography fontSize="0.82rem" color="#0F172A" fontWeight={500}>
                    {" "}
                    {program.picSupporting || "-"}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 0.5 }}>
                  <Typography
                    fontSize="0.82rem"
                    color="#64748B"
                    sx={{ flexShrink: 0 }}
                  >
                    Supervisor (VP) :
                  </Typography>
                  <Typography fontSize="0.82rem" color="#0F172A" fontWeight={500}>
                    {" "}
                    {program.picSupervisor || "-"}
                  </Typography>
                </Box>
              </Box>

              {/* Date row */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography fontSize="0.82rem" color="#64748B">
                  Start :
                </Typography>
                <Typography fontSize="0.82rem" color="#0F172A" fontWeight={600}>
                  {program.start}
                </Typography>
                <ArrowForwardIcon
                  sx={{ fontSize: "0.9rem", color: "#94A3B8" }}
                />
                <Typography fontSize="0.82rem" color="#64748B">
                  Deadline :
                </Typography>
                <Typography fontSize="0.82rem" color="#0F172A" fontWeight={600}>
                  {program.deadline}
                </Typography>
              </Box>

              {/* Divider */}
              <Box sx={{ borderTop: "1px solid #F1F5F9", mt: 2.5, mb: 2.5 }} />

              {/* Metrics Grid */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: 1.5,
                }}
              >
                {[
                  {
                    label: "Actual",
                    value: `${program.actual}%`,
                    color: "#2563EB",
                  },
                  {
                    label: "Expected",
                    value: `${program.expected}%`,
                    color: "#0F172A",
                  },
                  { label: "Gap", value: gapDisplay, color: gapColor },
                  { label: "Overdue", value: program.overdue, color: "#E9004A" },
                ].map((m, i) => (
                  <Box
                    key={m.label}
                    className="anim-scale-in"
                    style={{ animationDelay: `${0.2 + i * 0.08}s` }}
                    sx={{
                      border: "1px solid #E2E8F0",
                      borderRadius: 2,
                      p: 2,
                      bgcolor: "#FAFBFC",
                      transition: "box-shadow 0.2s ease, transform 0.2s ease",
                      "&:hover": {
                        boxShadow: "0 4px 16px rgba(12,75,125,0.1)",
                        transform: "translateY(-2px)",
                      },
                    }}
                  >
                    <Typography
                      fontSize="0.78rem"
                      color="#94A3B8"
                      fontWeight={600}
                      mb={0.8}
                    >
                      {m.label}
                    </Typography>
                    <Typography
                      className="number-pop"
                      fontSize="2rem"
                      fontWeight={700}
                      color={m.color}
                      lineHeight={1}
                      style={{ animationDelay: `${0.35 + i * 0.08}s` }}
                    >
                      {m.value}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>

          {/* ================= TASK BREAKDOWN ================= */}
          <Card
            className="anim-fadein-up anim-d3"
            sx={{
              borderRadius: 2,
              boxShadow: "0 2px 12px rgba(21,101,192,0.06)",
              border: "1px solid #E8ECF4",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              {/* Task Breakdown Header */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2.5,
                }}
              >
                <Typography fontWeight={700} fontSize="1rem" color="#0F172A">
                  Task Breakdown by Tahapan/Action
                </Typography>
                {canManage() && (
                  <Button
                    onClick={() => navigate("/pic-tambah-tahapan", {
                      state: {
                        from: fromRoute,
                        returnTo: "/program-detail",
                        programId,
                      },
                    })}
                    sx={{
                      color: "#1F77AE",
                      fontWeight: 700,
                      fontSize: "0.85rem",
                      textTransform: "none",
                      p: 0,
                      minWidth: "auto",
                      "&:hover": { bgcolor: "transparent" },
                    }}
                  >
                    + Tambah Tahapan
                  </Button>
                )}
              </Box>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {sections.map((section: DetailSection, sIdx: number) => (
                  <Box
                    key={section.id}
                    className="anim-fadein-up"
                    style={{ animationDelay: `${0.25 + sIdx * 0.1}s` }}
                    sx={{
                      border: "1px solid #E2E8F0",
                      borderRadius: "8px",
                      overflow: "hidden",
                    }}
                  >
                    {/* Section Header */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        px: 2.5,
                        py: 1.8,
                        bgcolor: "#FAFBFC",
                        cursor: "pointer",
                        transition: "background-color 0.18s ease",
                        "&:hover": { bgcolor: "#EFF3FA" },
                      }}
                      onClick={() => toggleSection(section.id)}
                    >
                      {/* Left: chevron + title + progress */}
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        {openSections[String(section.id)] ? (
                          <ArrowDownIcon
                            sx={{ fontSize: "1.1rem", color: "#64748B" }}
                          />
                        ) : (
                          <ArrowRightIcon
                            sx={{ fontSize: "1.1rem", color: "#64748B" }}
                          />
                        )}
                        <Typography
                          fontSize="0.9rem"
                          fontWeight={600}
                          color="#0F172A"
                        >
                          {section.title}
                        </Typography>
                        {/* Progress indicator */}
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.3, ml: 0.5 }}>
                          <Typography fontSize="0.82rem" fontWeight={700} color="#2563EB">
                            {section.actual ?? 0}%
                          </Typography>
                          <TrendingUp sx={{ fontSize: "0.9rem", color: "#2563EB" }} />
                        </Box>
                      </Box>

                      {/* Right: N tasks | View | Edit | Hapus */}
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <Typography
                          fontSize="0.82rem"
                          fontWeight={600}
                          color="#2563EB"
                        >
                          {section.tasks.length} tasks
                        </Typography>
                        <Pipe />
                        <ActionBtn
                          label="View"
                          color="#2196F3"
                          onClick={() => navigate("/tahapan-detail", {
                            state: {
                              from: fromRoute,
                              returnTo: "/program-detail",
                              programId,
                              stageId: section.id,
                            },
                          })}
                        />
                        {canManage() && (
                          <>
                            <Pipe />
                            <ActionBtn
                              label="Edit"
                              color="#F97316"
                              onClick={() => navigate("/pic-edit-tahapan", {
                                state: {
                                  from: "/program-detail",
                                  programId,
                                  sectionId: section.id,
                                  namaTahapan: section.name,
                                  deliverable: section.deliverable,
                                  status: section.status || "Not Started",
                                  planStart: section.start || "2026-07-01",
                                  planFinish: section.deadline || "2026-12-31",
                                },
                              })}
                            />
                            <Pipe />
                            <ActionBtn label="Hapus" color="#E9004A" onClick={() => handleDeleteSection(section.id)} />
                          </>
                        )}
                      </Box>
                    </Box>

                    {/* Section Tasks */}
                    <Collapse in={openSections[String(section.id)]}>
                      <Box
                        sx={{
                          p: 1.5,
                          display: "flex",
                          flexDirection: "column",
                          gap: 1,
                        }}
                      >
                        {section.tasks.map((task: DetailTask, taskIndex: number) => {
                          const isOverdueTask = task.overdue;
                          return (
                            <Box
                              key={task.id}
                              sx={{
                                border: isOverdueTask
                                  ? "1px solid #FECDD3"
                                  : "1px solid #E2E8F0",
                                borderRadius: "8px",
                                p: 2,
                                bgcolor: isOverdueTask ? "#FFF5F5" : "#FFFFFF",
                                position: "relative",
                              }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "flex-start",
                                  justifyContent: "space-between",
                                  gap: 2,
                                }}
                              >
                                {/* Task Left */}
                                <Box sx={{ flex: 1 }}>
                                  <Typography
                                    fontSize="0.875rem"
                                    fontWeight={600}
                                    color="#0F172A"
                                    mb={0.6}
                                  >
                                    {taskIndex + 1}. {task.title}
                                  </Typography>

                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 0.5,
                                      mb: 0.8,
                                    }}
                                  >
                                    <Typography fontSize="0.8rem" color="#94A3B8">
                                      Deliverable:
                                    </Typography>
                                    <Typography
                                      fontSize="0.8rem"
                                      color="#0F172A"
                                      fontWeight={600}
                                    >
                                      {task.deliverable}
                                    </Typography>
                                  </Box>

                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 2,
                                      flexWrap: "wrap",
                                    }}
                                  >
                                    <Box
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 0.5,
                                      }}
                                    >
                                      <CalendarIcon
                                        sx={{
                                          fontSize: "0.85rem",
                                          color: "#94A3B8",
                                        }}
                                      />
                                      <Typography
                                        fontSize="0.8rem"
                                        color="#64748B"
                                      >
                                        {task.dateRange}
                                      </Typography>
                                    </Box>

                                    {task.file && (
                                      <Box
                                        component="a"
                                        href="#"
                                        sx={{
                                          display: "flex",
                                          alignItems: "center",
                                          gap: 0.5,
                                          textDecoration: "none",
                                          "&:hover span": {
                                            textDecoration: "underline",
                                          },
                                        }}
                                      >
                                        <FileIcon
                                          sx={{
                                            fontSize: "0.85rem",
                                            color: "#2563EB",
                                          }}
                                        />
                                        <Box
                                          component="span"
                                          sx={{
                                            fontSize: "0.8rem",
                                            color: "#2563EB",
                                            cursor: "pointer",
                                            textDecoration: "underline",
                                            textDecorationColor:
                                              "rgba(37,99,235,0.4)",
                                            textUnderlineOffset: "2px",
                                            fontWeight: 500,
                                          }}
                                        >
                                          {task.file}
                                        </Box>
                                      </Box>
                                    )}
                                  </Box>
                                </Box>

                                {/* Task Right – Status + badges */}
                                <Box
                                  sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "flex-end",
                                    gap: 0.8,
                                    minWidth: 110,
                                  }}
                                >
                                  <Chip
                                    label={task.status}
                                    size="small"
                                    sx={{
                                      ...getStatusStyle(task.status),
                                      fontWeight: 700,
                                      fontSize: "0.7rem",
                                      borderRadius: "6px",
                                      height: 22,
                                      letterSpacing: "0.3px",
                                    }}
                                  />
                                  {isOverdueTask && (
                                    <Box
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 0.4,
                                        bgcolor: "#FEF2F2",
                                        color: "#DC2626",
                                        border: "1px solid #FECACA",
                                        borderRadius: "6px",
                                        px: 1,
                                        py: 0.3,
                                      }}
                                    >
                                      <WarningIcon sx={{ fontSize: "0.8rem" }} />
                                      <Typography
                                        fontSize="0.7rem"
                                        fontWeight={700}
                                        letterSpacing="0.3px"
                                      >
                                        OVERDUE
                                      </Typography>
                                    </Box>
                                  )}
                                </Box>
                              </Box>

                              {/* View | Edit | Hapus row — bottom right of task */}
                              <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 0.5, mt: 1.2, pt: 1, borderTop: "1px solid #F1F5F9" }}>
                                <ActionBtn
                                  label="View"
                                  color="#2196F3"
                                  onClick={() => navigate("/subtask-detail", {
                                    state: {
                                      from: fromRoute,
                                      returnTo: "/program-detail",
                                      programId,
                                      stageId: section.id,
                                      programTitle: program.title,
                                      stageTitle: section.title,
                                      taskId: task.id,
                                    },
                                  })}
                                />
                                {canManage() && (
                                  <>
                                    <Pipe />
                                    <ActionBtn
                                      label="Edit"
                                      color="#F97316"
                                      onClick={() => navigate("/pic-edit-subtask", {
                                        state: {
                                          from: "/program-detail",
                                          programId,
                                          stageId: section.id,
                                          taskId: task.id,
                                          namaSubtask: task.title,
                                          status: task.status,
                                          planStart: task.dateRange?.split(" - ")[0] || "",
                                          planEnd: task.dateRange?.split(" - ")[1] || "",
                                          deliverable: task.deliverable || "",
                                          expectedProgress: task.expected,
                                          actualProgress: task.actual,
                                          pic: "Unknown", // Can be properly passed if available
                                        },
                                      })}
                                    />
                                    <Pipe />
                                    <ActionBtn label="Hapus" color="#E9004A" onClick={() => handleDeleteTask(task.id)} />
                                  </>
                                )}
                              </Box>
                            </Box>
                          );
                        })}

                        {canManage() && (
                          <Box
                            onClick={() => navigate("/pic-tambah-subtask", {
                              state: {
                                from: fromRoute,
                                returnTo: "/program-detail",
                                programId,
                                stageId: section.id,
                                sectionId: section.id,
                                programTitle: program.title,
                                stageTitle: section.title,
                              },
                            })}
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              py: 1.5,
                              border: "1.5px dashed #BFDBFE",
                              borderRadius: "8px",
                              bgcolor: "#F8FBFF",
                              cursor: "pointer",
                              transition: "all 0.18s ease",
                              "&:hover": { bgcolor: "#EFF6FF", borderColor: "#267ABD" },
                            }}
                          >
                            <Typography fontSize="0.85rem" fontWeight={700} color="#2196F3">
                              + Tambah Subtask
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Collapse>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}
