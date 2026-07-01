"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useAppTheme } from "@/context/ThemeContext";
import { useTransactions } from "@/lib/hooks/useTransactions";
import PageHeader from "@/components/PageHeader";
import TransactionViews from "@/components/transactions/TransactionViews";
import { emptyPaperSx, filterFormControlSx, paperCardSx } from "@/components/layout/shared";
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Typography,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";
import { Add } from "@mui/icons-material";
import type { TransactionType } from "@/types/finance";

const TYPE_LABELS: Record<TransactionType, string> = {
  income: "Receita",
  expense_fixed: "Despesa fixa",
  expense_variable: "Despesa",
  savings: "Investimento",
  piggy: "Cofrinho",
};

export default function TransactionsPage() {
  const { user } = useAuth();
  const { colors } = useAppTheme();
  const { transactions, loading } = useTransactions(user?.uid);
  const router = useRouter();
  const [typeFilter, setTypeFilter] = useState<"all" | TransactionType>("all");

  const filtered = useMemo(() => {
    if (typeFilter === "all") return transactions;
    return transactions.filter((t) => t.type === typeFilter);
  }, [transactions, typeFilter]);

  const handleFilterChange = (event: SelectChangeEvent<string>) => {
    setTypeFilter(event.target.value as "all" | TransactionType);
  };

  return (
    <Box sx={{ minWidth: 0 }}>
      <PageHeader
        title="Transações"
        subtitle="Histórico completo de receitas, despesas e investimentos."
        colors={colors}
        action={
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => router.push("/control?open=expense")}
            aria-label="Nova transação"
            sx={{ bgcolor: colors.primary }}
          >
            Nova transação
          </Button>
        }
      />

      <Paper sx={{ ...paperCardSx(colors), mb: 2, p: { xs: 1.5, sm: 2 } }}>
        <FormControl size="small" sx={filterFormControlSx}>
          <InputLabel id="type-filter-label">Tipo</InputLabel>
          <Select
            labelId="type-filter-label"
            value={typeFilter}
            label="Tipo"
            onChange={handleFilterChange}
            aria-label="Filtrar por tipo de transação"
          >
            <MenuItem value="all">Todos</MenuItem>
            {(Object.keys(TYPE_LABELS) as TransactionType[]).map((key) => (
              <MenuItem key={key} value={key}>
                {TYPE_LABELS[key]}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>

      {loading ? (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress aria-label="Carregando transações" />
        </Box>
      ) : filtered.length === 0 ? (
        <Paper sx={emptyPaperSx(colors)}>
          <Typography color={colors.textSecondary}>
            Nenhuma transação encontrada.
          </Typography>
        </Paper>
      ) : (
        <TransactionViews items={filtered} typeLabels={TYPE_LABELS} colors={colors} />
      )}
    </Box>
  );
}
