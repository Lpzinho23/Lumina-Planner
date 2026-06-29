"use client";

import { useMemo, useCallback, useState, type SyntheticEvent } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useAppTheme } from "@/context/ThemeContext";
import toast from "react-hot-toast";
import { formatBRL } from "@/lib/format";
import { isExpenseType, isInvestmentType } from "@/lib/finance";
import { useTransactions } from "@/lib/hooks/useTransactions";
import { useCards } from "@/lib/hooks/useCards";
import {
  Box,
  Typography,
  Avatar,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  Divider,
  Button,
  DialogActions,
  ButtonBase,
  Tooltip,
  IconButton,
  BottomNavigation,
  BottomNavigationAction,
} from "@mui/material";
import {
  Dashboard,
  ReceiptLong,
  Settings,
  Logout,
  AccountBalanceWallet,
  Savings,
  CreditCard,
  Person,
  ShowChart,
  LightMode,
  DarkMode,
} from "@mui/icons-material";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { colors, isDarkMode, toggleTheme } = useAppTheme();
  const router = useRouter();
  const pathname = usePathname();

  const [profileOpen, setProfileOpen] = useState(false);
  const { transactions } = useTransactions(user?.uid);
  const { cards } = useCards(user?.uid);

  const handleOpenProfile = useCallback(() => {
    setProfileOpen(true);
  }, []);

  const handleCloseProfile = useCallback(() => {
    setProfileOpen(false);
  }, []);

  const handleNavigationChange = useCallback(
    (_event: SyntheticEvent, path: string) => {
      router.push(path);
    },
    [router],
  );

  const handleGoToSettings = useCallback(() => {
    setProfileOpen(false);
    router.push("/settings");
  }, [router]);

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

  const totals = useMemo(() => {
    const totalIncome = transactions
      .filter((t) => t.type === "income")
      .reduce((acc, t) => acc + t.amount, 0);
    const totalExpense = transactions
      .filter((t) => isExpenseType(t.type))
      .reduce((acc, t) => acc + t.amount, 0);
    const globalBalance = totalIncome - totalExpense;
    const totalInvested = transactions
      .filter((t) => isInvestmentType(t.type))
      .reduce((acc, t) => acc + t.amount, 0);
    const totalLimit = cards.reduce((acc, c) => acc + c.limit, 0);
    const usedLimit = transactions
      .filter(
        (t) =>
          t.paymentMethod === "Crédito" &&
          isExpenseType(t.type) &&
          t.status !== "Fatura Paga",
      )
      .reduce((acc, t) => acc + t.amount, 0);
    const availableLimit = Math.max(0, totalLimit - usedLimit);
    return { globalBalance, totalInvested, availableLimit };
  }, [transactions, cards]);

  const { globalBalance, totalInvested, availableLimit } = totals;

  const menuItems = [
    { name: "Dashboard", icon: <Dashboard fontSize="small" />, path: "/dashboard" },
    { name: "Controle", icon: <ReceiptLong fontSize="small" />, path: "/control" },
    { name: "Configurações", icon: <Settings fontSize="small" />, path: "/settings" },
  ];

  const sidebarBg = isDarkMode ? "#111115" : "#fafafa";

  return (
    <>
      <Box
        component="nav"
        aria-label="Navegação principal"
        sx={{
          width: 280,
          height: "100dvh",
          bgcolor: sidebarBg,
          borderRight: `1px solid ${colors.border}`,
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          position: "fixed",
          left: 0,
          top: 0,
          zIndex: 1200,
          transition: "background-color 0.3s ease",
          overflow: "hidden",
        }}
      >
        {/* Logo + Theme toggle */}
        <Box sx={{ px: 3, pt: 3, pb: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" alignItems="center" gap={1.5}>
              <Box
                aria-hidden="true"
                sx={{
                  width: 34,
                  height: 34,
                  borderRadius: "10px",
                  bgcolor: "#7c3aed",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  boxShadow: "0 4px 14px rgba(124,58,237,0.4)",
                }}
              >
                <ShowChart sx={{ fontSize: 20, color: "#fff" }} />
              </Box>
              <Typography
                variant="h6"
                fontWeight={800}
                letterSpacing="-0.5px"
                sx={{ color: colors.text, userSelect: "none" }}
              >
                Lumina Planner
              </Typography>
            </Stack>
            <Tooltip
              title={isDarkMode ? "Modo claro" : "Modo escuro"}
              placement="right"
            >
              <IconButton
                size="small"
                onClick={toggleTheme}
                aria-label={isDarkMode ? "Ativar modo claro" : "Ativar modo escuro"}
                sx={{
                  color: colors.textSecondary,
                  "&:hover": {
                    color: colors.text,
                    bgcolor: isDarkMode
                      ? "rgba(255,255,255,0.06)"
                      : "rgba(0,0,0,0.05)",
                  },
                }}
              >
                {isDarkMode ? (
                  <LightMode fontSize="small" />
                ) : (
                  <DarkMode fontSize="small" />
                )}
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>

        <Divider sx={{ borderColor: colors.border, mx: 2, mb: 2 }} />

        {/* Profile button */}
        <Box sx={{ px: 2, mb: 3 }}>
          <ButtonBase
            onClick={handleOpenProfile}
            aria-label="Abrir resumo financeiro do perfil"
            sx={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              p: 1.5,
              borderRadius: 3,
              bgcolor: isDarkMode
                ? "rgba(255,255,255,0.04)"
                : "rgba(0,0,0,0.03)",
              border: `1px solid ${colors.border}`,
              textAlign: "left",
              transition: "all 0.2s",
              "&:hover": {
                bgcolor: isDarkMode
                  ? "rgba(124,58,237,0.10)"
                  : "rgba(124,58,237,0.06)",
                borderColor: "#7c3aed",
              },
            }}
          >
            <Avatar
              src={user?.photoURL || undefined}
              sx={{
                bgcolor: "#7c3aed",
                width: 36,
                height: 36,
                fontWeight: "bold",
                color: "#fff",
                fontSize: "0.95rem",
                flexShrink: 0,
              }}
            >
              {user?.displayName?.[0]?.toUpperCase() ?? <Person fontSize="small" />}
            </Avatar>
            <Box overflow="hidden" flex={1}>
              <Typography
                variant="subtitle2"
                fontWeight={700}
                color={colors.text}
                noWrap
                sx={{ lineHeight: 1.3 }}
              >
                {user?.displayName ?? "Usuário"}
              </Typography>
              <Typography
                variant="caption"
                color={colors.textSecondary}
                noWrap
                display="block"
                sx={{ lineHeight: 1.4 }}
              >
                {user?.email}
              </Typography>
            </Box>
          </ButtonBase>
        </Box>

        {/* Navigation items */}
        <Box sx={{ px: 2, flex: 1 }}>
          <Typography
            variant="caption"
            fontWeight={700}
            color={colors.textSecondary}
            sx={{
              px: 1,
              mb: 1,
              display: "block",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            Navegação
          </Typography>
          <Stack spacing={0.5} mt={1}>
            {menuItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <ButtonBase
                  key={item.path}
                  onClick={() => router.push(item.path)}
                  aria-label={`Ir para ${item.name}`}
                  aria-current={isActive ? "page" : undefined}
                  sx={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    px: 2,
                    py: 1.2,
                    borderRadius: 2,
                    borderLeft: `3px solid ${isActive ? "#7c3aed" : "transparent"}`,
                    bgcolor: isActive
                      ? isDarkMode
                        ? "rgba(124,58,237,0.12)"
                        : "rgba(124,58,237,0.07)"
                      : "transparent",
                    color: isActive ? "#7c3aed" : colors.textSecondary,
                    transition: "all 0.15s ease",
                    "&:hover": {
                      bgcolor: isActive
                        ? isDarkMode
                          ? "rgba(124,58,237,0.16)"
                          : "rgba(124,58,237,0.10)"
                        : isDarkMode
                          ? "rgba(255,255,255,0.05)"
                          : "rgba(0,0,0,0.04)",
                      color: isActive ? "#7c3aed" : colors.text,
                    },
                  }}
                >
                  <Box sx={{ display: "flex", color: "inherit" }}>{item.icon}</Box>
                  <Typography
                    variant="body2"
                    fontWeight={isActive ? 700 : 500}
                    color="inherit"
                    sx={{ lineHeight: 1 }}
                  >
                    {item.name}
                  </Typography>
                </ButtonBase>
              );
            })}
          </Stack>
        </Box>

        {/* Logout */}
        <Divider sx={{ borderColor: colors.border, mx: 2, mb: 1 }} />
        <Box sx={{ px: 2, pb: 3 }}>
          <ButtonBase
            onClick={handleLogout}
            aria-label="Sair da conta"
            sx={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              px: 2,
              py: 1.2,
              borderRadius: 2,
              color: "#ef4444",
              transition: "all 0.15s ease",
              "&:hover": { bgcolor: "rgba(239,68,68,0.08)" },
            }}
          >
            <Logout fontSize="small" />
            <Typography variant="body2" fontWeight={500} color="inherit">
              Sair da Conta
            </Typography>
          </ButtonBase>
        </Box>
      </Box>

      <Box
        component="header"
        aria-label="Topo do aplicativo mobile"
        sx={{
          display: { xs: "flex", md: "none" },
          alignItems: "center",
          justifyContent: "space-between",
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1200,
          height: "calc(64px + env(safe-area-inset-top))",
          px: 2,
          pt: "env(safe-area-inset-top)",
          bgcolor: sidebarBg,
          borderBottom: `1px solid ${colors.border}`,
          backdropFilter: "blur(16px)",
        }}
      >
        <Stack direction="row" alignItems="center" gap={1.25}>
          <Box
            aria-hidden="true"
            sx={{
              width: 36,
              height: 36,
              borderRadius: "12px",
              bgcolor: "#7c3aed",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 14px rgba(124,58,237,0.35)",
            }}
          >
            <ShowChart sx={{ fontSize: 20, color: "#fff" }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight={800} color={colors.text}>
              Lumina Planner
            </Typography>
            <Typography variant="caption" color={colors.textSecondary}>
              Planejamento financeiro
            </Typography>
          </Box>
        </Stack>
        <Stack direction="row" alignItems="center" gap={0.5}>
          <IconButton
            size="small"
            onClick={toggleTheme}
            aria-label={isDarkMode ? "Ativar modo claro" : "Ativar modo escuro"}
            sx={{ color: colors.textSecondary }}
          >
            {isDarkMode ? <LightMode fontSize="small" /> : <DarkMode fontSize="small" />}
          </IconButton>
          <IconButton
            size="small"
            onClick={handleOpenProfile}
            aria-label="Abrir resumo financeiro do perfil"
            sx={{ color: colors.textSecondary }}
          >
            <Person fontSize="small" />
          </IconButton>
        </Stack>
      </Box>

      <BottomNavigation
        component="nav"
        aria-label="Navegação principal mobile"
        value={menuItems.some((item) => item.path === pathname) ? pathname : false}
        onChange={handleNavigationChange}
        showLabels
        sx={{
          display: { xs: "flex", md: "none" },
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1200,
          height: "calc(64px + env(safe-area-inset-bottom))",
          pb: "env(safe-area-inset-bottom)",
          bgcolor: sidebarBg,
          borderTop: `1px solid ${colors.border}`,
          "& .MuiBottomNavigationAction-root": {
            color: colors.textSecondary,
            minWidth: 0,
          },
          "& .Mui-selected": {
            color: "#7c3aed",
          },
        }}
      >
        {menuItems.map((item) => (
          <BottomNavigationAction
            key={item.path}
            label={item.name}
            value={item.path}
            icon={item.icon}
            aria-label={`Ir para ${item.name}`}
          />
        ))}
      </BottomNavigation>

      {/* Profile / Financial Summary Dialog */}
      <Dialog
        open={profileOpen}
        onClose={handleCloseProfile}
        PaperProps={{
          sx: {
            bgcolor: colors.paper,
            color: colors.text,
            width: "calc(100vw - 32px)",
            maxWidth: 420,
            minWidth: 0,
            borderRadius: 4,
            border: `1px solid ${colors.border}`,
          },
        }}
      >
        <DialogTitle
          sx={{
            textAlign: "center",
            fontWeight: "bold",
            borderBottom: `1px solid ${colors.border}`,
          }}
        >
          Meu Resumo Financeiro
        </DialogTitle>
        <DialogContent sx={{ mt: 3 }}>
          <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
            <Avatar
              src={user?.photoURL || undefined}
              sx={{
                width: 80,
                height: 80,
                bgcolor: "#7c3aed",
                fontSize: 40,
                mb: 1.5,
                fontWeight: "bold",
                color: "#fff",
              }}
            >
              {user?.displayName?.[0]?.toUpperCase() ?? <Person fontSize="large" />}
            </Avatar>
            <Typography variant="h6" fontWeight="bold" color={colors.text}>
              {user?.displayName ?? "Usuário"}
            </Typography>
            <Typography variant="body2" color={colors.textSecondary}>
              {user?.email}
            </Typography>
          </Box>

          <Stack spacing={2}>
            <Box p={2} borderRadius={3} bgcolor="#2e1065" border="1px solid #a78bfa30">
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Stack direction="row" alignItems="center" gap={1}>
                  <AccountBalanceWallet sx={{ color: "#a78bfa" }} fontSize="small" />
                  <Typography variant="body2" color="#d8b4fe">
                    Saldo Total
                  </Typography>
                </Stack>
                <Typography variant="h6" fontWeight="bold" color="white">
                  {formatBRL(globalBalance)}
                </Typography>
              </Stack>
            </Box>

            <Box p={2} borderRadius={3} bgcolor="#172554" border="1px solid #60a5fa30">
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Stack direction="row" alignItems="center" gap={1}>
                  <Savings sx={{ color: "#60a5fa" }} fontSize="small" />
                  <Typography variant="body2" color="#bfdbfe">
                    Investido
                  </Typography>
                </Stack>
                <Typography variant="h6" fontWeight="bold" color="white">
                  {formatBRL(totalInvested)}
                </Typography>
              </Stack>
            </Box>

            <Box p={2} borderRadius={3} bgcolor="#14532d" border="1px solid #4ade8030">
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Stack direction="row" alignItems="center" gap={1}>
                  <CreditCard sx={{ color: "#4ade80" }} fontSize="small" />
                  <Typography variant="body2" color="#bbf7d0">
                    Limite Crédito
                  </Typography>
                </Stack>
                <Typography variant="h6" fontWeight="bold" color="white">
                  {formatBRL(availableLimit)}
                </Typography>
              </Stack>
            </Box>
          </Stack>

          <Divider sx={{ my: 3, borderColor: colors.border }} />

          <Button
            variant="outlined"
            fullWidth
            startIcon={<Settings />}
            onClick={handleGoToSettings}
            sx={{
              borderColor: colors.border,
              color: colors.text,
              py: 1.5,
              textTransform: "none",
              "&:hover": {
                borderColor: "#7c3aed",
                bgcolor: isDarkMode ? "#7c3aed10" : "#7c3aed05",
              },
            }}
          >
            Ir para Configurações
          </Button>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
          <Button onClick={handleCloseProfile} color="inherit">
            Fechar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
