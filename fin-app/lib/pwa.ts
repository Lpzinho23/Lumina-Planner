export type InstallPlatform = "ios" | "android" | "desktop";

export type StandaloneWindow = {
  matchMedia: (query: string) => { matches: boolean; media: string };
  navigator: { standalone?: boolean };
};

export function detectInstallPlatform(userAgent: string): InstallPlatform {
  const ua = userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(ua)) {
    return "ios";
  }
  if (/android/.test(ua)) {
    return "android";
  }
  return "desktop";
}

export function getInstallInstructions(platform: InstallPlatform): string[] {
  if (platform === "ios") {
    return [
      "Abra o Lumina no Safari (não use Chrome no iPhone).",
      "Toque no ícone Compartilhar (quadrado com seta para cima).",
      "Selecione \"Adicionar à Tela de Início\".",
      "Confirme em Adicionar — o ícone do Lumina aparecerá na sua home.",
    ];
  }
  if (platform === "android") {
    return [
      "Abra o Lumina no Google Chrome.",
      "Toque no menu ⋮ no canto superior direito.",
      "Escolha \"Instalar app\" ou \"Adicionar à tela inicial\".",
      "Confirme a instalação para abrir como aplicativo.",
    ];
  }
  return [
    "Abra o Lumina no Google Chrome ou Microsoft Edge.",
    "Procure o ícone de instalação (⊕) na barra de endereço.",
    "Ou use o menu do navegador → \"Instalar Lumina…\" / \"Aplicativos\".",
    "O app abrirá em uma janela própria, sem abas do navegador.",
  ];
}

export function isStandaloneDisplayMode(win?: StandaloneWindow): boolean {
  if (!win) return false;
  const standaloneMedia = win.matchMedia("(display-mode: standalone)").matches;
  const iosStandalone = win.navigator.standalone === true;
  return standaloneMedia || iosStandalone;
}

export const SERVICE_WORKER_PATH = "/sw.js";
