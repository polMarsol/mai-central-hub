import { getTranslations } from "next-intl/server";
import { CONTACT_EMAIL } from "@/lib/contact";
import { COLORS } from "@/lib/design";

export default async function FeedbackPage() {
  const t = await getTranslations("FeedbackPage");

  return (
    <div className="flex flex-1 flex-col py-12">
      <div className="flex w-full max-w-3xl flex-col gap-6">
        <h1 className="font-display text-2xl sm:text-3xl" style={{ color: COLORS.textPrimary }}>
          {t("title")}
        </h1>

        <p className="text-base" style={{ color: COLORS.textSecondary }}>
          {t("intro")}
        </p>

        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="flex min-h-11 w-fit items-center rounded-md px-4 text-base font-medium transition-colors"
          style={{ backgroundColor: COLORS.textPrimary, color: COLORS.background }}
        >
          {t("emailCta")}
        </a>

        <p className="text-base" style={{ color: COLORS.textSecondary }}>
          {t("outro")}
        </p>
      </div>
    </div>
  );
}
