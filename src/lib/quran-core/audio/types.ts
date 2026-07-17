export interface RepeatSettings {
  totalRangeCycle: number;
  totalVerseCycle: number;
  fromVerseNumber: number;
  toVerseNumber: number;
  delayMultiplier: number;
}

export type RepeatStep =
  | { type: "REPEAT_SAME"; verseNumber: number; delay: number }
  | { type: "PLAY_NEXT"; verseNumber: number }
  | { type: "PLAY_PREV"; verseNumber: number }
  | { type: "PLAY_SELECTED"; verseNumber: number }
  | { type: "FINISHED" };
