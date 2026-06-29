"use client";

import { Box, IconButton, Paper, Stack, Typography } from "@mui/material";
import { DragIndicator } from "@mui/icons-material";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ThemeColors } from "@/context/ThemeContext";
import type { ChartLabelRow } from "@/types/finance";
import { SEMANTIC_COLORS } from "@/lib/constants";
import { formatBRL } from "@/lib/format";
import CustomTooltip from "./CustomTooltip";

type Props = {
  topExpensesData: ChartLabelRow[];
  colors: ThemeColors;
  isDarkMode: boolean;
};

export default function TopDespesas({
  topExpensesData,
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
          Top 5 Despesas
        </Typography>
        <IconButton
          size="small"
          className="drag-handle"
          aria-label="Arrastar gráfico Top 5 despesas"
          sx={{ cursor: "grab" }}
        >
          <DragIndicator />
        </IconButton>
      </Stack>
      <Box sx={{ flexGrow: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={topExpensesData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              horizontal={false}
              stroke={isDarkMode ? "#333" : "#f0f0f0"}
            />
            <XAxis type="number" hide />
            <YAxis
              dataKey="name"
              type="category"
              width={90}
              stroke={colors.textSecondary}
              tick={{ fontSize: 11 }}
            />
            <RechartsTooltip
              content={(props) => (
                <CustomTooltip {...props} isDarkMode={isDarkMode} colors={colors} />
              )}
            />
            <Bar
              dataKey="value"
              fill={SEMANTIC_COLORS.variable}
              radius={[0, 4, 4, 0]}
              barSize={15}
            >
              <LabelList
                dataKey="value"
                position="right"
                fill={colors.textSecondary}
                fontSize={10}
                formatter={(value: unknown) =>
                  formatBRL(Number(value ?? 0))
                }
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
}
