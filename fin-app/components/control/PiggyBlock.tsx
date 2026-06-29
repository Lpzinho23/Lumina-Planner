"use client";

import {
  Box,
  Button,
  Chip,
  IconButton,
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
import { DeleteOutline, Edit, Savings } from "@mui/icons-material";
import type { PiggyBlockProps } from "@/types/finance";
import {
  CDI_ANUAL_ATUAL,
  META_MENSAL_PIGGY,
  MONTHS_LIST,
} from "@/lib/constants";
import { formatBRL, parseISODateUTC } from "@/lib/format";

export default function PiggyBlock({
  data,
  handleOpen,
  handleDelete,
  colors,
  isDarkMode,
  cdiPercentage,
  currentYear,
}: PiggyBlockProps) {
  const total = data.reduce((acc, curr) => acc + curr.amount, 0);
  const monthlyRate = Math.pow(1 + CDI_ANUAL_ATUAL / 100, 1 / 12) - 1;
  const usersYieldRate = monthlyRate * (cdiPercentage / 100);
  const estimatedYield = total * usersYieldRate;

  return (
    <Paper
      sx={{
        p: 0,
        mb: 4,
        borderRadius: 3,
        bgcolor: colors.paper,
        border: `1px solid ${colors.border}`,
      }}
    >
      <Box
        p={2}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        bgcolor={colors.background}
        borderBottom={`1px solid ${colors.border}`}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          <Box
            sx={{
              p: 1,
              borderRadius: 2,
              bgcolor: "#f472b620",
              color: "#f472b6",
            }}
          >
            <Savings />
          </Box>
          <Typography variant="h6" component="h2" fontWeight="bold" color={colors.text}>
            Cofrinho ({currentYear})
          </Typography>
        </Stack>
        <Stack direction="row" alignItems="center" spacing={3}>
          <Box textAlign="right">
            <Typography
              variant="caption"
              display="block"
              color={colors.textSecondary}
            >
              Rendimento Est. (Global)
            </Typography>
            <Typography variant="body2" fontWeight="bold" color="#4ade80">
              + {formatBRL(estimatedYield)}
            </Typography>
          </Box>
        </Stack>
      </Box>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow
              sx={{ bgcolor: isDarkMode ? "#1e2025" : "#f4f4f5" }}
            >
              <TableCell sx={{ color: colors.textSecondary }}>Mês</TableCell>
              <TableCell sx={{ color: colors.textSecondary }}>Banco</TableCell>
              <TableCell sx={{ color: colors.textSecondary }}>Valor</TableCell>
              <TableCell sx={{ color: colors.textSecondary }}>
                Rendimento
              </TableCell>
              <TableCell sx={{ color: colors.textSecondary }}>Meta</TableCell>
              <TableCell sx={{ color: colors.textSecondary }}>Status</TableCell>
              <TableCell align="right">Ação</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {MONTHS_LIST.map((month, index) => {
              const entry = data.find(
                (t) => parseISODateUTC(t.date).getUTCMonth() === index,
              );
              const val = entry ? entry.amount : 0;
              return (
                <TableRow
                  key={month}
                  sx={{ "&:hover": { bgcolor: colors.background } }}
                >
                  <TableCell sx={{ color: colors.text }}>{month}</TableCell>
                  <TableCell sx={{ color: colors.textSecondary }}>
                    {entry ? entry.bank || "-" : "-"}
                  </TableCell>
                  <TableCell
                    sx={{ color: entry ? "#f472b6" : colors.textSecondary }}
                  >
                    {entry ? formatBRL(val) : "-"}
                  </TableCell>
                  <TableCell sx={{ color: colors.textSecondary }}>
                    {entry && entry.yieldRate ? (
                      <Chip
                        label={`${entry.yieldRate}% CDI`}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: 10,
                          bgcolor: isDarkMode ? "#333" : "#e4e4e7",
                          color: "#f472b6",
                        }}
                      />
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell
                    sx={{ color: colors.textSecondary, fontSize: 12 }}
                  >
                    {formatBRL(META_MENSAL_PIGGY)}
                  </TableCell>
                  <TableCell>
                    {entry ? (
                      val >= META_MENSAL_PIGGY ? (
                        <Chip
                          label="Sim"
                          size="small"
                          sx={{ bgcolor: "#4ade8020", color: "#4ade80" }}
                        />
                      ) : (
                        <Chip
                          label="Não"
                          size="small"
                          sx={{ bgcolor: "#f8717120", color: "#f87171" }}
                        />
                      )
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell align="right">
                    {entry ? (
                      <Stack direction="row" justifyContent="flex-end">
                        <IconButton
                          size="small"
                          aria-label={`Editar cofrinho de ${month}`}
                          onClick={() => handleOpen("piggy", entry)}
                          sx={{ color: colors.textSecondary }}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          aria-label={`Excluir lançamento do cofrinho em ${month}`}
                          onClick={() => handleDelete(entry.id)}
                          sx={{ color: colors.textSecondary }}
                        >
                          <DeleteOutline fontSize="small" />
                        </IconButton>
                      </Stack>
                    ) : (
                      <Button
                        size="small"
                        variant="outlined"
                        color="secondary"
                        aria-label={`Adicionar aporte ao cofrinho em ${month}`}
                        sx={{ borderColor: "#f472b6", color: "#f472b6" }}
                        onClick={() => handleOpen("piggy")}
                      >
                        Add
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
