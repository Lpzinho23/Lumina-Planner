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

const menuItems = [
  {
    name: "Visão Geral",
    icon: <Dashboard fontSize="small" />,
    path: "/dashboard",
  },
  {
    name: "Fluxo de Caixa",
    icon: <ReceiptLong fontSize="small" />,
    path: "/control",
  },
  {
    name: "Configurações",
    icon: <Settings fontSize="small" />,
    path: "/settings",
  },
];

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
  const sidebarBg = isDarkMode ? "#111115" : "#ffffff";

  const navButtonSx = (isActive: boolean) => ({
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: 1.25,
    px: 1.75,
    py: 1.1,
    borderRadius: 2.5,
    bgcolor: isActive ? colors.primary : "transparent",
    color: isActive ? "#ffffff" : colors.textSecondary,
    boxShadow: isActive ? "0 8px 20px rgba(124, 58, 237, 0.28)" : "none",
    transition: "all 0.15s ease",
    "&:hover": {
      bgcolor: isActive ? colors.primary : isDarkMode ? "rgba(255,255,255,0.05)" : "#f4f5f8",
      color: isActive ? "#ffffff" : colors.text,
    },
  });

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
          boxShadow: isDarkMode ? "none" : "0 0 0 1px rgba(15,23,42,0.02)",
        }}
      >
        <Box sx={{ px: 2.5, pt: 3, pb: 2 }}>
          <Stack direction="row" alignItems="center" gap={1.25}>
            <Box
              aria-hidden="true"
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2.5,
                bgcolor: colors.primary,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 8px 20px rgba(124, 58, 237, 0.28)",
              }}
            >
              <ShowChart sx={{ fontSize: 22, color: "#fff" }} />
            </Box>
            <Box>
              <Typography variant="subtitle1" fontWeight={800} color={colors.text}>
                Lumina
              </Typography>
              <Typography variant="caption" color={colors.textSecondary}>
                Admin Panel
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Box sx={{ px: 2, mb: 2 }}>
          <ButtonBase
            onClick={handleOpenProfile}
            aria-label="Abrir resumo financeiro do perfil"
            sx={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 1.25,
              p: 1.5,
              borderRadius: 3,
              bgcolor: isDarkMode ? "rgba(255,255,255,0.04)" : "#f7f8fb",
              border: `1px solid ${colors.border}`,
              textAlign: "left",
            }}
          >
            <Avatar
              src={user?.photoURL || undefined}
              sx={{
                bgcolor: colors.primary,
                width: 42,
                height: 42,
                fontWeight: "bold",
                color: "#fff",
              }}
            >
              {user?.displayName?.[0]?.toUpperCase() ?? <Person fontSize="small" />}
            </Avatar>
            <Box overflow="hidden" flex={1}>
              <Typography variant="body2" fontWeight={700} color={colors.text} noWrap>
                {user?.displayName ?? "Usuário"}
              </Typography>
              <Typography variant="caption" color={colors.textSecondary} noWrap display="block">
                Finanças pessoais
              </Typography>
            </Box>
          </ButtonBase>
        </Box>

        <Box sx={{ px: 2, flex: 1 }}>
          <Stack spacing={0.75}>
            {menuItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <ButtonBase
                  key={item.path}
                  onClick={() => router.push(item.path)}
                  aria-label={`Ir para ${item.name}`}
                  aria-current={isActive ? "page" : undefined}
                  sx={navButtonSx(isActive)}
                >
                  <Box sx={{ display: "flex", color: "inherit" }}>{item.icon}</Box>
                  <Typography variant="body2" fontWeight={isActive ? 700 : 500} color="inherit">
                    {item.name}
                  </Typography>
                </ButtonBase>
              );
            })}
          </Stack>
        </Box>

        <Divider sx={{ borderColor: colors.border, mx: 2 }} />
        <Box sx={{ px: 2, py: 2.5 }}>
          <Stack spacing={0.75}>
            <ButtonBase
              onClick={toggleTheme}
              aria-label={isDarkMode ? "Ativar modo claro" : "Ativar modo escuro"}
              sx={navButtonSx(false)}
            >
              {isDarkMode ? <LightMode fontSize="small" /> : <DarkMode fontSize="small" />}
              <Typography variant="body2" fontWeight={500}>
                {isDarkMode ? "Modo claro" : "Modo escuro"}
              </Typography>
            </ButtonBase>
            <ButtonBase
              onClick={handleLogout}
              aria-label="Sair da conta"
              sx={{
                ...navButtonSx(false),
                color: colors.danger,
                "&:hover": { bgcolor: "rgba(239,68,68,0.08)", color: colors.danger },
              }}
            >
              <Logout fontSize="small" />
              <Typography variant="body2" fontWeight={500}>
                Sair
              </Typography>
            </ButtonBase>
          </Stack>
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
        }}
      >
        <Stack direction="row" alignItems="center" gap={1.25}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              bgcolor: colors.primary,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ShowChart sx={{ fontSize: 20, color: "#fff" }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight={800} color={colors.text}>
              Lumina
            </Typography>
            <Typography variant="caption" color={colors.textSecondary}>
              Admin Panel
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
            color: colors.primary,
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

      <Dialog
        open={profileOpen}
        onClose={handleCloseProfile}
        PaperProps={{
          sx: {
            bgcolor: colors.paper,
            color: colors.text,
            width: "calc(100vw - 32px)",
            maxWidth: 420,
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
                bgcolor: colors.primary,
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
