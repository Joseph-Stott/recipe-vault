import { readFile } from "node:fs/promises";
import { expect, test, type Page } from "@playwright/test";

async function seed(page: Page, key: string, raw: string) {
    await page.addInitScript(({ key, raw }) => {
        if (sessionStorage.getItem("storage-fixture")) return;
        localStorage.setItem("favorite-list", "[]");
        localStorage.setItem("grocery-list", "[]");
        localStorage.setItem("grocery-recipe-slugs", "[]");
        localStorage.setItem("saved-recipes", "[]");
        localStorage.setItem("unrelated-preference", "keep");
        localStorage.setItem(key, raw);
        sessionStorage.setItem("storage-fixture", "true");
    }, { key, raw });
}

test.beforeEach(async ({ page }) => {
    await page.route("**/api/**", (route) => route.abort());
    await page.route("**/api/recipes", (route) => route.fulfill({ json: [] }));
    await page.route("**/api/favorites", (route) => route.fulfill({ json: { favoriteRecipeSlugs: [] } }));
});

test("damaged recipes can be downloaded intact and reset only after confirmation", async ({ page }) => {
    const raw = '{"title":"Keep this original text"';
    await seed(page, "saved-recipes", raw);
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Browser data needs attention" })).toBeVisible();
    await expect(page.getByText(/Older browser recipes could not be read/)).toBeVisible();
    await page.screenshot({ path: test.info().outputPath("storage-recovery.png"), fullPage: true });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Download original data" }).click();
    const download = await downloadPromise;
    expect(await readFile((await download.path())!, "utf8")).toBe(raw);

    page.once("dialog", (dialog) => dialog.dismiss());
    await page.getByRole("button", { name: "Reset damaged entry" }).click();
    expect(await page.evaluate(() => localStorage.getItem("saved-recipes"))).toBe(raw);
    page.once("dialog", (dialog) => dialog.accept());
    await page.getByRole("button", { name: "Reset damaged entry" }).click();
    await expect(page.getByRole("heading", { name: "Recipe Vault", exact: true })).toBeVisible();
    expect(await page.evaluate(() => ({
        recipes: localStorage.getItem("saved-recipes"),
        favorites: localStorage.getItem("favorite-list"),
        groceries: localStorage.getItem("grocery-list"),
        selected: localStorage.getItem("grocery-recipe-slugs"),
        unrelated: localStorage.getItem("unrelated-preference"),
    }))).toEqual({ recipes: null, favorites: "[]", groceries: "[]", selected: "[]", unrelated: "keep" });
});

for (const [key, raw, route] of [
    ["favorite-list", "[7]", "/"],
    ["grocery-list", '{"not":"an array"}', "/grocery-list"],
    ["grocery-recipe-slugs", "[null]", "/"],
    ["saved-recipes", "{broken", "/add-recipe"],
]) {
    test(`${key} on ${route} stays recoverable across retries`, async ({ page }) => {
        await seed(page, key, raw);
        await page.goto(route);
        await expect(page.getByRole("heading", { name: "Browser data needs attention" })).toBeVisible();
        const previousRetry = await page.getByRole("button", { name: "Retry", exact: true }).elementHandle();
        await page.getByRole("button", { name: "Retry", exact: true }).click();
        await expect.poll(() => previousRetry!.evaluate((element) => element.isConnected)).toBe(false);
        await expect(page.getByRole("heading", { name: "Browser data needs attention" })).toBeVisible();
        expect(await page.evaluate((key) => localStorage.getItem(key), key)).toBe(raw);
        await page.evaluate((key) => localStorage.setItem(key, "[]"), key);
        await page.getByRole("button", { name: "Retry", exact: true }).click();
        await expect(page.getByRole("heading", { name: "Browser data needs attention" })).toHaveCount(0);
        await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    });
}

test("blocked storage offers retry without pretending the data is empty or allowing reset", async ({ page }) => {
    await page.addInitScript(() => {
        const storage = window.localStorage;
        Object.defineProperty(window, "localStorage", { configurable: true, get() {
            if (document.documentElement.dataset.storageAllowed !== "yes") throw new DOMException("Blocked", "SecurityError");
            return storage;
        } });
    });
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Browser data needs attention" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Reset damaged entry" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Download original data" })).toHaveCount(0);
    await page.evaluate(() => { document.documentElement.dataset.storageAllowed = "yes"; });
    await page.getByRole("button", { name: "Retry", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Recipe Vault", exact: true })).toBeVisible();
});

test("reset refuses to remove data repaired while the recovery screen was open", async ({ page }) => {
    await seed(page, "saved-recipes", "{broken");
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Browser data needs attention" })).toBeVisible();
    await page.evaluate(() => localStorage.setItem("saved-recipes", "[]"));
    page.once("dialog", (dialog) => dialog.accept());
    await page.getByRole("button", { name: "Reset damaged entry" }).click();
    await expect(page.getByRole("main").getByRole("alert")).toContainText("data changed");
    expect(await page.evaluate(() => localStorage.getItem("saved-recipes"))).toBe("[]");
    await page.getByRole("button", { name: "Retry", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Recipe Vault", exact: true })).toBeVisible();
});

test("a failed reset leaves the original entry available", async ({ page }) => {
    await seed(page, "saved-recipes", "{broken");
    await page.addInitScript(() => {
        const remove = Storage.prototype.removeItem;
        Storage.prototype.removeItem = function (key) {
            if (key === "saved-recipes") throw new DOMException("Blocked", "SecurityError");
            remove.call(this, key);
        };
    });
    await page.goto("/");
    page.once("dialog", (dialog) => dialog.accept());
    await page.getByRole("button", { name: "Reset damaged entry" }).click();
    await expect(page.getByRole("main").getByRole("alert")).toContainText("was not reset");
    expect(await page.evaluate(() => localStorage.getItem("saved-recipes"))).toBe("{broken");
});
