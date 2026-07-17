"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useQuranReaderStore } from "@/stores/quran-reader";
import { useAudioPlayerStore } from "@/stores/audio-player";
import { useJournalStore } from "@/stores/journal";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { Verse } from "@/types/quran";
import VerseText from "../VerseText";
import { htmlToPlainText } from "@/lib/textUtils";
import styles from "./TranslationView.module.css";

interface TranslationVerseProps {
  verse: Verse;
}

export const TranslationVerse: React.FC<TranslationVerseProps> = ({
  verse,
}) => {
  const locale = useLocale();
  const router = useRouter();
  const commonT = useTranslations("common");
  const translationFontScale = useQuranReaderStore((state) => state.translationFontScale);

  // Journal store properties - using specific selectors
  const isBookmarked = useJournalStore((state) =>
    state.bookmarks.some((b) => b.key === verse.verseKey && b.type === "verse")
  );
  const addBookmark = useJournalStore((state) => state.addBookmark);
  const removeBookmark = useJournalStore((state) => state.removeBookmark);

  // Audio player store selectors - only re-render if this specific verse playing state changes
  const isVersePlaying = useAudioPlayerStore(
    (state) => state.isPlaying && state.currentVerseKey === verse.verseKey
  );
  const isNavigatedVerse = useAudioPlayerStore(
    (state) => !state.isPlaying && state.navigatedVerseKey === verse.verseKey
  );
  const setCurrentVerseKey = useAudioPlayerStore((state) => state.setCurrentVerseKey);
  const setIsPlaying = useAudioPlayerStore((state) => state.setIsPlaying);

  const { copy, isCopied } = useCopyToClipboard();

  const handlePlayAudio = React.useCallback(() => {
    setCurrentVerseKey(verse.verseKey);
    setIsPlaying(true);
  }, [verse.verseKey, setCurrentVerseKey, setIsPlaying]);

  const handleCopyVerse = React.useCallback(() => {
    const text = verse.textUthmani || verse.textUthmaniSimple;
    if (text) {
      let copyContent = `${text} (${verse.verseKey})`;
      if (verse.translations && verse.translations.length > 0) {
        const translationsText = verse.translations
          .map((t) => {
            const plainText = htmlToPlainText(t.text);
            return t.resourceName ? `${plainText} — ${t.resourceName}` : plainText;
          })
          .join("\n\n");
        copyContent = `${copyContent}\n\n${translationsText}`;
      }
      copy(copyContent);
    }
  }, [verse.textUthmani, verse.textUthmaniSimple, verse.verseKey, verse.translations, copy]);

  const handleBookmarkToggle = React.useCallback(() => {
    if (isBookmarked) {
      removeBookmark(verse.verseKey, "verse");
    } else {
      addBookmark({
        type: "verse",
        label: locale === "ar" ? `الآية ${verse.verseKey}` : `Verse ${verse.verseKey}`,
        key: verse.verseKey,
      });
    }
  }, [isBookmarked, verse.verseKey, locale, addBookmark, removeBookmark]);

  const rowRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (rowRef.current) {
      window.dispatchEvent(
        new CustomEvent("verse-node-mounted", {
          detail: { element: rowRef.current },
        })
      );
    }
  }, [verse.verseKey]);

  return (
    <div
      ref={rowRef}
      data-verse-key={verse.verseKey}
      className={styles.verseRow}
      style={isVersePlaying || isNavigatedVerse ? { backgroundColor: "rgba(44, 164, 171, 0.03)" } : undefined}
    >
      <div className={styles.verseHeader}>
        <span className={styles.verseKey}>{verse.verseKey}</span>
        <div className={styles.actions}>
          {/* Play Verse Audio Button */}
          <button
            className={styles.actionButton}
            onClick={handlePlayAudio}
            title={commonT("audio.play")}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
          </button>

          {/* Copy Verse Button */}
          <button
            className={styles.actionButton}
            onClick={handleCopyVerse}
            title={commonT("copy")}
          >
            {isCopied ? (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ color: "var(--color-background-brand, #2ca4ab)" }}
              >
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            ) : (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
            )}
          </button>

          {/* Bookmark Verse Button */}
          <button
            className={styles.actionButton}
            onClick={handleBookmarkToggle}
            title={commonT("bookmark")}
          >
            {isBookmarked ? (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ color: "var(--color-background-brand, #2ca4ab)" }}
              >
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
              </svg>
            ) : (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
              </svg>
            )}
          </button>

          {/* ميزات قادمة لاحقاً: إضافة ملاحظات/تدوين */}
          {/*
          <button
            className={styles.actionButton}
            onClick={() => router.push(`/${locale}/my-quran?verse=${verse.verseKey}`)}
            title={commonT("notes")}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 20h9"></path>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
            </svg>
          </button>
          */}
        </div>
      </div>

      {/* Arabic Text Display */}
      <VerseText
        words={verse.words}
      />

      {/* Translations Display */}
      {verse.translations && verse.translations.length > 0 && (
        <div className={styles.translationsList}>
          {verse.translations.map((translation) => (
            <div key={translation.id} dir="auto" className={styles.translationItem}>
              <p
                className={styles.translationText}
                style={{ fontSize: `${0.875 + translationFontScale * 0.125}rem` }}
                dangerouslySetInnerHTML={{ __html: translation.text }}
              />
              {translation.resourceName && (
                <span className={styles.authorName}>
                  — {translation.resourceName}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default React.memo(TranslationVerse);
