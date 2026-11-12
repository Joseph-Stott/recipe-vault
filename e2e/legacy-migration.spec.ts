import { readFile } from "node:fs/promises";
import { expect, test, type Page } from "@playwright/test";

const archiveKey = "recipe-vault:legacy-recovery:v1";
const localRice = {
    slug: "rice", title: "Original browser rice", timeCategory: "fast",
    structuredIngredients: [{ amount: 1, unit: "cup", name: "rice" }],
    cookInstructions: ["Keep this original instruction"],
};
const localSoup = { ...localRice, slug: "soup", title: "Unimported soup" };
const databaseRice = {
    slug: "rice", title: "Database rice", timeCategory: "fast",
    ingredients: [{ amount: "2", unit: "cups", name: "rice" }],
    cookBook: null, pageNumber: null, cookInstructions: ["Current instructions"],
};

async function seedLegacy(page: Page, recipes = [localRice], favorites: string[] = []) {
    await page.addInitScript(({ recipes, favorites }) => {
        if (!sessionStorage.getItem("migration-fixture-seeded")) {
            localStorage.setItem("saved-recipes", JSON.stringify(recipes));
            localStorage.setItem("favorite-list", JSON.stringify(favorites));
            sessionStorage.setItem("migration-fixture-seeded", "true");
        }
    }, { recipes, favorites });
}

async function savedRecipes(page: Page) {
    return page.evaluate(() => JSON.parse(localStorage.getItem("saved-recipes") ?? "[]"));
}

test.beforeEach(async ({ page }) => {
    // Every request stays isolated from the developer's database.
    await page.route("**/api/**", (route) => route.abort());
    await page.route("**/api/favorites", (route) => route.fulfill({ json: { favoriteRecipeSlugs: [] } }));
    page.on("dialog", (dialog) => dialog.accept());
});

test("an old imported recipe stays deleted after reload and its original copy can be downloaded", async ({ page }) => {
    await seedLegacy(page, [localRice], ["rice"]);
    let recipes = [databaseRice];
    await page.route("**/api/recipes", (route) => route.fulfill({ json: recipes }));
    await page.route("**/api/recipes/rice", (route) => {
        expect(route.request().method()).toBe("DELETE");
        recipes = [];
        return route.fulfill({ json: { success: true } });
    });

    // Direct navigation must perform cleanup too; the homepage may never have loaded.
    await page.goto("/edit-recipe/rice");
    await expect(page.getByPlaceholder("Add Title")).toHaveValue("Database rice");
    await expect.poll(() => savedRecipes(page)).toEqual([]);
    await page.getByRole("button", { name: "Delete recipe", exact: true }).click();
    await expect(page).toHaveURL("/");
    await page.reload();
    await expect(page.getByText("0 recipes available", { exact: true })).toBeVisible();
    await page.screenshot({ path: test.info().outputPath("legacy-recovery.png"), fullPage: true });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Download Legacy Recovery" }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe("recipe-vault-legacy-recovery.json");
    const recovery = JSON.parse(await readFile((await download.path())!, "utf8"));
    expect(recovery.recipes).toEqual([localRice]);
    expect(recovery.favoriteRecipeSlugs).toEqual(["rice"]);
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem("favorite-list")!))).toEqual([]);
});

test("an import retires only returned recipes and preserves unconfirmed local data", async ({ page }) => {
    await seedLegacy(page, [localRice, localSoup]);
    await page.route("**/api/recipes", (route) => route.fulfill({ json: [] }));
    await page.route("**/api/recipes/import", (route) => route.fulfill({
        json: { importedCount: 1, skippedCount: 0, recipes: [databaseRice] },
    }));
    await page.goto("/");
    await page.getByRole("button", { name: "Import Local Recipes" }).click();
    await expect(page.getByText("Imported 1 recipe.", { exact: true })).toBeVisible();
    await expect.poll(() => savedRecipes(page)).toEqual([localSoup]);
    expect(await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!).recipes, archiveKey)).toEqual([localRice]);
});

