"use client";

import { Box, Paper, Typography } from "@mui/material";
import {
  Cell,
  LabelList,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from "recharts";
import type { ThemeColors } from "@/context/ThemeContext";
import type { ChartLabelRow } from "@/types/finance";
import { SEMANTIC_COLORS } from "@/lib/constants";
import { formatBRL } from "@/lib/format";
import { createCustomTooltipContent } from "./CustomTooltip";

type Props = {
  incomeSourceData: ChartLabelRow[];
  totalIncomeValue: number;
  colors: ThemeColors;
  isDarkMode: boolean;
};

type CenterLabelProps = {
  viewBox?: { cx?: number; cy?: number; x?: number; y?: number; width?: number; height?: number };
};

function CustomCenterLabel({
  viewBox,
  totalIncomeValue,
  colors,
}: CenterLabelProps & {
  totalIncomeValue: number;
  colors: ThemeColors;
}) {
  let cx = viewBox?.cx;
  let cy = viewBox?.cy;
  if (
    (cx == null || cy == null) &&
    viewBox?.x != null &&
    viewBox?.y != null &&
    viewBox?.width != null &&
    viewBox?.height != null
  ) {
    cx = viewBox.x + viewBox.width / 2;
    cy = viewBox.y + viewBox.height / 2;
  }
  if (cx == null || cy == null) return null;
  return (
    <g>
      <text
        x={cx}
        y={cy - 15}
        textAnchor="middle"
        fill={colors.textSecondary}
        style={{ fontSize: "16px", fontWeight: 500 }}
      >
        Total
      </text>
      <text
        x={cx}
        y={cy + 25}
        textAnchor="middle"
        fill={SEMANTIC_COLORS.income}
        style={{ fontSize: "32px", fontWeight: 800 }}
      >
        {formatBRL(Math.round(totalIncomeValue))}
      </text>
    </g>
  );
}

export default function FontesRenda({
  incomeSourceData,
  totalIncomeValue,
  colors,
  isDarkMode,
}: Props) {
  return (
    <Box display="flex" justifyContent="center">
      <Paper
        sx={{
          p: 4,
          bgcolor: colors.paper,
          borderRadius: 4,
          height: 650,
          width: "100%",
          maxWidth: 900,
          border: `1px solid ${colors.border}`,
          textAlign: "center",
        }}
      >
        <Typography variant="h5" component="h2" mb={2} fontWeight="bold" color={colors.text}>
          Fontes de Renda
        </Typography>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={
                incomeSourceData as unknown as Record<string, unknown>[]
              }
              cx="50%"
              cy="50%"
              innerRadius={160}
              outerRadius={220}
              paddingAngle={2}
              dataKey="value"
            >
              {incomeSourceData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.fill}
                  stroke={colors.paper}
                  strokeWidth={2}
                />
              ))}
              <LabelList
                content={(labelProps) => (
                  <CustomCenterLabel
                    viewBox={
                      labelProps.viewBox as CenterLabelProps["viewBox"]
                    }
                    totalIncomeValue={totalIncomeValue}
                    colors={colors}
                  />
                )}
                position="center"
              />
            </Pie>
            <RechartsTooltip content={createCustomTooltipContent(isDarkMode, colors)} />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
            />
          </PieChart>
        </ResponsiveContainer>
      </Paper>
    </Box>
  );
}
