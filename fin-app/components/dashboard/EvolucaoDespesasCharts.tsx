"use client";

import { Box, IconButton, Paper, Stack, Typography } from "@mui/material";
import { DragIndicator } from "@mui/icons-material";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ThemeColors } from "@/context/ThemeContext";
import { SEMANTIC_COLORS } from "@/lib/constants";
import type { YearlyTrendRow } from "./EvolucaoFinanceira";
import CustomTooltip from "./CustomTooltip";

type Props = {
  yearlyTrendData: YearlyTrendRow[];
  colors: ThemeColors;
  isDarkMode: boolean;
};

export default function EvolucaoDespesasCharts({
  yearlyTrendData,
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
          Evolução Despesas
        </Typography>
        <IconButton
          size="small"
          className="drag-handle"
          aria-label="Arrastar gráfico evolução das despesas"
          sx={{ cursor: "grab" }}
        >
          <DragIndicator />
        </IconButton>
      </Stack>
      <Box sx={{ flexGrow: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={yearlyTrendData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke={isDarkMode ? "#333" : "#f0f0f0"}
            />
            <XAxis dataKey="name" stroke={colors.textSecondary} fontSize={12} />
            <YAxis stroke={colors.textSecondary} fontSize={12} />
            <RechartsTooltip
              content={(props) => (
                <CustomTooltip {...props} isDarkMode={isDarkMode} colors={colors} />
              )}
            />
            <Bar
              dataKey="Saídas"
              fill={SEMANTIC_COLORS.variable}
              radius={[4, 4, 0, 0]}
              barSize={30}
            />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
}
