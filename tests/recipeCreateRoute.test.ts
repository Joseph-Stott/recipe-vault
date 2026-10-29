import { beforeEach, describe, expect, it, vi } from "vitest";

const prisma = vi.hoisted(() => ({ recipe: { create: vi.fn() } }));
vi.mock("@/lib/prisma", () => ({ default: prisma }));
import { POST } from "@/app/api/recipes/route";

const validRecipe = {
    slug: "rice", title: "Rice", timeCategory: "fast",
    structuredIngredients: [{ amount: 1, unit: "cup", name: "rice" }],
};
function request(body: unknown) {
    return new Request("http://localhost/api/recipes", { method: "POST", body: JSON.stringify(body) });
}

describe("POST /api/recipes", () => {
    beforeEach(() => vi.resetAllMocks());

    it.each([null, [], 1, "rice", {},
        ...["title", "slug"].flatMap((key) => [123, null, " "].map((value) => ({ ...validRecipe, [key]: value }))),
        ...[null, "urgent", 1].map((timeCategory) => ({ ...validRecipe, timeCategory })),
        ...[null, {}, [], [null], [1], [{}], [{ amount: "1", unit: "cup", name: "rice" }],
            [{ amount: -1, unit: "cup", name: "rice" }], [{ amount: null, unit: "cup", name: "rice" }],
            [{ amount: 1, unit: 2, name: "rice" }], [{ amount: 1, unit: "cup", name: " " }],
            [{ amount: 1, unit: "cup", name: 4 }],
        ].map((structuredIngredients) => ({ ...validRecipe, structuredIngredients })),
        ...[null, 2, {}].map((cookBook) => ({ ...validRecipe, cookBook })),
        ...[null, "2", 0, -1, 1.5, 2147483648].map((pageNumber) => ({ ...validRecipe, pageNumber })),
        ...[null, "Cook", [1], [{}]].map((cookInstructions) => ({ ...validRecipe, cookInstructions })),
    ])("rejects invalid input without writing: %j", async (body) => {
        const response = await POST(request(body));
        expect(response.status).toBe(400);
        expect(await response.json()).toEqual({ error: expect.any(String) });
        expect(prisma.recipe.create).not.toHaveBeenCalled();
    });

    it("creates a recipe with optional fields and structured ingredients", async () => {
        const body = { ...validRecipe, title: " Rice ", cookBook: "Recipes", pageNumber: 2, cookInstructions: ["Cook rice"] };
        prisma.recipe.create.mockResolvedValue({ id: 1, ...body });
        const response = await POST(request(body));
        expect(response.status).toBe(201);
        expect(await response.json()).toEqual({ id: 1, ...body });
        expect(prisma.recipe.create).toHaveBeenCalledWith({
            data: { slug: "rice", title: "Rice", timeCategory: "fast", cookBook: "Recipes",
                pageNumber: 2, cookInstructions: ["Cook rice"],
                ingredients: { create: validRecipe.structuredIngredients } },
            include: { ingredients: true },
        });
    });

    it("preserves support for unmeasured ingredients and omitted optional fields", async () => {
        prisma.recipe.create.mockResolvedValue({ id: 1 });
        const response = await POST(request({ ...validRecipe,
            structuredIngredients: [{ amount: "", unit: "", name: "salt" }] }));
        expect(response.status).toBe(201);
        expect(prisma.recipe.create).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({ cookInstructions: [], ingredients: { create: [{ amount: null, unit: "", name: "salt" }] } }),
        }));
    });
});
