"use client";
import { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { ThemeProvider as MuiThemeProvider, createTheme } from "@mui/material";

const darkColors = {
  background: "#0f1014",
  paper: "#18191d",
  input: "#27272a",
  text: "#ffffff",
  textSecondary: "#a1a1aa",
  primary: "#7c3aed",
  border: "#333333",
  danger: "#ef4444",
} as const;

const lightColors = {
  background: "#f4f4f5",
  paper: "#ffffff",
  input: "#e4e4e7",
  text: "#18181b",
  textSecondary: "#71717a",
  primary: "#7c3aed",
  border: "#d4d4d8",
  danger: "#dc2626",
} as const;

export type ThemeColors = typeof darkColors | typeof lightColors;

export type ThemeContextValue = {
  isDarkMode: boolean;
  toggleTheme: () => void;
  colors: ThemeColors;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export const useAppTheme = (): ThemeContextValue => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useAppTheme deve ser usado dentro de ThemeContextProvider");
  }
  return ctx;
};

function readInitialDarkMode(): boolean {
  if (typeof window === "undefined") return true;
  const saved = localStorage.getItem("themeMode");
  if (saved) return saved === "dark";
  return true;
}

export const ThemeContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [isDarkMode, setIsDarkMode] = useState(readInitialDarkMode);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      setMounted(true);
    });
  }, []);

  const toggleTheme = useCallback(() => {
    setIsDarkMode((prev) => {
      const newMode = !prev;
      localStorage.setItem("themeMode", newMode ? "dark" : "light");
      return newMode;
    });
  }, []);

  const colors: ThemeColors = useMemo(
    () => (isDarkMode ? darkColors : lightColors),
    [isDarkMode]
  );

  const muiTheme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: isDarkMode ? "dark" : "light",
          primary: { main: colors.primary },
          background: { default: colors.background, paper: colors.paper },
          text: { primary: colors.text, secondary: colors.textSecondary },
        },
        components: {
          MuiPaper: { styleOverrides: { root: { backgroundImage: "none" } } },
          MuiDialog: { styleOverrides: { paper: { backgroundColor: colors.paper } } },
        },
      }),
    [isDarkMode, colors]
  );

  const value = useMemo<ThemeContextValue>(
    () => ({ isDarkMode, toggleTheme, colors }),
    [isDarkMode, toggleTheme, colors]
  );

  if (!mounted) return null;

  return (
    <ThemeContext.Provider value={value}>
      <MuiThemeProvider theme={muiTheme}>{children}</MuiThemeProvider>
    </ThemeContext.Provider>
  );
};
