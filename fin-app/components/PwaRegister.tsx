"use client";

import { useEffect } from "react";
import { SERVICE_WORKER_PATH } from "@/lib/pwa";

export default function PwaRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const register = async () => {
      try {
        await navigator.serviceWorker.register(SERVICE_WORKER_PATH, { scope: "/" });
      } catch (error) {
        console.error("[PwaRegister] Erro ao registrar service worker:", error);
      }
    };

    void register();
  }, []);

  return null;
}
