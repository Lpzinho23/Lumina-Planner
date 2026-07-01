"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import {
  CheckCircle,
  ExpandMore,
  GetApp,
  PhoneIphone,
  PhoneAndroid,
  Computer,
} from "@mui/icons-material";
import toast from "react-hot-toast";
import type { ThemeColors } from "@/context/ThemeContext";
import {
  detectInstallPlatform,
  getInstallInstructions,
  isStandaloneDisplayMode,
  type InstallPlatform,
} from "@/lib/pwa";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

type Props = {
  colors: ThemeColors;
};

const PLATFORM_LABELS: Record<InstallPlatform, string> = {
  ios: "iPhone / iPad",
  android: "Android",
  desktop: "Computador",
};

const PLATFORM_ICONS: Record<InstallPlatform, typeof PhoneIphone> = {
  ios: PhoneIphone,
  android: PhoneAndroid,
  desktop: Computer,
};

export default function InstallAppSection({ colors }: Props) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(
    null,
  );
  const [isInstalling, setIsInstalling] = useState(false);
  const [isInstalled, setIsInstalled] = useState(() => {
    if (typeof window === "undefined") return false;
    return isStandaloneDisplayMode({
      matchMedia: (query) => window.matchMedia(query),
      navigator: {
        standalone: (window.navigator as Navigator & { standalone?: boolean }).standalone,
      },
    });
  });
  const [currentPlatform] = useState<InstallPlatform>(() => {
    if (typeof window === "undefined") return "desktop";
    return detectInstallPlatform(window.navigator.userAgent);
  });

  useEffect(() => {
    const handleBeforeInstall = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    setIsInstalling(true);
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        toast.success("Aplicativo instalado com sucesso!");
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } catch (error) {
      console.error("[InstallAppSection] Erro ao instalar:", error);
      toast.error("Não foi possível instalar o aplicativo.");
    } finally {
      setIsInstalling(false);
    }
  }, [deferredPrompt]);

  const instructionSets = useMemo(
    () =>
      (["ios", "android", "desktop"] as InstallPlatform[]).map((platform) => ({
        platform,
        steps: getInstallInstructions(platform),
      })),
    [],
  );

  return (
    <Stack spacing={2}>
      {isInstalled ? (
        <Alert
          severity="success"
          icon={<CheckCircle fontSize="inherit" />}
          sx={{ bgcolor: `${colors.primary}12`, color: colors.text }}
        >
          O Lumina já está instalado neste dispositivo.
        </Alert>
      ) : (
        <Typography variant="body2" color={colors.textSecondary}>
          Instale o Lumina na tela inicial ou como app no computador para abrir em tela
          cheia, sem a barra do navegador.
        </Typography>
      )}

      {!isInstalled && deferredPrompt ? (
        <Button
          variant="contained"
          startIcon={isInstalling ? <CircularProgress size={20} color="inherit" /> : <GetApp />}
          onClick={handleInstall}
          disabled={isInstalling}
          aria-busy={isInstalling}
          aria-label="Instalar aplicativo Lumina"
          sx={{ alignSelf: { xs: "stretch", sm: "flex-start" }, bgcolor: colors.primary }}
        >
          {isInstalling ? "Instalando…" : "Instalar aplicativo"}
        </Button>
      ) : null}

      {!isInstalled && !deferredPrompt && currentPlatform !== "desktop" ? (
        <Typography variant="body2" color={colors.textSecondary}>
          Se o botão acima não aparecer, siga os passos manuais abaixo para o seu
          dispositivo.
        </Typography>
      ) : null}

      <Box>
        {instructionSets.map(({ platform, steps }) => {
          const Icon = PLATFORM_ICONS[platform];
          const isCurrent = platform === currentPlatform;
          return (
            <Accordion
              key={platform}
              defaultExpanded={isCurrent}
              disableGutters
              sx={{
                bgcolor: colors.paper,
                border: `1px solid ${colors.border}`,
                borderRadius: "8px !important",
                mb: 1,
                "&:before": { display: "none" },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMore sx={{ color: colors.textSecondary }} />}
                aria-label={`Instruções de instalação para ${PLATFORM_LABELS[platform]}`}
              >
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Icon sx={{ color: colors.primary }} fontSize="small" />
                  <Typography fontWeight={600} color={colors.text}>
                    {PLATFORM_LABELS[platform]}
                    {isCurrent ? " (seu dispositivo)" : ""}
                  </Typography>
                </Stack>
              </AccordionSummary>
              <AccordionDetails>
                <List dense disablePadding component="ol" sx={{ listStyle: "decimal", pl: 2 }}>
                  {steps.map((step) => (
                    <ListItem
                      key={step}
                      component="li"
                      disableGutters
                      sx={{ display: "list-item", py: 0.25 }}
                    >
                      <ListItemText
                        primary={step}
                        primaryTypographyProps={{
                          variant: "body2",
                          color: colors.textSecondary,
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </AccordionDetails>
            </Accordion>
          );
        })}
      </Box>
    </Stack>
  );
}
