import React from "react";
import { getTranslations } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";
import styles from "@/components/shared/ContentPage.module.css";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  return {
    title: t("title"),
  };
}

export default async function AboutUsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");

  const features = t.raw("key-features.features");
  const featureList = Array.isArray(features) ? features : [];

  const credits = t.raw("credits.list");
  const creditsList = Array.isArray(credits) ? credits : [];

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem 1.5rem" }}>
      <div className={styles.contentPage}>
        <h1>{t("title")}</h1>
        <p>{t("description1")}</p>
        <p>{t("description2")}</p>

        <h2 className={styles.heading}>{t("our-vision.title")}</h2>
        <p>{t("our-vision.desc1")}</p>
        <p>{t("our-vision.desc2")}</p>

        <h2 className={styles.heading}>{t("key-features.title")}</h2>
        <ul className={styles.list}>
          {featureList.map((feature: string, index: number) => (
            <li key={`feature-${index}`}>{feature}</li>
          ))}
        </ul>

        <h2 className={styles.heading}>{t("non-profit.title")}</h2>
        <p>{t("non-profit.desc1")}</p>
        <p>{t("non-profit.desc2")}</p>

        <h2 className={styles.heading}>{t("linguistic-sources.title")}</h2>
        <p>{t("linguistic-sources.desc")}</p>

        <h2 className={styles.heading}>{t("credits.title")}</h2>
        <p>{t("credits.desc")}</p>
        <ul className={styles.list}>
          {creditsList.map((item: any, index: number) => (
            <li key={`credit-${index}`}>
              <a href={item.url} target="_blank" rel="noreferrer" style={{ textDecoration: "underline" }}>
                {item.name}
              </a>{" "}
              — {item.desc}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
