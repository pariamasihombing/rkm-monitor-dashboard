import { Box, Typography, Button } from "@mui/material";
import {
  Dashboard as DashboardIcon,
  Assessment,
  ContentPaste,
  TrendingUp,
  ManageAccounts as ManageAccountsIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { canManage } from "../utils/rbac";
import batikOrnament from "../assets/batik-ornament.png";

export default function Sidebar({ activeMenu, isPIC = false }: { activeMenu: string; isPIC?: boolean }) {
  const navigate = useNavigate();

  const menuItems = [
    { icon: DashboardIcon, label: "Dashboard", route: isPIC ? "/pic-dashboard" : "/dashboard" },
    { icon: Assessment, label: "RKM / Program", route: isPIC ? "/pic-rkm" : "/rkm" },
    { icon: ContentPaste, label: "Non RKM", route: isPIC ? "/pic-non-rkm" : "/non-rkm" },
    { icon: TrendingUp, label: "Weekly Monitoring", route: isPIC ? "/pic-weekly-monitoring" : "/weekly-monitoring" },
  ];

  if (canManage()) {
    menuItems.push({ icon: ManageAccountsIcon, label: "Kelola Akun", route: "/manage-users" });
  }

  return (
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
        zIndex: 1000
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
        {menuItems.map((item) => {
          const active = activeMenu === item.label;
          return (
            <Button
              key={item.label}
              startIcon={<item.icon sx={{ fontSize: "1.4rem" }} />}
              onClick={() => navigate(item.route)}
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
                fontWeight: active ? 900 : 600,
                width: "calc(100% - 10px)",
                ml: -1.5,
                ...(active && {
                  bgcolor: "rgba(255,255,255,0.25)",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
                  border: "2px solid rgba(255,255,255,0.4)",
                  backdropFilter: "blur(10px)",
                  "&:hover": {
                    bgcolor: "rgba(255,255,255,0.3)",
                  },
                }),
                ...(!active) && {
                  "&:hover": {
                    bgcolor: "rgba(255,255,255,0.1)",
                  },
                },
              }}
            >
              {item.label}
            </Button>
          );
        })}
      </Box>

      <Box sx={{ marginTop: "auto", marginLeft: "-24px", width: "111%", height: "auto", display: "flex", flexDirection: "column", justifyContent: "flex-end", overflow: "hidden" }}>
        <img src={batikOrnament} width="100%" style={{ display: "block", opacity: 1 }} />
      </Box>
    </Box>
  );
}
