"use client";
import { Suspense, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from "@mui/material";
import { Visibility, VisibilityOff, Email, Lock, ShowChart } from "@mui/icons-material";
import Link from "next/link";
import toast from "react-hot-toast";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  extractAuthErrorCode,
  getAuthFriendlyMessage,
} from "@/lib/authErrors";

const colors = {
  accentPurple: "#7c3aed",
  pageBackground: "#202024",
  cardBackground: "#27272a",
  inputBackground: "#18191d",
  buttonGrey: "#e4e4e7",
  buttonGreyHover: "#d4d4d8",
  textMain: "#ffffff",
  textDark: "#18181d",
  textGray: "#a1a1aa",
  border: "#333333",
};

function getSafeNextPath(raw: string | null): string {
  if (!raw) return "/dashboard";
  try {
    const decoded = decodeURIComponent(raw);
    if (!decoded.startsWith("/") || decoded.startsWith("//")) return "/dashboard";
    return decoded;
  } catch (error: unknown) {
    console.error("Falha ao processar parâmetro de redirecionamento:", error);
    return "/dashboard";
  }
}

function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Bem-vindo de volta!");
      const next = getSafeNextPath(searchParams.get("next"));
      router.push(next);
    } catch (error: unknown) {
      console.error("Erro no login:", error);
      const code = extractAuthErrorCode(error);
      toast.error(getAuthFriendlyMessage(code));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotEmail) return toast.error("Digite seu e-mail.");
    setForgotLoading(true);
    try {
      await sendPasswordResetEmail(auth, forgotEmail);
      toast.success("Email enviado! Verifique sua caixa de entrada.");
      setForgotOpen(false);
      setForgotEmail("");
    } catch (error: unknown) {
      console.error("Erro ao enviar redefinição de senha:", error);
      const code = extractAuthErrorCode(error);
      toast.error(getAuthFriendlyMessage(code));
    } finally {
      setForgotLoading(false);
    }
  };

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
          boxShadow: "0 10px 30px -12px rgba(0, 0, 0, 0.5)",
        }}
      >
        <Box component="form" onSubmit={handleLogin}>
          <Box mb={4} textAlign="center">
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="center"
              gap={1.5}
              mb={1.5}
            >
              <Box
                aria-hidden="true"
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: "12px",
                  bgcolor: colors.accentPurple,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 16px rgba(124,58,237,0.45)",
                }}
              >
                <ShowChart sx={{ fontSize: 22, color: "#fff" }} />
              </Box>
              <Typography
                variant="h5"
                fontWeight={800}
                letterSpacing="-0.5px"
                color={colors.textMain}
              >
                Lumina Planner
              </Typography>
            </Stack>
            <Typography variant="body2" color={colors.textGray}>
              Entre na sua conta para continuar
            </Typography>
          </Box>

          <Stack spacing={2.5}>
            <TextField
              label="E-mail"
              type="email"
              fullWidth
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              variant="outlined"
              disabled={loading}
              sx={inputStyles}
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
              disabled={loading}
              sx={inputStyles}
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
                      disabled={loading}
                      sx={{ color: colors.textGray }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Typography
                variant="caption"
                onClick={() => {
                  if (loading) return;
                  setForgotOpen(true);
                }}
                onKeyDown={(e) => {
                  if (loading) return;
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setForgotOpen(true);
                  }
                }}
                role="button"
                tabIndex={loading ? -1 : 0}
                aria-label="Abrir recuperação de senha"
                aria-disabled={loading}
                sx={{
                  color: colors.textGray,
                  "&:hover": { color: colors.accentPurple },
                  cursor: loading ? "default" : "pointer",
                  textDecoration: "none",
                  opacity: loading ? 0.5 : 1,
                  pointerEvents: loading ? "none" : "auto",
                }}
              >
                Esqueceu a senha?
              </Typography>
            </Box>

            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={loading}
              aria-busy={loading}
              sx={{
                py: 1.5,
                bgcolor: colors.buttonGrey,
                color: colors.textDark,
                fontWeight: "bold",
                fontSize: "1rem",
                borderRadius: 2,
                boxShadow: "none",
                transition: "all 0.2s",
                "&:hover": {
                  bgcolor: colors.buttonGreyHover,
                  boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                },
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "ENTRAR"}
            </Button>
          </Stack>

          <Box mt={4} textAlign="center" pt={3} borderTop={`1px solid ${colors.border}`}>
            <Typography variant="body2" sx={{ color: colors.textGray }}>
              Não tem uma conta?{" "}
              <Link href="/cadastro" style={{ textDecoration: "none" }}>
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
                  Criar conta
                </Typography>
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Dialog
        open={forgotOpen}
        onClose={() => setForgotOpen(false)}
        PaperProps={{
          sx: {
            bgcolor: colors.cardBackground,
            color: colors.textMain,
            border: `1px solid ${colors.border}`,
            width: "calc(100vw - 32px)",
            maxWidth: 420,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: "bold" }}>Redefinir Senha</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: colors.textGray, mb: 2 }}>
            Digite o e-mail associado à sua conta. Enviaremos um link para você redefinir sua senha.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Seu E-mail"
            type="email"
            fullWidth
            variant="outlined"
            value={forgotEmail}
            onChange={(e) => setForgotEmail(e.target.value)}
            disabled={forgotLoading}
            sx={inputStyles}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setForgotOpen(false)}
            sx={{ color: colors.textGray }}
            disabled={forgotLoading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleForgotPassword}
            variant="contained"
            disabled={forgotLoading}
            aria-busy={forgotLoading}
            sx={{ bgcolor: colors.accentPurple, "&:hover": { bgcolor: "#6d28d9" } }}
          >
            {forgotLoading ? <CircularProgress size={20} color="inherit" /> : "Enviar Link"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

function LoginFallback() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: colors.pageBackground,
      }}
    >
      <CircularProgress color="inherit" sx={{ color: colors.accentPurple }} aria-label="Carregando" />
    </Box>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginForm />
    </Suspense>
  );
}
