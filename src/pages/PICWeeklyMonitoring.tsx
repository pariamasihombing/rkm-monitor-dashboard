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
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  Assessment,
  ContentPaste,
  TrendingUp,
  Search as SearchIcon,
  CalendarToday as CalendarIcon,
} from "@mui/icons-material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ProfileMenu from "../components/ProfileMenu";import logoDanantara from "../assets/logo-danantara.png";
import logoPelindo from "../assets/logo-pelindo.png";
import batikOrnament from "../assets/batik 1.png";
import { allPrograms } from "../data/programDetailMock";

/* ================= DATA (same as WeeklyMonitoring) ================= */

const dueThisWeekData = [
  {
    id: 1,
    program: "Tindaklanjut Pemurnian Bisnis 2026",
    tahapan: "A: Serah Operasi...",
    subtask: "Penyusunan SOP serah terima operasi",
    deadline: "5 Feb",
    status: "ON PROGRESS",
  },
  {
    id: 2,
    program: "Pengembangan Terminal Curah Kering & Cair di Lingkungan S..",
    tahapan: "B: Pelaksanaan Pe...",
    subtask: "Analisis gap bisnis proses antar entitas",
    deadline: "7 Feb",
    status: "ON PROGRESS",
  },
  {
    id: 3,
    program: "Pengembangan Terminal Curah Kering & Cair di Lingkungan S..",
    tahapan: "C: Terminal Produ...",
    subtask: "Koordinasi dengan Pertamina untuk kebutuhan terminal",
    deadline: "6 Feb",
    status: "ON PROGRESS",
  },
  {
    id: 4,
    program: "Tindaklanjut Pemurnian Bisnis 2026",
    tahapan: "C: Serah Operasi T...",
    subtask: "Sosialisasi rencana serah operasi ke stakeholder",
    deadline: "9 Feb",
    status: "NOT STARTED",
  },
];

const overdueData = [
  {
    id: 1,
    program: "Tindaklanjut Pemurnian Bisnis 2026",
    subtask: "Penyusunan SOP serah terima operasi",
    subtaskDetail: "A: Serah Operasi Branch Reg 1,2,3,4",
    overdueDays: "4 days",
    status: "ON PROGRESS",
  },
  {
    id: 2,
    program: "Tindaklanjut Pemurnian Bisnis 2026",
    subtask: "Assessment kondisi terminal dan SDM",
    subtaskDetail: "C: Serah Operasi Terminal Penump...",
    overdueDays: "4 days",
    status: "ON PROGRESS",
  },
  {
    id: 3,
    program: "Pengembangan Terminal Curah Kering & Cair di Lingkungan SPMT",
    subtask: "Korespondensi dengan Pemda dan stakeholder terkait",
    subtaskDetail: "C: Pengembangan TCK Dumai",
    overdueDays: "14 days",
    status: "ON PROGRESS",
  },
  {
    id: 4,
    program: "Tindaklanjut Pemurnian Bisnis 2026",
    subtask: "Pembentukan tim vertikal merge",
    subtaskDetail: "B: Pelaksanaan Pemurnian Bisnis Su...",
    overdueDays: "9 days",
    status: "ON PROGRESS",
  },
];

const summaryCards = [
  { label: "Due This Week",       value: 5, color: "#0C4B7D" },
  { label: "Completed This Week", value: 3, color: "#009E6D" },
  { label: "Overdue Carryover",   value: 6, color: "#E9004A" },
  { label: "Newly Started",       value: 2, color: "#9B1CFC" },
];

/* ================= COMPONENT ================= */

