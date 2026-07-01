"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  InputAdornment,
  IconButton,
  CircularProgress,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Person,
  Badge,
} from "@mui/icons-material";
import Link from "next/link";
import toast from "react-hot-toast";
import { extractAuthErrorCode, getAuthFriendlyMessage } from "@/lib/authErrors";
import FirebaseConfigAlert from "@/components/FirebaseConfigAlert";
import { useAppTheme } from "@/context/ThemeContext";
import { getAuthPageColors } from "@/lib/authPageColors";

export default function CadastroPage() {
  const { signup } = useAuth();
  const router = useRouter();
  const { colors: themeColors, isDarkMode } = useAppTheme();
  const colors = getAuthPageColors(themeColors, isDarkMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) return toast.error("As senhas não coincidem.");
    if (password.length < 6) return toast.error("A senha deve ter pelo menos 6 caracteres.");
    setLoading(true);
    try {
      await signup(email, password, name);
      toast.success("Conta criada com sucesso!");
      router.push("/dashboard");
    } catch (error: unknown) {
      console.error("Erro no cadastro:", error);
      const code = extractAuthErrorCode(error);
      toast.error(getAuthFriendlyMessage(code));
    } finally {
      setLoading(false);
    }
  };

  // Estilização dos inputs para manter contraste e legibilidade no tema da tela.
  const inputStyles = {
    "& .MuiOutlinedInput-root": {
      backgroundColor: colors.inputBackground,
      color: colors.textMain,
      borderRadius: "4px",
      transition: "all 0.2s",
      "& fieldset": { borderColor: colors.border },
      "&:hover fieldset": { borderColor: colors.textGray },
      "&.Mui-focused fieldset": { borderColor: colors.accentPurple },
      "& input:-webkit-autofill": {
        WebkitBoxShadow: `0 0 0 100px ${colors.inputBackground} inset`,
        WebkitTextFillColor: colors.textMain,
        caretColor: colors.textMain,
        borderRadius: "inherit",
      },
    },
    "& .MuiInputLabel-root": { color: colors.textGray },
    "& .MuiInputLabel-root.Mui-focused": { color: colors.accentPurple },
    "& .MuiSvgIcon-root": { color: colors.textGray },
  };

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: colors.pageBackground,
        p: 2,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, sm: 4, md: 5 },
          maxWidth: "420px",
          width: "100%",
          borderRadius: 4,
          bgcolor: colors.cardBackground,
          border: `1px solid ${colors.border}`,
          boxShadow: colors.cardShadow,
        }}
      >
        <Box component="form" onSubmit={handleRegister}>
          <FirebaseConfigAlert />
          <Box mb={4} textAlign="center">
            <Box
              sx={{
                width: 50,
                height: 50,
                borderRadius: 3,
                bgcolor: colors.accentPurple,
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                mb: 2,
                fontSize: 24,
                fontWeight: "bold",
              }}
            >
              +
            </Box>
            <Typography variant="h5" fontWeight="bold" color={colors.textMain}>
              Crie sua conta
            </Typography>
            <Typography variant="body2" color={colors.textGray}>
              Comece a controlar suas finanças hoje
            </Typography>
          </Box>

          <Stack spacing={2.5}>
            <TextField
              label="Nome Completo"
              fullWidth
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              variant="outlined"
              sx={inputStyles}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="E-mail"
              type="email"
              fullWidth
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              variant="outlined"
              sx={inputStyles}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Senha"
              type={showPassword ? "text" : "password"}
              fullWidth
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              variant="outlined"
              sx={inputStyles}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                      sx={{ color: colors.textGray }}
                      disabled={loading}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Confirmar Senha"
              type={showPassword ? "text" : "password"}
              fullWidth
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              variant="outlined"
              sx={inputStyles}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Badge />
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={loading}
              aria-busy={loading}
              sx={{
                mt: 1,
                py: 1.5,
                bgcolor: colors.buttonBg,
                color: colors.buttonText,
                fontWeight: "bold",
                fontSize: "1rem",
                borderRadius: 2,
                boxShadow: "none",
                transition: "all 0.2s",
                "&:hover": {
                  bgcolor: colors.buttonBgHover,
                  boxShadow: isDarkMode
                    ? "0 2px 10px rgba(0,0,0,0.1)"
                    : "0 4px 14px rgba(124,58,237,0.35)",
                },
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "CADASTRAR"}
            </Button>
          </Stack>

          <Box mt={4} textAlign="center" pt={3} borderTop={`1px solid ${colors.border}`}>
            <Typography variant="body2" sx={{ color: colors.textGray }}>
              Já tem uma conta?{" "}
              <Link href="/login" style={{ textDecoration: "none" }}>
                <Typography
                  component="span"
                  variant="body2"
                  fontWeight="bold"
                  sx={{
                    color: colors.accentPurple,
                    cursor: "pointer",
                    "&:hover": { textDecoration: "underline" },
                  }}
                >
                  Fazer Login
                </Typography>
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}