import { Recipe } from "@/types/recipe";

export function getIngredientNames(recipe: Recipe) {
    return recipe.structuredIngredients?.map(
        (ingredient) => ingredient.name
    ) ?? [];
}