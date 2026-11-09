import { expect, test } from "@playwright/test";
import { parseCreateRecipeRequest } from "../lib/recipeRequest";

const storedRecipe = {
    slug: "rice", title: "Rice", timeCategory: "fast", cookBook: null,
    pageNumber: null, cookInstructions: ["Cook rice"],
    ingredients: [{ amount: "1", unit: "cup", name: "rice" }],
};

test.beforeEach(async ({ page }) => {
    await page.route("**/api/favorites", (route) => route.fulfill({ json: { favoriteRecipeSlugs: [] } }));
    page.on("dialog", (dialog) => dialog.accept());
});

test("typed amounts can be submitted when creating and editing", async ({ page }) => {
    let created: unknown;
    let updated: unknown;
    await page.route("**/api/recipes", async (route) => {
        if (route.request().method() === "GET") {
            await route.fulfill({ json: created ? [storedRecipe] : [] });
            return;
        }
        created = route.request().postDataJSON();
        const result = parseCreateRecipeRequest(created);
        await route.fulfill({ status: result.error ? 400 : 201, json: result.error ? result : storedRecipe });
    });
    await page.route("**/api/recipes/rice", async (route) => {
        updated = route.request().postDataJSON();
        await route.fulfill({ json: storedRecipe });
    });
    await page.goto("/add-recipe");
    await page.getByPlaceholder("Add Title").fill("Rice");
    await page.getByPlaceholder("Amt", { exact: true }).fill("0.5");
    await page.getByPlaceholder("Unit", { exact: true }).fill("cup");
    await page.getByPlaceholder("Ingredient", { exact: true }).fill("rice");
    await page.getByRole("button", { name: "Add Recipe", exact: true }).click();
    await expect(page).toHaveURL("/");
    expect(created).toMatchObject({ structuredIngredients: [{ amount: 0.5, unit: "cup", name: "rice" }] });

    await page.goto("/edit-recipe/rice");
    await page.getByPlaceholder("Amt", { exact: true }).fill("2.25");
    await page.getByRole("button", { name: "Update Recipe", exact: true }).click();
    await expect(page).toHaveURL("/");
    expect(updated).toMatchObject({ structuredIngredients: [{ amount: 2.25, unit: "cup", name: "rice" }] });
});

test("invalid quantities are explained before submission", async ({ page }) => {
    let writes = 0;
    await page.route("**/api/recipes", (route) => {
        if (route.request().method() !== "GET") writes++;
        return route.fulfill({ json: [] });
    });
    await page.goto("/add-recipe");
    await page.getByPlaceholder("Add Title").fill("Rice");
    await page.getByPlaceholder("Amt", { exact: true }).fill("1/2");
    await page.getByPlaceholder("Unit", { exact: true }).fill("cup");
    await page.getByPlaceholder("Ingredient", { exact: true }).fill("rice");
    await page.getByRole("button", { name: "Add Recipe", exact: true }).click();
    await expect(page.getByText("Ingredient amounts must be non-negative numbers", { exact: false })).toBeVisible();
    expect(writes).toBe(0);
    await page.screenshot({ path: test.info().outputPath("recipe-form.png"), fullPage: true });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test("a missing legacy favorite does not cause an import request loop", async ({ page }) => {
    let imports = 0;
    await page.addInitScript(() => localStorage.setItem("favorite-list", JSON.stringify(["missing-recipe"])));
    await page.route("**/api/recipes", (route) => route.fulfill({ json: [] }));
    await page.route("**/api/favorites/import", (route) => {
        imports++;
        return route.fulfill({ json: { favoriteRecipeSlugs: [] } });
    });
    await page.goto("/");
    await expect.poll(() => imports).toBe(1);
    // Observe after the successful import response has triggered React effects.
    await page.waitForTimeout(1000);
    expect(imports).toBe(1);
});
