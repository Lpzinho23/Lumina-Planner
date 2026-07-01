"use client";

import { Stack } from "@mui/material";
import {
  TrendingUp,
  TrendingDown,
  AccountBalance,
  Savings,
} from "@mui/icons-material";
import type { ThemeColors } from "@/context/ThemeContext";
import { SEMANTIC_COLORS } from "@/lib/constants";
import OverviewStatCard from "./OverviewStatCard";

type Props = {
  monthlyIncome: number;
  monthlyExpenses: number;
  totalInvested: number;
  colors: ThemeColors;
};

export default function SummaryCards({
  monthlyIncome,
  monthlyExpenses,
  totalInvested,
  colors,
}: Props) {
  const balance = monthlyIncome - monthlyExpenses;

  const cards = [
    {
      label: "Receita mensal",
      value: monthlyIncome,
      icon: <TrendingUp />,
      accent: SEMANTIC_COLORS.income,
      accentBg: "rgba(34, 197, 94, 0.12)",
      ariaLabel: `Receita mensal: ${monthlyIncome}`,
    },
    {
      label: "Gastos do mês",
      value: monthlyExpenses,
      icon: <TrendingDown />,
      accent: SEMANTIC_COLORS.variable,
      accentBg: "rgba(249, 115, 22, 0.12)",
      ariaLabel: `Gastos do mês: ${monthlyExpenses}`,
    },
    {
      label: "Saldo do mês",
      value: balance,
      icon: <AccountBalance />,
      accent: balance >= 0 ? SEMANTIC_COLORS.income : SEMANTIC_COLORS.variable,
      accentBg:
        balance >= 0
          ? "rgba(34, 197, 94, 0.12)"
          : "rgba(249, 115, 22, 0.12)",
      ariaLabel: `Saldo do mês: ${balance}`,
    },
    {
      label: "Total investido",
      value: totalInvested,
      icon: <Savings />,
      accent: "#2563eb",
      accentBg: "rgba(37, 99, 235, 0.12)",
      ariaLabel: `Total investido: ${totalInvested}`,
    },
  ];

  return (
    <Stack
      direction={{ xs: "column", md: "row" }}
      spacing={2}
      mb={3}
      role="region"
      aria-label="Indicadores financeiros do período"
    >
      {cards.map((card) => (
        <OverviewStatCard key={card.label} {...card} colors={colors} />
      ))}
    </Stack>
  );
}
