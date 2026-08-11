import { apiUrl } from "../utils/api";
import {
  Box,
  Card,
  CardContent,
  Button,
  Typography,
  Chip,
  CircularProgress,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  Assessment,
  ContentPaste,
  TrendingUp,
  ArrowBack as ArrowBackIcon,
  InsertDriveFile as FileIcon,
  ArrowForward as ArrowForwardIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ProfileMenu from "../components/ProfileMenu";
import logoDanantara from "../assets/logo-danantara.png";
import logoPelindo from "../assets/logo-pelindo.png";
import batikOrnament from "../assets/batik-ornament.png";
import { programById, type TaskStatus } from "../data/programDetailMock";
import { canManage } from "../utils/rbac";

type SubtaskDetailData = {
  id?: number | string;
  programId?: number | string;
  stageId?: number | string;
  title: string;
  programTitle?: string;
  stageTitle?: string;
  start?: string;
  deadline?: string;
  statusName: TaskStatus;
  deliverable?: string;
  file?: string;
  actual: number;
  expected: number;
  gap: number;
  overdue?: boolean;
  overdueCount: number;
};

type ApiSubtaskDetail = {
  id?: number;
  id_subtask?: number;
  id_stage?: number;
  name: string;
  plan_start?: string;
  plan_finish?: string;
  deliverable?: string;
  file?: string;
  status?: { name?: string };
  stage?: {
    id_program?: number;
    name?: string;
    program?: { id_program?: number; name?: string };
  };
};

type SubtaskLocationState = {
  from?: string;
  returnTo?: string;
  programId?: string | number;
  stageId?: string | number;
  programTitle?: string;
  stageTitle?: string;
  taskId?: string | number;
};

const normalizeTaskStatus = (status?: string): TaskStatus => {
  const upperStatus = (status || "NOT STARTED").toUpperCase();
  return upperStatus === "DONE" || upperStatus === "ON PROGRESS" || upperStatus === "NOT STARTED"
    ? upperStatus
    : "NOT STARTED";
};

const statusForEdit = (status?: TaskStatus): string => {
  switch (status) {
    case "DONE":
      return "Done";
    case "ON PROGRESS":
      return "On Progress";
    case "NOT STARTED":
    default:
      return "Not Started";
  }
};

const getAttachmentUrl = (file?: string) => {
  if (!file) return undefined;
  if (/^https?:\/\//i.test(file)) return file;
  return apiUrl(`/uploads/${encodeURIComponent(file)}`);
};

/* ================= STATUS CHIP STYLES ================= */

const getStatusStyle = (status: TaskStatus) => {
  switch (status) {
    case "DONE":
      return { bgcolor: "#ECFDF5", color: "#059669", border: "1px solid #A7F3D0" };
    case "ON PROGRESS":
      return { bgcolor: "#EFF6FF", color: "#2563EB", border: "1px solid #BFDBFE" };
    case "NOT STARTED":
      return { bgcolor: "#F8FAFC", color: "#64748B", border: "1px solid #CBD5E1" };
    default:
      return { bgcolor: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA" };
  }
};

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

/* ================= SIDEBAR MENU MAP ================= */

const routeToMenuLabel: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/rkm": "RKM / Program",
  "/non-rkm": "Non RKM",
  "/weekly-monitoring": "Weekly Monitoring",
};

/* ================= COMPONENT ================= */

export default function SubtaskDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = (location.state || {}) as SubtaskLocationState;
  const fromRoute = locationState.from || "/rkm";
  const returnTo = locationState.returnTo || "/tahapan-detail";
  const programId = locationState.programId;
  const stageId = locationState.stageId;
  const taskId = locationState.taskId;
  const stateProgramTitle = locationState.programTitle;
  const stateStageTitle = locationState.stageTitle;

  const [subtask, setSubtask] = useState<SubtaskDetailData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSubtaskDetail = useCallback(async () => {
    setLoading(true);
    console.log("Fetching subtask with IDs:", { programId, stageId, taskId });
    try {
      if (typeof programId === "string" && (programId.startsWith("rkm-") || programId.startsWith("nonrkm-"))) {
        const prog = programById(programId);
        const section = prog?.sections.find(s => String(s.id) === String(stageId));
        const task = section?.tasks.find((t) => String(t.id) === String(taskId));
        
        if (task) {
            const actual = task.status === "DONE" ? 100 : task.status === "ON PROGRESS" ? 50 : 0;
            const expected = 50; // Mock
            setSubtask({
                ...task,
                programId,
                stageId,
                programTitle: prog?.title,
                stageTitle: section?.title,
                start: task.dateRange?.split(" - ")[0] || "-",
                deadline: task.dateRange?.split(" - ")[1] || "-",
                statusName: task.status,
                actual,
                expected,
                gap: actual - expected,
                overdueCount: task.overdue ? 1 : 0,
            });
        } else {
            console.warn("Subtask not found in mock data", { programId, stageId, taskId });
        }
      } else if (taskId) {
        const response = await fetch(apiUrl(`/api/subtasks/${taskId}`));
        if (!response.ok) throw new Error("Failed to fetch subtask from API");
        const data = await response.json() as ApiSubtaskDetail;
        
        const actual = data.status?.name === "DONE" ? 100 : data.status?.name === "ON PROGRESS" ? 50 : 0;
        const expected = 50; // Mock

        setSubtask({
          ...data,
          id: data.id_subtask || data.id,
          programId: data.stage?.program?.id_program || data.stage?.id_program || programId,
          stageId: data.id_stage || stageId,
          title: data.name,
          programTitle: stateProgramTitle || data.stage?.program?.name || "-",
          stageTitle: stateStageTitle || data.stage?.name || "-",
          start: data.plan_start,
          deadline: data.plan_finish,
          statusName: normalizeTaskStatus(data.status?.name),
          deliverable: data.deliverable,
          file: data.file,
          actual,
          expected,
          gap: actual - expected,
          overdueCount: 0, // Mock
        });
      } else {
        console.error("No taskId provided for subtask detail");
      }
    } catch (error) {
      console.error("Error fetching subtask detail:", error);
    } finally {
      setLoading(false);
    }
  }, [programId, stageId, stateProgramTitle, stateStageTitle, taskId]);

  useEffect(() => {
    fetchSubtaskDetail();
  }, [fetchSubtaskDetail]);

  const [profileAnchor, setProfileAnchor] = useState<HTMLElement | null>(null);
  const [activeMenu, setActiveMenu] = useState(
    routeToMenuLabel[fromRoute] ?? "RKM / Program"
  );
  const resolvedProgramId = subtask?.programId ?? programId;
  const resolvedStageId = subtask?.stageId ?? stageId;

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
          <Typography fontWeight={700} mb={3} sx={{ fontSize: "1.1rem", lineHeight: 1.2, letterSpacing: 0.5 }}>
            RKM Monitor
            <br />
            Dashboard System
          </Typography>
        </Box>

        <Box sx={{ px: -2 }}>
          {[
            { icon: DashboardIcon,  label: "Dashboard" },
            { icon: Assessment,     label: "RKM / Program" },
            { icon: ContentPaste,   label: "Non RKM" },
            { icon: TrendingUp,     label: "Weekly Monitoring" },
          ].map((item) => (
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
          ))}
        </Box>

        <Box sx={{ marginTop: "auto", marginLeft: "-24px", width: "111%", height: "auto", display: "flex", flexDirection: "column", justifyContent: "flex-end", overflow: "hidden" }}>
          <img src={batikOrnament} width="100%" style={{ display: "block", opacity: 1 }} />
        </Box>
      </Box>

      {/* ================= MAIN ================= */}
      <Box sx={{ flex: 1, ml: "240px", height: "100vh", overflowY: "auto" }}>

        {/* HEADER */}
        <Box
          sx={{
            background: "linear-gradient(90deg, #0C4B7D 0%, #135B8E 25%, #2586BF 100%)",
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
            <Box component="img" src={logoDanantara} alt="Danantara" sx={{ height: 30, width: "auto" }} />
            <Box component="img" src={logoPelindo}   alt="Pelindo"   sx={{ height: 50, width: "auto" }} />
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
            onClick={() => navigate(returnTo, { state: { from: fromRoute, programId: resolvedProgramId, stageId: resolvedStageId } })}
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

          {loading ? (
             <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "40vh" }}>
                <CircularProgress />
             </Box>
          ) : !subtask ? (
            <Box sx={{ p: 5, textAlign: "center" }}>
                <Typography variant="h6" color="textSecondary">Data Subtask tidak ditemukan.</Typography>
                <Typography color="textSecondary" sx={{ mb: 3 }}>ID yang dikirim: {taskId || "kosong"}</Typography>
                <Button variant="contained" onClick={() => navigate(returnTo, { state: { from: fromRoute, programId, stageId } })}>
                    Kembali ke Tahapan
                </Button>
            </Box>
          ) : (
            /* ================= SUBTASK INFO CARD ================= */
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
                <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 1.5 }}>
                  <Box>
                    <Typography fontSize="0.82rem" color="#64748B" fontWeight={600} mb={0.2}>
                      {subtask.programTitle}
                    </Typography>
                    <Typography fontSize="0.82rem" color="#267ABD" fontWeight={700} mb={0.5}>
                      Tahapan: {subtask.stageTitle}
                    </Typography>
                    <Typography fontWeight={700} fontSize="1.15rem" sx={{ color: "#0F172A", flex: 1 }}>
                      Subtask: {subtask.title}
                    </Typography>
                  </Box>
                  {canManage() && (
                    <ActionBtn
                      label="Edit Subtask"
                      color="#F97316"
                      onClick={() => navigate("/pic-edit-subtask", {
                        state: {
                          from: fromRoute,
                          returnTo: "/subtask-detail",
                          programId: resolvedProgramId,
                          stageId: resolvedStageId,
                          taskId: subtask.id,
                          namaSubtask: subtask.title,
                          deliverable: subtask.deliverable,
                          status: statusForEdit(subtask.statusName),
                          planStart: subtask.start,
                          planEnd: subtask.deadline,
                          fileName: subtask.file ?? null,
                          programTitle: subtask.programTitle,
                          stageTitle: subtask.stageTitle,
                        }
                      })}
                    />
                  )}
                </Box>

                {/* Status Chips */}
                <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                  <Chip
                    label={subtask.statusName}
                    size="small"
                    sx={{ ...getStatusStyle(subtask.statusName), fontWeight: 700, fontSize: "0.72rem", borderRadius: "6px", height: 24, px: 1 }}
                  />
                  {subtask.overdue && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.4, bgcolor: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA", borderRadius: "6px", px: 1, height: 24 }}>
                      <WarningIcon sx={{ fontSize: "0.8rem" }} />
                      <Typography fontSize="0.72rem" fontWeight={700}>OVERDUE</Typography>
                    </Box>
                  )}
                </Box>

                {/* Meta info */}
                <Box sx={{ display: "flex", flexDirection: "column", gap: 0.6, mb: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Typography fontSize="0.82rem" color="#64748B">Deliverable :</Typography>
                    <Typography fontSize="0.82rem" color="#0F172A" fontWeight={500}>{subtask.deliverable || "-"}</Typography>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexWrap: "wrap" }}>
                    <Typography fontSize="0.82rem" color="#64748B">Attachment :</Typography>
                    {subtask.file ? (
                      <Box
                        component="a"
                        href={getAttachmentUrl(subtask.file)}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ display: "flex", alignItems: "center", gap: 0.5, textDecoration: "none", "&:hover span": { textDecoration: "underline" } }}
                      >
                        <FileIcon sx={{ fontSize: "0.85rem", color: "#2563EB" }} />
                        <Box component="span" sx={{ fontSize: "0.8rem", color: "#2563EB", cursor: "pointer", textDecoration: "underline", textDecorationColor: "rgba(37,99,235,0.4)", textUnderlineOffset: "2px", fontWeight: 500 }}>
                          {subtask.file}
                        </Box>
                      </Box>
                    ) : (
                      <Typography fontSize="0.82rem" color="#94A3B8" fontStyle="italic">No file attached</Typography>
                    )}
                  </Box>
                </Box>

                {/* Date row */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography fontSize="0.82rem" color="#64748B">Start :</Typography>
                  <Typography fontSize="0.82rem" color="#0F172A" fontWeight={600}>{subtask.start}</Typography>
                  <ArrowForwardIcon sx={{ fontSize: "0.9rem", color: "#94A3B8" }} />
                  <Typography fontSize="0.82rem" color="#64748B">Deadline :</Typography>
                  <Typography fontSize="0.82rem" color="#0F172A" fontWeight={600}>{subtask.deadline}</Typography>
                </Box>
              </CardContent>
            </Card>
          )}
        </Box>
      </Box>
    </Box>
  );
}
