import { beforeEach, describe, expect, it, vi } from "vitest";

const tx = vi.hoisted(() => ({
    recipe: {
        findMany: vi.fn(),
        create: vi.fn(),
    },
}));

const prisma = vi.hoisted(() => ({
    $transaction: vi.fn((callback) => callback(tx)),
}));

vi.mock("@/lib/prisma", () => ({
    default: prisma,
}));

import { POST } from "@/app/api/recipes/import/route";

function createImportRequest(body: unknown) {
    return new Request(
        "http://localhost:3000/api/recipes/import",
        {
            method: "POST",
            body: JSON.stringify(body),
        }
    );
}

describe("POST /api/recipes/import", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns 400 when recipes are missing", async () => {
        const response = await POST(createImportRequest({}));

        expect(response.status).toBe(400);
        expect(await response.json()).toEqual({
            error: "Recipes are required",
        });
        expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it("returns 400 for invalid recipe data", async () => {
        const response = await POST(
            createImportRequest({
                recipes: [
                    {
                        slug: "bad-recipe",
                        title: "",
                        timeCategory: "medium",
                        structuredIngredients: [],
                    },
                ],
            })
        );

        expect(response.status).toBe(400);
        expect(await response.json()).toEqual({
            error:
                'Invalid recipe "bad-recipe": Recipe title is required Recipe title must contain letters or numbers At least one complete ingredient is required',
        });
        expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it("ignores malformed entries without slugs", async () => {
        tx.recipe.findMany.mockResolvedValue([]);

        const response = await POST(
            createImportRequest({
                recipes: [
                    null,
                    {
                        title: "Missing Slug",
                        timeCategory: "medium",
                        structuredIngredients: [
                            {
                                amount: 1,
                                unit: "cup",
                                name: "rice",
                            },
                        ],
                    },
                ],
            })
        );

        expect(response.status).toBe(200);
        expect(tx.recipe.findMany).toHaveBeenCalledWith({
            where: {
                slug: {
                    in: [],
                },
            },
            select: {
                slug: true,
            },
        });
        expect(tx.recipe.create).not.toHaveBeenCalled();
        expect(await response.json()).toEqual({
            importedCount: 0,
            skippedCount: 0,
            recipes: [],
        });
    });

    it("imports recipes that are not already in the database", async () => {
        tx.recipe.findMany.mockResolvedValue([
            {
                slug: "already-imported",
            },
        ]);
        tx.recipe.create.mockResolvedValue({
            id: 12,
            slug: "chicken-rice",
            title: "Chicken Rice",
            timeCategory: "medium",
            cookBook: null,
            pageNumber: null,
            cookInstructions: ["Cook rice"],
            ingredients: [
                {
                    id: 34,
                    amount: "2",
                    unit: "cups",
                    name: "rice",
                    recipeId: 12,
                },
            ],
        });

        const response = await POST(
            createImportRequest({
                recipes: [
                    {
                        slug: "already-imported",
                        title: "Already Imported",
                        timeCategory: "fast",
                        structuredIngredients: [
                            {
                                amount: 1,
                                unit: "cup",
                                name: "beans",
                            },
                        ],
                    },
                    {
                        slug: "chicken-rice",
                        title: " Chicken Rice ",
                        timeCategory: "medium",
                        structuredIngredients: [
                            {
                                amount: 2,
                                unit: " cups ",
                                name: " rice ",
                            },
                        ],
                        cookInstructions: ["Cook rice"],
                    },
                ],
            })
        );

        expect(response.status).toBe(200);
        expect(tx.recipe.findMany).toHaveBeenCalledWith({
            where: {
                slug: {
                    in: [
                        "already-imported",
                        "chicken-rice",
                    ],
                },
            },
            select: {
                slug: true,
            },
        });
        expect(tx.recipe.create).toHaveBeenCalledTimes(1);
        expect(tx.recipe.create).toHaveBeenCalledWith({
            data: {
                slug: "chicken-rice",
                title: "Chicken Rice",
                timeCategory: "medium",
                cookBook: null,
                pageNumber: null,
                cookInstructions: ["Cook rice"],
                ingredients: {
                    create: [
                        {
                            amount: 2,
                            unit: "cups",
                            name: "rice",
                        },
                    ],
                },
            },
            include: {
                ingredients: true,
            },
        });
        expect(await response.json()).toEqual({
            importedCount: 1,
            skippedCount: 1,
            recipes: [
                {
                    id: 12,
                    slug: "chicken-rice",
                    title: "Chicken Rice",
                    timeCategory: "medium",
                    cookBook: null,
                    pageNumber: null,
                    cookInstructions: ["Cook rice"],
                    ingredients: [
                        {
                            id: 34,
                            amount: "2",
                            unit: "cups",
                            name: "rice",
                            recipeId: 12,
                        },
                    ],
                },
            ],
        });
    });
});
