"use client";

import React, { useRef, useState, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import * as Slider from "@radix-ui/react-slider";

import { useAudioPlayerStore } from "@/stores/audio-player";
import { useSettingsStore } from "@/stores/settings";
import { getAvailableReciters } from "@/services/quran-api";
import { useChapters } from "@/hooks/use-chapters";
import { getVerseNumberFromKey } from "@/lib/quran-core/verse/verse-utils";
import { useAudioEngine } from "@/hooks/use-audio-engine";
import { AudioProgressBar } from "./AudioProgressBar";
import styles from "./AudioPlayer.module.css";
import clsx from "clsx";

export const AudioPlayer: React.FC = () => {
  const locale = useLocale();
  const t = useTranslations("common");

  // Store state using specific selectors (excluding elapsed to prevent constant re-renders)
  const isPlaying = useAudioPlayerStore((state) => state.isPlaying);
  const currentVerseKey = useAudioPlayerStore((state) => state.currentVerseKey);
  const duration = useAudioPlayerStore((state) => state.duration);
  const playbackRate = useAudioPlayerStore((state) => state.playbackRate);
  const volume = useAudioPlayerStore((state) => state.volume);
  const reciterId = useSettingsStore((state) => state.selectedReciter);
  const repeatSettings = useAudioPlayerStore((state) => state.repeatSettings);

  const setIsPlaying = useAudioPlayerStore((state) => state.setIsPlaying);
  const setCurrentVerseKey = useAudioPlayerStore((state) => state.setCurrentVerseKey);
  const setPlaybackRate = useAudioPlayerStore((state) => state.setPlaybackRate);
  const setVolume = useAudioPlayerStore((state) => state.setVolume);
  const clearRepeatManager = useAudioPlayerStore((state) => state.clearRepeatManager);
  const setCurrentWordLocation = useAudioPlayerStore((state) => state.setCurrentWordLocation);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const prevVolumeRef = useRef<number>(volume);

  const handleDownload = () => {
    if (!engine.audioUrl) return;
    setIsDownloading(true);
    
    const url = engine.audioUrl;
    const splits = url.substring(url.lastIndexOf("/") + 1).split("?");
    const [filename] = splits;

    fetch(url)
      .then((response) => {
        if (!response.ok) throw new Error("Network response was not ok");
        return response.blob();
      })
      .then((blob) => {
        const a = document.createElement("a");
        const objectUrl = window.URL.createObjectURL(blob);
        a.href = objectUrl;
        a.download = filename || "audio.mp3";
        a.style.display = "none";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(objectUrl);
        setIsDownloading(false);
      })
      .catch((error) => {
        console.error("Download failed:", error);
        // Fallback: open in new window
        const a = document.createElement("a");
        a.href = url;
        a.target = "_blank";
        a.download = filename || "audio.mp3";
        a.style.display = "none";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setIsDownloading(false);
      });
  };

  const verseNumber = currentVerseKey ? getVerseNumberFromKey(currentVerseKey) : null;

  const effectiveVolume = isMuted ? 0 : volume;

  // Use the extracted hook for audio engines and handlers
  const engine = useAudioEngine(audioRef, effectiveVolume);

  // Fetch chapters list to show Surah name
  const { data: chapters } = useChapters(locale);
  const currentChapter = chapters?.find((c) => c.id === engine.chapterId);

  // Fetch reciters list to show reciter name
  const { data: recitersData } = useQuery({
    queryKey: ["reciters", locale],
    queryFn: () => getAvailableReciters(locale),
    staleTime: 1000 * 60 * 60, // 1 hour
  });
  const currentReciter = recitersData?.reciters?.find((r) => r.id === reciterId);

  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      setVolume(prevVolumeRef.current);
    } else {
      prevVolumeRef.current = volume;
      setIsMuted(true);
    }
  };

  const handleVolumeChange = (values: number[]) => {
    const newVol = values[0] / 100;
    setVolume(newVol);
    if (newVol > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const handleSeek = React.useCallback(
    (values: number[]) => {
      engine.seekTo(values[0]);
    },
    [engine]
  );

  const handleClose = () => {
    setIsPlaying(false);
    setCurrentVerseKey(null);
    setCurrentWordLocation(null);
    if (audioRef.current) {
      audioRef.current.src = "";
    }
  };

  // Do not render anything if no active ayah is playing
  if (!currentVerseKey) return null;

  return (
    <div className={styles.audioPlayer}>
      <AudioProgressBar audioRef={audioRef} onSeek={handleSeek} locale={locale} />
      <audio
        ref={audioRef}
        onTimeUpdate={engine.handleTimeUpdate}
        onDurationChange={engine.handleDurationChange}
        onEnded={engine.handleAudioEnded}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      <div className={styles.container}>
        {/* Left: Metadata */}
        <div className={styles.meta}>
          <div className={styles.surahInfo}>
            <span className={styles.surahName}>
              {currentChapter ? `${t("surah")} ${currentChapter.transliteratedName}` : ""}
            </span>
            <span className={styles.verseKey}>{currentVerseKey}</span>
          </div>
          <div className={styles.reciterName}>
            {currentReciter
              ? locale === "ar" && currentReciter.translatedName?.name
                ? currentReciter.translatedName.name
                : currentReciter.name
              : t("loading")}
            {currentReciter?.recitationStyle && (
              <span className={styles.styleBadge}>{currentReciter.recitationStyle}</span>
            )}
          </div>
        </div>

        {/* Middle: Controls */}
        <div className={styles.mainControls}>
          <div className={styles.buttonGroup}>
            <button
              onClick={engine.playPreviousVerse}
              className={styles.controlButton}
              title={locale === "ar" ? "الآية السابقة" : "Previous Verse"}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="19 20 9 12 19 4 19 20"></polygon>
                <line x1="5" y1="19" x2="5" y2="5"></line>
              </svg>
            </button>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`${styles.controlButton} ${styles.playPauseButton}`}
              title={isPlaying ? (locale === "ar" ? "إيقاف مؤقت" : "Pause") : (locale === "ar" ? "تشغيل" : "Play")}
            >
              {isPlaying ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="4" width="4" height="16" rx="1"></rect>
                  <rect x="14" y="4" width="4" height="16" rx="1"></rect>
                </svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
              )}
            </button>

            <button
              onClick={engine.playNextVerse}
              className={styles.controlButton}
              title={locale === "ar" ? "الآية التالية" : "Next Verse"}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5 4 15 12 5 20 5 4"></polygon>
                <line x1="19" y1="5" x2="19" y2="19"></line>
              </svg>
            </button>
          </div>
        </div>

        {/* Right: Sound, Speed, Repeat, Close */}
        <div className={styles.auxControls}>
          {/* Volume Control */}
          <div className={styles.volumeContainer}>
            <button
              onClick={toggleMute}
              className={styles.auxButton}
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted || volume === 0 ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 5L6 9H2v6h4l5 4V5z"></path>
                  <line x1="23" y1="9" x2="17" y2="15"></line>
                  <line x1="17" y1="9" x2="23" y2="15"></line>
                </svg>
              ) : volume < 0.5 ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 5L6 9H2v6h4l5 4V5z"></path>
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 5L6 9H2v6h4l5 4V5z"></path>
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                </svg>
              )}
            </button>
            <Slider.Root
              className={styles.volumeSlider}
              value={[isMuted ? 0 : volume * 100]}
              max={100}
              step={1}
              onValueChange={handleVolumeChange}
            >
              <Slider.Track className={styles.sliderTrack}>
                <Slider.Range className={styles.sliderRange} />
              </Slider.Track>
              <Slider.Thumb className={styles.sliderThumb} />
            </Slider.Root>
          </div>

          {/* Playback Speed */}
          <div className={styles.speedSelector}>
            <button
              onClick={() => setShowSpeedMenu(!showSpeedMenu)}
              className={`${styles.auxButton} ${styles.speedButton}`}
              title={locale === "ar" ? "سرعة التشغيل" : "Playback Speed"}
            >
              {playbackRate}x
            </button>

            {showSpeedMenu && (
              <div className={styles.speedMenu}>
                {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => {
                      setPlaybackRate(rate);
                      setShowSpeedMenu(false);
                    }}
                    className={`${styles.speedMenuItem} ${playbackRate === rate ? styles.speedActive : ""}`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Repeat Button */}
          <button
            onClick={() => {
              if (repeatSettings) {
                clearRepeatManager();
              } else {
                useAudioPlayerStore.getState().setRepeatSettings({
                  totalRangeCycle: 1,
                  totalVerseCycle: 3,
                  fromVerseNumber: verseNumber || 1,
                  toVerseNumber: verseNumber || 1,
                  delayMultiplier: 0.5,
                });
              }
            }}
            className={`${styles.auxButton} ${repeatSettings ? styles.active : ""}`}
            title={locale === "ar" ? "تكرار الآية" : "Repeat Verse"}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="17 1 21 5 17 9"></polyline>
              <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
              <polyline points="7 23 3 19 7 15"></polyline>
              <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
            </svg>
            {repeatSettings && <span className={styles.repeatBadge}>{repeatSettings.totalVerseCycle}</span>}
          </button>

          {/* Download Button */}
          <button
            onClick={handleDownload}
            disabled={!engine.audioUrl || isDownloading}
            className={`${styles.auxButton} ${isDownloading ? styles.downloading : ""}`}
            title={locale === "ar" ? "تحميل السورة" : "Download Surah"}
          >
            {isDownloading ? (
              <span className={styles.spinner} />
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
            )}
          </button>

          <div className={styles.divider} />

          {/* Close */}
          <button
            onClick={handleClose}
            className={styles.auxButton}
            title={locale === "ar" ? "إغلاق المشغل" : "Close Player"}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;
