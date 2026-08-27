import { beforeEach, describe, expect, it, vi } from "vitest";

const prisma = vi.hoisted(() => ({
    recipe: {
        findUnique: vi.fn(),
        update: vi.fn(),
    },
}));

vi.mock("@/lib/prisma", () => ({
    default: prisma,
}));

import { PUT } from "@/app/api/recipes/[slug]/route";

function createUpdateRequest(body: unknown) {
    return new Request(
        "http://localhost:3000/api/recipes/chicken-rice",
        {
            method: "PUT",
            body: JSON.stringify(body),
        }
    );
}

function createRouteContext(slug = "chicken-rice") {
    return {
        params: Promise.resolve({
            slug,
        }),
    };
}

describe("PUT /api/recipes/[slug]", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns 400 for invalid recipe data", async () => {
        const response = await PUT(
            createUpdateRequest({
                title: "",
                timeCategory: "medium",
                structuredIngredients: [],
            }),
            createRouteContext()
        );

        expect(response.status).toBe(400);
        expect(await response.json()).toEqual({
            error:
                "Recipe title is required Recipe title must contain letters or numbers At least one complete ingredient is required",
        });
        expect(prisma.recipe.findUnique).not.toHaveBeenCalled();
        expect(prisma.recipe.update).not.toHaveBeenCalled();
    });

    it("returns 404 when the recipe does not exist", async () => {
        prisma.recipe.findUnique.mockResolvedValue(null);

        const response = await PUT(
            createUpdateRequest({
                title: "Chicken Rice",
                timeCategory: "medium",
                structuredIngredients: [
                    {
                        amount: 2,
                        unit: "cups",
                        name: "rice",
                    },
                ],
            }),
            createRouteContext()
        );

        expect(response.status).toBe(404);
        expect(await response.json()).toEqual({
            error: "Recipe not found",
        });
        expect(prisma.recipe.update).not.toHaveBeenCalled();
    });

    it("updates the recipe and replaces its ingredients", async () => {
        prisma.recipe.findUnique.mockResolvedValue({
            id: 12,
        });
        prisma.recipe.update.mockResolvedValue({
            id: 12,
            slug: "chicken-rice",
            title: "Chicken Rice",
            timeCategory: "fast",
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

        const response = await PUT(
            createUpdateRequest({
                title: " Chicken Rice ",
                timeCategory: "fast",
                structuredIngredients: [
                    {
                        amount: 2,
                        unit: " cups ",
                        name: " rice ",
                    },
                ],
                cookInstructions: ["Cook rice"],
                cookBook: "",
            }),
            createRouteContext()
        );

        expect(response.status).toBe(200);
        expect(prisma.recipe.findUnique).toHaveBeenCalledWith({
            where: {
                slug: "chicken-rice",
            },
            select: {
                id: true,
            },
        });
        expect(prisma.recipe.update).toHaveBeenCalledWith({
            where: {
                slug: "chicken-rice",
            },
            data: {
                title: "Chicken Rice",
                timeCategory: "fast",
                cookBook: null,
                pageNumber: null,
                cookInstructions: ["Cook rice"],
                ingredients: {
                    deleteMany: {},
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
            id: 12,
            slug: "chicken-rice",
            title: "Chicken Rice",
            timeCategory: "fast",
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
    });
});
