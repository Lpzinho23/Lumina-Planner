"use client";

import { Box, Paper, Stack, Typography } from "@mui/material";
import {
  TrendingUp,
  TrendingDown,
  AccountBalance,
  Savings,
} from "@mui/icons-material";
import type { ThemeColors } from "@/context/ThemeContext";
import { SEMANTIC_COLORS } from "@/lib/constants";
import { formatBRL } from "@/lib/format";

type CardDef = {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  bg: string;
  ariaLabel: string;
};

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
  const balancePositive = balance >= 0;

  const cards: CardDef[] = [
    {
      label: "Receitas do mês",
      value: monthlyIncome,
      icon: <TrendingUp />,
      color: SEMANTIC_COLORS.income,
      bg: "rgba(74, 222, 128, 0.12)",
      ariaLabel: `Receitas do mês: ${formatBRL(monthlyIncome)}`,
    },
    {
      label: "Gastos do mês",
      value: monthlyExpenses,
      icon: <TrendingDown />,
      color: SEMANTIC_COLORS.variable,
      bg: "rgba(248, 113, 113, 0.12)",
      ariaLabel: `Gastos do mês: ${formatBRL(monthlyExpenses)}`,
    },
    {
      label: "Saldo do mês",
      value: balance,
      icon: <AccountBalance />,
      color: balancePositive ? SEMANTIC_COLORS.income : SEMANTIC_COLORS.variable,
      bg: balancePositive
        ? "rgba(74, 222, 128, 0.12)"
        : "rgba(248, 113, 113, 0.12)",
      ariaLabel: `Saldo do mês: ${formatBRL(balance)}`,
    },
    {
      label: "Total investido",
      value: totalInvested,
      icon: <Savings />,
      color: SEMANTIC_COLORS.savings,
      bg: "rgba(96, 165, 250, 0.12)",
      ariaLabel: `Total investido: ${formatBRL(totalInvested)}`,
    },
  ];

  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={2}
      mb={3}
      role="region"
      aria-label="Resumo financeiro do período selecionado"
    >
      {cards.map((card) => (
        <Paper
          key={card.label}
          aria-label={card.ariaLabel}
          sx={{
            p: 2.5,
            flex: 1,
            bgcolor: colors.paper,
            borderRadius: 3,
            border: `1px solid ${colors.border}`,
            display: "flex",
            alignItems: "center",
            gap: 2,
            minWidth: 0,
            transition: "transform 0.15s ease, box-shadow 0.15s ease",
            "&:hover": {
              transform: "translateY(-3px)",
              boxShadow: "0 10px 28px rgba(0,0,0,0.15)",
            },
          }}
        >
          <Box
            aria-hidden="true"
            sx={{
              width: 46,
              height: 46,
              borderRadius: "12px",
              bgcolor: card.bg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              color: card.color,
            }}
          >
            {card.icon}
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="caption"
              color={colors.textSecondary}
              fontWeight={600}
              sx={{
                textTransform: "uppercase",
                letterSpacing: "0.07em",
                display: "block",
              }}
            >
              {card.label}
            </Typography>
            <Typography
              variant="h6"
              fontWeight="bold"
              color={card.color}
              noWrap
            >
              {formatBRL(card.value)}
            </Typography>
          </Box>
        </Paper>
      ))}
    </Stack>
  );
}
