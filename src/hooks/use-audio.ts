import { useQuery } from "@tanstack/react-query";
import { getChapterAudioData } from "@/services/quran-api";

export function useAudioData(reciterId: number, chapterId: number) {
  return useQuery({
    queryKey: ["audio", reciterId, chapterId],
    queryFn: () => getChapterAudioData(reciterId, chapterId, true),
    staleTime: Infinity,
    enabled: !!reciterId && !!chapterId,
  });
}

export function useVerseTimings(reciterId: number, chapterId: number) {
  return useQuery({
    queryKey: ["audio", reciterId, chapterId],
    queryFn: () => getChapterAudioData(reciterId, chapterId, true),
    staleTime: Infinity,
    enabled: !!reciterId && !!chapterId,
    select: (data) => data?.verseTimings || [],
  });
}
