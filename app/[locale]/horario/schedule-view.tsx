"use client";

import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import type { DayOfWeek, SessionType, University } from "@/app/generated/prisma/client";
import { COLORS, mapsUrl, UNIVERSITY_COLORS, withAlpha } from "@/lib/design";

// Guía docente conjunta del máster, alojada por la FIB/UPC incluso para
// asignaturas de UB/URV: el prefijo de idioma en la ruta (es/ca/en)
// coincide con los locales de la app. Verificado a mano para las 6
// asignaturas del 1r semestre.
function syllabusUrl(code: string, locale: string): string {
  return `https://www.fib.upc.edu/${locale}/masters/master-artificial-intelligence/curriculum/syllabus/${code}-MAI`;
}

const GROUPS = ["10", "11", "12"];

const DAY_KEYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"] as const;
type DayKey = (typeof DAY_KEYS)[number];

const HOUR_START = 8;
const HOUR_END = 20;
const HOURS = Array.from({ length: HOUR_END - HOUR_START }, (_, i) => HOUR_START + i);

// Las abreviaturas (T/L/P/T+L) coinciden en los tres idiomas (Teoría/Teoria/
// Theory, Laboratorio/Laboratori/Lab, Problemas/Problemes/Problems), así que
// no hace falta traducirlas: la palabra completa se usa solo en el `title`.
const TYPE_ABBREVIATIONS: Record<SessionType, string> = {
  THEORY: "T",
  LAB: "L",
  PROBLEMS: "P",
  THEORY_LAB: "T+L",
};

export type SubjectOption = {
  id: string;
  code: string;
  name: string;
  university: University;
};

export type Location = {
  code: University;
  address: string;
};

export type SessionSlot = {
  id: string;
  subjectId: string;
  subjectCode: string;
  university: University;
  groupName: string;
  dayOfWeek: DayOfWeek;
  startHour: number;
  endHour: number;
  type: SessionType;
  room: string | null;
};

function formatHour(hour: number) {
  return `${hour.toString().padStart(2, "0")}:00`;
}

function todayWeekdayIndex() {
  const jsDay = new Date().getDay(); // 0=domingo, 1=lunes, ..., 6=sábado
  return jsDay >= 1 && jsDay <= 5 ? jsDay - 1 : 0;
}

// Asigna cada sesión a una columna sin solapar con otra en la misma
// franja horaria (mismo algoritmo que un calendario tipo Google Calendar).
// El número de columnas se calcula por clúster de solape real (no por
// todo el día), para que una sesión aislada no quede estrecha solo
// porque otras sesiones sin relación se solapan más tarde ese día.
function assignColumns(sessions: SessionSlot[]) {
  const sorted = [...sessions].sort(
    (a, b) => a.startHour - b.startHour || a.endHour - b.endHour,
  );

  const clusters: SessionSlot[][] = [];
  let clusterEnd = -Infinity;
  for (const session of sorted) {
    if (session.startHour >= clusterEnd) {
      clusters.push([session]);
    } else {
      clusters[clusters.length - 1].push(session);
    }
    clusterEnd = Math.max(clusterEnd, session.endHour);
  }

  return clusters.flatMap((cluster) => {
    const columnEndHours: number[] = [];
    const placed = cluster.map((session) => {
      let column = columnEndHours.findIndex((end) => end <= session.startHour);
      if (column === -1) {
        column = columnEndHours.length;
        columnEndHours.push(session.endHour);
      } else {
        columnEndHours[column] = session.endHour;
      }
      return { session, column };
    });
    const totalColumns = columnEndHours.length;
    return placed.map(({ session, column }) => ({ session, column, totalColumns }));
  });
}

