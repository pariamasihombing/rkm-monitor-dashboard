import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  MenuItem,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  Assessment,
  ContentPaste,
  TrendingUp,
  Search as SearchIcon,
  Warning as WarningIcon,
  TrendingDown as TrendingDownIcon,
  AccessTime as AccessTimeIcon,
} from "@mui/icons-material";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProfileMenu from "../components/ProfileMenu";
import {
  dashboardMetrics,
  targetAchievement,
  programs,
  statuses,
} from "../data/dashboardMock";
import logoDanantara from "../assets/logo-danantara.png";
import logoPelindo from "../assets/logo-pelindo.png";
import batikOrnament from "../assets/batik 1.png";
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

/* ================= CUSTOM TOOLTIP ================= */

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <Box
        sx={{
          bgcolor: "#FFFFFF",
          border: "1px solid #E8ECF1",
          borderRadius: "12px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
          p: 1.8,
          minWidth: 160,
        }}
      >
        <Typography sx={{ fontWeight: 700, fontSize: "0.8rem", color: "#1E293B", mb: 1 }}>
          {label}
        </Typography>
        {payload.map((entry: any, index: number) => (
          <Box key={index} sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.3 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: entry.color }} />
            <Typography sx={{ fontSize: "0.78rem", color: "#64748B", fontWeight: 500 }}>
              {entry.name}:
            </Typography>
            <Typography sx={{ fontSize: "0.78rem", color: "#1E293B", fontWeight: 700 }}>
              {entry.value}%
            </Typography>
          </Box>
        ))}
      </Box>
    );
  }
  return null;
};

const renderPieLabel = (props: any) => {
  const { cx, cy, midAngle, innerRadius, outerRadius, value } = props;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) / 2;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <g>
      {/* Subtle background glow */}
      <circle cx={x} cy={y} r="20" fill="#FFFFFF" opacity="0.15" />
      <text
        x={x}
        y={y}
        fill="#1E293B"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="14"
        fontWeight="700"
        letterSpacing="0.5"
      >
        {value}
      </text>
    </g>
  );
};

/* ================= DATA ================= */

const trendData = [
  { name: "Week 1", Expected: 10, Actual: 15 },
  { name: "Week 2", Expected: 20, Actual: 25 },
  { name: "Week 3", Expected: 35, Actual: 40 },
  { name: "Week 4", Expected: 50, Actual: 55 },
  { name: "Week 5", Expected: 65, Actual: 65 },
  { name: "Week 6", Expected: 75, Actual: 70 },
];

const statusData = [
  { name: "Done", value: 45, color: "#4CAF50" },
  { name: "On Progress", value: 30, color: "#2196F3" },
  { name: "Not Started", value: 15, color: "#FF9800" },
  { name: "Hold", value: 10, color: "#9C27B0" },
];

/* ================= DEFAULT STATE ================= */

const defaultDashboard = {
  totalProgram: 0,
  totalTask: 0,
  onTrack: 0,
  behindExpected: 0,
  overdue: 0,
  dueSoon: 0,
  chartData: {
    trendChart: { labels: ["W-4", "W-3", "W-2", "W-1", "Current"], expected: [0, 0, 0, 0, 0], actual: [0, 0, 0, 0, 0] },
    statusBreakdown: {
      labels: ["Done", "On Progress", "Not Started", "Hold"],
      values: [0, 0, 0, 0],
      colors: ["#4CAF50", "#2196F3", "#FF9800", "#9C27B0"],
    },
  },
  targetAchievement: { actualProgress: 0, expectedProgress: 0, gap: 0 },
  alerts: [] as any[],
};

/* ================= COMPONENT ================= */

