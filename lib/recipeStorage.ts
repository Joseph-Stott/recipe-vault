import type { Recipe } from "@/types/recipe";

export function getSavedRecipes(): Recipe[] {
    const storedRecipes = localStorage.getItem("saved-recipes");
    if (!storedRecipes) {
        return [];
    }
    const parsedRecipes = JSON.parse(storedRecipes)
    return parsedRecipes;
};

export function addSavedRecipe(recipe: Recipe) {
    const currentRecipes = getSavedRecipes()
    const updatedRecipes = [...currentRecipes, recipe]
    localStorage.setItem("saved-recipes", JSON.stringify(updatedRecipes))
};

export function updateSavedRecipe(updatedRecipe: Recipe) {
    const currentRecipes = getSavedRecipes();

    const updatedRecipes = currentRecipes.map((recipe) =>
        recipe.slug === updatedRecipe.slug
            ? updatedRecipe
            : recipe
    );

    localStorage.setItem("saved-recipes", JSON.stringify(updatedRecipes))
};