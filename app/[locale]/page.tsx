import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { COLORS } from "@/lib/design";
import { prisma } from "@/lib/prisma";
import { HeroReveal } from "./hero-reveal";

const SEMESTER = 1;

export default async function HomePage() {
  const t = await getTranslations("HomePage");

  // Estadísticas reales del semestre activo: nunca cifras de ejemplo
  // (DESIGN.md → Qué evitar explícitamente).
  const subjects = await prisma.subject.findMany({ where: { semester: SEMESTER } });
  const universityCount = new Set(subjects.map((s) => s.university)).size;
  const totalEcts = subjects.reduce((sum, s) => sum + s.ects, 0);

  const stats = [
    { value: subjects.length, label: t("stats.subjectsLabel") },
    { value: universityCount, label: t("stats.universitiesLabel") },
    { value: totalEcts, label: t("stats.ectsLabel") },
  ];

  return (
    <div className="flex flex-1 flex-col justify-center py-20 sm:py-28">
      <HeroReveal>
        <p
          className="uppercase"
          style={{ fontSize: "12.5px", letterSpacing: "0.06em", color: COLORS.textSecondary }}
        >
          {t("eyebrow")}
        </p>

        <h1
          className="font-display max-w-[17ch] text-4xl sm:text-6xl"
          style={{ color: COLORS.textPrimary, letterSpacing: "-0.02em", lineHeight: 1.04, marginTop: "26px" }}
        >
          {t("tagline")}
        </h1>

        <p
          className="max-w-[52ch] text-base sm:text-lg"
          style={{ color: COLORS.textSecondary, lineHeight: 1.55, marginTop: "26px" }}
        >
          {t("description")}
        </p>

        <div style={{ marginTop: "40px" }}>
          <Link
            href="/horario"
            className="cta-button flex min-h-11 w-fit items-center gap-2 rounded-md px-5 text-sm font-medium"
            style={{ backgroundColor: COLORS.textPrimary, color: COLORS.background, letterSpacing: "-0.005em" }}
          >
            {t("cta")}
            <span style={{ opacity: 0.7 }}>→</span>
          </Link>
        </div>

        <div
          className="grid grid-cols-1 gap-7 sm:grid-cols-3"
          style={{ borderTop: `1px solid ${COLORS.hairline}`, marginTop: "76px", paddingTop: "26px" }}
        >
          {stats.map((stat) => (
            <div key={stat.label}>
              <p
                className="font-display"
                style={{ color: COLORS.textPrimary, fontSize: "30px", letterSpacing: "-0.01em" }}
              >
                {stat.value}
              </p>
              <p className="text-sm" style={{ color: COLORS.textSecondary, marginTop: "4px" }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </HeroReveal>
    </div>
  );
}
