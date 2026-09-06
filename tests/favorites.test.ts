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
