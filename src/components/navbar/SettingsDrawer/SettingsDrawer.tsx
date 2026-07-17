"use client";

import React, { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import * as Dialog from "@radix-ui/react-dialog";
import * as Slider from "@radix-ui/react-slider";
import { useUIStore } from "@/stores/ui";
import { useQuranReaderStore } from "@/stores/quran-reader";
import { useSettingsStore } from "@/stores/settings";
import { useTranslationsList } from "@/hooks/use-translations-list";
import { useReciters } from "@/hooks/use-reciters";
import { QuranFont } from "@/lib/quran-core/fonts/types";
import styles from "./SettingsDrawer.module.css";
import clsx from "clsx";

export const SettingsDrawer: React.FC = () => {
  const locale = useLocale();
  const t = useTranslations("settings");
  const commonT = useTranslations("common");
  const readerT = useTranslations("quranReader");

  const isSettingsDrawerOpen = useUIStore((state) => state.isSettingsDrawerOpen);
  const setSettingsDrawerOpen = useUIStore((state) => state.setSettingsDrawerOpen);

  // Stores
  const quranFont = useQuranReaderStore((s) => s.quranFont);
  const translationFontScale = useQuranReaderStore((s) => s.translationFontScale);
  const quranTextFontScale = useQuranReaderStore((s) => s.quranTextFontScale);
  const setQuranFont = useQuranReaderStore((s) => s.setQuranFont);
  const setTranslationFontScale = useQuranReaderStore((s) => s.setTranslationFontScale);
  const setQuranTextFontScale = useQuranReaderStore((s) => s.setQuranTextFontScale);

  const selectedTranslations = useSettingsStore((s) => s.selectedTranslations);
  const selectedReciter = useSettingsStore((s) => s.selectedReciter);
  const isWordByWordTranslation = useSettingsStore((s) => s.isWordByWordTranslation);
  const isWordByWordTransliteration = useSettingsStore((s) => s.isWordByWordTransliteration);
  const selectedLexiconSetting = useSettingsStore((s) => s.selectedLexicon);
  const playAudioOnClick = useSettingsStore((s) => s.playAudioOnClick);
  const setSelectedTranslations = useSettingsStore((s) => s.setSelectedTranslations);
  const setSelectedReciter = useSettingsStore((s) => s.setSelectedReciter);
  const setIsWordByWordTranslation = useSettingsStore((s) => s.setIsWordByWordTranslation);
  const setIsWordByWordTransliteration = useSettingsStore((s) => s.setIsWordByWordTransliteration);
  const setSelectedLexicon = useSettingsStore((s) => s.setSelectedLexicon);
  const setPlayAudioOnClick = useSettingsStore((s) => s.setPlayAudioOnClick);

  const selectedLexiconActive = selectedLexiconSetting || (locale === "ar" ? "maqayis" : "lanes");

  // Queries
  const { data: translationsData } = useTranslationsList(locale);
  const { data: recitersData } = useReciters(locale);

  const [translationSearch, setTranslationSearch] = useState("");

  const filteredTranslations = translationsData?.translations?.filter((trans) =>
    trans.name.toLowerCase().includes(translationSearch.toLowerCase()) ||
    trans.authorName.toLowerCase().includes(translationSearch.toLowerCase()) ||
    trans.languageName.toLowerCase().includes(translationSearch.toLowerCase())
  ) || [];

  const lexicons = [
    { id: "lanes" as const, name: locale === "ar" ? "معجم لين (Lane's)" : "Lane's Lexicon" },
    { id: "maqayis" as const, name: locale === "ar" ? "مقاييس اللغة (ابن فارس)" : "Maqayis al-Lugha" },
  ];

  const handleTranslationToggle = (id: number) => {
    if (selectedTranslations.includes(id)) {
      // Don't allow deselecting all translations
      if (selectedTranslations.length > 1) {
        setSelectedTranslations(selectedTranslations.filter((tId) => tId !== id));
      }
    } else {
      setSelectedTranslations([...selectedTranslations, id]);
    }
  };

  return (
    <Dialog.Root open={isSettingsDrawerOpen} onOpenChange={setSettingsDrawerOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.overlay} />
        <Dialog.Content className={styles.content}>
          <div className={styles.header}>
            <Dialog.Title className={styles.title}>{t("title")}</Dialog.Title>
            <Dialog.Close className={styles.closeButton} aria-label="Close">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </Dialog.Close>
          </div>

          <div className={styles.body}>
            {/* Section 4: Font Sizes */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>{readerT("quranTextFontSize")}</h3>
              <div className={styles.sliderContainer}>
                <span className={styles.scaleLabel}>{quranTextFontScale}</span>
                <Slider.Root
                  className={styles.sliderRoot}
                  value={[quranTextFontScale]}
                  min={1}
                  max={10}
                  step={1}
                  onValueChange={(val) => setQuranTextFontScale(val[0])}
                >
                  <Slider.Track className={styles.sliderTrack}>
                    <Slider.Range className={styles.sliderRange} />
                  </Slider.Track>
                  <Slider.Thumb className={styles.sliderThumb} />
                </Slider.Root>
              </div>

              <h3 className={styles.sectionTitle} style={{ marginTop: "1rem" }}>
                {readerT("translationFontSize")}
              </h3>
              <div className={styles.sliderContainer}>
                <span className={styles.scaleLabel}>{translationFontScale}</span>
                <Slider.Root
                  className={styles.sliderRoot}
                  value={[translationFontScale]}
                  min={1}
                  max={10}
                  step={1}
                  onValueChange={(val) => setTranslationFontScale(val[0])}
                >
                  <Slider.Track className={styles.sliderTrack}>
                    <Slider.Range className={styles.sliderRange} />
                  </Slider.Track>
                  <Slider.Thumb className={styles.sliderThumb} />
                </Slider.Root>
              </div>
            </div>

            {/* Section 5: Word by Word */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>{readerT("wbw")}</h3>
              <div className={styles.toggleList}>
                <label className={styles.toggleRow}>
                  <span>{readerT("wbwTranslation")}</span>
                  <input
                    type="checkbox"
                    checked={isWordByWordTranslation}
                    onChange={(e) => setIsWordByWordTranslation(e.target.checked)}
                    className={styles.toggleInput}
                  />
                </label>
                <label className={styles.toggleRow}>
                  <span>{readerT("wbwTransliteration")}</span>
                  <input
                    type="checkbox"
                    checked={isWordByWordTransliteration}
                    onChange={(e) => setIsWordByWordTransliteration(e.target.checked)}
                    className={styles.toggleInput}
                  />
                </label>
                <label className={styles.toggleRow}>
                  <span>{readerT("playAudioOnClick")}</span>
                  <input
                    type="checkbox"
                    checked={playAudioOnClick}
                    onChange={(e) => setPlayAudioOnClick(e.target.checked)}
                    className={styles.toggleInput}
                  />
                </label>
              </div>
            </div>

            {/* Section 5b: Lexicon Selection */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>{readerT("lexiconSettings")}</h3>
              <div className={styles.scrollList}>
                {lexicons.map((lex) => (
                  <button
                    key={lex.id}
                    onClick={() => setSelectedLexicon(lex.id)}
                    className={clsx(styles.listItem, {
                      [styles.listActive]: selectedLexiconActive === lex.id,
                    })}
                  >
                    <div className={styles.reciterMeta}>
                      <span className={styles.listName}>{lex.name}</span>
                    </div>
                    {selectedLexiconActive === lex.id && (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Section 6: Reciter Selection */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>{t("selectedReciter")}</h3>
              <div className={styles.scrollList}>
                {recitersData?.reciters?.map((reciter) => (
                  <button
                    key={reciter.id}
                    onClick={() => setSelectedReciter(reciter.id)}
                    className={clsx(styles.listItem, {
                      [styles.listActive]: selectedReciter === reciter.id,
                    })}
                  >
                    <div className={styles.reciterMeta}>
                      <span className={styles.listName}>
                        {locale === "ar" && reciter.translatedName?.name
                          ? reciter.translatedName.name
                          : reciter.name}
                      </span>
                      {reciter.recitationStyle && (
                        <span className={styles.listSub}>{reciter.recitationStyle}</span>
                      )}
                    </div>
                    {selectedReciter === reciter.id && (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Section 7: Translations Selection */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>{t("selectedTranslations")}</h3>
              <input
                type="text"
                placeholder={locale === "ar" ? "ابحث عن ترجمة..." : "Search translation..."}
                value={translationSearch}
                onChange={(e) => setTranslationSearch(e.target.value)}
                className={styles.searchBar}
              />
              <div className={styles.scrollList} style={{ maxHeight: "250px" }}>
                {filteredTranslations.map((trans) => {
                  const isChecked = selectedTranslations.includes(trans.id);
                  return (
                    <button
                      key={trans.id}
                      onClick={() => handleTranslationToggle(trans.id)}
                      className={clsx(styles.listItem, {
                        [styles.listActive]: isChecked,
                      })}
                    >
                      <div className={styles.translationMeta}>
                        <span className={styles.listName}>{trans.name}</span>
                        <span className={styles.listSub}>{trans.authorName} ({trans.languageName})</span>
                      </div>
                      {isChecked && (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default SettingsDrawer;
