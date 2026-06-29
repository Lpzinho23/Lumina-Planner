"use client";

import { useState, useMemo, type ComponentType, type ReactNode } from "react";
import { Paper, Typography } from "@mui/material";
import Grid from "@mui/material/GridLegacy";
import {
  Cell,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Sector,
  Tooltip as RechartsTooltip,
} from "recharts";
import type { ThemeColors } from "@/context/ThemeContext";
import type { ChartLabelRow, RadarExpenseRow } from "@/types/finance";
import { CHART_PALETTE, SEMANTIC_COLORS } from "@/lib/constants";
import { formatBRL } from "@/lib/format";
import CustomTooltip from "./CustomTooltip";

type Props = {
  expensesByCategory: RadarExpenseRow[];
  paymentMethodsData: ChartLabelRow[];
  colors: ThemeColors;
  isDarkMode: boolean;
};

type ActiveSectorProps = {
  cx?: number;
  cy?: number;
  innerRadius?: number;
  outerRadius?: number;
  startAngle?: number;
  endAngle?: number;
  fill?: string;
  payload?: { name?: string };
  value?: number;
};

export default function EvolucaoDespesasAnalise({
  expensesByCategory,
  paymentMethodsData,
  colors,
  isDarkMode,
}: Props) {
  const [activeIndex, setActiveIndex] = useState(0);

  const PieInteractive = useMemo(
    () =>
      Pie as unknown as ComponentType<
        Record<string, unknown> & { children?: ReactNode }
      >,
    [],
  );

  const renderActiveShape = (props: ActiveSectorProps) => {
    const {
      cx,
      cy,
      innerRadius,
      outerRadius,
      startAngle,
      endAngle,
      fill,
      payload,
      value,
    } = props;
    if (
      cx == null ||
      cy == null ||
      innerRadius == null ||
      outerRadius == null ||
      startAngle == null ||
      endAngle == null
    ) {
      return null;
    }
    return (
      <g>
        <text x={cx} y={cy} dy={-10} textAnchor="middle" fill={colors.text} fontWeight="bold">
          {payload?.name ?? ""}
        </text>
        <text
          x={cx}
          y={cy}
          dy={15}
          textAnchor="middle"
          fill={colors.textSecondary}
          fontSize={12}
        >
          {formatBRL(Number(value ?? 0))}
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 6}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
      </g>
    );
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={8}>
        <Paper
          sx={{
            p: 3,
            bgcolor: colors.paper,
            borderRadius: 4,
            height: 500,
            border: `1px solid ${colors.border}`,
          }}
        >
          <Typography variant="h6" component="h2" mb={2} fontWeight="bold" color={colors.text}>
            Raio-X dos Gastos
          </Typography>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={expensesByCategory}>
              <PolarGrid stroke={isDarkMode ? "#444" : "#ddd"} />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fill: colors.textSecondary, fontSize: 12 }}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, "auto"]}
                stroke={colors.textSecondary}
              />
              <Radar
                name="Gastos"
                dataKey="A"
                stroke={SEMANTIC_COLORS.variable}
                fill={SEMANTIC_COLORS.variable}
                fillOpacity={0.5}
              />
              <RechartsTooltip
                content={(props) => (
                  <CustomTooltip {...props} isDarkMode={isDarkMode} colors={colors} />
                )}
              />
            </RadarChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>
      <Grid item xs={12} md={4}>
        <Paper
          sx={{
            p: 3,
            bgcolor: colors.paper,
            borderRadius: 4,
            height: 500,
            border: `1px solid ${colors.border}`,
          }}
        >
          <Typography variant="h6" component="h2" mb={2} fontWeight="bold" color={colors.text}>
            Formas de Pagamento
          </Typography>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <PieInteractive
                activeIndex={activeIndex}
                activeShape={renderActiveShape}
                data={paymentMethodsData}
                innerRadius={80}
                outerRadius={100}
                paddingAngle={4}
                dataKey="value"
                onMouseEnter={(_: unknown, index: number) => setActiveIndex(index)}
                fill="none"
              >
                {paymentMethodsData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={CHART_PALETTE[index % CHART_PALETTE.length]}
                  />
                ))}
              </PieInteractive>
            </PieChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>
    </Grid>
  );
}
