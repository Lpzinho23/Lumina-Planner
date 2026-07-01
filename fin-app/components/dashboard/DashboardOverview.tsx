"use client";

import { Box, Paper, Stack, Typography } from "@mui/material";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ThemeColors } from "@/context/ThemeContext";
import type { ChartLabelRow, TransactionRecord } from "@/types/finance";
import { SEMANTIC_COLORS } from "@/lib/constants";
import { formatBRL } from "@/lib/format";
import type { YearlyTrendRow } from "./EvolucaoFinanceira";
import { createCustomTooltipContent } from "./CustomTooltip";
import SummaryCards from "./SummaryCards";

type Props = {
  yearlyTrendData: YearlyTrendRow[];
  monthlyIncome: number;
  monthlyExpenses: number;
  totalInvested: number;
  topExpensesData: ChartLabelRow[];
  recentTransactions: TransactionRecord[];
  colors: ThemeColors;
  isDarkMode: boolean;
};

function panelSx(colors: ThemeColors) {
  return {
    p: 3,
    bgcolor: colors.paper,
    borderRadius: 3,
    border: `1px solid ${colors.border}`,
    boxShadow: "0 1px 3px rgba(15, 23, 42, 0.06)",
    height: "100%",
    display: "flex",
    flexDirection: "column" as const,
  };
}

export default function DashboardOverview({
  yearlyTrendData,
  monthlyIncome,
  monthlyExpenses,
  totalInvested,
  topExpensesData,
  recentTransactions,
  colors,
  isDarkMode,
}: Props) {
  const revenueBars = yearlyTrendData.map((row) => ({
    name: row.name,
    value: row.Entradas,
  }));

  const monthBreakdown = [
    { name: "Receitas", value: monthlyIncome, fill: SEMANTIC_COLORS.income },
    { name: "Despesas", value: monthlyExpenses, fill: SEMANTIC_COLORS.variable },
  ].filter((item) => item.value > 0);

  const donutTotal = monthBreakdown.reduce((sum, item) => sum + item.value, 0);

  return (
    <Box>
      <Box mb={3}>
        <Typography variant="h4" component="h1" fontWeight={700} color={colors.text}>
          Visão Geral
        </Typography>
        <Typography variant="body1" color={colors.textSecondary} mt={0.5}>
          Acompanhe os principais indicadores das suas finanças
        </Typography>
      </Box>

      <SummaryCards
        monthlyIncome={monthlyIncome}
        monthlyExpenses={monthlyExpenses}
        totalInvested={totalInvested}
        colors={colors}
      />

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "1.2fr 0.8fr" },
          gap: 2,
          mb: 2,
        }}
      >
        <Paper elevation={0} sx={panelSx(colors)}>
          <Typography variant="h6" component="h2" fontWeight={700} mb={2}>
            Receita nos últimos meses
          </Typography>
          <Box sx={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueBars} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke={isDarkMode ? "#333" : "#eef0f4"}
                />
                <XAxis dataKey="name" stroke={colors.textSecondary} tick={{ fontSize: 12 }} />
                <YAxis stroke={colors.textSecondary} tick={{ fontSize: 12 }} />
                <RechartsTooltip content={createCustomTooltipContent(isDarkMode, colors)} />
                <Bar
                  dataKey="value"
                  name="Receita"
                  fill={colors.primary}
                  radius={[8, 8, 0, 0]}
                  maxBarSize={48}
                />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Paper>

        <Paper elevation={0} sx={panelSx(colors)}>
          <Typography variant="h6" component="h2" fontWeight={700} mb={2}>
            Movimentação do mês
          </Typography>
          <Box sx={{ height: 280, position: "relative" }}>
            {donutTotal > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={monthBreakdown}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={72}
                    outerRadius={104}
                    paddingAngle={3}
                  >
                    {monthBreakdown.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Pie>
                  <RechartsTooltip content={createCustomTooltipContent(isDarkMode, colors)} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Stack
                alignItems="center"
                justifyContent="center"
                sx={{ height: "100%", color: colors.textSecondary }}
              >
                <Typography variant="body2">Sem movimentação neste mês</Typography>
              </Stack>
            )}
          </Box>
          <Stack direction="row" spacing={3} justifyContent="center" mt={1}>
            {monthBreakdown.map((item) => (
              <Stack key={item.name} direction="row" spacing={1} alignItems="center">
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    bgcolor: item.fill,
                  }}
                />
                <Typography variant="caption" color={colors.textSecondary}>
                  {item.name}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Paper>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
          gap: 2,
        }}
      >
        <Paper elevation={0} sx={panelSx(colors)}>
          <Typography variant="h6" component="h2" fontWeight={700} mb={2}>
            Últimos lançamentos
          </Typography>
          {recentTransactions.length === 0 ? (
            <Typography variant="body2" color={colors.textSecondary}>
              Nenhum lançamento registrado ainda.
            </Typography>
          ) : (
            <Stack spacing={1.5}>
              {recentTransactions.map((transaction) => (
                <Box
                  key={transaction.id}
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: colors.input,
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 2,
                  }}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="body2" fontWeight={600} noWrap>
                      {transaction.description || transaction.category || "Lançamento"}
                    </Typography>
                    <Typography variant="caption" color={colors.textSecondary}>
                      {transaction.date}
                    </Typography>
                  </Box>
                  <Typography variant="body2" fontWeight={700} color={colors.text}>
                    {formatBRL(transaction.amount)}
                  </Typography>
                </Box>
              ))}
            </Stack>
          )}
        </Paper>

        <Paper elevation={0} sx={panelSx(colors)}>
          <Typography variant="h6" component="h2" fontWeight={700} mb={2}>
            Maiores despesas do mês
          </Typography>
          {topExpensesData.length === 0 ? (
            <Typography variant="body2" color={colors.textSecondary}>
              Nenhuma despesa registrada neste período.
            </Typography>
          ) : (
            <Stack spacing={1.5}>
              {topExpensesData.map((expense) => (
                <Box
                  key={expense.name}
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: colors.input,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 2,
                  }}
                >
                  <Typography variant="body2" fontWeight={600}>
                    {expense.name}
                  </Typography>
                  <Typography variant="body2" fontWeight={700} color={SEMANTIC_COLORS.variable}>
                    {formatBRL(expense.value)}
                  </Typography>
                </Box>
              ))}
            </Stack>
          )}
        </Paper>
      </Box>
    </Box>
  );
}
