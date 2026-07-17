"use client";

import React from "react";
import { useTranslations } from "next-intl";
import styles from "./DivisionHeader.module.css";

interface DivisionHeaderProps {
  type: "juz" | "hizb" | "rub" | "page";
  id: string | number;
}

export const DivisionHeader: React.FC<DivisionHeaderProps> = ({ type, id }) => {
  const t = useTranslations("common");

  // Display name of the type
  const typeName = t(type);

  return (
    <div className={styles.header}>
      <div className={styles.details}>
        <h2 className={styles.title}>
          {typeName} {id}
        </h2>
      </div>
    </div>
  );
};

export default DivisionHeader;
