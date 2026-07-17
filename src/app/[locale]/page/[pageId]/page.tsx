import { generateDivisionMetadata } from "@/lib/server/metadata-generator";
import { getInitialDivisionData } from "@/lib/server/quran-initial-data";
import QuranReadingContainer from "@/components/quran-reader/QuranReadingContainer";

interface PagePageProps {
  params: Promise<{ locale: string; pageId: string }>;
}

export async function generateMetadata({ params }: PagePageProps) {
  const { locale, pageId } = await params;
  return generateDivisionMetadata({ type: "page", id: pageId, locale });
}

export default async function PagePage({ params }: PagePageProps) {
  const { locale, pageId } = await params;
  const { idNum, initialVerses, readingPref } = await getInitialDivisionData(
    "page",
    pageId,
    locale
  );

  return (
    <QuranReadingContainer
      type="page"
      id={idNum}
      locale={locale}
      initialVerses={initialVerses}
      readingPref={readingPref}
    />
  );
}
