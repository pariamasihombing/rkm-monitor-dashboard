import { apiUrl } from "../utils/api";
import {
  Box,
  Button,
  Typography,
  Avatar,
  MenuItem,
  Card,
  CardContent,
  TextField,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  Assessment,
  ContentPaste,
  TrendingUp,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ProfileMenu from "../components/ProfileMenu";
import logoDanantara from "../assets/logo-danantara.png";
import logoPelindo from "../assets/logo-pelindo.png";
import batikOrnament from "../assets/batik-ornament.png";

/* ================= DATA ================= */

const TIPE_PROGRAM_OPTIONS = ["RKM", "Non RKM"];

const INITIATIVE_STRATEGY_OPTIONS = [
  "IS-08-Pengembangan Layanan Operasi di Luar Area Peli...",
  "IS-01-Transformasi Digital",
  "IS-02-Pengembangan SDM",
  "IS-03-Ekspansi Pasar",
];

const PIC_UTAMA_LIST      = ["Hendra", "Raghi", "Suci", "Fero", "Reza"];
const PIC_SUPPORTING_LIST = ["Hendra", "Raghi", "Suci", "Fero", "Reza"];
const PIC_SUPERVISOR_LIST = ["VP Joni", "VP Surya"];
const PIC_COLOR_ORDER     = ["Reza", "Raghi", "Suci", "Fero", "Hendra", "VP Joni", "VP Surya"];
const AVATAR_COLORS = [
  { avatarBg: "#BFDBFE", text: "#1D4ED8" },
  { avatarBg: "#BBF7D0", text: "#15803D" },
  { avatarBg: "#FDE68A", text: "#B45309" },
  { avatarBg: "#E9D5FF", text: "#7E22CE" },
  { avatarBg: "#FECDD3", text: "#BE123C" },
  { avatarBg: "#99F6E4", text: "#0F766E" },
  { avatarBg: "#FEF3C7", text: "#92400E" },
];

/* ================= SHARED FIELD STYLE ================= */

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "6px",
    "& fieldset": { borderColor: "rgba(83,83,83,0.25)" },
    "&:hover fieldset": { borderColor: "rgba(83,83,83,0.4)" },
    "&.Mui-focused fieldset": { borderColor: "#267ABD" },
  },
  "& .MuiOutlinedInput-input": {
    color: "#1E293B",
    fontSize: "0.9rem",
    height: "20px",
    py: "10px",
    display: "flex",
    alignItems: "center",
  },
  "& .MuiInputLabel-root": { color: "#727989", fontSize: "0.9rem" },
};

/* ================= COMPONENT ================= */

