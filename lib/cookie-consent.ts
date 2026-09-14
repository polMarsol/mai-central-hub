"use client";

const COOKIE_NAME = "cookie_consent";
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365; // 1 año
const COOKIE_CONSENT_CHANGE_EVENT = "cookie-consent-change";

export type ConsentValue = "accepted" | "rejected";

export function readConsent(): ConsentValue | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`));
  const value = match ? decodeURIComponent(match[1]) : null;
  return value === "accepted" || value === "rejected" ? value : null;
}

function writeConsent(value: ConsentValue) {
  document.cookie = `${COOKIE_NAME}=${value}; path=/; max-age=${COOKIE_MAX_AGE_SECONDS}; samesite=lax`;
  window.dispatchEvent(new Event(COOKIE_CONSENT_CHANGE_EVENT));
}

// --- Visibilidad del banner (useSyncExternalStore) ---
// `manualVisible` permite forzar el banner a mostrarse (reabrir desde
// el footer) o a ocultarse (justo tras decidir) sin esperar a que
// cambie la cookie — en cualquier otro caso se deriva de si ya existe
// una decisión guardada.
let manualVisible: boolean | null = null;
let bannerListeners: Array<() => void> = [];

function notifyBanner() {
  for (const listener of bannerListeners) listener();
}

export function subscribeConsentBanner(callback: () => void): () => void {
  bannerListeners.push(callback);
  return () => {
    bannerListeners = bannerListeners.filter((listener) => listener !== callback);
  };
}

export function getConsentBannerSnapshot(): boolean {
  if (manualVisible !== null) return manualVisible;
  return readConsent() === null;
}

export function getConsentBannerServerSnapshot(): boolean {
  return false; // en el servidor nunca se muestra — evita mismatch de hidratación
}

export function decideConsent(value: ConsentValue) {
  writeConsent(value);
  manualVisible = false;
  notifyBanner();
}

// Reabre el banner (p. ej. desde "Preferencias de cookies" del footer)
// sin borrar la decisión ya guardada hasta que el usuario vuelva a elegir.
export function reopenConsentBanner() {
  manualVisible = true;
  notifyBanner();
}

// --- Consentimiento de anuncios (useSyncExternalStore) ---
export function subscribeAdConsent(callback: () => void): () => void {
  window.addEventListener(COOKIE_CONSENT_CHANGE_EVENT, callback);
  return () => window.removeEventListener(COOKIE_CONSENT_CHANGE_EVENT, callback);
}

export function getAdConsentSnapshot(): boolean {
  return readConsent() === "accepted";
}

export function getAdConsentServerSnapshot(): boolean {
  return false;
}
