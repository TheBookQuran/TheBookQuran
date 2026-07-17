import { groupBy } from "es-toolkit";
import { Verse } from "../../../types/quran";

/**
 * Groups verses into pages to match the Quran Page (Mushaf) layout
 * The returning value is an object containing the page number as a key,
 * and array of verses for the value. E.g.
 * {
 *  1: [verses],
 *  2: [verses]
 *  ...
 * }
 *
 * @param {Verse[]} verses
 * @returns {Record<number, Verse[]>}
 */
export const groupPagesByVerses = (verses: Verse[]): Record<number, Verse[]> => {
  // Groups the verses based on their page number
  const pages = groupBy(verses, (verse) => verse.pageNumber);

  return pages as unknown as Record<number, Verse[]>;
};

export default groupPagesByVerses;
