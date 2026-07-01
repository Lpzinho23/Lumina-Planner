"use client";

import { useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useAppTheme } from "@/context/ThemeContext";
import { useTransactions } from "@/lib/hooks/useTransactions";
import { CATEGORIES_DEFAULT } from "@/lib/constants";
import { formatBRL } from "@/lib/format";
import { isExpenseType } from "@/lib/finance";
import PageHeader from "@/components/PageHeader";
import {
  contentGridSx,
  largeStatValueSx,
  paperCardSx,
  statValueSx,
} from "@/components/layout/shared";
import {
  Box,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { Category as CategoryIcon } from "@mui/icons-material";

export default function CategoriesPage() {
  const { user } = useAuth();
  const { colors } = useAppTheme();
  const { transactions, loading } = useTransactions(user?.uid);

  const totals = useMemo(() => {
    const map = new Map<string, number>();
    for (const cat of CATEGORIES_DEFAULT) {
      map.set(cat, 0);
    }
    for (const tx of transactions) {
      if (!isExpenseType(tx.type)) continue;
      const cat = tx.category ?? "Outros";
      map.set(cat, (map.get(cat) ?? 0) + tx.amount);
    }
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [transactions]);

  const grandTotal = totals.reduce((sum, [, value]) => sum + value, 0);

  return (
    <Box sx={{ minWidth: 0 }}>
      <PageHeader
        title="Categorias"
        subtitle="Despesas agrupadas por categoria."
        colors={colors}
      />

      {loading ? (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress aria-label="Carregando categorias" />
        </Box>
      ) : (
        <>
          <Paper sx={{ ...paperCardSx(colors), mb: 3 }}>
            <Typography variant="body2" color={colors.textSecondary}>
              Total em despesas
            </Typography>
            <Typography sx={{ ...largeStatValueSx, color: colors.text }}>
              {formatBRL(grandTotal)}
            </Typography>
          </Paper>

          <Box sx={contentGridSx}>
            {totals.map(([name, total]) => {
              const share = grandTotal > 0 ? (total / grandTotal) * 100 : 0;
              return (
                <Paper key={name} sx={paperCardSx(colors)}>
                  <Stack direction="row" spacing={1.5} alignItems="center" mb={1.5}>
                    <CategoryIcon sx={{ color: colors.primary, flexShrink: 0 }} fontSize="small" />
                    <Typography fontWeight={700} color={colors.text} sx={{ wordBreak: "break-word" }}>
                      {name}
                    </Typography>
                  </Stack>
                  <Typography sx={{ ...statValueSx, color: colors.text }}>
                    {formatBRL(total)}
                  </Typography>
                  <Chip
                    size="small"
                    label={`${share.toFixed(1)}% do total`}
                    sx={{ mt: 1, bgcolor: `${colors.primary}15`, color: colors.primary }}
                  />
                </Paper>
              );
            })}
          </Box>
        </>
      )}
    </Box>
  );
}
