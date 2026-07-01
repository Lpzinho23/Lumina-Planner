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
import { Box, Button, CircularProgress, Paper, Stack, Typography } from "@mui/material";
import GridLegacy from "@mui/material/GridLegacy";
import { AccountBalanceWallet, Add } from "@mui/icons-material";

export default function AccountsPage() {
  const { user } = useAuth();
  const { colors } = useAppTheme();
  const { accounts, loading: accountsLoading } = useAccounts(user?.uid);
  const { transactions, loading: txLoading } = useTransactions(user?.uid);
  const router = useRouter();

  const loading = accountsLoading || txLoading;

  return (
    <Box>
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
        <GridLegacy container spacing={2}>
          {accounts.map((account) => {
            const balance = computeAccountBalance(account, transactions);
            return (
              <GridLegacy item xs={12} sm={6} md={4} key={account.id}>
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
                        bgcolor: `${account.color ?? colors.primary}20`,
                        color: account.color ?? colors.primary,
                      }}
                    >
                      <AccountBalanceWallet fontSize="small" />
                    </Box>
                    <Typography variant="subtitle1" fontWeight={700} color={colors.text}>
                      {account.name}
                    </Typography>
                  </Stack>
                  <Typography variant="caption" color={colors.textSecondary}>
                    Saldo disponível
                  </Typography>
                  <Typography
                    variant="h5"
                    fontWeight={800}
                    color={balance >= 0 ? colors.text : colors.danger}
                  >
                    {formatBRL(balance)}
                  </Typography>
                </Paper>
              </GridLegacy>
            );
          })}
        </GridLegacy>
      )}
    </Box>
  );
}
