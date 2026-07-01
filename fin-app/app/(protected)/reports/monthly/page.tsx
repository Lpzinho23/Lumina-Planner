"use client";

import { useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useAppTheme } from "@/context/ThemeContext";
import { useTransactions } from "@/lib/hooks/useTransactions";
import { MONTHS_LIST, SEMANTIC_COLORS } from "@/lib/constants";
import { formatBRL, parseISODateUTC } from "@/lib/format";
import { isExpenseType } from "@/lib/finance";
import PageHeader from "@/components/PageHeader";
import {
  filterFormControlSx,
  largeStatValueSx,
  paperCardSx,
  statValueSx,
} from "@/components/layout/shared";
import {
  Box,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";

export default function ReportsMonthlyPage() {
  const { user } = useAuth();
  const { colors } = useAppTheme();
  const { transactions, loading } = useTransactions(user?.uid);
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());

  const summary = useMemo(() => {
    let income = 0;
    let expense = 0;
    let investments = 0;
    for (const tx of transactions) {
      const d = parseISODateUTC(tx.date);
      if (d.getUTCFullYear() !== year || d.getUTCMonth() !== month) continue;
      if (tx.type === "income") income += tx.amount;
      else if (isExpenseType(tx.type)) expense += tx.amount;
      else if (tx.type === "savings" || tx.type === "piggy") investments += tx.amount;
    }
    return { income, expense, investments, balance: income - expense };
  }, [transactions, month, year]);

  const years = useMemo(() => {
    const current = new Date().getFullYear();
    return [current - 1, current, current + 1];
  }, []);

  return (
    <Box sx={{ minWidth: 0 }}>
      <PageHeader
        title="Balanço mensal"
        subtitle="Receitas, despesas e saldo do mês."
        colors={colors}
      />

      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} mb={3}>
        <FormControl size="small" sx={filterFormControlSx}>
          <InputLabel id="monthly-month-label">Mês</InputLabel>
          <Select
            labelId="monthly-month-label"
            value={month}
            label="Mês"
            onChange={(e: SelectChangeEvent<number>) => setMonth(Number(e.target.value))}
            aria-label="Selecionar mês"
          >
            {MONTHS_LIST.map((label, index) => (
              <MenuItem key={label} value={index}>
                {label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={filterFormControlSx}>
          <InputLabel id="monthly-year-label">Ano</InputLabel>
          <Select
            labelId="monthly-year-label"
            value={year}
            label="Ano"
            onChange={(e: SelectChangeEvent<number>) => setYear(Number(e.target.value))}
            aria-label="Selecionar ano"
          >
            {years.map((y) => (
              <MenuItem key={y} value={y}>
                {y}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      {loading ? (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress aria-label="Carregando balanço mensal" />
        </Box>
      ) : (
        <Stack spacing={1.5}>
          <Paper sx={paperCardSx(colors)}>
            <Typography variant="body2" color={colors.textSecondary}>Receitas</Typography>
            <Typography sx={{ ...statValueSx, color: SEMANTIC_COLORS.income }}>
              {formatBRL(summary.income)}
            </Typography>
          </Paper>
          <Paper sx={paperCardSx(colors)}>
            <Typography variant="body2" color={colors.textSecondary}>Despesas</Typography>
            <Typography sx={{ ...statValueSx, color: SEMANTIC_COLORS.variable }}>
              {formatBRL(summary.expense)}
            </Typography>
          </Paper>
          <Paper sx={paperCardSx(colors)}>
            <Typography variant="body2" color={colors.textSecondary}>Investimentos</Typography>
            <Typography sx={{ ...statValueSx, color: SEMANTIC_COLORS.savings }}>
              {formatBRL(summary.investments)}
            </Typography>
          </Paper>
          <Paper
            sx={{
              ...paperCardSx(colors),
              border: `2px solid ${summary.balance >= 0 ? SEMANTIC_COLORS.income : colors.danger}`,
            }}
          >
            <Typography variant="body2" color={colors.textSecondary}>Saldo do mês</Typography>
            <Typography
              sx={{
                ...largeStatValueSx,
                color: summary.balance >= 0 ? colors.text : colors.danger,
              }}
            >
              {formatBRL(summary.balance)}
            </Typography>
          </Paper>
        </Stack>
      )}
    </Box>
  );
}
