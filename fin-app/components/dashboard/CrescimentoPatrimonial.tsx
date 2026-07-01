"use client";

import { Paper, Typography } from "@mui/material";
import Grid from "@mui/material/GridLegacy";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
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

export default function CrescimentoPatrimonial({
  yearlyTrendData,
  colors,
  isDarkMode,
}: Props) {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={12}>
        <Paper
          sx={{
            p: 3,
            bgcolor: colors.paper,
            borderRadius: 4,
            border: `1px solid ${colors.border}`,
            height: 400,
          }}
        >
          <Typography variant="h6" component="h2" mb={3} fontWeight="bold" color={colors.text}>
            Crescimento Patrimonial
          </Typography>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={yearlyTrendData}>
              <defs>
                <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={SEMANTIC_COLORS.savings} stopOpacity={0.6} />
                  <stop offset="95%" stopColor={SEMANTIC_COLORS.savings} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke={isDarkMode ? "#333" : "#f0f0f0"}
              />
              <XAxis dataKey="name" stroke={colors.textSecondary} />
              <RechartsTooltip content={createCustomTooltipContent(isDarkMode, colors)} />
              <Area
                type="monotone"
                dataKey="Saldo"
                name="Acumulado"
                stroke={SEMANTIC_COLORS.savings}
                strokeWidth={4}
                fill="url(#colorSavings)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>
    </Grid>
  );
}
