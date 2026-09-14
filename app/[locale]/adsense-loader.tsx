"use client";

import { useEffect, useSyncExternalStore } from "react";
import { getAdConsentServerSnapshot, getAdConsentSnapshot, subscribeAdConsent } from "@/lib/cookie-consent";

// Si no hay NEXT_PUBLIC_ADSENSE_CLIENT_ID no se fabrica ningún ID de
// mentira: sencillamente no se renderiza nada.
//
// Patrón "cargar siempre, activar solo con consentimiento" (el
// estándar para AdSense + RGPD):
// - La etiqueta <script> con el src real de AdSense está SIEMPRE en
//   el HTML, con type="text/plain" para que el navegador no la
//   ejecute — así el verificador de Google la encuentra (necesita ver
//   el src exacto en el código fuente), pero no se piden datos a
//   Google hasta que el usuario acepte.
// - Si el usuario ya aceptó, se crea e inserta un <script> real
//   (ejecutable) vía DOM, que es lo único que de verdad dispara la
//   petición de red a Google.
export function AdSenseLoader() {
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
  const accepted = useSyncExternalStore(subscribeAdConsent, getAdConsentSnapshot, getAdConsentServerSnapshot);

  useEffect(() => {
    if (!clientId || !accepted) return;
    if (document.querySelector('script[data-adsbygoogle-active="true"]')) return;

    const script = document.createElement("script");
    script.async = true;
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`;
    script.crossOrigin = "anonymous";
    script.dataset.adsbygoogleActive = "true";
    document.head.appendChild(script);
  }, [clientId, accepted]);

  if (!clientId || accepted) return null;

  // Con consentimiento, la carga real la hace el useEffect de arriba
  // (inserta el script una sola vez); este tag inerte solo existe
  // para que el verificador de Google encuentre el src en el HTML.
  return (
    <script
      type="text/plain"
      data-cookieconsent="advertising"
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`}
      crossOrigin="anonymous"
    />
  );
}
