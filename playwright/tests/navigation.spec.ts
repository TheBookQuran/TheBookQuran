import { test, expect } from "@playwright/test";
import { HomePage } from "../pages/HomePage";

test.describe("App Navigation and Setup Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);
  });

  test("should render the homepage surah cards", async ({ page }) => {
    const homePage = new HomePage(page);
    const surah1 = await homePage.getSurahCard(1);
    await expect(surah1).toBeVisible();
    await expect(surah1).toContainText("Al-Fatihah");
  });

  test("should toggle language from english to arabic", async ({ page }) => {
    const homePage = new HomePage(page);
    await expect(page).toHaveURL(/\/en/);

    await homePage.toggleLanguage();
    await expect(page).toHaveURL(/\/ar/);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);
    
    // Check dir on <html> element
    const htmlDir = await page.locator("html").getAttribute("dir");
    expect(htmlDir).toBe("rtl");
  });

  test("should change theme from settings popover", async ({ page }) => {
    const homePage = new HomePage(page);
    const html = page.locator("html");

    // Default theme should be resolved to light/system
    await homePage.changeTheme("dark");
    await expect(html).toHaveAttribute("data-theme", "dark");

    await homePage.changeTheme("light");
    await expect(html).toHaveAttribute("data-theme", "light");
  });

  test("should navigate to Surah Reader page on card click", async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.clickSurahCard(1);

    await expect(page).toHaveURL(/\/en\/1/);
    // Heading on Reader page is h2.title
    const heading = page.locator("h2[class*='title']");
    await expect(heading).toContainText("Al-Fatihah");
  });
});
