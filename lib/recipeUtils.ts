import { Recipe } from "@/types/recipe";

export function getIngredientNames(recipe: Recipe) {
    return recipe.structuredIngredients?.map(
        (ingredient) => ingredient.name
    ) ?? [];
}

export function createSlug(title: string) {
    return title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
}