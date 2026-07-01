"use client";

import React, { useMemo } from "react";
import { GridLayout, useContainerWidth } from "react-grid-layout";
import { LinearProgress, Box, Typography } from "@mui/material";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import type { GridLayoutProps, Layout, ResizeHandleAxis } from "react-grid-layout";

const MOBILE_GRID_MAX_WIDTH = 900;
const MOBILE_MARGIN = [0, 12] as const;
const DEFAULT_RESIZE_HANDLES: readonly ResizeHandleAxis[] = ["se", "s", "e"];

/**
 * Grade do dashboard: sempre o mesmo número de colunas que o layout persistido
 * (12), com largura fluida. Evita ResponsiveGridLayout com cols por breakpoint,
 * que recompactava o layout e desalinhava os painéis.
 */
export type DashboardGridProps = Omit<
  GridLayoutProps,
  "width" | "gridConfig" | "layout"
> & {
  children?: React.ReactNode;
  layout?: Layout;
  /** Número de colunas (default 12, alinhado a `DEFAULT_LAYOUT` / Firestore). */
  cols?: number;
  rowHeight?: number;
  margin?: readonly [number, number];
  maxRows?: number;
  containerPadding?: readonly [number, number] | null;
  /** Seletor CSS do handle de arraste (mesclado em `dragConfig.handle`). */
  draggableHandle?: string;
  onLayoutChange?: (layout: Layout) => void;
};

export default function DashboardGrid({
  children,
  layout,
  cols: colsProp = 12,
  draggableHandle,
  dragConfig,
  onLayoutChange,
  rowHeight = 150,
  margin = [10, 10],
  maxRows = Infinity,
  containerPadding = null,
  resizeConfig: resizeConfigProp,
  ...rest
}: DashboardGridProps) {
  const { width, containerRef, mounted } = useContainerWidth({
    measureBeforeMount: true,
  });
  const isMobileGrid = width > 0 && width < MOBILE_GRID_MAX_WIDTH;
  const effectiveLayout = useMemo(() => {
    if (!layout || !isMobileGrid) return layout;
    return layout.map((item, index) => ({
      ...item,
      x: 0,
      y: index * Math.max(item.h, 2),
      w: 1,
      h: Math.max(item.h, 2),
    }));
  }, [layout, isMobileGrid]);

  const gridConfig = useMemo(
    () => ({
      cols: isMobileGrid ? 1 : colsProp,
      rowHeight: isMobileGrid ? 170 : rowHeight,
      margin: isMobileGrid ? MOBILE_MARGIN : margin,
      maxRows,
      containerPadding,
    }),
    [colsProp, isMobileGrid, rowHeight, margin, maxRows, containerPadding],
  );

  const resolvedDragConfig = useMemo(
    () => {
      const baseConfig = draggableHandle
        ? { ...dragConfig, handle: draggableHandle }
        : dragConfig;
      return isMobileGrid
        ? { ...baseConfig, enabled: false }
        : baseConfig;
    },
    [draggableHandle, dragConfig, isMobileGrid],
  );

  const resizeConfig = useMemo(
    () => ({
      enabled: !isMobileGrid,
      handles: DEFAULT_RESIZE_HANDLES,
      ...resizeConfigProp,
      ...(isMobileGrid ? { enabled: false } : {}),
    }),
    [resizeConfigProp, isMobileGrid],
  );

  return (
    <div ref={containerRef} style={{ width: "100%" }}>
      {mounted ? (
        <GridLayout
          width={width}
          layout={effectiveLayout}
          gridConfig={gridConfig}
          dragConfig={resolvedDragConfig}
          resizeConfig={resizeConfig}
          onLayoutChange={isMobileGrid ? undefined : onLayoutChange}
          {...rest}
        >
          {children}
        </GridLayout>
      ) : (
        <Box
          sx={{ p: 4, textAlign: "center", width: "100%" }}
          role="status"
          aria-label="Carregando grade do dashboard"
        >
          <Typography variant="body2" color="textSecondary" mb={1}>
            Carregando Módulos do Grid...
          </Typography>
          <LinearProgress color="secondary" />
        </Box>
      )}
    </div>
  );
}
