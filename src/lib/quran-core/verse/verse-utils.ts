import { parseVerseRange, sortByVerseKey } from "./verse-keys";
import { ScrollAlign } from "../../../types/quran";
import { truncateAtWord } from "@/lib/textUtils";

const COLON_SPLITTER = ":";

export const getChapterNumberFromKey = (verseKey: string): number =>
  Number(verseKey.split(COLON_SPLITTER)[0]);

export const getVerseNumberFromKey = (verseKey: string): number =>
  Number(verseKey.split(COLON_SPLITTER)[1]);

export const getVerseNumberRangeFromKey = (
  verseKey: string
): { surah: number; from: number; to: number } => {
  const splits = verseKey.split(COLON_SPLITTER);
  const surahNumber = splits[0];
  const verseNumber = splits[1]; // for example (3-5)
  const [from, to] = verseNumber.split("-"); // for example [3, 5]
  return { surah: Number(surahNumber), from: Number(from), to: to ? Number(to) : Number(from) };
};

export const getVerseAndChapterNumbersFromKey = (verseKey: string): [string, string] => {
  const splits = verseKey.split(COLON_SPLITTER);
  return [splits[0], splits[1]];
};

export const getWordDataByLocation = (wordLocation: string): [string, string, string] => {
  const locationSplits = wordLocation.split(COLON_SPLITTER);
  return [locationSplits[0], locationSplits[1], locationSplits[2]];
};

export const getFirstWordOfSurah = (
  wordLocation: string
): { chapterId: string; isFirstWordOfSurah: boolean } => {
  const locationSplits = getWordDataByLocation(wordLocation);
  return {
    chapterId: locationSplits[0],
    isFirstWordOfSurah: locationSplits[1] === "1" && locationSplits[2] === "1",
  };
};

export const formatChapterId = (id: string | number) => `0${id}`.slice(-2);

export const getVerseUrl = (verseKey: string): string => {
  const [chapterNumber, verseNumber] = getVerseAndChapterNumbersFromKey(verseKey);
  return `/${chapterNumber}/${verseNumber}`;
};

export { sortByVerseKey };

export const sortVersesObjectByVerseKeys = (object: Record<string, any>): Record<string, any> => {
  const sortedObject: Record<string, any> = {};
  Object.keys(object)
    .sort((verseKey1, verseKey2) => sortByVerseKey(verseKey1, verseKey2))
    .forEach((verseKey) => {
      sortedObject[verseKey] = object[verseKey];
    });
  return sortedObject;
};

export const makeVerseKey = (
  chapterNumber: number | string,
  verseNumberOrRangeFrom: number | string,
  rangeTo?: number | string
): string => {
  if (rangeTo && verseNumberOrRangeFrom !== rangeTo) {
    return `${chapterNumber}:${verseNumberOrRangeFrom}-${rangeTo}`;
  }
  return `${chapterNumber}:${verseNumberOrRangeFrom}`;
};

export const makeWordLocation = (verseKey: string, wordPosition: number): string =>
  `${verseKey}:${wordPosition}`;

export const isFirstVerseOfSurah = (verseNumber: number): boolean => verseNumber === 1;

export const isLastVerseOfSurah = (
  chaptersData: any,
  chapterNumber: string,
  verseNumber: number
): boolean => {
  const chapterData = chaptersData ? chaptersData[String(Number(chapterNumber))] : null;
  return chapterData ? verseNumber === chapterData.versesCount : false;
};

export const getChapterFirstAndLastVerseKey = (chaptersData: any, chapterId: string) => {
  if (!chaptersData) {
    return ["", ""];
  }
  const chapterData = chaptersData[String(Number(chapterId))];
  const count = chapterData ? chapterData.versesCount : 0;
  return [
    makeVerseKey(Number(chapterId), 1),
    makeVerseKey(Number(chapterId), count),
  ];
};

export const shortenVerseText = truncateAtWord;

