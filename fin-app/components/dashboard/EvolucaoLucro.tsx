"use client";

import { Box, IconButton, Paper, Stack, Typography } from "@mui/material";
import { DragIndicator } from "@mui/icons-material";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ThemeColors } from "@/context/ThemeContext";
import { SEMANTIC_COLORS } from "@/lib/constants";
import type { YearlyTrendRow } from "./EvolucaoFinanceira";
import { createCustomTooltipContent } from "./CustomTooltip";

type Props = {
  yearlyTrendData: YearlyTrendRow[];
  colors: ThemeColors;
  isDarkMode: boolean;
};

export default function EvolucaoLucro({
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
          Tendência Lucro
        </Typography>
        <IconButton
          size="small"
          className="drag-handle"
          aria-label="Arrastar gráfico tendência de lucro"
          sx={{ cursor: "grab" }}
        >
          <DragIndicator />
        </IconButton>
      </Stack>
      <Box sx={{ flexGrow: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
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
            <RechartsTooltip content={createCustomTooltipContent(isDarkMode, colors)} />
            <Line
              type="monotone"
              dataKey="Lucro"
              stroke={SEMANTIC_COLORS.income}
              strokeWidth={3}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
}
