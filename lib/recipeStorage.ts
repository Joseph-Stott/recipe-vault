import type { Recipe } from "@/types/recipe";

const EMPTY_SAVED_RECIPES: Recipe[] = [];

let cachedSavedRecipesJson: string | null | undefined;
let cachedSavedRecipes: Recipe[] = EMPTY_SAVED_RECIPES;

type SavedRecipeListener = () => void;

const savedRecipeListeners = new Set<SavedRecipeListener>();

export function subscribeToSavedRecipes(
    listener: SavedRecipeListener
) {
    savedRecipeListeners.add(listener);

    return () => {
        savedRecipeListeners.delete(listener);
    };
}

function notifySavedRecipeListeners() {
    savedRecipeListeners.forEach((listener) => listener());
}

export function getSavedRecipes(): Recipe[] {
    const storedRecipes = localStorage.getItem("saved-recipes");

    if (storedRecipes === cachedSavedRecipesJson) {
        return cachedSavedRecipes;
    }

    cachedSavedRecipesJson = storedRecipes;

    if (!storedRecipes) {
        cachedSavedRecipes = EMPTY_SAVED_RECIPES;
        return cachedSavedRecipes;
    }

    cachedSavedRecipes = JSON.parse(storedRecipes);

    return cachedSavedRecipes;
}

export function addSavedRecipe(recipe: Recipe) {
    const currentRecipes = getSavedRecipes();
    const updatedRecipes = [...currentRecipes, recipe];
    localStorage.setItem("saved-recipes", JSON.stringify(updatedRecipes));
    notifySavedRecipeListeners();
}

export function updateSavedRecipe(updatedRecipe: Recipe) {
    const currentRecipes = getSavedRecipes();

    const recipeAlreadySaved = currentRecipes.some(
        (recipe) => recipe.slug === updatedRecipe.slug
    );
    if (!recipeAlreadySaved) {
        const updatedRecipes = [...currentRecipes, updatedRecipe];
        localStorage.setItem("saved-recipes", JSON.stringify(updatedRecipes));
        notifySavedRecipeListeners();
        return;
    }
    const updatedRecipes = currentRecipes.map((recipe) =>
        recipe.slug === updatedRecipe.slug
            ? updatedRecipe
            : recipe
    );
    localStorage.setItem("saved-recipes", JSON.stringify(updatedRecipes));
    notifySavedRecipeListeners();
}

export function deleteSavedRecipe(slug: string) {
    const currentRecipes = getSavedRecipes();

    const updatedRecipes = currentRecipes.filter(
        (recipe) => recipe.slug !== slug
    );

    localStorage.setItem("saved-recipes", JSON.stringify(updatedRecipes));
    notifySavedRecipeListeners();
}