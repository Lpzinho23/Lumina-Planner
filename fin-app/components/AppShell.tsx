"use client";

import type { ReactNode } from "react";
import { Box } from "@mui/material";
import { usePathname } from "next/navigation";
import { Toaster } from "react-hot-toast";
import Sidebar, { SIDEBAR_WIDTH } from "@/components/Sidebar";
import FinanceFab from "@/components/FinanceFab";
import { useSidebarLayout } from "@/lib/useSidebarLayout";
import { useAppTheme } from "@/context/ThemeContext";

type AppShellProps = {
  children: ReactNode;
};

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const { colors } = useAppTheme();
  const { isDesktopSidebar } = useSidebarLayout();
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
            : isDesktopSidebar
              ? { xs: 3, lg: 4 }
              : "calc(56px + env(safe-area-inset-top) + 12px)",
          pb: isAuthPage
            ? 0
            : isDesktopSidebar
              ? { xs: 3, lg: 4 }
              : "calc(72px + env(safe-area-inset-bottom))",
          ml: isAuthPage || !isDesktopSidebar ? 0 : `${SIDEBAR_WIDTH}px`,
          overflowX: "hidden",
          transition: "margin 0.2s ease",
        }}
      >
        <Box
          sx={{
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
