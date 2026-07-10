import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  MenuItem,
  Snackbar,
  Table,
  TableBody,
  Divider,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import {
  Add as AddIcon,
  Assessment,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  ContentPaste,
  Dashboard as DashboardIcon,
  DeleteOutline as DeleteIcon,
  ManageAccounts as ManageAccountsIcon,
  Search as SearchIcon,
  TrendingUp,
} from "@mui/icons-material";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProfileMenu from "../components/ProfileMenu";
import logoDanantara from "../assets/logo-danantara.png";
import logoPelindo from "../assets/logo-pelindo.png";
import batikOrnament from "../assets/batik 1.png";
import { canManage } from "../utils/rbac";

type UserRole = "Admin" | "Guest";
type UserStatus = "Aktif" | "Nonaktif";

interface ManagedUser {
  id: number;
  name: string;
  nip: string;
  email: string;
  password?: string;
  role: UserRole;
  status: UserStatus;
  lastLogin: string;
}

interface UserForm {
  name: string;
  nip: string;
  email: string;
  password: string;
  role: UserRole;
}

const initialUsers: ManagedUser[] = [
  {
    id: 1,
    name: "Pariama Valentino",
    nip: "198904122015031002",
    email: "pariama.valentino@pelindo.co.id",
    password: "123456",
    role: "Admin",
    status: "Aktif",
    lastLogin: "07 Jul 2026, 19:42",
  },
  {
    id: 2,
    name: "Reza Aditya",
    nip: "199205182018011001",
    email: "reza.aditya@pelindo.co.id",
    password: "123456",
    role: "Admin",
    status: "Aktif",
    lastLogin: "07 Jul 2026, 16:10",
  },
  {
    id: 3,
    name: "Suci Wulandari",
    nip: "199411032019022004",
    email: "suci.wulandari@pelindo.co.id",
    password: "123456",
    role: "Guest",
    status: "Nonaktif",
    lastLogin: "28 Jun 2026, 08:31",
  },
  {
    id: 4,
    name: "Hendra Saputra",
    nip: "198711262014041003",
    email: "hendra.saputra@pelindo.co.id",
    password: "123456",
    role: "Admin",
    status: "Aktif",
    lastLogin: "06 Jul 2026, 13:22",
  },
];

const emptyForm: UserForm = {
  name: "",
  nip: "",
  email: "",
  password: "",
  role: "Admin",
};

const roleStyle = (role: UserRole) => {
  if (role === "Admin") return { bgcolor: "#EFF6FF", color: "#2563EB", border: "1px solid #BFDBFE" };
  return                       { bgcolor: "#F8FAFC", color: "#64748B", border: "1px solid #CBD5E1" }; // Guest
};


const statusStyle = (status: UserStatus) => ({
  bgcolor: status === "Aktif" ? "#ECFDF5" : "#F8FAFC",
  color: status === "Aktif" ? "#059669" : "#64748B",
  border: status === "Aktif" ? "1px solid #A7F3D0" : "1px solid #CBD5E1",
});

