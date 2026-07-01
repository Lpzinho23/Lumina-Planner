"use client";

import { Box, Paper, Typography } from "@mui/material";
import type { ThemeColors } from "@/context/ThemeContext";
import { formatBRL } from "@/lib/format";

type Props = {
  label: string;
  value: number;
  icon: React.ReactNode;
  accent: string;
  accentBg: string;
  colors: ThemeColors;
  ariaLabel: string;
};

export default function OverviewStatCard({
  label,
  value,
  icon,
  accent,
  accentBg,
  colors,
  ariaLabel,
}: Props) {
  return (
    <Paper
      elevation={0}
      aria-label={ariaLabel}
      sx={{
        p: 2.5,
        flex: 1,
        minWidth: 0,
        bgcolor: colors.paper,
        borderRadius: 3,
        border: `1px solid ${colors.border}`,
        boxShadow: "0 1px 3px rgba(15, 23, 42, 0.06)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 2,
        transition: "box-shadow 0.2s ease, transform 0.2s ease",
        "&:hover": {
          boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
          transform: "translateY(-2px)",
        },
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography
          variant="body2"
          color={colors.textSecondary}
          fontWeight={500}
          sx={{ mb: 0.75 }}
        >
          {label}
        </Typography>
        <Typography
          variant="h5"
          fontWeight={700}
          color={colors.text}
          sx={{
            fontSize: { xs: "1.1rem", sm: "1.25rem", md: "1.5rem" },
            wordBreak: "break-word",
            lineHeight: 1.2,
          }}
        >
          {formatBRL(value)}
        </Typography>
      </Box>
      <Box
        aria-hidden="true"
        sx={{
          width: 48,
          height: 48,
          borderRadius: 2.5,
          bgcolor: accentBg,
          color: accent,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
    </Paper>
  );
}
