import { getTranslations } from "next-intl/server";
import { CONTACT_EMAIL } from "@/lib/contact";
import { COLORS } from "@/lib/design";

export default async function ContactPage() {
  const t = await getTranslations("ContactPage");

  return (
    <div className="flex flex-1 flex-col py-12">
      <div className="flex w-full max-w-3xl flex-col gap-6">
        <h1 className="font-display text-2xl sm:text-3xl" style={{ color: COLORS.textPrimary }}>
          {t("title")}
        </h1>

        <p className="text-base" style={{ color: COLORS.textSecondary }}>
          {t("intro")}
        </p>

        <div className="flex flex-col gap-1">
          <span className="text-sm" style={{ color: COLORS.textSecondary }}>
            {t("emailLabel")}
          </span>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="text-base font-medium"
            style={{ color: COLORS.textPrimary }}
          >
            {CONTACT_EMAIL}
          </a>
        </div>

        <p className="text-base" style={{ color: COLORS.textSecondary }}>
          {t("outro")}
        </p>
      </div>
    </div>
  );
}
