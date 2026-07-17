"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import styles from "./PageNavigator.module.css";

export const PageNavigator: React.FC = () => {
  const locale = useLocale();
  const router = useRouter();
  const [pageNumber, setPageNumber] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(pageNumber, 10);
    if (isNaN(parsed) || parsed < 1 || parsed > 604) {
      setError(locale === "ar" ? "يرجى إدخال رقم صفحة بين 1 و 604" : "Please enter a page number between 1 and 604");
      return;
    }
    setError("");
    router.push(`/${locale}/page/${parsed}`);
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputWrapper}>
          <input
            type="number"
            min={1}
            max={604}
            className={styles.input}
            placeholder={locale === "ar" ? "أدخل رقم الصفحة (1-604)..." : "Enter page number (1-604)..."}
            value={pageNumber}
            onChange={(e) => {
              setPageNumber(e.target.value);
              if (error) setError("");
            }}
          />
          <button type="submit" className={styles.button}>
            {locale === "ar" ? "ذهاب" : "Go"}
          </button>
        </div>
        {error && <span className={styles.error}>{error}</span>}
      </form>
    </div>
  );
};

export default PageNavigator;
