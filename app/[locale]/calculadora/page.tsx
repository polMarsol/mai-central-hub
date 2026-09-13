import { cookies } from "next/headers";
import { getTranslations } from "next-intl/server";
import { COLORS } from "@/lib/design";
import { prisma } from "@/lib/prisma";
import { GradeCalculator, type SavedGrade, type SubjectOption } from "./grade-calculator";

const SEMESTER = 1;

export default async function GradeCalculatorPage() {
  const t = await getTranslations("GradeCalculatorPage");

  const cookieStore = await cookies();
  const anonId = cookieStore.get("anon_id")?.value ?? null;

  const subjects = await prisma.subject.findMany({
    where: { semester: SEMESTER },
    orderBy: { code: "asc" },
  });

  const subjectOptions: SubjectOption[] = subjects.map((subject) => ({
    id: subject.id,
    code: subject.code,
    name: subject.name,
  }));

  const savedGrades: SavedGrade[] = anonId
    ? await prisma.userGrade
        .findMany({
          where: { user: { anonId }, subjectId: { in: subjects.map((s) => s.id) } },
        })
        .then((rows) =>
          rows.map((row) => ({ subjectId: row.subjectId, component: row.component, value: row.value })),
        )
    : [];

  return (
    <div className="flex flex-1 flex-col gap-8 py-12 sm:gap-10">
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-xl sm:text-3xl" style={{ color: COLORS.textPrimary }}>
          {t("title")}
        </h1>
        <p className="text-base font-normal" style={{ color: COLORS.textSecondary }}>
          {t("subtitle")}
        </p>
      </div>

      <GradeCalculator subjects={subjectOptions} savedGrades={savedGrades} />
    </div>
  );
}
