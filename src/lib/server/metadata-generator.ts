import { Metadata } from "next";
import { SITE_URL } from "@/lib/config";

interface GenerateDivisionMetadataProps {
  type: "juz" | "hizb" | "rub" | "page";
  id: string;
  locale: string;
}

export function generateDivisionMetadata({
  type,
  id,
  locale,
}: GenerateDivisionMetadataProps): Metadata {
  const baseUrl = SITE_URL;
  const isAr = locale === "ar";

  let title = "";
  let description = "";

  switch (type) {
    case "juz":
      title = isAr
        ? `الجزء ${id} من القرآن الكريم - قراءة واستماع | Quran`
        : `Juz ${id} of the Quran - Read & Listen Online | Quran`;
      description = isAr
        ? `تصفح واقرأ الجزء ${id} من القرآن الكريم بالرسم العثماني مع الترجمة والاستماع بالتظليل التلقائي. موقع قرآن (Quran) خالي من الإعلانات.`
        : `Read and listen to Juz ${id} of the Holy Quran online with word-by-word translations and high-quality audio recitation. Free of ads on Quran.`;
      break;
    case "hizb":
      title = isAr
        ? `الحزب ${id} من القرآن الكريم - قراءة واستماع | Quran`
        : `Hizb ${id} of the Quran - Read & Listen Online | Quran`;
      description = isAr
        ? `تصفح واقرأ الحزب ${id} من القرآن الكريم بالرسم العثماني مع الترجمة والاستماع بالتظليل التلقائي. موقع قرآن (Quran) خالي من الإعلانات.`
        : `Read and listen to Hizb ${id} of the Holy Quran online with word-by-word translations and high-quality audio recitation. Free of ads on Quran.`;
      break;
    case "rub":
      title = isAr
        ? `ربع الحزب ${id} من القرآن الكريم - قراءة واستماع | Quran`
        : `Rub el-Hizb ${id} of the Quran - Read & Listen Online | Quran`;
      description = isAr
        ? `تصفح واقرأ ربع الحزب ${id} من القرآن الكريم بالرسم العثماني مع الترجمة والاستماع بالتظليل التلقائي. موقع قرآن (Quran) خالي من الإعلانات.`
        : `Read and listen to Rub el-Hizb ${id} of the Holy Quran online with word-by-word translations and high-quality audio recitation. Free of ads on Quran.`;
      break;
    case "page":
      title = isAr
        ? `صفحة ${id} من القرآن الكريم - قراءة واستماع | Quran`
        : `Page ${id} of the Quran - Read & Listen Online | Quran`;
      description = isAr
        ? `تصفح واقرأ الصفحة رقم ${id} من مصحف المدينة المنورة بالرسم العثماني مع الترجمة والاستماع. موقع قرآن (Quran) خالي من الإعلانات.`
        : `Read and listen to page ${id} of the Holy Quran (Mushaf) online with translations and audio recitations. Free of ads on Quran.`;
      break;
  }

  const urlPath = `${locale}/${type}/${id}`;
  const canonicalUrl = `${baseUrl}/${urlPath}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        ar: `${baseUrl}/ar/${type}/${id}`,
        en: `${baseUrl}/en/${type}/${id}`,
      },
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}
