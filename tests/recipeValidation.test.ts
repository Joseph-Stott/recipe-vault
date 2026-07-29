import { describe, expect, it } from "vitest";
import { validateRecipeForm } from "@/lib/recipeValidation";

describe("validateRecipeForm", () => {
    it("accepts a recipe with a title and complete ingredient", () => {
        const result = validateRecipeForm({
            title: "Chicken Rice",
            structuredIngredients: [
                {
                    amount: 1,
                    unit: "cup",
                    name: "rice",
                },
            ],
        });

        expect(result.valid).toBe(true);
        expect(result.messages).toEqual([]);
        expect(result.filteredIngredients).toEqual([
            {
                amount: 1,
                unit: "cup",
                name: "rice",
            },
        ]);
    });

    it("rejects a recipe with an empty title", () => {
        const result = validateRecipeForm({
            title: "   ",
            structuredIngredients: [
                {
                    amount: 1,
                    unit: "cup",
                    name: "rice",
                },
            ],
        });

        expect(result.valid).toBe(false);
        expect(result.messages).toContain("Recipe title is required");
    });

    it("filters out completely blank ingredient rows", () => {
        const result = validateRecipeForm({
            title: "Chicken Rice",
            structuredIngredients: [
                {
                    amount: 1,
                    unit: "cup",
                    name: "rice",
                },
                {
                    amount: "",
                    unit: "",
                    name: "",
                },
            ],
        });

        expect(result.valid).toBe(true);
        expect(result.filteredIngredients).toEqual([
            {
                amount: 1,
                unit: "cup",
                name: "rice",
            },
        ]);
    });

    it("rejects partially completed ingredient rows", () => {
        const result = validateRecipeForm({
            title: "Chicken Rice",
            structuredIngredients: [
                {
                    amount: 1,
                    unit: "cup",
                    name: "",
                },
            ],
        });

        expect(result.valid).toBe(false);
        expect(result.messages).toContain(
            "Ingredient rows must include amount, unit, and name"
        );
    });

    it("preserves multiple valid ingredient rows", () => {
        const result = validateRecipeForm({
            title: "Chicken Rice",
            structuredIngredients: [
                {
                    amount: 1,
                    unit: "cup",
                    name: "rice",
                },
                {
                    amount: 2,
                    unit: "tbsp",
                    name: "soy sauce",
                },
            ],
        });

        expect(result.valid).toBe(true);
        expect(result.filteredIngredients).toEqual([
            {
                amount: 1,
                unit: "cup",
                name: "rice",
            },
            {
                amount: 2,
                unit: "tbsp",
                name: "soy sauce",
            },
        ]);
    });
});