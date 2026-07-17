import React from "react";
import { getTranslations } from "next-intl/server";
import { SITE_URL } from "@/lib/config";
import SearchClient from "./SearchClient";

interface SearchPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; page?: string }>;
}

export async function generateMetadata({ params, searchParams }: SearchPageProps) {
  const { locale } = await params;
  const { q } = await searchParams;
  const baseUrl = SITE_URL;
  const isAr = locale === "ar";

  const title = q
    ? isAr
      ? `نتائج البحث عن "${q}" في القرآن الكريم | Quran`
      : `Search results for "${q}" in Quran | Quran`
    : isAr
    ? "البحث في القرآن الكريم | Quran"
    : "Search the Quran Online | Quran";

  const description = isAr
    ? "ابحث في آيات القرآن الكريم ونصوص التراجم المعاجم اللغوية بسرعة وسهولة. موقع قرآن (Quran) خالي من الإعلانات."
    : "Search the Holy Quran text, translations, and word linguistic roots with highlighted results. Fast and advanced search on Quran, free of ads.";

  // For search pages, it's best to canonicalize to the base search path without query params,
  // or dynamic canonicals if query is set, but search pages are often disallowed in robots or set to noindex.
  // We can let them be indexable but it's cleaner to canonicalize to the main search page or query-specific canonical.
  const canonicalUrl = q
    ? `${baseUrl}/${locale}/search?q=${encodeURIComponent(q)}`
    : `${baseUrl}/${locale}/search`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        ar: q ? `${baseUrl}/ar/search?q=${encodeURIComponent(q)}` : `${baseUrl}/ar/search`,
        en: q ? `${baseUrl}/en/search?q=${encodeURIComponent(q)}` : `${baseUrl}/en/search`,
      },
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function SearchPage({ params, searchParams }: SearchPageProps) {
  const { locale } = await params;
  const { q } = await searchParams;

  const initialQuery = q || "";

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem 1.5rem" }}>
      <SearchClient initialQuery={initialQuery} />
    </div>
  );
}
