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
        flexDirection: { xs: "column", sm: "row" },
        flexWrap: "wrap",
        alignItems: { xs: "stretch", sm: "flex-start" },
        justifyContent: "space-between",
        gap: { xs: 1.5, sm: 2 },
        mb: { xs: 2, sm: 3 },
      }}
    >
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography
          variant="h4"
          component="h1"
          fontWeight={700}
          color={colors.text}
          sx={{ fontSize: { xs: "1.35rem", sm: "1.6rem", md: "2rem" }, lineHeight: 1.2 }}
        >
          {title}
        </Typography>
        {subtitle ? (
          <Typography
            variant="body1"
            color={colors.textSecondary}
            mt={0.5}
            sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
          >
            {subtitle}
          </Typography>
        ) : null}
      </Box>
      {action ? (
        <Box
          sx={{
            width: { xs: "100%", sm: "auto" },
            flexShrink: 0,
            "& .MuiButton-root": {
              width: { xs: "100%", sm: "auto" },
            },
          }}
        >
          {action}
        </Box>
      ) : null}
    </Box>
  );
}
