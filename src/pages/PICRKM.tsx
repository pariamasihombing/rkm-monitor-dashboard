import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  Assessment,
  ContentPaste,
  TrendingUp,
  Search as SearchIcon,
} from "@mui/icons-material";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProfileMenu from "../components/ProfileMenu";
import { statuses } from "../data/dashboardMock";
import logoDanantara from "../assets/logo-danantara.png";
import logoPelindo from "../assets/logo-pelindo.png";
import batikOrnament from "../assets/batik 1.png";

/* ================= TYPES ================= */

interface Subtask {
  id_subtask: number;
  name: string;
  status: {
    name: string;
  };
}

interface Stage {
  id_stage: number;
  name: string;
  id_program: number;
  id_status: number;
  plan_start: string;
  plan_finish: string;
  status?: {
    name: string;
  };
  subtasks?: Subtask[];
}

interface Program {
  id_program: number;
  name: string;
  type: string;
  pic: string;
  overall_progress: number;
  plan_start: string;
  plan_finish: string;
  status: {
    id_status: number;
    name: string;
  };
  stages?: Stage[];
}

/* ================= COMPONENT ================= */

export default function PICRKM() {
  const navigate = useNavigate();
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedPIC, setSelectedPIC] = useState("All");
  const [profileAnchor, setProfileAnchor] = useState<HTMLElement | null>(null);
  const [activeMenu, setActiveMenu] = useState("RKM / Program");
  const [activeTab, setActiveTab] = useState("Program");
  
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8000/api/programs");
      const data = await response.json();
      // Filter for RKM programs if we are on the RKM page
      setPrograms(data.filter((p: Program) => p.type === "RKM"));
    } catch (error) {
      console.error("Error fetching programs:", error);
    } finally {
      setLoading(false);
    }
  };

  const allStages = programs.flatMap(p => (p.stages || []).map(s => ({
    ...s,
    programName: p.name,
    programId: p.id_program
  })));

  const getStageProgress = (stage: Stage) => {
    if (!stage.subtasks || stage.subtasks.length === 0) return 0;
    const completed = stage.subtasks.filter(t => t.status?.name === "Done").length;
    return Math.round((completed / stage.subtasks.length) * 100);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus program ini?")) {
      try {
        const response = await fetch(`http://localhost:8000/api/programs/${id}`, {
          method: "DELETE",
        });
        if (response.ok) {
          alert("Program berhasil dihapus!");
          fetchPrograms();
        }
      } catch (error) {
        console.error("Error deleting program:", error);
      }
    }
  };

  const handleDeleteStage = async (id: number) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus tahapan ini?")) {
      try {
        const response = await fetch(`http://localhost:8000/api/stages/${id}`, {
          method: "DELETE",
        });
        if (response.ok) {
          alert("Tahapan berhasil dihapus!");
          fetchPrograms();
        }
      } catch (error) {
        console.error("Error deleting stage:", error);
      }
    }
  };

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
            { icon: DashboardIcon, label: "Dashboard" },
            { icon: Assessment, label: "RKM / Program" },
            { icon: ContentPaste, label: "Non RKM" },
            { icon: TrendingUp, label: "Weekly Monitoring" },
          ].map((item) => (
            <Button
              key={item.label}
              startIcon={<item.icon sx={{ fontSize: "1.4rem" }} />}
              onClick={() => {
                setActiveMenu(item.label);
                const routeMap: Record<string, string> = {
                  "Dashboard": "/pic-dashboard",
                  "RKM / Program": "/pic-rkm",
                  "Non RKM": "/pic-non-rkm",
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
                  "&:hover": {
                    bgcolor: "rgba(255,255,255,0.3)",
                  },
                }),
                ...!(activeMenu === item.label) && {
                  "&:hover": {
                    bgcolor: "rgba(255,255,255,0.1)",
                  },
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
            <Box component="img" src={logoPelindo} alt="Pelindo" sx={{ height: 50, width: "auto" }} />
          </Box>

          <ProfileMenu
            profileAnchor={profileAnchor}
            setProfileAnchor={setProfileAnchor}
            userName="Pariama Valentino"
          />
        </Box>

        {/* ================= CONTENT ================= */}
        <Box sx={{ p: 4, maxWidth: 1400, mx: "auto", pb: 15 }}>
          {/* FILTER */}
          <Card sx={{ mb: 3, boxShadow: "0 2px 12px rgba(21,101,192,0.04)", bgcolor: "#FFFFFF" }}>
            <CardContent sx={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 5, pt: 3, pb: 4, px: 4 }}>
              <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <Typography variant="caption" sx={{ display: "block", mb: 0.5, fontWeight: 600, fontSize: "0.85rem", color: "#727989" }}>
                  Status
                </Typography>
                <TextField
                  select
                  size="small"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  fullWidth
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "5px",
                      "& fieldset": { borderColor: "rgba(83, 83, 83, 0.21)" },
                      "&:hover fieldset": { borderColor: "rgba(83, 83, 83, 0.21)" },
                    },
                    "& .MuiOutlinedInput-input": { color: "#000000" },
                  }}
                >
                  {statuses.map((s) => (
                    <MenuItem key={s} value={s}>{s}</MenuItem>
                  ))}
                </TextField>
              </Box>

              <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <Typography variant="caption" sx={{ display: "block", mb: 0.5, fontWeight: 600, fontSize: "0.85rem", color: "#727989" }}>
                  PIC
                </Typography>
                <TextField
                  select
                  size="small"
                  value={selectedPIC}
                  onChange={(e) => setSelectedPIC(e.target.value)}
                  fullWidth
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "5px",
                      "& fieldset": { borderColor: "rgba(83, 83, 83, 0.21)" },
                      "&:hover fieldset": { borderColor: "rgba(83, 83, 83, 0.21)" },
                    },
                    "& .MuiOutlinedInput-input": { color: "#000000" },
                  }}
                >
                  <MenuItem value="All">All</MenuItem>
                  <MenuItem value="VP Surya, Reza, Raghi">VP Surya, Reza, Raghi</MenuItem>
                </TextField>
              </Box>

              <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <Typography variant="caption" sx={{ display: "block", mb: 0.5, fontWeight: 600, fontSize: "0.85rem", color: "#727989" }}>
                  Date Range
                </Typography>
                <TextField
                  type="date"
                  size="small"
                  fullWidth
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "5px",
                      "& fieldset": { borderColor: "rgba(83, 83, 83, 0.21)" },
                      "&:hover fieldset": { borderColor: "rgba(83, 83, 83, 0.21)" },
                    },
                    "& .MuiOutlinedInput-input": { color: "#B0BBD5" },
                  }}
                />
              </Box>

              <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <Typography variant="caption" sx={{ display: "block", mb: 0.5, fontWeight: 600, fontSize: "0.85rem", color: "#727989" }}>
                  Search
                </Typography>
                <TextField
                  size="small"
                  placeholder="Search Program..."
                  fullWidth
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "5px",
                      "& fieldset": { borderColor: "rgba(83, 83, 83, 0.21)" },
                      "&:hover fieldset": { borderColor: "rgba(83, 83, 83, 0.21)" },
                    },
                    "& .MuiOutlinedInput-input": { color: "#B0BBD5" },
                  }}
                  InputProps={{
                    endAdornment: <SearchIcon sx={{ fontSize: 18, color: "#9CA3AF" }} />,
                  }}
                />
              </Box>
            </CardContent>
          </Card>

          {/* ================= PROGRAM/TAHAPAN LIST TABLE ================= */}
          <Card sx={{ boxShadow: "0 2px 12px rgba(21,101,192,0.04)" }}>
            <CardContent sx={{ p: 3 }}>
              {/* Header row: toggle + Tambah Program button */}
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, ml: 2, mr: 2 }}>
                <Box sx={{ display: "flex", gap: 3, alignItems: "center" }}>
                  <Typography
                    onClick={() => setActiveTab("Program")}
                    fontWeight={700}
                    fontSize="1.05rem"
                    sx={{
                      cursor: "pointer",
                      color: activeTab === "Program" ? "#0C4B7D" : "#727989",
                      borderBottom: activeTab === "Program" ? "2px solid #0C4B7D" : "none",
                      pb: 0.5,
                      transition: "all 0.2s"
                    }}
                  >
                    Program List
                  </Typography>
                  <Typography
                    onClick={() => setActiveTab("Tahapan")}
                    fontWeight={700}
                    fontSize="1.05rem"
                    sx={{
                      cursor: "pointer",
                      color: activeTab === "Tahapan" ? "#0C4B7D" : "#727989",
                      borderBottom: activeTab === "Tahapan" ? "2px solid #0C4B7D" : "none",
                      pb: 0.5,
                      transition: "all 0.2s"
                    }}
                  >
                    Tahapan List
                  </Typography>
                </Box>
                {activeTab === "Program" && (
                  <Button
                    onClick={() => navigate("/pic-tambah-program")}
                    sx={{
                      color: "#1F77AE",
                      fontWeight: 700,
                      fontSize: "0.85rem",
                      textTransform: "none",
                      p: 0,
                      minWidth: "auto",
                      "&:hover": { 
                        bgcolor: "transparent",
                      },
                    }}
                  >
                    + Tambah Program
                  </Button>
                )}
              </Box>

              <TableContainer sx={{ px: 2, pb: 1 }}>
                <Table sx={{ minWidth: 650, borderCollapse: "separate", borderSpacing: "0 13px" }}>
                  <TableHead>
                    <TableRow
                      sx={{
                        bgcolor: "#F9FAFC",
                        "& th": {
                          border: "none",
                          bgcolor: "#F9FAFC",
                        },
                        "& th:first-of-type": {
                          borderTopLeftRadius: "8px",
                          borderBottomLeftRadius: "8px",
                          borderLeft: "1px solid #DBDBDB",
                          borderTop: "1px solid #DBDBDB",
                          borderBottom: "1px solid #DBDBDB",
                        },
                        "& th:last-of-type": {
                          borderTopRightRadius: "8px",
                          borderBottomRightRadius: "8px",
                          borderRight: "1px solid #DBDBDB",
                          borderTop: "1px solid #DBDBDB",
                          borderBottom: "1px solid #DBDBDB",
                        },
                        "& th:not(:first-of-type):not(:last-of-type)": {
                          borderTop: "1px solid #DBDBDB",
                          borderBottom: "1px solid #DBDBDB",
                        },
                      }}
                    >
                      <TableCell align="center" sx={{ fontWeight: 600, fontSize: "0.85rem", color: "#727989", py: 0.5, whiteSpace: "nowrap", width: activeTab === "Program" ? "22%" : "25%" }}>
                        {activeTab === "Program" ? "Program/Project" : "Tahapan/Action"}
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600, fontSize: "0.85rem", color: "#727989", py: 0.5, whiteSpace: "nowrap", width: activeTab === "Program" ? "14%" : "20%" }}>
                        {activeTab === "Program" ? "PIC" : "Program"}
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600, fontSize: "0.85rem", color: "#727989", py: 0.5, whiteSpace: "nowrap", width: "12%" }}>Status</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600, fontSize: "0.85rem", color: "#727989", py: 0.5, whiteSpace: "nowrap", width: "20%" }}>Progress Overall</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600, fontSize: "0.85rem", color: "#727989", py: 0.5, whiteSpace: "nowrap", width: "14%" }}>Alarm</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600, fontSize: "0.85rem", color: "#727989", py: 0.5, whiteSpace: "nowrap", width: "10%" }}>Deadline</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600, fontSize: "0.85rem", color: "#727989", py: 0.5, whiteSpace: "nowrap", width: "8%" }}>Action</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 10 }}>
                          <CircularProgress size={30} />
                        </TableCell>
                      </TableRow>
                    ) : (activeTab === "Program" ? programs : allStages).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                          <Typography color="textSecondary">
                            Tidak ada {activeTab === "Program" ? "program" : "tahapan"} ditemukan.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (activeTab === "Program" ? programs : allStages).map((item: any, idx) => (
                      <TableRow
                        key={activeTab === "Program" ? item.id_program : item.id_stage}
                        className="anim-fadein-up"
                        style={{ animationDelay: `${0.08 + idx * 0.07}s` }}
                        sx={{
                          border: "2px solid #DBDBDB",
                          outline: "1px solid #DBDBDB",
                          borderRadius: "4px",
                          bgcolor: "#FFFFFF",
                          transition: "background-color 0.15s ease, box-shadow 0.15s ease",
                          "& td": { borderRadius: "4px", border: "none" },
                          "& td:first-of-type": { borderTopLeftRadius: "4px", borderBottomLeftRadius: "4px" },
                          "& td:last-of-type": { borderTopRightRadius: "4px", borderBottomRightRadius: "4px" },
                          "&:hover": { bgcolor: "#F5F8FF", boxShadow: "0 2px 12px rgba(12,75,125,0.07)" },
                        }}
                      >
                        {/* Title (Program Name or Stage Name) */}
                        <TableCell sx={{ py: 2 }}>
                          <Typography fontWeight={600} fontSize="0.9rem" sx={{ color: "#000000" }}>
                            {item.name}
                          </Typography>
                        </TableCell>

                        {/* Secondary (PIC or Program Name) */}
                        <TableCell sx={{ py: 2 }}>
                          <Typography fontWeight={600} fontSize="0.85rem" sx={{ color: "#727989" }}>
                            {activeTab === "Program" 
                              ? (item.pic ? item.pic.split(" | ").filter((part: string) => part !== "").join(", ") : "-")
                              : item.programName}
                          </Typography>
                        </TableCell>

                        {/* Status */}
                        <TableCell sx={{ py: 2 }} align="center">
                          <Chip
                            label={item.status?.name || "N/A"}
                            sx={{
                              bgcolor: "#F0F6FF",
                              color: "#3E65EB",
                              fontWeight: 700,
                              fontSize: "0.8rem",
                              borderRadius: "10px",
                              border: "1px solid #C3DDFF",
                            }}
                          />
                        </TableCell>

                        {/* Progress */}
                        <TableCell sx={{ py: 2 }}>
                          <Box sx={{ display: "flex", flexDirection: "column" }}>
                            <Box
                              sx={{
                                display: "flex",
                                height: 10,
                                bgcolor: "#F2F5F9",
                                borderRadius: 2,
                                overflow: "hidden",
                                width: "100%",
                                mb: 0.5,
                              }}
                            >
                              <Box
                                className="progress-fill"
                                sx={{
                                  height: "100%",
                                  width: `${activeTab === "Program" ? item.overall_progress : getStageProgress(item)}%`,
                                  bgcolor: "#2865FD",
                                  borderRadius: "2px 0 0 2px",
                                }}
                              />
                            </Box>
                            <Typography fontSize="0.8rem" sx={{ color: "#2865FD", fontWeight: 600 }}>
                              Actual {activeTab === "Program" ? item.overall_progress : getStageProgress(item)}%
                            </Typography>
                          </Box>
                        </TableCell>

                        {/* Alarm */}
                        <TableCell sx={{ py: 2 }} align="center">
                          <Chip
                            label="ON TRACK"
                            sx={{
                              bgcolor: "#E6FFFA",
                              color: "#047481",
                              fontWeight: 700,
                              fontSize: "0.8rem",
                              borderRadius: "10px",
                              border: "1px solid #B2F5EA",
                            }}
                          />
                        </TableCell>

                        {/* Deadline */}
                        <TableCell sx={{ py: 2 }} align="center">
                          <Typography fontWeight={600} fontSize="0.9rem" sx={{ color: "#727989" }}>
                            {activeTab === "Program" ? item.plan_finish : item.plan_finish}
                          </Typography>
                        </TableCell>

                        {/* Action — View | Edit | Hapus */}
                        <TableCell sx={{ py: 2 }}>
                          <Box sx={{ display: "flex", gap: 1, alignItems: "center", justifyContent: "center" }}>
                            <Button
                              size="small"
                              onClick={() => navigate("/pic-program-detail", { 
                                state: { 
                                  from: "/pic-rkm", 
                                  programId: activeTab === "Program" ? item.id_program : item.programId 
                                } 
                              })}
                              sx={{
                                textTransform: "none",
                                fontWeight: 700,
                                color: "#2196F3",
                                fontSize: "0.85rem",
                                p: 0,
                                minWidth: "auto",
                                "&:hover": { bgcolor: "transparent" },
                              }}
                            >
                              View
                            </Button>
                            <Typography sx={{ fontSize: "0.8rem", color: "#DBDBDB" }}>|</Typography>
                            <Button
                              size="small"
                              onClick={() => {
                                if (activeTab === "Program") {
                                  navigate("/pic-edit-program", {
                                    state: {
                                      from: "/pic-rkm",
                                      programId: item.id_program,
                                      namaProgram: item.name,
                                      tipeProgram: item.type,
                                      pic: item.pic,
                                      status: item.status?.name,
                                      planStart: item.plan_start,
                                      planFinish: item.plan_finish,
                                    },
                                  });
                                } else {
                                  navigate("/pic-edit-tahapan", {
                                    state: {
                                      from: "/pic-rkm",
                                      programId: item.programId,
                                      sectionId: item.id_stage,
                                      namaTahapan: item.name,
                                      deliverable: item.deliverable,
                                      status: item.status?.name,
                                      planStart: item.plan_start,
                                      planFinish: item.plan_finish,
                                    },
                                  });
                                }
                              }}
                              sx={{
                                textTransform: "none",
                                fontWeight: 700,
                                color: "#F97316",
                                fontSize: "0.85rem",
                                p: 0,
                                minWidth: "auto",
                                "&:hover": { bgcolor: "transparent" },
                              }}
                            >
                              Edit
                            </Button>
                            <Typography sx={{ fontSize: "0.8rem", color: "#DBDBDB" }}>|</Typography>
                            <Button
                              size="small"
                              onClick={() => activeTab === "Program" ? handleDelete(item.id_program) : handleDeleteStage(item.id_stage)}
                              sx={{
                                textTransform: "none",
                                fontWeight: 700,
                                color: "#E9004A",
                                fontSize: "0.85rem",
                                p: 0,
                                minWidth: "auto",
                                "&:hover": { bgcolor: "transparent" },
                              }}
                            >
                              Hapus
                            </Button>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}
