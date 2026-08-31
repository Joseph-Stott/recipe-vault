import { afterEach, describe, expect, it, vi } from "vitest";
import {
    deleteDatabaseRecipe,
    getDatabaseRecipes,
    updateDatabaseRecipe,
} from "@/lib/recipeApi";

describe("getDatabaseRecipes", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("fetches and maps database recipes", async () => {
        vi.spyOn(globalThis, "fetch").mockResolvedValue(
            new Response(
                JSON.stringify([
                    {
                        slug: "chicken-rice",
                        title: "Chicken Rice",
                        timeCategory: "medium",
                        cookBook: null,
                        pageNumber: null,
                        cookInstructions: [],
                        ingredients: [
                            {
                                amount: "2",
                                unit: "cups",
                                name: "rice",
                            },
                        ],
                    },
                ]),
                {
                    status: 200,
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            )
        );

        const recipes = await getDatabaseRecipes();

        expect(fetch).toHaveBeenCalledWith("/api/recipes");
        expect(recipes).toEqual([
            {
                slug: "chicken-rice",
                title: "Chicken Rice",
                timeCategory: "medium",
                structuredIngredients: [
                    {
                        amount: 2,
                        unit: "cups",
                        name: "rice",
                    },
                ],
                cookInstructions: undefined,
                cookBook: undefined,
                pageNumber: undefined,
            },
        ]);
    });

    it("throws when the recipe request fails", async () => {
        vi.spyOn(globalThis, "fetch").mockResolvedValue(
            new Response(null, {
                status: 500,
            })
        );

        await expect(getDatabaseRecipes()).rejects.toThrow(
            "Failed to load recipes"
        );
    });
});

describe("updateDatabaseRecipe", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("updates and maps a database recipe", async () => {
        vi.spyOn(globalThis, "fetch").mockResolvedValue(
            new Response(
                JSON.stringify({
                    slug: "chicken-rice",
                    title: "Chicken Rice",
                    timeCategory: "fast",
                    cookBook: null,
                    pageNumber: null,
                    cookInstructions: ["Cook rice"],
                    ingredients: [
                        {
                            amount: "2",
                            unit: "cups",
                            name: "rice",
                        },
                    ],
                }),
                {
                    status: 200,
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            )
        );

        const recipe = await updateDatabaseRecipe({
            slug: "chicken-rice",
            title: "Chicken Rice",
            timeCategory: "fast",
            structuredIngredients: [
                {
                    amount: 2,
                    unit: "cups",
                    name: "rice",
                },
            ],
            cookInstructions: ["Cook rice"],
        });

        expect(fetch).toHaveBeenCalledWith(
            "/api/recipes/chicken-rice",
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    slug: "chicken-rice",
                    title: "Chicken Rice",
                    timeCategory: "fast",
                    structuredIngredients: [
                        {
                            amount: 2,
                            unit: "cups",
                            name: "rice",
                        },
                    ],
                    cookInstructions: ["Cook rice"],
                }),
            }
        );
        expect(recipe).toEqual({
            slug: "chicken-rice",
            title: "Chicken Rice",
            timeCategory: "fast",
            structuredIngredients: [
                {
                    amount: 2,
                    unit: "cups",
                    name: "rice",
                },
            ],
            cookInstructions: ["Cook rice"],
            cookBook: undefined,
            pageNumber: undefined,
        });
    });

    it("throws when the update request fails", async () => {
        vi.spyOn(globalThis, "fetch").mockResolvedValue(
            new Response(null, {
                status: 500,
            })
        );

        await expect(
            updateDatabaseRecipe({
                slug: "chicken-rice",
                title: "Chicken Rice",
                timeCategory: "medium",
                structuredIngredients: [
                    {
                        amount: 2,
                        unit: "cups",
                        name: "rice",
                    },
                ],
            })
        ).rejects.toThrow("Failed to update recipe");
    });
});

describe("deleteDatabaseRecipe", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("deletes a database recipe", async () => {
        vi.spyOn(globalThis, "fetch").mockResolvedValue(
            new Response(
                JSON.stringify({
                    success: true,
                }),
                {
                    status: 200,
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            )
        );

        await deleteDatabaseRecipe("chicken-rice");

        expect(fetch).toHaveBeenCalledWith(
            "/api/recipes/chicken-rice",
            {
                method: "DELETE",
            }
        );
    });

    it("throws when the delete request fails", async () => {
        vi.spyOn(globalThis, "fetch").mockResolvedValue(
            new Response(null, {
                status: 500,
            })
        );

        await expect(
            deleteDatabaseRecipe("chicken-rice")
        ).rejects.toThrow("Failed to delete recipe");
    });
});
