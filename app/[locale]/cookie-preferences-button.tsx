"use client";

import { useTranslations } from "next-intl";
import { COLORS } from "@/lib/design";
import { reopenConsentBanner } from "@/lib/cookie-consent";

// Reabre el banner de consentimiento para cambiar la decisión ya
// tomada (aceptar/rechazar): vive en el footer junto a Privacidad.
export function CookiePreferencesButton() {
  const t = useTranslations("Footer");

  return (
    <button
      type="button"
      onClick={reopenConsentBanner}
      className="nav-item flex min-h-9 items-center text-left"
    >
      <span className="underline-link text-sm" style={{ color: COLORS.textPrimary }}>
        {t("cookiePreferences")}
      </span>
    </button>
  );
}
