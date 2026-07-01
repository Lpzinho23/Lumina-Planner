"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { useAppTheme } from "@/context/ThemeContext";
import type {
  ChartLabelRow,
  DashboardGridLayoutItem,
  RadarExpenseRow,
} from "@/types/finance";
import type { Layout } from "react-grid-layout";
import dynamic from "next/dynamic";
import { Box, Paper, Typography, Stack, Tabs, Tab, LinearProgress, FormControl, Select, MenuItem, Tooltip, IconButton, Divider } from "@mui/material";
import {
  TrendingUp,
  Savings,
  PieChart as PieIcon,
  Radar as RadarIcon,
  RestartAlt,
  DashboardCustomize,
} from "@mui/icons-material";
import toast from "react-hot-toast";
import {
  CHART_PALETTE,
  DEFAULT_LAYOUT,
  META_ANUAL_INVEST,
  MONTHS_LIST,
  SEMANTIC_COLORS,
} from "@/lib/constants";
import { parseISODateUTC } from "@/lib/format";
import { isExpenseType } from "@/lib/finance";
import { createDebouncedCallback } from "@/lib/debounce";
import { getReadableErrorMessage } from "@/lib/errorHandling";
import { sanitizeDashboardLayout } from "@/lib/layoutValidation";
import { useTransactions } from "@/lib/hooks/useTransactions";
import type { YearlyTrendRow } from "@/components/dashboard/EvolucaoFinanceira";
import EvolucaoFinanceira from "@/components/dashboard/EvolucaoFinanceira";
import TopDespesas from "@/components/dashboard/TopDespesas";
import MetaInvestimento from "@/components/dashboard/MetaInvestimento";
import EvolucaoLucro from "@/components/dashboard/EvolucaoLucro";
import EvolucaoRendimentosCharts from "@/components/dashboard/EvolucaoRendimentosCharts";
import EvolucaoDespesasCharts from "@/components/dashboard/EvolucaoDespesasCharts";
import FontesRenda from "@/components/dashboard/FontesRenda";
import EvolucaoDespesasAnalise from "@/components/dashboard/EvolucaoDespesasAnalise";
import CrescimentoPatrimonial from "@/components/dashboard/CrescimentoPatrimonial";
import DashboardOverview from "@/components/dashboard/DashboardOverview";

const DashboardGrid = dynamic(() => import("@/components/DashboardGrid"), {
  ssr: false,
  loading: () => (
    <Box sx={{ p: 4, textAlign: "center" }}>
      <Typography variant="body2" color="textSecondary" mb={1}>
        Carregando Dashboard...
      </Typography>
      <LinearProgress color="secondary" />
    </Box>
  ),
});

