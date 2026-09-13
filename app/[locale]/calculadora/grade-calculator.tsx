"use client";

import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { COLORS } from "@/lib/design";
import { useAnonId } from "@/lib/use-anon-id";

export type SubjectOption = { id: string; code: string; name: string };
export type SavedGrade = { subjectId: string; component: string; value: number };

type ComponentRow = {
  key: string;
  name: string;
  weight: string;
  value: string;
  // Nombre bajo el que este componente está persistido ahora mismo en
  // UserGrade (null si nunca se ha guardado). Al renombrar hay que
  // borrar la fila antigua antes de crear la nueva — el nombre es la
  // clave (ver UserGrade.component en el schema).
  savedAs: string | null;
};

function parseGrade(raw: string): number | null {
  const trimmed = raw.trim();
  if (trimmed === "") return null;
  const n = Number(trimmed.replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

function formatGrade(value: number, locale: string): string {
  const fixed = value.toFixed(1);
  return locale === "en" ? fixed : fixed.replace(".", ",");
}

function makeRow(partial: Partial<ComponentRow> = {}): ComponentRow {
  return {
    key: crypto.randomUUID(),
    name: "",
    weight: "",
    value: "",
    savedAs: null,
    ...partial,
  };
}

function initialRows(subjectId: string, savedGrades: SavedGrade[], locale: string, defaultName: string): ComponentRow[] {
  const rows = savedGrades
    .filter((grade) => grade.subjectId === subjectId)
    .map((grade) =>
      makeRow({ name: grade.component, value: formatGrade(grade.value, locale), savedAs: grade.component }),
    );
  if (rows.length > 0) return rows;
  return [makeRow({ name: `${defaultName} 1` }), makeRow({ name: `${defaultName} 2` })];
}

type Result =
  | { status: "empty" }
  | { status: "no-target" }
  | { status: "too-many-unknowns" }
  | { status: "zero-weight" }
  | { status: "complete"; average: number }
  | { status: "solved"; needed: number; maxAchievable: number; componentName: string };

function computeResult(rows: ComponentRow[], targetRaw: string): Result {
  const target = parseGrade(targetRaw);
  const parsed = rows
    .map((row) => ({ name: row.name.trim(), weight: parseGrade(row.weight), value: parseGrade(row.value) }))
    .filter((row) => row.name !== "" && row.weight !== null && row.weight > 0) as {
    name: string;
    weight: number;
    value: number | null;
  }[];

  if (parsed.length === 0) return { status: "empty" };
  if (target === null) return { status: "no-target" };

  const totalWeight = parsed.reduce((sum, row) => sum + row.weight, 0);
  const unknowns = parsed.filter((row) => row.value === null);

  if (unknowns.length > 1) return { status: "too-many-unknowns" };

  if (unknowns.length === 0) {
    const weighted = parsed.reduce((sum, row) => sum + row.weight * (row.value ?? 0), 0);
    return { status: "complete", average: weighted / totalWeight };
  }

  const unknown = unknowns[0];
  if (!unknown.weight) return { status: "zero-weight" };
  const known = parsed.filter((row) => row.value !== null);
  const knownWeighted = known.reduce((sum, row) => sum + row.weight * (row.value ?? 0), 0);
  const needed = (target * totalWeight - knownWeighted) / unknown.weight;
  const maxAchievable = (knownWeighted + unknown.weight * 10) / totalWeight;
  return { status: "solved", needed, maxAchievable, componentName: unknown.name };
}

export function GradeCalculator({
  subjects,
  savedGrades,
}: {
  subjects: SubjectOption[];
  savedGrades: SavedGrade[];
}) {
  const t = useTranslations("GradeCalculatorPage");
  const locale = useLocale();
  const anonId = useAnonId();

  const [selectedSubjectId, setSelectedSubjectId] = useState(subjects[0]?.id ?? "");
  const [rowsBySubject, setRowsBySubject] = useState<Record<string, ComponentRow[]>>(() =>
    Object.fromEntries(
      subjects.map((subject) => [subject.id, initialRows(subject.id, savedGrades, locale, t("component"))]),
    ),
  );
  const [targetBySubject, setTargetBySubject] = useState<Record<string, string>>({});

  const rows = useMemo(() => rowsBySubject[selectedSubjectId] ?? [], [rowsBySubject, selectedSubjectId]);
  const target = targetBySubject[selectedSubjectId] ?? "";
  const result = useMemo(() => computeResult(rows, target), [rows, target]);

  function updateRows(updater: (rows: ComponentRow[]) => ComponentRow[]) {
    setRowsBySubject((current) => ({
      ...current,
      [selectedSubjectId]: updater(current[selectedSubjectId] ?? []),
    }));
  }

  function updateRow(key: string, patch: Partial<ComponentRow>) {
    updateRows((current) => current.map((row) => (row.key === key ? { ...row, ...patch } : row)));
  }

  function deleteSaved(component: string) {
    if (!anonId) return;
    fetch("/api/grades", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ anonId, subjectId: selectedSubjectId, component }),
    }).catch(() => {});
  }

  function removeRow(row: ComponentRow) {
    if (row.savedAs) deleteSaved(row.savedAs);
    updateRows((current) => current.filter((r) => r.key !== row.key));
  }

  function addRow() {
    updateRows((current) => [...current, makeRow({ name: `${t("component")} ${current.length + 1}` })]);
  }

  // Se llama al perder el foco de nombre o nota: guarda (o borra, si se
  // ha vaciado la nota) el valor real en UserGrade. El peso nunca se
  // persiste — se introduce de nuevo cada vez (así lo decidiste).
  function persist(row: ComponentRow) {
    if (!anonId) return;
    const trimmedName = row.name.trim();
    const parsedValue = parseGrade(row.value);

    if (row.savedAs && row.savedAs !== trimmedName) {
      deleteSaved(row.savedAs);
    }

    if (!trimmedName || parsedValue === null) {
      if (row.savedAs) updateRow(row.key, { savedAs: null });
      return;
    }

    fetch("/api/grades", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ anonId, subjectId: selectedSubjectId, component: trimmedName, value: parsedValue }),
    })
      .then(() => updateRow(row.key, { savedAs: trimmedName }))
      .catch(() => {});
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap gap-2">
        {subjects.map((subject) => {
          const isActive = subject.id === selectedSubjectId;
          return (
            <button
              key={subject.id}
              type="button"
              onClick={() => setSelectedSubjectId(subject.id)}
              className="flex min-h-11 items-center rounded-md px-3 text-sm font-medium transition-colors"
              style={{
                border: `1px solid ${COLORS.hairline}`,
                backgroundColor: isActive ? COLORS.textPrimary : COLORS.background,
                color: isActive ? COLORS.background : COLORS.textSecondary,
              }}
            >
              {subject.code}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-10 sm:grid-cols-2">
        <div className="flex flex-col gap-4" style={{ borderTop: `1px solid ${COLORS.hairline}`, paddingTop: "1.5rem" }}>
          {rows.map((row) => (
            <div key={row.key} className="flex flex-wrap items-end gap-3">
              <label className="flex min-w-[9rem] flex-1 flex-col gap-2">
                <span className="text-xs" style={{ color: COLORS.textSecondary }}>
                  {t("componentLabel")}
                </span>
                <input
                  type="text"
                  value={row.name}
                  onChange={(e) => updateRow(row.key, { name: e.target.value })}
                  onBlur={() => persist(row)}
                  className="min-h-11 rounded-md px-3 text-base"
                  style={{ border: `1px solid ${COLORS.hairline}`, color: COLORS.textPrimary }}
                />
              </label>
              <label className="flex w-20 flex-col gap-2">
                <span className="text-xs" style={{ color: COLORS.textSecondary }}>
                  {t("weightLabel")}
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={row.weight}
                  onChange={(e) => updateRow(row.key, { weight: e.target.value })}
                  className="min-h-11 rounded-md px-3 text-base"
                  style={{ border: `1px solid ${COLORS.hairline}`, color: COLORS.textPrimary }}
                />
              </label>
              <label className="flex w-24 flex-col gap-2">
                <span className="text-xs" style={{ color: COLORS.textSecondary }}>
                  {t("valueLabel")}
                </span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={row.value}
                  onChange={(e) => updateRow(row.key, { value: e.target.value })}
                  onBlur={() => persist(row)}
                  placeholder="—"
                  className="min-h-11 rounded-md px-3 text-base"
                  style={{ border: `1px solid ${COLORS.hairline}`, color: COLORS.textPrimary }}
                />
              </label>
              <button
                type="button"
                onClick={() => removeRow(row)}
                aria-label={t("removeComponent")}
                className="nav-item flex min-h-11 min-w-11 items-center justify-center text-sm"
                style={{ color: COLORS.textSecondary }}
              >
                ×
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={addRow}
            className="nav-item flex min-h-11 w-fit items-center text-sm"
            style={{ color: COLORS.textPrimary }}
          >
            <span className="underline-link">{t("addComponent")}</span>
          </button>

          <label className="flex max-w-xs flex-col gap-2" style={{ marginTop: "0.5rem" }}>
            <span className="text-xs" style={{ color: COLORS.textSecondary }}>
              {t("targetLabel")}
            </span>
            <input
              type="text"
              inputMode="decimal"
              value={target}
              onChange={(e) =>
                setTargetBySubject((current) => ({ ...current, [selectedSubjectId]: e.target.value }))
              }
              className="min-h-11 rounded-md px-3 text-base"
              style={{ border: `1px solid ${COLORS.hairline}`, color: COLORS.textPrimary }}
            />
          </label>

          {anonId && (
            <p className="text-xs" style={{ color: COLORS.textSecondary }}>
              {t("savedHint")}
            </p>
          )}
        </div>

        <div style={{ borderTop: `1px solid ${COLORS.hairline}`, paddingTop: "1.5rem" }}>
          {result.status === "empty" && (
            <p className="text-base" style={{ color: COLORS.textSecondary }}>
              {t("resultEmpty")}
            </p>
          )}
          {result.status === "no-target" && (
            <p className="text-base" style={{ color: COLORS.textSecondary }}>
              {t("resultNoTarget")}
            </p>
          )}
          {result.status === "too-many-unknowns" && (
            <p className="text-base" style={{ color: COLORS.textSecondary }}>
              {t("resultTooManyUnknowns")}
            </p>
          )}
          {result.status === "zero-weight" && (
            <p className="text-base" style={{ color: COLORS.textSecondary }}>
              {t("resultZeroWeight")}
            </p>
          )}

          {result.status === "complete" && (
            <>
              <p
                className="uppercase"
                style={{ fontSize: "12.5px", letterSpacing: "0.06em", color: COLORS.textSecondary }}
              >
                {t("currentAverageHeading")}
              </p>
              <p
                className="font-display"
                style={{ color: COLORS.textPrimary, fontSize: "56px", letterSpacing: "-0.02em", marginTop: "12px" }}
              >
                {formatGrade(result.average, locale)}
              </p>
            </>
          )}

          {result.status === "solved" && (
            <>
              <p
                className="uppercase"
                style={{ fontSize: "12.5px", letterSpacing: "0.06em", color: COLORS.textSecondary }}
              >
                {t("resultHeading", { component: result.componentName })}
              </p>
              <p
                className="font-display"
                style={{ color: COLORS.textPrimary, fontSize: "56px", letterSpacing: "-0.02em", marginTop: "12px" }}
              >
                {formatGrade(result.needed, locale)}
              </p>
              <p className="max-w-[40ch] text-sm" style={{ color: COLORS.textSecondary, marginTop: "14px" }}>
                {result.needed > 10
                  ? t("resultNotReachable", { max: formatGrade(result.maxAchievable, locale) })
                  : result.needed <= 0
                    ? t("resultAlreadyAchieved", { component: result.componentName })
                    : t("resultReachable", {
                        needed: formatGrade(result.needed, locale),
                        component: result.componentName,
                        target: formatGrade(parseGrade(target) ?? 0, locale),
                      })}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
