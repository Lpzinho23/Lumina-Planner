import type { SxProps, Theme } from "@mui/material";
import type { ThemeColors } from "@/context/ThemeContext";

export const contentGridSx: SxProps<Theme> = {
  display: "grid",
  gridTemplateColumns: {
    xs: "1fr",
    sm: "repeat(2, 1fr)",
    lg: "repeat(3, 1fr)",
  },
  gap: { xs: 1.5, sm: 2 },
};

export const chartsGridSx: SxProps<Theme> = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr", lg: "repeat(2, 1fr)" },
  gap: { xs: 1.5, sm: 2 },
};

export const statCardsRowSx: SxProps<Theme> = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" },
  gap: { xs: 1.5, sm: 2 },
  mb: 3,
};

export const statValueSx: SxProps<Theme> = {
  fontWeight: 800,
  fontSize: { xs: "1.25rem", sm: "1.5rem", md: "1.75rem" },
  lineHeight: 1.2,
  wordBreak: "break-word",
};

export const largeStatValueSx: SxProps<Theme> = {
  fontWeight: 800,
  fontSize: { xs: "1.5rem", sm: "2rem", md: "2.5rem" },
  lineHeight: 1.15,
  wordBreak: "break-word",
};

export const filterFormControlSx: SxProps<Theme> = {
  width: { xs: "100%", sm: "auto" },
  minWidth: { sm: 140, md: 160 },
};

export function paperCardSx(colors: ThemeColors): SxProps<Theme> {
  return {
    p: { xs: 2, sm: 2.5, md: 3 },
    bgcolor: colors.paper,
    border: `1px solid ${colors.border}`,
    borderRadius: { xs: 2, sm: 3 },
    height: "100%",
  };
}

export const emptyPaperSx = (colors: ThemeColors): SxProps<Theme> => ({
  p: { xs: 3, sm: 4 },
  textAlign: "center",
  bgcolor: colors.paper,
  border: `1px solid ${colors.border}`,
  borderRadius: { xs: 2, sm: 3 },
});
