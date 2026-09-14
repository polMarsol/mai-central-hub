import type { University } from "@prisma/client";

// DESIGN.md: única fuente de verdad para estos valores.
export const COLORS = {
  background: "#FFFFFF",
  backgroundSecondary: "#FAFAFA",
  textPrimary: "#1D1D1F",
  textSecondary: "#6E6E73",
  hairline: "#E5E5E7",
} as const;

export const UNIVERSITY_COLORS: Record<University, string> = {
  UPC: "#2563EB",
  UB: "#F2A93B",
  URV: "#14B8A6",
};

export const SYSTEM_FONT_STACK =
  '-apple-system, "SF Pro Text", "Helvetica Neue", system-ui, sans-serif';

// Solo para casos que no puedan usar la utilidad Tailwind `font-display`
// (p. ej. un valor de --custom-property). 'Latin Modern Roman' no se
// autoaloja: el navegador cae en 'CMU Serif', que sí servimos.
export const DISPLAY_FONT_STACK = "'Latin Modern Roman', 'CMU Serif', Georgia, serif";

export function mapsUrl(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

export function withAlpha(hex: string, alpha: number) {
  const value = parseInt(hex.replace("#", ""), 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
