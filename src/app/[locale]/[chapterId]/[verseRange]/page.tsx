import { Metadata } from "next";
import { SITE_URL } from "@/lib/config";
import { getInitialRangeData } from "@/lib/server/quran-initial-data";
import QuranReadingContainer from "@/components/quran-reader/QuranReadingContainer";
import arChapters from "../../../../../data/chapters/ar.json";
import enChapters from "../../../../../data/chapters/en.json";

interface VerseRangePageProps {
  params: Promise<{ locale: string; chapterId: string; verseRange: string }>;
}

export async function generateMetadata({
  params,
}: VerseRangePageProps): Promise<Metadata> {
  const { locale, chapterId, verseRange } = await params;
  const chapters = locale === "ar" ? arChapters : enChapters;
  const chapter = (chapters as Record<string, any>)[chapterId];

  if (!chapter) {
    return {};
  }

  const baseUrl = SITE_URL;
  const isAr = locale === "ar";

  const title = isAr
    ? `سورة ${chapter.transliteratedName} الآيات ${verseRange} - قراءة واستماع | Quran`
    : `Quran: Surah ${chapter.transliteratedName} Verses ${verseRange} - Read & Listen | Quran`;

  const description = isAr
    ? `اقرأ واستمع إلى سورة ${chapter.transliteratedName} الآيات ${verseRange} بالرسم العثماني مع التفسير والترجمة كلمة بكلمة. موقع قرآن (Quran) خالي من الإعلانات.`
    : `Read and listen to Surah ${chapter.transliteratedName} verses ${verseRange} of the Holy Quran online with word-by-word translations and audio. Free of ads on Quran.`;

  return {
    title,
    description,
    alternates: {
      canonical: `${baseUrl}/${locale}/${chapterId}/${verseRange}`,
      languages: {
        ar: `${baseUrl}/ar/${chapterId}/${verseRange}`,
        en: `${baseUrl}/en/${chapterId}/${verseRange}`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/${locale}/${chapterId}/${verseRange}`,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function VerseRangePage({ params }: VerseRangePageProps) {
  const { locale, chapterId, verseRange } = await params;
  const {
    chapter,
    chapterIdNum,
    start,
    initialVerses,
    readingPref,
  } = await getInitialRangeData(chapterId, verseRange, locale);

  return (
    <QuranReadingContainer
      type="chapter"
      id={chapterIdNum}
      locale={locale}
      initialVerses={initialVerses}
      readingPref={readingPref}
      chapter={chapter}
      verseRange={verseRange}
      startVerse={start}
    />
  );
}
