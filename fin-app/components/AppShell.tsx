"use client";

import type { ReactNode } from "react";
import { Box } from "@mui/material";
import { usePathname } from "next/navigation";
import { Toaster } from "react-hot-toast";
import Sidebar, { SIDEBAR_WIDTH } from "@/components/Sidebar";
import FinanceFab from "@/components/FinanceFab";
import { SIDEBAR_DESKTOP_BREAKPOINT } from "@/components/layout/shared";
import { useAppTheme } from "@/context/ThemeContext";

type AppShellProps = {
  children: ReactNode;
};

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const { colors } = useAppTheme();
  const isAuthPage = pathname === "/login" || pathname === "/cadastro";

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100dvh",
        bgcolor: colors.background,
        transition: "background-color 0.3s",
      }}
    >
      {!isAuthPage && <Sidebar />}
      {!isAuthPage && <FinanceFab />}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: "100%",
          minWidth: 0,
          color: colors.text,
          p: isAuthPage ? 0 : { xs: 1.5, sm: 2, md: 3, lg: 4 },
          pt: isAuthPage
            ? 0
            : {
                xs: "calc(56px + env(safe-area-inset-top) + 12px)",
                [SIDEBAR_DESKTOP_BREAKPOINT]: 3,
                xl: 4,
              },
          pb: isAuthPage
            ? 0
            : {
                xs: "calc(72px + env(safe-area-inset-bottom))",
                [SIDEBAR_DESKTOP_BREAKPOINT]: 3,
                xl: 4,
              },
          ml: isAuthPage ? 0 : { [SIDEBAR_DESKTOP_BREAKPOINT]: `${SIDEBAR_WIDTH}px` },
          overflowX: "hidden",
          transition: "margin 0.2s ease",
        }}
      >
        <Box
          sx={{
            maxWidth: 1280,
            mx: "auto",
            width: "100%",
            minWidth: 0,
          }}
        >
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              maxWidth: "calc(100vw - 32px)",
            },
          }}
        />
        {children}
        </Box>
      </Box>
    </Box>
  );
}
