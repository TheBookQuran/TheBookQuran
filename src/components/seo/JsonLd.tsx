import React from "react";
import { SITE_URL } from "@/lib/config";

interface JsonLdProps {
  schema: Record<string, any>;
}

export default function JsonLd({ schema }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function getWebSiteSchema(locale: string) {
  const baseUrl = SITE_URL;
  const isAr = locale === "ar";
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Quran",
    "alternateName": isAr ? "القرآن" : "Al-Quran Online",
    "url": `${baseUrl}/${locale}`,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${baseUrl}/${locale}/search?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };
}

export function getBreadcrumbSchema(locale: string, items: { name: string; path: string }[]) {
  const baseUrl = SITE_URL;
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": `${baseUrl}/${locale}${item.path}`
    }))
  };
}

export function getQuranSurahSchema(
  locale: string,
  chapterId: number,
  chapterName: string,
  versesCount: number,
  translatedName?: string
) {
  const baseUrl = SITE_URL;
  const isAr = locale === "ar";
  return {
    "@context": "https://schema.org",
    "@type": "Book",
    "@id": `${baseUrl}/${locale}/${chapterId}`,
    "name": isAr ? `سورة ${chapterName}` : `Surah ${chapterName}`,
    "alternativeHeadline": translatedName,
    "author": {
      "@type": "Organization",
      "name": "Quran"
    },
    "about": {
      "@type": "Thing",
      "name": isAr ? "القرآن الكريم" : "The Holy Quran"
    },
    "bookFormat": "https://schema.org/EBook",
    "numberOfPages": versesCount,
    "inLanguage": locale,
    "publisher": {
      "@type": "Organization",
      "name": "Quran"
    }
  };
}
