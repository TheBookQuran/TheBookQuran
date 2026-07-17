import { test, expect } from "@playwright/test";
import { ReaderPage } from "../pages/ReaderPage";

test.describe("Quran Reader and Audio Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Go to Surah Al-Fatihah
    await page.goto("/en/1");
    // Wait for client-side hydration to attach event listeners
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);
  });

  test("should switch reading preference modes", async ({ page }) => {
    const readerPage = new ReaderPage(page);
    
    // Switch to Reading (Mushaf) mode
    await readerPage.setReadingMode("reading");
    const readingContainer = page.locator(".quran-page");
    await expect(readingContainer.first()).toBeVisible();

    // Switch back to Translation mode
    await readerPage.setReadingMode("translation");
    const translationList = page.locator("[class*='verseRow']");
    await expect(translationList.first()).toBeVisible();
  });

  test("should open settings drawer and toggle word-by-word translation", async ({ page }) => {
    const readerPage = new ReaderPage(page);
    
    await readerPage.setWordByWordTranslation(true);
    await readerPage.closeSettings();

    // Check if inline translations became visible inside words
    const inlineTranslationText = page.locator("span[class*='inlineText']");
    await expect(inlineTranslationText.first()).toBeVisible();

    // Turn it off
    await readerPage.setWordByWordTranslation(false);
    await readerPage.closeSettings();
    await expect(inlineTranslationText.first()).not.toBeVisible();
  });

  test("should click a word to highlight and trigger sound click behavior", async ({ page }) => {
    const readerPage = new ReaderPage(page);

    // Turn on play audio on click
    await readerPage.setPlayWordAudioOnClick(true);
    await readerPage.closeSettings();

    // Click the first word of the first verse (typically "بسم")
    const firstWord = page.locator("span[class*='word']").first();
    await firstWord.click();

    // Expect the clicked word to have the highlighted class
    await expect(firstWord).toHaveClass(/highlighted/);
  });
});
