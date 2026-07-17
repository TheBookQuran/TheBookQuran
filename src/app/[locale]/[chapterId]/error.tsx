"use client";

import React, { useEffect } from "react";
import { useLocale } from "next-intl";

export default function ChapterError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const locale = useLocale();

  useEffect(() => {
    console.error(error);
  }, [error]);

  const isArabic = locale === "ar";

  return (
    <div style={{ textAlign: "center", padding: "3rem var(--spacing-medium)", minHeight: "50vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
      <h3 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
        {isArabic ? "عذرًا، حدث خطأ ما أثناء تحميل السورة." : "Failed to load Surah."}
      </h3>
      <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem", marginBottom: "1.5rem", maxWidth: "400px" }}>
        {error.message || "An unexpected error occurred."}
      </p>
      <button
        onClick={() => reset()}
        style={{
          padding: "0.5rem 1.5rem",
          backgroundColor: "var(--color-background-brand, #2ca4ab)",
          color: "#fff",
          border: "none",
          borderRadius: "9999px",
          cursor: "pointer",
          fontWeight: "500",
        }}
      >
        {isArabic ? "إعادة المحاولة" : "Try again"}
      </button>
    </div>
  );
}
