import React from "react";
import { getTranslations } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";
import styles from "@/components/shared/ContentPage.module.css";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "privacy" });
  return {
    title: t("title"),
  };
}

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("privacy");

  const infoCollectionItems = t.raw("info-collection.items");
  const infoCollectionList = Array.isArray(infoCollectionItems) ? infoCollectionItems : [];

  const cookiesItems = t.raw("cookies.items");
  const cookiesList = Array.isArray(cookiesItems) ? cookiesItems : [];

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem 1.5rem" }}>
      <div className={styles.contentPage}>
        <h1>{t("title")}</h1>

        <h2 className={styles.heading}>{t("intro.title")}</h2>
        <p>{t("intro.desc")}</p>

        <h2 className={styles.heading}>{t("info-collection.title")}</h2>
        <p>{t("info-collection.desc1")}</p>
        <p>{t("info-collection.desc2")}</p>
        <ul className={styles.list}>
          {infoCollectionList.map((item: string, index: number) => (
            <li key={`info-item-${index}`}>{item}</li>
          ))}
        </ul>
        <p>{t("info-collection.desc3")}</p>

        <h2 className={styles.heading}>{t("cookies.title")}</h2>
        <p>{t("cookies.desc1")}</p>
        <ul className={styles.list}>
          {cookiesList.map((item: string, index: number) => (
            <li key={`cookie-item-${index}`}>{item}</li>
          ))}
        </ul>
        <p>{t("cookies.desc2")}</p>

        <h2 className={styles.heading}>{t("external-services.title")}</h2>
        <p>{t("external-services.desc1")}</p>
        <p>{t("external-services.desc2")}</p>

        <h2 className={styles.heading}>{t("ads.title")}</h2>
        <p>{t("ads.desc")}</p>

        <h2 className={styles.heading}>{t("data-sharing.title")}</h2>
        <p>{t("data-sharing.desc")}</p>

        <h2 className={styles.heading}>{t("data-protection.title")}</h2>
        <p>{t("data-protection.desc")}</p>

        <h2 className={styles.heading}>{t("policy-changes.title")}</h2>
        <p>{t("policy-changes.desc1")}</p>
        <p>{t("policy-changes.desc2")}</p>

        <h2 className={styles.heading}>{t("contact.title")}</h2>
        <p>{t("contact.desc")}</p>
      </div>
    </div>
  );
}
