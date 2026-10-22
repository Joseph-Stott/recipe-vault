import { Recipe } from "@/types/recipe";

export function getIngredientNames(recipe: Recipe) {
    return recipe.structuredIngredients?.map(
        (ingredient) => ingredient.name
    ) ?? [];
}

// Counts how many unique recipe ingredients are currently present
// in the user's grocery list.
export function getIngredientMatchCount(
    recipeIngredients: string[],
    groceryIngredients: string[]
) {
    const normalize = (name: string) => name.trim().toLowerCase();
    const uniqueRecipeIngredients = [...new Set(recipeIngredients.map(normalize))];
    const groceryIngredientNames = new Set(groceryIngredients.map(normalize));

    return uniqueRecipeIngredients.filter((ingredient) =>
        ingredient !== "" && groceryIngredientNames.has(ingredient)
    ).length;
}

export function getRecipeIngredientMatchCount(
    recipe: Recipe,
    groceryIngredients: string[]
) {
    return getIngredientMatchCount(
        getIngredientNames(recipe),
        groceryIngredients
    );
}

export function createSlug(title: string) {
    return title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
}
