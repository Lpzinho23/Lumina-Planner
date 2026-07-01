"use client";

import { useEffect } from "react";
import { SERVICE_WORKER_PATH } from "@/lib/pwa";

export default function PwaRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const register = async () => {
      try {
        const registration = await navigator.serviceWorker.register(SERVICE_WORKER_PATH, {
          scope: "/",
        });
        if (registration.waiting) {
          registration.waiting.postMessage({ type: "SKIP_WAITING" });
        }
        registration.addEventListener("updatefound", () => {
          const worker = registration.installing;
          if (!worker) return;
          worker.addEventListener("statechange", () => {
            if (worker.state === "installed" && navigator.serviceWorker.controller) {
              worker.postMessage({ type: "SKIP_WAITING" });
            }
          });
        });
      } catch (error) {
        console.error("[PwaRegister] Erro ao registrar service worker:", error);
      }
    };

    void register();
  }, []);

  return null;
}
