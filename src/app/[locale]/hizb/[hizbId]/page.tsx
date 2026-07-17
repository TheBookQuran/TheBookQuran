import { generateDivisionMetadata } from "@/lib/server/metadata-generator";
import { getInitialDivisionData } from "@/lib/server/quran-initial-data";
import QuranReadingContainer from "@/components/quran-reader/QuranReadingContainer";

interface HizbPageProps {
  params: Promise<{ locale: string; hizbId: string }>;
}

export async function generateMetadata({ params }: HizbPageProps) {
  const { locale, hizbId } = await params;
  return generateDivisionMetadata({ type: "hizb", id: hizbId, locale });
}

export default async function HizbPage({ params }: HizbPageProps) {
  const { locale, hizbId } = await params;
  const { idNum, initialVerses, readingPref } = await getInitialDivisionData(
    "hizb",
    hizbId,
    locale
  );

  return (
    <QuranReadingContainer
      type="hizb"
      id={idNum}
      locale={locale}
      initialVerses={initialVerses}
      readingPref={readingPref}
    />
  );
}
