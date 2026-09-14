import { getTranslations } from "next-intl/server";
import { COLORS } from "@/lib/design";
import { prisma } from "@/lib/prisma";
import { ScheduleView, type Location, type SessionSlot, type SubjectOption } from "./schedule-view";

const SEMESTER = 1;

// Direcciones reales: ver CALENDARIO-ACADEMICO.md. Las fechas de
// inicio de curso viven en /calendario, no aquí.
const LOCATIONS: Location[] = [
  { code: "UPC", address: "C/ Jordi Girona 1-3, Campus Nord, 08034 Barcelona" },
  { code: "UB", address: "C/ Gran Via de les Corts Catalanes 585, Pati de Ciències, 08011 Barcelona" },
  { code: "URV", address: "Av. Països Catalans 26, Edifici E4, Campus Sescelades, 43007 Tarragona" },
];

// Las horas de seed siempre caen en punto (ver prisma/seed.ts), por eso
// basta con la hora entera: no hace falta granularidad de media hora.
function hourOf(date: Date) {
  return date.getUTCHours();
}

export default async function HorarioPage() {
  const t = await getTranslations("SchedulePage");

  const subjects = await prisma.subject.findMany({
    where: { semester: SEMESTER },
    orderBy: { code: "asc" },
  });

  const subjectIds = subjects.map((subject) => subject.id);

  const classSessions = subjectIds.length
    ? await prisma.classSession.findMany({
        where: { subjectId: { in: subjectIds } },
        include: { subject: true, group: true },
        orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
      })
    : [];

  const subjectOptions: SubjectOption[] = subjects.map((subject) => ({
    id: subject.id,
    code: subject.code,
    name: subject.name,
    university: subject.university,
  }));

  const sessions: SessionSlot[] = classSessions.map((session) => ({
    id: session.id,
    subjectId: session.subjectId,
    subjectCode: session.subject.code,
    university: session.subject.university,
    groupName: session.group.name,
    dayOfWeek: session.dayOfWeek,
    startHour: hourOf(session.startTime),
    endHour: hourOf(session.endTime),
    type: session.type,
    room: session.room,
  }));

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

      <ScheduleView subjects={subjectOptions} sessions={sessions} locations={LOCATIONS} />
    </div>
  );
}
