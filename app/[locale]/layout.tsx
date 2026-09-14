import type { Metadata } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Geist, Geist_Mono } from "next/font/google";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { COLORS, SYSTEM_FONT_STACK } from "@/lib/design";
import { cmuSerif } from "../fonts";
import { AdSenseLoader } from "./adsense-loader";
import { CookieConsentBanner } from "./cookie-consent-banner";
import { CookiePreferencesButton } from "./cookie-preferences-button";
import { LocaleSwitcher } from "./locale-switcher";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  title: "MAI Central Hub",
  description:
    "Calendario académico del Máster en Inteligencia Artificial (UPC · UB · URV).",
};

// Navegación principal del topbar. Privacidad vive solo en el footer
// (patrón habitual: legal en el footer, no en la nav principal).
const NAV_ROUTES = [
  { href: "/horario", key: "schedule" },
  { href: "/calendario", key: "calendar" },
  { href: "/calculadora", key: "calculator" },
  { href: "/objetivos", key: "goals" },
  { href: "/sobre-el-proyecto", key: "about" },
  { href: "/sugerencias", key: "feedback" },
  { href: "/contacto", key: "contact" },
] as const;

const FOOTER_COLUMNS = [
  {
    titleKey: "columns.project",
    links: [
      { href: "/horario", key: "schedule" },
      { href: "/calendario", key: "calendar" },
      { href: "/calculadora", key: "calculator" },
      { href: "/objetivos", key: "goals" },
      { href: "/sobre-el-proyecto", key: "about" },
    ],
  },
  {
    titleKey: "columns.help",
    links: [
      { href: "/sugerencias", key: "feedback" },
      { href: "/contacto", key: "contact" },
    ],
  },
  {
    titleKey: "columns.legal",
    links: [{ href: "/privacidad", key: "privacy" }],
  },
] as const;

// DESIGN.md → Layout: casco de la app centrado en 1120px con padding
// lateral generoso (28px), no un dashboard a todo el ancho.
const SHELL_WIDTH = "mx-auto w-full max-w-[1120px] px-7";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const t = await getTranslations("Nav");
  const footerT = await getTranslations("Footer");

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} ${cmuSerif.variable} h-full antialiased`}
    >
      <body
        className="flex min-h-full flex-col"
        style={{ backgroundColor: COLORS.background }}
      >
        <NextIntlClientProvider>
          <header
            className="sticky top-0 z-50"
            style={{
              borderBottom: `1px solid ${COLORS.hairline}`,
              backgroundColor: "rgba(255,255,255,0.72)",
              backdropFilter: "saturate(180%) blur(20px)",
              WebkitBackdropFilter: "saturate(180%) blur(20px)",
            }}
          >
            <div className={`${SHELL_WIDTH} flex h-14 items-center justify-between gap-6`}>
              <Link
                href="/"
                className="brand-link flex items-baseline gap-1.5"
                style={{ fontFamily: "var(--font-cmu-serif)", fontSize: "21px", letterSpacing: "-0.01em" }}
              >
                <span style={{ color: COLORS.textPrimary }}>MAI</span>
                <span style={{ color: COLORS.textSecondary }}>Central Hub</span>
              </Link>

              <nav className="hidden flex-1 items-center justify-center gap-7 sm:flex">
                {NAV_ROUTES.map((route) => (
                  <Link key={route.href} href={route.href} className="nav-item flex min-h-11 items-center">
                    <span
                      className="underline-link text-sm"
                      style={{ color: COLORS.textPrimary, letterSpacing: "-0.005em" }}
                    >
                      {t(route.key)}
                    </span>
                  </Link>
                ))}
              </nav>

              <LocaleSwitcher />
            </div>

            <nav className="sm:hidden" style={{ borderTop: `1px solid ${COLORS.hairline}` }}>
              <div className={`${SHELL_WIDTH} flex flex-wrap gap-x-5 gap-y-1 py-1`}>
                {NAV_ROUTES.map((route) => (
                  <Link key={route.href} href={route.href} className="nav-item flex min-h-11 items-center">
                    <span className="underline-link text-sm" style={{ color: COLORS.textPrimary }}>
                      {t(route.key)}
                    </span>
                  </Link>
                ))}
              </div>
            </nav>
          </header>

          <div
            className={`${SHELL_WIDTH} flex flex-1 flex-col`}
            style={{ fontFamily: SYSTEM_FONT_STACK }}
          >
            {children}
          </div>

          <footer style={{ borderTop: `1px solid ${COLORS.hairline}`, backgroundColor: COLORS.backgroundSecondary }}>
            <div className={`${SHELL_WIDTH} flex flex-col gap-8 py-10`}>
              <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
                {FOOTER_COLUMNS.map((column) => (
                  <div key={column.titleKey} className="flex flex-col gap-3">
                    <p
                      className="uppercase"
                      style={{ fontSize: "12.5px", letterSpacing: "0.06em", color: COLORS.textSecondary }}
                    >
                      {footerT(column.titleKey)}
                    </p>
                    <div className="flex flex-col items-start gap-1.5">
                      {column.links.map((link) => (
                        <Link key={link.href} href={link.href} className="nav-item flex min-h-9 items-center">
                          <span className="underline-link text-sm" style={{ color: COLORS.textPrimary }}>
                            {t(link.key)}
                          </span>
                        </Link>
                      ))}
                      {column.titleKey === "columns.legal" && <CookiePreferencesButton />}
                    </div>
                  </div>
                ))}
              </div>

              <div
                className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
                style={{ borderTop: `1px solid ${COLORS.hairline}`, paddingTop: "1.25rem" }}
              >
                <span className="font-display text-base" style={{ color: COLORS.textPrimary }}>
                  {t("brand")}
                </span>
                <span className="text-sm" style={{ color: COLORS.textSecondary }}>
                  {footerT("disclaimer")}
                </span>
              </div>
            </div>
          </footer>

          <CookieConsentBanner />
          <AdSenseLoader />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
