import { beforeEach, describe, expect, it, vi } from "vitest";
import { getSavedRecipes, retireSavedRecipes, subscribeToSavedRecipes } from "@/lib/recipeStorage";
import { getFavoriteRecipeSlugs, retireFavoriteRecipes, subscribeToFavoriteRecipeSlugs } from "@/lib/favorites";
import { LEGACY_RECOVERY_KEY } from "@/lib/legacyRecovery";

const storage = new Map<string, string>();
const setItem = vi.fn((key: string, value: string) => { storage.set(key, value); });
vi.stubGlobal("localStorage", { getItem: (key: string) => storage.get(key) ?? null, setItem });
const rice = { slug: "rice", title: "Original rice", timeCategory: "fast", structuredIngredients: [] };
const soup = { ...rice, slug: "soup", title: "Unimported soup" };

beforeEach(() => {
    storage.clear();
    setItem.mockReset().mockImplementation((key, value) => { storage.set(key, value); });
    storage.set("saved-recipes", JSON.stringify([rice, soup]));
    storage.set("favorite-list", JSON.stringify(["rice", "missing-recipe"]));
});

describe("legacy retirement", () => {
    it("archives confirmed recipes before removing them and leaves unimported recipes active", () => {
        const listener = vi.fn();
        const unsubscribe = subscribeToSavedRecipes(listener);
        retireSavedRecipes(["rice"]);
        expect(getSavedRecipes()).toEqual([soup]);
        expect(JSON.parse(storage.get(LEGACY_RECOVERY_KEY)!).recipes).toEqual([rice]);
        expect(setItem.mock.calls.map(([key]) => key)).toEqual([LEGACY_RECOVERY_KEY, "saved-recipes"]);
        expect(listener).toHaveBeenCalledTimes(1);
        retireSavedRecipes(["rice"]);
        expect(listener).toHaveBeenCalledTimes(1);
        unsubscribe();
    });

    it("retires confirmed favorites but retains missing favorites for a later import", () => {
        const listener = vi.fn();
        const unsubscribe = subscribeToFavoriteRecipeSlugs(listener);
        retireFavoriteRecipes(["rice"]);
        expect(getFavoriteRecipeSlugs()).toEqual(["missing-recipe"]);
        expect(JSON.parse(storage.get(LEGACY_RECOVERY_KEY)!).favoriteRecipeSlugs).toEqual(["rice"]);
        expect(listener).toHaveBeenCalledTimes(1);
        unsubscribe();
    });

    it("matches trimmed favorite slugs while preserving the original copy", () => {
        storage.set("favorite-list", JSON.stringify([" rice "]));
        retireFavoriteRecipes(["rice"]);
        expect(getFavoriteRecipeSlugs()).toEqual([]);
        expect(JSON.parse(storage.get(LEGACY_RECOVERY_KEY)!).favoriteRecipeSlugs).toEqual([" rice "]);
    });

    it("does nothing without database confirmation", () => {
        retireSavedRecipes([]);
        retireFavoriteRecipes([]);
        expect(getSavedRecipes()).toEqual([rice, soup]);
        expect(getFavoriteRecipeSlugs()).toEqual(["rice", "missing-recipe"]);
        expect(setItem).not.toHaveBeenCalled();
    });

    it.each(["quota", "invalid archive"])("keeps active data when recovery cannot be saved: %s", (failure) => {
        if (failure === "quota") {
            setItem.mockImplementation(() => { throw new Error("Quota exceeded"); });
        } else {
            storage.set(LEGACY_RECOVERY_KEY, "{broken");
        }
        expect(() => retireSavedRecipes(["rice"])).toThrow();
        expect(() => retireFavoriteRecipes(["rice"])).toThrow();
        expect(getSavedRecipes()).toEqual([rice, soup]);
        expect(getFavoriteRecipeSlugs()).toEqual(["rice", "missing-recipe"]);
    });

    it("preserves a recovery copy if removing active data fails, then retries without duplicates", () => {
        setItem.mockImplementation((key, value) => {
            if (key === "saved-recipes") throw new Error("Write failed");
            storage.set(key, value);
        });
        expect(() => retireSavedRecipes(["rice"])).toThrow();
        expect(getSavedRecipes()).toEqual([rice, soup]);
        expect(JSON.parse(storage.get(LEGACY_RECOVERY_KEY)!).recipes).toEqual([rice]);
        setItem.mockImplementation((key, value) => { storage.set(key, value); });
        retireSavedRecipes(["rice"]);
        expect(getSavedRecipes()).toEqual([soup]);
        expect(JSON.parse(storage.get(LEGACY_RECOVERY_KEY)!).recipes).toEqual([rice]);
    });

    it("updates other tabs and removes storage listeners on unsubscribe", () => {
        const browser = new EventTarget();
        vi.stubGlobal("window", browser);
        const recipesChanged = vi.fn();
        const favoritesChanged = vi.fn();
        const unsubscribeRecipes = subscribeToSavedRecipes(recipesChanged);
        const unsubscribeFavorites = subscribeToFavoriteRecipeSlugs(favoritesChanged);
        const event = Object.assign(new Event("storage"), { storageArea: localStorage, key: "saved-recipes" });
        browser.dispatchEvent(event);
        expect(recipesChanged).toHaveBeenCalledTimes(1);
        expect(favoritesChanged).not.toHaveBeenCalled();
        unsubscribeRecipes();
        unsubscribeFavorites();
        browser.dispatchEvent(event);
        expect(recipesChanged).toHaveBeenCalledTimes(1);
        vi.stubGlobal("window", undefined);
    });
});
