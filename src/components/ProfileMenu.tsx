import {
  Avatar,
  Menu,
  MenuItem,
  Typography,
  Box,
} from "@mui/material";
import {
  Logout as LogoutIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { Divider, ListItemIcon } from "@mui/material";
import { useRef, useState, useEffect } from "react";

interface ProfileMenuProps {
  profileAnchor: HTMLElement | null;
  setProfileAnchor: (anchor: HTMLElement | null) => void;
  userName?: string;
}

export default function ProfileMenu({
  profileAnchor,
  setProfileAnchor,
  userName = "Pariama Valentino",
}: ProfileMenuProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    setProfileAnchor(null);
    navigate("/");
  };

  const handlePengaturanAkun = () => {
    setProfileAnchor(null);
    navigate("/pengaturan-akun");
  };

  const storedUserName = localStorage.getItem("userName") || userName;
  const userRole = localStorage.getItem("userRole") || "Guest";

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const loadProfilePic = () => {
    const pic = localStorage.getItem(`userProfilePic_${storedUserName}`);
    if (pic) setAvatarUrl(pic);
  };

  useEffect(() => {
    loadProfilePic();
    window.addEventListener("profileUpdated", loadProfilePic);
    return () => {
      window.removeEventListener("profileUpdated", loadProfilePic);
    };
  }, []);

  const triggerRef = useRef<HTMLDivElement>(null);

  const handleOpenMenu = () => {
    if (triggerRef.current) {
      setProfileAnchor(triggerRef.current);
    }
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
      <Box
        ref={triggerRef}
        onClick={handleOpenMenu}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          cursor: "pointer",
          borderRadius: 2,
          px: 1,
          py: 0.5,
          transition: "background 0.2s",
          "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
        }}
      >
        <Avatar
          src={avatarUrl || undefined}
          sx={{
            bgcolor: "#FFC107",
            width: 36,
            height: 36,
            fontSize: "1rem",
            fontWeight: 600,
            transition: "all 0.3s ease",
            "&:hover": {
              bgcolor: "#FFB300",
              boxShadow: "0 4px 12px rgba(255, 193, 7, 0.3)",
              transform: "scale(1.08)",
            },
          }}
        >
          {!avatarUrl && storedUserName.charAt(0)}
        </Avatar>

        <Typography
          fontWeight={600}
          color="white"
          fontSize="0.95rem"
          sx={{ userSelect: "none" }}
        >
          {storedUserName}
        </Typography>
      </Box>

      <Menu
        anchorEl={profileAnchor}
        open={Boolean(profileAnchor)}
        onClose={() => setProfileAnchor(null)}
        slotProps={{
          paper: {
            sx: {
              mt: 1.5,
              minWidth: 240,
              borderRadius: 1,
              boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.1)",
              border: "1px solid #E2E8F0",
              overflow: "hidden",
            },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <Box sx={{ px: 2, py: 2, display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar 
            src={avatarUrl || undefined}
            sx={{ bgcolor: "#2196F3", width: 44, height: 44, fontSize: "1.2rem", fontWeight: 700 }}
          >
            {!avatarUrl && storedUserName.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="subtitle1" fontWeight={700} sx={{ lineHeight: 1.2, color: "#1E293B" }}>
              {storedUserName}
            </Typography>
            <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 600 }}>
              {userRole}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 1, borderColor: "#F1F5F9" }} />

        <MenuItem
          onClick={handlePengaturanAkun}
          sx={{
            py: 1,
            px: 2,
            mx: 1,
            mb: 0.5,
            borderRadius: 1,
            transition: "all 0.2s ease",
            color: "#334155",
            fontWeight: 600,
            fontSize: "0.85rem",
            "&:hover": {
              bgcolor: "#F8FAFC",
              color: "#2563EB",
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 32 }}>
            <SettingsIcon sx={{ fontSize: 20, color: "inherit" }} />
          </ListItemIcon>
          Pengaturan Akun
        </MenuItem>

        <MenuItem
          onClick={handleLogout}
          sx={{
            py: 1,
            px: 2,
            mx: 1,
            mb: 1,
            borderRadius: 1,
            transition: "all 0.2s ease",
            color: "#DC2626",
            fontWeight: 600,
            fontSize: "0.85rem",
            "&:hover": {
              bgcolor: "#FEF2F2",
              color: "#B91C1C",
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 32 }}>
            <LogoutIcon sx={{ fontSize: 20, color: "inherit" }} />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
    </Box>
  );
}
