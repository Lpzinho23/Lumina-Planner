"use client";

import { Box, IconButton, Paper, Stack, Typography } from "@mui/material";
import { AccountBalanceWallet, Settings } from "@mui/icons-material";
import type { AccountBlockProps } from "@/types/finance";
import { formatBRL } from "@/lib/format";
import { isExpenseType, isInvestmentType } from "@/lib/finance";

export default function AccountBlock({
  account,
  transactions,
  handleOpenAccountModal,
  colors,
}: AccountBlockProps) {
  const initial = account.initialBalance ?? 0;
  const totalIn = transactions
    .filter((t) => t.type === "income" && t.bank === account.name)
    .reduce((a, b) => a + b.amount, 0);
  const totalOut = transactions
    .filter(
      (t) =>
        isExpenseType(t.type) &&
        t.paymentMethod !== "Crédito" &&
        t.bank === account.name,
    )
    .reduce((a, b) => a + b.amount, 0);
  const totalInvestedFromHere = transactions
    .filter(
      (t) => isInvestmentType(t.type) && t.bank === account.name,
    )
    .reduce((a, b) => a + b.amount, 0);
  const currentBalance =
    initial + totalIn - totalOut - totalInvestedFromHere;
  return (
    <Paper
      sx={{
        p: 3,
        borderRadius: 3,
        bgcolor: colors.paper,
        border: `1px solid ${colors.border}`,
        height: "100%",
        position: "relative",
      }}
    >
      <IconButton
        size="small"
        onClick={() => handleOpenAccountModal(account)}
        aria-label={`Editar conta ${account.name}`}
        sx={{
          position: "absolute",
          top: 10,
          right: 10,
          color: colors.textSecondary,
        }}
      >
        <Settings fontSize="small" />
      </IconButton>
      <Stack direction="row" spacing={1.5} alignItems="center" mb={2}>
        <Box
          sx={{
            p: 1,
            borderRadius: 2,
            bgcolor: `${account.color}20`,
            color: account.color,
          }}
        >
          <AccountBalanceWallet fontSize="small" />
        </Box>
        <Typography variant="subtitle1" fontWeight="bold" color={colors.text}>
          {account.name}
        </Typography>
      </Stack>
      <Typography variant="caption" color={colors.textSecondary}>
        Saldo Disponível
      </Typography>
      <Typography
        variant="h5"
        fontWeight="bold"
        color={currentBalance >= 0 ? colors.text : "#ef4444"}
      >
        {formatBRL(currentBalance)}
      </Typography>
    </Paper>
  );
}
