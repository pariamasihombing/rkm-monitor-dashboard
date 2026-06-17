import {
  Avatar,
  Menu,
  MenuItem,
  Typography,
  Box,
} from "@mui/material";
import {
  Logout as LogoutIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

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

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
      <Avatar
        sx={{
          bgcolor: "#FFC107",
          cursor: "pointer",
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
        onClick={(e) => setProfileAnchor(e.currentTarget)}
      >
        {userName.charAt(0)}
      </Avatar>

      <Typography
        fontWeight={600}
        color="white"
        fontSize="0.95rem"
        sx={{ cursor: "pointer", userSelect: "none" }}
        onClick={(e) => setProfileAnchor(e.currentTarget)}
      >
        {userName}
      </Typography>

      <Menu
        anchorEl={profileAnchor}
        open={Boolean(profileAnchor)}
        onClose={() => setProfileAnchor(null)}
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              boxShadow: "none",
              border: "none",
              background: "transparent",
              overflow: "visible",
            },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem
          onClick={handleLogout}
          sx={{
            py: 0.5,
            px: 1,
            borderRadius: 1,
            transition: "all 0.2s ease",
            color: "#DC2626",
            fontWeight: 600,
            fontSize: "0.8rem",
            display: "flex",
            gap: 1,
            "&:hover": {
              bgcolor: "rgba(220, 38, 38, 0.08)",
            },
          }}
        >
          <LogoutIcon sx={{ fontSize: 18, color: "inherit" }} />
          <Typography sx={{ fontSize: "0.8rem", fontWeight: 600 }}>
            Logout
          </Typography>
        </MenuItem>
      </Menu>
    </Box>
  );
}
