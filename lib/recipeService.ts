import { recipes } from "@/data/recipes";
import { Recipe, Ingredient } from "@/types/recipe";
import { getIngredientNames, getRecipeIngredientMatchCount } from "@/lib/recipeUtils";

// Combines saved recipes with built-in recipes.
// Saved recipes are placed first so edited recipes override
// built-in recipes with matching slugs.
export function getAllRecipes(savedRecipes: Recipe[]) {
    const mergedRecipes = [...savedRecipes, ...recipes];

    return mergedRecipes.filter((recipe, index, array) =>
        array.findIndex((currentRecipe) => currentRecipe.slug === recipe.slug) === index
    );
}

// Filters recipes by title, time category, or ingredient name.
// Search text is trimmed and lowercased so extra spaces and capitalization do not affect results.
export function filterRecipesBySearch(recipesToFilter: Recipe[], searchText: string) {
    const normalizedSearch = searchText.trim().toLowerCase();

    return recipesToFilter.filter((recipe) => (
        recipe.title.toLowerCase().includes(normalizedSearch) ||
        recipe.timeCategory.toLowerCase().includes(normalizedSearch) ||
        getIngredientNames(recipe).some((ingredient) =>
            ingredient.toLowerCase().includes(normalizedSearch)
        )
    ));
}

// Returns recipes marked as favorites that are not already
// displayed in the grocery recipes section.
export function getFavoriteRecipes(
    recipes: Recipe[],
    favoriteRecipeSlugs: string[],
    groceryRecipeSlugs: string[]
) {
    return recipes.filter(
        (recipe) =>
            favoriteRecipeSlugs.includes(recipe.slug) &&
            !groceryRecipeSlugs.includes(recipe.slug)
    );
}

// Returns recipes that have been added to the grocery list section.
export function getGroceryRecipes(
    recipes: Recipe[],
    groceryRecipeSlugs: string[]
) {
    return recipes.filter((recipe) =>
        groceryRecipeSlugs.includes(recipe.slug)
    );
}

// Returns recipes that are not already displayed in the grocery
// or favorite sections, preventing duplicate cards on the homepage.
export function getMainRecipes(
    recipes: Recipe[],
    favoriteRecipeSlugs: string[],
    groceryRecipeSlugs: string[]
) {
    return recipes.filter(
        (recipe) =>
            !favoriteRecipeSlugs.includes(recipe.slug) &&
            !groceryRecipeSlugs.includes(recipe.slug)
    );
}

// Sorts recipes from highest to lowest based on how many
// ingredient names match items currently in the grocery list.
export function sortRecipesByIngredientMatches(
    recipes: Recipe[],
    groceryIngredients: string[]
) {
    return [...recipes].sort((a, b) => {
        const aIngredientMatches = getRecipeIngredientMatchCount(
            a,
            groceryIngredients
        );

        const bIngredientMatches = getRecipeIngredientMatchCount(
            b,
            groceryIngredients
        );

        return bIngredientMatches - aIngredientMatches;
    });
}

type HomeRecipeCollectionInput = {
    savedRecipes: Recipe[];
    searchText: string;
    favoriteRecipeSlugs: string[];
    groceryRecipeSlugs: string[];
    groceryIngredients: string[];
};

// Builds the recipe collections displayed across the homepage.
// Keeping these related rules together ensures every homepage section
// uses the same filtering, exclusion, and sorting behavior.
export function buildHomeRecipeCollections(
    input: HomeRecipeCollectionInput
) {
    const allRecipes = getAllRecipes(input.savedRecipes);

    const filteredRecipes = filterRecipesBySearch(
        allRecipes,
        input.searchText
    );

    const groceryRecipes = getGroceryRecipes(
        filteredRecipes,
        input.groceryRecipeSlugs
    );

    const favoriteRecipes = getFavoriteRecipes(
        filteredRecipes,
        input.favoriteRecipeSlugs,
        input.groceryRecipeSlugs
    );

    const sortedFavoriteRecipes = sortRecipesByIngredientMatches(
        favoriteRecipes,
        input.groceryIngredients
    );

    const mainRecipes = getMainRecipes(
        filteredRecipes,
        input.favoriteRecipeSlugs,
        input.groceryRecipeSlugs
    );

    const sortedRecipes = sortRecipesByIngredientMatches(
        mainRecipes,
        input.groceryIngredients
    );

    return {
        allRecipes,
        filteredRecipes,
        groceryRecipes,
        sortedFavoriteRecipes,
        sortedRecipes,
    };
}

type RecipeFormValues = {
    slug: string;
    title: string;
    timeCategory: Recipe["timeCategory"];
    structuredIngredients: Ingredient[];
    cookInstructionsText: string;
    cookBook: string;
    pageNumber: string;
};

// Converts form state into a Recipe object before saving.
// This keeps Add and Edit pages from duplicating recipe-building logic.
export function buildRecipeFromForm(values: RecipeFormValues): Recipe {
    return {
        slug: values.slug,
        title: values.title,
        timeCategory: values.timeCategory,
        structuredIngredients: values.structuredIngredients,
        cookInstructions: values.cookInstructionsText.trim()
            ? values.cookInstructionsText
                .split("\n")
                .map((instruction) => instruction.trim())
                .filter((instruction) => instruction !== "")
            : undefined,
        cookBook: values.cookBook,
        pageNumber: values.pageNumber ? Number(values.pageNumber) : undefined,
    };
}