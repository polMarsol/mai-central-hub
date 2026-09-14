"use client";

import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import type { ExamOrDeadlineType, University } from "@/app/generated/prisma/client";
import { COLORS, UNIVERSITY_COLORS } from "@/lib/design";

export type CalendarEvent = {
  id: string;
  subjectCode: string;
  university: University;
  date: string; // ISO
  type: ExamOrDeadlineType;
};

type HolidayKey =
  | "catalanNationalDay"
  | "nationalDay"
  | "bridgeDay"
  | "immaculateConception"
  | "christmasBreak"
  | "welcomeEventExchange"
  | "welcomeCeremony"
  | "scheduleChange"
  | "examPrep";

export type Holiday = {
  date: string; // YYYY-MM-DD
  labelKey: HolidayKey;
  // "holiday" = no hay clase ese día. "note" = evento informativo que no
  // bloquea las clases (welcome event, aviso de cambio de horario, etc.).
  kind: "holiday" | "note";
};

type ClassStartNoteKey = "iml" | "ihlt" | "imas" | "par";

export type ClassStart = {
  subjectCode: string;
  university: University;
  date: string; // YYYY-MM-DD
  noteKey?: ClassStartNoteKey;
};

export type InstitutionStart = {
  code: University;
  date: string; // YYYY-MM-DD
};

const GRID_LENGTH = 42; // 6 semanas — cubre cualquier mes con margen

function dateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

// Genera la rejilla del mes (lunes a domingo, con días del mes
// anterior/siguiente para completar la primera y última semana).
function getMonthGrid(year: number, month: number): Date[] {
  const firstOfMonth = new Date(Date.UTC(year, month, 1));
  const firstWeekday = (firstOfMonth.getUTCDay() + 6) % 7; // 0 = lunes
  const start = new Date(Date.UTC(year, month, 1 - firstWeekday));
  return Array.from({ length: GRID_LENGTH }, (_, i) => {
    const d = new Date(start);
    d.setUTCDate(start.getUTCDate() + i);
    return d;
  });
}

function monthKey(date: Date): string {
  return `${date.getUTCFullYear()}-${date.getUTCMonth()}`;
}

