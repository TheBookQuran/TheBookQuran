"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { useRootData } from "@/hooks/use-linguistics";
import { useSettingsStore } from "@/stores/settings";
import RootOccurrencesList from "@/components/linguistics/RootOccurrencesList";
import { ExpandableDefinition } from "@/components/linguistics/ExpandableDefinition/ExpandableDefinition";
import styles from "./RootOccurrencesClient.module.css";

interface RootOccurrencesClientProps {
  rootId: string;
  locale: string;
}

export const RootOccurrencesClient: React.FC<RootOccurrencesClientProps> = ({
  rootId,
  locale,
}) => {
  const t = useTranslations("common");
  const { data: root, isLoading } = useRootData(rootId);
  const selectedLexiconSetting = useSettingsStore((state) => state.selectedLexicon);
  const selectedLexiconActive = selectedLexiconSetting || (locale === "ar" ? "maqayis" : "lanes");

  const isArabic = locale === "ar";

  if (isLoading) {
    return <div className={styles.loading}>{t("loading")}</div>;
  }

  if (!root) {
    return (
      <div className={styles.empty}>
        {isArabic ? "جذر غير موجود" : "Root not found"}
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>
            {isArabic ? "جذر:" : "Root:"}{" "}
            <span className={styles.rootWord} translate="no">
              {root.arabicText}
            </span>
          </h1>
          <span className={styles.occurrencesBadge}>
            {root.occurrencesCount} {isArabic ? "مواضع في القرآن" : "occurrences in Quran"}
          </span>
        </div>
      </header>

      <div className={styles.definitions}>
        {selectedLexiconActive === "lanes" && root.lanesMeaning && (
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>
              {isArabic ? "معجم لين (Lane's Lexicon)" : "Lane's Lexicon"}
            </h2>
            <ExpandableDefinition
              html={root.lanesMeaning}
              dir="ltr"
              variant="page"
              source="lanes"
              rootId={root.id}
              arabicRootText={root.arabicText}
            />
          </div>
        )}

        {selectedLexiconActive === "maqayis" && root.maqayisMeaning && (
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>
              {isArabic ? "معجم مقاييس اللغة (ابن فارس)" : "Maqayis al-Lugha (Ibn Faris)"}
            </h2>
            <ExpandableDefinition
              html={root.maqayisMeaning}
              dir="rtl"
              variant="page"
              source="maqayis"
              rootId={root.id}
              arabicRootText={root.arabicText}
            />
          </div>
        )}

        {((selectedLexiconActive === "lanes" && !root.lanesMeaning) ||
          (selectedLexiconActive === "maqayis" && !root.maqayisMeaning)) && (
          <div className={styles.empty} style={{ width: "100%", gridColumn: "span 2" }}>
            {isArabic
              ? "هذا المعجم لا يحتوي على تفاصيل لهذا الجذر."
              : "This lexicon does not contain details for this root."}
          </div>
        )}
      </div>

      <section className={styles.occurrencesSection}>
        <h2 className={styles.sectionTitle}>
          {isArabic ? "مواضع الورود في الآيات" : "Occurrences in Verses"}
        </h2>
        <RootOccurrencesList rootId={rootId} />
      </section>
    </div>
  );
};

export default RootOccurrencesClient;
