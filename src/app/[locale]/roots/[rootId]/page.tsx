import React from "react";
import { getTranslations } from "next-intl/server";
import { SITE_URL } from "@/lib/config";
import RootOccurrencesClient from "./RootOccurrencesClient";

interface RootPageProps {
  params: Promise<{ locale: string; rootId: string }>;
}

export async function generateMetadata({ params }: RootPageProps) {
  const { locale, rootId } = await params;
  const baseUrl = SITE_URL;
  const isAr = locale === "ar";

  let rootsData;
  try {
    rootsData = await import(`../../../../../public/data/linguistics/roots.json`);
  } catch (err) {
    console.error("Failed to load roots.json on server metadata:", err);
  }

  const root = (rootsData?.default as any)?.[rootId];
  const rootText = root?.arabic_text || rootId;
  const count = root?.occurrences_count || 0;

  const title = isAr
    ? `تحليل الجذر اللغوي (${rootText}) في القرآن الكريم - ${count} مواضع | Quran`
    : `Linguistic Root (${rootText}) - ${count} occurrences in Quran | Quran`;

  const description = isAr
    ? `اكتشف وادرس كافة مواضع ورود الجذر اللغوي (${rootText}) في آيات القرآن الكريم مع إحصائيات دقيقة وتفاسير معجمية. متوفر مجاناً وبدون إعلانات على موقع قرآن (Quran).`
    : `Explore all ${count} occurrences of the linguistic root (${rootText}) in the Holy Quran. Study Quranic word roots, translations, and statistics on Quran. Free of ads.`;

  return {
    title,
    description,
    alternates: {
      canonical: `${baseUrl}/${locale}/roots/${rootId}`,
      languages: {
        ar: `${baseUrl}/ar/roots/${rootId}`,
        en: `${baseUrl}/en/roots/${rootId}`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/${locale}/roots/${rootId}`,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function RootPage({ params }: RootPageProps) {
  const { locale, rootId } = await params;

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem 1.5rem" }}>
      <RootOccurrencesClient rootId={rootId} locale={locale} />
    </div>
  );
}
