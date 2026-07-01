import type { ThemeColors } from "@/context/ThemeContext";

export type AuthPageColors = {
  accentPurple: string;
  pageBackground: string;
  cardBackground: string;
  inputBackground: string;
  buttonBg: string;
  buttonBgHover: string;
  buttonText: string;
  textMain: string;
  textGray: string;
  border: string;
  cardShadow: string;
};

export function getAuthPageColors(
  colors: ThemeColors,
  isDarkMode: boolean,
): AuthPageColors {
  if (isDarkMode) {
    return {
      accentPurple: colors.primary,
      pageBackground: "#202024",
      cardBackground: colors.paper,
      inputBackground: colors.input,
      buttonBg: "#e4e4e7",
      buttonBgHover: "#d4d4d8",
      buttonText: "#18181d",
      textMain: colors.text,
      textGray: colors.textSecondary,
      border: colors.border,
      cardShadow: "0 10px 30px -12px rgba(0, 0, 0, 0.5)",
    };
  }

  return {
    accentPurple: colors.primary,
    pageBackground: colors.background,
    cardBackground: colors.paper,
    inputBackground: "#ffffff",
    buttonBg: colors.primary,
    buttonBgHover: "#6d28d9",
    buttonText: "#ffffff",
    textMain: colors.text,
    textGray: colors.textSecondary,
    border: colors.border,
    cardShadow: "0 10px 30px -12px rgba(15, 23, 42, 0.08)",
  };
}
