"use client";

import {
  Box,
  Chip,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import type { ThemeColors } from "@/context/ThemeContext";
import type { TransactionRecord, TransactionType } from "@/types/finance";
import { SEMANTIC_COLORS } from "@/lib/constants";
import { formatBRL, formatDateBR } from "@/lib/format";
import { isExpenseType } from "@/lib/finance";
import { paperCardSx } from "@/components/layout/shared";

type Props = {
  items: TransactionRecord[];
  typeLabels: Record<TransactionType, string>;
  colors: ThemeColors;
};

export default function TransactionViews({ items, typeLabels, colors }: Props) {
  return (
    <>
      <Stack spacing={1.5} sx={{ display: { xs: "flex", md: "none" } }}>
        {items.map((tx) => {
          const isExpense = isExpenseType(tx.type);
          return (
            <Paper key={tx.id} sx={paperCardSx(colors)}>
              <Stack spacing={1}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="flex-start"
                  gap={1}
                >
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography fontWeight={700} color={colors.text} sx={{ wordBreak: "break-word" }}>
                      {tx.description || "Sem descrição"}
                    </Typography>
                    <Typography variant="caption" color={colors.textSecondary}>
                      {formatDateBR(tx.date)}
                      {tx.category ? ` · ${tx.category}` : ""}
                    </Typography>
                  </Box>
                  <Typography
                    fontWeight={800}
                    sx={{
                      flexShrink: 0,
                      color: isExpense ? colors.danger : SEMANTIC_COLORS.income,
                    }}
                  >
                    {isExpense ? "-" : "+"}
                    {formatBRL(tx.amount)}
                  </Typography>
                </Stack>
                <Chip
                  size="small"
                  label={typeLabels[tx.type]}
                  sx={{
                    alignSelf: "flex-start",
                    bgcolor: isExpense ? `${colors.danger}20` : `${SEMANTIC_COLORS.income}20`,
                    color: isExpense ? colors.danger : SEMANTIC_COLORS.income,
                  }}
                />
              </Stack>
            </Paper>
          );
        })}
      </Stack>

      <TableContainer
        component={Paper}
        sx={{
          display: { xs: "none", md: "block" },
          bgcolor: colors.paper,
          border: `1px solid ${colors.border}`,
          borderRadius: 3,
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <Table aria-label="Lista de transações" sx={{ minWidth: 640 }}>
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
            {items.map((tx) => {
              const isExpense = isExpenseType(tx.type);
              return (
                <TableRow key={tx.id} hover>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>{formatDateBR(tx.date)}</TableCell>
                  <TableCell sx={{ maxWidth: 220, wordBreak: "break-word" }}>
                    {tx.description || "—"}
                  </TableCell>
                  <TableCell>{tx.category || "—"}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={typeLabels[tx.type]}
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
                      whiteSpace: "nowrap",
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
    </>
  );
}
