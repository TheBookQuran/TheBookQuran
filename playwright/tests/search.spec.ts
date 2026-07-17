import { test, expect } from "@playwright/test";
import { SearchPage } from "../pages/SearchPage";

test.describe("Advanced Search Flow", () => {
  test("should search for a term and navigate to the selected verse", async ({ page }) => {
    const searchPage = new SearchPage(page);

    // 1. Go to homepage
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    // 2. Open search and search for "Mercy"
    await searchPage.search("Mercy");

    // 3. Verify that search results list is visible
    await expect(searchPage.resultsList).toBeVisible();

    // 4. Locate the first result card and retrieve its verse key dynamically
    const resultCard = page.locator("[role='dialog'] a[class*='resultCard']").first();
    await expect(resultCard).toBeVisible();
    
    const verseKeyText = await resultCard.locator("span[class*='verseKey']").innerText();
    const verseKey = verseKeyText.trim(); // e.g. "1:1"
    
    const href = await resultCard.getAttribute("href");
    if (href) {
      await page.goto(href);
    } else {
      await resultCard.click();
    }

    // 5. Verify navigation to the reader page at the selected verse
    const [chapterId] = verseKey.split(":");
    await expect(page).toHaveURL(new RegExp(`\\/en\\/${chapterId}`));
    
    // The reader should highlight the verse or row
    const verseRow = page.locator(`div[data-verse-key='${verseKey}']`).first();
    await expect(verseRow).toBeVisible();
  });
});