test("failed deletion keeps a pending local favorite", async ({ page }) => {
    await seedLegacy(page, [localRice], ["rice"]);
    await page.route("**/api/recipes", (route) => route.fulfill({ json: [databaseRice] }));
    await page.route("**/api/recipes/rice", (route) => route.fulfill({ status: 503, json: { error: "Unavailable" } }));
    await page.goto("/edit-recipe/rice");
    await page.getByRole("button", { name: "Delete recipe", exact: true }).click();
    await expect(page.getByText(/Deletion could not be confirmed/)).toBeVisible();
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem("favorite-list")!))).toEqual(["rice"]);
    await expect(page.getByPlaceholder("Add Title")).toHaveValue("Database rice");
});

test("skipped imports are retired only after a successful database read", async ({ page }) => {
    await seedLegacy(page);
    let imported = false;
    let allowRead = false;
    await page.route("**/api/recipes", (route) => route.fulfill(
        imported && !allowRead ? { status: 503, json: { error: "Unavailable" } } : { json: imported ? [databaseRice] : [] }
    ));
    await page.route("**/api/recipes/import", (route) => {
        imported = true;
        return route.fulfill({ json: { importedCount: 0, skippedCount: 1, recipes: [] } });
    });
    await page.goto("/");
    await page.getByRole("button", { name: "Import Local Recipes" }).click();
    await expect(page.getByText(/Reload to confirm existing recipes/)).toBeVisible();
    expect(await savedRecipes(page)).toEqual([localRice]);
    expect(await page.evaluate((key) => localStorage.getItem(key), archiveKey)).toBeNull();
    allowRead = true;
    await page.reload();
    await expect.poll(() => savedRecipes(page)).toEqual([]);
    await expect(page.getByRole("link", { name: /Database rice/ })).toBeVisible();
});

test("failed loads and imports do not retire local recipes", async ({ page }) => {
    await seedLegacy(page);
    let failLoad = true;
    await page.route("**/api/recipes", (route) => route.fulfill(
        failLoad ? { status: 503, json: { error: "Unavailable" } } : { json: [] }
    ));
    await page.route("**/api/recipes/import", (route) => route.fulfill({ status: 503, json: { error: "Unavailable" } }));
    await page.goto("/");
    await expect(page.getByText("Recipes unavailable", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Import Local Recipes" })).toBeDisabled();
    expect(await savedRecipes(page)).toEqual([localRice]);
    failLoad = false;
    await page.reload();
    await page.getByRole("button", { name: "Import Local Recipes" }).click();
    await expect(page.getByText("Failed to import local recipes. Please try again.", { exact: true })).toBeVisible();
    expect(await savedRecipes(page)).toEqual([localRice]);
    expect(await page.evaluate((key) => localStorage.getItem(key), archiveKey)).toBeNull();
});

test("a recovery write failure preserves the local recipe and blocks deletion until cleanup succeeds", async ({ page }) => {
    await seedLegacy(page);
    await page.addInitScript((key) => {
        const setItem = Storage.prototype.setItem;
        Storage.prototype.setItem = function (name, value) {
            if (name === key && !sessionStorage.getItem("allow-recovery")) throw new DOMException("Full", "QuotaExceededError");
            return setItem.call(this, name, value);
        };
    }, archiveKey);
    await page.route("**/api/recipes", (route) => route.fulfill({ json: [databaseRice] }));
    await page.goto("/edit-recipe/rice");
    await expect(page.getByText("Browser cleanup needs attention", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Delete recipe", exact: true })).toHaveCount(0);
    expect(await savedRecipes(page)).toEqual([localRice]);
    await page.evaluate(() => sessionStorage.setItem("allow-recovery", "true"));
    await page.reload();
    await expect(page.getByRole("button", { name: "Delete recipe", exact: true })).toBeEnabled();
    expect(await savedRecipes(page)).toEqual([]);
});

test("confirmed local favorites cannot restore a later database unfavorite", async ({ page }) => {
    await seedLegacy(page, [], ["rice"]);
    let favorites = ["rice"];
    let imports = 0;
    await page.route("**/api/recipes", (route) => route.fulfill({ json: [databaseRice] }));
    await page.route("**/api/favorites", (route) => route.fulfill({ json: { favoriteRecipeSlugs: favorites } }));
    await page.route("**/api/favorites/import", (route) => {
        imports++;
        return route.fulfill({ json: { favoriteRecipeSlugs: ["rice"] } });
    });
    await page.goto("/recipes/rice");
    await expect(page.getByTitle("Remove from favorites")).toBeEnabled();
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem("favorite-list")!))).toEqual([]);
    favorites = []; // Simulate an unfavorite from another device.
    await page.reload();
    await expect(page.getByTitle("Add to favorites")).toBeEnabled();
    expect(imports).toBe(0);
    expect(await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!).favoriteRecipeSlugs, archiveKey)).toEqual(["rice"]);
});

