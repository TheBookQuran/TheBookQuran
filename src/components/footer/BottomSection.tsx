"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import styles from "./Footer.module.css";

export const BottomSection: React.FC = () => {
  const t = useTranslations("common");
  const locale = useLocale();

  const localizedCurrentYear = useMemo(() => {
    return new Date().toLocaleString(locale, {
      year: "numeric",
      calendar: "gregory",
    });
  }, [locale]);

  return (
    <div className={styles.bottomSectionContainer}>
      <div className={styles.infoSection}>
        <div className={styles.bottomLinks}>
          <Link href={`/${locale}/about-us`}>
            {locale === "ar" ? "عنا نحن" : t("about")}
          </Link>
          <Link href={`/${locale}/privacy`} target="_blank">
            {t("privacy")}
          </Link>
          <Link href={`/${locale}/terms`} target="_blank">
            {t("terms-and-conditions")}
          </Link>
        </div>
        <div className={styles.copyright}>
          © {localizedCurrentYear}{" "}
          <Link href={`/${locale}`} style={{ color: "var(--color-background-brand)" }}>
            Quran
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BottomSection;
