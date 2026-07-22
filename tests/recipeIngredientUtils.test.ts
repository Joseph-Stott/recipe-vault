import { describe, expect, it } from "vitest";
import {
    getIngredientMatchCount,
    getIngredientNames,
    getRecipeIngredientMatchCount,
} from "@/lib/recipeUtils";

describe("getIngredientMatchCount", () => {
    it("counts matching ingredients", () => {
        const recipeIngredients = ["chicken", "rice", "broccoli"];
        const groceryIngredients = ["rice", "milk", "chicken"];

        const matchCount = getIngredientMatchCount(
            recipeIngredients,
            groceryIngredients
        );

        expect(matchCount).toBe(2);
    });

    it("returns zero when there are no matching ingredients", () => {
        const recipeIngredients = ["chicken", "rice", "broccoli"];
        const groceryIngredients = ["milk", "eggs", "cheese"];

        const matchCount = getIngredientMatchCount(
            recipeIngredients,
            groceryIngredients
        );

        expect(matchCount).toBe(0);
    });

    it("counts all ingredients when every ingredient matches", () => {
        const recipeIngredients = ["chicken", "rice", "broccoli"];
        const groceryIngredients = ["broccoli", "chicken", "rice"];

        const matchCount = getIngredientMatchCount(
            recipeIngredients,
            groceryIngredients
        );

        expect(matchCount).toBe(3);
    });

    it("returns zero when the recipe has no ingredients", () => {
        const recipeIngredients: string[] = [];
        const groceryIngredients = ["milk", "eggs"];

        const matchCount = getIngredientMatchCount(
            recipeIngredients,
            groceryIngredients
        );

        expect(matchCount).toBe(0);
    });

    it("returns zero when the grocery list has no ingredients", () => {
        const recipeIngredients = ["milk", "eggs"];
        const groceryIngredients: string[] = [];

        const matchCount = getIngredientMatchCount(
            recipeIngredients,
            groceryIngredients
        );

        expect(matchCount).toBe(0);
    });

    it("counts duplicate recipe ingredients only once", () => {
        const recipeIngredients = ["milk", "milk"];
        const groceryIngredients = ["milk"];

        const matchCount = getIngredientMatchCount(
            recipeIngredients,
            groceryIngredients
        );

        expect(matchCount).toBe(1);
    });
});

describe("getIngredientNames", () => {
    it("returns the names of a recipe's ingredients", () => {
        const recipe = {
            slug: "chicken-rice",
            title: "Chicken Rice",
            timeCategory: "medium" as const,
            structuredIngredients: [
                { amount: 1, unit: "lb", name: "chicken" },
                { amount: 2, unit: "cups", name: "rice" },
            ],
        };

        const ingredientNames = getIngredientNames(recipe);

        expect(ingredientNames).toEqual(["chicken", "rice"]);
    });

    it("returns an empty array when the recipe has no ingredients", () => {
        const recipe = {
            slug: "simple-recipe",
            title: "Simple Recipe",
            timeCategory: "fast" as const,
            structuredIngredients: [],
        };

        const ingredientNames = getIngredientNames(recipe);

        expect(ingredientNames).toEqual([]);
    });
});

describe("getRecipeIngredientMatchCount", () => {
    it("counts matching ingredients from a recipe", () => {
        const recipe = {
            slug: "chicken-rice",
            title: "Chicken Rice",
            timeCategory: "medium" as const,
            structuredIngredients: [
                { amount: 1, unit: "lb", name: "chicken" },
                { amount: 2, unit: "cups", name: "rice" },
                { amount: 1, unit: "cup", name: "broccoli" },
            ],
        };

        const groceryIngredients = ["rice", "milk", "chicken"];

        const matchCount = getRecipeIngredientMatchCount(
            recipe,
            groceryIngredients
        );

        expect(matchCount).toBe(2);
    });

    it("returns zero when the recipe has no ingredients", () => {
        const recipe = {
            slug: "simple-recipe",
            title: "Simple Recipe",
            timeCategory: "fast" as const,
            structuredIngredients: [],
        };

        const groceryIngredients = ["milk", "eggs"];

        const matchCount = getRecipeIngredientMatchCount(
            recipe,
            groceryIngredients
        );

        expect(matchCount).toBe(0);
    });
});