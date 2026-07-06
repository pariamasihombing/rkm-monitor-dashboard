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
  CalendarToday as CalendarIcon,
} from "@mui/icons-material";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProfileMenu from "../components/ProfileMenu";
import logoDanantara from "../assets/logo-danantara.png";
import logoPelindo from "../assets/logo-pelindo.png";
import batikOrnament from "../assets/batik 1.png";

/* ================= TYPES ================= */

interface Metrics {
  dueThisWeek: number;
  completedThisWeek: number;
  overdueCarryover: number;
  newlyStarted: number;
}

interface Task {
  id: number;
  programId: number;
  programName: string;
  stageName: string;
  subtaskName: string;
  deadline: string;
  status: string;
  actualProgress: number;
}

interface Program {
  id: number;
  name: string;
}

/* ================= HELPERS ================= */

function getWeekRange(offsetWeeks: number) {
  const now = new Date();
  now.setDate(now.getDate() + offsetWeeks * 7);
  const day = now.getDay();
  const diffToMon = day === 0 ? -6 : 1 - day;
  const mon = new Date(now);
  mon.setDate(now.getDate() + diffToMon);
  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);
  return {
    start: mon.toISOString().slice(0, 10),
    end: sun.toISOString().slice(0, 10),
  };
}

function formatDateRange(start: string, end: string) {
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  return `${fmt(start)} – ${fmt(end)}`;
}

/* ================= COMPONENT ================= */

