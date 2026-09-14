"use client";

import { useTranslations } from "next-intl";
import { useSyncExternalStore } from "react";
import { Link } from "@/i18n/navigation";
import { COLORS } from "@/lib/design";
import {
  decideConsent,
  getConsentBannerServerSnapshot,
  getConsentBannerSnapshot,
  subscribeConsentBanner,
} from "@/lib/cookie-consent";

// Banner de consentimiento para las cookies de publicidad (Google
// AdSense, cuando esté activo: ver DESIGN.md/CLAUDE.md). "Aceptar" y
// "Rechazar" tienen el mismo peso visual a propósito: ninguno de los
// dos botones está resaltado sobre el otro (criterio AEPD/RGPD).
export function CookieConsentBanner() {
  const t = useTranslations("CookieConsent");
  const visible = useSyncExternalStore(
    subscribeConsentBanner,
    getConsentBannerSnapshot,
    getConsentBannerServerSnapshot,
  );

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label={t("label")}
      className="fixed inset-x-0 bottom-0 z-50"
      style={{ borderTop: `1px solid ${COLORS.hairline}`, backgroundColor: COLORS.background }}
    >
      <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-4 px-7 py-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm" style={{ color: COLORS.textSecondary }}>
          {t("message")}{" "}
          <Link href="/privacidad" className="nav-item" style={{ color: COLORS.textPrimary }}>
            <span className="underline-link">{t("learnMore")}</span>
          </Link>
        </p>
        <div className="flex shrink-0 gap-3">
          <button
            type="button"
            onClick={() => decideConsent("rejected")}
            className="hairline-button flex min-h-11 items-center rounded-md px-4 text-sm font-medium"
            style={{ border: `1px solid ${COLORS.hairline}`, color: COLORS.textPrimary }}
          >
            {t("reject")}
          </button>
          <button
            type="button"
            onClick={() => decideConsent("accepted")}
            className="hairline-button flex min-h-11 items-center rounded-md px-4 text-sm font-medium"
            style={{ border: `1px solid ${COLORS.hairline}`, color: COLORS.textPrimary }}
          >
            {t("accept")}
          </button>
        </div>
      </div>
    </div>
  );
}
