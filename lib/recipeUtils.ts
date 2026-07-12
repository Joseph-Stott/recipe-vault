import { Recipe } from "@/types/recipe";

export function getIngredientNames(recipe: Recipe) {
    return recipe.structuredIngredients?.map(
        (ingredient) => ingredient.name
    ) ?? [];
}

// Counts how many recipe ingredients are currently present
// in the user's grocery list.
export function getIngredientMatchCount(
    recipeIngredients: string[],
    groceryIngredients: string[]
) {
    return recipeIngredients.filter((ingredient) =>
        groceryIngredients.includes(ingredient)
    ).length;
}

export function createSlug(title: string) {
    return title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
}