import { afterEach, describe, expect, it, vi } from "vitest";
import {
    createDatabaseRecipe,
    deleteDatabaseRecipe,
    getDatabaseRecipes,
    importDatabaseRecipes,
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

describe("createDatabaseRecipe", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("creates and maps a database recipe", async () => {
        vi.spyOn(globalThis, "fetch").mockResolvedValue(
            new Response(
                JSON.stringify({
                    slug: "chicken-rice",
                    title: "Chicken Rice",
                    timeCategory: "medium",
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
                    status: 201,
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            )
        );

        const recipe = await createDatabaseRecipe({
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
            cookInstructions: ["Cook rice"],
        });

        expect(fetch).toHaveBeenCalledWith("/api/recipes", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
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
                cookInstructions: ["Cook rice"],
            }),
        });
        expect(recipe).toEqual({
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
            cookInstructions: ["Cook rice"],
            cookBook: undefined,
            pageNumber: undefined,
        });
    });

    it("throws when the create request fails", async () => {
        vi.spyOn(globalThis, "fetch").mockResolvedValue(
            new Response(null, {
                status: 500,
            })
        );

        await expect(
            createDatabaseRecipe({
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
        ).rejects.toThrow("Failed to create recipe");
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

describe("importDatabaseRecipes", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("imports and maps database recipes", async () => {
        vi.spyOn(globalThis, "fetch").mockResolvedValue(
            new Response(
                JSON.stringify({
                    importedCount: 1,
                    skippedCount: 0,
                    recipes: [
                        {
                            slug: "chicken-rice",
                            title: "Chicken Rice",
                            timeCategory: "medium",
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

        const result = await importDatabaseRecipes([
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
                cookInstructions: ["Cook rice"],
            },
        ]);

        expect(fetch).toHaveBeenCalledWith("/api/recipes/import", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                recipes: [
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
                        cookInstructions: ["Cook rice"],
                    },
                ],
            }),
        });
        expect(result).toEqual({
            importedCount: 1,
            skippedCount: 0,
            recipes: [
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
                    cookInstructions: ["Cook rice"],
                    cookBook: undefined,
                    pageNumber: undefined,
                },
            ],
        });
    });

    it("throws when the import request fails", async () => {
        vi.spyOn(globalThis, "fetch").mockResolvedValue(
            new Response(null, {
                status: 500,
            })
        );

        await expect(importDatabaseRecipes([])).rejects.toThrow(
            "Failed to import recipes"
        );
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
