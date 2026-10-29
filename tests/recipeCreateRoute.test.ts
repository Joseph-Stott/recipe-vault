import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Prisma } from "@/lib/generated/prisma/client";

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
    afterEach(() => vi.restoreAllMocks());

    it.each(["", "{broken", '{"title":}'])("returns JSON 400 for malformed JSON: %j", async (body) => {
        const response = await POST(new Request("http://localhost/api/recipes", { method: "POST", body }));
        expect(response.status).toBe(400);
        expect(await response.json()).toEqual({ error: "Request body must be valid JSON" });
        expect(prisma.recipe.create).not.toHaveBeenCalled();
    });

    it("returns 409 for a unique constraint failure from the database", async () => {
        prisma.recipe.create.mockRejectedValue(new Prisma.PrismaClientKnownRequestError(
            "Unique constraint failed", { code: "P2002", clientVersion: "7.9.1", meta: { target: ["slug"] } }
        ));
        const response = await POST(request(validRecipe));
        expect(response.status).toBe(409);
        expect(await response.json()).toEqual({ error: "A recipe with this slug already exists" });
        expect(prisma.recipe.create).toHaveBeenCalledTimes(1);
    });

    it.each([
        new Error("Private database connection details"),
        new Prisma.PrismaClientKnownRequestError("Database unavailable", { code: "P1001", clientVersion: "7.9.1" }),
    ])("returns a generic 500 and logs unexpected database failures", async (error) => {
        const log = vi.spyOn(console, "error").mockImplementation(() => undefined);
        prisma.recipe.create.mockRejectedValue(error);
        const response = await POST(request(validRecipe));
        expect(response.status).toBe(500);
        expect(await response.json()).toEqual({ error: "Failed to create recipe" });
        expect(log).toHaveBeenCalledWith("Failed to create recipe", error);
    });

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
