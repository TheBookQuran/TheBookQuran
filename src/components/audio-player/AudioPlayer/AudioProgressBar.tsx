"use client";

import React, { useEffect, useState } from "react";
import * as Slider from "@radix-ui/react-slider";
import { useAudioPlayerStore } from "@/stores/audio-player";
import styles from "./AudioPlayer.module.css";

interface AudioProgressBarProps {
  audioRef: React.RefObject<HTMLAudioElement | null>;
  onSeek: (values: number[]) => void;
  locale: string;
}

export const AudioProgressBar: React.FC<AudioProgressBarProps> = ({
  audioRef,
  onSeek,
  locale,
}) => {
  const elapsed = useAudioPlayerStore((state) => state.elapsed);
  const duration = useAudioPlayerStore((state) => state.duration);
  const [bufferedPercent, setBufferedPercent] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleProgress = () => {
      if (audio.buffered.length > 0 && audio.duration) {
        const bufferedEnd = audio.buffered.end(audio.buffered.length - 1);
        setBufferedPercent((bufferedEnd / audio.duration) * 100);
      } else {
        setBufferedPercent(0);
      }
    };

    audio.addEventListener("progress", handleProgress);
    audio.addEventListener("loadedmetadata", handleProgress);
    audio.addEventListener("durationchange", handleProgress);
    handleProgress();

    return () => {
      audio.removeEventListener("progress", handleProgress);
      audio.removeEventListener("loadedmetadata", handleProgress);
      audio.removeEventListener("durationchange", handleProgress);
    };
  }, [audioRef, duration]);

  return (
    <Slider.Root
      className={styles.progressBarRoot}
      value={[elapsed]}
      max={duration || 100}
      step={0.1}
      onValueChange={onSeek}
      dir={locale === "ar" ? "rtl" : "ltr"}
      aria-label="Audio progress"
    >
      <Slider.Track className={styles.progressBarTrack}>
        <div
          className={styles.progressBarBuffered}
          style={{ width: `${bufferedPercent}%` }}
        />
        <Slider.Range className={styles.progressBarRange} />
      </Slider.Track>
      <Slider.Thumb className={styles.progressBarThumb} aria-label="Seek thumb" />
    </Slider.Root>
  );
};

export default AudioProgressBar;
