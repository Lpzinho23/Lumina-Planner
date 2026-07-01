"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useAppTheme } from "@/context/ThemeContext";
import { useAccounts } from "@/lib/hooks/useAccounts";
import { useTransactions } from "@/lib/hooks/useTransactions";
import { computeAccountBalance } from "@/lib/finance";
import { formatBRL } from "@/lib/format";
import PageHeader from "@/components/PageHeader";
import {
  contentGridSx,
  emptyPaperSx,
  paperCardSx,
  statValueSx,
} from "@/components/layout/shared";
import { Box, Button, CircularProgress, Paper, Stack, Typography } from "@mui/material";
import { AccountBalanceWallet, Add } from "@mui/icons-material";

export default function AccountsPage() {
  const { user } = useAuth();
  const { colors } = useAppTheme();
  const { accounts, loading: accountsLoading } = useAccounts(user?.uid);
  const { transactions, loading: txLoading } = useTransactions(user?.uid);
  const router = useRouter();

  const loading = accountsLoading || txLoading;

  return (
    <Box sx={{ minWidth: 0 }}>
      <PageHeader
        title="Contas"
        subtitle="Saldo disponível em cada conta bancária."
        colors={colors}
        action={
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => router.push("/control")}
            aria-label="Gerenciar contas no fluxo de caixa"
            sx={{ bgcolor: colors.primary }}
          >
            Gerenciar contas
          </Button>
        }
      />

      {loading ? (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress aria-label="Carregando contas" />
        </Box>
      ) : accounts.length === 0 ? (
        <Paper sx={emptyPaperSx(colors)}>
          <Typography color={colors.textSecondary} mb={2}>
            Nenhuma conta cadastrada ainda.
          </Typography>
          <Button
            component={Link}
            href="/control"
            variant="outlined"
            aria-label="Cadastrar primeira conta"
          >
            Cadastrar no fluxo de caixa
          </Button>
        </Paper>
      ) : (
        <Box sx={contentGridSx}>
          {accounts.map((account) => {
            const balance = computeAccountBalance(account, transactions);
            return (
              <Paper key={account.id} sx={paperCardSx(colors)}>
                <Stack direction="row" spacing={1.5} alignItems="center" mb={2}>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 2,
                      flexShrink: 0,
                      bgcolor: `${account.color ?? colors.primary}20`,
                      color: account.color ?? colors.primary,
                    }}
                  >
                    <AccountBalanceWallet fontSize="small" />
                  </Box>
                  <Typography
                    variant="subtitle1"
                    fontWeight={700}
                    color={colors.text}
                    sx={{ wordBreak: "break-word" }}
                  >
                    {account.name}
                  </Typography>
                </Stack>
                <Typography variant="caption" color={colors.textSecondary}>
                  Saldo disponível
                </Typography>
                <Typography
                  sx={{
                    ...statValueSx,
                    color: balance >= 0 ? colors.text : colors.danger,
                  }}
                >
                  {formatBRL(balance)}
                </Typography>
              </Paper>
            );
          })}
        </Box>
      )}
    </Box>
  );
}