export default function PICEditProgram() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const fromRoute = location.state?.from ?? "/pic-rkm";
  const returnTo = location.state?.returnTo;
  const programId = location.state?.programId ?? null;

  // Form state — pre-fill from navigation state
  const [namaProgram,         setNamaProgram]         = useState<string>(location.state?.namaProgram         ?? "");
  const [tipeProgram,         setTipeProgram]         = useState<string>(location.state?.tipeProgram         ?? "RKM");
  const [initiativeStrategy,  setInitiativeStrategy]  = useState<string>(() => {
    const passed = location.state?.initiativeStrategy;
    if (!passed) return INITIATIVE_STRATEGY_OPTIONS[0];
    return INITIATIVE_STRATEGY_OPTIONS.find(opt => opt.startsWith(passed)) || passed;
  });
  // Status dikelola otomatis oleh sistem berdasarkan subtask
  const [planStart,           setPlanStart]           = useState<string>(location.state?.planStart           ?? "");
  const [planFinish,          setPlanFinish]          = useState<string>(location.state?.planFinish          ?? "");

  // PIC grouped state - parse from delimited string "Utama | Supporting | Supervisor"
  const picString = location.state?.pic ?? "";
  const picParts = picString.split(" | ");
  
  const [selectedUtama,      setSelectedUtama]      = useState<string[]>(
    picParts[0] ? picParts[0].split(", ").filter((p: string) => p !== "") : []
  );
  const [selectedSupporting, setSelectedSupporting] = useState<string[]>(
    picParts[1] ? picParts[1].split(", ").filter((p: string) => p !== "") : []
  );
  const [selectedSupervisor, setSelectedSupervisor] = useState<string[]>(
    picParts[2] ? picParts[2].split(", ").filter((p: string) => p !== "") : []
  );

  useEffect(() => {
    // If we have programId but missing detail (e.g. name), fetch from API
    if (programId && !namaProgram) {
      const fetchProgram = async () => {
        try {
          const response = await fetch(apiUrl(`/api/programs/${programId}`));
          if (response.ok) {
            const data = await response.json();
            setNamaProgram(data.name);
            setTipeProgram(data.type);
            
            const fullStrategy = INITIATIVE_STRATEGY_OPTIONS.find(opt => opt.startsWith(data.code_initiative_strategy)) || data.code_initiative_strategy;
            setInitiativeStrategy(fullStrategy);
            
            // Status dihilangkan, dikelola otomatis oleh sistem
            setPlanStart(data.plan_start);
            setPlanFinish(data.plan_finish);
            
            const picStr = data.pic || "";
            const parts = picStr.split(" | ");
            setSelectedUtama(parts[0] ? parts[0].split(", ").filter((p: string) => p !== "") : []);
            setSelectedSupporting(parts[1] ? parts[1].split(", ").filter((p: string) => p !== "") : []);
            setSelectedSupervisor(parts[2] ? parts[2].split(", ").filter((p: string) => p !== "") : []);
          }
        } catch (error) {
          console.error("Error fetching program detail:", error);
        }
      };
      fetchProgram();
    }
  }, [programId]);

  // Sidebar + header
  const [activeMenu,    setActiveMenu]    = useState(
    fromRoute === "/pic-dashboard"
      ? "Dashboard"
      : fromRoute === "/pic-non-rkm"
        ? "Non RKM"
        : "RKM / Program"
  );
  const [profileAnchor, setProfileAnchor] = useState<HTMLElement | null>(null);

  const toggleGroup = (
    name: string,
    _selected: string[],
    setSelected: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setSelected((prev) =>
      prev.includes(name) ? prev.filter((p) => p !== name) : [...prev, name]
    );
  };

  const totalSelected = selectedUtama.length + selectedSupporting.length + selectedSupervisor.length;
  const clearAllPIC   = () => { setSelectedUtama([]); setSelectedSupporting([]); setSelectedSupervisor([]); };

  const handleSimpan = async () => {
    if (!programId) {
      alert("ID Program tidak ditemukan.");
      return;
    }

    const strategyCode = initiativeStrategy.split("-").slice(0, 2).join("-");
    
    // Combine all selected PICs into one string with category delimiters
    // Format: "Utama | Supporting | Supervisor"
    const allPics = [
      selectedUtama.join(", "),
      selectedSupporting.join(", "),
      selectedSupervisor.join(", ")
    ].join(" | ");

    const payload = {
      name: namaProgram,
      type: tipeProgram,
      pic: allPics,
      id_status: 1, // Default — status otomatis dikalkulasi sistem dari subtask
      code_initiative_strategy: strategyCode,
      plan_start: planStart,
      plan_finish: planFinish,
    };

    try {
      const response = await fetch(apiUrl(`/api/programs/${programId}`), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert("Program berhasil diperbarui!");
        navigate(returnTo || fromRoute, { state: { from: fromRoute, programId } });
      } else {
        const errorData = await response.json();
        alert("Gagal memperbarui program: " + JSON.stringify(errorData));
      }
    } catch (error) {
      console.error("Error updating program:", error);
      alert("Terjadi kesalahan koneksi ke server.");
    }
  };

  const handleBatal = () => navigate(returnTo || fromRoute, { state: { from: fromRoute, programId } });

  /* ── PIC pill renderer ── */
  const renderPill = (
    name: string,
    isSelected: boolean,
    onToggle: () => void,
    isDisabled: boolean = false
  ) => {
    const initials = name.split(" ").map((w) => w[0]).slice(0, 2).join("");
    const c = AVATAR_COLORS[PIC_COLOR_ORDER.indexOf(name) % AVATAR_COLORS.length];
    
    return (
      <Box
        key={name}
        onClick={isDisabled ? undefined : onToggle}
        sx={{
          display: "flex", alignItems: "center", gap: 1, px: 1.5, py: 0.8,
          borderRadius: "10px", 
          cursor: isDisabled ? "not-allowed" : "pointer", 
          userSelect: "none",
          transition: "all 0.18s ease",
          border: isSelected ? "1.5px solid #267ABD" : "1.5px solid #E2E8F0",
          bgcolor: isSelected ? "#EFF6FF" : "#FFFFFF",
          boxShadow: isSelected ? "0 2px 8px rgba(38,122,189,0.15)" : "0 1px 3px rgba(0,0,0,0.05)",
          opacity: isDisabled ? 0.5 : 1,
          filter: isDisabled ? "grayscale(1)" : "none",
          "&:hover": !isDisabled ? { border: "1.5px solid #267ABD", boxShadow: "0 2px 10px rgba(38,122,189,0.12)", transform: "translateY(-1px)" } : {},
        }}
      >
        <Avatar sx={{ width: 28, height: 28, fontSize: "0.65rem", fontWeight: 700, bgcolor: isSelected ? "#267ABD" : c.avatarBg, color: isSelected ? "#FFFFFF" : c.text, transition: "all 0.18s ease" }}>
          {initials}
        </Avatar>
        <Typography fontSize="0.82rem" fontWeight={isSelected ? 700 : 500} sx={{ color: isSelected ? "#0C4B7D" : "#475569", transition: "color 0.18s ease" }}>
          {name}
        </Typography>
        {isSelected && (
          <Box sx={{ width: 16, height: 16, borderRadius: "50%", bgcolor: "#267ABD", display: "flex", alignItems: "center", justifyContent: "center", ml: 0.3, flexShrink: 0 }}>
            <Typography sx={{ fontSize: "0.6rem", color: "white", lineHeight: 1 }}>✓</Typography>
          </Box>
        )}
      </Box>
    );
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#F7F9FB" }}>

      {/* ================= SIDEBAR ================= */}
      <Box
        sx={{
          width: 240, position: "fixed", height: "100vh",
          p: 3, pb: 0, pr: 0, color: "white",
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
                  "Dashboard": "/pic-dashboard",
                  "RKM / Program": "/pic-rkm",
                  "Non RKM": "/pic-non-rkm",
                  "Weekly Monitoring": "/pic-weekly-monitoring",
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

        <Box sx={{ marginTop: "auto", marginLeft: "-24px", width: "111%", display: "flex", flexDirection: "column", justifyContent: "flex-end", overflow: "hidden" }}>
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

          {/* Kembali */}
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={handleBatal}
            sx={{ mb: 2, color: "#64748B", textTransform: "none", fontWeight: 600, fontSize: "0.875rem", "&:hover": { bgcolor: "rgba(0,0,0,0.04)" } }}
          >
            Kembali
          </Button>

          {/* Form Card */}
          <Card sx={{ borderRadius: 2, boxShadow: "0 2px 12px rgba(21,101,192,0.06)", border: "1px solid #E8ECF4", mb: 3 }}>
            <CardContent sx={{ p: 4, pb: "32px !important" }}>

              {/* Title */}
              <Typography fontWeight={700} fontSize="1.25rem" sx={{ color: "#1E293B", mb: 0.5 }}>Edit Program</Typography>
              <Typography fontSize="0.88rem" sx={{ color: "#727989", mb: 3 }}>
                Ubah detail program yang sudah ada dalam sistem monitoring.
              </Typography>

              {/* Section Label */}
              <Typography fontSize="0.8rem" fontWeight={700} sx={{ color: "#267ABD", letterSpacing: "0.8px", mb: 2 }}>
                INFORMASI UMUM
              </Typography>

              {/* ── Nama Program ── */}
              <Box sx={{ mb: 2.5 }}>
                <Typography fontSize="0.85rem" fontWeight={600} sx={{ color: "#1E293B", mb: 0.6 }}>
                  Nama Program<span style={{ color: "#E9004A" }}>*</span>
                </Typography>
                <TextField fullWidth size="small" placeholder="Masukkan nama program..." value={namaProgram} onChange={(e) => setNamaProgram(e.target.value)} sx={fieldSx} />
              </Box>

              {/* ── Grid fields ── */}
              <Box sx={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 1.5fr", gap: 2, mb: 2.5 }}>

                {/* Tipe Program */}
                <Box>
                  <Typography fontSize="0.85rem" fontWeight={600} sx={{ color: "#1E293B", mb: 0.6 }}>Tipe Program<span style={{ color: "#E9004A" }}>*</span></Typography>
                  <TextField select fullWidth size="small" value={tipeProgram} onChange={(e) => setTipeProgram(e.target.value)} sx={fieldSx}>
                    {TIPE_PROGRAM_OPTIONS.map((opt) => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                  </TextField>
                </Box>

                {/* Initiative Strategy */}
                <Box sx={{ gridColumn: "span 2" }}>
                  <Typography fontSize="0.85rem" fontWeight={600} sx={{ color: "#1E293B", mb: 0.6 }}>Initiative Strategy</Typography>
                  <TextField select fullWidth size="small" value={initiativeStrategy} onChange={(e) => setInitiativeStrategy(e.target.value)} sx={fieldSx}>
                    {INITIATIVE_STRATEGY_OPTIONS.map((opt) => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                  </TextField>
                </Box>

                {/* Status dihilangkan — otomatis dikalkulasi dari subtask */}

                {/* Plan Start */}
                <Box>
                  <Typography fontSize="0.85rem" fontWeight={600} sx={{ color: "#1E293B", mb: 0.6 }}>Plan Start<span style={{ color: "#E9004A" }}>*</span></Typography>
                  <TextField fullWidth size="small" type="date" value={planStart} onChange={(e) => setPlanStart(e.target.value)} sx={fieldSx} />
                </Box>

                {/* Plan Finish */}
                <Box>
                  <Typography fontSize="0.85rem" fontWeight={600} sx={{ color: "#1E293B", mb: 0.6 }}>Plan Finish<span style={{ color: "#E9004A" }}>*</span></Typography>
                  <TextField fullWidth size="small" type="date" value={planFinish} onChange={(e) => setPlanFinish(e.target.value)} sx={fieldSx} />
                </Box>

              </Box>

              {/* ── PIC (3-group: PIC Utama / Supporting / Supervisor VP) ── */}
              <Box sx={{ mb: 3.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.2 }}>
                  <Typography fontSize="0.85rem" fontWeight={600} sx={{ color: "#1E293B" }}>PIC</Typography>
                  {totalSelected > 0 && (
                    <Typography fontSize="0.78rem" fontWeight={600}
                      sx={{ color: "#267ABD", cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
                      onClick={clearAllPIC}
                    >
                      Hapus semua ({totalSelected})
                    </Typography>
                  )}
                </Box>

                <Box sx={{ border: "1px solid #E2E8F0", borderRadius: "10px", p: 2, bgcolor: "#FAFBFC" }}>

                  {/* Group 1: PIC Utama */}
                  <Typography fontSize="0.72rem" fontWeight={700} sx={{ color: "#64748B", letterSpacing: "0.5px", mb: 1, textTransform: "uppercase" }}>PIC Utama</Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, mb: 1.5 }}>
                    {PIC_UTAMA_LIST.map((name) => renderPill(name, selectedUtama.includes(name), () => toggleGroup(name, selectedUtama, setSelectedUtama), selectedSupporting.includes(name)))}
                  </Box>

                  <Box sx={{ borderTop: "1px solid #F1F5F9", mb: 1.5 }} />

                  {/* Group 2: Supporting */}
                  <Typography fontSize="0.72rem" fontWeight={700} sx={{ color: "#64748B", letterSpacing: "0.5px", mb: 1, textTransform: "uppercase" }}>Supporting</Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, mb: 1.5 }}>
                    {PIC_SUPPORTING_LIST.map((name) => renderPill(name, selectedSupporting.includes(name), () => toggleGroup(name, selectedSupporting, setSelectedSupporting), selectedUtama.includes(name)))}
                  </Box>

                  <Box sx={{ borderTop: "1px solid #F1F5F9", mb: 1.5 }} />

                  {/* Group 3: Supervisor (VP) */}
                  <Typography fontSize="0.72rem" fontWeight={700} sx={{ color: "#64748B", letterSpacing: "0.5px", mb: 1, textTransform: "uppercase" }}>Supervisor (VP)</Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
                    {PIC_SUPERVISOR_LIST.map((name) => renderPill(name, selectedSupervisor.includes(name), () => toggleGroup(name, selectedSupervisor, setSelectedSupervisor)))}
                  </Box>
                </Box>

                {/* Selected summary */}
                {totalSelected > 0 && (
                  <Box sx={{ mt: 1.2, display: "flex", alignItems: "center", gap: 0.8 }}>
                    <Typography fontSize="0.78rem" sx={{ color: "#64748B" }}>Dipilih:</Typography>
                    <Typography fontSize="0.78rem" fontWeight={600} sx={{ color: "#0C4B7D" }}>
                      {/* Tampilkan summary yang bersih tanpa delimiter pipes */}
                      {[...selectedUtama, ...selectedSupporting, ...selectedSupervisor].filter(p => p !== "").join(", ")}
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* ── Action Buttons ── */}
              <Box sx={{ display: "flex", gap: 1.5 }}>
                <Button
                  variant="contained"
                  onClick={handleSimpan}
                  sx={{
                    backgroundColor: "#1F77AE", color: "white", fontWeight: 700,
                    fontSize: "0.88rem", textTransform: "none", borderRadius: "6px",
                    px: 3, py: 0.9, boxShadow: "none",
                    "&:hover": { backgroundColor: "#1a669a", boxShadow: "none" },
                    "&.MuiButton-root": { backgroundColor: "#1F77AE" },
                    "&.MuiButton-root:hover": { backgroundColor: "#1a669a" },
                  }}
                >
                  Simpan Perubahan
                </Button>
                <Button
                  variant="contained"
                  onClick={handleBatal}
                  sx={{
                    backgroundColor: "#E9004A", color: "white", fontWeight: 700,
                    fontSize: "0.88rem", textTransform: "none", borderRadius: "6px",
                    px: 3, py: 0.9, boxShadow: "none",
                    "&:hover": { backgroundColor: "#c7003e", boxShadow: "none" },
                    "&.MuiButton-root": { backgroundColor: "#E9004A" },
                    "&.MuiButton-root:hover": { backgroundColor: "#c7003e" },
                  }}
                >
                  Batal
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}