test("favorite import retires only confirmed slugs and unfavoriting survives reload", async ({ page }) => {
    await seedLegacy(page, [], ["rice", "missing-recipe"]);
    let favorites: string[] = [];
    const importedBatches: string[][] = [];
    await page.route("**/api/recipes", (route) => route.fulfill({ json: [databaseRice] }));
    await page.route("**/api/favorites", (route) => {
        if (route.request().method() === "POST") favorites = [];
        return route.fulfill({ json: { favoriteRecipeSlugs: favorites } });
    });
    await page.route("**/api/favorites/import", (route) => {
        const slugs: string[] = route.request().postDataJSON().recipeSlugs;
        importedBatches.push(slugs);
        if (slugs.includes("rice")) favorites = ["rice"];
        return route.fulfill({ json: { favoriteRecipeSlugs: favorites } });
    });
    await page.goto("/recipes/rice");
    await expect(page.getByTitle("Remove from favorites")).toBeEnabled();
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem("favorite-list")!))).toEqual(["missing-recipe"]);
    await page.getByTitle("Remove from favorites").click();
    await expect(page.getByTitle("Add to favorites")).toBeEnabled();
    await page.reload();
    await expect(page.getByTitle("Add to favorites")).toBeEnabled();
    expect(importedBatches).toEqual([["rice", "missing-recipe"], ["missing-recipe"]]);
});

test("failed favorite loads and imports retain pending slugs and can recover on reload", async ({ page }) => {
    await seedLegacy(page, [], ["rice"]);
    let failLoad = true;
    let failImport = true;
    let imports = 0;
    await page.route("**/api/recipes", (route) => route.fulfill({ json: [databaseRice] }));
    await page.route("**/api/favorites", (route) => route.fulfill(
        failLoad ? { status: 503, json: { error: "Unavailable" } } : { json: { favoriteRecipeSlugs: [] } }
    ));
    await page.route("**/api/favorites/import", (route) => {
        imports++;
        return route.fulfill(failImport ? { status: 503, json: { error: "Unavailable" } } : { json: { favoriteRecipeSlugs: ["rice"] } });
    });
    await page.goto("/recipes/rice");
    await expect(page.getByText("Favorites could not be loaded from the database.", { exact: true })).toBeVisible();
    expect(imports).toBe(0);
    failLoad = false;
    await page.reload();
    await expect(page.getByText(/Local favorites could not be copied/)).toBeVisible();
    await expect(page.getByTitle("Remove from favorites")).toBeDisabled();
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem("favorite-list")!))).toEqual(["rice"]);
    expect(await page.evaluate((key) => localStorage.getItem(key), archiveKey)).toBeNull();
    failImport = false;
    await page.reload();
    await expect(page.getByTitle("Remove from favorites")).toBeEnabled();
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem("favorite-list")!))).toEqual([]);
});

