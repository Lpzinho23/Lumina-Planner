"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useAppTheme } from "@/context/ThemeContext";
import { useCards } from "@/lib/hooks/useCards";
import { useTransactions } from "@/lib/hooks/useTransactions";
import { computeCardDebt } from "@/lib/finance";
import { SEMANTIC_COLORS } from "@/lib/constants";
import { formatBRL } from "@/lib/format";
import PageHeader from "@/components/PageHeader";
import {
  contentGridSx,
  emptyPaperSx,
  paperCardSx,
  statValueSx,
} from "@/components/layout/shared";
import {
  Box,
  Button,
  CircularProgress,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { Add, CreditCard } from "@mui/icons-material";

export default function CardsPage() {
  const { user } = useAuth();
  const { colors } = useAppTheme();
  const { cards, loading: cardsLoading } = useCards(user?.uid);
  const { transactions, loading: txLoading } = useTransactions(user?.uid);
  const router = useRouter();

  const loading = cardsLoading || txLoading;

  return (
    <Box sx={{ minWidth: 0 }}>
      <PageHeader
        title="Cartões de crédito"
        subtitle="Limite, fatura atual e saldo disponível."
        colors={colors}
        action={
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => router.push("/control")}
            aria-label="Gerenciar cartões no fluxo de caixa"
            sx={{ bgcolor: colors.primary }}
          >
            Gerenciar cartões
          </Button>
        }
      />

      {loading ? (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress aria-label="Carregando cartões" />
        </Box>
      ) : cards.length === 0 ? (
        <Paper sx={emptyPaperSx(colors)}>
          <Typography color={colors.textSecondary} mb={2}>
            Nenhum cartão cadastrado ainda.
          </Typography>
          <Button component={Link} href="/control" variant="outlined">
            Cadastrar cartão
          </Button>
        </Paper>
      ) : (
        <Box sx={contentGridSx}>
          {cards.map((card) => {
            const debt = computeCardDebt(card, transactions);
            const available = Math.max(0, card.limit - debt);
            const percent = card.limit > 0 ? Math.min((debt / card.limit) * 100, 100) : 0;
            return (
              <Paper key={card.id} sx={paperCardSx(colors)}>
                <Stack direction="row" spacing={1.5} alignItems="center" mb={2}>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 2,
                      flexShrink: 0,
                      bgcolor: `${card.color ?? colors.primary}20`,
                      color: card.color ?? colors.primary,
                    }}
                  >
                    <CreditCard fontSize="small" />
                  </Box>
                  <Typography
                    variant="subtitle1"
                    fontWeight={700}
                    color={colors.text}
                    sx={{ wordBreak: "break-word" }}
                  >
                    {card.name}
                  </Typography>
                </Stack>
                <Stack spacing={1.5}>
                  <Box>
                    <Typography variant="caption" color={colors.textSecondary}>
                      Fatura em aberto
                    </Typography>
                    <Typography sx={{ ...statValueSx, fontSize: { xs: "1.15rem", sm: "1.35rem" } }} color={colors.text}>
                      {formatBRL(debt)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color={colors.textSecondary}>
                      Disponível
                    </Typography>
                    <Typography variant="body1" fontWeight={600} color={SEMANTIC_COLORS.income}>
                      {formatBRL(available)}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={percent}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: colors.border,
                      "& .MuiLinearProgress-bar": {
                        bgcolor: percent > 80 ? colors.danger : card.color ?? colors.primary,
                      },
                    }}
                    aria-label={`Uso do limite: ${Math.round(percent)}%`}
                  />
                  <Typography variant="caption" color={colors.textSecondary}>
                    Limite: {formatBRL(card.limit)}
                  </Typography>
                </Stack>
              </Paper>
            );
          })}
        </Box>
      )}
    </Box>
  );
}