export default function PICWeeklyMonitoring() {
  const navigate = useNavigate();
  const [selectedWeek]    = useState("This Week (3-9 Feb)");
  const [selectedStatus,  setSelectedStatus]  = useState("All");
  const [selectedProgram, setSelectedProgram] = useState("All Programs");
  const [profileAnchor,   setProfileAnchor]   = useState<HTMLElement | null>(null);
  const [activeMenu,      setActiveMenu]      = useState("Weekly Monitoring");

  /* ---- shared table header row style ---- */
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

  /* ---- shared table body row style ---- */
  const tbRowSx = {
    border: "2px solid #DBDBDB", outline: "1px solid #DBDBDB",
    borderRadius: "4px", bgcolor: "#FFFFFF",
    "& td": { borderRadius: "4px", border: "none" },
    "& td:first-of-type": { borderTopLeftRadius: "4px", borderBottomLeftRadius: "4px" },
    "& td:last-of-type":  { borderTopRightRadius: "4px", borderBottomRightRadius: "4px" },
  };

  /* ---- status chip ---- */
  const statusChip = (status: string) => {
    const isNotStarted = status === "NOT STARTED";
    return (
      <Chip
        label={status}
        sx={{
          bgcolor:    isNotStarted ? "#F5F5F5" : "#F0F6FF",
          color:      isNotStarted ? "#727989" : "#3E65EB",
          fontWeight: 700,
          fontSize:   "0.8rem",
          borderRadius: "10px",
          border: isNotStarted ? "1px solid #DBDBDB" : "1px solid #C3DDFF",
        }}
      />
    );
  };

  /* ---- "Update Status" action button (PIC-specific, stacked 2 lines like Figma) ---- */
  const updateStatusBtn = (onClick: () => void) => (
    <Button
      size="small"
      onClick={onClick}
      sx={{
        textTransform: "none",
        fontWeight: 700,
        color: "#2196F3",
        fontSize: "0.82rem",
        lineHeight: 1.2,
        p: 0,
        minWidth: "auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        "&:hover": { bgcolor: "transparent", color: "#1a669a" },
      }}
    >
      Update
      <br />
      Status
    </Button>
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
          <ProfileMenu
            profileAnchor={profileAnchor}
            setProfileAnchor={setProfileAnchor}
            userName="Pariama Valentino"
          />
        </Box>

        {/* ================= CONTENT ================= */}
        <Box sx={{ p: 4, maxWidth: 1400, mx: "auto", pb: 15 }}>

          {/* ================= FILTER ================= */}
          <Card sx={{ mb: 3, boxShadow: "0 2px 12px rgba(21,101,192,0.04)", bgcolor: "#FFFFFF" }}>
            <CardContent sx={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 5, pt: 3, pb: 4, px: 4 }}>

              {/* Week */}
              <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <Typography variant="caption" sx={{ display: "block", mb: 0.5, fontWeight: 600, fontSize: "0.85rem", color: "#727989" }}>
                  Week
                </Typography>
                <TextField
                  select
                  size="small"
                  value={selectedWeek}
                  fullWidth
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "5px",
                      "& fieldset": { borderColor: "rgba(83,83,83,0.21)" },
                      "&:hover fieldset": { borderColor: "rgba(83,83,83,0.21)" },
                    },
                    "& .MuiOutlinedInput-input": { color: "#000000" },
                  }}
                  InputProps={{
                    startAdornment: <CalendarIcon sx={{ fontSize: 18, color: "#9CA3AF", mr: 1 }} />,
                  }}
                >
                  <MenuItem value="This Week (3-9 Feb)">This Week (3-9 Feb)</MenuItem>
                  <MenuItem value="Last Week (27 Jan - 2 Feb)">Last Week (27 Jan - 2 Feb)</MenuItem>
                </TextField>
              </Box>

              {/* Status */}
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
                      "& fieldset": { borderColor: "rgba(83,83,83,0.21)" },
                      "&:hover fieldset": { borderColor: "rgba(83,83,83,0.21)" },
                    },
                    "& .MuiOutlinedInput-input": { color: "#000000" },
                  }}
                >
                  <MenuItem value="All">All</MenuItem>
                  <MenuItem value="ON PROGRESS">ON PROGRESS</MenuItem>
                  <MenuItem value="NOT STARTED">NOT STARTED</MenuItem>
                  <MenuItem value="COMPLETED">COMPLETED</MenuItem>
                </TextField>
              </Box>

              {/* Program */}
              <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <Typography variant="caption" sx={{ display: "block", mb: 0.5, fontWeight: 600, fontSize: "0.85rem", color: "#727989" }}>
                  Program
                </Typography>
                <TextField
                  select
                  size="small"
                  value={selectedProgram}
                  onChange={(e) => setSelectedProgram(e.target.value)}
                  fullWidth
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "5px",
                      "& fieldset": { borderColor: "rgba(83,83,83,0.21)" },
                      "&:hover fieldset": { borderColor: "rgba(83,83,83,0.21)" },
                    },
                    "& .MuiOutlinedInput-input": { color: "#000000" },
                  }}
                >
                  <MenuItem value="All Programs">All Programs</MenuItem>
                  <MenuItem value="Tindaklanjut Pemurnian Bisnis 2026">Tindaklanjut Pemurnian Bisnis 2026</MenuItem>
                  <MenuItem value="Pengembangan Terminal Curah Kering">Pengembangan Terminal Curah Kering</MenuItem>
                </TextField>
              </Box>

              {/* Search */}
              <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <Typography variant="caption" sx={{ display: "block", mb: 0.5, fontWeight: 600, fontSize: "0.85rem", color: "#727989" }}>
                  Search
                </Typography>
                <TextField
                  size="small"
                  placeholder="Search Subtask..."
                  fullWidth
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "5px",
                      "& fieldset": { borderColor: "rgba(83,83,83,0.21)" },
                      "&:hover fieldset": { borderColor: "rgba(83,83,83,0.21)" },
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
                    {card.value}
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
                      <TableCell align="center" sx={{ ...thCellSx, width: "14%" }}>Deadline</TableCell>
                      <TableCell align="center" sx={{ ...thCellSx, width: "8%"  }}>Action</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {dueThisWeekData.map((item, idx) => (
                      <TableRow
                        key={item.id}
                        className="anim-fadein-up"
                        style={{ animationDelay: `${0.1 + idx * 0.07}s` }}
                        sx={{ ...tbRowSx, transition: "background-color 0.15s ease", "&:hover": { bgcolor: "#F5F8FF" } }}
                      >
                        {/* Program/Project */}
                        <TableCell sx={{ py: 2 }}>
                          <Typography fontWeight={600} fontSize="0.9rem" sx={{ color: "#000000" }}>
                            {item.program}
                          </Typography>
                        </TableCell>

                        {/* Tahapan */}
                        <TableCell sx={{ py: 2 }}>
                          <Typography fontWeight={600} fontSize="0.85rem" sx={{ color: "#727989" }}>
                            {item.tahapan}
                          </Typography>
                        </TableCell>

                        {/* Subtask */}
                        <TableCell sx={{ py: 2 }}>
                          <Typography fontWeight={600} fontSize="0.85rem" sx={{ color: "#727989" }}>
                            {item.subtask}
                          </Typography>
                        </TableCell>

                        {/* Deadline */}
                        <TableCell align="center" sx={{ py: 2 }}>
                          <Typography fontWeight={600} fontSize="0.9rem" sx={{ color: "#727989" }}>
                            {item.deadline}
                          </Typography>
                        </TableCell>

                        {/* Status chip */}
                        <TableCell align="center" sx={{ py: 2 }}>
                          {statusChip(item.status)}
                        </TableCell>

                        {/* Action — "Update Status" (PIC only) */}
                        <TableCell align="center" sx={{ py: 2 }}>
                          {updateStatusBtn(() => {
                            const found = allPrograms.find((p) =>
                              item.program.startsWith(p.title.slice(0, 20))
                            );
                            navigate("/pic-edit-subtask", {
                              state: {
                                from: "/pic-weekly-monitoring",
                                programId: found?.id ?? allPrograms[0].id,
                                namaSubtask: item.subtask,
                                status: item.status,
                              },
                            });
                          })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

          {/* ================= OVERDUE & BEHIND TABLE ================= */}
          <Card sx={{ boxShadow: "0 2px 12px rgba(21,101,192,0.04)" }}>
            <CardContent sx={{ p: 3 }}>
              <Typography fontWeight={700} fontSize="1.05rem" sx={{ ml: 1, mb: 1 }}>
                Overdue & Behind
              </Typography>

              <TableContainer sx={{ px: 2, pb: 1 }}>
                <Table sx={{ minWidth: 650, borderCollapse: "separate", borderSpacing: "0 13px" }}>
                  <TableHead>
                    <TableRow sx={thRowSx}>
                      <TableCell align="center" sx={{ ...thCellSx, width: "25%" }}>Program/Project</TableCell>
                      <TableCell align="center" sx={{ ...thCellSx, width: "30%" }}>Subtask</TableCell>
                      <TableCell align="center" sx={{ ...thCellSx, width: "12%" }}>Deadline</TableCell>
                      <TableCell align="center" sx={{ ...thCellSx, width: "15%" }}>Deadline</TableCell>
                      <TableCell align="center" sx={{ ...thCellSx, width: "8%"  }}>Action</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {overdueData.map((item, idx) => (
                      <TableRow
                        key={item.id}
                        className="anim-fadein-up"
                        style={{ animationDelay: `${0.15 + idx * 0.07}s` }}
                        sx={{ ...tbRowSx, transition: "background-color 0.15s ease", "&:hover": { bgcolor: "#FFF5F7" } }}
                      >
                        {/* Program/Project */}
                        <TableCell sx={{ py: 2 }}>
                          <Typography fontWeight={600} fontSize="0.9rem" sx={{ color: "#000000" }}>
                            {item.program}
                          </Typography>
                        </TableCell>

                        {/* Subtask + Detail */}
                        <TableCell sx={{ py: 2 }}>
                          <Typography fontWeight={600} fontSize="0.85rem" sx={{ color: "#727989" }}>
                            {item.subtask}
                          </Typography>
                          <Typography fontSize="0.8rem" sx={{ color: "#A0AEC0", mt: 0.3 }}>
                            {item.subtaskDetail}
                          </Typography>
                        </TableCell>

                        {/* Overdue Days chip */}
                        <TableCell align="center" sx={{ py: 2 }}>
                          <Chip
                            label={item.overdueDays}
                            sx={{
                              bgcolor: "#FFF0F3",
                              color: "#E9004A",
                              fontWeight: 700,
                              fontSize: "0.8rem",
                              borderRadius: "10px",
                              border: "1px solid #FFCDD9",
                            }}
                          />
                        </TableCell>

                        {/* Status chip */}
                        <TableCell align="center" sx={{ py: 2 }}>
                          {statusChip(item.status)}
                        </TableCell>

                        {/* Action — "Update Status" (PIC only) */}
                        <TableCell align="center" sx={{ py: 2 }}>
                          {updateStatusBtn(() => {
                            const found = allPrograms.find((p) =>
                              item.program.startsWith(p.title.slice(0, 20))
                            );
                            navigate("/pic-edit-subtask", {
                              state: {
                                from: "/pic-weekly-monitoring",
                                programId: found?.id ?? allPrograms[0].id,
                                namaSubtask: item.subtask,
                                status: item.status,
                              },
                            });
                          })}
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
