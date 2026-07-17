import { useCallback } from "react";
import { getWordAudioUrl } from "@/lib/quran-core/chapter/chapter-utils";

/**
 * Hook مخصص لتشغيل الصوت التعليمي للكلمة القرآنية بناءً على موقعها (سورة:آية:كلمة).
 * يتعامل مع عناصر HTMLAudioElement وإدارة حالة التشغيل في النافذة العالمية (Window) لتفادي التداخل.
 */
export function useWordAudio(wordLocation: string | null) {
  const playAudio = useCallback(() => {
    if (!wordLocation) return;

    try {
      const fullUrl = getWordAudioUrl(wordLocation);

      // Stop previously playing word audio if it exists to avoid overlapping
      if ((window as any).wordByWordAudioPlayerEl) {
        (window as any).wordByWordAudioPlayerEl.pause();
        (window as any).wordByWordAudioPlayerEl = null;
      }

      const audio = new Audio(fullUrl);
      (window as any).wordByWordAudioPlayerEl = audio;
      audio.play().catch((err) => {
        console.warn("Could not play word audio:", err);
      });
    } catch (err) {
      console.error("Failed to parse word location for audio playing:", err);
    }
  }, [wordLocation]);

  return { playAudio };
}
