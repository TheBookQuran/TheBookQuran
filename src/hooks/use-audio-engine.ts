import React, { useEffect, useRef, useCallback } from "react";
import { useAudioPlayerStore } from "@/stores/audio-player";
import { useSettingsStore } from "@/stores/settings";
import { useAudioData, useVerseTimings } from "@/hooks/use-audio";
import { getChapterNumberFromKey } from "@/lib/quran-core/verse/verse-utils";

export function useAudioEngine(
  audioRef: React.RefObject<HTMLAudioElement | null>,
  effectiveVolume: number
) {
  // Store values
  const isPlaying = useAudioPlayerStore((state) => state.isPlaying);
  const currentVerseKey = useAudioPlayerStore((state) => state.currentVerseKey);
  const playbackRate = useAudioPlayerStore((state) => state.playbackRate);
  const repeatManager = useAudioPlayerStore((state) => state.repeatManager);
  const reciterId = useSettingsStore((state) => state.selectedReciter);

  // Store actions
  const setIsPlaying = useAudioPlayerStore((state) => state.setIsPlaying);
  const setCurrentVerseKey = useAudioPlayerStore((state) => state.setCurrentVerseKey);
  const setElapsed = useAudioPlayerStore((state) => state.setElapsed);
  const setDuration = useAudioPlayerStore((state) => state.setDuration);
  const clearRepeatManager = useAudioPlayerStore((state) => state.clearRepeatManager);
  const setCurrentWordLocation = useAudioPlayerStore((state) => state.setCurrentWordLocation);

  const lastPlayedVerseKeyRef = useRef<string | null>(null);

  const chapterId = currentVerseKey ? getChapterNumberFromKey(currentVerseKey) : null;

  // Fetch audio file metadata and timings
  const { data: audioData } = useAudioData(reciterId, chapterId || 0);
  const { data: timings } = useVerseTimings(reciterId, chapterId || 0);

  // Effect: Handle audio source updates
  useEffect(() => {
    if (audioData?.audioUrl && audioRef.current) {
      const currentSrc = audioRef.current.src;
      if (currentSrc !== audioData.audioUrl) {
        audioRef.current.src = audioData.audioUrl;
        audioRef.current.load();
        if (isPlaying) {
          audioRef.current.play().catch((err) => console.log("Audio play interrupted:", err));
        }
      }
    }
  }, [audioData?.audioUrl, isPlaying, audioRef]);

  // Effect: Handle play/pause commands from store
  useEffect(() => {
    if (!audioRef.current || !audioRef.current.src) return;
    if (isPlaying) {
      audioRef.current.play().catch((err) => console.log("Audio play interrupted:", err));
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, audioRef]);

  // Effect: Sync speed and volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate, audioRef]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = effectiveVolume;
    }
  }, [effectiveVolume, audioRef]);

  // Effect: Handle external changes to currentVerseKey (e.g. click play on an ayah)
  useEffect(() => {
    if (!currentVerseKey || !timings || !audioRef.current) return;

    const key = currentVerseKey;
    if (key === lastPlayedVerseKeyRef.current) return;

    const verseTiming = timings.find((t: any) => t.verseKey === key);
    if (verseTiming) {
      const targetTimeSec = verseTiming.timestampFrom / 1000;
      const audio = audioRef.current;

      const currentMs = audio.currentTime * 1000;
      const isWithinRange = currentMs >= verseTiming.timestampFrom && currentMs <= verseTiming.timestampTo;

      if (!isWithinRange) {
        audio.currentTime = targetTimeSec;
        setElapsed(targetTimeSec);
      }

      lastPlayedVerseKeyRef.current = key;
    }
  }, [currentVerseKey, timings, setElapsed, audioRef]);

  // Audio Event: timeupdate
  const handleTimeUpdate = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !timings) return;

    const currentTimeSec = audio.currentTime;
    setElapsed(currentTimeSec);

    const currentTimeMs = currentTimeSec * 1000;

    const activeVerse = timings.find(
      (t: any) => currentTimeMs >= t.timestampFrom && currentTimeMs <= t.timestampTo
    );

    if (activeVerse) {
      if (activeVerse.verseKey !== currentVerseKey) {
        setCurrentVerseKey(activeVerse.verseKey);
        lastPlayedVerseKeyRef.current = activeVerse.verseKey;
      }

      if (activeVerse.segments && Array.isArray(activeVerse.segments)) {
        const activeSegment = activeVerse.segments.find(
          ([_, from, to]: any) => currentTimeMs >= from && currentTimeMs <= to
        );
        if (activeSegment) {
          setCurrentWordLocation(`${activeVerse.verseKey}:${activeSegment[0]}`);
        } else {
          setCurrentWordLocation(null);
        }
      } else {
        setCurrentWordLocation(null);
      }
    } else {
      setCurrentWordLocation(null);
    }
  }, [timings, currentVerseKey, setElapsed, setCurrentVerseKey, setCurrentWordLocation, audioRef]);

  // Audio Event: durationchange
  const handleDurationChange = useCallback(() => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || 0);
    }
  }, [setDuration, audioRef]);

  const playNextVerse = useCallback(() => {
    if (!timings || !currentVerseKey) return;
    const currentIndex = timings.findIndex((t: any) => t.verseKey === currentVerseKey);
    if (currentIndex !== -1 && currentIndex < timings.length - 1) {
      const nextKey = timings[currentIndex + 1].verseKey;
      setCurrentVerseKey(nextKey);
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  }, [timings, currentVerseKey, setCurrentVerseKey, setIsPlaying]);

  const playPreviousVerse = useCallback(() => {
    if (!timings || !currentVerseKey) return;
    const currentIndex = timings.findIndex((t: any) => t.verseKey === currentVerseKey);
    if (currentIndex > 0) {
      const prevKey = timings[currentIndex - 1].verseKey;
      setCurrentVerseKey(prevKey);
      setIsPlaying(true);
    }
  }, [timings, currentVerseKey, setCurrentVerseKey, setIsPlaying]);

  // Audio Event: ended or manual skip
  const handleAudioEnded = useCallback(() => {
    setIsPlaying(false);
    setCurrentWordLocation(null);

    if (repeatManager) {
      const step = repeatManager.onVerseEnded(audioRef.current?.duration || 0);
      if (step.type === "REPEAT_SAME" && audioRef.current) {
        setTimeout(() => {
          if (audioRef.current) {
            const verseTiming = timings?.find((t: any) => t.verseKey === currentVerseKey);
            if (verseTiming) {
              audioRef.current.currentTime = verseTiming.timestampFrom / 1000;
              setIsPlaying(true);
            }
          }
        }, step.delay);
      } else if (step.type === "PLAY_NEXT") {
        const nextKey = `${chapterId}:${step.verseNumber}`;
        setCurrentVerseKey(nextKey);
        setIsPlaying(true);
      } else {
        clearRepeatManager();
      }
    } else {
      playNextVerse();
    }
  }, [
    repeatManager,
    timings,
    currentVerseKey,
    chapterId,
    playNextVerse,
    setIsPlaying,
    setCurrentWordLocation,
    setCurrentVerseKey,
    clearRepeatManager,
    audioRef,
  ]);

  const seekTo = useCallback(
    (targetTime: number) => {
      if (audioRef.current) {
        audioRef.current.currentTime = targetTime;
        setElapsed(targetTime);
      }
    },
    [setElapsed, audioRef]
  );

  return {
    handleTimeUpdate,
    handleDurationChange,
    handleAudioEnded,
    playNextVerse,
    playPreviousVerse,
    seekTo,
    chapterId,
    audioUrl: audioData?.audioUrl,
  };
}
