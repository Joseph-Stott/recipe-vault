import { recipes } from "@/data/recipes";
import { Recipe } from "@/types/recipe";

export function getAllRecipes(savedRecipes: Recipe[]) {
    const allRecipesWithDuplicates = [...savedRecipes, ...recipes];

    return allRecipesWithDuplicates.filter((recipe, index, array) =>
        array.findIndex((currentRecipe) => currentRecipe.slug === recipe.slug) === index
    );
}