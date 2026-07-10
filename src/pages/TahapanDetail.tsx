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
  CalendarToday as CalendarIcon,
  InsertDriveFile as FileIcon,
  Warning as WarningIcon,
  ManageAccounts as ManageAccountsIcon,
} from "@mui/icons-material";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ProfileMenu from "../components/ProfileMenu";
import logoDanantara from "../assets/logo-danantara.png";
import logoPelindo from "../assets/logo-pelindo.png";
import batikOrnament from "../assets/batik 1.png";
import { programById, type TaskStatus } from "../data/programDetailMock";
import { canManage } from "../utils/rbac";

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
  "/manage-users": "Kelola Akun",
};

/* ================= COMPONENT ================= */

export default function TahapanDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const fromRoute = location.state?.from || "/rkm";
  const returnTo = location.state?.returnTo || "/program-detail";
  const programId: any = location.state?.programId;
  const stageId: any = location.state?.stageId;

  const [stage, setStage] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStageDetail();
  }, [stageId]);

  const fetchStageDetail = async () => {
    setLoading(true);
    console.log("Fetching stage with IDs:", { programId, stageId });
    try {
      if (typeof programId === "string" && (programId.startsWith("rkm-") || programId.startsWith("nonrkm-"))) {
        const prog = programById(programId);
        const section = prog?.sections.find(s => String(s.id) === String(stageId));
        if (section) {
            setStage({
                ...section,
                programTitle: prog?.title,
                start: prog?.start,
                deadline: prog?.deadline,
                status: { name: "ON PROGRESS" }, // Mock
                deliverable: "Sample Deliverable",
                notes: "Sample Notes",
                actual: Math.round((section.tasks.filter((t: any) => t.status === "DONE").length / section.tasks.length) * 100) || 0,
                expected: 50,
                gap: -50,
                overdue: section.tasks.filter(t => t.overdue).length
            });
        } else {
            console.warn("Stage not found in mock data", { programId, stageId });
        }
      } else if (stageId) {
        const response = await fetch(`http://localhost:8000/api/stages/${stageId}`);
        if (!response.ok) throw new Error("Failed to fetch stage from API");
        const data = await response.json();
        
        const normalized = {
          ...data,
          id: data.id_stage,
          title: data.name,
          programTitle: data.program?.name || "-",
          start: data.plan_start,
          deadline: data.plan_finish,
          notes: data.notes,
          actual: data.subtasks?.length > 0 ? Math.round((data.subtasks.filter((t: any) => t.status?.name === "DONE").length / data.subtasks.length) * 100) : 0,
          expected: 50, // Mocked
          gap: 0, // Mocked
          overdue: 0, // Mocked
          tasks: data.subtasks?.map((t: any) => ({
            id: t.id_subtask,
            title: t.name,
            deliverable: t.deliverable,
            dateRange: `${t.plan_start} - ${t.plan_finish}`,
            status: (t.status?.name || "NOT STARTED").toUpperCase(),
            overdue: false,
          })) || []
        };
        
        setStage(normalized);
      } else {
        console.error("No stageId provided for stage detail");
      }
    } catch (error) {
      console.error("Error fetching stage detail:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus subtask ini?")) return;

    try {
      const response = await fetch(`http://localhost:8000/api/subtasks/${taskId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        fetchStageDetail();
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
                    "Dashboard": "/dashboard",
                    "RKM / Program": "/rkm",
                    "Non RKM": "/non-rkm",
                    "Weekly Monitoring": "/weekly-monitoring",
                    "Kelola Akun": "/manage-users"
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
          ))})()}
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
            onClick={() => navigate(returnTo, { state: { from: fromRoute, programId } })}
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
          ) : !stage ? (
            <Box sx={{ p: 5, textAlign: "center" }}>
                <Typography variant="h6" color="textSecondary">Data Tahapan tidak ditemukan.</Typography>
                <Typography color="textSecondary" sx={{ mb: 3 }}>ID Tahapan: {stageId || "kosong"}</Typography>
                <Button variant="contained" onClick={() => navigate(returnTo, { state: { from: fromRoute, programId } })}>
                    Kembali ke Program Detail
                </Button>
            </Box>
          ) : (
            <>
              {/* ================= TAHAPAN INFO CARD ================= */}
              <Card
                className="anim-fadein-up anim-d1 card-hover"
                sx={{
                  mb: 3,
                  borderRadius: 2,
                  boxShadow: "0 2px 12px rgba(21,101,192,0.06)",
                  border: "1px solid #E8ECF4",
                }}
              >
                <CardContent sx={{ p: 4, pb: "32px !important" }}>
                  {/* Breadcrumb style titles */}
                  <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 2 }}>
                    <Box>
                      <Typography fontSize="0.82rem" color="#64748B" fontWeight={600} mb={0.2}>
                        {stage.programTitle}
                      </Typography>
                      <Typography fontSize="0.85rem" color="#267ABD" fontWeight={700} mb={0.8}>
                        Tahapan: {stage.title}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Status Chips */}
                  <Box sx={{ display: "flex", gap: 1, mb: 3 }}>
                    <Chip
                      label={(stage.status?.name || "ON PROGRESS").toUpperCase()}
                      size="small"
                      sx={{ bgcolor: "#EFF6FF", color: "#2563EB", fontWeight: 700, fontSize: "0.75rem", borderRadius: "6px", height: 26, px: 1, border: "1px solid #BFDBFE" }}
                    />
                  </Box>

                  {/* Meta info Grid */}
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 3 }}>
                    <Box>
                      <Typography fontSize="0.85rem" color="#64748B" fontWeight={600} mb={0.5}>Deliverable :</Typography>
                      <Typography fontSize="0.95rem" color="#0F172A" fontWeight={500}>{stage.deliverable || "-"}</Typography>
                    </Box>

                    <Box>
                      <Typography fontSize="0.85rem" color="#64748B" fontWeight={600} mb={0.5}>Notes / Catatan :</Typography>
                      <Typography fontSize="0.95rem" color="#0F172A" fontWeight={500} sx={{ whiteSpace: "pre-wrap" }}>{stage.notes || "-"}</Typography>
                    </Box>

                    <Box sx={{ display: "flex", gap: 6 }}>
                      <Box>
                        <Typography fontSize="0.85rem" color="#64748B" fontWeight={600} mb={0.5}>Plan Start :</Typography>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <CalendarIcon sx={{ fontSize: "1.1rem", color: "#2563EB" }} />
                          <Typography fontSize="0.95rem" color="#0F172A" fontWeight={700}>{stage.start}</Typography>
                        </Box>
                      </Box>
                      <Box>
                        <Typography fontSize="0.85rem" color="#64748B" fontWeight={600} mb={0.5}>Plan Finish :</Typography>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <CalendarIcon sx={{ fontSize: "1.1rem", color: "#E9004A" }} />
                          <Typography fontSize="0.95rem" color="#0F172A" fontWeight={700}>{stage.deadline}</Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>

                  {/* Metrics Grid */}
                  <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1.5, mb: 3 }}>
                    {[
                      { label: "Actual",   value: `${stage.actual}%`,   color: "#2563EB" },
                      { label: "Expected", value: `${stage.expected}%`, color: "#0F172A" },
                      { label: "Gap",      value: `${stage.gap || 0}%`, color: (stage.gap || 0) < 0 ? "#E9004A" : "#009E6D"  },
                      { label: "Overdue",  value: stage.overdue,        color: "#E9004A" },
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
                          "&:hover": { boxShadow: "0 4px 16px rgba(12,75,125,0.1)", transform: "translateY(-2px)" },
                        }}
                      >
                        <Typography fontSize="0.78rem" color="#94A3B8" fontWeight={600} mb={0.8}>{m.label}</Typography>
                        <Typography className="number-pop" fontSize="2rem" fontWeight={700} color={m.color} lineHeight={1}
                          style={{ animationDelay: `${0.35 + i * 0.08}s` }}
                        >
                          {m.value}
                        </Typography>
                      </Box>
                    ))}
                  </Box>

                  {/* Divider */}
                  <Box sx={{ borderTop: "1px solid #F1F5F9", mt: 4, mb: 3 }} />

                  <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
                    <Button
                      variant="outlined"
                      onClick={() => navigate(returnTo, { state: { from: fromRoute, programId } })}
                      sx={{
                        textTransform: "none",
                        fontWeight: 700,
                        borderRadius: 2,
                        px: 3,
                        borderColor: "#E2E8F0",
                        color: "#64748B",
                        "&:hover": { borderColor: "#CBD5E1", bgcolor: "#F8FAFC" }
                      }}
                    >
                      Tutup
                    </Button>
                  </Box>
                </CardContent>
              </Card>

              {/* ================= SUBTASK LIST ================= */}
              <Card
                className="anim-fadein-up anim-d3"
                sx={{ borderRadius: 2, boxShadow: "0 2px 12px rgba(21,101,192,0.06)", border: "1px solid #E8ECF4" }}
              >
                <CardContent sx={{ p: 4 }}>
                  {/* Header */}
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2.5 }}>
                    <Typography fontWeight={700} fontSize="1rem" color="#0F172A">
                      Subtask List for this Tahapan
                    </Typography>
                    {canManage() && (
                      <Button
                        onClick={() => navigate(`/pic-tambah-subtask/${stageId}`)}
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
                        + Tambah Subtask
                      </Button>
                    )}
                  </Box>

                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                    {stage.tasks?.map((task: any, taskIndex: number) => {
                        const isOverdueTask = task.overdue;
                        return (
                        <Box
                            key={task.id}
                            sx={{
                            border: isOverdueTask ? "1px solid #FECDD3" : "1px solid #E2E8F0",
                            borderRadius: "8px",
                            p: 2.5,
                            bgcolor: isOverdueTask ? "#FFF5F5" : "#FAFBFC",
                            position: "relative",
                            transition: "box-shadow 0.2s ease, transform 0.2s ease",
                            "&:hover": {
                              boxShadow: "0 4px 12px rgba(21,101,192,0.08)",
                              transform: "translateY(-1px)",
                            },
                            }}
                        >
                            <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 2 }}>
                            {/* Task Left */}
                            <Box sx={{ flex: 1 }}>
                                <Typography fontSize="0.9rem" fontWeight={700} color="#0F172A" mb={0.8}>
                                {taskIndex + 1}. {task.title}
                                </Typography>

                                <Box sx={{ display: "flex", flexDirection: "column", gap: 0.8 }}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                    <Typography fontSize="0.8rem" color="#64748B" fontWeight={600}>Deliverable:</Typography>
                                    <Typography fontSize="0.8rem" color="#0F172A" fontWeight={500}>{task.deliverable}</Typography>
                                </Box>

                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                    <CalendarIcon sx={{ fontSize: "0.85rem", color: "#2563EB" }} />
                                    <Typography fontSize="0.8rem" color="#0F172A" fontWeight={600}>{task.dateRange}</Typography>
                                </Box>

                                {task.file && (
                                    <Box
                                    component="a"
                                    href="#"
                                    sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, textDecoration: "none", "&:hover span": { textDecoration: "underline" } }}
                                    >
                                    <FileIcon sx={{ fontSize: "0.85rem", color: "#2563EB" }} />
                                    <Typography fontSize="0.8rem" color="#2563EB" fontWeight={600}>{task.file}</Typography>
                                    </Box>
                                )}
                                </Box>
                            </Box>

                            {/* Task Right – Status + badges */}
                            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 0.8, minWidth: 110 }}>
                                <Chip
                                label={task.status}
                                size="small"
                                sx={{ ...getStatusStyle(task.status), fontWeight: 700, fontSize: "0.7rem", borderRadius: "6px", height: 22, letterSpacing: "0.3px" }}
                                />
                                {isOverdueTask && (
                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.4, bgcolor: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA", borderRadius: "6px", px: 1, py: 0.3 }}>
                                    <WarningIcon sx={{ fontSize: "0.8rem" }} />
                                    <Typography fontSize="0.7rem" fontWeight={700} letterSpacing="0.3px">OVERDUE</Typography>
                                </Box>
                                )}
                            </Box>
                            </Box>

                            {/* View | Edit | Hapus row — bottom right of task */}
                            <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 0.5, mt: 1.5, pt: 1.5, borderTop: "1px solid #F1F5F9" }}>
                                <ActionBtn 
                                    label="View" 
                                    color="#2196F3" 
                                    onClick={() => navigate("/subtask-detail", {
                                        state: {
                                            from: fromRoute,
                                            returnTo: "/tahapan-detail",
                                            programId,
                                            stageId,
                                            taskId: task.id,
                                        },
                                    })} 
                                />
                                {canManage() && (
                                  <>
                                    <Typography sx={{ fontSize: "0.8rem", color: "#DBDBDB" }}>|</Typography>
                                    <ActionBtn 
                                        label="Edit" 
                                        color="#F97316" 
                                        onClick={() => navigate("/pic-edit-subtask", {
                                          state: {
                                            from: "/tahapan-detail",
                                            programId,
                                            stageId,
                                            taskId: task.id,
                                            namaSubtask: task.title,
                                            status: task.status,
                                            startDate: task.dateRange?.split(" - ")[0] || "",
                                            deadline: task.dateRange?.split(" - ")[1] || "",
                                            expectedProgress: task.expected,
                                            actualProgress: task.actual,
                                            pic: "Unknown",
                                          },
                                        })} 
                                    />
                                    <Typography sx={{ fontSize: "0.8rem", color: "#DBDBDB" }}>|</Typography>
                                    <ActionBtn label="Hapus" color="#E9004A" onClick={() => handleDeleteTask(task.id)} />
                                  </>
                                )}
                            </Box>
                        </Box>
                        );
                    })}
                  </Box>
                </CardContent>
              </Card>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
}
