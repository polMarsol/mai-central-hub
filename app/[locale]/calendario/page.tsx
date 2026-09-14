import { getTranslations } from "next-intl/server";
import type { ExamOrDeadlineType, University } from "@prisma/client";
import { COLORS } from "@/lib/design";
import { prisma } from "@/lib/prisma";
import {
  RealCalendar,
  type CalendarEvent,
  type ClassStart,
  type Holiday,
  type InstitutionStart,
} from "./real-calendar";

const SEMESTER = 1;

// Expande un rango de fechas (ambos extremos incluidos) en una entrada
// Holiday por día, todas con la misma etiqueta.
function dateRange(start: string, end: string, labelKey: Holiday["labelKey"], kind: Holiday["kind"]): Holiday[] {
  const result: Holiday[] = [];
  const cursor = new Date(`${start}T00:00:00Z`);
  const last = new Date(`${end}T00:00:00Z`);
  while (cursor.getTime() <= last.getTime()) {
    result.push({ date: cursor.toISOString().slice(0, 10), labelKey, kind });
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return result;
}

// Festivos y avisos del calendario académico oficial de la FIB/UPC para
// másters (MEI, MIRI, MAI, MDS), curso 2026-27: ver
// CALENDARIO-ACADEMICO.md para la fuente y el detalle. Este calendario
// es el de UPC: el propio documento avisa de que las asignaturas de UB
// y URV pueden tener un calendario ligeramente distinto.
const FIXED_HOLIDAYS: Holiday[] = [
  { date: "2026-09-03", labelKey: "welcomeEventExchange", kind: "note" },
  // La ceremonia inicialmente prevista el 9/9 se canceló (Protecció
  // Civil) y se reprogramó al 16/9: confirmado por email oficial de
  // Secretaria FIB (10/9/2026).
  { date: "2026-09-16", labelKey: "welcomeCeremony", kind: "note" },
  { date: "2026-09-11", labelKey: "catalanNationalDay", kind: "holiday" },
  { date: "2026-10-12", labelKey: "nationalDay", kind: "holiday" },
  { date: "2026-10-14", labelKey: "scheduleChange", kind: "note" },
  { date: "2026-12-07", labelKey: "bridgeDay", kind: "holiday" },
  { date: "2026-12-08", labelKey: "immaculateConception", kind: "holiday" },
  ...dateRange("2026-12-21", "2026-12-22", "examPrep", "note"),
  ...dateRange("2026-12-23", "2027-01-06", "christmasBreak", "holiday"),
];

// Primer día de clase real confirmado por asignatura: se marca en la
// rejilla del mes. Ver "Primer día de clase confirmado" en
// CALENDARIO-ACADEMICO.md. Son fechas reales de cada asignatura, no el
// inicio genérico del periodo docente de la universidad (que puede ser
// bastante anterior): el caso de IML (corrección oficial de la
// profesora) demostró que esa asunción puede ser incorrecta, así que
// aquí solo se cargan fechas confirmadas explícitamente.
const CLASS_START_DATA: { subjectCode: string; date: string; noteKey?: ClassStart["noteKey"] }[] = [
  { subjectCode: "CV", date: "2026-09-15" },
  { subjectCode: "IML", date: "2026-09-22", noteKey: "iml" },
  { subjectCode: "PAR", date: "2026-09-23", noteKey: "par" },
  { subjectCode: "IMAS", date: "2026-09-23", noteKey: "imas" },
  { subjectCode: "IHLT", date: "2026-10-01", noteKey: "ihlt" },
  { subjectCode: "CI", date: "2026-10-01" },
];

// Inicio de curso institucional (no del máster): ver
// CALENDARIO-ACADEMICO.md. Las direcciones y el enlace a Google Maps de
// cada universidad viven en /horario.
const INSTITUTION_START_DATA: { code: University; date: string }[] = [
  { code: "UPC", date: "2026-09-14" },
  { code: "UB", date: "2026-09-21" },
  { code: "URV", date: "2026-09-21" },
];

export default async function CalendarioPage() {
  const t = await getTranslations("CalendarPage");

  const subjects = await prisma.subject.findMany({
    where: { semester: SEMESTER },
    orderBy: { code: "asc" },
  });
  const subjectIds = subjects.map((subject) => subject.id);

  // Un examen aplica a los 3 grupos por igual (ver prisma/seed.ts), así
  // que se guarda una fila por grupo: aquí se deduplica por
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

  const subjectByCode = new Map(subjects.map((subject) => [subject.code, subject]));
  const classStarts: ClassStart[] = CLASS_START_DATA.flatMap((entry) => {
    const subject = subjectByCode.get(entry.subjectCode);
    if (!subject) return [];
    return [{
      subjectCode: entry.subjectCode,
      university: subject.university as University,
      date: entry.date,
      noteKey: entry.noteKey,
    }];
  });

  const institutionStarts: InstitutionStart[] = INSTITUTION_START_DATA;

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

      <RealCalendar
        events={events}
        holidays={FIXED_HOLIDAYS}
        classStarts={classStarts}
        institutionStarts={institutionStarts}
      />
    </div>
  );
}
