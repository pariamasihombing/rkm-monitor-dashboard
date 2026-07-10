import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  Divider,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  Assessment,
  ContentPaste,
  TrendingUp,
  ManageAccounts as ManageAccountsIcon,
  Visibility,
  VisibilityOff,
  PersonOutline as PersonIcon,
  LockOutlined as LockIcon,
  EmailOutlined as EmailIcon,
  SaveOutlined as SaveIcon,
} from "@mui/icons-material";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ProfileMenu from "../components/ProfileMenu";
import logoDanantara from "../assets/logo-danantara.png";
import logoPelindo from "../assets/logo-pelindo.png";
import batikOrnament from "../assets/batik 1.png";
import { canManage } from "../utils/rbac";

/* ================= MENU ITEMS ================= */

const menuItems = [
  { icon: DashboardIcon,       label: "Dashboard",          route: "/dashboard" },
  { icon: Assessment,          label: "RKM / Program",      route: "/rkm" },
  { icon: ContentPaste,        label: "Non RKM",            route: "/non-rkm" },
  { icon: TrendingUp,          label: "Weekly Monitoring",  route: "/weekly-monitoring" },
];

/* ================= COMPONENT ================= */

export default function PengaturanAkun() {
  const navigate   = useNavigate();
  const storedName = localStorage.getItem("userName") || "";

  /* ---- form state ---- */
  const [form, setForm] = useState({
    namaLengkap:        storedName,
    email:              "",
    passwordLama:       "",
    passwordBaru:       "",
    konfirmasiPassword: "",
  });

  /* ---- password visibility state ---- */
  const [show, setShow] = useState({
    passwordLama:       false,
    passwordBaru:       false,
    konfirmasiPassword: false,
  });

  const [activeMenu, setActiveMenu] = useState("Pengaturan Akun");
  const [profileAnchor, setProfileAnchor] = useState<HTMLElement | null>(null);

  /* ---- snackbar state ---- */
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  });
  
  /* ---- profile pic state ---- */
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ---- load initial data ---- */
  useEffect(() => {
    // Load profile pic
    const savedPic = localStorage.getItem(`userProfilePic_${storedName}`);
    if (savedPic) {
      setProfilePic(savedPic);
    }

    // Load email from manageUsersData if exists
    let userEmail = "";
    const usersDataStr = localStorage.getItem("manageUsersData");
    if (usersDataStr) {
      try {
        const users = JSON.parse(usersDataStr);
        const match = users.find((u: any) => u.name === storedName);
        if (match && match.email) {
          userEmail = match.email;
        }
      } catch (e) {
        console.error("Error parsing manageUsersData", e);
      }
    }

    setForm((prev) => ({
      ...prev,
      email: userEmail,
    }));
  }, [storedName]);

  /* ---- handlers ---- */
  const handleChange = (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const toggleShow = (field: keyof typeof show) =>
    setShow((prev) => ({ ...prev, [field]: !prev[field] }));

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Hanya update state lokal untuk preview
        setProfilePic(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    // 1. Validasi Password
    if (form.passwordBaru || form.konfirmasiPassword) {
      if (form.passwordBaru !== form.konfirmasiPassword) {
        setSnackbar({ open: true, message: "Konfirmasi password tidak cocok!", severity: "error" });
        return;
      }
    }

    // 2. Simpan Foto Profil
    if (profilePic) {
      localStorage.setItem(`userProfilePic_${storedName}`, profilePic);
      window.dispatchEvent(new Event("profileUpdated"));
    }

    // 3. Update Password di LocalStorage (Mock Database)
    let emailUser = form.email;
    const usersDataStr = localStorage.getItem("manageUsersData");
    if (usersDataStr) {
      try {
        const users = JSON.parse(usersDataStr);
        const userIndex = users.findIndex((u: any) => u.name === storedName);
        if (userIndex !== -1) {
          if (form.passwordBaru) {
            users[userIndex].password = form.passwordBaru;
          }
          emailUser = users[userIndex].email || form.email;
          localStorage.setItem("manageUsersData", JSON.stringify(users));
        }
      } catch (e) {
        console.error("Error updating manageUsersData", e);
      }
    }

    // 4. Integrasi Email via API
    try {
      const response = await fetch("http://localhost:8000/api/notify-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailUser || "user@example.com" }),
      });

      const data = await response.json();
      if (response.ok) {
        setSnackbar({ open: true, message: "Profil berhasil diperbarui dan email notifikasi terkirim", severity: "success" });
        // Kosongkan form password
        setForm(prev => ({ ...prev, passwordLama: "", passwordBaru: "", konfirmasiPassword: "" }));
        
        // Redirect ke dashboard setelah 1.5 detik
        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      } else {
        throw new Error(data.message || "Gagal mengirim notifikasi email");
      }
    } catch (error: any) {
      setSnackbar({ open: true, message: error.message || "Terjadi kesalahan pada server", severity: "error" });
    }
  };

  /* ---- password eye adornment ---- */
  const EyeAdornment = ({ field }: { field: keyof typeof show }) => (
    <InputAdornment position="end">
      <IconButton
        onClick={() => toggleShow(field)}
        edge="end"
        size="small"
        sx={{ color: "#94A3B8" }}
      >
        {show[field] ? (
          <VisibilityOff sx={{ fontSize: 20 }} />
        ) : (
          <Visibility sx={{ fontSize: 20 }} />
        )}
      </IconButton>
    </InputAdornment>
  );

  /* ---- shared TextField sx ---- */
  const inputSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "8px",
      bgcolor: "#FAFBFC",
      "& fieldset": { borderColor: "#E2E8F0" },
      "&:hover fieldset": { borderColor: "#93C5FD" },
      "&.Mui-focused fieldset": { borderColor: "#2563EB", borderWidth: 2 },
    },
    "& .MuiInputLabel-root": { fontSize: "0.9rem", color: "#64748B" },
    "& .MuiInputLabel-root.Mui-focused": { color: "#2563EB" },
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
          {menuItems.map((item) => (
            <Button
              key={item.label}
              startIcon={<item.icon sx={{ fontSize: "1.4rem" }} />}
              onClick={() => {
                setActiveMenu(item.label);
                navigate(item.route);
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
                ...(activeMenu !== item.label && {
                  "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
                }),
              }}
            >
              {item.label}
            </Button>
          ))}

          {canManage() && (
            <Button
              startIcon={<ManageAccountsIcon sx={{ fontSize: "1.4rem" }} />}
              onClick={() => {
                setActiveMenu("Kelola Akun");
                navigate("/manage-users");
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
                fontWeight: activeMenu === "Kelola Akun" ? 900 : 600,
                width: "calc(100% - 10px)",
                ml: -1.5,
                ...(activeMenu === "Kelola Akun" && {
                  bgcolor: "rgba(255,255,255,0.25)",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
                  border: "2px solid rgba(255,255,255,0.4)",
                  backdropFilter: "blur(10px)",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
                }),
                ...(activeMenu !== "Kelola Akun" && {
                  "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
                }),
              }}
            >
              Kelola Akun
            </Button>
          )}
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
            userName={storedName}
          />
        </Box>

        {/* ================= CONTENT ================= */}
        <Box sx={{ p: 4, maxWidth: 640, mx: "auto", pb: 6 }}>

          {/* Page title */}
          <Typography
            variant="h5"
            fontWeight={800}
            mb={0.5}
            sx={{ color: "#1E293B", letterSpacing: "-0.3px" }}
          >
            Pengaturan Akun
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748B", mb: 4 }}>
            Perbarui informasi profil dan password akun Anda.
          </Typography>

          {/* ===== FORM CARD ===== */}
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: "0 4px 24px rgba(21,101,192,0.07)",
              border: "1px solid #EEF2F7",
              overflow: "visible",
            }}
          >
            <CardContent sx={{ p: 4 }}>
              
              {/* ── Foto Profil ── */}
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 4 }}>
                <input 
                  type="file" 
                  accept="image/*" 
                  hidden 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                />
                <Box
                  sx={{
                    position: "relative",
                    width: 100,
                    height: 100,
                    borderRadius: "50%",
                    overflow: "hidden",
                    cursor: "pointer",
                    boxShadow: "0 4px 14px rgba(0,0,0,0.1)",
                    border: "3px solid #fff",
                    "&:hover .upload-overlay": { opacity: 1 }
                  }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Box
                    component="img"
                    src={profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(storedName)}&background=FFC107&color=fff&size=100`}
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                  <Box
                    className="upload-overlay"
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      bgcolor: "rgba(0,0,0,0.4)",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      opacity: 0,
                      transition: "opacity 0.2s",
                    }}
                  >
                    <Typography variant="caption" sx={{ color: "white", fontWeight: 700 }}>
                      Ubah
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body2" sx={{ mt: 1.5, color: "#64748B", fontWeight: 500 }}>
                  Klik avatar untuk mengubah foto
                </Typography>
              </Box>

              <Divider sx={{ mb: 4, borderColor: "#F1F5F9" }} />

              {/* ── Informasi Profil ── */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
                <PersonIcon sx={{ fontSize: 20, color: "#2563EB" }} />
                <Typography fontWeight={700} sx={{ fontSize: "0.95rem", color: "#1E293B" }}>
                  Informasi Profil
                </Typography>
              </Box>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                <TextField
                  label="Nama Lengkap"
                  value={form.namaLengkap}
                  onChange={handleChange("namaLengkap")}
                  fullWidth
                  disabled
                  sx={{
                    ...inputSx,
                    "& .MuiOutlinedInput-root.Mui-disabled": {
                      bgcolor: "#F1F5F9",
                      "& fieldset": { borderColor: "#E2E8F0" },
                    },
                    "& .MuiInputBase-input.Mui-disabled": {
                      WebkitTextFillColor: "#94A3B8",
                    },
                  }}
                />
                <TextField
                  label="Email"
                  type="email"
                  value={form.email}
                  onChange={handleChange("email")}
                  fullWidth
                  disabled
                  sx={{
                    ...inputSx,
                    "& .MuiOutlinedInput-root.Mui-disabled": {
                      bgcolor: "#F1F5F9",
                      "& fieldset": { borderColor: "#E2E8F0" },
                    },
                    "& .MuiInputBase-input.Mui-disabled": {
                      WebkitTextFillColor: "#94A3B8",
                    },
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <EmailIcon sx={{ fontSize: 20, color: "#94A3B8" }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              <Divider sx={{ my: 4, borderColor: "#F1F5F9" }} />

              {/* Ubah Password */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
                <LockIcon sx={{ fontSize: 20, color: "#2563EB" }} />
                <Typography fontWeight={700} sx={{ fontSize: "0.95rem", color: "#1E293B" }}>
                  Ubah Password
                </Typography>
              </Box>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                <TextField
                  label="Password Lama"
                  type={show.passwordLama ? "text" : "password"}
                  value={form.passwordLama}
                  onChange={handleChange("passwordLama")}
                  fullWidth
                  sx={inputSx}
                  InputProps={{ endAdornment: <EyeAdornment field="passwordLama" /> }}
                />
                <TextField
                  label="Password Baru"
                  type={show.passwordBaru ? "text" : "password"}
                  value={form.passwordBaru}
                  onChange={handleChange("passwordBaru")}
                  fullWidth
                  sx={inputSx}
                  InputProps={{ endAdornment: <EyeAdornment field="passwordBaru" /> }}
                />
                <TextField
                  label="Konfirmasi Password"
                  type={show.konfirmasiPassword ? "text" : "password"}
                  value={form.konfirmasiPassword}
                  onChange={handleChange("konfirmasiPassword")}
                  fullWidth
                  sx={inputSx}
                  InputProps={{ endAdornment: <EyeAdornment field="konfirmasiPassword" /> }}
                  error={
                    form.konfirmasiPassword.length > 0 &&
                    form.passwordBaru !== form.konfirmasiPassword
                  }
                  helperText={
                    form.konfirmasiPassword.length > 0 &&
                    form.passwordBaru !== form.konfirmasiPassword
                      ? "Password tidak cocok"
                      : ""
                  }
                />
              </Box>

              <Divider sx={{ my: 4, borderColor: "#F1F5F9" }} />

              {/* Submit Button */}
              <Button
                variant="contained"
                fullWidth
                startIcon={<SaveIcon />}
                onClick={handleSave}
                sx={{
                  py: 1.5,
                  borderRadius: "8px",
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  textTransform: "none",
                  background: "linear-gradient(135deg, #1565C0 0%, #2196F3 100%)",
                  boxShadow: "0 4px 14px rgba(33,150,243,0.35)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #1044a3 0%, #1a7fd4 100%)",
                    boxShadow: "0 6px 18px rgba(33,150,243,0.45)",
                    transform: "translateY(-1px)",
                  },
                  transition: "all 0.25s ease",
                }}
              >
                Simpan Perubahan
              </Button>

            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Snackbar for Notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: "100%", boxShadow: "0 4px 12px rgba(0,0,0,0.15)", borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
