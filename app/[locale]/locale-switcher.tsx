"use client";

import { useLocale, useTranslations } from "next-intl";
import { useCallback, useRef } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { COLORS } from "@/lib/design";

// En reposo solo se ve el idioma activo (una fila). Al pasar el ratón
// por encima, el control se expande y las dos filas adyacentes
// aparecen girando (rotateX) desde detrás de la fila central, como si
// la rueda se desplegara. Se elige pulsando la fila que aparece, o
// girando la rueda del ratón sobre el control en cualquier momento.
const ROW_HEIGHT = 16; // px
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

  function handleWheel(event: React.WheelEvent<HTMLDivElement>) {
    event.preventDefault();
    wheelAccum.current += event.deltaY;
    if (Math.abs(wheelAccum.current) < WHEEL_THRESHOLD) return;
    const step = wheelAccum.current > 0 ? 1 : -1;
    wheelAccum.current = 0;
    goToIndex(currentIndex + step);
  }

  const above = locales[(currentIndex - 1 + locales.length) % locales.length];
  const below = locales[(currentIndex + 1) % locales.length];

  return (
    <div
      role="group"
      aria-label={t("label")}
      onWheel={handleWheel}
      className="locale-wheel flex select-none flex-col items-stretch overflow-hidden rounded-md"
      style={{ width: "2.75rem", perspective: "240px" }}
    >
      <button
        type="button"
        onClick={() => goToIndex(currentIndex - 1)}
        aria-label={above.toUpperCase()}
        className="locale-wheel-row locale-wheel-row--above flex shrink-0 items-center justify-center text-[10px] font-medium"
        style={{ height: `${ROW_HEIGHT}px`, color: COLORS.textSecondary }}
      >
        {above.toUpperCase()}
      </button>
      <button
        type="button"
        onClick={() => goToIndex(currentIndex + 1)}
        aria-label={t("next")}
        className="locale-wheel-current flex shrink-0 items-center justify-center text-xs font-medium"
        style={{ height: `${ROW_HEIGHT}px` }}
      >
        {locale.toUpperCase()}
      </button>
      <button
        type="button"
        onClick={() => goToIndex(currentIndex + 1)}
        aria-label={below.toUpperCase()}
        className="locale-wheel-row locale-wheel-row--below flex shrink-0 items-center justify-center text-[10px] font-medium"
        style={{ height: `${ROW_HEIGHT}px`, color: COLORS.textSecondary }}
      >
        {below.toUpperCase()}
      </button>
    </div>
  );
}
