/**
 * Pad a chapter ID to 3 digits for QCF font calligraphy code.
 * e.g. 1 → "001", 36 → "036", 114 → "114"
 */
export const getSurahCalligraphyCode = (id: string | number): string =>
  String(id).padStart(3, "0");

/**
 * Whether this chapter should display Bismillah before it.
 * Al-Fatiha (1) already contains it; At-Tawbah (9) doesn't have one.
 */
export const hasBismillahPre = (chapterId: string | number): boolean => {
  const chapterIdNum = Number(chapterId);
  return chapterIdNum !== 1 && chapterIdNum !== 9;
};

/**
 * Build a word audio URL from a word location string "chapter:verse:word".
 */
export const getWordAudioUrl = (location: string): string => {
  const [chapterId, verseId, wordId] = location.split(":");
  return `https://audio.qurancdn.com/wbw/${chapterId.padStart(3, "0")}_${verseId.padStart(3, "0")}_${wordId.padStart(3, "0")}.mp3`;
};