export default function PICDashboard() {
  const navigate = useNavigate();
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedAlarm, setSelectedAlarm] = useState("All");
  const [selectedPIC, setSelectedPIC] = useState("All");
  const [selectedDate, setSelectedDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [profileAnchor, setProfileAnchor] = useState<HTMLElement | null>(null);
  const [activeMenu, setActiveMenu] = useState("Dashboard");
  const [dashData, setDashData] = useState(defaultDashboard);

  useEffect(() => {
    const delay = setTimeout(() => {
      const params = new URLSearchParams();
      if (selectedStatus && selectedStatus !== "All") params.append("status", selectedStatus);
      if (selectedAlarm && selectedAlarm !== "All") params.append("alarm", selectedAlarm);
      if (selectedPIC && selectedPIC !== "All") params.append("pic", selectedPIC);
      if (selectedDate) params.append("date", selectedDate);
      if (searchQuery) params.append("search", searchQuery);

      fetch(`http://localhost:8000/api/dashboard?${params.toString()}`)
        .then((r) => r.json())
        .then((data) => setDashData(data))
        .catch(() => setDashData(defaultDashboard));
    }, 400);
    return () => clearTimeout(delay);
  }, [selectedStatus, selectedAlarm, selectedPIC, selectedDate, searchQuery]);

  const MetricCard = ({
    label,
    value,
    color,
  }: {
    label: string;
    value: number;
    color: string;
  }) => (
    <Card sx={{ borderRadius: 1, boxShadow: "0 2px 8px rgba(21,101,192,0.04)", minHeight: 70, display: "flex", alignItems: "center" }}>
      <CardContent sx={{ pb: 2, pt: 3, px: 3, textAlign: "left", width: "100%" }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontSize: "0.8rem", fontWeight: 700 }}>
          {label}
        </Typography>
        <Typography variant="h4" sx={{ color, fontWeight: 700, fontSize: "2.2rem" }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
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
                  }
                }),
                ...!(activeMenu === item.label) && {
                  "&:hover": {
                    bgcolor: "rgba(255,255,255,0.1)",
                  }
                }
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
            <Box component="img" src={logoDanantara} alt="Danantara" sx={{ height: 30, width: 'auto' }} />
            <Box component="img" src={logoPelindo} alt="Pelindo" sx={{ height: 50, width: 'auto' }} />
          </Box>

          <ProfileMenu
            profileAnchor={profileAnchor}
            setProfileAnchor={setProfileAnchor}
            userName="Pariama Valentino"
          />
        </Box>

        {/* ================= CONTENT ================= */}
        <Box id="dashboard-content" sx={{ p: 4, maxWidth: 1200, mx: "auto", pb: 6 }}>
          {/* FILTER */}
          <Card sx={{ mb: 3, boxShadow: "0 2px 12px rgba(21,101,192,0.04)", bgcolor: "#FFFFFF" }}>
            <CardContent sx={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 3, pt: 3, pb: 4, px: 4 }}>
              {/* Status */}
              <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <Typography variant="caption" sx={{ display: "block", mb: 0.5, fontWeight: 600, fontSize: "0.85rem", color: "#727989" }}>
                  Status
                </Typography>
                <TextField
                  select size="small" value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  fullWidth
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "5px", "& fieldset": { borderColor: "rgba(83,83,83,0.21)" }, "&:hover fieldset": { borderColor: "rgba(83,83,83,0.21)" } }, "& .MuiOutlinedInput-input": { color: "#000" } }}
                >
                  {statuses.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                </TextField>
              </Box>

              {/* Alarm */}
              <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <Typography variant="caption" sx={{ display: "block", mb: 0.5, fontWeight: 600, fontSize: "0.85rem", color: "#727989" }}>
                  Alarm
                </Typography>
                <TextField
                  select size="small" value={selectedAlarm}
                  onChange={(e) => setSelectedAlarm(e.target.value)}
                  fullWidth
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "5px", "& fieldset": { borderColor: "rgba(83,83,83,0.21)" }, "&:hover fieldset": { borderColor: "rgba(83,83,83,0.21)" } }, "& .MuiOutlinedInput-input": { color: "#000" } }}
                >
                  <MenuItem value="All">All</MenuItem>
                  <MenuItem value="On Track">On Track</MenuItem>
                  <MenuItem value="Behind Expected">Behind Expected</MenuItem>
                  <MenuItem value="Due Soon">Due Soon</MenuItem>
                  <MenuItem value="Overdue">Overdue</MenuItem>
                </TextField>
              </Box>

              {/* PIC */}
              <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <Typography variant="caption" sx={{ display: "block", mb: 0.5, fontWeight: 600, fontSize: "0.85rem", color: "#727989" }}>
                  PIC
                </Typography>
                <TextField
                  select size="small" value={selectedPIC}
                  onChange={(e) => setSelectedPIC(e.target.value)}
                  fullWidth
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "5px", "& fieldset": { borderColor: "rgba(83,83,83,0.21)" }, "&:hover fieldset": { borderColor: "rgba(83,83,83,0.21)" } }, "& .MuiOutlinedInput-input": { color: "#000" } }}
                >
                  <MenuItem value="All">All</MenuItem>
                  <MenuItem value="Raghi">Raghi</MenuItem>
                  <MenuItem value="Fero">Fero</MenuItem>
                  <MenuItem value="Suci">Suci</MenuItem>
                  <MenuItem value="Hendra">Hendra</MenuItem>
                  <MenuItem value="Reza">Reza</MenuItem>
                  <MenuItem value="VP Joni">VP Joni</MenuItem>
                  <MenuItem value="VP Surya">VP Surya</MenuItem>
                </TextField>
              </Box>

              {/* Date Range */}
              <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <Typography variant="caption" sx={{ display: "block", mb: 0.5, fontWeight: 600, fontSize: "0.85rem", color: "#727989" }}>
                  Date Range
                </Typography>
                <TextField
                  type="date" size="small" value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  fullWidth
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "5px", "& fieldset": { borderColor: "rgba(83,83,83,0.21)" }, "&:hover fieldset": { borderColor: "rgba(83,83,83,0.21)" } }, "& .MuiOutlinedInput-input": { color: "#B0BBD5" } }}
                />
              </Box>

              {/* Search */}
              <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <Typography variant="caption" sx={{ display: "block", mb: 0.5, fontWeight: 600, fontSize: "0.85rem", color: "#727989" }}>
                  Search
                </Typography>
                <TextField
                  size="small" value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Program..."
                  fullWidth
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "5px", "& fieldset": { borderColor: "rgba(83,83,83,0.21)" }, "&:hover fieldset": { borderColor: "rgba(83,83,83,0.21)" } }, "& .MuiOutlinedInput-input": { color: "#B0BBD5" } }}
                  InputProps={{ endAdornment: <SearchIcon sx={{ fontSize: 18, color: "#9CA3AF" }} /> }}
                />
              </Box>
            </CardContent>
          </Card>

          {/* METRICS */}
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 2, mb: 4 }}>
            {[
              { label: "Total Program/RKM", value: dashData.totalProgram, color: "#2865FD" },
              { label: "Total Task", value: dashData.totalTask, color: "#0C4B7D" },
              { label: "On Track", value: dashData.onTrack, color: "#009E6D" },
              { label: "Behind Expected", value: dashData.behindExpected, color: "#E07800" },
              { label: "Overdue", value: dashData.overdue, color: "#E9004A" },
              { label: "Due Soon", value: dashData.dueSoon, color: "#F15300" },
            ].map((m, i) => (
              <div key={m.label} className={`anim-fadein-up anim-d${i + 1} card-hover`}>
                <MetricCard label={m.label} value={m.value} color={m.color} />
              </div>
            ))}
          </Box>

          {/* ================= CHARTS ================= */}
          <Typography fontSize="1.05rem" fontWeight={700} mb={4} px={4}>
            Grafik & Analisis
          </Typography>

          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2.5, mb: 3 }}>
            {/* AREA CHART */}
            <Card className="anim-fadein-up anim-d3 card-hover" sx={{ borderRadius: 3, boxShadow: "0 2px 16px rgba(21,101,192,0.06)", border: "1px solid #EDF0F7", overflow: "hidden", transition: "all 0.3s ease" }}>
              <CardContent sx={{ p: 3, pb: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2, px: 1 }}>
                  <Typography fontWeight={700} fontSize="1rem" sx={{ color: "#1E293B", letterSpacing: "0.3px" }}>
                    Actual vs Expected Trend
                  </Typography>
                  <Box sx={{ display: "flex", gap: 2.5 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.7, px: 1.2, py: 0.5, bgcolor: "#F0FDF4", borderRadius: "8px", border: "1px solid #E0F2E0" }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#10B981", boxShadow: "0 2px 6px rgba(16,185,129,0.3)" }} />
                      <Typography fontSize="0.75rem" fontWeight={600} color="#047857">Actual</Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.7, px: 1.2, py: 0.5, bgcolor: "#F5F3FF", borderRadius: "8px", border: "1px solid #E9D5FF" }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#8B5CF6", boxShadow: "0 2px 6px rgba(139,92,246,0.3)" }} />
                      <Typography fontSize="0.75rem" fontWeight={600} color="#6D28D9">Expected</Typography>
                    </Box>
                  </Box>
                </Box>
                <Box sx={{ width: "100%", height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={dashData.chartData.trendChart.labels.map((label: string, i: number) => ({
                        name: label,
                        Expected: dashData.chartData.trendChart.expected[i] ?? 0,
                        Actual: dashData.chartData.trendChart.actual[i] ?? 0,
                      }))}
                      margin={{ right: 20, left: -10, bottom: 5, top: 30 }}
                    >
                      <defs>
                        <linearGradient id="gradActual" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10B981" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gradExpected" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.18} />
                          <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="#F1F5F9" strokeDasharray="none" vertical={false} />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: "#94A3B8", fontWeight: 500 }}
                        dy={8}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: "#94A3B8", fontWeight: 500 }}
                        dx={-5}
                      />
                      <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#CBD5E1", strokeDasharray: "4 4" }} />
                      <Area
                        type="monotone"
                        dataKey="Expected"
                        stroke="#8B5CF6"
                        strokeWidth={2.5}
                        fill="url(#gradExpected)"
                        dot={{ r: 5, fill: "#8B5CF6", stroke: "#FFFFFF", strokeWidth: 2.5 }}
                        activeDot={{ r: 7, fill: "#8B5CF6", stroke: "#FFFFFF", strokeWidth: 3 }}
                        label={{
                          position: "top",
                          fill: "#1E293B",
                          fontSize: 13,
                          fontWeight: 700,
                          offset: 15,
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="Actual"
                        stroke="#10B981"
                        strokeWidth={2.5}
                        fill="url(#gradActual)"
                        dot={{ r: 5, fill: "#10B981", stroke: "#FFFFFF", strokeWidth: 2.5 }}
                        activeDot={{ r: 7, fill: "#10B981", stroke: "#FFFFFF", strokeWidth: 3 }}
                        label={{
                          position: "bottom",
                          fill: "#1E293B",
                          fontSize: 13,
                          fontWeight: 700,
                          offset: 15,
                        }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>

            {/* DONUT CHART */}
            <Card className="anim-fadein-up anim-d4 card-hover" sx={{ borderRadius: 3, boxShadow: "0 2px 16px rgba(21,101,192,0.06)", border: "1px solid #EDF0F7", overflow: "hidden", transition: "all 0.3s ease" }}>
              <CardContent sx={{ p: 3, pb: 2 }}>
                <Typography fontWeight={700} fontSize="1rem" sx={{ color: "#1E293B", px: 1, mb: 1, letterSpacing: "0.3px" }}>
                  Status Breakdown
                </Typography>
                <Box sx={{ width: "100%", height: 300, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative" }}>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={dashData.chartData.statusBreakdown.labels.map((label: string, i: number) => ({
                          name: label,
                          value: dashData.chartData.statusBreakdown.values[i] ?? 0,
                          color: dashData.chartData.statusBreakdown.colors[i] ?? "#ccc",
                        }))}
                        innerRadius={68}
                        outerRadius={105}
                        dataKey="value"
                        paddingAngle={3}
                        strokeWidth={0}
                        label={renderPieLabel}
                        labelLine={false}
                      >
                        {dashData.chartData.statusBreakdown.labels.map((label: string, i: number) => (
                          <Cell
                            key={label}
                            fill={dashData.chartData.statusBreakdown.colors[i] ?? "#ccc"}
                            style={{
                              filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.12))",
                              transition: "all 0.3s ease"
                            }}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0];
                            return (
                              <Box sx={{ bgcolor: "#FFF", border: "1px solid #E8ECF1", borderRadius: "12px", boxShadow: "0 8px 24px rgba(0,0,0,0.12)", p: 1.8, minWidth: 140 }}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, mb: 0.5 }}>
                                  <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: data.payload.color }} />
                                  <Typography fontSize="0.8rem" fontWeight={600} color="#1E293B">{data.name}</Typography>
                                </Box>
                                <Typography fontSize="0.9rem" fontWeight={700} color="#1E293B">{data.value} items</Typography>
                              </Box>
                            );
                          }
                          return null;
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Center Label */}
                  <Box sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center" }}>
                    <Typography fontSize="1.8rem" fontWeight={800} color="#1E293B" lineHeight={1} sx={{ letterSpacing: "-1px" }}>
                      {dashData.chartData.statusBreakdown.values.reduce((a: number, b: number) => a + b, 0)}
                    </Typography>
                    <Typography fontSize="0.75rem" fontWeight={600} color="#94A3B8" sx={{ mt: 0.3, letterSpacing: "0.5px" }}>
                      Total
                    </Typography>
                  </Box>
                </Box>
                {/* Legend */}
                <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap", mt: 1 }}>
                  {dashData.chartData.statusBreakdown.labels.map((label: string, i: number) => (
                    <Box
                      key={label}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.8,
                        px: 1.5,
                        py: 0.7,
                        bgcolor: "#F8FAFC",
                        borderRadius: "10px",
                        border: "1px solid #EAEEF7",
                        transition: "all 0.25s ease",
                        "&:hover": {
                          bgcolor: "#EFF4FB",
                          border: "1px solid #D4DFE8",
                          transform: "translateY(-2px)",
                          boxShadow: "0 4px 12px rgba(21,101,192,0.08)"
                        }
                      }}>
                      <Box sx={{ width: 10, height: 10, borderRadius: "4px", bgcolor: dashData.chartData.statusBreakdown.colors[i], boxShadow: `0 2px 6px ${dashData.chartData.statusBreakdown.colors[i]}33` }} />
                      <Typography fontSize="0.8rem" fontWeight={600} color="#64748B" sx={{ letterSpacing: "0.2px" }}>{label}</Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* ================= TARGET vs ACHIEVEMENT ================= */}
          <Card className="anim-fadein-up anim-d4 card-hover"
            sx={{
              borderRadius: 2,
              mb: 4,
              boxShadow: "0 2px 12px rgba(21,101,192,0.04)",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography fontWeight={700} sx={{ ml: 1 }}>
                  Target vs Achievement
                </Typography>
                {/* STATUS INDICATOR */}
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    bgcolor:
                      (dashData.targetAchievement.actualProgress / dashData.targetAchievement.expectedProgress) >= 1
                        ? "#10B981"
                        : (dashData.targetAchievement.actualProgress / dashData.targetAchievement.expectedProgress) >= 0.9
                          ? "#FF9800"
                          : "#E9004A",
                    boxShadow: `0 2px 8px ${(dashData.targetAchievement.actualProgress / dashData.targetAchievement.expectedProgress) >= 1
                        ? "rgba(16,185,129,0.4)"
                        : (dashData.targetAchievement.actualProgress / dashData.targetAchievement.expectedProgress) >= 0.9
                          ? "rgba(255,152,0,0.4)"
                          : "rgba(233,0,74,0.4)"
                      }`,
                  }}
                />
              </Box>

              {/* TOP METRICS */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  mb: 3,
                }}
              >
                <Box sx={{ ml: 1 }}>
                  <Typography color="text.secondary" fontSize={13} sx={{ mb: 0.5 }}>
                    Actual Progress
                  </Typography>
                  <Typography fontSize={28} fontWeight={700} color="#2865FD">
                    {dashData.targetAchievement.actualProgress}%
                  </Typography>
                </Box>

                <Box>
                  <Typography color="text.secondary" fontSize={13} sx={{ mb: 0.5 }}>
                    Expected Progress
                  </Typography>
                  <Typography fontSize={28} fontWeight={700} color="#0C4B7D">
                    {dashData.targetAchievement.expectedProgress}%
                  </Typography>
                </Box>

                <Box>
                  <Typography color="text.secondary" fontSize={13} sx={{ mb: 0.5 }}>
                    Gap
                  </Typography>
                  <Typography fontSize={28} fontWeight={700} color="#E07800">
                    {dashData.targetAchievement.gap}%
                  </Typography>
                </Box>
              </Box>

              {/* EXPECTED BAR */}
              <Box sx={{ mb: 2, mx: 1, mt: 3 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                  <Typography fontSize={13} fontWeight={600}>
                    Expected
                  </Typography>
                  <Typography fontSize={13} fontWeight={600} color="#0C4B7D">
                    {dashData.targetAchievement.expectedProgress}%
                  </Typography>
                </Box>
                <Box sx={{ height: 6, bgcolor: "#B0BBD5", borderRadius: 2, overflow: "hidden" }}>
                  <Box
                    className="progress-fill"
                    sx={{
                      height: "100%",
                      width: `${dashData.targetAchievement.expectedProgress}%`,
                      bgcolor: "#0C4B7D",
                      borderRadius: 2,
                    }}
                  />
                </Box>
              </Box>

              {/* ACTUAL BAR */}
              <Box sx={{ mx: 1 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                  <Typography fontSize={13} fontWeight={600}>
                    Actual
                  </Typography>
                  <Typography fontSize={13} fontWeight={600} color="#2865FD">
                    {dashData.targetAchievement.actualProgress}%
                  </Typography>
                </Box>
                <Box sx={{ height: 6, bgcolor: "#B0BBD5", borderRadius: 2, overflow: "hidden" }}>
                  <Box
                    className="progress-fill"
                    sx={{
                      height: "100%",
                      width: `${dashData.targetAchievement.actualProgress}%`,
                      bgcolor: "#2865FD",
                      borderRadius: 2,
                    }}
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* ================= ALERTS - DENGAN VIEW | EDIT | HAPUS ================= */}
          <Card className="anim-fadein-up anim-d5 card-hover"
            sx={{
              borderRadius: 2,
              boxShadow: "0 2px 12px rgba(21,101,192,0.04)",
              mb: 4,
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Typography fontWeight={700} mb={2}>
                Alerts
              </Typography>

              {/* ALERT ITEM */}
              <Box sx={{ display: "grid", gap: 1.5 }}>
                {dashData.alerts.length === 0 ? (
                  <Typography align="center" color="text.secondary" sx={{ py: 3, fontWeight: 500, fontSize: "0.9rem" }}>
                    Tidak ada alert saat ini.
                  </Typography>
                ) : (
                  dashData.alerts.map((alert: any, i: number) => (
                    <Box
                      key={i}
                      className="anim-fadein-up"
                    style={{ animationDelay: `${0.35 + i * 0.07}s` }}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      p: 2,
                      bgcolor: "#FAFAFA",
                      borderRadius: 0.5,
                      transition: "background-color 0.18s ease",
                      "&:hover": { bgcolor: "#F3F6FB" },
                      borderLeft: `8px solid ${alert.status === "OVERDUE"
                        ? "#C60041"
                        : alert.status === "BEHIND_EXPECTED"
                          ? "#BB5600"
                          : "#C93F00"
                        }`,
                    }}
                  >
                    <Typography fontWeight={600} fontSize={14}>{alert.title}</Typography>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          px: 2.5,
                          py: 1,
                          bgcolor:
                            alert.status === "OVERDUE"
                              ? "#C60041"
                              : alert.status === "BEHIND_EXPECTED"
                                ? "#BB5600"
                                : "#C93F00",
                          color:
                            alert.status === "OVERDUE"
                              ? "#FEF2F3"
                              : alert.status === "BEHIND_EXPECTED"
                                ? "#FFFBEB"
                                : "#FFF8EE",
                          fontWeight: 700,
                          borderRadius: "10px",
                          border: `1.5px solid ${alert.status === "OVERDUE"
                            ? "#FDCFD5"
                            : alert.status === "BEHIND_EXPECTED"
                              ? "#FDE78A"
                              : "#FED9AB"
                            }`,
                          fontSize: "0.9rem",
                          letterSpacing: "0.3px",
                          minWidth: "auto",
                          justifyContent: "center",
                        }}
                      >
                        {alert.status === "OVERDUE" && (
                          <WarningIcon sx={{ fontSize: "1.1rem" }} />
                        )}
                        {alert.status === "BEHIND_EXPECTED" && (
                          <TrendingDownIcon sx={{ fontSize: "1.1rem" }} />
                        )}
                        {alert.status === "DUE_SOON" && (
                          <AccessTimeIcon sx={{ fontSize: "1.1rem" }} />
                        )}
                        <Typography sx={{ fontWeight: 700, fontSize: "0.7rem", letterSpacing: "1px" }}>
                          {alert.status}
                        </Typography>
                      </Box>

                      <Typography color="text.secondary" fontSize={13} sx={{ minWidth: 80 }} fontWeight={600}>
                        {alert.date}
                      </Typography>

                      <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                        <Button
                          size="small"
                          onClick={() => navigate("/pic-program-detail", { state: { from: "/pic-dashboard", programId: alert.programId } })}
                          sx={{
                            textTransform: "none",
                            fontWeight: 700,
                            color: "#2196F3",
                            fontSize: "0.85rem",
                            p: 0,
                            minWidth: "auto",
                            "&:hover": { bgcolor: "transparent" }
                          }}
                        >
                          View
                        </Button>
                        <Typography sx={{ fontSize: "0.8rem", color: "#DBDBDB" }}>|</Typography>
                        <Button
                          size="small"
                          onClick={() => navigate("/pic-edit-subtask", { state: { from: "/pic-dashboard", alertId: alert.id, title: alert.title, programId: alert.programId } })}
                          sx={{
                            textTransform: "none",
                            fontWeight: 700,
                            color: "#F97316",
                            fontSize: "0.85rem",
                            p: 0,
                            minWidth: "auto",
                            "&:hover": { bgcolor: "transparent" }
                          }}
                        >
                          Edit
                        </Button>
                        <Typography sx={{ fontSize: "0.8rem", color: "#DBDBDB" }}>|</Typography>
                        <Button
                          size="small"
                          onClick={() => {
                            console.log("Delete alert:", alert.id);
                          }}
                          sx={{
                            textTransform: "none",
                            fontWeight: 700,
                            color: "#E9004A",
                            fontSize: "0.85rem",
                            p: 0,
                            minWidth: "auto",
                            "&:hover": { bgcolor: "transparent" }
                          }}
                        >
                          Hapus
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                ))
              )}
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}
