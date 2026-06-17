import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#1f6fae" },
    background: {
      default: "#f5f7fb",
      paper: "#ffffff",
    },
  },

  shape: {
    borderRadius: 14,
  },

  typography: {
    fontFamily: ["Inter", "system-ui", "Arial"].join(","),
    h5: { fontWeight: 800 },
    h6: { fontWeight: 800 },
  },

  components: {
    /* ================= BUTTON (SIDEBAR) ================= */
    MuiButton: {
      styleOverrides: {
        root: {
          fontFamily: "Inter, system-ui, Arial",
          fontWeight: 600,
          fontSize: 16,
          letterSpacing: "0.02em",
          textTransform: "none",
        },
      },
    },

    /* ================= CARD ================= */
    MuiCard: {
      styleOverrides: {
        root: {
          border: "1px solid rgba(15, 23, 42, 0.08)",
          boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
        },
      },
    },

    /* ================= PAPER ================= */
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
  },
});