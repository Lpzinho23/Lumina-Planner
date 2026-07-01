"use client";

import { useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useAppTheme } from "@/context/ThemeContext";
import { useTransactions } from "@/lib/hooks/useTransactions";
import { SEMANTIC_COLORS } from "@/lib/constants";
import { formatBRL } from "@/lib/format";
import { isExpenseType, isInvestmentType } from "@/lib/finance";
import PageHeader from "@/components/PageHeader";
import { largeStatValueSx, paperCardSx, statValueSx } from "@/components/layout/shared";
import {
  Box,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

export default function ReportsTotalPage() {
  const { user } = useAuth();
  const { colors } = useAppTheme();
  const { transactions, loading } = useTransactions(user?.uid);

  const totals = useMemo(() => {
    let income = 0;
    let expense = 0;
    let investments = 0;
    for (const tx of transactions) {
      if (tx.type === "income") income += tx.amount;
      else if (isExpenseType(tx.type)) expense += tx.amount;
      else if (isInvestmentType(tx.type)) investments += tx.amount;
    }
    return {
      income,
      expense,
      investments,
      netWorth: income - expense,
      count: transactions.length,
    };
  }, [transactions]);

  return (
    <Box sx={{ minWidth: 0 }}>
      <PageHeader
        title="Total geral"
        subtitle="Consolidado de todas as movimentações registradas."
        colors={colors}
      />

      {loading ? (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress aria-label="Carregando totais" />
        </Box>
      ) : (
        <Paper sx={paperCardSx(colors)}>
          <Stack spacing={2.5}>
            <Box>
              <Typography variant="body2" color={colors.textSecondary}>
                Total de lançamentos
              </Typography>
              <Typography variant="h6" fontWeight={700} color={colors.text}>
                {totals.count}
              </Typography>
            </Box>
            <Divider sx={{ borderColor: colors.border }} />
            <Box>
              <Typography variant="body2" color={colors.textSecondary}>
                Receitas acumuladas
              </Typography>
              <Typography sx={{ ...statValueSx, color: SEMANTIC_COLORS.income }}>
                {formatBRL(totals.income)}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color={colors.textSecondary}>
                Despesas acumuladas
              </Typography>
              <Typography sx={{ ...statValueSx, color: SEMANTIC_COLORS.variable }}>
                {formatBRL(totals.expense)}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color={colors.textSecondary}>
                Investimentos acumulados
              </Typography>
              <Typography sx={{ ...statValueSx, color: SEMANTIC_COLORS.savings }}>
                {formatBRL(totals.investments)}
              </Typography>
            </Box>
            <Divider sx={{ borderColor: colors.border }} />
            <Box>
              <Typography variant="body2" color={colors.textSecondary}>
                Resultado líquido (receitas − despesas)
              </Typography>
              <Typography
                sx={{
                  ...largeStatValueSx,
                  color: totals.netWorth >= 0 ? colors.text : colors.danger,
                }}
              >
                {formatBRL(totals.netWorth)}
              </Typography>
            </Box>
          </Stack>
        </Paper>
      )}
    </Box>
  );
}
