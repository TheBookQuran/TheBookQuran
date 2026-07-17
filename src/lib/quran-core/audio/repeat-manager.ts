import { RepeatSettings, RepeatStep } from "./types";

export class AudioRepeatManager {
  private totalRangeCycle: number;
  private totalVerseCycle: number;
  private fromVerseNumber: number;
  private toVerseNumber: number;
  private delayMultiplier: number;

  private currentRangeCycle: number = 1;
  private currentVerseCycle: number = 1;
  private currentVerseNumber: number;

  constructor(settings: RepeatSettings) {
    this.totalRangeCycle = settings.totalRangeCycle;
    this.totalVerseCycle = settings.totalVerseCycle;
    this.fromVerseNumber = settings.fromVerseNumber;
    this.toVerseNumber = settings.toVerseNumber;
    this.delayMultiplier = settings.delayMultiplier;

    this.currentVerseNumber = settings.fromVerseNumber;
  }

  public getCurrentVerseNumber(): number {
    return this.currentVerseNumber;
  }

  public getCurrentVerseCycle(): number {
    return this.currentVerseCycle;
  }

  public getCurrentRangeCycle(): number {
    return this.currentRangeCycle;
  }

  /**
   * Handle the event when a verse finishes playing.
   *
   * @param {number} verseDuration - Duration of the played verse in seconds.
   * @returns {RepeatStep}
   */
  public onVerseEnded(verseDuration: number): RepeatStep {
    if (this.currentVerseCycle < this.totalVerseCycle) {
      this.currentVerseCycle += 1;
      const verseDelay = verseDuration * this.delayMultiplier;
      return {
        type: "REPEAT_SAME",
        verseNumber: this.currentVerseNumber,
        delay: verseDelay,
      };
    } else {
      this.currentVerseCycle = 1;
      if (this.currentVerseNumber < this.toVerseNumber) {
        this.currentVerseNumber += 1;
        return {
          type: "PLAY_NEXT",
          verseNumber: this.currentVerseNumber,
        };
      } else {
        if (this.currentRangeCycle < this.totalRangeCycle) {
          this.currentRangeCycle += 1;
          this.currentVerseNumber = this.fromVerseNumber;
          return {
            type: "PLAY_NEXT",
            verseNumber: this.currentVerseNumber,
          };
        } else {
          return {
            type: "FINISHED",
          };
        }
      }
    }
  }

  /**
   * Skip to the next verse in the range.
   *
   * @returns {RepeatStep}
   */
  public nextAyah(): RepeatStep {
    if (this.currentVerseNumber < this.toVerseNumber) {
      this.currentVerseNumber += 1;
      this.currentVerseCycle = 1;
      return {
        type: "PLAY_NEXT",
        verseNumber: this.currentVerseNumber,
      };
    }
    return { type: "FINISHED" };
  }

  /**
   * Go back to the previous verse in the range.
   *
   * @returns {RepeatStep}
   */
  public previousAyah(): RepeatStep {
    if (this.currentVerseNumber > this.fromVerseNumber) {
      this.currentVerseNumber -= 1;
      this.currentVerseCycle = 1;
      return {
        type: "PLAY_PREV",
        verseNumber: this.currentVerseNumber,
      };
    }
    return { type: "FINISHED" };
  }

  /**
   * Select a specific verse in the range.
   *
   * @param {number} ayahNumber
   * @returns {RepeatStep}
   */
  public selectAyah(ayahNumber: number): RepeatStep {
    if (ayahNumber >= this.fromVerseNumber && ayahNumber <= this.toVerseNumber) {
      this.currentVerseNumber = ayahNumber;
      this.currentVerseCycle = 1;
      return {
        type: "PLAY_SELECTED",
        verseNumber: this.currentVerseNumber,
      };
    }
    return { type: "FINISHED" };
  }
}
