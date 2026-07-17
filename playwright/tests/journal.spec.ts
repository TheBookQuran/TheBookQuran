import { test, expect } from "@playwright/test";
import { ReaderPage } from "../pages/ReaderPage";
import { JournalPage } from "../pages/JournalPage";

test.describe("Journal and Custom Bookmarks Flow", () => {
  test("should bookmark a verse and write reflection note, then verify in My Quran page", async ({ page }) => {
    const readerPage = new ReaderPage(page);
    const journalPage = new JournalPage(page);

    // 1. Go to Surah Al-Fatihah
    await page.goto("/en/1");
    
    // Wait for client-side hydration to finish
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    // 2. Bookmark the first verse
    await readerPage.toggleBookmarkVerse("1:1");

    // 3. Click the Reflect (Notes) button to add reflection
    await readerPage.clickNotesButton("1:1");

    // 4. Verify we navigated to My Quran page with pre-filled verse parameter
    await expect(page).toHaveURL(/\/en\/my-quran\?verse=1:1/, { timeout: 8000 });

    // Wait for My Quran page to hydrate and prefill reference
    await page.waitForTimeout(1000);

    // The note form should be open. Type in note details and save it.
    await journalPage.noteTitleInput.fill("Reflection on Fatihah");
    await journalPage.noteContentTextarea.fill("E2E Testing Reflection content for Al-Fatihah.");
    await journalPage.saveNoteBtn.click();

    // 5. Verify the note is listed in the notes tab
    const noteCard = await journalPage.getNoteCard("Reflection on Fatihah");
    await expect(noteCard).toBeVisible();
    await expect(noteCard).toContainText("E2E Testing Reflection");

    // 6. Go to Bookmarks tab
    await journalPage.selectTab("bookmarks");

    // 7. Verify the bookmarked verse 1:1 is visible in the bookmarks tab
    const bookmarkItem = page.locator("[class*='listItem']").first();
    await expect(bookmarkItem).toBeVisible();
    await expect(bookmarkItem).toContainText("1:1");
  });
});
