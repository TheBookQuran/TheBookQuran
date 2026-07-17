import { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/config";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = SITE_URL;
  const locales = ["en", "ar"];
  const sitemapEntries: MetadataRoute.Sitemap = [];

  // Helper to generate entries with alternates
  const addEntry = (
    path: string,
    priority: number,
    changeFrequency: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never" = "monthly"
  ) => {
    for (const locale of locales) {
      sitemapEntries.push({
        url: `${baseUrl}/${locale}${path}`,
        lastModified: new Date(),
        changeFrequency,
        priority,
        alternates: {
          languages: {
            en: `${baseUrl}/en${path}`,
            ar: `${baseUrl}/ar${path}`,
          },
        },
      });
    }
  };

  // Add homepage
  addEntry("", 1.0);

  // Add core features and content index pages
  addEntry("/search", 0.8);
  addEntry("/reciters", 0.8);
  addEntry("/roots", 0.7);
  addEntry("/my-quran", 0.6);

  // Add static informational pages
  addEntry("/about-us", 0.5);
  addEntry("/privacy", 0.3);
  addEntry("/terms", 0.3);

  // Add 114 Surahs
  for (let i = 1; i <= 114; i++) {
    addEntry(`/${i}`, 0.9);
  }

  // Add 30 Juz
  for (let i = 1; i <= 30; i++) {
    addEntry(`/juz/${i}`, 0.7);
  }

  // Add 60 Hizbs
  for (let i = 1; i <= 60; i++) {
    addEntry(`/hizb/${i}`, 0.6);
  }

  // Add 240 Rub el-Hizbs
  for (let i = 1; i <= 240; i++) {
    addEntry(`/rub/${i}`, 0.5);
  }

  // Add 604 Mushaf pages
  for (let i = 1; i <= 604; i++) {
    addEntry(`/page/${i}`, 0.6);
  }

  return sitemapEntries;
}
