import React from "react";
import { getTranslations } from "next-intl/server";
import { SITE_URL } from "@/lib/config";
// import RecitersClient from "./RecitersClient";

interface RecitersPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: RecitersPageProps) {
  const { locale } = await params;
  const baseUrl = SITE_URL;
  const isAr = locale === "ar";

  const title = isAr
    ? "الاستماع إلى القرآن الكريم - قائمة القراء والتلاوات | Quran"
    : "Listen to Quran: Famous Quran Reciters & Audio | Quran";

  const description = isAr
    ? "استمع إلى تلاوات القرآن الكريم العذبة بأصوات أشهر القراء في العالم الإسلامي. يدعم تشغيل الصوت ومزامنة الكلمات مجاناً وبدون إعلانات على موقع قرآن (Quran)."
    : "Listen to beautiful Quran audio recitations by world-renowned Qaris. Choose your preferred Quran reciter for high-quality audio playback and word-by-word highlights. Free of ads on Quran.";

  return {
    title,
    description,
    alternates: {
      canonical: `${baseUrl}/${locale}/reciters`,
      languages: {
        ar: `${baseUrl}/ar/reciters`,
        en: `${baseUrl}/en/reciters`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/${locale}/reciters`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function RecitersPage({ params }: RecitersPageProps) {
  const { locale } = await params;

  return (
    <div style={{ 
      maxWidth: "1200px", 
      margin: "0 auto", 
      padding: "8rem 1.5rem", 
      textAlign: "center", 
      minHeight: "60vh", 
      display: "flex", 
      flexDirection: "column", 
      justifyContent: "center", 
      alignItems: "center" 
    }}>
      <h2 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
        {locale === "ar" ? "ميزات قادمة لاحقاً" : "Features Coming Soon"}
      </h2>
      <p style={{ color: "var(--color-text-muted)" }}>
        {locale === "ar" 
          ? "صفحة الاستماع وقائمة القراء ستكون متوفرة في التحديثات القادمة إن شاء الله."
          : "The audio listening and reciters page will be available in future updates, God willing."}
      </p>
      {/* ميزات قادمة لاحقاً: الكود الأصلي
      <RecitersClient locale={locale} />
      */}
    </div>
  );
}
