"use client";

import type { ReactNode } from "react";
import { Paper, Typography } from "@mui/material";
import type { TooltipContentProps } from "recharts";
import type { ThemeColors } from "@/context/ThemeContext";
import { formatBRL } from "@/lib/format";

type CustomTooltipProps = Pick<
  TooltipContentProps,
  "active" | "payload" | "label"
> & {
  isDarkMode: boolean;
  colors: ThemeColors;
};

function normalizeTooltipValue(
  value: number | string | ReadonlyArray<number | string> | undefined,
): number {
  if (value == null) return 0;
  if (Array.isArray(value)) return Number(value[0] ?? 0);
  return Number(value);
}

function CustomTooltip({
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
            {entry.name != null ? String(entry.name) : "Valor"}:{" "}
            {formatBRL(normalizeTooltipValue(entry.value))}
          </Typography>
        ))}
      </Paper>
    );
  }
  return null;
}

export function createCustomTooltipContent(
  isDarkMode: boolean,
  colors: ThemeColors,
): (props: TooltipContentProps) => ReactNode {
  function CustomTooltipContent(props: TooltipContentProps) {
    return (
      <CustomTooltip
        active={props.active}
        payload={props.payload}
        label={props.label}
        isDarkMode={isDarkMode}
        colors={colors}
      />
    );
  }

  CustomTooltipContent.displayName = "CustomTooltipContent";

  return CustomTooltipContent;
}