// Renderiza solo los bloques posicionados en absoluto: el contenedor
// `position: relative` con la altura real lo aporta quien lo llama
// (si este componente añadiera su propio wrapper, quedaría anidado
// dentro de ese contenedor sin una altura definida y los porcentajes
// de `top`/`height` colapsarían a 0).
function DayOverlay({
  sessions,
  typeLabels,
}: {
  sessions: SessionSlot[];
  typeLabels: Record<SessionType, string>;
}) {
  const columns = assignColumns(sessions);

  return (
    <>
      {columns.map(({ session, column, totalColumns }) => {
        const top = ((session.startHour - HOUR_START) / HOURS.length) * 100;
        const height = ((session.endHour - session.startHour) / HOURS.length) * 100;
        const width = 100 / totalColumns;
        const left = column * width;
        const universityColor = UNIVERSITY_COLORS[session.university];

        return (
          <div
            key={session.id}
            title={typeLabels[session.type]}
            className="session-block absolute flex flex-col justify-center overflow-hidden px-1.5 py-0.5 text-sm"
            style={
              {
                top: `${top}%`,
                height: `${height}%`,
                left: `${left}%`,
                width: `${width}%`,
                borderLeft: `3px solid ${universityColor}`,
                color: COLORS.textPrimary,
                "--session-bg": withAlpha(universityColor, 0.15),
                "--session-bg-hover": withAlpha(universityColor, 0.28),
              } as React.CSSProperties
            }
          >
            <span className="truncate font-medium">
              {session.subjectCode} {session.groupName} {TYPE_ABBREVIATIONS[session.type]}
            </span>
            {session.room && (
              <span className="truncate text-xs" style={{ color: COLORS.textSecondary }}>
                {session.room}
              </span>
            )}
          </div>
        );
      })}
    </>
  );
}

