"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useAppTheme } from "@/context/ThemeContext";
import toast from "react-hot-toast";
import {
  Box,
  Typography,
  Avatar,
  Stack,
  Divider,
  ButtonBase,
  IconButton,
  Drawer,
} from "@mui/material";
import {
  Logout,
  Person,
  ShowChart,
  LightMode,
  DarkMode,
  Menu,
} from "@mui/icons-material";
import SidebarNavigation from "@/components/SidebarNavigation";
import { SIDEBAR_DESKTOP_BREAKPOINT } from "@/components/layout/shared";

const SIDEBAR_WIDTH = 300;

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { colors, isDarkMode, toggleTheme } = useAppTheme();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebarBg = isDarkMode ? "#111115" : "#ffffff";

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      router.push("/login");
      toast.success("Saiu com sucesso!");
    } catch (error) {
      console.error("Erro ao sair:", error);
      toast.error("Erro ao tentar sair.");
    }
  }, [logout, router]);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  const sidebarContent = useMemo(
    () => (
      <Box
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          bgcolor: sidebarBg,
        }}
      >
        <Box sx={{ px: 2.5, pt: 3, pb: 2 }}>
          <Stack direction="row" alignItems="center" gap={1.25}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2.5,
                bgcolor: colors.primary,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ShowChart sx={{ fontSize: 22, color: "#fff" }} />
            </Box>
            <Box>
              <Typography variant="subtitle1" fontWeight={800} color={colors.text}>
                Lumina
              </Typography>
              <Typography variant="caption" color={colors.textSecondary}>
                Finanças pessoais
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Box sx={{ px: 2, mb: 2 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.25,
              p: 1.5,
              borderRadius: 3,
              bgcolor: isDarkMode ? "rgba(255,255,255,0.04)" : "#f7f8fb",
              border: `1px solid ${colors.border}`,
            }}
          >
            <Avatar
              src={user?.photoURL || undefined}
              sx={{ bgcolor: colors.primary, width: 42, height: 42, color: "#fff" }}
            >
              {user?.displayName?.[0]?.toUpperCase() ?? <Person fontSize="small" />}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body2" fontWeight={700} color={colors.text} noWrap>
                {user?.displayName ?? "Usuário"}
              </Typography>
              <Typography variant="caption" color={colors.textSecondary} noWrap display="block">
                {user?.email}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={{ px: 2, flex: 1, overflowY: "auto" }}>
          <SidebarNavigation
            colors={colors}
            isDarkMode={isDarkMode}
            onNavigate={closeMobile}
          />
        </Box>

        <Divider sx={{ borderColor: colors.border, mx: 2 }} />
        <Box sx={{ px: 2, py: 2.5 }}>
          <Stack spacing={1}>
            <ButtonBase
              onClick={toggleTheme}
              aria-label={isDarkMode ? "Ativar modo claro" : "Ativar modo escuro"}
              sx={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 1.25,
                px: 1.75,
                py: 1,
                borderRadius: 2,
                color: colors.textSecondary,
              }}
            >
              {isDarkMode ? <LightMode fontSize="small" /> : <DarkMode fontSize="small" />}
              <Typography variant="body2">
                {isDarkMode ? "Modo claro" : "Modo escuro"}
              </Typography>
            </ButtonBase>
            <ButtonBase
              onClick={handleLogout}
              aria-label="Sair da conta"
              sx={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 1.25,
                px: 1.75,
                py: 1,
                borderRadius: 2,
                color: colors.danger,
              }}
            >
              <Logout fontSize="small" />
              <Typography variant="body2">Sair</Typography>
            </ButtonBase>
          </Stack>
        </Box>
      </Box>
    ),
    [closeMobile, colors, handleLogout, isDarkMode, sidebarBg, toggleTheme, user],
  );

  return (
    <>
      <Box
        component="nav"
        aria-label="Navegação principal"
        sx={{
          width: SIDEBAR_WIDTH,
          display: { xs: "none", [SIDEBAR_DESKTOP_BREAKPOINT]: "block" },
          flexShrink: 0,
        }}
      >
        <Box
          sx={{
            width: SIDEBAR_WIDTH,
            height: "100dvh",
            position: "fixed",
            left: 0,
            top: 0,
            borderRight: `1px solid ${colors.border}`,
            zIndex: 1200,
          }}
        >
          {sidebarContent}
        </Box>
      </Box>

      <Box
        component="header"
        sx={{
          display: { xs: "flex", [SIDEBAR_DESKTOP_BREAKPOINT]: "none" },
          alignItems: "center",
          justifyContent: "space-between",
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1200,
          height: "calc(56px + env(safe-area-inset-top))",
          px: 1.5,
          pt: "env(safe-area-inset-top)",
          bgcolor: sidebarBg,
          borderBottom: `1px solid ${colors.border}`,
        }}
      >
        <IconButton
          onClick={() => setMobileOpen(true)}
          aria-label="Abrir menu de navegação"
          sx={{ color: colors.text }}
        >
          <Menu />
        </IconButton>
        <Typography variant="subtitle1" fontWeight={800} color={colors.text}>
          Lumina
        </Typography>
        <IconButton
          onClick={toggleTheme}
          aria-label={isDarkMode ? "Ativar modo claro" : "Ativar modo escuro"}
          sx={{ color: colors.textSecondary }}
        >
          {isDarkMode ? <LightMode fontSize="small" /> : <DarkMode fontSize="small" />}
        </IconButton>
      </Box>

      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={closeMobile}
        ModalProps={{ keepMounted: true }}
        PaperProps={{
          sx: { width: SIDEBAR_WIDTH, maxWidth: "88vw" },
        }}
      >
        {sidebarContent}
      </Drawer>
    </>
  );
}

export { SIDEBAR_WIDTH };
