const COLON_SPLITTER = ":";

/**
 * sort the the word location of the verses
 *
 * @param {string[]} locations
 * @returns {string[]} sortedLocations
 */
export const sortWordLocation = (locations: string[]): string[] => {
  return [...locations].sort((a, b) => {
    const [aChapter, aVerse, aWord] = a.split(COLON_SPLITTER);
    const [bChapter, bVerse, bWord] = b.split(COLON_SPLITTER);

    const aChapterNum = Number(aChapter);
    const bChapterNum = Number(bChapter);
    if (aChapterNum > bChapterNum) return 1;
    if (aChapterNum < bChapterNum) return -1;

    const aVerseNum = Number(aVerse);
    const bVerseNum = Number(bVerse);
    if (aVerseNum > bVerseNum) return 1;
    if (aVerseNum < bVerseNum) return -1;

    const aWordNum = Number(aWord);
    const bWordNum = Number(bWord);
    if (aWordNum > bWordNum) return 1;
    if (aWordNum < bWordNum) return -1;

    return 0;
  });
};
