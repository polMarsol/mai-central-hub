"use client";

import { useLocale, useTranslations } from "next-intl";
import { useCallback, useRef } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { COLORS } from "@/lib/design";

// Solo se ve el idioma activo, como texto plano, sin caja ni borde.
// Cambia al instante al pulsarlo (siguiente idioma) o al girar la
// rueda del ratón sobre él (en cualquier dirección), sin animación.
const WHEEL_THRESHOLD = 35; // acumulado de deltaY antes de avanzar un paso

export function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("LocaleSwitcher");

  const locales = routing.locales;
  const currentIndex = locales.indexOf(locale as (typeof locales)[number]);
  const wheelAccum = useRef(0);

  const goToIndex = useCallback(
    (index: number) => {
      const nextLocale = locales[((index % locales.length) + locales.length) % locales.length];
      if (nextLocale !== locale) {
        router.replace(pathname, { locale: nextLocale });
      }
    },
    [locale, locales, pathname, router],
  );

  function handleWheel(event: React.WheelEvent<HTMLButtonElement>) {
    event.preventDefault();
    wheelAccum.current += event.deltaY;
    if (Math.abs(wheelAccum.current) < WHEEL_THRESHOLD) return;
    const step = wheelAccum.current > 0 ? 1 : -1;
    wheelAccum.current = 0;
    goToIndex(currentIndex + step);
  }

  return (
    <button
      type="button"
      onClick={() => goToIndex(currentIndex + 1)}
      onWheel={handleWheel}
      aria-label={t("label")}
      className="nav-item text-xs font-medium"
      style={{ color: COLORS.textPrimary }}
    >
      {locale.toUpperCase()}
    </button>
  );
}