export function RealCalendar({
  events,
  holidays,
  classStarts,
  institutionStarts,
}: {
  events: CalendarEvent[];
  holidays: Holiday[];
  classStarts: ClassStart[];
  institutionStarts: InstitutionStart[];
}) {
  const t = useTranslations("CalendarPage");
  const locale = useLocale();

  const examTypeLabels: Record<ExamOrDeadlineType, string> = {
    MIDTERM: t("examType.midterm"),
    EXAM: t("examType.exam"),
    DEADLINE: t("examType.deadline"),
  };

  const initialMonth = useMemo(() => {
    const allDates = [
      ...events.map((e) => new Date(e.date)),
      ...holidays.map((h) => new Date(`${h.date}T00:00:00Z`)),
      ...classStarts.map((c) => new Date(`${c.date}T00:00:00Z`)),
      ...institutionStarts.map((i) => new Date(`${i.date}T00:00:00Z`)),
    ];
    if (allDates.length === 0) return new Date();
    return new Date(Math.min(...allDates.map((d) => d.getTime())));
  }, [events, holidays, classStarts, institutionStarts]);

  const [cursor, setCursor] = useState(
    () => new Date(Date.UTC(initialMonth.getUTCFullYear(), initialMonth.getUTCMonth(), 1)),
  );

  const grid = useMemo(() => getMonthGrid(cursor.getUTCFullYear(), cursor.getUTCMonth()), [cursor]);
  const currentMonthKey = monthKey(cursor);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const event of events) {
      const key = dateKey(new Date(event.date));
      map.set(key, [...(map.get(key) ?? []), event]);
    }
    return map;
  }, [events]);

  const holidaysByDay = useMemo(() => {
    const map = new Map<string, Holiday>();
    for (const holiday of holidays) map.set(holiday.date, holiday);
    return map;
  }, [holidays]);

  const classStartsByDay = useMemo(() => {
    const map = new Map<string, ClassStart[]>();
    for (const classStart of classStarts) {
      map.set(classStart.date, [...(map.get(classStart.date) ?? []), classStart]);
    }
    return map;
  }, [classStarts]);

  const institutionStartsByDay = useMemo(() => {
    const map = new Map<string, InstitutionStart[]>();
    for (const start of institutionStarts) {
      map.set(start.date, [...(map.get(start.date) ?? []), start]);
    }
    return map;
  }, [institutionStarts]);

  const weekdayFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale, { weekday: "short", timeZone: "UTC" }),
    [locale],
  );
  const monthFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale, { month: "long", year: "numeric", timeZone: "UTC" }),
    [locale],
  );
  const dayFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }),
    [locale],
  );
  const timeFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit", timeZone: "UTC" }),
    [locale],
  );

  const weekdayLabels = useMemo(() => {
    // Cualquier semana sirve: solo se usa para los nombres cortos Lun-Dom.
    const reference = getMonthGrid(2026, 0).slice(0, 7);
    return reference.map((d) => weekdayFormatter.format(d));
  }, [weekdayFormatter]);

  function goToMonth(offset: number) {
    setCursor((current) => new Date(Date.UTC(current.getUTCFullYear(), current.getUTCMonth() + offset, 1)));
  }

  function goToToday() {
    const now = new Date();
    setCursor(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)));
  }

  const todayKey = dateKey(new Date());

  const upcoming = useMemo(
    () => [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [events],
  );

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-3">
        <h2 className="font-display text-lg font-medium" style={{ color: COLORS.textPrimary }}>
          {t("upcomingHeading")}
        </h2>
        {upcoming.length === 0 ? (
          <p className="text-sm" style={{ color: COLORS.textSecondary }}>
            {t("noUpcoming")}
          </p>
        ) : (
          <div style={{ borderTop: `1px solid ${COLORS.hairline}` }}>
            {upcoming.map((event) => {
              const date = new Date(event.date);
              return (
                <div
                  key={event.id}
                  className="flex flex-wrap items-center justify-between gap-3 py-3"
                  style={{ borderBottom: `1px solid ${COLORS.hairline}` }}
                >
                  <div className="flex items-center gap-3">
                    <span
                      aria-hidden
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: UNIVERSITY_COLORS[event.university] }}
                    />
                    <span className="text-sm font-medium" style={{ color: COLORS.textPrimary }}>
                      {event.subjectCode}
                    </span>
                    <span className="text-sm" style={{ color: COLORS.textSecondary }}>
                      {examTypeLabels[event.type]}
                    </span>
                  </div>
                  <span
                    className="text-sm capitalize"
                    style={{ color: COLORS.textSecondary, fontVariantNumeric: "tabular-nums" }}
                  >
                    {dayFormatter.format(date)} · {timeFormatter.format(date)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3" style={{ borderTop: `1px solid ${COLORS.hairline}`, paddingTop: "1.5rem" }}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2
            className="font-display text-lg capitalize"
            style={{ color: COLORS.textPrimary }}
          >
            {monthFormatter.format(cursor)}
          </h2>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => goToMonth(-1)}
              aria-label={t("previousMonth")}
              className="nav-item flex min-h-11 min-w-11 items-center justify-center rounded-md text-base"
              style={{ border: `1px solid ${COLORS.hairline}`, color: COLORS.textPrimary }}
            >
              ‹
            </button>
            <button
              type="button"
              onClick={goToToday}
              className="nav-item flex min-h-11 items-center rounded-md px-3 text-sm"
              style={{ border: `1px solid ${COLORS.hairline}`, color: COLORS.textPrimary }}
            >
              {t("todayButton")}
            </button>
            <button
              type="button"
              onClick={() => goToMonth(1)}
              aria-label={t("nextMonth")}
              className="nav-item flex min-h-11 min-w-11 items-center justify-center rounded-md text-base"
              style={{ border: `1px solid ${COLORS.hairline}`, color: COLORS.textPrimary }}
            >
              ›
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 text-sm" style={{ color: COLORS.textSecondary }}>
          <span className="flex items-center gap-1.5">
            <span aria-hidden className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS.textPrimary }} />
            {t("legendExam")}
          </span>
          <span className="flex items-center gap-1.5">
            <span aria-hidden className="h-2 w-2 rounded-full" style={{ border: `1px solid ${COLORS.textPrimary}` }} />
            {t("legendClassStart")}
          </span>
          <span className="flex items-center gap-1.5">
            <span aria-hidden className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS.textSecondary }} />
            {t("legendHoliday")}
          </span>
        </div>

        <div className="grid grid-cols-7" style={{ border: `1px solid ${COLORS.hairline}` }}>
          {weekdayLabels.map((label) => (
            <div
              key={label}
              className="p-2 text-center text-xs capitalize"
              style={{ borderBottom: `1px solid ${COLORS.hairline}`, color: COLORS.textSecondary }}
            >
              {label}
            </div>
          ))}

          {grid.map((day) => {
            const key = dateKey(day);
            const inCurrentMonth = monthKey(day) === currentMonthKey;
            const dayEvents = eventsByDay.get(key) ?? [];
            const dayClassStarts = classStartsByDay.get(key) ?? [];
            const dayInstitutionStarts = institutionStartsByDay.get(key) ?? [];
            const holiday = holidaysByDay.get(key);
            const isToday = key === todayKey;

            return (
              <div
                key={key}
                className="flex min-h-[5.5rem] flex-col gap-1 p-1.5 sm:min-h-[6.5rem] sm:p-2"
                style={{
                  borderRight: `1px solid ${COLORS.hairline}`,
                  borderBottom: `1px solid ${COLORS.hairline}`,
                  backgroundColor: holiday?.kind === "holiday" ? COLORS.backgroundSecondary : COLORS.background,
                  opacity: inCurrentMonth ? 1 : 0.35,
                }}
              >
                <span
                  className="text-xs"
                  style={{
                    color: isToday ? COLORS.background : COLORS.textSecondary,
                    backgroundColor: isToday ? COLORS.textPrimary : "transparent",
                    borderRadius: "9999px",
                    width: "1.25rem",
                    height: "1.25rem",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {day.getUTCDate()}
                </span>

                {holiday && (
                  <span
                    className="truncate text-[10px] sm:text-xs"
                    style={{
                      color: COLORS.textSecondary,
                      fontStyle: holiday.kind === "note" ? "italic" : "normal",
                    }}
                  >
                    {t(`holidays.${holiday.labelKey}`)}
                  </span>
                )}

                {dayInstitutionStarts.map((start) => (
                  <span
                    key={start.code}
                    className="truncate text-[10px] sm:text-xs"
                    style={{ color: UNIVERSITY_COLORS[start.code] }}
                  >
                    {t("institutionStart", { code: start.code })}
                  </span>
                ))}

                {dayClassStarts.map((classStart) => (
                  <div key={classStart.subjectCode} className="flex flex-col gap-0.5">
                    <span
                      className="w-fit truncate rounded px-1 py-0.5 text-[10px] font-medium sm:text-xs"
                      style={{
                        border: `1px solid ${UNIVERSITY_COLORS[classStart.university]}`,
                        color: COLORS.textPrimary,
                      }}
                    >
                      {classStart.subjectCode}
                    </span>
                    {classStart.noteKey && (
                      <span
                        title={t(`classStartNotes.${classStart.noteKey}`)}
                        className="truncate text-[10px] italic sm:text-xs"
                        style={{ color: COLORS.textSecondary }}
                      >
                        {t(`classStartNotes.${classStart.noteKey}`)}
                      </span>
                    )}
                  </div>
                ))}

                {dayEvents.map((event) => (
                  <span
                    key={event.id}
                    className="w-fit truncate rounded px-1 py-0.5 text-[10px] font-medium sm:text-xs"
                    style={{
                      backgroundColor: UNIVERSITY_COLORS[event.university],
                      color: COLORS.background,
                    }}
                  >
                    {event.subjectCode}
                  </span>
                ))}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
