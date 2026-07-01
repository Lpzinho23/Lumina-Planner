"use client";

import { Box, Typography } from "@mui/material";
import type { ThemeColors } from "@/context/ThemeContext";

type Props = {
  title: string;
  subtitle?: string;
  colors: ThemeColors;
  action?: React.ReactNode;
};

export default function PageHeader({ title, subtitle, colors, action }: Props) {
  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 2,
        mb: 3,
      }}
    >
      <Box>
        <Typography variant="h4" component="h1" fontWeight={700} color={colors.text}>
          {title}
        </Typography>
        {subtitle ? (
          <Typography variant="body1" color={colors.textSecondary} mt={0.5}>
            {subtitle}
          </Typography>
        ) : null}
      </Box>
      {action}
    </Box>
  );
}
