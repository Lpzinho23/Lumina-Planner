import type { SxProps, Theme } from "@mui/material";
import type { ThemeColors } from "@/context/ThemeContext";

/** Sidebar fixa só a partir de `xl` (1536px); abaixo disso usa drawer mobile. */
export const SIDEBAR_DESKTOP_BREAKPOINT = "xl" as const;

/** Grade que se adapta à largura disponível (considera sidebar aberta). */
export const autoFitGrid = (minColumnPx: number): string =>
  `repeat(auto-fit, minmax(min(100%, ${minColumnPx}px), 1fr))`;

export const contentGridSx: SxProps<Theme> = {
  display: "grid",
  gridTemplateColumns: autoFitGrid(280),
  gap: { xs: 1.5, sm: 2 },
};

export const chartsGridSx: SxProps<Theme> = {
  display: "grid",
  gridTemplateColumns: autoFitGrid(360),
  gap: { xs: 1.5, sm: 2 },
};

/** Grade de 4 indicadores (dashboard, relatórios). */
export const summaryCardsGridSx: SxProps<Theme> = {
  display: "grid",
  gridTemplateColumns: autoFitGrid(240),
  gap: { xs: 1.5, sm: 2 },
  mb: 3,
};

export const statCardsRowSx: SxProps<Theme> = {
  display: "grid",
  gridTemplateColumns: autoFitGrid(260),
  gap: { xs: 1.5, sm: 2 },
  mb: 3,
};

export const sectionHeaderSx: SxProps<Theme> = {
  display: "flex",
  flexDirection: { xs: "column", sm: "row" },
  flexWrap: "wrap",
  alignItems: { xs: "stretch", sm: "center" },
  justifyContent: "space-between",
  gap: { xs: 1.5, sm: 2 },
  mb: 2,
};

export const blockHeaderSx: SxProps<Theme> = {
  p: { xs: 1.5, sm: 2 },
  display: "flex",
  flexDirection: { xs: "column", sm: "row" },
  flexWrap: "wrap",
  alignItems: { xs: "stretch", sm: "center" },
  justifyContent: "space-between",
  gap: { xs: 1.5, sm: 2 },
};

export const tableContainerSx: SxProps<Theme> = {
  overflowX: "auto",
  WebkitOverflowScrolling: "touch",
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
