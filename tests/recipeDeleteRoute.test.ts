import { beforeEach, describe, expect, it, vi } from "vitest";

const prisma = vi.hoisted(() => ({
    recipe: {
        findUnique: vi.fn(),
        delete: vi.fn(),
    },
}));

vi.mock("@/lib/prisma", () => ({
    default: prisma,
}));

import { DELETE } from "@/app/api/recipes/[slug]/route";

function createDeleteRequest(slug = "chicken-rice") {
    return new Request(
        `http://localhost:3000/api/recipes/${slug}`,
        {
            method: "DELETE",
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

describe("DELETE /api/recipes/[slug]", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns 404 when the recipe does not exist", async () => {
        prisma.recipe.findUnique.mockResolvedValue(null);

        const response = await DELETE(
            createDeleteRequest(),
            createRouteContext()
        );

        expect(response.status).toBe(404);
        expect(await response.json()).toEqual({
            error: "Recipe not found",
        });
        expect(prisma.recipe.delete).not.toHaveBeenCalled();
    });

    it("deletes an existing database recipe", async () => {
        prisma.recipe.findUnique.mockResolvedValue({
            id: 12,
        });
        prisma.recipe.delete.mockResolvedValue({
            id: 12,
            slug: "chicken-rice",
        });

        const response = await DELETE(
            createDeleteRequest(),
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
        expect(prisma.recipe.delete).toHaveBeenCalledWith({
            where: {
                slug: "chicken-rice",
            },
        });
        expect(await response.json()).toEqual({
            success: true,
        });
    });
});
