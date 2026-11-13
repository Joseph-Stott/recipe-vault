import { beforeEach, describe, expect, it, vi } from "vitest";
import { BrowserStorageError, resetDamagedBrowserEntry } from "@/lib/browserStorage";
import { getSavedRecipes } from "@/lib/recipeStorage";
import { getFavoriteRecipeSlugs } from "@/lib/favorites";
import { getGroceryList, getGroceryRecipeSlugs } from "@/lib/groceryList";

const storage = new Map<string, string>();
const getItem = vi.fn((key: string) => storage.get(key) ?? null);
const removeItem = vi.fn((key: string) => { storage.delete(key); });
beforeEach(() => {
    storage.clear();
    getItem.mockReset().mockImplementation((key) => storage.get(key) ?? null);
    removeItem.mockReset().mockImplementation((key) => { storage.delete(key); });
    vi.stubGlobal("localStorage", { getItem, removeItem });
});

const readers = [
    ["saved-recipes", getSavedRecipes],
    ["favorite-list", getFavoriteRecipeSlugs],
    ["grocery-list", getGroceryList],
    ["grocery-recipe-slugs", getGroceryRecipeSlugs],
] as const;

describe.each(readers)("%s recovery", (key, read) => {
    it.each(["{broken", "null", "{}", "[null]", ""])("preserves invalid data and never caches a failed parse: %s", (raw) => {
        storage.set(key, "[]");
        expect(read()).toEqual([]);
        storage.set(key, raw);
        for (let attempt = 0; attempt < 2; attempt++) {
            try {
                read();
                expect.fail("Expected a recoverable storage error");
            } catch (error) {
                expect(error).toBeInstanceOf(BrowserStorageError);
                expect(error).toMatchObject({ key, raw, reason: "invalid" });
            }
        }
        expect(storage.get(key)).toBe(raw);
        storage.set(key, "[]");
        const recovered = read();
        expect(recovered).toEqual([]);
        expect(read()).toBe(recovered);
    });

    it("distinguishes blocked storage from missing data, even after caching", () => {
        expect(read()).toEqual([]);
        getItem.mockImplementation(() => { throw new Error("Blocked"); });
        expect(read).toThrow(BrowserStorageError);
        try { read(); } catch (error) {
            expect(error).toMatchObject({ key, reason: "unavailable", raw: null });
        }
    });
});

it("retains legacy recipe amounts, omitted ingredients, and extra fields without rewriting storage", () => {
    const recipes = [
        { slug: "rice", title: "Rice", timeCategory: "fast", structuredIngredients: [{ amount: "0.5", unit: "cup", name: "rice" }], note: "Keep" },
        { slug: "soup", title: "Soup", timeCategory: "slow" },
    ];
    const raw = JSON.stringify(recipes);
    storage.set("saved-recipes", raw);
    expect(getSavedRecipes()).toEqual(recipes);
    expect(storage.get("saved-recipes")).toBe(raw);
});

it("rejects valid JSON with fields that would break recipe or grocery rendering", () => {
    storage.set("saved-recipes", JSON.stringify([{ slug: "rice", title: 42, timeCategory: "fast" }]));
    expect(getSavedRecipes).toThrow(BrowserStorageError);
    storage.set("grocery-list", JSON.stringify([{ amount: 1, unit: {}, name: "rice" }]));
    expect(getGroceryList).toThrow(BrowserStorageError);
});

it("resets only the confirmed entry, preserving groceries, favorites, and recovery archives", () => {
    storage.set("saved-recipes", "{broken");
    storage.set("grocery-list", "[]");
    storage.set("favorite-list", '["rice"]');
    storage.set("recipe-vault:legacy-recovery:v1", "original archive");
    resetDamagedBrowserEntry(new BrowserStorageError("saved-recipes", "invalid", "{broken"));
    expect(removeItem).toHaveBeenCalledExactlyOnceWith("saved-recipes");
    expect([...storage.keys()]).toEqual(["grocery-list", "favorite-list", "recipe-vault:legacy-recovery:v1"]);
});

it("refuses to reset repaired data or unavailable storage", () => {
    storage.set("saved-recipes", "[]");
    expect(() => resetDamagedBrowserEntry(new BrowserStorageError("saved-recipes", "invalid", "{broken"))).toThrow("data changed");
    expect(() => resetDamagedBrowserEntry(new BrowserStorageError("saved-recipes", "unavailable"))).toThrow("cannot be reset");
    expect(removeItem).not.toHaveBeenCalled();
});

it("reports reset write failures without claiming success", () => {
    storage.set("saved-recipes", "{broken");
    removeItem.mockImplementation(() => { throw new Error("Blocked"); });
    expect(() => resetDamagedBrowserEntry(new BrowserStorageError("saved-recipes", "invalid", "{broken"))).toThrow("was not reset");
    expect(storage.get("saved-recipes")).toBe("{broken");
});
