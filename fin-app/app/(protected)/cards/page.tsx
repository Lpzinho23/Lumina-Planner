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
  Box,
  Button,
  CircularProgress,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import GridLegacy from "@mui/material/GridLegacy";
import { Add, CreditCard } from "@mui/icons-material";

export default function CardsPage() {
  const { user } = useAuth();
  const { colors } = useAppTheme();
  const { cards, loading: cardsLoading } = useCards(user?.uid);
  const { transactions, loading: txLoading } = useTransactions(user?.uid);
  const router = useRouter();

  const loading = cardsLoading || txLoading;

  return (
    <Box>
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
        <Paper
          sx={{
            p: 4,
            textAlign: "center",
            bgcolor: colors.paper,
            border: `1px solid ${colors.border}`,
            borderRadius: 3,
          }}
        >
          <Typography color={colors.textSecondary} mb={2}>
            Nenhum cartão cadastrado ainda.
          </Typography>
          <Button component={Link} href="/control" variant="outlined">
            Cadastrar cartão
          </Button>
        </Paper>
      ) : (
        <GridLegacy container spacing={2}>
          {cards.map((card) => {
            const debt = computeCardDebt(card, transactions);
            const available = Math.max(0, card.limit - debt);
            const percent = card.limit > 0 ? Math.min((debt / card.limit) * 100, 100) : 0;
            return (
              <GridLegacy item xs={12} sm={6} md={4} key={card.id}>
                <Paper
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    bgcolor: colors.paper,
                    border: `1px solid ${colors.border}`,
                    height: "100%",
                  }}
                >
                  <Stack direction="row" spacing={1.5} alignItems="center" mb={2}>
                    <Box
                      sx={{
                        p: 1,
                        borderRadius: 2,
                        bgcolor: `${card.color ?? colors.primary}20`,
                        color: card.color ?? colors.primary,
                      }}
                    >
                      <CreditCard fontSize="small" />
                    </Box>
                    <Typography variant="subtitle1" fontWeight={700} color={colors.text}>
                      {card.name}
                    </Typography>
                  </Stack>
                  <Stack spacing={1.5}>
                    <Box>
                      <Typography variant="caption" color={colors.textSecondary}>
                        Fatura em aberto
                      </Typography>
                      <Typography variant="h6" fontWeight={800} color={colors.text}>
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
              </GridLegacy>
            );
          })}
        </GridLegacy>
      )}
    </Box>
  );
}
