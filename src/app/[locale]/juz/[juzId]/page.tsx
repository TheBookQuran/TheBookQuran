import { generateDivisionMetadata } from "@/lib/server/metadata-generator";
import { getInitialDivisionData } from "@/lib/server/quran-initial-data";
import QuranReadingContainer from "@/components/quran-reader/QuranReadingContainer";

interface JuzPageProps {
  params: Promise<{ locale: string; juzId: string }>;
}

export async function generateMetadata({ params }: JuzPageProps) {
  const { locale, juzId } = await params;
  return generateDivisionMetadata({ type: "juz", id: juzId, locale });
}

export default async function JuzPage({ params }: JuzPageProps) {
  const { locale, juzId } = await params;
  const { idNum, initialVerses, readingPref } = await getInitialDivisionData(
    "juz",
    juzId,
    locale
  );

  return (
    <QuranReadingContainer
      type="juz"
      id={idNum}
      locale={locale}
      initialVerses={initialVerses}
      readingPref={readingPref}
    />
  );
}
