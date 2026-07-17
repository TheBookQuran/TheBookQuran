import { Page, Locator } from "@playwright/test";
import { BasePage } from "./BasePage";

export class JournalPage extends BasePage {
  readonly tabNotes: Locator;
  readonly tabBookmarks: Locator;
  readonly tabHistory: Locator;
  
  // Note form inputs
  readonly newNoteBtn: Locator;
  readonly noteTitleInput: Locator;
  readonly noteRefInput: Locator;
  readonly noteContentTextarea: Locator;
  readonly saveNoteBtn: Locator;

  constructor(page: Page) {
    super(page);
    this.tabNotes = page.locator("button:has-text('Reflections'), button:has-text('التدوينات')");
    this.tabBookmarks = page.locator("button:has-text('Bookmarks'), button:has-text('المحفوظات')");
    this.tabHistory = page.locator("button:has-text('History'), button:has-text('سجل القراءة')");
    
    // Note form using exact HTML element IDs
    this.newNoteBtn = page.locator("button:has-text('Add Reflection'), button:has-text('إضافة تدوينة جديدة')").first();
    this.noteTitleInput = page.locator("#title");
    this.noteRefInput = page.locator("#reference");
    this.noteContentTextarea = page.locator("#content");
    this.saveNoteBtn = page.locator("form button[type='submit']").first();
  }

  async selectTab(tab: "notes" | "bookmarks" | "history") {
    switch (tab) {
      case "notes": await this.tabNotes.first().click(); break;
      case "bookmarks": await this.tabBookmarks.first().click(); break;
      case "history": await this.tabHistory.first().click(); break;
    }
  }

  async createNote(title: string, reference: string, content: string) {
    await this.selectTab("notes");
    if (await this.newNoteBtn.isVisible()) {
      await this.newNoteBtn.click();
    }
    await this.noteTitleInput.fill(title);
    await this.noteRefInput.fill(reference);
    await this.noteContentTextarea.fill(content);
    await this.saveNoteBtn.click();
  }

  async getNoteCard(title: string): Promise<Locator> {
    return this.page.locator(`div[class*='noteCard']:has-text("${title}")`).first();
  }

  async getBookmarkItem(label: string): Promise<Locator> {
    return this.page.locator(`div[class*='bookmarkRow']:has-text("${label}"), div[class*='bookmarkItem']:has-text("${label}")`);
  }
}
