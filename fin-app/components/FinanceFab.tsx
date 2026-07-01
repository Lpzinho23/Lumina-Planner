"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Box,
} from "@mui/material";
import {
  SwapHoriz,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Add,
  Close,
} from "@mui/icons-material";
import { FAB_ACTIONS } from "@/lib/navigation";

const ACTION_ICONS = {
  transfer: SwapHoriz,
  income: TrendingUp,
  expense: TrendingDown,
  credit: CreditCard,
} as const;

export default function FinanceFab() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <Box
      sx={{
        position: "fixed",
        right: { xs: 12, sm: 16, md: 24 },
        bottom: { xs: "calc(16px + env(safe-area-inset-bottom))", md: 24 },
        zIndex: 1300,
      }}
    >
      <SpeedDial
        ariaLabel="Ações financeiras rápidas"
        icon={
          <SpeedDialIcon
            icon={<Add />}
            openIcon={<Close />}
          />
        }
        open={open}
        onClose={() => setOpen(false)}
        onOpen={() => setOpen(true)}
        FabProps={{
          sx: {
            bgcolor: "#2563eb",
            color: "#fff",
            "&:hover": { bgcolor: "#1d4ed8" },
          },
        }}
      >
        {FAB_ACTIONS.map((action) => {
          const Icon = ACTION_ICONS[action.id];
          return (
            <SpeedDialAction
              key={action.id}
              icon={<Icon />}
              tooltipTitle={action.label}
              tooltipOpen
              FabProps={{
                sx: {
                  bgcolor: action.color,
                  color: "#fff",
                  "&:hover": { bgcolor: action.color, opacity: 0.92 },
                },
                "aria-label": action.label,
              }}
              onClick={() => {
                setOpen(false);
                router.push(action.path);
              }}
            />
          );
        })}
      </SpeedDial>
    </Box>
  );
}
