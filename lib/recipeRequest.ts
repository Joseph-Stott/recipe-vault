import type { Ingredient, Recipe } from "@/types/recipe";

type RecipeRequestResult = { recipe: Recipe; error?: never } | { error: string; recipe?: never };

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parseCreateRecipeRequest(body: unknown): RecipeRequestResult {
    if (!isRecord(body)) return { error: "Recipe must be a JSON object" };
    if (typeof body.title !== "string" || !body.title.trim()) {
        return { error: "Recipe title is required" };
    }
    if (typeof body.slug !== "string" || !body.slug.trim()) {
        return { error: "Recipe slug is required" };
    }
    if (body.timeCategory !== "fast" && body.timeCategory !== "medium" && body.timeCategory !== "slow") {
        return { error: "Invalid time category" };
    }
    if (!Array.isArray(body.structuredIngredients) || body.structuredIngredients.length === 0) {
        return { error: "At least one ingredient is required" };
    }
    const ingredients: Ingredient[] = [];
    for (const ingredient of body.structuredIngredients) {
        if (!isRecord(ingredient) ||
            typeof ingredient.name !== "string" || !ingredient.name.trim() ||
            typeof ingredient.unit !== "string" ||
            !(ingredient.amount === "" || (typeof ingredient.amount === "number" &&
                Number.isFinite(ingredient.amount) && ingredient.amount >= 0))) {
            return { error: "Ingredients require a name, a string unit, and a non-negative numeric or empty amount" };
        }
        ingredients.push({ amount: ingredient.amount, unit: ingredient.unit, name: ingredient.name });
    }
    if (body.cookBook !== undefined && typeof body.cookBook !== "string") {
        return { error: "Cookbook must be a string" };
    }
    if (body.pageNumber !== undefined && (typeof body.pageNumber !== "number" ||
        !Number.isInteger(body.pageNumber) || body.pageNumber < 1 || body.pageNumber > 2_147_483_647)) {
        return { error: "Page number must be an integer between 1 and 2147483647" };
    }
    if (body.cookInstructions !== undefined && (!Array.isArray(body.cookInstructions) ||
        !body.cookInstructions.every((step: unknown) => typeof step === "string"))) {
        return { error: "Cook instructions must be an array of strings" };
    }
    return { recipe: {
        title: body.title,
        slug: body.slug,
        timeCategory: body.timeCategory,
        structuredIngredients: ingredients,
        cookBook: body.cookBook,
        pageNumber: body.pageNumber,
        cookInstructions: body.cookInstructions,
    } };
}
