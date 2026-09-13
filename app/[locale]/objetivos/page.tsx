import { getTranslations } from "next-intl/server";
import { COLORS } from "@/lib/design";

export default async function GoalsPage() {
  const t = await getTranslations("GoalsPage");
  const intro = t.raw("intro") as string[];
  const scopeItems = t.raw("scopeItems") as string[];

  return (
    <div className="flex flex-1 flex-col py-12">
      <div className="flex w-full max-w-3xl flex-col gap-8">
        <h1 className="font-display text-2xl sm:text-3xl" style={{ color: COLORS.textPrimary }}>
          {t("title")}
        </h1>

        <div className="flex flex-col gap-4">
          {intro.map((paragraph, index) => (
            <p key={index} className="text-base" style={{ color: COLORS.textSecondary }}>
              {paragraph}
            </p>
          ))}
        </div>

        <div className="flex flex-col gap-3" style={{ borderTop: `1px solid ${COLORS.hairline}`, paddingTop: "1.5rem" }}>
          <h2 className="text-base font-medium" style={{ color: COLORS.textPrimary }}>
            {t("scopeHeading")}
          </h2>
          <ul className="flex flex-col gap-2">
            {scopeItems.map((item, index) => (
              <li
                key={index}
                className="pl-4 text-base"
                style={{ color: COLORS.textSecondary, borderLeft: `2px solid ${COLORS.hairline}` }}
              >
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-3" style={{ borderTop: `1px solid ${COLORS.hairline}`, paddingTop: "1.5rem" }}>
          <h2 className="text-base font-medium" style={{ color: COLORS.textPrimary }}>
            {t("notYetHeading")}
          </h2>
          <p className="text-base" style={{ color: COLORS.textSecondary }}>
            {t("notYetBody")}
          </p>
        </div>
      </div>
    </div>
  );
}
