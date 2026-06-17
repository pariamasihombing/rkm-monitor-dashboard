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
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ProfileMenu from "../components/ProfileMenu";
import logoDanantara from "../assets/logo-danantara.png";
import logoPelindo from "../assets/logo-pelindo.png";
import batikOrnament from "../assets/batik 1.png";
import { programById, type TaskStatus } from "../data/programDetailMock";

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

/* ================= SIDEBAR MENU MAP ================= */

const routeToMenuLabel: Record<string, string> = {
  "/pic-dashboard":  "Dashboard",
  "/pic-rkm":        "RKM / Program",
  "/pic-non-rkm":    "Non RKM",
  "/pic-weekly-monitoring": "Weekly Monitoring",
};

/* ================= COMPONENT ================= */

export default function PICSubtaskDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const fromRoute = location.state?.from || "/pic-rkm";
  const returnTo = location.state?.returnTo || "/pic-tahapan-detail";
  const programId: any = location.state?.programId;
  const stageId: any = location.state?.stageId;
  const taskId: any = location.state?.taskId;

  const [subtask, setSubtask] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubtaskDetail();
  }, [taskId]);

  const fetchSubtaskDetail = async () => {
    setLoading(true);
    console.log("Fetching subtask with IDs:", { programId, stageId, taskId });
    try {
      if (typeof programId === "string" && (programId.startsWith("rkm-") || programId.startsWith("nonrkm-"))) {
        const prog = programById(programId);
        const section = prog?.sections.find(s => String(s.id) === String(stageId));
        const task = section?.tasks.find((t: any) => String(t.id) === String(taskId));
        
        if (task) {
            const actual = task.status === "DONE" ? 100 : task.status === "ON PROGRESS" ? 50 : 0;
            const expected = 50; // Mock
            setSubtask({
                ...task,
                programTitle: location.state?.programTitle || prog?.title,
                stageTitle: location.state?.stageTitle || section?.title,
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
        const response = await fetch(`http://localhost:8000/api/subtasks/${taskId}`);
        if (!response.ok) throw new Error("Failed to fetch subtask from API");
        const data = await response.json();
        
        const actual = data.status?.name === "DONE" ? 100 : data.status?.name === "ON PROGRESS" ? 50 : 0;
        const expected = 50; // Mock

        setSubtask({
          ...data,
          id: data.id_subtask || data.id,
          title: data.name,
          programTitle: location.state?.programTitle || data.stage?.program?.name || "-",
          stageTitle: location.state?.stageTitle || data.stage?.name || "-",
          start: data.plan_start,
          deadline: data.plan_finish,
          statusName: (data.status?.name || "NOT STARTED").toUpperCase(),
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
  };

  const [profileAnchor, setProfileAnchor] = useState<HTMLElement | null>(null);
  const [activeMenu,    setActiveMenu]    = useState(routeToMenuLabel[fromRoute] ?? "RKM / Program");

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
                  "Dashboard":         "/pic-dashboard",
                  "RKM / Program":     "/pic-rkm",
                  "Non RKM":           "/pic-non-rkm",
                  "Weekly Monitoring": "/pic-weekly-monitoring",
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
            onClick={() => navigate(returnTo, { state: { from: fromRoute, programId, stageId } })}
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
                {/* Title row + Edit Subtask */}
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
                  <Button
                    size="small"
                    onClick={() => navigate("/pic-edit-subtask", {
                        state: {
                            from: fromRoute,
                            returnTo: "/pic-subtask-detail",
                            programId,
                            stageId,
                            taskId: subtask.id,
                            namaSubtask: subtask.title,
                            deliverable: subtask.deliverable,
                            status: subtask.statusName,
                            planStart: subtask.start,
                            planEnd: subtask.deadline,
                            fileName: subtask.file ?? null,
                            programTitle: subtask.programTitle,
                            stageTitle: subtask.stageTitle
                        }
                    })}
                    sx={{
                      textTransform: "none",
                      fontWeight: 700,
                      color: "#F97316",
                      fontSize: "0.85rem",
                      p: 0,
                      minWidth: "auto",
                      ml: 2,
                      flexShrink: 0,
                      "&:hover": { bgcolor: "transparent" },
                    }}
                  >
                    Edit Subtask
                  </Button>
                </Box>

                {/* Status Chips */}
                <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                  <Chip
                    label={subtask.statusName}
                    size="small"
                    sx={{ ...getStatusStyle(subtask.statusName), fontWeight: 700, fontSize: "0.72rem", border: "1px solid #BFDBFE", borderRadius: "6px", height: 24 }}
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
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Typography fontSize="0.82rem" color="#64748B">Attachment :</Typography>
                    {subtask.file ? (
                      <Box
                        component="a"
                        href="#"
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

                <Box sx={{ mt: 4 }} />
              </CardContent>
            </Card>
          )}
        </Box>
      </Box>
    </Box>
  );
}
