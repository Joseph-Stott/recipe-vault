import type { Recipe } from "@/types/recipe";
import { preserveLegacyData } from "@/lib/legacyRecovery";
import { isStoredRecipeList, parseBrowserValue, readBrowserValue } from "@/lib/browserStorage";

const EMPTY_SAVED_RECIPES: Recipe[] = [];

let cachedSavedRecipesJson: string | null | undefined;
let cachedSavedRecipes: Recipe[] = EMPTY_SAVED_RECIPES;

type SavedRecipeListener = () => void;

const savedRecipeListeners = new Set<SavedRecipeListener>();

export function subscribeToSavedRecipes(
    listener: SavedRecipeListener
) {
    savedRecipeListeners.add(listener);
    const onStorage = (event: StorageEvent) => {
        if (event.storageArea === localStorage &&
            (event.key === "saved-recipes" || event.key === null)) listener();
    };
    if (typeof window !== "undefined") window.addEventListener("storage", onStorage);

    return () => {
        savedRecipeListeners.delete(listener);
        if (typeof window !== "undefined") window.removeEventListener("storage", onStorage);
    };
}

function notifySavedRecipeListeners() {
    savedRecipeListeners.forEach((listener) => listener());
}

export function getSavedRecipes(): Recipe[] {
    const storedRecipes = readBrowserValue("saved-recipes");

    if (storedRecipes === cachedSavedRecipesJson) {
        return cachedSavedRecipes;
    }

    if (storedRecipes === null) {
        cachedSavedRecipes = EMPTY_SAVED_RECIPES;
        cachedSavedRecipesJson = storedRecipes;
        return cachedSavedRecipes;
    }

    cachedSavedRecipes = parseBrowserValue<Recipe[]>("saved-recipes", storedRecipes, isStoredRecipeList);
    cachedSavedRecipesJson = storedRecipes;

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

export function retireSavedRecipes(confirmedSlugs: readonly string[]) {
    const confirmed = new Set(confirmedSlugs);
    const current = getSavedRecipes();
    const migrated = current.filter((recipe) => confirmed.has(recipe.slug));
    if (migrated.length === 0) return;

    preserveLegacyData(migrated);
    localStorage.setItem("saved-recipes", JSON.stringify(
        current.filter((recipe) => !confirmed.has(recipe.slug))
    ));
    notifySavedRecipeListeners();
}
