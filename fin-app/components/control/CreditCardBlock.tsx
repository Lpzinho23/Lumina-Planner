"use client";

import {
  Box,
  Button,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { CreditCard, Payment, Settings } from "@mui/icons-material";
import type { CreditCardBlockProps } from "@/types/finance";
import { formatBRL, parseISODateUTC } from "@/lib/format";
import { isExpenseType } from "@/lib/finance";

export default function CreditCardBlock({
  card,
  transactions,
  currentMonth,
  currentYear,
  handleOpenCardModal,
  handleOpenPayBill,
  colors,
  isDarkMode,
}: CreditCardBlockProps) {
  const totalDebt = transactions
    .filter(
      (t) =>
        t.bank === card.name &&
        t.paymentMethod === "Crédito" &&
        isExpenseType(t.type) &&
        t.status !== "Fatura Paga",
    )
    .reduce((acc, curr) => acc + curr.amount, 0);
  const currentBill = transactions
    .filter((t) => {
      const d = parseISODateUTC(t.date);
      const isCur =
        d.getUTCFullYear() < currentYear ||
        (d.getUTCFullYear() === currentYear &&
          d.getUTCMonth() <= currentMonth);
      return (
        t.bank === card.name &&
        t.paymentMethod === "Crédito" &&
        isExpenseType(t.type) &&
        t.status !== "Fatura Paga" &&
        isCur
      );
    })
    .reduce((acc, curr) => acc + curr.amount, 0);
  const percent = Math.min((totalDebt / card.limit) * 100, 100);
  const available = Math.max(0, card.limit - totalDebt);
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
        onClick={() => handleOpenCardModal(card)}
        aria-label={`Editar cartão ${card.name}`}
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
            bgcolor: `${card.color}20`,
            color: card.color,
          }}
        >
          <CreditCard fontSize="small" />
        </Box>
        <Typography variant="subtitle1" fontWeight="bold" color={colors.text}>
          {card.name}
        </Typography>
      </Stack>
      <Box mb={2}>
        <Stack direction="row" justifyContent="space-between" mb={1}>
          <Typography variant="caption" color={card.color}>
            Limite
          </Typography>
          <Typography variant="caption" color={colors.textSecondary}>
            {percent.toFixed(1)}%
          </Typography>
        </Stack>
        <LinearProgress
          variant="determinate"
          value={percent}
          sx={{
            height: 8,
            borderRadius: 4,
            bgcolor: isDarkMode ? "#333" : "#e4e4e7",
            "& .MuiLinearProgress-bar": { bgcolor: card.color },
          }}
        />
      </Box>
      <Stack direction="row" justifyContent="space-between" mb={2}>
        <Box>
          <Typography
            variant="caption"
            display="block"
            color={colors.textSecondary}
          >
            Fatura Atual
          </Typography>
          <Typography variant="h6" fontWeight="bold" color={colors.text}>
            {formatBRL(currentBill)}
          </Typography>
        </Box>
        <Box textAlign="right">
          <Typography
            variant="caption"
            display="block"
            color={colors.textSecondary}
          >
            Disponível
          </Typography>
          <Typography variant="h6" fontWeight="bold" color={card.color}>
            {formatBRL(available)}
          </Typography>
        </Box>
      </Stack>
      <Button
        variant="outlined"
        fullWidth
        size="small"
        startIcon={<Payment />}
        aria-label={`Pagar fatura do cartão ${card.name}`}
        onClick={() => handleOpenPayBill(card)}
        disabled={currentBill <= 0}
        sx={{
          borderColor: colors.border,
          color: colors.text,
          "&:hover": {
            borderColor: card.color,
            bgcolor: `${card.color}10`,
          },
        }}
      >
        Pagar Fatura
      </Button>
    </Paper>
  );
}
