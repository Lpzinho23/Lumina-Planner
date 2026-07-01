"use client";

import { Box, IconButton, Paper, Stack, Typography } from "@mui/material";
import { DragIndicator } from "@mui/icons-material";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ThemeColors } from "@/context/ThemeContext";
import { SEMANTIC_COLORS } from "@/lib/constants";
import { createCustomTooltipContent } from "./CustomTooltip";

export type YearlyTrendRow = {
  name: string;
  Entradas: number;
  Saídas: number;
  Saldo: number;
  Lucro: number;
};

type Props = {
  yearlyTrendData: YearlyTrendRow[];
  currentYear: number;
  colors: ThemeColors;
  isDarkMode: boolean;
};

export default function EvolucaoFinanceira({
  yearlyTrendData,
  currentYear,
  colors,
  isDarkMode,
}: Props) {
  return (
    <Paper
      sx={{
        p: 2,
        bgcolor: colors.paper,
        borderRadius: 4,
        height: "100%",
        border: `1px solid ${colors.border}`,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
        <Typography variant="h6" component="h2" fontWeight="bold" color={colors.text}>
          Evolução Financeira ({currentYear})
        </Typography>
        <IconButton
          size="small"
          className="drag-handle"
          aria-label="Arrastar gráfico de evolução financeira"
          sx={{ cursor: "grab" }}
        >
          <DragIndicator />
        </IconButton>
      </Stack>
      <Box sx={{ flexGrow: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={yearlyTrendData}
            margin={{ top: 10, right: 10, bottom: 0, left: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke={isDarkMode ? "#333" : "#f0f0f0"}
            />
            <XAxis dataKey="name" stroke={colors.textSecondary} />
            <YAxis stroke={colors.textSecondary} />
            <RechartsTooltip content={createCustomTooltipContent(isDarkMode, colors)} />
            <Legend />
            <Bar
              dataKey="Entradas"
              fill={SEMANTIC_COLORS.income}
              radius={[4, 4, 0, 0]}
              barSize={20}
            />
            <Bar
              dataKey="Saídas"
              fill={SEMANTIC_COLORS.variable}
              radius={[4, 4, 0, 0]}
              barSize={20}
            />
            <Line
              type="monotone"
              dataKey="Saldo"
              stroke={SEMANTIC_COLORS.balance}
              strokeWidth={3}
              dot={{ r: 4, fill: SEMANTIC_COLORS.balance }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
}
