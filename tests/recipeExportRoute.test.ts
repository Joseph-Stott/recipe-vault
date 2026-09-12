import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const prisma = vi.hoisted(() => ({
    recipe: {
        findMany: vi.fn(),
    },
    favoriteRecipe: {
        findMany: vi.fn(),
    },
}));

vi.mock("@/lib/prisma", () => ({
    default: prisma,
}));

import { GET } from "@/app/api/recipes/export/route";

describe("GET /api/recipes/export", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2026-09-11T12:34:56.000Z"));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("exports recipes and favorite slugs as a portable backup", async () => {
        prisma.recipe.findMany.mockResolvedValue([
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
        ]);
        prisma.favoriteRecipe.findMany.mockResolvedValue([
            {
                recipeSlug: "chicken-rice",
            },
        ]);

        const response = await GET();

        expect(prisma.recipe.findMany).toHaveBeenCalledWith({
            orderBy: {
                title: "asc",
            },
            include: {
                ingredients: true,
            },
        });
        expect(prisma.favoriteRecipe.findMany).toHaveBeenCalledWith({
            orderBy: {
                id: "asc",
            },
            select: {
                recipeSlug: true,
            },
        });
        expect(response.headers.get("Content-Disposition")).toBe(
            'attachment; filename="recipe-vault-backup-2026-09-11.json"'
        );
        expect(await response.json()).toEqual({
            app: "recipe-vault",
            exportedAt: "2026-09-11T12:34:56.000Z",
            recipeCount: 1,
            favoriteRecipeSlugs: ["chicken-rice"],
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
});
