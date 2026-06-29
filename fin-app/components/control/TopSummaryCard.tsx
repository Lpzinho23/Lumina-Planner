"use client";

import { Box, Paper, Typography } from "@mui/material";
import type { TopSummaryCardProps } from "@/types/finance";
import { formatBRL } from "@/lib/format";

export default function TopSummaryCard({
  title,
  value,
  icon,
  color,
  bg,
  colors,
}: TopSummaryCardProps) {
  return (
    <Paper
      sx={{
        p: 2,
        borderRadius: 4,
        bgcolor: colors.paper,
        border: `1px solid ${colors.border}`,
        display: "flex",
        alignItems: "center",
        gap: 2,
        height: "100%",
      }}
    >
      <Box
        sx={{
          p: 1.5,
          borderRadius: "50%",
          bgcolor: bg || `${color}20`,
          color,
          display: "flex",
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography variant="caption" color={colors.textSecondary}>
          {title}
        </Typography>
        <Typography variant="h6" fontWeight="bold" color={colors.text}>
          {formatBRL(value)}
        </Typography>
      </Box>
    </Paper>
  );
}