export default function ManageUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<ManagedUser[]>(() => {
    try {
      const storedUsers = localStorage.getItem("manageUsersData");
      if (!storedUsers) return initialUsers;

      const parsedUsers = JSON.parse(storedUsers);
      return Array.isArray(parsedUsers) ? parsedUsers : initialUsers;
    } catch {
      return initialUsers;
    }
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [profileAnchor, setProfileAnchor] = useState<HTMLElement | null>(null);
  const [activeMenu, setActiveMenu] = useState("Kelola Akun");
  const [form, setForm] = useState<UserForm>(emptyForm);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });


  useEffect(() => {
    if (!canManage()) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    localStorage.setItem("manageUsersData", JSON.stringify(users));
  }, [users]);

  const menuItems = [
    { icon: DashboardIcon, label: "Dashboard", route: "/dashboard" },
    { icon: Assessment, label: "RKM / Program", route: "/rkm" },
    { icon: ContentPaste, label: "Non RKM", route: "/non-rkm" },
    { icon: TrendingUp, label: "Weekly Monitoring", route: "/weekly-monitoring" },
  ];

  if (canManage()) {
    menuItems.push({ icon: ManageAccountsIcon, label: "Kelola Akun", route: "/manage-users" });
  }

  const filteredUsers = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase();
    if (!keyword) return users;

    return users.filter((user) =>
      `${user.name} ${user.nip}`.toLowerCase().includes(keyword)
    );
  }, [searchQuery, users]);

  const handleOpenDialog = () => {
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setForm(emptyForm);
  };

  const handleCreateUser = async () => {
    const targetEmail = form.email.trim();
    const newUser: ManagedUser = {
      id: Date.now(),
      name: form.name.trim(),
      nip: form.nip.trim(),
      email: targetEmail,
      password: form.password,
      role: form.role,
      status: "Aktif",
      lastLogin: "-",
    };

    try {
      const response = await fetch("http://localhost:8000/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama_lengkap: newUser.name,
          nip: newUser.nip,
          email: targetEmail,
          password: form.password,
          role: newUser.role,
        }),
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        // Ekstrak pesan validasi dari Lumen jika ada (biasanya di payload.errors)
        if (payload?.errors && typeof payload.errors === "object") {
          const firstErrorKey = Object.keys(payload.errors)[0];
          if (firstErrorKey && Array.isArray(payload.errors[firstErrorKey])) {
            throw new Error(payload.errors[firstErrorKey][0]);
          }
        }
        // Fallback jika tidak ada errors object, ambil string message atau error default
        throw new Error(payload?.message || payload?.error || "Gagal membuat user atau email notifikasi gagal dikirim.");
      }

      setUsers((prev) => [newUser, ...prev]);
      handleCloseDialog();
      setSnackbar({
        open: true,
        severity: "success",
        message: `Berhasil! Email berisi Username (NIP), Password, dan Role telah dikirimkan ke ${targetEmail}.`,
      });
    } catch (error: unknown) {
      // Tangkap pesan error asli dari backend jika tersedia
      let errorMessage = "Terjadi kesalahan pada server. Silakan coba lagi.";
      if (error instanceof Error && error.message) {
        errorMessage = error.message;
      }
      setSnackbar({
        open: true,
        severity: "error",
        message: errorMessage,
      });
    }
  };

  const handleToggleStatus = (id: number) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === id
          ? { ...user, status: user.status === "Aktif" ? "Nonaktif" : "Aktif" }
          : user
      )
    );
  };

  const handleDeleteUser = (id: number) => {
    const confirmed = window.confirm("Apakah Anda yakin ingin menghapus user ini?");
    if (!confirmed) return;

    setUsers((prev) => prev.filter((user) => user.id !== id));
  };

  const isFormValid =
    form.name.trim() && form.nip.trim() && form.email.trim() && form.password.trim();

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#F7F9FB" }}>
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
        </Box>

        <Box sx={{ marginTop: "auto", marginLeft: "-24px", width: "111%", height: "auto", display: "flex", flexDirection: "column", justifyContent: "flex-end", overflow: "hidden" }}>
          <img src={batikOrnament} width="100%" style={{ display: "block", opacity: 1 }} />
        </Box>
      </Box>

      <Box sx={{ flex: 1, ml: "240px", height: "100vh", overflowY: "auto" }}>
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

        <Box sx={{ p: 4, maxWidth: 1280, mx: "auto", pb: 8 }}>
          <Box sx={{ mb: 3 }}>
            <Typography fontWeight={800} sx={{ fontSize: "1.7rem", color: "#0F172A", mb: 0.5 }}>
              Kelola Akun
            </Typography>
            <Typography sx={{ color: "#64748B", fontSize: "0.95rem" }}>
              Manajemen akses pengguna sistem RKM Monitor
            </Typography>
          </Box>

          <Card sx={{ mb: 3, borderRadius: 2, boxShadow: "0 2px 12px rgba(21,101,192,0.05)", border: "1px solid #E8ECF4" }}>
            <CardContent sx={{ p: 3, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
              <TextField
                size="small"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Cari nama atau NIP..."
                sx={{
                  maxWidth: 420,
                  width: "100%",
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "#FFFFFF",
                    borderRadius: "8px",
                    "& fieldset": { borderColor: "#E2E8F0" },
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: "#94A3B8" }} />
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleOpenDialog}
                sx={{
                  bgcolor: "#2865FD",
                  borderRadius: "8px",
                  px: 2.2,
                  py: 1,
                  textTransform: "none",
                  fontWeight: 700,
                  boxShadow: "0 6px 18px rgba(40,101,253,0.22)",
                  whiteSpace: "nowrap",
                  "&:hover": { bgcolor: "#1E54D8", boxShadow: "0 8px 22px rgba(40,101,253,0.28)" },
                }}
              >
                Tambah User
              </Button>
            </CardContent>
          </Card>

          <Card sx={{ borderRadius: 2, boxShadow: "0 2px 12px rgba(21,101,192,0.05)", border: "1px solid #E8ECF4" }}>
            <CardContent sx={{ p: 3 }}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow
                      sx={{
                        bgcolor: "#F9FAFC",
                        "& th": { border: "none", bgcolor: "#F9FAFC", color: "#727989", fontWeight: 700 },
                        "& th:first-of-type": { borderTopLeftRadius: "8px", borderBottomLeftRadius: "8px" },
                        "& th:last-of-type": { borderTopRightRadius: "8px", borderBottomRightRadius: "8px" },
                      }}
                    >
                      <TableCell>Pengguna</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Login Terakhir</TableCell>
                      <TableCell align="right">Aksi</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow
                        key={user.id}
                        sx={{
                          "& td": { borderBottom: "1px solid #EEF2F7", py: 2 },
                          "&:hover": { bgcolor: "#FAFBFC" },
                        }}
                      >
                        <TableCell>
                          <Typography sx={{ fontWeight: 700, color: "#0F172A", fontSize: "0.92rem" }}>
                            {user.name}
                          </Typography>
                          <Typography sx={{ color: "#94A3B8", fontSize: "0.78rem", mt: 0.3 }}>
                            NIP {user.nip}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={user.role}
                            size="small"
                            sx={{
                              ...roleStyle(user.role),
                              fontWeight: 700,
                              borderRadius: "8px",
                              minWidth: 70,
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={user.status}
                            size="small"
                            sx={{
                              ...statusStyle(user.status),
                              fontWeight: 700,
                              borderRadius: "8px",
                              minWidth: 82,
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography sx={{ color: "#64748B", fontSize: "0.86rem", fontWeight: 600 }}>
                            {user.lastLogin}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                            <Button
                              size="small"
                              startIcon={user.status === "Aktif" ? <BlockIcon /> : <CheckCircleIcon />}
                              onClick={() => handleToggleStatus(user.id)}
                              sx={{
                                textTransform: "none",
                                fontWeight: 700,
                                color: user.status === "Aktif" ? "#D97706" : "#059669",
                                "&:hover": { bgcolor: user.status === "Aktif" ? "#FFFBEB" : "#ECFDF5" },
                              }}
                            >
                              {user.status === "Aktif" ? "Nonaktifkan" : "Aktifkan"}
                            </Button>
                            <Button
                              size="small"
                              startIcon={<DeleteIcon />}
                              onClick={() => handleDeleteUser(user.id)}
                              sx={{
                                textTransform: "none",
                                fontWeight: 700,
                                color: "#E9004A",
                                "&:hover": { bgcolor: "#FFF5F5" },
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

              {filteredUsers.length === 0 && (
                <Box sx={{ py: 6, textAlign: "center" }}>
                  <Typography sx={{ color: "#94A3B8", fontWeight: 600 }}>
                    Tidak ada user yang cocok dengan pencarian.
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>

      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            padding: '10px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: "#1E293B", pb: 2 }}>
          Tambah User Baru
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: "24px !important" }}>
          <Box sx={{ display: "grid", gap: 2.5 }}>
            <TextField
              label="Nama Lengkap"
              variant="outlined"
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              fullWidth
              InputProps={{ sx: { borderRadius: '8px' } }}
            />
            <TextField
              label="NIP"
              variant="outlined"
              helperText="NIP akan digunakan sebagai username untuk login."
              value={form.nip}
              onChange={(event) => setForm((prev) => ({ ...prev, nip: event.target.value }))}
              fullWidth
              InputProps={{ sx: { borderRadius: '8px' } }}
            />
            <TextField
              label="Email"
              type="email"
              variant="outlined"
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              fullWidth
              InputProps={{ sx: { borderRadius: '8px' } }}
            />
            <TextField
              label="Password"
              type="password"
              variant="outlined"
              value={form.password}
              onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
              fullWidth
              InputProps={{ sx: { borderRadius: '8px' } }}
            />
            <TextField
              select
              label="Role"
              variant="outlined"
              value={form.role}
              onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value as UserRole }))}
              fullWidth
              InputProps={{ sx: { borderRadius: '8px' } }}
            >
              <MenuItem value="Admin">Admin</MenuItem>
              <MenuItem value="Guest">Guest</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions sx={{ pb: 3, pt: 1, px: 3 }}>
          <Button
            variant="text"
            onClick={handleCloseDialog}
            sx={{ textTransform: "none", fontWeight: 600, color: "#64748B" }}
          >
            Batal
          </Button>
          <Button
            variant="contained"
            disableElevation
            disabled={!isFormValid}
            onClick={handleCreateUser}
            sx={{
              bgcolor: "#2563EB",
              textTransform: "none",
              fontWeight: 600,
              borderRadius: "8px",
              px: 3,
              "&:hover": { bgcolor: "#1D4ED8" },
            }}
          >
            Buat User
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          sx={{ fontWeight: 600 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
