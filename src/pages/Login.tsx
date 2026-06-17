import { useState } from "react";
import { Box, Card, CardContent, TextField, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

import bg from "../assets/bg-login.png";
import logoDanantara from "../assets/logo-danantara.png";
import logoPelindo from "../assets/logo-pelindo.png";
import logoCorner from "../assets/logo-corner.png";

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Dummy credentials — nanti diganti API backend
  const USERS = [
    { nip: "admin001", password: "admin123", role: "admin" },
    { nip: "pic001",   password: "pic123",   role: "pic" },
  ];

  const handleLogin = () => {
    const match = USERS.find(
      (u) => u.nip === username && u.password === password
    );
    if (match) {
      setError("");
      if (match.role === "pic") {
        navigate("/pic-dashboard");
      } else {
        navigate("/dashboard");
      }
    } else {
      setError("NIP atau password salah.");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        position: "relative",
        backgroundImage: `url(${bg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >

{/* Logo top */}
          <Box
            sx={{
              display: "flex",
              position: "absolute",
              justifyContent: "center",
              alignItems: "center",
              top: 24,
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 5,
              gap: 4,
            }}
          >
            <Box
              component="img"
              src={logoDanantara}
              alt="Danantara Indonesia"
              sx={{ height: 38, width: "auto" }}
            />
            <Box
              component="img"
              src={logoPelindo}
              alt="Pelindo"
              sx={{ height: 60, width: "auto" }}
            />
          </Box>

      {/* Konten */}
      <Box
        sx={{
          position: "relative",
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          px: 2,
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 360 }}>
          {/* Card */}
          <Card
            sx={{
              borderRadius: 1,
              boxShadow: "0 12px 40px rgba(0,0,0,0.22)",
              overflow: "hidden",
              background: "rgba(255,255,255,0.98)",
            }}
          >
            <CardContent sx={{ p: 5, pt: 12, position: "relative", minHeight: 440 }}>
              <Typography
                variant="h5"
                fontWeight={800}
                textAlign="center"
                sx={{ mt: -6, mb: 0.5, color: "#0C4B7D", letterSpacing: 0.2 }}
              >
                Selamat Datang
              </Typography>
              <Typography
                variant="body1"
                color="#888"
                textAlign="center"
                sx={{ mb: 3, fontWeight: 700, fontSize: 13 }}
              >
                RKM Monitor Dashboard System
              </Typography>

              <Box sx={{ display: "grid", gap: 2.2 }}>
                <TextField
                  label={<span style={{fontWeight:600, fontSize:14, color:"#727989"}}>NIP</span>}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  fullWidth
                  variant="outlined"
                  size="small"

                InputProps={{
                  sx: {
                        "& .MuiInputBase-input": {
                          paddingY: "9px",   // coba 12px / 14px / 16px
                          paddingX: "16px",
                        },
                      },
                    }}
                  sx={{
                    background: "#FFFFFF",
                    borderRadius: 2,
                    input: { fontWeight: 600, fontSize: 16 },
                    mt: 5,
                  }}
                />
                <TextField
                  label={<span style={{fontWeight:600, fontSize:14, color:"#727989"}}>Password</span>}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  fullWidth
                  variant="outlined"
                  size="small"
                  InputProps={{
                  sx: {
                        "& .MuiInputBase-input": {
                          paddingY: "9px",   // coba 12px / 14px / 16px
                          paddingX: "16px",
                        },
                      },
                    }}
                  sx={{
                    background: "#FFFFFF",
                    borderRadius: 2,
                    input: { fontWeight: 600, fontSize: 16 },
                  }}
                />

                <Typography
                  variant="body2"
                  sx={{
                    color: "#d32f2f",
                    textAlign: "center",
                    fontWeight: 600,
                    fontSize: 13,
                    mt: -0.6,
                    mb: -4.2,
                    opacity: error ? 1 : 0,
                    pointerEvents: "none",
                  }}
                >
                  {error || "NIP atau password salah."}
                </Typography>

                <Button
                  variant="contained"
                  size="large"
                  onClick={handleLogin}
                  sx={{
                    mt: 5,
                    borderRadius: 1,
                    width: "50%",
                    alignSelf: "center",
                    justifySelf: "center",
                    textTransform: "none",
                    fontWeight: 700,
                    fontSize: 14,
                    py: 1,
                    backgroundColor: "#267ABD",
                    boxShadow: "0 2px 8px rgba(25, 118, 210, 0.10)",
                    letterSpacing: 0.5,
                    "&:hover": {
                      backgroundColor: "#267ABD",
                    },
                  }}
                >
                  Login
                </Button>
              </Box>

              {/* Logo kecil pojok kanan bawah */}
              <Box
                component="img"
                src={logoCorner}
                alt="Corner Logo"
                sx={{
                  position: "absolute",
                  right: 0,
                  bottom: 20,
                  height: 50,
                  width: "auto",
                  opacity: 0.95,
                  zIndex: 2,
                }}
              />
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}