import { groupBy } from "es-toolkit";
import { Verse, Word } from "../../../types/quran";

/**
 * Groups verses into lines to match the Quran Page (Madani Mushaf) layout
 * The returning value is an object containing the page and line number as a key,
 * and array of word for the value. E.g.
 * {
 *  Page1-Line2: [words],
 *  Page1-Line3: [words]
 *  ...
 * }
 *
 * @param {Verse[]} verses
 * @returns {Record<string, Word[]>}
 */
export const groupLinesByVerses = (verses: Verse[]): Record<string, Word[]> => {
  let words: Word[] = [];

  // Flattens the verses into an array of words
  verses.forEach((verse) => {
    if (verse.words) {
      verse.words.forEach((word) => {
        words.push({
          ...word,
          hizbNumber: verse.hizbNumber,
        });
      });
    }
  });

  // Groups the words based on their (page and) line number
  const lines = groupBy(words, (word) => `Page${word.pageNumber}-Line${word.lineNumber}`);

  return lines;
};

export default groupLinesByVerses;
