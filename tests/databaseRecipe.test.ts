import { describe, expect, it } from "vitest";
import { mapDatabaseRecipeToRecipe } from "@/lib/databaseRecipe";

describe("mapDatabaseRecipeToRecipe", () => {
    it("maps a database recipe to the application recipe shape", () => {
        const recipe = mapDatabaseRecipeToRecipe({
            slug: "chicken-rice",
            title: "Chicken Rice",
            timeCategory: "medium",
            cookBook: "Test Cookbook",
            pageNumber: 42,
            cookInstructions: [
                "Cook chicken",
                "Cook rice",
            ],
            ingredients: [
                {
                    amount: "1.5",
                    unit: "lb",
                    name: "chicken",
                },
                {
                    amount: "2",
                    unit: "cups",
                    name: "rice",
                },
            ],
        });

        expect(recipe).toEqual({
            slug: "chicken-rice",
            title: "Chicken Rice",
            timeCategory: "medium",
            structuredIngredients: [
                {
                    amount: 1.5,
                    unit: "lb",
                    name: "chicken",
                },
                {
                    amount: 2,
                    unit: "cups",
                    name: "rice",
                },
            ],
            cookInstructions: [
                "Cook chicken",
                "Cook rice",
            ],
            cookBook: "Test Cookbook",
            pageNumber: 42,
        });
    });

    it("maps nullable and empty database values to application defaults", () => {
        const recipe = mapDatabaseRecipeToRecipe({
            slug: "simple-recipe",
            title: "Simple Recipe",
            timeCategory: "fast",
            cookBook: null,
            pageNumber: null,
            cookInstructions: [],
            ingredients: [
                {
                    amount: null,
                    unit: "",
                    name: "salt",
                },
            ],
        });

        expect(recipe).toEqual({
            slug: "simple-recipe",
            title: "Simple Recipe",
            timeCategory: "fast",
            structuredIngredients: [
                {
                    amount: "",
                    unit: "",
                    name: "salt",
                },
            ],
            cookInstructions: undefined,
            cookBook: undefined,
            pageNumber: undefined,
        });
    });
});