export default function DashboardPage() {
  const { user } = useAuth();
  const { colors, isDarkMode } = useAppTheme();
  const { transactions } = useTransactions(user?.uid);

  const [layout, setLayout] = useState<DashboardGridLayoutItem[]>(DEFAULT_LAYOUT);
  const [isLayoutLoaded, setIsLayoutLoaded] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    if (!user) return;

    const loadLayout = async () => {
      try {
        const docRef = doc(db, `users/${user.uid}/settings`, "dashboard");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().layout) {
          const parsed = sanitizeDashboardLayout(docSnap.data().layout);
          if (parsed.ok) {
            setLayout(parsed.value);
          } else {
            console.warn("[dashboard] Layout salvo inválido; usando padrão.");
          }
        }
      } catch (error: unknown) {
        console.error(
          "Erro ao carregar layout do dashboard:",
            getReadableErrorMessage(error),
          error,
        );
        toast.error("Não foi possível carregar o layout salvo.");
      } finally {
        setIsLayoutLoaded(true);
      }
    };
    void loadLayout();
  }, [user]);

  const debouncedSaveLayout = useMemo(
    () =>
      createDebouncedCallback((layoutToSave: Layout) => {
        if (!user) return;
        const parsed = sanitizeDashboardLayout(layoutToSave);
        if (!parsed.ok) return;
        const saveToDb = async () => {
          try {
            await setDoc(
              doc(db, `users/${user.uid}/settings`, "dashboard"),
              { layout: parsed.value },
              { merge: true },
            );
          } catch (error: unknown) {
            console.error(
              "Erro ao salvar layout do dashboard:",
              getReadableErrorMessage(error),
              error,
            );
            toast.error("Não foi possível salvar o layout do dashboard.");
          }
        };
        void saveToDb();
      }, 500),
    [user],
  );

  useEffect(() => {
    return () => {
      debouncedSaveLayout.cancel();
    };
  }, [debouncedSaveLayout]);

  const handleLayoutChange = useCallback(
    (newLayout: Layout) => {
      const parsed = sanitizeDashboardLayout(newLayout);
      if (!parsed.ok) {
        toast.error("Layout inválido. Não foi possível aplicar alteração.");
        return;
      }
      setLayout(parsed.value);
      if (!user || !isLayoutLoaded) return;
      debouncedSaveLayout(newLayout);
    },
    [user, isLayoutLoaded, debouncedSaveLayout],
  );

  const handleRestoreLayout = useCallback(() => {
    setLayout(DEFAULT_LAYOUT);
    if (!user) return;
    const restoreToDb = async () => {
      try {
        await setDoc(
          doc(db, `users/${user.uid}/settings`, "dashboard"),
          { layout: DEFAULT_LAYOUT },
          { merge: true },
        );
        toast.success("Layout restaurado ao padrão.");
      } catch (error: unknown) {
        console.error(
          "Erro ao restaurar layout:",
          getReadableErrorMessage(error),
          error,
        );
        toast.error("Não foi possível restaurar o layout.");
      }
    };
    void restoreToDb();
  }, [user]);

  const yearlyTrendData = useMemo((): YearlyTrendRow[] => {
    return MONTHS_LIST.map((monthName, index) => {
      const transInMonth = transactions.filter((t) => {
        const d = parseISODateUTC(t.date);
        return (
          d.getUTCMonth() === index && d.getUTCFullYear() === currentYear
        );
      });
      const entrada = transInMonth
        .filter((t) => t.type === "income")
        .reduce((a, t) => a + t.amount, 0);
      const saida = transInMonth
        .filter((t) => isExpenseType(t.type))
        .reduce((a, t) => a + t.amount, 0);
      const saldo = entrada - saida;
      return {
        name: monthName.substring(0, 3),
        Entradas: entrada,
        Saídas: saida,
        Saldo: saldo,
        Lucro: saldo,
      };
    });
  }, [transactions, currentYear]);

  const topExpensesData = useMemo(() => {
    return transactions
      .filter((t) => {
        const d = parseISODateUTC(t.date);
        return (
          isExpenseType(t.type) &&
          d.getUTCMonth() === currentMonth &&
          d.getUTCFullYear() === currentYear
        );
      })
      .reduce<ChartLabelRow[]>((acc, curr) => {
        const name = curr.category ?? "Outros";
        const existing = acc.find((i) => i.name === name);
        if (existing) existing.value += curr.amount;
        else acc.push({ name, value: curr.amount });
        return acc;
      }, [])
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [transactions, currentMonth, currentYear]);

  const totalInvestedGlobal = useMemo(
    () =>
      transactions
        .filter((t) => t.type === "savings" || t.type === "piggy")
        .reduce((acc, t) => acc + t.amount, 0),
    [transactions],
  );

  const percentageGoal = useMemo(
    () =>
      Math.min((totalInvestedGlobal / META_ANUAL_INVEST) * 100, 100),
    [totalInvestedGlobal],
  );

  const gaugeData = useMemo(
    () => [
      {
        name: "Atingido",
        value: percentageGoal,
        fill: SEMANTIC_COLORS.savings,
      },
      {
        name: "Falta",
        value: 100 - percentageGoal,
        fill: isDarkMode ? SEMANTIC_COLORS.neutralDark : SEMANTIC_COLORS.neutral,
      },
    ],
    [percentageGoal, isDarkMode],
  );

  const incomeSourceData = useMemo(() => {
    return transactions
      .filter((t) => t.type === "income")
      .reduce<ChartLabelRow[]>((acc, curr) => {
        const name = curr.description ?? "Sem descrição";
        const existing = acc.find((item) => item.name === name);
        if (existing) existing.value += curr.amount;
        else acc.push({ name, value: curr.amount });
        return acc;
      }, [])
      .map((item, index) => ({
        ...item,
        fill: CHART_PALETTE[index % CHART_PALETTE.length],
      }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  const totalIncomeValue = useMemo(
    () => incomeSourceData.reduce((a, b) => a + b.value, 0),
    [incomeSourceData],
  );

  const expensesByCategory = useMemo(() => {
    return transactions
      .filter((t) => {
        const d = parseISODateUTC(t.date);
        return (
          isExpenseType(t.type) &&
          d.getUTCMonth() === currentMonth &&
          d.getUTCFullYear() === currentYear
        );
      })
      .reduce<RadarExpenseRow[]>((acc, curr) => {
        const subject = curr.category ?? "Outros";
        const existing = acc.find((item) => item.subject === subject);
        if (existing) existing.A += curr.amount;
        else acc.push({ subject, A: curr.amount, fullMark: 1500 });
        return acc;
      }, [])
      .slice(0, 6);
  }, [transactions, currentMonth, currentYear]);

  const paymentMethodsData = useMemo(() => {
    return transactions
      .filter((t) => {
        const d = parseISODateUTC(t.date);
        return (
          isExpenseType(t.type) &&
          d.getUTCMonth() === currentMonth &&
          d.getUTCFullYear() === currentYear
        );
      })
      .reduce<ChartLabelRow[]>((acc, curr) => {
        const name = curr.paymentMethod ?? "Outros";
        const existing = acc.find((item) => item.name === name);
        if (existing) existing.value += curr.amount;
        else acc.push({ name, value: curr.amount });
        return acc;
      }, []);
  }, [transactions, currentMonth, currentYear]);

  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => parseISODateUTC(b.date).getTime() - parseISODateUTC(a.date).getTime())
      .slice(0, 5);
  }, [transactions]);

  const gridItemStyle = {
    display: "flex",
    flexDirection: "column" as const,
    overflow: "hidden",
    height: "100%",
    minHeight: 0,
    width: "100%",
    boxSizing: "border-box" as const,
  };

  return (
    <Box maxWidth="xl" sx={{ mx: "auto", minWidth: 0, p: { xs: 0, sm: 1 } }}>
      <Paper
        sx={{
          p: 1.5,
          px: 2,
          borderRadius: 3,
          bgcolor: colors.paper,
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          alignItems: "center",
          justifyContent: "space-between",
          mb: 3,
          border: `1px solid ${colors.border}`,
          boxShadow: "0 1px 3px rgba(15, 23, 42, 0.06)",
        }}
      >
        <Typography variant="body2" fontWeight={600} color={colors.textSecondary}>
          Período selecionado
        </Typography>
        <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
          <FormControl size="small" variant="standard" sx={{ minWidth: 110 }}>
            <Select
              value={currentMonth}
              onChange={(e) => setCurrentMonth(Number(e.target.value))}
              disableUnderline
              inputProps={{ "aria-label": "Selecionar mês do dashboard" }}
              sx={{ color: colors.text, fontWeight: 700 }}
              MenuProps={{
                PaperProps: { sx: { bgcolor: colors.paper, color: colors.text } },
              }}
            >
              {MONTHS_LIST.map((m, i) => (
                <MenuItem key={m} value={i}>
                  {m}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" variant="standard" sx={{ minWidth: 72 }}>
            <Select
              value={currentYear}
              onChange={(e) => setCurrentYear(Number(e.target.value))}
              disableUnderline
              inputProps={{ "aria-label": "Selecionar ano do dashboard" }}
              sx={{ color: colors.text, fontWeight: 700 }}
              MenuProps={{
                PaperProps: { sx: { bgcolor: colors.paper, color: colors.text } },
              }}
            >
              <MenuItem value={2025}>2025</MenuItem>
              <MenuItem value={2026}>2026</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      <Paper
        sx={{
          bgcolor: colors.paper,
          borderRadius: 3,
          mb: 3,
          border: `1px solid ${colors.border}`,
          boxShadow: "0 1px 3px rgba(15, 23, 42, 0.06)",
        }}
      >
        <Tabs
          value={tabValue}
          onChange={(_e, v) => setTabValue(v)}
          variant="scrollable"
          textColor="inherit"
          indicatorColor="secondary"
          aria-label="Abas do dashboard financeiro"
          sx={{
            px: 1,
            "& .MuiTab-root": { color: colors.textSecondary, fontWeight: 600, minHeight: 56 },
            "& .Mui-selected": { color: `${colors.primary} !important` },
            "& .MuiTabs-indicator": { backgroundColor: colors.primary, height: 3, borderRadius: 2 },
          }}
        >
          <Tab icon={<PieIcon />} iconPosition="start" label="Visão Geral" />
          <Tab icon={<TrendingUp />} iconPosition="start" label="Meus Ganhos" />
          <Tab icon={<RadarIcon />} iconPosition="start" label="Análise de Gastos" />
          <Tab icon={<Savings />} iconPosition="start" label="Investimentos" />
          <Tab icon={<DashboardCustomize />} iconPosition="start" label="Painéis" />
        </Tabs>
      </Paper>

      {tabValue === 0 && (
        <DashboardOverview
          yearlyTrendData={yearlyTrendData}
          monthlyIncome={yearlyTrendData[currentMonth]?.Entradas ?? 0}
          monthlyExpenses={yearlyTrendData[currentMonth]?.Saídas ?? 0}
          totalInvested={totalInvestedGlobal}
          topExpensesData={topExpensesData}
          recentTransactions={recentTransactions}
          colors={colors}
          isDarkMode={isDarkMode}
        />
      )}

      {tabValue === 4 && (
        <Box sx={{ width: "100%" }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            mb={1.5}
          >
            <Typography
              variant="caption"
              color={colors.textSecondary}
              sx={{ display: { xs: "none", sm: "block" }, letterSpacing: "0.05em" }}
            >
              Arraste os painéis pelo ícone <strong>⠿</strong> · Redimensione pelas bordas
            </Typography>
            <Tooltip title="Restaurar posição original dos painéis" placement="left">
              <IconButton
                size="small"
                onClick={handleRestoreLayout}
                aria-label="Restaurar layout padrão do dashboard"
                sx={{
                  color: colors.textSecondary,
                  border: `1px solid ${colors.border}`,
                  borderRadius: 1.5,
                  px: 1,
                  py: 0.5,
                  gap: 0.5,
                  fontSize: "0.75rem",
                  "&:hover": { color: colors.text, borderColor: colors.text },
                }}
              >
                <RestartAlt sx={{ fontSize: 16 }} />
                <Typography variant="caption" component="span" fontWeight={600}>
                  Restaurar
                </Typography>
              </IconButton>
            </Tooltip>
          </Stack>
          <Divider sx={{ mb: 2, borderColor: colors.border }} />
          <DashboardGrid
            className="layout"
            layout={layout}
            cols={12}
            rowHeight={80}
            onLayoutChange={handleLayoutChange}
            draggableHandle=".drag-handle"
            margin={[16, 16]}
          >
            <div key="evolucao_fin" style={gridItemStyle}>
              <EvolucaoFinanceira
                yearlyTrendData={yearlyTrendData}
                currentYear={currentYear}
                colors={colors}
                isDarkMode={isDarkMode}
              />
            </div>

            <div key="top_despesas" style={gridItemStyle}>
              <TopDespesas
                topExpensesData={topExpensesData}
                colors={colors}
                isDarkMode={isDarkMode}
              />
            </div>

            <div key="evolucao_luc" style={gridItemStyle}>
              <EvolucaoLucro
                yearlyTrendData={yearlyTrendData}
                colors={colors}
                isDarkMode={isDarkMode}
              />
            </div>

            <div key="meta_inv" style={gridItemStyle}>
              <MetaInvestimento
                gaugeData={gaugeData}
                totalInvestedGlobal={totalInvestedGlobal}
                percentageGoal={percentageGoal}
                colors={colors}
                isDarkMode={isDarkMode}
              />
            </div>

            <div key="evolucao_ren" style={gridItemStyle}>
              <EvolucaoRendimentosCharts
                yearlyTrendData={yearlyTrendData}
                colors={colors}
                isDarkMode={isDarkMode}
              />
            </div>

            <div key="evolucao_des" style={gridItemStyle}>
              <EvolucaoDespesasCharts
                yearlyTrendData={yearlyTrendData}
                colors={colors}
                isDarkMode={isDarkMode}
              />
            </div>
          </DashboardGrid>
        </Box>
      )}

      {tabValue === 1 && (
        <FontesRenda
          incomeSourceData={incomeSourceData}
          totalIncomeValue={totalIncomeValue}
          colors={colors}
          isDarkMode={isDarkMode}
        />
      )}

      {tabValue === 2 && (
        <EvolucaoDespesasAnalise
          expensesByCategory={expensesByCategory}
          paymentMethodsData={paymentMethodsData}
          colors={colors}
          isDarkMode={isDarkMode}
        />
      )}

      {tabValue === 3 && (
        <CrescimentoPatrimonial
          yearlyTrendData={yearlyTrendData}
          colors={colors}
          isDarkMode={isDarkMode}
        />
      )}
    </Box>
  );
}
