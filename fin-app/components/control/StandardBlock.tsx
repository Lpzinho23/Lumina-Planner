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
  Tooltip,
  Typography,
} from "@mui/material";
import { DeleteOutline, Edit, History } from "@mui/icons-material";
import type { StandardBlockProps } from "@/types/finance";
import { formatBRL, formatDateBR } from "@/lib/format";
import { isExpenseType } from "@/lib/finance";
import { blockHeaderSx, tableContainerSx } from "@/components/layout/shared";

export default function StandardBlock({
  title,
  icon,
  color,
  data,
  type,
  columns,
  handleOpen,
  handleDelete,
  handleOpenExtract,
  colors,
  isDarkMode,
}: StandardBlockProps) {
  const total = data.reduce((acc, curr) => acc + curr.amount, 0);
  return (
    <Paper
      sx={{
        p: 0,
        mb: 4,
        borderRadius: 3,
        bgcolor: colors.paper,
        border: `1px solid ${colors.border}`,
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          ...blockHeaderSx,
          bgcolor: colors.background,
          borderBottom: `1px solid ${colors.border}`,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2} sx={{ minWidth: 0 }}>
          <Box
            sx={{
              p: 1,
              borderRadius: 2,
              bgcolor: `${color}20`,
              color,
            }}
          >
            {icon}
          </Box>
          <Typography variant="h6" component="h2" fontWeight="bold" color={colors.text}>
            {title}
          </Typography>
        </Stack>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems={{ xs: "stretch", sm: "center" }}
          spacing={2}
          sx={{ width: { xs: "100%", sm: "auto" } }}
        >
          <Typography variant="h6" fontWeight="bold" sx={{ color }}>
            {formatBRL(total)}
          </Typography>
          <Button
            variant="contained"
            size="small"
            aria-label={`Adicionar lançamento em ${title}`}
            onClick={() => handleOpen(type)}
            sx={{
              bgcolor: color,
              color: "#000",
              fontWeight: "bold",
              width: { xs: "100%", sm: "auto" },
            }}
          >
            + Adicionar
          </Button>
        </Stack>
      </Box>
      <TableContainer sx={tableContainerSx}>
        <Table size="small" sx={{ minWidth: 560 }}>
          <TableHead>
            <TableRow
              sx={{ bgcolor: isDarkMode ? "#1e2025" : "#f4f4f5" }}
            >
              {columns.map((col: string) => (
                <TableCell
                  key={col}
                  sx={{ color: colors.textSecondary, fontWeight: "bold" }}
                >
                  {col}
                </TableCell>
              ))}
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + 1}
                  align="center"
                  sx={{ py: 3, color: colors.textSecondary }}
                >
                  Sem registros.
                </TableCell>
              </TableRow>
            ) : (
              data.map((row) => (
                <TableRow
                  key={row.id}
                  hover
                  sx={{ "&:hover": { bgcolor: colors.background } }}
                >
                  {type === "savings" && (
                    <>
                      <TableCell sx={{ color: colors.text }}>
                        {row.bank}
                      </TableCell>
                      <TableCell sx={{ color: colors.textSecondary }}>
                        {row.description}
                      </TableCell>
                      <TableCell sx={{ color, fontWeight: "bold" }}>
                        {formatBRL(row.amount)}
                      </TableCell>
                      <TableCell sx={{ color: colors.textSecondary }}>
                        {row.yieldRate ? (
                          <Chip
                            label={`${row.yieldRate}% CDI`}
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: 10,
                              bgcolor: isDarkMode ? "#333" : "#e4e4e7",
                              color: "#60a5fa",
                            }}
                          />
                        ) : (
                          "-"
                        )}
                      </TableCell>
                    </>
                  )}
                  {type === "income" && (
                    <>
                      <TableCell sx={{ color: colors.text }}>
                        {row.description}
                      </TableCell>
                      <TableCell sx={{ color, fontWeight: "bold" }}>
                        {formatBRL(row.amount)}
                      </TableCell>
                      <TableCell sx={{ color: colors.textSecondary }}>
                        {formatDateBR(row.date)}
                      </TableCell>
                      <TableCell sx={{ color: colors.textSecondary }}>
                        {row.paymentMethod}
                      </TableCell>
                      <TableCell sx={{ color: colors.textSecondary }}>
                        {row.bank}
                      </TableCell>
                    </>
                  )}
                  {isExpenseType(type) && (
                    <>
                      <TableCell sx={{ color: colors.text }}>
                        {row.description}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={row.category ?? ""}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: 10,
                            bgcolor: isDarkMode ? "#333" : "#e4e4e7",
                            color: colors.text,
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ color: colors.textSecondary }}>
                        {formatDateBR(row.date)}
                      </TableCell>
                      <TableCell sx={{ color, fontWeight: "bold" }}>
                        {formatBRL(row.amount)}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={row.status ?? ""}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: 10,
                            bgcolor:
                              row.status === "Fatura Paga"
                                ? "#60a5fa"
                                : row.status === "Pago"
                                  ? "#4ade8020"
                                  : "#fbbf2420",
                            color:
                              row.status === "Fatura Paga"
                                ? "#fff"
                                : row.status === "Pago"
                                  ? "#4ade80"
                                  : "#fbbf24",
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ color: colors.textSecondary }}>
                        {row.paymentMethod}
                      </TableCell>
                      <TableCell sx={{ color: colors.textSecondary }}>
                        {row.bank}
                      </TableCell>
                    </>
                  )}
                  <TableCell align="right">
                    <Stack direction="row" justifyContent="flex-end">
                      {type === "savings" && handleOpenExtract && row.bank ? (
                        <Tooltip title="Ver Histórico">
                          <IconButton
                            size="small"
                            aria-label={`Ver histórico de ${row.bank}`}
                            onClick={() => {
                              const b = row.bank;
                              if (b) handleOpenExtract(b);
                            }}
                            sx={{
                              color: colors.textSecondary,
                              "&:hover": { color: colors.text },
                            }}
                          >
                            <History fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      ) : null}
                      <IconButton
                        size="small"
                        aria-label="Editar transação"
                        onClick={() => handleOpen(type, row)}
                        sx={{ color: colors.textSecondary }}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        aria-label="Excluir transação"
                        onClick={() => handleDelete(row.id)}
                        sx={{ color: colors.textSecondary }}
                      >
                        <DeleteOutline fontSize="small" />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
