import { Ingredient } from "@/types/recipe";
import { createSlug } from "@/lib/recipeUtils";

type RecipeValidationInput = {
    title: string;
    structuredIngredients: Ingredient[];
    existingSlugs?: string[];
    currentSlug?: string;
};

type RecipeValidationResult = {
    valid: boolean;
    messages: string[];
    filteredIngredients: Ingredient[];
};

export function validateRecipeForm(input: RecipeValidationInput): RecipeValidationResult {
    const messages: string[] = [];

    if (!input.title.trim()) {
        messages.push("Recipe title is required");
    }

    const slug = createSlug(input.title);

    if (!slug) {
        messages.push("Recipe title must contain letters or numbers");
    }

    const slugAlreadyExists = input.existingSlugs?.some(
        (existingSlug) =>
            existingSlug === slug &&
            existingSlug !== input.currentSlug
    );

    if (slugAlreadyExists) {
        messages.push("A recipe with this title already exists");
    }

    const completeIngredients = input.structuredIngredients.filter(
        (ingredient) =>
            ingredient.amount !== "" &&
            ingredient.unit.trim() !== "" &&
            ingredient.name.trim() !== ""
    );

    const partialIngredients = input.structuredIngredients.filter((ingredient) => {
        const hasAmount = ingredient.amount !== "";
        const hasUnit = ingredient.unit.trim() !== "";
        const hasName = ingredient.name.trim() !== "";

        const hasAnyField = hasAmount || hasUnit || hasName;
        const hasAllFields = hasAmount && hasUnit && hasName;

        return hasAnyField && !hasAllFields;
    });

    if (completeIngredients.length === 0) {
        messages.push("At least one complete ingredient is required");
    }

    if (partialIngredients.length > 0) {
        messages.push("Ingredient rows must include amount, unit, and name");
    }

    return {
        valid: messages.length === 0,
        messages,
        filteredIngredients: completeIngredients,
    };
}