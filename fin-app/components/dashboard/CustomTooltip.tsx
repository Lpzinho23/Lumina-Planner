"use client";

import { Paper, Typography } from "@mui/material";
import type { ThemeColors } from "@/context/ThemeContext";
import { formatBRL } from "@/lib/format";

export type TooltipDatum = {
  name?: string;
  value?: number;
  color?: string;
  fill?: string;
};

export type CustomTooltipProps = {
  active?: boolean;
  payload?: readonly TooltipDatum[];
  label?: string | number;
  isDarkMode: boolean;
  colors: ThemeColors;
};

export default function CustomTooltip({
  active,
  payload,
  label,
  isDarkMode,
  colors,
}: CustomTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <Paper
        elevation={4}
        sx={{
          p: 2,
          bgcolor: isDarkMode
            ? "rgba(24, 25, 29, 0.95)"
            : "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(8px)",
          border: `1px solid ${colors.border}`,
          borderRadius: 2,
          zIndex: 9999,
        }}
      >
        <Typography variant="subtitle2" color={colors.textSecondary} mb={1}>
          {label}
        </Typography>
        {payload.map((entry, index) => (
          <Typography
            key={index}
            variant="body2"
            fontWeight="bold"
            sx={{ color: entry.color || entry.fill }}
          >
            {entry.name}: {formatBRL(Number(entry.value ?? 0))}
          </Typography>
        ))}
      </Paper>
    );
  }
  return null;
}
