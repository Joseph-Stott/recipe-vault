import { beforeEach, describe, expect, it, vi } from "vitest";

const prisma = vi.hoisted(() => ({
    favoriteRecipe: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        delete: vi.fn(),
        create: vi.fn(),
    },
    recipe: {
        findUnique: vi.fn(),
    },
}));

vi.mock("@/lib/prisma", () => ({
    default: prisma,
}));

import { GET, POST } from "@/app/api/favorites/route";

function createFavoriteRequest(body: unknown) {
    return new Request(
        "http://localhost:3000/api/favorites",
        {
            method: "POST",
            body: JSON.stringify(body),
        }
    );
}

describe("GET /api/favorites", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns favorite recipe slugs", async () => {
        prisma.favoriteRecipe.findMany.mockResolvedValue([
            {
                recipeSlug: "chicken-rice",
            },
        ]);

        const response = await GET();

        expect(response.status).toBe(200);
        expect(prisma.favoriteRecipe.findMany).toHaveBeenCalledWith({
            orderBy: {
                id: "asc",
            },
            select: {
                recipeSlug: true,
            },
        });
        expect(await response.json()).toEqual({
            favoriteRecipeSlugs: ["chicken-rice"],
        });
    });
});

describe("POST /api/favorites", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns 400 when recipe slug is missing", async () => {
        const response = await POST(createFavoriteRequest({}));

        expect(response.status).toBe(400);
        expect(await response.json()).toEqual({
            error: "Recipe slug is required",
        });
        expect(prisma.recipe.findUnique).not.toHaveBeenCalled();
    });

    it("returns 404 when the recipe does not exist", async () => {
        prisma.recipe.findUnique.mockResolvedValue(null);

        const response = await POST(
            createFavoriteRequest({
                recipeSlug: "missing-recipe",
            })
        );

        expect(response.status).toBe(404);
        expect(await response.json()).toEqual({
            error: "Recipe not found",
        });
        expect(prisma.favoriteRecipe.create).not.toHaveBeenCalled();
        expect(prisma.favoriteRecipe.delete).not.toHaveBeenCalled();
    });

    it("adds a favorite when the recipe is not already favored", async () => {
        prisma.recipe.findUnique.mockResolvedValue({
            slug: "chicken-rice",
        });
        prisma.favoriteRecipe.findUnique.mockResolvedValue(null);
        prisma.favoriteRecipe.findMany.mockResolvedValue([
            {
                recipeSlug: "chicken-rice",
            },
        ]);

        const response = await POST(
            createFavoriteRequest({
                recipeSlug: " chicken-rice ",
            })
        );

        expect(response.status).toBe(200);
        expect(prisma.favoriteRecipe.create).toHaveBeenCalledWith({
            data: {
                recipeSlug: "chicken-rice",
            },
        });
        expect(await response.json()).toEqual({
            favoriteRecipeSlugs: ["chicken-rice"],
        });
    });

    it("removes a favorite when the recipe is already favored", async () => {
        prisma.recipe.findUnique.mockResolvedValue({
            slug: "chicken-rice",
        });
        prisma.favoriteRecipe.findUnique.mockResolvedValue({
            id: 12,
        });
        prisma.favoriteRecipe.findMany.mockResolvedValue([]);

        const response = await POST(
            createFavoriteRequest({
                recipeSlug: "chicken-rice",
            })
        );

        expect(response.status).toBe(200);
        expect(prisma.favoriteRecipe.delete).toHaveBeenCalledWith({
            where: {
                recipeSlug: "chicken-rice",
            },
        });
        expect(await response.json()).toEqual({
            favoriteRecipeSlugs: [],
        });
    });
});
