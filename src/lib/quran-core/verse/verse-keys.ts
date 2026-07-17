export type VerseRangeInfo<T> = [
  {
    chapter: T;
    verse: T;
    verseKey: string;
  },
  {
    chapter: T;
    verse: T;
    verseKey: string;
  }
];

type VerseInfoFormat<AsNumbers extends boolean> = [AsNumbers] extends [true] ? number : string;

const getChapterData = (chapters: any, id: string) => {
  if (!chapters) return null;
  return chapters[id] || chapters[String(Number(id))];
};

/**
 * Generate the verse keys between two verse keys.
 *
 * @param {any} chaptersData
 * @param {string} fromVerseKey
 * @param {string} toVerseKey
 * @returns {string[]}
 */
export const generateVerseKeysBetweenTwoVerseKeys = (
  chaptersData: any,
  fromVerseKey: string,
  toVerseKey: string
): string[] => {
  const verseKeys: string[] = [];
  const [startChapter, startVerse] = fromVerseKey.split(":");
  const [endChapter, endVerse] = toVerseKey.split(":");

  if (startChapter === endChapter) {
    const start = Number(startVerse);
    const end = Number(endVerse);
    for (let verseNumber = start; verseNumber <= end; verseNumber++) {
      verseKeys.push(`${startChapter}:${verseNumber}`);
    }
  } else {
    const start = Number(startChapter);
    const end = Number(endChapter);
    for (let chapterNumber = start; chapterNumber <= end; chapterNumber++) {
      if (chapterNumber === start) {
        const chapterData = getChapterData(chaptersData, startChapter);
        const versesCount = chapterData ? chapterData.versesCount : 0;
        const startV = Number(startVerse);
        for (let verseNumber = startV; verseNumber <= versesCount; verseNumber++) {
          verseKeys.push(`${startChapter}:${verseNumber}`);
        }
      } else if (chapterNumber === end) {
        const endV = Number(endVerse);
        for (let verseNumber = 1; verseNumber <= endV; verseNumber++) {
          verseKeys.push(`${endChapter}:${verseNumber}`);
        }
      } else {
        const chapterData = getChapterData(chaptersData, String(chapterNumber));
        const versesCount = chapterData ? chapterData.versesCount : 0;
        for (let verseNumber = 1; verseNumber <= versesCount; verseNumber++) {
          verseKeys.push(`${chapterNumber}:${verseNumber}`);
        }
      }
    }
  }

  return verseKeys;
};

export const parseVerseRange = <AsNumbers extends boolean>(
  verseRange: string,
  parseAsNumbers?: AsNumbers
): VerseRangeInfo<VerseInfoFormat<AsNumbers>> | null => {
  const result = verseRange.match(/(\d+):(\d+)-(\d+):(\d+)/);

  if (!result) {
    return null;
  }

  const [, startChapter, startVerse, endChapter, endVerse] = result;

  if (!startChapter || !startVerse || !endChapter || !endVerse) {
    return null;
  }

  const parse = (value: string) =>
    (parseAsNumbers ? Number(value) : value) as VerseInfoFormat<AsNumbers>;

  return [
    {
      chapter: parse(startChapter),
      verse: parse(startVerse),
      verseKey: `${startChapter}:${startVerse}`,
    },
    {
      chapter: parse(endChapter),
      verse: parse(endVerse),
      verseKey: `${endChapter}:${endVerse}`,
    },
  ];
};

export const sortByVerseKey = (a: string, b: string): number => {
  const [aChapter, aVerse] = a.split(":").map(Number);
  const [bChapter, bVerse] = b.split(":").map(Number);
  if (aChapter !== bChapter) return aChapter - bChapter;
  return aVerse - bVerse;
};

/**
 * Sort verse keys by chapter and verse number in ascending order.
 *
 * @param {string[]} verseKeys
 * @returns {string[]}
 */
export const sortVerseKeys = (verseKeys: string[]): string[] => {
  return [...verseKeys].sort(sortByVerseKey);
};

/**
 * Convert an array of individual verse keys to optimized verse ranges.
 *
 * @param {string[]} verseKeys
 * @returns {string[]}
 */
export const verseKeysToRanges = (verseKeys: string[]): string[] => {
  if (verseKeys.length === 0) return [];

  const sortedKeys = sortVerseKeys(verseKeys);
  const ranges: string[] = [];

  let rangeStart = sortedKeys[0];
  let rangeEnd = sortedKeys[0];

  for (let i = 1; i < sortedKeys.length; i += 1) {
    const currentKey = sortedKeys[i];
    const [currentChapter, currentVerse] = currentKey.split(":").map(Number);
    const [prevChapter, prevVerse] = rangeEnd.split(":").map(Number);

    const isConsecutive = currentChapter === prevChapter && currentVerse === prevVerse + 1;

    if (isConsecutive) {
      rangeEnd = currentKey;
    } else {
      ranges.push(`${rangeStart}-${rangeEnd}`);
      rangeStart = currentKey;
      rangeEnd = currentKey;
    }
  }

  ranges.push(`${rangeStart}-${rangeEnd}`);

  return ranges;
};

/**
 * Convert verse ranges to verse keys.
 *
 * @param {any} chaptersData
 * @param {string[]} verseRanges
 * @returns {string[]}
 */
export const verseRangesToVerseKeys = (
  chaptersData: any,
  verseRanges: string[]
): string[] => {
  const allKeys = verseRanges
    .map((verseRange) => {
      const parsedRange = parseVerseRange(verseRange, true);
      if (!parsedRange) return [];

      return generateVerseKeysBetweenTwoVerseKeys(
        chaptersData,
        parsedRange[0].verseKey,
        parsedRange[1].verseKey
      );
    })
    .flat();

  return Array.from(new Set(allKeys));
};