test("favorite toggles wait for the initial migration to finish", async ({ page }) => {
    await seedLegacy(page, [], ["rice"]);
    let releaseImport!: () => void;
    const gate = new Promise<void>((resolve) => { releaseImport = resolve; });
    let imports = 0;
    let writes = 0;
    await page.route("**/api/recipes", (route) => route.fulfill({ json: [databaseRice] }));
    await page.route("**/api/favorites", (route) => {
        if (route.request().method() === "POST") writes++;
        return route.fulfill({ json: { favoriteRecipeSlugs: [] } });
    });
    await page.route("**/api/favorites/import", async (route) => {
        imports++;
        await gate;
        await route.fulfill({ json: { favoriteRecipeSlugs: ["rice"] } });
    });
    await page.goto("/recipes/rice");
    await expect.poll(() => imports).toBe(1);
    await expect(page.getByTitle("Remove from favorites")).toBeDisabled();
    expect(writes).toBe(0);
    releaseImport();
    await expect(page.getByTitle("Remove from favorites")).toBeEnabled();
    await page.getByTitle("Remove from favorites").click();
    await expect(page.getByTitle("Add to favorites")).toBeEnabled();
    expect(writes).toBe(1);
});

test("favorite archive failures retain local copies and block toggles", async ({ page }) => {
    await seedLegacy(page, [], ["rice"]);
    await page.addInitScript((key) => {
        const setItem = Storage.prototype.setItem;
        Storage.prototype.setItem = function (name, value) {
            if (name === key) throw new DOMException("Full", "QuotaExceededError");
            return setItem.call(this, name, value);
        };
    }, archiveKey);
    await page.route("**/api/recipes", (route) => route.fulfill({ json: [databaseRice] }));
    await page.route("**/api/favorites", (route) => route.fulfill({ json: { favoriteRecipeSlugs: ["rice"] } }));
    await page.goto("/recipes/rice");
    await expect(page.getByText(/Favorites are in the database, but browser cleanup could not finish/)).toBeVisible();
    await expect(page.getByTitle("Remove from favorites")).toBeDisabled();
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem("favorite-list")!))).toEqual(["rice"]);
});

test("a favorite for an unimported recipe can be removed without a database toggle", async ({ page }) => {
    await seedLegacy(page, [localRice], ["rice"]);
    let writes = 0;
    await page.route("**/api/recipes", (route) => route.fulfill({ json: [] }));
    await page.route("**/api/favorites", (route) => {
        if (route.request().method() === "POST") writes++;
        return route.fulfill({ json: { favoriteRecipeSlugs: [] } });
    });
    await page.route("**/api/favorites/import", (route) => route.fulfill({ json: { favoriteRecipeSlugs: [] } }));
    await page.goto("/recipes/rice");
    await expect(page.getByTitle("Remove from favorites")).toBeEnabled();
    await page.getByTitle("Remove from favorites").click();
    await expect(page.getByTitle("Add to favorites")).toBeEnabled();
    expect(writes).toBe(0);
    expect(await savedRecipes(page)).toEqual([localRice]);
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem("favorite-list")!))).toEqual([]);
});

test("retirement in another tab removes stale local recipes and favorites from an open page", async ({ page, context }) => {
    await seedLegacy(page, [localRice], ["rice"]);
    await page.route("**/api/recipes", (route) => route.fulfill({ status: 503, json: { error: "Unavailable" } }));
    await page.route("**/api/favorites", (route) => route.fulfill({ status: 503, json: { error: "Unavailable" } }));
    await page.goto("/");
    await expect(page.getByText("1 recipe available", { exact: true })).toBeVisible();
    await expect(page.getByText("Favorite Recipes (1)", { exact: false })).toBeVisible();
    const other = await context.newPage();
    await other.route("**/api/**", (route) => route.abort());
    await other.route("**/api/recipes", (route) => route.fulfill({ json: [databaseRice] }));
    await other.route("**/api/favorites", (route) => route.fulfill({ json: { favoriteRecipeSlugs: ["rice"] } }));
    await other.goto("/");
    await expect(other.getByRole("button", { name: "Download Legacy Recovery" })).toBeVisible();
    await expect(page.getByText("0 recipes available", { exact: true })).toBeVisible();
    await expect(page.getByText("Favorite Recipes (0)", { exact: false })).toBeVisible();
    await other.close();
});
