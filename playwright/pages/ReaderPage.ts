import { Page, Locator } from "@playwright/test";
import { BasePage } from "./BasePage";

export class ReaderPage extends BasePage {
  readonly settingsBtn: Locator;
  readonly translationModeBtn: Locator;
  readonly readingModeBtn: Locator;
  readonly settingsDrawerTitle: Locator;
  readonly wbwTranslationCheckbox: Locator;
  readonly wbwTransliterationCheckbox: Locator;
  readonly playOnClickCheckbox: Locator;

  constructor(page: Page) {
    super(page);
    this.settingsBtn = page.locator("button[class*='settingsButton']").first();
    this.translationModeBtn = page.locator("button[class*='modeButton']:has-text('Translation'), button[class*='modeButton']:has-text('الترجمة')").first();
    this.readingModeBtn = page.locator("button[class*='modeButton']:has-text('Reading'), button[class*='modeButton']:has-text('قراءة')").first();
    
    // Settings Drawer elements - strictly scoped inside dialog to avoid page header conflicts
    this.settingsDrawerTitle = page.locator("[class*='SettingsDrawer_content'] h2, [class*='SettingsDrawer_title']").first();
    this.wbwTranslationCheckbox = page.locator("[role='dialog'] label").filter({ hasText: "Word Translation" }).locator("input");
    this.wbwTransliterationCheckbox = page.locator("[role='dialog'] label").filter({ hasText: "Word Transliteration" }).locator("input");
    this.playOnClickCheckbox = page.locator("[role='dialog'] label").filter({ hasText: "Play word audio" }).locator("input");
  }

  async openSettings() {
    // If dialog title is not visible, click the settings button and wait for it to open
    if (!(await this.settingsDrawerTitle.isVisible())) {
      await this.settingsBtn.click();
      await this.settingsDrawerTitle.waitFor({ state: "visible", timeout: 8000 });
    }
  }

  async setWordByWordTranslation(enable: boolean) {
    await this.openSettings();
    const checkbox = this.page.locator("[role='dialog'] label").filter({ hasText: "Word Translation" }).locator("input");
    await checkbox.waitFor({ state: "attached" });
    const isChecked = await checkbox.isChecked();
    if (isChecked !== enable) {
      await checkbox.click();
    }
  }

  async setPlayWordAudioOnClick(enable: boolean) {
    await this.openSettings();
    const checkbox = this.page.locator("[role='dialog'] label").filter({ hasText: "Play word audio" }).locator("input");
    await checkbox.waitFor({ state: "attached" });
    const isChecked = await checkbox.isChecked();
    if (isChecked !== enable) {
      await checkbox.click();
    }
  }

  async closeSettings() {
    const closeBtn = this.page.locator("[role='dialog'] button[class*='closeButton'], [role='dialog'] button[aria-label='Close']").first();
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
      await this.settingsDrawerTitle.waitFor({ state: "hidden", timeout: 5000 });
    }
  }

  async setReadingMode(mode: "translation" | "reading") {
    if (mode === "translation") {
      await this.translationModeBtn.click();
    } else {
      await this.readingModeBtn.click();
    }
  }

  async getVerseRow(verseKey: string): Promise<Locator> {
    return this.page.locator(`div[data-verse-key="${verseKey}"]`).first();
  }

  async playVerseAudio(verseKey: string) {
    const row = await this.getVerseRow(verseKey);
    const playBtn = row.locator("button[title*='Play'], button[title*='تشغيل']").first();
    await playBtn.click();
  }

  async toggleBookmarkVerse(verseKey: string) {
    const row = await this.getVerseRow(verseKey);
    const bookmarkBtn = row.locator("button[title*='Bookmark'], button[title*='حفظ']").first();
    await bookmarkBtn.click();
  }

  async clickNotesButton(verseKey: string) {
    const row = await this.getVerseRow(verseKey);
    const notesBtn = row.locator("button[title*='Reflect'], button[title*='تأمل'], button[title*='notes']").first();
    await notesBtn.click();
  }
}
