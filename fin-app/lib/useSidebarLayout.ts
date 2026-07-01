"use client";

import { useMediaQuery, useTheme } from "@mui/material";

/** Sidebar fixa apenas em telas extra-grandes (≥1536px). */
export const SIDEBAR_DESKTOP_MEDIA_QUERY = "xl" as const;

export function useSidebarLayout() {
  const theme = useTheme();
  const isDesktopSidebar = useMediaQuery(theme.breakpoints.up(SIDEBAR_DESKTOP_MEDIA_QUERY));

  return { isDesktopSidebar };
}
