import { Metadata } from "next";
import { SITE_URL } from "@/lib/config";
import JsonLd, { getQuranSurahSchema, getBreadcrumbSchema } from "@/components/seo/JsonLd";
import { getInitialChapterData } from "@/lib/server/quran-initial-data";
import QuranReadingContainer from "@/components/quran-reader/QuranReadingContainer";
import arChapters from "../../../../data/chapters/ar.json";
import enChapters from "../../../../data/chapters/en.json";

interface ChapterPageProps {
  params: Promise<{ locale: string; chapterId: string }>;
  searchParams: Promise<{ startingVerse?: string }>;
}

export async function generateMetadata({
  params,
}: ChapterPageProps): Promise<Metadata> {
  const { locale, chapterId } = await params;
  const chapters = locale === "ar" ? arChapters : enChapters;
  const chapter = (chapters as Record<string, any>)[chapterId];

  if (!chapter) {
    return {};
  }

  const baseUrl = SITE_URL;
  const isAr = locale === "ar";

  const title = isAr
    ? `سورة ${chapter.transliteratedName} - قراءة واستماع وتدبر القرآن الكريم | Quran`
    : `Quran: Surah ${chapter.transliteratedName} - Read & Listen Online | Quran`;

  const description = isAr
    ? `اقرأ واستمع إلى سورة ${chapter.transliteratedName} كاملة بالرسم العثماني مع التفسير والترجمة كلمة بكلمة. تحليل لغوي لجذور الكلمات وتلاوات عطرة لأشهر القراء على موقع قرآن (Quran).`
    : `Read, listen, and reflect on Surah ${chapter.transliteratedName} on Quran. Features high-quality audio recitations, word-by-word translations, and root word linguistic analysis of the Holy Quran. Free of ads.`;

  return {
    title,
    description,
    alternates: {
      canonical: `${baseUrl}/${locale}/${chapterId}`,
      languages: {
        ar: `${baseUrl}/ar/${chapterId}`,
        en: `${baseUrl}/en/${chapterId}`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/${locale}/${chapterId}`,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function ChapterPage({ params, searchParams }: ChapterPageProps) {
  const { locale, chapterId } = await params;
  const { startingVerse } = await searchParams;
  const startingVerseNum = startingVerse ? parseInt(startingVerse, 10) : undefined;
  const { chapter, chapterIdNum, initialVerses, readingPref } =
    await getInitialChapterData(chapterId, locale);

  const isAr = locale === "ar";
  const surahSchema = getQuranSurahSchema(
    locale,
    chapterIdNum,
    chapter.transliteratedName,
    chapter.versesCount,
    chapter.translatedName
  );

  const breadcrumbSchema = getBreadcrumbSchema(locale, [
    { name: isAr ? "الرئيسية" : "Home", path: "" },
    {
      name: isAr ? `سورة ${chapter.transliteratedName}` : `Surah ${chapter.transliteratedName}`,
      path: `/${chapterId}`,
    },
  ]);

  return (
    <QuranReadingContainer
      type="chapter"
      id={chapterIdNum}
      locale={locale}
      initialVerses={initialVerses}
      readingPref={readingPref}
      chapter={chapter}
      startingVerse={startingVerseNum}
    >
      <JsonLd schema={surahSchema} />
      <JsonLd schema={breadcrumbSchema} />
    </QuranReadingContainer>
  );
}
