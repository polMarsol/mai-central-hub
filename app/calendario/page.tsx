import Link from "next/link";
import { headers } from "next/headers";
import type { ClassSession, Subject, University } from "@/app/generated/prisma/client";

type ClassSessionWithSubject = Omit<ClassSession, "startTime" | "endTime"> & {
  startTime: string;
  endTime: string;
  subject: Subject;
};

const GROUPS = ["10", "11", "12"];

const DAYS = [
  { key: "MONDAY", label: "Lunes" },
  { key: "TUESDAY", label: "Martes" },
  { key: "WEDNESDAY", label: "Miércoles" },
  { key: "THURSDAY", label: "Jueves" },
  { key: "FRIDAY", label: "Viernes" },
] as const;

const HOUR_START = 8;
const HOUR_END = 20;
const HOURS = Array.from({ length: HOUR_END - HOUR_START }, (_, i) => HOUR_START + i);

const UNIVERSITY_STYLES: Record<University, string> = {
  UPC: "bg-blue-100 border-blue-400 text-blue-900 dark:bg-blue-950 dark:border-blue-700 dark:text-blue-100",
  UB: "bg-amber-100 border-amber-400 text-amber-900 dark:bg-amber-950 dark:border-amber-700 dark:text-amber-100",
  URV: "bg-rose-100 border-rose-400 text-rose-900 dark:bg-rose-950 dark:border-rose-700 dark:text-rose-100",
};

// Las horas de seed siempre caen en punto (ver prisma/seed.ts), por eso
// basta con los minutos en punto: no hace falta granularidad de media hora.
function hourOf(iso: string) {
  return new Date(iso).getUTCHours();
}

function formatHour(hour: number) {
  return `${hour.toString().padStart(2, "0")}:00`;
}

async function getBaseUrl() {
  const requestHeaders = await headers();
  const host = requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "http";
  return `${protocol}://${host}`;
}

async function getClassSessions(group: string): Promise<ClassSessionWithSubject[]> {
  const baseUrl = await getBaseUrl();
  const response = await fetch(
    `${baseUrl}/api/calendar?group=${encodeURIComponent(group)}`,
    { cache: "no-store" },
  );

  if (!response.ok) {
    throw new Error(`No se ha podido cargar el calendario (${response.status})`);
  }

  return response.json();
}

export default async function CalendarioPage({
  searchParams,
}: {
  searchParams: Promise<{ group?: string }>;
}) {
  const { group: groupParam } = await searchParams;
  const group = groupParam && GROUPS.includes(groupParam) ? groupParam : "10";

  const classSessions = await getClassSessions(group);

  const sessionsByDay = Object.fromEntries(
    DAYS.map(({ key }) => [key, classSessions.filter((session) => session.dayOfWeek === key)]),
  ) as Record<(typeof DAYS)[number]["key"], ClassSessionWithSubject[]>;

  return (
    <div className="flex flex-1 flex-col gap-6 bg-zinc-50 px-6 py-10 dark:bg-black">
      <div className="flex flex-col gap-3">
        <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
          Calendario — 1r semestre
        </h1>
        <div className="flex gap-2">
          {GROUPS.map((g) => (
            <Link
              key={g}
              href={`/calendario?group=${g}`}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                g === group
                  ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                  : "border-zinc-300 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-900"
              }`}
            >
              Grupo {g}
            </Link>
          ))}
        </div>
      </div>

      <div
        className="grid overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800"
        style={{
          gridTemplateColumns: `5rem repeat(${DAYS.length}, minmax(9rem, 1fr))`,
          gridTemplateRows: `2.5rem repeat(${HOURS.length}, 3.5rem)`,
        }}
      >
        <div className="border-b border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950" />
        {DAYS.map(({ key, label }) => (
          <div
            key={key}
            className="flex items-center justify-center border-b border-zinc-200 bg-white text-sm font-semibold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300"
          >
            {label}
          </div>
        ))}

        {HOURS.map((hour, hourIndex) => (
          <div
            key={`label-${hour}`}
            className="flex items-start justify-end border-r border-t border-zinc-200 bg-white px-2 pt-1 text-xs text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-500"
            style={{ gridColumn: 1, gridRow: hourIndex + 2 }}
          >
            {formatHour(hour)}
          </div>
        ))}

        {HOURS.map((hour, hourIndex) =>
          DAYS.map(({ key }, dayIndex) => (
            <div
              key={`cell-${key}-${hour}`}
              className="border-t border-zinc-200 dark:border-zinc-800"
              style={{ gridColumn: dayIndex + 2, gridRow: hourIndex + 2 }}
            />
          )),
        )}

        {DAYS.map(({ key }, dayIndex) =>
          sessionsByDay[key].map((session) => {
            const startHour = hourOf(session.startTime);
            const endHour = hourOf(session.endTime);
            const rowStart = startHour - HOUR_START + 2;
            const rowEnd = endHour - HOUR_START + 2;

            return (
              <div
                key={session.id}
                className={`m-1 flex flex-col justify-center rounded-md border px-2 py-1 text-xs ${UNIVERSITY_STYLES[session.subject.university]}`}
                style={{ gridColumn: dayIndex + 2, gridRow: `${rowStart} / ${rowEnd}` }}
              >
                <span className="font-semibold">{session.subject.code}</span>
                <span className="opacity-80">
                  {formatHour(startHour)}–{formatHour(endHour)}
                </span>
                {session.room && <span className="opacity-70">{session.room}</span>}
              </div>
            );
          }),
        )}
      </div>
    </div>
  );
}
