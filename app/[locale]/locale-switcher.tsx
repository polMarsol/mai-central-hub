"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { COLORS } from "@/lib/design";

export function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("LocaleSwitcher");

  return (
    <div
      className="flex overflow-hidden rounded-md"
      style={{ border: `1px solid ${COLORS.hairline}` }}
      role="group"
      aria-label={t("label")}
    >
      {routing.locales.map((code) => {
        const isActive = code === locale;
        return (
          <button
            key={code}
            type="button"
            aria-pressed={isActive}
            data-active={isActive}
            onClick={() => router.replace(pathname, { locale: code })}
            className="locale-switch-button flex min-h-11 min-w-11 items-center justify-center px-2.5 text-xs font-medium"
            style={
              isActive
                ? { letterSpacing: "0.02em", backgroundColor: COLORS.textPrimary, color: COLORS.background }
                : { letterSpacing: "0.02em" }
            }
          >
            {code.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}
