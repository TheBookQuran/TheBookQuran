"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import BottomSection from "./BottomSection";
import styles from "./Footer.module.css";

export const Footer: React.FC = () => {
  const pathname = usePathname();
  const t = useTranslations("common");

  // Don't render the footer on certain pages if needed, for example:
  // if (pathname.includes('/login')) return null;

  return (
    <footer className={styles.footer}>
      <div className={styles.flowItem}>
        <div className={styles.centerDescriptionContainer}>
          <div className={styles.title}>{t("footer.title")}</div>
          <p className={styles.description}>{t("footer.description")}</p>
        </div>
        <BottomSection />
      </div>
      <div className={styles.emptySpacePlaceholder} />
    </footer>
  );
};

export default Footer;
