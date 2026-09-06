import { beforeEach, describe, expect, it, vi } from "vitest";

const prisma = vi.hoisted(() => ({
    $transaction: vi.fn(),
    recipe: {
        findMany: vi.fn(),
    },
    favoriteRecipe: {
        findMany: vi.fn(),
        createMany: vi.fn(),
    },
}));

vi.mock("@/lib/prisma", () => ({
    default: prisma,
}));

import { POST } from "@/app/api/favorites/import/route";

function createFavoriteImportRequest(body: unknown) {
    return new Request(
        "http://localhost:3000/api/favorites/import",
        {
            method: "POST",
            body: JSON.stringify(body),
        }
    );
}

describe("POST /api/favorites/import", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        prisma.$transaction.mockResolvedValue([
            [],
            [],
        ]);
        prisma.favoriteRecipe.findMany.mockResolvedValue([]);
    });

    it("returns 400 when favorite recipe slugs are missing", async () => {
        const response = await POST(
            createFavoriteImportRequest({})
        );

        expect(response.status).toBe(400);
        expect(await response.json()).toEqual({
            error: "Favorite recipe slugs are required",
        });
        expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it("imports only valid existing recipe slugs", async () => {
        prisma.$transaction.mockResolvedValue([
            [
                {
                    slug: "chicken-rice",
                },
                {
                    slug: "bean-soup",
                },
            ],
            [
                {
                    recipeSlug: "bean-soup",
                },
            ],
        ]);
        prisma.favoriteRecipe.findMany.mockResolvedValue([
            {
                recipeSlug: "bean-soup",
            },
            {
                recipeSlug: "chicken-rice",
            },
        ]);

        const response = await POST(
            createFavoriteImportRequest({
                recipeSlugs: [
                    " chicken-rice ",
                    "missing-recipe",
                    "bean-soup",
                    "chicken-rice",
                    "",
                    null,
                ],
            })
        );

        expect(response.status).toBe(200);
        expect(prisma.recipe.findMany).toHaveBeenCalledWith({
            where: {
                slug: {
                    in: [
                        "chicken-rice",
                        "missing-recipe",
                        "bean-soup",
                    ],
                },
            },
            select: {
                slug: true,
            },
        });
        expect(prisma.favoriteRecipe.findMany).toHaveBeenCalledWith({
            where: {
                recipeSlug: {
                    in: [
                        "chicken-rice",
                        "missing-recipe",
                        "bean-soup",
                    ],
                },
            },
            select: {
                recipeSlug: true,
            },
        });
        expect(prisma.favoriteRecipe.createMany).toHaveBeenCalledWith({
            data: [
                {
                    recipeSlug: "chicken-rice",
                },
            ],
        });
        expect(await response.json()).toEqual({
            favoriteRecipeSlugs: [
                "bean-soup",
                "chicken-rice",
            ],
        });
    });
});