export const getFirstAndLastVerseKeys = (verses: Record<string, any>): string[] => {
  const verseKeys = Object.keys(verses).sort(sortByVerseKey);
  return [verseKeys[0], verseKeys[verseKeys.length - 1]];
};

export const isVerseKeyWithinRanges = (verseKey: string, ranges: string[] | string) => {
  const [chapter, verse] = getVerseAndChapterNumbersFromKey(verseKey).map(Number);
  const rangesArray = Array.isArray(ranges) ? ranges : [ranges];

  for (let i = 0; i < rangesArray.length; i += 1) {
    const verseRange = rangesArray[i];
    const parsedRange = parseVerseRange(verseRange, true);
    if (!parsedRange) continue;

    const from = parsedRange[0];
    const to = parsedRange[1];

    if (chapter < from.chapter || chapter > to.chapter) {
      continue;
    }

    if (chapter === from.chapter && verse < from.verse) {
      continue;
    }

    if (chapter === to.chapter && verse > to.verse) {
      continue;
    }

    return true;
  }

  return false;
};

const SCROLL_POSITION_THRESHOLDS = {
  START: 33.3,
  CENTER: 66.6,
} as const;

export const getVersePositionWithinAMushafPage = (
  startingVerseKey: string,
  pagesVersesRange: { from: string; to: string }
): ScrollAlign => {
  const pageStartVerseNumber = getVerseNumberFromKey(pagesVersesRange.from);
  const pageEndVerseNumber = getVerseNumberFromKey(pagesVersesRange.to);
  const verseOrderWithinPage = getVerseNumberFromKey(startingVerseKey) - pageStartVerseNumber + 1;
  const totalPageNumberOfVerses = pageEndVerseNumber - pageStartVerseNumber + 1;
  const verseKeyPosition = (verseOrderWithinPage * 100) / totalPageNumberOfVerses;
  if (verseKeyPosition <= SCROLL_POSITION_THRESHOLDS.START) {
    return ScrollAlign.Start;
  }
  if (verseKeyPosition <= SCROLL_POSITION_THRESHOLDS.CENTER) {
    return ScrollAlign.Center;
  }
  return ScrollAlign.End;
};

export const getDistanceBetweenVerses = (
  chaptersData: any,
  firstVerseKey: string,
  secondVerseKey: string
): number => {
  let [firstChapterString, firstVerseNumberString] = getVerseAndChapterNumbersFromKey(firstVerseKey);
  const [secondChapterString, secondVerseNumberString] = getVerseAndChapterNumbersFromKey(secondVerseKey);
  let firstChapterNumber = Number(firstChapterString);
  let secondChapterNumber = Number(secondChapterString);
  let firstVerseNumber = Number(firstVerseNumberString);
  let secondVerseNumber = Number(secondVerseNumberString);

  if (firstChapterNumber === secondChapterNumber) {
    return Math.abs(firstVerseNumber - secondVerseNumber);
  }

  if (firstChapterNumber > secondChapterNumber) {
    [
      firstVerseNumber,
      secondVerseNumber,
      firstChapterNumber,
      secondChapterNumber,
      firstChapterString,
    ] = [
      secondVerseNumber,
      firstVerseNumber,
      secondChapterNumber,
      firstChapterNumber,
      secondChapterString,
    ];
  }

  let distance = 0;
  if (secondChapterNumber - firstChapterNumber > 1) {
    for (let currentChapterId = firstChapterNumber + 1; currentChapterId < secondChapterNumber; currentChapterId += 1) {
      const chapterData = chaptersData ? chaptersData[String(currentChapterId)] : null;
      distance += chapterData ? chapterData.versesCount : 0;
    }
  }

  const firstChapterData = chaptersData ? chaptersData[firstChapterString] : null;
  const firstChapterCount = firstChapterData ? firstChapterData.versesCount : 0;

  return (
    distance +
    secondVerseNumber +
    firstChapterCount -
    firstVerseNumber
  );
};
