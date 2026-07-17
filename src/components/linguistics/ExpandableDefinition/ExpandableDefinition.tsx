"use client";

import React from "react";
import { useLocale } from "next-intl";
import { useEnrichedLexicon } from "@/hooks/use-linguistics";
import { Derivation } from "@/types/linguistics";
import styles from "./ExpandableDefinition.module.css";
import clsx from "clsx";

interface ExpandableDefinitionProps {
  html: string;
  dir?: "ltr" | "rtl";
  summaryLength?: number; // Kept for prop compatibility
  variant?: "sidebar" | "page";
  source?: "lanes" | "maqayis";
  rootId?: string;
  arabicRootText?: string;
}

export const ExpandableDefinition: React.FC<ExpandableDefinitionProps> = ({
  html,
  dir = "ltr",
  variant = "sidebar",
  source = "lanes",
  rootId,
  arabicRootText,
}) => {
  const locale = useLocale();
  const isArabic = locale === "ar";

  // Query enriched data if rootId is available
  const { data: enriched } = useEnrichedLexicon(
    source === "lanes" && rootId ? rootId : null
  );

  if (!html) return null;

  const containerClass = clsx(
    styles.container,
    variant === "sidebar" ? styles.variantSidebar : styles.variantPage
  );

  return (
    <div className={containerClass}>
      <div className={styles.fullContent}>
        {source === "lanes" && enriched ? (
          /* Structured AI Enriched Content - Quranic Focused Layout */
          <div className={styles.enrichedFullContent}>
            {/* Header showing the root text */}
            {arabicRootText && (
              <div className={styles.enrichedSection} style={{ marginBottom: "0.25rem" }}>
                <span className={styles.summaryHeadword} translate="no" dir="rtl">
                  {arabicRootText}
                </span>
              </div>
            )}

            {/* Semantic Core */}
            {enriched.semanticCore && (
              <div className={styles.enrichedSection}>
                {/* <h5 className={styles.enrichedSectionTitle}>
                  {isArabic ? "النواة الدلالية" : "Semantic Core"}
                </h5> */}
                <p className={styles.semanticCoreText} dir="ltr">
                  {enriched.semanticCore}
                </p>
              </div>
            )}


            {/* Quranic Relevance */}
            {enriched.quranicRelevance && (
              <div className={styles.enrichedSection}>
                <h5 className={styles.enrichedSectionTitle}>
                  {isArabic ? "الاستخدام القرآني" : "Quranic Relevance"}
                </h5>
                <p className={styles.enrichedText} dir="ltr">
                  {enriched.quranicRelevance}
                </p>
              </div>
            )}

            {/* Key Derivations */}
            {enriched.keyDerivations && enriched.keyDerivations.length > 0 && (
              <div className={styles.enrichedSection}>
                <h5 className={styles.enrichedSectionTitle}>
                  {isArabic ? "الاشتقاقات" : "Derivations"}
                </h5>
                <ul className={styles.derivationList}>
                  {enriched.keyDerivations.map((d: Derivation, i: number) => (
                    <li key={i} className={styles.derivationItem}>
                      <span className={styles.derivationLemma} dir="rtl" translate="no">
                        {d.lemma}
                      </span>
                      <span className={styles.derivationForm}>{d.form}</span>
                      <span className={styles.derivationMeaning} dir="ltr">{d.meaning}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Figurative & Rare Usages (Collapsible) */}
            {enriched.figurativeOrRareUsages && enriched.figurativeOrRareUsages.length > 0 && (
              <div className={styles.enrichedSection}>
                <details className={styles.detailsCollapsible}>
                  <summary className={styles.detailsSummary}>
                    {isArabic ? "اخرى" : "Other"}
                  </summary>
                  <ul className={styles.enrichedList} dir="ltr">
                    {enriched.figurativeOrRareUsages.map((f: string, i: number) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </details>
              </div>
            )}

            {/* Verbatim original text */}
            <div className={styles.enrichedSection}>
              <h5 className={styles.enrichedSectionTitle}>
                {isArabic ? "النص الكامل (معجم لين)" : "Full Text (Lane's Lexicon)"}
              </h5>
              <div
                className={styles.scrollArea}
                dir="ltr"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            </div>
          </div>
        ) : (
          /* Fallback Verbatim Scroll area */
          <div className={styles.fallbackFullContent}>
            {arabicRootText && (
              <div style={{ marginBottom: "0.75rem" }}>
                <span className={styles.summaryHeadword} translate="no" dir="rtl">
                  {arabicRootText}
                </span>
              </div>
            )}
            <div
              className={styles.scrollArea}
              dir={dir}
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
