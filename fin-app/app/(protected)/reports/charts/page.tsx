"use client";

import { useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useAppTheme } from "@/context/ThemeContext";
import { useTransactions } from "@/lib/hooks/useTransactions";
import { SEMANTIC_COLORS } from "@/lib/constants";
import { formatBRL } from "@/lib/format";
import { isExpenseType } from "@/lib/finance";
import PageHeader from "@/components/PageHeader";
import TopDespesas from "@/components/dashboard/TopDespesas";
import FontesRenda from "@/components/dashboard/FontesRenda";
import {
  chartsGridSx,
  paperCardSx,
  statCardsRowSx,
  statValueSx,
} from "@/components/layout/shared";
import { Box, CircularProgress, Paper, Typography } from "@mui/material";

export default function ReportsChartsPage() {
  const { user } = useAuth();
  const { colors, isDarkMode } = useAppTheme();
  const { transactions, loading } = useTransactions(user?.uid);

  const topExpensesData = useMemo(() => {
    const map = new Map<string, number>();
    for (const tx of transactions) {
      if (!isExpenseType(tx.type)) continue;
      const key = tx.category ?? "Outros";
      map.set(key, (map.get(key) ?? 0) + tx.amount);
    }
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [transactions]);

  const incomeBySource = useMemo(() => {
    const map = new Map<string, number>();
    for (const tx of transactions) {
      if (tx.type !== "income") continue;
      const key = tx.bank ?? "Outros";
      map.set(key, (map.get(key) ?? 0) + tx.amount);
    }
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  const totalIncome = incomeBySource.reduce((s, r) => s + r.value, 0);
  const totalExpense = transactions
    .filter((t) => isExpenseType(t.type))
    .reduce((s, t) => s + t.amount, 0);

  return (
    <Box sx={{ minWidth: 0 }}>
      <PageHeader
        title="Gráficos"
        subtitle="Visualize receitas e despesas em gráficos."
        colors={colors}
      />

      {loading ? (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress aria-label="Carregando gráficos" />
        </Box>
      ) : (
        <>
          <Box sx={statCardsRowSx}>
            <Paper sx={paperCardSx(colors)}>
              <Typography variant="body2" color={colors.textSecondary}>
                Receitas totais
              </Typography>
              <Typography sx={{ ...statValueSx, color: SEMANTIC_COLORS.income }}>
                {formatBRL(totalIncome)}
              </Typography>
            </Paper>
            <Paper sx={paperCardSx(colors)}>
              <Typography variant="body2" color={colors.textSecondary}>
                Despesas totais
              </Typography>
              <Typography sx={{ ...statValueSx, color: SEMANTIC_COLORS.variable }}>
                {formatBRL(totalExpense)}
              </Typography>
            </Paper>
          </Box>

          <Box sx={chartsGridSx}>
            <Box sx={{ minHeight: { xs: 300, sm: 340, md: 380 }, minWidth: 0 }}>
              <TopDespesas
                topExpensesData={topExpensesData}
                colors={colors}
                isDarkMode={isDarkMode}
              />
            </Box>
            <Box sx={{ minHeight: { xs: 300, sm: 340, md: 380 }, minWidth: 0 }}>
              <FontesRenda
                incomeSourceData={incomeBySource}
                totalIncomeValue={totalIncome}
                colors={colors}
                isDarkMode={isDarkMode}
              />
            </Box>
          </Box>
        </>
      )}
    </Box>
  );
}
