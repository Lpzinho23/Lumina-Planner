"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Box, LinearProgress, Typography } from "@mui/material";
import { useAuth } from "@/context/AuthContext";

/**
 * Protege rotas autenticadas: aguarda o Firebase Auth e redireciona visitantes.
 */
export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      const next = encodeURIComponent(pathname || "/dashboard");
      router.replace(`/login?next=${next}`);
    }
  }, [loading, user, router, pathname]);

  if (loading) {
    return (
      <Box
        role="status"
        aria-busy="true"
        aria-label="Verificando sessão"
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
          gap: 2,
          px: 2,
        }}
      >
        <Typography variant="body1" color="text.secondary">
          Carregando sessão…
        </Typography>
        <LinearProgress sx={{ width: "100%", maxWidth: 360 }} color="secondary" />
      </Box>
    );
  }

  if (!user) {
    return (
      <Box
        role="status"
        aria-label="Redirecionando para o login"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Redirecionando…
        </Typography>
      </Box>
    );
  }

  return <>{children}</>;
}
