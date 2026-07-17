import React from "react";
import SurahIndex from "@/components/home/SurahIndex";
import JsonLd, { getWebSiteSchema } from "@/components/seo/JsonLd";
import styles from "./page.module.css";

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  const websiteSchema = getWebSiteSchema(locale);

  return (
    <div className={styles.homePage}>
      <JsonLd schema={websiteSchema} />
      <main className={styles.mainContent}>
        <SurahIndex locale={locale} />
      </main>
    </div>
  );
}
