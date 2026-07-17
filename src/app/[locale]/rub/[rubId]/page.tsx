import { generateDivisionMetadata } from "@/lib/server/metadata-generator";
import { getInitialDivisionData } from "@/lib/server/quran-initial-data";
import QuranReadingContainer from "@/components/quran-reader/QuranReadingContainer";

interface RubPageProps {
  params: Promise<{ locale: string; rubId: string }>;
}

export async function generateMetadata({ params }: RubPageProps) {
  const { locale, rubId } = await params;
  return generateDivisionMetadata({ type: "rub", id: rubId, locale });
}

export default async function RubPage({ params }: RubPageProps) {
  const { locale, rubId } = await params;
  const { idNum, initialVerses, readingPref } = await getInitialDivisionData(
    "rub",
    rubId,
    locale
  );

  return (
    <QuranReadingContainer
      type="rub"
      id={idNum}
      locale={locale}
      initialVerses={initialVerses}
      readingPref={readingPref}
    />
  );
}