// Grid de un único día: columna de horas + una sola columna de sesiones.
// Usado en móvil (<640px), donde 5 columnas quedan ilegibles.
function SingleDayGrid({
  sessions,
  typeLabels,
}: {
  sessions: SessionSlot[];
  typeLabels: Record<SessionType, string>;
}) {
  return (
    <div
      className="grid"
      style={{
        gridTemplateColumns: "3.75rem 1fr",
        gridTemplateRows: `repeat(${HOURS.length}, 3.25rem)`,
        border: `1px solid ${COLORS.hairline}`,
        borderTop: "none",
      }}
    >
      {HOURS.map((hour, hourIndex) => (
        <div
          key={`label-${hour}`}
          className="flex items-start justify-end px-2 pt-1 text-sm"
          style={{
            gridColumn: 1,
            gridRow: hourIndex + 1,
            borderTop: `1px solid ${COLORS.hairline}`,
            color: COLORS.textSecondary,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {formatHour(hour)}
        </div>
      ))}

      {HOURS.map((hour, hourIndex) => (
        <div
          key={`cell-${hour}`}
          style={{
            gridColumn: 2,
            gridRow: hourIndex + 1,
            borderTop: `1px solid ${COLORS.hairline}`,
          }}
        />
      ))}

      <div style={{ gridColumn: 2, gridRow: `1 / span ${HOURS.length}`, position: "relative" }}>
        <DayOverlay sessions={sessions} typeLabels={typeLabels} />
      </div>
    </div>
  );
}

// Grid semanal completo (lunes-viernes en columnas). Usado en escritorio
// (≥640px): ver breakpoint en DESIGN.md.
function WeekGrid({
  days,
  sessionsByDay,
  typeLabels,
}: {
  days: { key: DayKey; label: string }[];
  sessionsByDay: Record<string, SessionSlot[]>;
  typeLabels: Record<SessionType, string>;
}) {
  return (
    <div
      className="grid overflow-x-auto"
      style={{
        gridTemplateColumns: `4.5rem repeat(${days.length}, minmax(9rem, 1fr))`,
        gridTemplateRows: `2.5rem repeat(${HOURS.length}, 3.5rem)`,
        border: `1px solid ${COLORS.hairline}`,
      }}
    >
      <div style={{ borderBottom: `1px solid ${COLORS.hairline}` }} />
      {days.map(({ key, label }) => (
        <div
          key={key}
          className="flex items-center justify-center text-sm font-medium"
          style={{ borderBottom: `1px solid ${COLORS.hairline}`, color: COLORS.textPrimary }}
        >
          {label}
        </div>
      ))}

      {HOURS.map((hour, hourIndex) => (
        <div
          key={`label-${hour}`}
          className="flex items-start justify-end px-2 pt-1 text-sm"
          style={{
            gridColumn: 1,
            gridRow: hourIndex + 2,
            borderTop: `1px solid ${COLORS.hairline}`,
            color: COLORS.textSecondary,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {formatHour(hour)}
        </div>
      ))}

      {HOURS.map((hour, hourIndex) =>
        days.map(({ key }, dayIndex) => (
          <div
            key={`cell-${key}-${hour}`}
            style={{
              gridColumn: dayIndex + 2,
              gridRow: hourIndex + 2,
              borderTop: `1px solid ${COLORS.hairline}`,
            }}
          />
        )),
      )}

      {days.map(({ key }, dayIndex) => (
        <div
          key={`overlay-${key}`}
          style={{
            gridColumn: dayIndex + 2,
            gridRow: `2 / span ${HOURS.length}`,
            position: "relative",
          }}
        >
          <DayOverlay sessions={sessionsByDay[key]} typeLabels={typeLabels} />
        </div>
      ))}
    </div>
  );
}

export function ScheduleView({
  subjects,
  sessions,
  locations,
}: {
  subjects: SubjectOption[];
  sessions: SessionSlot[];
  locations: Location[];
}) {
  const t = useTranslations("SchedulePage");
  const locale = useLocale();

  const days = useMemo(
    () =>
      DAY_KEYS.map((key) => ({
        key,
        label: t(`days.${key.toLowerCase() as Lowercase<DayKey>}`),
        shortLabel: t(`daysShort.${key.toLowerCase() as Lowercase<DayKey>}`),
      })),
    [t],
  );

  const typeLabels: Record<SessionType, string> = useMemo(
    () => ({
      THEORY: t("sessionType.theory"),
      LAB: t("sessionType.lab"),
      PROBLEMS: t("sessionType.problems"),
      THEORY_LAB: t("sessionType.theoryLab"),
    }),
    [t],
  );

  const [selectedGroups, setSelectedGroups] = useState<Record<string, string[]>>(() =>
    Object.fromEntries(subjects.map((subject) => [subject.id, [...GROUPS]])),
  );
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(() => todayWeekdayIndex());

  function toggleGroup(subjectId: string, group: string) {
    setSelectedGroups((current) => {
      const active = current[subjectId] ?? [];
      const next = active.includes(group)
        ? active.filter((g) => g !== group)
        : [...active, group];
      return { ...current, [subjectId]: next };
    });
  }

  // Marca/desmarca un grupo (10/11/12) para todas las asignaturas a la vez.
  function toggleGroupColumn(group: string, checked: boolean) {
    setSelectedGroups((current) => {
      const next = { ...current };
      for (const subject of subjects) {
        const active = current[subject.id] ?? [];
        next[subject.id] = checked
          ? active.includes(group)
            ? active
            : [...active, group]
          : active.filter((g) => g !== group);
      }
      return next;
    });
  }

  const visibleSessions = useMemo(
    () => sessions.filter((session) => selectedGroups[session.subjectId]?.includes(session.groupName)),
    [sessions, selectedGroups],
  );

  const sessionsByDay = useMemo(() => {
    const map: Record<string, SessionSlot[]> = Object.fromEntries(
      DAY_KEYS.map((key) => [key, []]),
    );
    for (const session of visibleSessions) {
      map[session.dayOfWeek]?.push(session);
    }
    return map;
  }, [visibleSessions]);

  return (
    <div className="flex flex-col gap-8 sm:gap-10">
      <section className="flex flex-col gap-3">
        <h2 className="font-display text-sm font-medium" style={{ color: COLORS.textPrimary }}>
          {t("groupsToShow")}
        </h2>
        <div style={{ borderTop: `1px solid ${COLORS.hairline}` }}>
          <div
            className="flex flex-wrap items-center justify-between gap-3 py-2"
            style={{ backgroundColor: COLORS.backgroundSecondary, borderBottom: `1px solid ${COLORS.hairline}` }}
          >
            <span className="px-0.5 text-sm" style={{ color: COLORS.textSecondary }}>
              {t("allSubjects")}
            </span>
            <div className="flex gap-2">
              {GROUPS.map((group) => {
                const total = subjects.length;
                const checkedCount = subjects.filter((subject) =>
                  selectedGroups[subject.id]?.includes(group),
                ).length;
                const allChecked = total > 0 && checkedCount === total;
                const someChecked = checkedCount > 0 && !allChecked;
                return (
                  <label
                    key={group}
                    className="flex min-h-11 min-w-11 cursor-pointer items-center justify-center gap-1.5 rounded-md px-3 text-base font-medium transition-colors"
                    style={{
                      border: `1px solid ${COLORS.hairline}`,
                      backgroundColor: allChecked ? COLORS.textPrimary : COLORS.background,
                      color: allChecked ? COLORS.background : COLORS.textSecondary,
                    }}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={allChecked}
                      ref={(el) => {
                        if (el) el.indeterminate = someChecked;
                      }}
                      onChange={() => toggleGroupColumn(group, !allChecked)}
                    />
                    {group}
                  </label>
                );
              })}
            </div>
          </div>
          {subjects.map((subject) => (
            <div
              key={subject.id}
              className="flex flex-wrap items-center justify-between gap-3 py-3"
              style={{ borderBottom: `1px solid ${COLORS.hairline}` }}
            >
              <a
                href={syllabusUrl(subject.code, locale)}
                target="_blank"
                rel="noopener noreferrer"
                className="nav-item flex items-center gap-3"
                title={t("viewSyllabus")}
              >
                <span
                  aria-hidden
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: UNIVERSITY_COLORS[subject.university] }}
                />
                <div className="flex flex-col">
                  <span className="underline-link text-sm font-medium" style={{ color: COLORS.textPrimary }}>
                    {subject.code}
                  </span>
                  <span className="text-sm font-normal" style={{ color: COLORS.textSecondary }}>
                    {subject.name}
                  </span>
                </div>
              </a>

              <div className="flex gap-2">
                {GROUPS.map((group) => {
                  const isChecked = selectedGroups[subject.id]?.includes(group) ?? false;
                  return (
                    <label
                      key={group}
                      className="flex min-h-11 min-w-11 cursor-pointer items-center justify-center gap-1.5 rounded-md px-3 text-base font-medium transition-colors"
                      style={{
                        border: `1px solid ${COLORS.hairline}`,
                        backgroundColor: isChecked ? COLORS.textPrimary : COLORS.background,
                        color: isChecked ? COLORS.background : COLORS.textSecondary,
                      }}
                    >
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={isChecked}
                        onChange={() => toggleGroup(subject.id, group)}
                      />
                      {group}
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Móvil (<640px): un día a la vez, con pestañas. */}
      <div className="sm:hidden">
        <div className="flex" style={{ borderBottom: `1px solid ${COLORS.hairline}` }}>
          {days.map(({ key, shortLabel }, dayIndex) => {
            const isSelected = dayIndex === selectedDayIndex;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedDayIndex(dayIndex)}
                className="min-h-11 flex-1 text-base font-medium"
                style={{
                  color: isSelected ? COLORS.textPrimary : COLORS.textSecondary,
                  borderBottom: isSelected
                    ? `2px solid ${COLORS.textPrimary}`
                    : "2px solid transparent",
                }}
              >
                {shortLabel}
              </button>
            );
          })}
        </div>
        <SingleDayGrid
          sessions={sessionsByDay[days[selectedDayIndex].key]}
          typeLabels={typeLabels}
        />
      </div>

      {/* Escritorio (≥640px): semana completa lunes-viernes. */}
      <div className="hidden sm:block">
        <WeekGrid days={days} sessionsByDay={sessionsByDay} typeLabels={typeLabels} />
      </div>

      <section className="flex flex-col gap-3" style={{ borderTop: `1px solid ${COLORS.hairline}`, paddingTop: "1.5rem" }}>
        <h2 className="font-display text-lg font-medium" style={{ color: COLORS.textPrimary }}>
          {t("locationsHeading")}
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {locations.map((location) => (
            <div key={location.code} className="flex flex-col gap-1">
              <span
                className="flex items-center gap-2 text-sm font-medium"
                style={{ color: COLORS.textPrimary }}
              >
                <span
                  aria-hidden
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: UNIVERSITY_COLORS[location.code] }}
                />
                {location.code}
              </span>
              <a
                href={mapsUrl(location.address)}
                target="_blank"
                rel="noopener noreferrer"
                className="nav-item text-sm"
                style={{ color: COLORS.textSecondary }}
              >
                <span className="underline-link">{location.address}</span>
              </a>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
