"use client";

import { useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useAppTheme } from "@/context/ThemeContext";
import { useTransactions } from "@/lib/hooks/useTransactions";
import { CATEGORIES_DEFAULT, MONTHS_LIST } from "@/lib/constants";
import { formatBRL, parseISODateUTC } from "@/lib/format";
import { isExpenseType } from "@/lib/finance";
import PageHeader from "@/components/PageHeader";
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
  LinearProgress,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";

const DEFAULT_BUDGET = 1500;

export default function BudgetsPage() {
  const { user } = useAuth();
  const { colors } = useAppTheme();
  const { transactions, loading } = useTransactions(user?.uid);
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());

  const categorySpending = useMemo(() => {
    const map = new Map<string, number>();
    for (const cat of CATEGORIES_DEFAULT) {
      map.set(cat, 0);
    }
    for (const tx of transactions) {
      if (!isExpenseType(tx.type)) continue;
      const d = parseISODateUTC(tx.date);
      if (d.getUTCFullYear() !== year || d.getUTCMonth() !== month) continue;
      const cat = tx.category ?? "Outros";
      map.set(cat, (map.get(cat) ?? 0) + tx.amount);
    }
    return CATEGORIES_DEFAULT.map((name) => ({
      name,
      spent: map.get(name) ?? 0,
    })).sort((a, b) => b.spent - a.spent);
  }, [transactions, month, year]);

  const handleMonthChange = (e: SelectChangeEvent<number>) => {
    setMonth(Number(e.target.value));
  };

  const handleYearChange = (e: SelectChangeEvent<number>) => {
    setYear(Number(e.target.value));
  };

  const years = useMemo(() => {
    const current = new Date().getFullYear();
    return [current - 1, current, current + 1];
  }, []);

  return (
    <Box>
      <PageHeader
        title="Orçamentos"
        subtitle="Acompanhe o gasto por categoria no mês selecionado."
        colors={colors}
      />

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mb={3}>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel id="budget-month-label">Mês</InputLabel>
          <Select
            labelId="budget-month-label"
            value={month}
            label="Mês"
            onChange={handleMonthChange}
            aria-label="Selecionar mês do orçamento"
          >
            {MONTHS_LIST.map((label, index) => (
              <MenuItem key={label} value={index}>
                {label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel id="budget-year-label">Ano</InputLabel>
          <Select
            labelId="budget-year-label"
            value={year}
            label="Ano"
            onChange={handleYearChange}
            aria-label="Selecionar ano do orçamento"
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
          <CircularProgress aria-label="Carregando orçamentos" />
        </Box>
      ) : (
        <Stack spacing={2}>
          {categorySpending.map(({ name, spent }) => {
            const percent = Math.min((spent / DEFAULT_BUDGET) * 100, 100);
            const overBudget = spent > DEFAULT_BUDGET;
            return (
              <Paper
                key={name}
                sx={{
                  p: 2.5,
                  bgcolor: colors.paper,
                  border: `1px solid ${colors.border}`,
                  borderRadius: 2,
                }}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={1}
                >
                  <Typography fontWeight={700} color={colors.text}>
                    {name}
                  </Typography>
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    color={overBudget ? colors.danger : colors.textSecondary}
                  >
                    {formatBRL(spent)} / {formatBRL(DEFAULT_BUDGET)}
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={percent}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: colors.border,
                    "& .MuiLinearProgress-bar": {
                      bgcolor: overBudget ? colors.danger : colors.primary,
                    },
                  }}
                  aria-label={`${name}: ${Math.round(percent)}% do orçamento`}
                />
              </Paper>
            );
          })}
        </Stack>
      )}
    </Box>
  );
}
