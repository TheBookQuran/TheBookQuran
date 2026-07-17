"use client";

import React from "react";
import { useLocale } from "next-intl";

export default function MyQuranPage() {
  const locale = useLocale();

  return (
    <div style={{ 
      padding: "8rem 2rem", 
      textAlign: "center", 
      minHeight: "60vh", 
      display: "flex", 
      flexDirection: "column", 
      justifyContent: "center", 
      alignItems: "center" 
    }}>
      <h2 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
        {locale === "ar" ? "ميزات قادمة لاحقاً" : "Features Coming Soon"}
      </h2>
      <p style={{ color: "var(--color-text-muted)" }}>
        {locale === "ar" 
          ? "صفحة التدوين والملاحظات ستكون متوفرة في التحديثات القادمة إن شاء الله."
          : "The journaling and notes page will be available in future updates, God willing."}
      </p>
    </div>
  );
}
