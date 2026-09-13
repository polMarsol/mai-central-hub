import { getTranslations } from "next-intl/server";
import type { ExamOrDeadlineType, University } from "@/app/generated/prisma/client";
import { COLORS } from "@/lib/design";
import { prisma } from "@/lib/prisma";
import { RealCalendar, type CalendarEvent, type Holiday, type UniversityInfo } from "./real-calendar";

const SEMESTER = 1;

// Festivos fijos (misma fecha cada año, no dependen del calendario
// académico de cada universidad) — ver CALENDARIO-ACADEMICO.md para
// las fuentes y lo que aún falta por confirmar para 2026-27.
const FIXED_HOLIDAYS: Holiday[] = [
  { date: "2026-10-12", labelKey: "nationalDay" },
  { date: "2026-11-01", labelKey: "allSaints" },
  { date: "2026-12-06", labelKey: "constitutionDay" },
  { date: "2026-12-08", labelKey: "immaculateConception" },
  { date: "2026-12-25", labelKey: "christmas" },
  { date: "2026-12-26", labelKey: "stStephensDay" },
  { date: "2027-01-01", labelKey: "newYear" },
  { date: "2027-01-06", labelKey: "epiphany" },
];

// Fechas e direcciones reales — ver CALENDARIO-ACADEMICO.md.
const UNIVERSITY_INFO: UniversityInfo[] = [
  {
    code: "UPC",
    startDate: "2026-09-14",
    address: "C/ Jordi Girona 1-3, Campus Nord, 08034 Barcelona",
  },
  {
    code: "UB",
    startDate: "2026-09-21",
    address: "C/ Gran Via de les Corts Catalanes 585, Pati de Ciències, 08011 Barcelona",
  },
  {
    code: "URV",
    startDate: "2026-09-21",
    address: "Av. Països Catalans 26, Edifici E4, Campus Sescelades, 43007 Tarragona",
  },
];

export default async function CalendarioPage() {
  const t = await getTranslations("CalendarPage");

  const subjects = await prisma.subject.findMany({
    where: { semester: SEMESTER },
    orderBy: { code: "asc" },
  });
  const subjectIds = subjects.map((subject) => subject.id);

  // Un examen aplica a los 3 grupos por igual (ver prisma/seed.ts), así
  // que se guarda una fila por grupo — aquí se deduplica por
  // asignatura+fecha+tipo para no repetir la misma fila 3 veces.
  const examsRaw = subjectIds.length
    ? await prisma.examOrDeadline.findMany({
        where: { subjectId: { in: subjectIds } },
        include: { subject: true },
        orderBy: { date: "asc" },
      })
    : [];

  const seen = new Set<string>();
  const events: CalendarEvent[] = [];
  for (const exam of examsRaw) {
    const key = `${exam.subjectId}-${exam.date.toISOString()}-${exam.type}`;
    if (seen.has(key)) continue;
    seen.add(key);
    events.push({
      id: exam.id,
      subjectCode: exam.subject.code,
      university: exam.subject.university as University,
      date: exam.date.toISOString(),
      type: exam.type as ExamOrDeadlineType,
    });
  }

  return (
    <div className="flex flex-1 flex-col gap-10 py-12" style={{ backgroundColor: COLORS.background }}>
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-xl sm:text-3xl" style={{ color: COLORS.textPrimary }}>
          {t("title")}
        </h1>
        <p className="text-base font-normal" style={{ color: COLORS.textSecondary }}>
          {t("subtitle")}
        </p>
      </div>

      <RealCalendar events={events} holidays={FIXED_HOLIDAYS} universities={UNIVERSITY_INFO} />
    </div>
  );
}
