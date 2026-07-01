"use client";

import { usePathname, useRouter } from "next/navigation";
import { Box, ButtonBase, Stack, Typography } from "@mui/material";
import type { ThemeColors } from "@/context/ThemeContext";
import { NAV_SECTIONS } from "@/lib/navigation";

type Props = {
  colors: ThemeColors;
  isDarkMode: boolean;
  onNavigate?: () => void;
};

export default function SidebarNavigation({ colors, isDarkMode, onNavigate }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  const navButtonSx = (isActive: boolean) => ({
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: 1.25,
    px: 1.75,
    py: 1,
    borderRadius: 2,
    bgcolor: isActive ? colors.primary : "transparent",
    color: isActive ? "#ffffff" : colors.textSecondary,
    transition: "all 0.15s ease",
    "&:hover": {
      bgcolor: isActive ? colors.primary : isDarkMode ? "rgba(255,255,255,0.05)" : "#f4f5f8",
      color: isActive ? "#ffffff" : colors.text,
    },
  });

  const handleNavigate = (path: string) => {
    router.push(path);
    onNavigate?.();
  };

  return (
    <Stack spacing={2}>
      {NAV_SECTIONS.map((section) => (
        <Box key={section.title ?? "main"}>
          {section.title ? (
            <Typography
              variant="caption"
              fontWeight={700}
              color={colors.textSecondary}
              sx={{
                px: 1.75,
                mb: 0.75,
                display: "block",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              {section.title}
            </Typography>
          ) : null}
          <Stack spacing={0.5}>
            {section.items.map((item) => {
              const isActive = pathname === item.path;
              const Icon = item.icon;
              return (
                <ButtonBase
                  key={item.path}
                  onClick={() => handleNavigate(item.path)}
                  aria-label={`Ir para ${item.label}`}
                  aria-current={isActive ? "page" : undefined}
                  sx={navButtonSx(isActive)}
                >
                  <Icon sx={{ fontSize: 20, color: "inherit" }} />
                  <Typography variant="body2" fontWeight={isActive ? 700 : 500} color="inherit">
                    {item.label}
                  </Typography>
                </ButtonBase>
              );
            })}
          </Stack>
        </Box>
      ))}
    </Stack>
  );
}
