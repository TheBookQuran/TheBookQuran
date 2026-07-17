"use client";

import React, { useEffect } from "react";
import { getVerseAndChapterNumbersFromKey } from "@/lib/quran-core/verse/verse-utils";
import { useVerseTrackerStore } from "@/stores/verse-tracker";
import { Verse } from "@/types/quran";

interface VerseTrackerProps {
  verses: Verse[];
  chapterId?: string | number;
  totalVerses?: number | null;
}

export const VerseTracker: React.FC<VerseTrackerProps> = ({ 
  verses, 
  chapterId, 
  totalVerses 
}) => {
  const setActiveData = useVerseTrackerStore((state) => state.setActiveData);

  useEffect(() => {
    if (!verses || verses.length === 0) return;

    // Set initial active data only if there is no active data currently to avoid resetting progress on dynamic loads
    const currentActiveVerse = useVerseTrackerStore.getState().activeVerseKey;
    if (!currentActiveVerse) {
      const firstVerse = verses[0];
      setActiveData({
        verseKey: firstVerse.verseKey,
        juz: firstVerse.juzNumber ?? null,
        hizb: firstVerse.hizbNumber ?? null,
        page: firstVerse.pageNumber ?? null,
        progress: 0,
      });
    }

    const visibleVersesKeys = new Set<string>();
    let rafId: number | null = null;

    const updateActiveVerse = () => {
      if (visibleVersesKeys.size === 0) return;
      
      let maxVerseNum = -1;
      let maxVerseKey = "";

      visibleVersesKeys.forEach((key) => {
        const [chapterIdStr, verseIdStr] = getVerseAndChapterNumbersFromKey(key);
        const vNum = parseInt(verseIdStr, 10);
        if (!isNaN(vNum) && vNum > maxVerseNum) {
          maxVerseNum = vNum;
          maxVerseKey = key;
        }
      });

      if (maxVerseKey) {
        const verseData = verses.find((v) => v.verseKey === maxVerseKey);
        const updatePayload: any = {
          verseKey: maxVerseKey,
          juz: verseData?.juzNumber ?? null,
          hizb: verseData?.hizbNumber ?? null,
          page: verseData?.pageNumber ?? null,
        };
        
        if (chapterId) {
          // Use totalVerses if available for the whole chapter, otherwise fall back to verses loaded so far
          const maxVerses = totalVerses || verses[verses.length - 1]?.verseNumber || maxVerseNum;
          updatePayload.progress = Math.min(100, Math.ceil((maxVerseNum * 100) / maxVerses));
        }

        setActiveData(updatePayload);
      }
    };

    const updateActiveVerseDebounced = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateActiveVerse);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        let changed = false;
        for (const entry of entries) {
          const verseKey = (entry.target as HTMLElement).dataset.verseKey;
          if (!verseKey) continue;

          if (entry.isIntersecting) {
            visibleVersesKeys.add(verseKey);
            changed = true;
          } else {
            visibleVersesKeys.delete(verseKey);
            changed = true;
          }
        }
        if (changed) {
          updateActiveVerseDebounced();
        }
      },
      {
        rootMargin: "-64px 0px -40% 0px",
        threshold: 0.1,
      }
    );

    const observedElements = new WeakSet<Element>();

    const observeNode = (node: Element) => {
      if (node && !observedElements.has(node)) {
        observer.observe(node);
        observedElements.add(node);
      }
    };

    // Observe initial elements that are already present in the DOM
    document.querySelectorAll("[data-verse-key]").forEach(observeNode);

    // Event listener for elements mounted dynamically (zero-overhead)
    const handleElementMounted = (e: Event) => {
      const el = (e as CustomEvent).detail?.element;
      if (el) {
        observeNode(el);
      }
    };

    window.addEventListener("verse-node-mounted", handleElementMounted);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      observer.disconnect();
      window.removeEventListener("verse-node-mounted", handleElementMounted);
    };
  }, [verses, chapterId, totalVerses, setActiveData]);

  // Fallback for non-chapter pages (e.g. search, home) 
  // where we track progress purely based on window scroll
  useEffect(() => {
    if (chapterId) return;

    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      
      setActiveData({
        progress: Math.min(100, Math.max(0, scrolled))
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [chapterId, setActiveData]);

  return null;
};

export default VerseTracker;
