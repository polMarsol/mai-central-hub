"use client";

import Script from "next/script";
import { useSyncExternalStore } from "react";
import { getAdConsentServerSnapshot, getAdConsentSnapshot, subscribeAdConsent } from "@/lib/cookie-consent";

// No hace nada hasta que se cumplan DOS condiciones:
// 1. NEXT_PUBLIC_ADSENSE_CLIENT_ID está puesto (cuando exista una
//    cuenta de AdSense real — nunca se fabrica un ID de mentira aquí).
// 2. El usuario ha aceptado las cookies de publicidad en el banner.
// Reacciona en caliente si el consentimiento cambia después de cargar
// la página (no hace falta recargar para que el script se inyecte).
export function AdSenseLoader() {
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
  const accepted = useSyncExternalStore(subscribeAdConsent, getAdConsentSnapshot, getAdConsentServerSnapshot);

  if (!clientId || !accepted) return null;

  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}
