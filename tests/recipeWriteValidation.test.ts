import { beforeEach, describe, expect, it, vi } from "vitest";

const prisma = vi.hoisted(() => ({
    recipe: { findUnique: vi.fn(), update: vi.fn() },
    $transaction: vi.fn(),
}));
vi.mock("@/lib/prisma", () => ({ default: prisma }));
import { PUT } from "@/app/api/recipes/[slug]/route";
import { POST } from "@/app/api/recipes/import/route";
import { parseImportedRecipeRequest } from "@/lib/recipeRequest";

const valid = { slug: "rice", title: "Rice", timeCategory: "fast",
    structuredIngredients: [{ amount: 1, unit: "cup", name: "rice" }] };
const request = (body: unknown) => new Request("http://localhost/api/recipes", { method: "POST", body: JSON.stringify(body) });

describe("recipe write validation", () => {
    beforeEach(() => vi.resetAllMocks());
    it.each([
        { title: 123 }, { title: null }, { timeCategory: "invalid" },
        { structuredIngredients: [null] }, { structuredIngredients: {} },
        { structuredIngredients: [{ amount: -1, unit: "cup", name: "rice" }] },
        { structuredIngredients: [{ amount: 1, unit: 2, name: "rice" }] },
        { cookBook: 1 }, { pageNumber: 1.5 }, { cookInstructions: [false] },
    ])("rejects malformed fields in update and import before any query: %j", async (fields) => {
        const recipe = { ...valid, ...fields };
        const update = await PUT(request(recipe), { params: Promise.resolve({ slug: "rice" }) });
        const imported = await POST(request({ recipes: [valid, recipe] }));
        expect(update.status).toBe(400);
        expect(imported.status).toBe(400);
        expect(prisma.recipe.findUnique).not.toHaveBeenCalled();
        expect(prisma.recipe.update).not.toHaveBeenCalled();
        expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it.each([null, [], 123, "rice"])("rejects non-object update bodies: %j", async (body) => {
        expect((await PUT(request(body), { params: Promise.resolve({ slug: "rice" }) })).status).toBe(400);
        expect(prisma.recipe.findUnique).not.toHaveBeenCalled();
    });

    it("converts legacy text amounts without changing the original record", () => {
        const legacy = { ...valid, structuredIngredients: [{ amount: "0.5", unit: "cup", name: "rice" }] };
        expect(parseImportedRecipeRequest(legacy).recipe?.structuredIngredients[0].amount).toBe(0.5);
        expect(legacy.structuredIngredients[0].amount).toBe("0.5");
    });

    it("rejects invalid legacy quantities", () => {
        expect(parseImportedRecipeRequest({ ...valid,
            structuredIngredients: [{ amount: "1/2", unit: "cup", name: "rice" }] }).error).toBeDefined();
    });
});
