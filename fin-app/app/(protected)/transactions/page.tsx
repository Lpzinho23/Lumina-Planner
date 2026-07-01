"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useAppTheme } from "@/context/ThemeContext";
import { useTransactions } from "@/lib/hooks/useTransactions";
import { formatBRL, formatDateBR } from "@/lib/format";
import { SEMANTIC_COLORS } from "@/lib/constants";
import { isExpenseType } from "@/lib/finance";
import PageHeader from "@/components/PageHeader";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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
    <Box>
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

      <Paper
        sx={{
          p: 2,
          mb: 2,
          bgcolor: colors.paper,
          border: `1px solid ${colors.border}`,
          borderRadius: 2,
        }}
      >
        <FormControl size="small" sx={{ minWidth: 200 }}>
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
        <Paper
          sx={{
            p: 4,
            textAlign: "center",
            bgcolor: colors.paper,
            border: `1px solid ${colors.border}`,
            borderRadius: 3,
          }}
        >
          <Typography color={colors.textSecondary}>
            Nenhuma transação encontrada.
          </Typography>
        </Paper>
      ) : (
        <TableContainer
          component={Paper}
          sx={{
            bgcolor: colors.paper,
            border: `1px solid ${colors.border}`,
            borderRadius: 3,
          }}
        >
          <Table aria-label="Lista de transações">
            <TableHead>
              <TableRow>
                <TableCell>Data</TableCell>
                <TableCell>Descrição</TableCell>
                <TableCell>Categoria</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell align="right">Valor</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((tx) => {
                const isExpense = isExpenseType(tx.type);
                return (
                  <TableRow key={tx.id} hover>
                    <TableCell>{formatDateBR(tx.date)}</TableCell>
                    <TableCell>{tx.description || "—"}</TableCell>
                    <TableCell>{tx.category || "—"}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={TYPE_LABELS[tx.type]}
                        sx={{
                          bgcolor: isExpense ? `${colors.danger}20` : `${SEMANTIC_COLORS.income}20`,
                          color: isExpense ? colors.danger : SEMANTIC_COLORS.income,
                        }}
                      />
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        fontWeight: 700,
                        color: isExpense ? colors.danger : SEMANTIC_COLORS.income,
                      }}
                    >
                      {isExpense ? "-" : "+"}
                      {formatBRL(tx.amount)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
