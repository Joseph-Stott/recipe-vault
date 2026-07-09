import { recipes } from "@/data/recipes";
import { Recipe, Ingredient } from "@/types/recipe";

// Combines saved recipes with built-in recipes.
// Saved recipes are placed first so edited recipes override
// built-in recipes with matching slugs.
export function getAllRecipes(savedRecipes: Recipe[]) {
    const mergedRecipes = [...savedRecipes, ...recipes];

    return mergedRecipes.filter((recipe, index, array) =>
        array.findIndex((currentRecipe) => currentRecipe.slug === recipe.slug) === index
    );
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