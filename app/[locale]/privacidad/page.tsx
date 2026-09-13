import { getTranslations } from "next-intl/server";
import { COLORS } from "@/lib/design";

type Section = { heading: string; body: string };

export default async function PrivacyPage() {
  const t = await getTranslations("PrivacyPage");
  const sections = t.raw("sections") as Section[];

  return (
    <div className="flex flex-1 flex-col py-12">
      <div className="flex w-full max-w-3xl flex-col gap-6">
        <h1 className="font-display text-2xl sm:text-3xl" style={{ color: COLORS.textPrimary }}>
          {t("title")}
        </h1>

        <p className="text-base" style={{ color: COLORS.textSecondary }}>
          {t("intro")}
        </p>

        <div className="flex flex-col">
          {sections.map((section, index) => (
            <div
              key={index}
              className="flex flex-col gap-2 py-4"
              style={{ borderTop: `1px solid ${COLORS.hairline}` }}
            >
              <h2 className="text-base font-medium" style={{ color: COLORS.textPrimary }}>
                {section.heading}
              </h2>
              <p className="text-base" style={{ color: COLORS.textSecondary }}>
                {section.body}
              </p>
            </div>
          ))}
        </div>

        <p
          className="text-base"
          style={{
            color: COLORS.textSecondary,
            borderTop: `1px solid ${COLORS.hairline}`,
            paddingTop: "1.5rem",
          }}
        >
          {t("closing")}
        </p>
      </div>
    </div>
  );
}
