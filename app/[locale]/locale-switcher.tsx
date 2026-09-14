"use client";

import { useLocale, useTranslations } from "next-intl";
import { useCallback, useRef } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { COLORS } from "@/lib/design";

// Solo se ve el idioma activo, como texto plano, sin caja ni borde.
// El cambio de idioma en sí es instantáneo (clic o rueda del ratón),
// pero al pasar el ratón por encima el texto gira sobre sí mismo
// (rotateY en bucle) como indicador de hover, sin relación con el
// cambio de valor.
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
      className="locale-switch-text text-xs font-medium"
      style={{ color: COLORS.textPrimary, display: "inline-block", perspective: "60px" }}
    >
      {locale.toUpperCase()}
    </button>
  );
}
