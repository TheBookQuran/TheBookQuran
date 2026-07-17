import React from "react";
import { getTranslations } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";
import styles from "@/components/shared/ContentPage.module.css";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "terms" });
  return {
    title: t("title"),
  };
}

export default async function TermsAndConditionsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("terms");

  const acceptableUseItems = t.raw("acceptable-use.items");
  const acceptableUseList = Array.isArray(acceptableUseItems) ? acceptableUseItems : [];

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem 1.5rem" }}>
      <div className={styles.contentPage}>
        <h1>{t("title")}</h1>

        <h2 className={styles.heading}>{t("intro.title")}</h2>
        <p>{t("intro.desc1")}</p>
        <p>{t("intro.desc2")}</p>

        <h2 className={styles.heading}>{t("use.title")}</h2>
        <p>{t("use.desc")}</p>

        <h2 className={styles.heading}>{t("content-nature.title")}</h2>
        <p>{t("content-nature.desc1")}</p>
        <p>{t("content-nature.desc2")}</p>

        <h2 className={styles.heading}>{t("accuracy.title")}</h2>
        <p>{t("accuracy.desc1")}</p>
        <p>{t("accuracy.desc2")}</p>

        <h2 className={styles.heading}>{t("intellectual-property.title")}</h2>
        <p>{t("intellectual-property.desc1")}</p>
        <p>{t("intellectual-property.desc2")}</p>
        <p>{t("intellectual-property.desc3")}</p>

        <h2 className={styles.heading}>{t("acceptable-use.title")}</h2>
        <p>{t("acceptable-use.desc")}</p>
        <ul className={styles.list}>
          {acceptableUseList.map((item: string, index: number) => (
            <li key={`use-item-${index}`}>{item}</li>
          ))}
        </ul>

        <h2 className={styles.heading}>{t("external-services.title")}</h2>
        <p>{t("external-services.desc")}</p>

        <h2 className={styles.heading}>{t("modifications.title")}</h2>
        <p>{t("modifications.desc1")}</p>
        <p>{t("modifications.desc2")}</p>

        <h2 className={styles.heading}>{t("contact.title")}</h2>
        <p>{t("contact.desc")}</p>
      </div>
    </div>
  );
}