export default function WeeklyMonitoring() {
  const navigate = useNavigate();

  /* ---- filter states ---- */
  const [selectedWeek, setSelectedWeek] = useState<"Last Week" | "This Week" | "Next Week">("This Week");
  
  // Calculate dates based on selectedWeek
  const dateRange = (() => {
    if (selectedWeek === "Last Week") return getWeekRange(-1);
    if (selectedWeek === "Next Week") return getWeekRange(1);
    return getWeekRange(0);
  })();
  
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedProgram, setSelectedProgram] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  /* ---- data states ---- */
  const [metrics, setMetrics] = useState<Metrics>({
    dueThisWeek: 0,
    completedThisWeek: 0,
    overdueCarryover: 0,
    newlyStarted: 0,
  });
  const [tasks, setTasks] = useState<Task[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  /* ---- profile anchor ---- */
  const [profileAnchor, setProfileAnchor] = useState<HTMLElement | null>(null);
  const [activeMenu, setActiveMenu] = useState("Weekly Monitoring");

  /* ---- fetch programs list for dropdown ---- */
  useEffect(() => {
    fetch("http://localhost:8000/api/programs")
      .then((r) => r.json())
      .then((data: any[]) => {
        setPrograms(
          data.map((p: any) => ({ id: p.id_program, name: p.name }))
        );
      })
      .catch(() => {});
  }, []);

  /* ---- fetch weekly monitoring data ---- */
  const fetchWeeklyData = () => {
    setIsLoading(true);
    const params = new URLSearchParams();
    params.set("start_date", dateRange.start);
    params.set("end_date", dateRange.end);
    if (selectedStatus !== "All") params.set("status", selectedStatus);
    if (selectedProgram !== "All") params.set("program_id", selectedProgram);
    if (searchQuery.trim()) params.set("search", searchQuery.trim());

    fetch(`http://localhost:8000/api/weekly-monitoring?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        setMetrics(data.metrics ?? {
          dueThisWeek: 0, completedThisWeek: 0,
          overdueCarryover: 0, newlyStarted: 0,
        });
        setTasks(data.tasks ?? []);
      })
      .catch(() => {
        setMetrics({ dueThisWeek: 0, completedThisWeek: 0, overdueCarryover: 0, newlyStarted: 0 });
        setTasks([]);
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchWeeklyData();
  }, [selectedWeek, selectedStatus, selectedProgram, searchQuery]);

  /* ---- card config ---- */
  const summaryCards = [
    { label: "Due This Week",      value: metrics.dueThisWeek,       color: "#0C4B7D" },
    { label: "Completed This Week", value: metrics.completedThisWeek, color: "#009E6D" },
    { label: "Overdue Carryover",  value: metrics.overdueCarryover,   color: "#E9004A" },
    { label: "Newly Started",      value: metrics.newlyStarted,       color: "#9B1CFC" },
  ];

  /* ---- shared table header style ---- */
  const thRowSx = {
    bgcolor: "#F9FAFC",
    "& th": { border: "none", bgcolor: "#F9FAFC" },
    "& th:first-of-type": {
      borderTopLeftRadius: "8px", borderBottomLeftRadius: "8px",
      borderLeft: "1px solid #DBDBDB", borderTop: "1px solid #DBDBDB", borderBottom: "1px solid #DBDBDB",
    },
    "& th:last-of-type": {
      borderTopRightRadius: "8px", borderBottomRightRadius: "8px",
      borderRight: "1px solid #DBDBDB", borderTop: "1px solid #DBDBDB", borderBottom: "1px solid #DBDBDB",
    },
    "& th:not(:first-of-type):not(:last-of-type)": {
      borderTop: "1px solid #DBDBDB", borderBottom: "1px solid #DBDBDB",
    },
  };

  const thCellSx = {
    fontWeight: 600, fontSize: "0.85rem", color: "#727989", py: 0.5, whiteSpace: "nowrap",
  };

  const tbRowSx = {
    border: "2px solid #DBDBDB", outline: "1px solid #DBDBDB", borderRadius: "4px", bgcolor: "#FFFFFF",
    "& td": { borderRadius: "4px", border: "none" },
    "& td:first-of-type": { borderTopLeftRadius: "4px", borderBottomLeftRadius: "4px" },
    "& td:last-of-type":  { borderTopRightRadius: "4px", borderBottomRightRadius: "4px" },
    "&:hover": { bgcolor: "#FAFAFA" },
  };

  /* ---- status chip helper ---- */
  const statusChip = (status: string) => {
    const s = (status ?? "").toUpperCase();
    const isNotStarted = s === "NOT STARTED";
    const isDone = s === "DONE" || s === "COMPLETED";
    return (
      <Chip
        label={status}
        sx={{
          bgcolor: isNotStarted ? "#F5F5F5" : isDone ? "#E8F5E9" : "#F0F6FF",
          color:   isNotStarted ? "#727989" : isDone ? "#2E7D32" : "#3E65EB",
          fontWeight: 700, fontSize: "0.8rem", borderRadius: "10px",
          border: isNotStarted ? "1px solid #DBDBDB" : isDone ? "1px solid #A5D6A7" : "1px solid #C3DDFF",
        }}
      />
    );
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#F7F9FB" }}>
      {/* ================= SIDEBAR ================= */}
      <Box
        sx={{
          width: 240, position: "fixed", height: "100vh", p: 3, pb: 0, pr: 0, color: "white",
          background: "linear-gradient(180deg, #0C4B7D 0%, #2586BF 100%)",
          display: "flex", flexDirection: "column", justifyContent: "space-between",
        }}
      >
        <Box>
          <Typography fontWeight={700} mb={3} sx={{ fontSize: "1.1rem", lineHeight: 1.2, letterSpacing: 0.5 }}>
            RKM Monitor<br />Dashboard System
          </Typography>
        </Box>

        <Box sx={{ px: -2 }}>
          {[
            { icon: DashboardIcon, label: "Dashboard" },
            { icon: Assessment,    label: "RKM / Program" },
            { icon: ContentPaste,  label: "Non RKM" },
            { icon: TrendingUp,    label: "Weekly Monitoring" },
          ].map((item) => (
            <Button
              key={item.label}
              startIcon={<item.icon sx={{ fontSize: "1.4rem" }} />}
              onClick={() => {
                setActiveMenu(item.label);
                const routeMap: Record<string, string> = {
                  "Dashboard": "/dashboard", "RKM / Program": "/rkm",
                  "Non RKM": "/non-rkm", "Weekly Monitoring": "/weekly-monitoring",
                };
                const route = routeMap[item.label];
                if (route) navigate(route);
              }}
              sx={{
                color: "white", justifyContent: "flex-start", mb: 1, px: 2, py: 1,
                borderRadius: 3, fontSize: "0.9rem", whiteSpace: "nowrap",
                border: "2px solid transparent",
                fontWeight: activeMenu === item.label ? 900 : 600,
                width: "calc(100% - 10px)", ml: -1.5,
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
            px: 4, py: 2, height: 70,
            display: "flex", justifyContent: "space-between", alignItems: "center",
            position: "sticky", top: 0, zIndex: 10,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box component="img" src={logoDanantara} alt="Danantara" sx={{ height: 30, width: "auto" }} />
            <Box component="img" src={logoPelindo}   alt="Pelindo"   sx={{ height: 50, width: "auto" }} />
          </Box>
          <ProfileMenu profileAnchor={profileAnchor} setProfileAnchor={setProfileAnchor} userName="Pariama Valentino" />
        </Box>

        {/* ================= CONTENT ================= */}
        <Box sx={{ p: 4, maxWidth: 1400, mx: "auto", pb: 15 }}>

          {/* ================= FILTER ================= */}
          <Card sx={{ mb: 3, boxShadow: "0 2px 12px rgba(21,101,192,0.04)", bgcolor: "#FFFFFF" }}>
            <CardContent sx={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 3, pt: 3, pb: 4, px: 4 }}>

              {/* Week */}
              <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <Typography variant="caption" sx={{ display: "block", mb: 0.5, fontWeight: 600, fontSize: "0.85rem", color: "#727989" }}>
                  Week
                </Typography>
                <TextField
                  select
                  size="small"
                  value={selectedWeek}
                  onChange={(e) => setSelectedWeek(e.target.value as any)}
                  fullWidth
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "5px",
                      "& fieldset": { borderColor: "rgba(83,83,83,0.21)" },
                      "&:hover fieldset": { borderColor: "rgba(83,83,83,0.21)" },
                    },
                    "& .MuiOutlinedInput-input": { color: "#000000" },
                  }}
                  InputProps={{ startAdornment: <CalendarIcon sx={{ fontSize: 18, color: "#9CA3AF", mr: 1 }} /> }}
                >
                  <MenuItem value="Last Week">Last Week</MenuItem>
                  <MenuItem value="This Week">This Week</MenuItem>
                  <MenuItem value="Next Week">Next Week</MenuItem>
                </TextField>
              </Box>

              {/* Status */}
              <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <Typography variant="caption" sx={{ display: "block", mb: 0.5, fontWeight: 600, fontSize: "0.85rem", color: "#727989" }}>
                  Status
                </Typography>
                <TextField
                  select size="small" value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)} fullWidth
                  sx={{
                    "& .MuiOutlinedInput-root": { borderRadius: "5px", "& fieldset": { borderColor: "rgba(83,83,83,0.21)" }, "&:hover fieldset": { borderColor: "rgba(83,83,83,0.21)" } },
                    "& .MuiOutlinedInput-input": { color: "#000000" },
                  }}
                >
                  <MenuItem value="All">All</MenuItem>
                  <MenuItem value="Not Started">Not Started</MenuItem>
                  <MenuItem value="On Progress">On Progress</MenuItem>
                  <MenuItem value="Done">Done</MenuItem>
                </TextField>
              </Box>

              {/* Program */}
              <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <Typography variant="caption" sx={{ display: "block", mb: 0.5, fontWeight: 600, fontSize: "0.85rem", color: "#727989" }}>
                  Program
                </Typography>
                <TextField
                  select size="small" value={selectedProgram}
                  onChange={(e) => setSelectedProgram(e.target.value)} fullWidth
                  sx={{
                    "& .MuiOutlinedInput-root": { borderRadius: "5px", "& fieldset": { borderColor: "rgba(83,83,83,0.21)" }, "&:hover fieldset": { borderColor: "rgba(83,83,83,0.21)" } },
                    "& .MuiOutlinedInput-input": { color: "#000000" },
                  }}
                >
                  <MenuItem value="All">All Programs</MenuItem>
                  {programs.map((p) => (
                    <MenuItem key={p.id} value={String(p.id)}>{p.name}</MenuItem>
                  ))}
                </TextField>
              </Box>

              {/* Search */}
              <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <Typography variant="caption" sx={{ display: "block", mb: 0.5, fontWeight: 600, fontSize: "0.85rem", color: "#727989" }}>
                  Search
                </Typography>
                <TextField
                  size="small" placeholder="Search Subtask..." fullWidth
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  sx={{
                    "& .MuiOutlinedInput-root": { borderRadius: "5px", "& fieldset": { borderColor: "rgba(83,83,83,0.21)" }, "&:hover fieldset": { borderColor: "rgba(83,83,83,0.21)" } },
                    "& .MuiOutlinedInput-input": { color: "#B0BBD5", "&::placeholder": { color: "#B0BBD5", opacity: 1 } },
                  }}
                  InputProps={{ endAdornment: <SearchIcon sx={{ fontSize: 18, color: "#9CA3AF" }} /> }}
                />
              </Box>
            </CardContent>
          </Card>

          {/* ================= LABEL RENTANG AKTIF ================= */}
          <Typography sx={{ fontSize: "0.85rem", color: "#727989", mb: 2, fontWeight: 500 }}>
            Showing data for: <strong>{formatDateRange(dateRange.start, dateRange.end)}</strong>
            {isLoading && <CircularProgress size={14} sx={{ ml: 1.5, verticalAlign: "middle" }} />}
          </Typography>

          {/* ================= SUMMARY CARDS ================= */}
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 3, mb: 3 }}>
            {summaryCards.map((card, i) => (
              <Card
                key={card.label}
                className={`anim-scale-in anim-d${i + 1} card-hover`}
                sx={{ boxShadow: "0 2px 12px rgba(21,101,192,0.04)", bgcolor: "#FFFFFF" }}
              >
                <CardContent sx={{ py: 2, px: 3 }}>
                  <Typography sx={{ fontSize: "0.85rem", color: "#727989", fontWeight: 600, mb: 0.5 }}>
                    {card.label}
                  </Typography>
                  <Typography className="number-pop" sx={{ fontSize: "2rem", fontWeight: 700, color: card.color, lineHeight: 1.2 }}>
                    {isLoading ? "—" : card.value}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>

          {/* ================= DUE THIS WEEK TABLE ================= */}
          <Card sx={{ boxShadow: "0 2px 12px rgba(21,101,192,0.04)", mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography fontWeight={700} fontSize="1.05rem" sx={{ ml: 1, mb: 1 }}>
                Due This Week
              </Typography>

              <TableContainer sx={{ px: 2, pb: 1 }}>
                <Table sx={{ minWidth: 650, borderCollapse: "separate", borderSpacing: "0 13px" }}>
                  <TableHead>
                    <TableRow sx={thRowSx}>
                      <TableCell align="center" sx={{ ...thCellSx, width: "22%" }}>Program/Project</TableCell>
                      <TableCell align="center" sx={{ ...thCellSx, width: "14%" }}>Tahapan</TableCell>
                      <TableCell align="center" sx={{ ...thCellSx, width: "24%" }}>Subtask</TableCell>
                      <TableCell align="center" sx={{ ...thCellSx, width: "10%" }}>Deadline</TableCell>
                      <TableCell align="center" sx={{ ...thCellSx, width: "8%"  }}>Progress</TableCell>
                      <TableCell align="center" sx={{ ...thCellSx, width: "14%" }}>Status</TableCell>
                      <TableCell align="center" sx={{ ...thCellSx, width: "8%"  }}>Action</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                          <CircularProgress size={28} />
                        </TableCell>
                      </TableRow>
                    ) : tasks.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 4, color: "#9CA3AF", fontWeight: 500 }}>
                          Tidak ada tugas yang jatuh tempo minggu ini.
                        </TableCell>
                      </TableRow>
                    ) : (
                      tasks.map((item, idx) => (
                        <TableRow
                          key={item.id}
                          className="anim-fadein-up"
                          style={{ animationDelay: `${0.1 + idx * 0.07}s` }}
                          sx={{ ...tbRowSx, transition: "background-color 0.15s ease", "&:hover": { bgcolor: "#F5F8FF" } }}
                        >
                          {/* Program/Project */}
                          <TableCell sx={{ py: 2 }}>
                            <Typography fontWeight={600} fontSize="0.9rem" sx={{ color: "#000000" }}>
                              {item.programName}
                            </Typography>
                          </TableCell>

                          {/* Tahapan */}
                          <TableCell sx={{ py: 2 }}>
                            <Typography fontWeight={600} fontSize="0.85rem" sx={{ color: "#727989" }}>
                              {item.stageName}
                            </Typography>
                          </TableCell>

                          {/* Subtask */}
                          <TableCell sx={{ py: 2 }}>
                            <Typography fontWeight={600} fontSize="0.85rem" sx={{ color: "#727989" }}>
                              {item.subtaskName}
                            </Typography>
                          </TableCell>

                          {/* Deadline */}
                          <TableCell align="center" sx={{ py: 2 }}>
                            <Typography fontWeight={600} fontSize="0.9rem" sx={{ color: "#727989" }}>
                              {item.deadline}
                            </Typography>
                          </TableCell>

                          {/* Progress */}
                          <TableCell align="center" sx={{ py: 2 }}>
                            <Typography fontWeight={700} fontSize="0.9rem" sx={{ color: "#2865FD" }}>
                              {item.actualProgress}%
                            </Typography>
                          </TableCell>

                          {/* Status */}
                          <TableCell align="center" sx={{ py: 2 }}>
                            {statusChip(item.status)}
                          </TableCell>

                          {/* Action */}
                          <TableCell align="center" sx={{ py: 2 }}>
                            <Button
                              size="small"
                              onClick={() => navigate("/program-detail", {
                                state: { from: "/weekly-monitoring", programId: item.programId }
                              })}
                              sx={{ textTransform: "none", fontWeight: 700, color: "#2196F3", fontSize: "0.9rem", "&:hover": { bgcolor: "transparent" } }}
                            >
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
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
