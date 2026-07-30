import { beforeEach, describe, expect, it, vi } from "vitest";
import {
    addSavedRecipe,
    deleteSavedRecipe,
    getSavedRecipes,
    updateSavedRecipe,
} from "@/lib/recipeStorage";
import { Recipe } from "@/types/recipe";

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

describe("recipeStorage", () => {
    beforeEach(() => {
        storage.clear();
    });

    it("adds a recipe to saved storage", () => {
        const recipe: Recipe = {
            slug: "chicken-rice",
            title: "Chicken Rice",
            timeCategory: "medium",
            structuredIngredients: [
                {
                    amount: 1,
                    unit: "cup",
                    name: "rice",
                },
            ],
        };

        addSavedRecipe(recipe);

        expect(getSavedRecipes()).toEqual([recipe]);
    });

    it("returns an empty array when no recipes are saved", () => {
        expect(getSavedRecipes()).toEqual([]);
    });

    it("updates an existing saved recipe", () => {
        const originalRecipe: Recipe = {
            slug: "chicken-rice",
            title: "Chicken Rice",
            timeCategory: "medium",
            structuredIngredients: [
                {
                    amount: 1,
                    unit: "cup",
                    name: "rice",
                },
            ],
        };

        const updatedRecipe: Recipe = {
            ...originalRecipe,
            title: "Better Chicken Rice",
        };

        addSavedRecipe(originalRecipe);
        updateSavedRecipe(updatedRecipe);

        expect(getSavedRecipes()).toEqual([updatedRecipe]);
    });

    it("adds a recipe when updating a recipe that does not exist", () => {
        const recipe: Recipe = {
            slug: "chicken-rice",
            title: "Chicken Rice",
            timeCategory: "medium",
            structuredIngredients: [
                {
                    amount: 1,
                    unit: "cup",
                    name: "rice",
                },
            ],
        };

        updateSavedRecipe(recipe);

        expect(getSavedRecipes()).toEqual([recipe]);
    });

    it("deletes a saved recipe", () => {
        const recipe: Recipe = {
            slug: "chicken-rice",
            title: "Chicken Rice",
            timeCategory: "medium",
            structuredIngredients: [
                {
                    amount: 1,
                    unit: "cup",
                    name: "rice",
                },
            ],
        };

        addSavedRecipe(recipe);
        deleteSavedRecipe(recipe.slug);

        expect(getSavedRecipes()).toEqual([]);
    });

    it("does nothing when deleting a recipe that does not exist", () => {
        const recipe: Recipe = {
            slug: "chicken-rice",
            title: "Chicken Rice",
            timeCategory: "medium",
            structuredIngredients: [
                {
                    amount: 1,
                    unit: "cup",
                    name: "rice",
                },
            ],
        };

        addSavedRecipe(recipe);
        deleteSavedRecipe("does-not-exist");

        expect(getSavedRecipes()).toEqual([recipe]);
    });
});