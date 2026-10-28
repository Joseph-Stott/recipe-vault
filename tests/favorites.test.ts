import { beforeEach, describe, expect, it, vi } from "vitest";
import {
    getFavoriteRecipeSlugs,
    removeFavoriteRecipe,
    subscribeToFavoriteRecipeSlugs,
    toggleFavoriteRecipe,
} from "@/lib/favorites";

const storage = new Map<string, string>();

vi.stubGlobal("localStorage", {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => {
        storage.set(key, value);
    },
    removeItem: (key: string) => {
        storage.delete(key);
    },
    clear: () => {
        storage.clear();
    },
});

describe("favorites", () => {
    it("does not return stale favorites after a failed parse and recovers after correction", () => {
        storage.set("favorite-list", JSON.stringify(["rice"]));
        expect(getFavoriteRecipeSlugs()).toEqual(["rice"]);

        storage.set("favorite-list", "{broken");
        expect(() => getFavoriteRecipeSlugs()).toThrow(SyntaxError);
        expect(() => getFavoriteRecipeSlugs()).toThrow(SyntaxError);
        expect(storage.get("favorite-list")).toBe("{broken");

        storage.set("favorite-list", "[]");
        const recovered = getFavoriteRecipeSlugs();
        expect(recovered).toEqual([]);
        expect(getFavoriteRecipeSlugs()).toBe(recovered);
    });

    beforeEach(() => {
        storage.clear();
    });

    it("toggles a recipe favorite on and off", () => {
        toggleFavoriteRecipe("chicken-rice");

        expect(getFavoriteRecipeSlugs()).toEqual([
            "chicken-rice",
        ]);

        toggleFavoriteRecipe("chicken-rice");

        expect(getFavoriteRecipeSlugs()).toEqual([]);
    });

    it("removes a recipe favorite", () => {
        toggleFavoriteRecipe("chicken-rice");
        toggleFavoriteRecipe("bean-soup");

        removeFavoriteRecipe("chicken-rice");

        expect(getFavoriteRecipeSlugs()).toEqual([
            "bean-soup",
        ]);
    });

    it("notifies subscribers when favorites change", () => {
        const listener = vi.fn();

        const unsubscribe =
            subscribeToFavoriteRecipeSlugs(listener);

        toggleFavoriteRecipe("chicken-rice");

        expect(listener).toHaveBeenCalledTimes(1);

        unsubscribe();

        toggleFavoriteRecipe("chicken-rice");

        expect(listener).toHaveBeenCalledTimes(1);
    });
});
