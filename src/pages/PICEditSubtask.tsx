import {
  Box,
  Button,
  Typography,
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
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ProfileMenu from "../components/ProfileMenu";
import logoDanantara from "../assets/logo-danantara.png";
import logoPelindo from "../assets/logo-pelindo.png";
import batikOrnament from "../assets/batik 1.png";

/* ================= OPTIONS ================= */

const STATUS_OPTIONS = ["Not Started", "On Progress", "Done", "Hold"];

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
  "& .MuiOutlinedInput-input::placeholder": { color: "#A0AEC0", opacity: 1 },
  "& .MuiInputLabel-root": { color: "#727989", fontSize: "0.9rem" },
};

/* ================= COMPONENT ================= */

export default function PICEditSubtask() {
  const navigate = useNavigate();

  const location = useLocation();

  // State passed from PICProgramDetail when clicking Edit on a task
  const fromRoute    = location.state?.from      ?? "/pic-rkm";
  const returnTo     = location.state?.returnTo;
  const programId    = location.state?.programId    ?? "";
  const stageId      = location.state?.stageId      ?? "";
  const taskId       = location.state?.taskId       ?? location.state?.id_subtask ?? "";
  const programTitle = location.state?.programTitle ?? "";
  const stageTitle   = location.state?.stageTitle   ?? "";

  // Pre-filled from location.state
  const [namaSubtask, setNamaSubtask] = useState<string>(
    location.state?.namaSubtask ?? "Penyusunan SOP Serah Terima Operasi"
  );
  const [deliverable, setDeliverable] = useState<string>(
    location.state?.deliverable ?? "SOP Serah Terima"
  );
  const [status, setStatus] = useState<string>(
    location.state?.status ?? "On Progress"
  );
  const [planStart, setPlanStart] = useState<string>(
    location.state?.planStart ?? "2026-01-01"
  );
  const [planEnd, setPlanEnd] = useState<string>(
    location.state?.planEnd ?? "2026-01-15"
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string | null>(
    location.state?.fileName ?? null
  );

  // Sidebar + header
  const [activeMenu,    setActiveMenu]    = useState(
  fromRoute === "/pic-dashboard"
      ? "Dashboard"
      : fromRoute === "/pic-non-rkm"
        ? "Non RKM"
        : fromRoute === "/pic-weekly-monitoring"
          ? "Weekly Monitoring"
          : "RKM / Program"
  );
  const [profileAnchor, setProfileAnchor] = useState<HTMLElement | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFileName(file.name);
    }
  };

  const handleSimpan = async () => {
    if (!taskId) {
      console.error("No taskId found");
      return;
    }

    const STATUS_MAP: Record<string, number> = {
      "Not Started": 1,
      "On Progress": 2,
      "Done": 3,
      "Hold": 4,
    };

    const formData = new FormData();
    formData.append("_method", "PUT");
    formData.append("name", namaSubtask);
    formData.append("deliverable", deliverable);
    formData.append("id_status", (STATUS_MAP[status] || 1).toString());
    formData.append("plan_start", planStart);
    formData.append("plan_finish", planEnd);
    if (selectedFile) {
      formData.append("file", selectedFile);
    }

    try {
      const response = await fetch(`http://localhost:8000/api/subtasks/${taskId}`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        navigate(returnTo || fromRoute, { 
          state: { 
            from: fromRoute, 
            programId, 
            stageId, 
            taskId,
            id_subtask: taskId,
            programTitle,
            stageTitle
          } 
        });
      } else {
        try {
          const errorData = await response.json();
          console.error("Failed to update subtask:", errorData);
          
          let errorMessage = `Gagal memperbarui subtask (Status: ${response.status}).`;
          
          if (typeof errorData === "object") {
            const messages = [];
            for (const key in errorData) {
              if (Array.isArray(errorData[key])) {
                messages.push(...errorData[key]);
              } else if (typeof errorData[key] === 'string') {
                messages.push(errorData[key]);
              }
            }
            
            if (messages.length > 0) {
              errorMessage = "Gagal memperbarui: \n- " + messages.join("\n- ");
            } else if (errorData.message) {
              errorMessage = "Gagal memperbarui: " + errorData.message;
            }
          }
          
          alert(errorMessage);
        } catch (e) {
          console.error("Failed to parse error response:", e);
          alert(`Gagal memperbarui subtask. Status: ${response.status} ${response.statusText}`);
        }
      }
    } catch (error) {
      console.error("Error updating subtask:", error);
      alert("Terjadi kesalahan koneksi saat memperbarui subtask.");
    }
  };

  const handleBatal = () => navigate(returnTo || fromRoute, { 
    state: { 
      from: fromRoute, 
      programId, 
      stageId, 
      taskId,
      id_subtask: taskId,
      programTitle,
      stageTitle
    } 
  });

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

          {/* ← Kembali */}
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={handleBatal}
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

          {/* Form Card */}
          <Card
            sx={{
              borderRadius: 2,
              boxShadow: "0 2px 12px rgba(21,101,192,0.06)",
              border: "1px solid #E8ECF4",
              mb: 3,
            }}
          >
            <CardContent sx={{ p: 4, pb: "32px !important" }}>

              {/* ── Title ── */}
              <Typography fontWeight={700} fontSize="1.25rem" sx={{ color: "#1E293B", mb: 0.5 }}>
                Edit Subtask
              </Typography>
              <Typography fontSize="0.88rem" sx={{ color: "#727989", mb: 3 }}>
                Perbarui status subtask. Perubahan status akan langsung mempengaruhi progress tahapan dan program secara otomatis.
              </Typography>

              {/* ── Section Label ── */}
              <Typography
                fontSize="0.8rem"
                fontWeight={700}
                sx={{ color: "#267ABD", letterSpacing: "0.8px", mb: 2 }}
              >
                DETAIL SUBTASK
              </Typography>

              {/* ── Nama Subtask ── */}
              <Box sx={{ mb: 2.5 }}>
                <Typography fontSize="0.85rem" fontWeight={600} sx={{ color: "#1E293B", mb: 0.6 }}>
                  Nama Subtask<span style={{ color: "#E9004A" }}>*</span>
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Masukkan nama subtask..."
                  value={namaSubtask}
                  onChange={(e) => setNamaSubtask(e.target.value)}
                  sx={fieldSx}
                />
              </Box>

              {/* ── Deliverable ── */}
              <Box sx={{ mb: 2.5 }}>
                <Typography fontSize="0.85rem" fontWeight={600} sx={{ color: "#1E293B", mb: 0.6 }}>
                  Deliverable<span style={{ color: "#E9004A" }}>*</span>
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Output yang diharapkan..."
                  value={deliverable}
                  onChange={(e) => setDeliverable(e.target.value)}
                  sx={fieldSx}
                />
              </Box>

              {/* ── Status | Plan Start | Plan Start (End) ── */}
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 2, mb: 2.5 }}>

                {/* Status — col 1 */}
                <Box>
                  <Typography fontSize="0.85rem" fontWeight={600} sx={{ color: "#1E293B", mb: 0.6 }}>
                    Status<span style={{ color: "#E9004A" }}>*</span>
                  </Typography>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    sx={fieldSx}
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                    ))}
                  </TextField>
                </Box>

                {/* Plan Start — col 2 */}
                <Box>
                  <Typography fontSize="0.85rem" fontWeight={600} sx={{ color: "#1E293B", mb: 0.6 }}>
                    Plan Start<span style={{ color: "#E9004A" }}>*</span>
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    type="date"
                    value={planStart}
                    onChange={(e) => setPlanStart(e.target.value)}
                    sx={fieldSx}
                  />
                </Box>

                {/* Plan Start (End) — col 3 */}
                <Box>
                  <Typography fontSize="0.85rem" fontWeight={600} sx={{ color: "#1E293B", mb: 0.6 }}>
                    Plan Finish<span style={{ color: "#E9004A" }}>*</span>
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    type="date"
                    value={planEnd}
                    onChange={(e) => setPlanEnd(e.target.value)}
                    sx={fieldSx}
                  />
                </Box>

              </Box>

              {/* ── Upload File / Attachment ── native browser style sesuai Figma ── */}
              <Box sx={{ mb: 3.5 }}>
                <Typography fontSize="0.85rem" fontWeight={600} sx={{ color: "#1E293B", mb: 1 }}>
                  Upload File / Attachment
                </Typography>
                <Box
                  component="label"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    border: "1px solid rgba(83,83,83,0.25)",
                    borderRadius: "6px",
                    overflow: "hidden",
                    cursor: "pointer",
                    "&:hover": { borderColor: "rgba(83,83,83,0.4)" },
                  }}
                >
                  <input
                    hidden
                    accept="*/*"
                    type="file"
                    onChange={handleFileUpload}
                  />
                  {/* Choose File button area */}
                  <Box
                    sx={{
                      px: 1.5,
                      py: 0.9,
                      bgcolor: "#F1F5F9",
                      borderRight: "1px solid rgba(83,83,83,0.2)",
                      flexShrink: 0,
                    }}
                  >
                    <Typography fontSize="0.85rem" sx={{ color: "#374151", fontWeight: 500, whiteSpace: "nowrap" }}>
                      Choose File
                    </Typography>
                  </Box>
                  {/* File name area */}
                  <Box sx={{ px: 2, py: 0.9, flex: 1 }}>
                    <Typography fontSize="0.85rem" sx={{ color: fileName ? "#1E293B" : "#A0AEC0" }}>
                      {fileName ?? "no file selected"}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* ── Action Buttons ── */}
              <Box sx={{ display: "flex", gap: 1.5 }}>
                <Button
                  variant="contained"
                  onClick={handleSimpan}
                  sx={{
                    backgroundColor: "#1F77AE",
                    color: "white",
                    fontWeight: 700,
                    fontSize: "0.88rem",
                    textTransform: "none",
                    borderRadius: "8px",
                    px: 2.5,
                    py: 0.9,
                    minWidth: "140px",
                    boxShadow: "none",
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
                    backgroundColor: "#E9004A",
                    color: "white",
                    fontWeight: 700,
                    fontSize: "0.88rem",
                    textTransform: "none",
                    borderRadius: "8px",
                    px: 2.5,
                    py: 0.9,
                    minWidth: "80px",
                    boxShadow: "none",
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
