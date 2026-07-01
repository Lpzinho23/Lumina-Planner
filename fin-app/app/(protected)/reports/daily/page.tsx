"use client";

import { useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useAppTheme } from "@/context/ThemeContext";
import { useTransactions } from "@/lib/hooks/useTransactions";
import { SEMANTIC_COLORS } from "@/lib/constants";
import { formatBRL, formatDateBR } from "@/lib/format";
import { isExpenseType } from "@/lib/finance";
import PageHeader from "@/components/PageHeader";
import {
  Box,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

function todayISO(): string {
  return new Date().toISOString().split("T")[0];
}

export default function ReportsDailyPage() {
  const { user } = useAuth();
  const { colors } = useAppTheme();
  const { transactions, loading } = useTransactions(user?.uid);
  const today = todayISO();

  const dayTransactions = useMemo(
    () => transactions.filter((t) => t.date === today),
    [transactions, today],
  );

  const summary = useMemo(() => {
    let income = 0;
    let expense = 0;
    for (const tx of dayTransactions) {
      if (tx.type === "income") income += tx.amount;
      else if (isExpenseType(tx.type)) expense += tx.amount;
    }
    return { income, expense, balance: income - expense };
  }, [dayTransactions]);

  return (
    <Box>
      <PageHeader
        title="Resumo diário"
        subtitle={`Movimentações de ${formatDateBR(today)}`}
        colors={colors}
      />

      {loading ? (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress aria-label="Carregando resumo diário" />
        </Box>
      ) : (
        <>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mb={3}>
            <Paper sx={{ p: 2.5, flex: 1, bgcolor: colors.paper, border: `1px solid ${colors.border}`, borderRadius: 2 }}>
              <Typography variant="body2" color={colors.textSecondary}>Receitas</Typography>
              <Typography variant="h5" fontWeight={800} color={SEMANTIC_COLORS.income}>
                {formatBRL(summary.income)}
              </Typography>
            </Paper>
            <Paper sx={{ p: 2.5, flex: 1, bgcolor: colors.paper, border: `1px solid ${colors.border}`, borderRadius: 2 }}>
              <Typography variant="body2" color={colors.textSecondary}>Despesas</Typography>
              <Typography variant="h5" fontWeight={800} color={SEMANTIC_COLORS.variable}>
                {formatBRL(summary.expense)}
              </Typography>
            </Paper>
            <Paper sx={{ p: 2.5, flex: 1, bgcolor: colors.paper, border: `1px solid ${colors.border}`, borderRadius: 2 }}>
              <Typography variant="body2" color={colors.textSecondary}>Saldo do dia</Typography>
              <Typography
                variant="h5"
                fontWeight={800}
                color={summary.balance >= 0 ? colors.text : colors.danger}
              >
                {formatBRL(summary.balance)}
              </Typography>
            </Paper>
          </Stack>

          {dayTransactions.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: "center", bgcolor: colors.paper, border: `1px solid ${colors.border}`, borderRadius: 3 }}>
              <Typography color={colors.textSecondary}>Nenhuma movimentação hoje.</Typography>
            </Paper>
          ) : (
            <Stack spacing={1.5}>
              {dayTransactions.map((tx) => {
                const isExpense = isExpenseType(tx.type);
                return (
                  <Paper
                    key={tx.id}
                    sx={{
                      p: 2,
                      bgcolor: colors.paper,
                      border: `1px solid ${colors.border}`,
                      borderRadius: 2,
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography fontWeight={700} color={colors.text}>
                          {tx.description || "Sem descrição"}
                        </Typography>
                        <Typography variant="caption" color={colors.textSecondary}>
                          {tx.category || "Sem categoria"}
                        </Typography>
                      </Box>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip
                          size="small"
                          label={isExpense ? "Despesa" : "Receita"}
                          sx={{
                            bgcolor: isExpense ? `${colors.danger}20` : `${SEMANTIC_COLORS.income}20`,
                            color: isExpense ? colors.danger : SEMANTIC_COLORS.income,
                          }}
                        />
                        <Typography
                          fontWeight={800}
                          color={isExpense ? colors.danger : SEMANTIC_COLORS.income}
                        >
                          {isExpense ? "-" : "+"}
                          {formatBRL(tx.amount)}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Paper>
                );
              })}
            </Stack>
          )}
        </>
      )}
    </Box>
  );
}
