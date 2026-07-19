"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { useRootData } from "@/hooks/use-linguistics";
import { useSettingsStore } from "@/stores/settings";
import RootOccurrencesList from "@/components/linguistics/RootOccurrencesList";
import { ExpandableDefinition } from "@/components/linguistics/ExpandableDefinition/ExpandableDefinition";
import * as Popover from "@radix-ui/react-popover";
import clsx from "clsx";
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
  const setSelectedLexicon = useSettingsStore((state) => state.setSelectedLexicon);
  const selectedLexiconActive = selectedLexiconSetting || (locale === "ar" ? "maqayis" : "lanes");

  const isArabic = locale === "ar";
  const [showDefinitions, setShowDefinitions] = React.useState(false);

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
      <header className={styles.header} onClick={() => setShowDefinitions(!showDefinitions)}>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>
            {isArabic ? "جذر:" : "Root:"}{" "}
            <span className={styles.rootWord} translate="no">
              {root.arabicText}
            </span>
          </h1>
          <div className={styles.toggleWrapper}>
            <span className={styles.toggleLabel}>
              {isArabic ? "معلومات الجذر" : "Root Information"}
            </span>
            <span className={`${styles.toggleIcon} ${showDefinitions ? styles.toggleOpen : ""}`}>
              ▼
            </span>
          </div>
        </div>
      </header>

      {showDefinitions && (
        <div className={styles.card}>
          <div className={styles.lexiconHeader}>
            <Popover.Root>
              <Popover.Trigger asChild>
                <button className={styles.lexiconSelectorButton}>
                  <span>
                    {selectedLexiconActive === "lanes"
                      ? (isArabic ? "معجم لين (Lane's Lexicon)" : "Lane's Lexicon")
                      : (isArabic ? "معجم مقاييس اللغة (ابن فارس)" : "Maqayis al-Lugha (Ibn Faris)")}
                  </span>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={styles.chevronIcon}
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>
              </Popover.Trigger>
              <Popover.Portal>
                <Popover.Content className={styles.lexiconPopover} sideOffset={6} align="start">
                  <Popover.Close asChild>
                    <button
                      className={clsx(styles.lexiconItem, {
                        [styles.activeItem]: selectedLexiconActive === "lanes",
                      })}
                      onClick={() => setSelectedLexicon("lanes")}
                    >
                      {isArabic ? "معجم لين (Lane's Lexicon)" : "Lane's Lexicon"}
                    </button>
                  </Popover.Close>
                  <Popover.Close asChild>
                    <button
                      className={clsx(styles.lexiconItem, {
                        [styles.activeItem]: selectedLexiconActive === "maqayis",
                      })}
                      onClick={() => setSelectedLexicon("maqayis")}
                    >
                      {isArabic ? "معجم مقاييس اللغة (ابن فارس)" : "Maqayis al-Lugha (Ibn Faris)"}
                    </button>
                  </Popover.Close>
                </Popover.Content>
              </Popover.Portal>
            </Popover.Root>
          </div>

          {selectedLexiconActive === "lanes" && root.lanesMeaning && (
            <ExpandableDefinition
              html={root.lanesMeaning}
              dir="ltr"
              variant="page"
              source="lanes"
              rootId={root.id}
              arabicRootText={root.arabicText}
            />
          )}

          {selectedLexiconActive === "maqayis" && root.maqayisMeaning && (
            <ExpandableDefinition
              html={root.maqayisMeaning}
              dir="rtl"
              variant="page"
              source="maqayis"
              rootId={root.id}
              arabicRootText={root.arabicText}
            />
          )}

          {((selectedLexiconActive === "lanes" && !root.lanesMeaning) ||
            (selectedLexiconActive === "maqayis" && !root.maqayisMeaning)) && (
            <div className={styles.empty}>
              {isArabic
                ? "هذا المعجم لا يحتوي على تفاصيل لهذا الجذر."
                : "This lexicon does not contain details for this root."}
            </div>
          )}
        </div>
      )}

      <section className={styles.occurrencesSection}>
        <h2 className={styles.sectionTitle}>
          {isArabic
            ? `مواضع الورود في الآيات (${root.occurrencesCount})`
            : `Occurrences in Verses (${root.occurrencesCount})`}
        </h2>
        <RootOccurrencesList rootId={rootId} />
      </section>
    </div>
  );
};

export default RootOccurrencesClient;
