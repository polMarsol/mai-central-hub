import { getTranslations } from "next-intl/server";
import { COLORS } from "@/lib/design";

export default async function AboutPage() {
  const t = await getTranslations("AboutPage");
  const paragraphs = t.raw("paragraphs") as string[];

  return (
    <div className="flex flex-1 flex-col py-12">
      <div className="flex w-full max-w-3xl flex-col gap-6">
        <h1 className="font-display text-2xl sm:text-3xl" style={{ color: COLORS.textPrimary }}>
          {t("title")}
        </h1>

        <div className="flex flex-col gap-4">
          {paragraphs.map((paragraph, index) => (
            <p key={index} className="text-base" style={{ color: COLORS.textSecondary }}>
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
