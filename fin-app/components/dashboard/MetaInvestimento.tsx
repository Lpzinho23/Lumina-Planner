"use client";

import { Box, IconButton, Paper, Stack, Typography } from "@mui/material";
import { DragIndicator } from "@mui/icons-material";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import type { ThemeColors } from "@/context/ThemeContext";
import { META_ANUAL_INVEST, SEMANTIC_COLORS } from "@/lib/constants";
import { formatBRL } from "@/lib/format";

type GaugeRow = { name: string; value: number; fill: string };

type Props = {
  gaugeData: GaugeRow[];
  totalInvestedGlobal: number;
  percentageGoal: number;
  colors: ThemeColors;
  isDarkMode: boolean;
};

export default function MetaInvestimento({
  gaugeData,
  totalInvestedGlobal,
  percentageGoal,
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
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h6" component="h2" fontWeight="bold" color={colors.text}>
          Meta 2026
        </Typography>
        <IconButton
          size="small"
          className="drag-handle"
          aria-label="Arrastar card meta de investimento"
          sx={{ cursor: "grab" }}
        >
          <DragIndicator />
        </IconButton>
      </Stack>
      <Box sx={{ flexGrow: 1, position: "relative", minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={gaugeData}
              cx="50%"
              cy="75%"
              startAngle={180}
              endAngle={0}
              innerRadius="60%"
              outerRadius="80%"
              paddingAngle={0}
              dataKey="value"
              stroke="none"
            >
              <Cell fill={SEMANTIC_COLORS.savings} />
              <Cell fill={isDarkMode ? "#333" : "#e4e4e7"} />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <Box
          sx={{
            position: "absolute",
            top: "70%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
          }}
        >
          <Typography variant="h4" fontWeight="bold" color={SEMANTIC_COLORS.savings}>
            {percentageGoal.toFixed(0)}%
          </Typography>
        </Box>
      </Box>
      <Typography variant="caption" align="center" color={colors.textSecondary}>
        Total:{" "}
        <span style={{ color: SEMANTIC_COLORS.savings, fontWeight: "bold" }}>
          {formatBRL(totalInvestedGlobal)}
        </span>{" "}
        / {META_ANUAL_INVEST / 1000}k
      </Typography>
    </Paper>
  );
}
