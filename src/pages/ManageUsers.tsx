import { apiUrl } from "../utils/api";
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
import { canManage } from "../utils/rbac";
import Sidebar from "../components/Sidebar";

const thRowSx = {
  bgcolor: "#F9FAFC",
  "& th": {
    border: "none",
    bgcolor: "#F9FAFC",
    color: "#727989",
    fontWeight: 600,
    fontSize: "0.85rem",
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
};

const tdRowSx = {
  border: "2px solid #DBDBDB",
  outline: "1px solid #DBDBDB",
  borderRadius: "4px",
  bgcolor: "#FFFFFF",
  transition: "background-color 0.15s ease, box-shadow 0.15s ease",
  "& td": { borderRadius: "4px", border: "none" },
  "& td:first-of-type": { borderTopLeftRadius: "4px", borderBottomLeftRadius: "4px" },
  "& td:last-of-type": { borderTopRightRadius: "4px", borderBottomRightRadius: "4px" },
  "&:hover": { bgcolor: "#F5F8FF", boxShadow: "0 2px 12px rgba(12,75,125,0.07)" },
};

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
    email: "pariamavalentino391@gmail.com",
    password: "123456",
    role: "Admin",
    status: "Aktif",
    lastLogin: "07 Jul 2026, 19:42",
  },
  {
    id: 2,
    name: "Reza Aditya",
    nip: "199205182018011001",
    email: "REZAHIDAYAT@PELINDO.CO.ID",
    password: "123456",
    role: "Admin",
    status: "Aktif",
    lastLogin: "07 Jul 2026, 16:10",
  },
  {
    id: 3,
    name: "Suci Wulandari",
    nip: "199411032019022004",
    email: "SMELATI@PELINDO.CO.ID",
    password: "123456",
    role: "Guest",
    status: "Nonaktif",
    lastLogin: "28 Jun 2026, 08:31",
  },
  {
    id: 4,
    name: "Hendra Saputra",
    nip: "198711262014041003",
    email: "HENDRA@PELINDO.CO.ID",
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

  const formatLastLogin = (lastLogin?: string) => {
    if (!lastLogin || lastLogin === "-") return "-";
    // Jika format lama (mock), kembalikan as is, atau coba parse.
    // Kita cek apakah ada 'T' yang biasanya menandakan ISO string.
    if (!lastLogin.includes("T")) return lastLogin;

    try {
      const date = new Date(lastLogin);
      if (isNaN(date.getTime())) return lastLogin;

      // format: 13 Jul 2026, 09:50:54
      const options: Intl.DateTimeFormatOptions = {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      };
      // id-ID uses '.' for time separator, so we replace it with ':'
      return new Intl.DateTimeFormat('id-ID', options).format(date).replace(/\./g, ':');
    } catch {
      return lastLogin;
    }
  };

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
      const response = await fetch(apiUrl("/api/users"), {
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
      {/* ================= SIDEBAR ================= */}
      <Sidebar activeMenu="Kelola Akun" />

      {/* ================= MAIN ================= */}
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

        <Box sx={{ p: 4, maxWidth: 1400, mx: "auto", pb: 15 }}>

          <Card sx={{ mb: 3, borderRadius: "12px", boxShadow: "0 2px 12px rgba(21,101,192,0.04)", bgcolor: "#FFFFFF" }}>
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
                    borderRadius: "5px",
                    "& fieldset": { borderColor: "rgba(83,83,83,0.21)" },
                    "&:hover fieldset": { borderColor: "rgba(83,83,83,0.21)" },
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: "#9CA3AF" }} />
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

          <Card sx={{ borderRadius: "12px", boxShadow: "0 2px 12px rgba(21,101,192,0.04)" }}>
            <CardContent sx={{ p: 3 }}>
              <TableContainer sx={{ px: 2, pb: 1 }}>
                <Table sx={{ minWidth: 650, tableLayout: "fixed", borderCollapse: "separate", borderSpacing: "0 13px" }}>
                  <TableHead>
                    <TableRow sx={thRowSx}>
                      <TableCell align="center" sx={{ whiteSpace: "nowrap", width: "28%", py: 0.5 }}>User</TableCell>
                      <TableCell align="center" sx={{ whiteSpace: "nowrap", width: "12%", py: 0.5 }}>Role</TableCell>
                      <TableCell align="center" sx={{ whiteSpace: "nowrap", width: "12%", py: 0.5 }}>Status</TableCell>
                      <TableCell align="center" sx={{ whiteSpace: "nowrap", width: "24%", py: 0.5 }}>Last Login</TableCell>
                      <TableCell align="center" sx={{ whiteSpace: "nowrap", width: "24%", py: 0.5 }}>Action</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow
                        key={user.id}
                        sx={tdRowSx}
                      >
                        <TableCell sx={{ py: 2, width: "28%" }}>
                          <Typography sx={{ fontWeight: 700, color: "#0F172A", fontSize: "0.92rem" }}>
                            {user.name}
                          </Typography>
                          <Typography sx={{ color: "#94A3B8", fontSize: "0.78rem", mt: 0.3 }}>
                            NIP {user.nip}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ py: 2, width: "12%" }} align="center">
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
                        <TableCell sx={{ py: 2, width: "12%" }} align="center">
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
                        <TableCell sx={{ py: 2, width: "24%" }} align="center">
                          <Typography sx={{ color: "#64748B", fontSize: "0.86rem", fontWeight: 600 }}>
                            {formatLastLogin(user.lastLogin)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ py: 2, width: "24%" }} align="center">
                          <Box sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
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
