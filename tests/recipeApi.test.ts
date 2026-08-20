import { afterEach, describe, expect, it, vi } from "vitest";
import { getDatabaseRecipes } from "@/lib/recipeApi";

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