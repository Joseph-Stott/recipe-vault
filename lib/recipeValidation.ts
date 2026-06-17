import { Ingredient } from "@/types/recipe";

type RecipeValidationInput = {
    title: string;
    structuredIngredients: Ingredient[];
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

    const filteredStructuredIngredients = input.structuredIngredients.filter(
        (ingredient) =>
            ingredient.amount !== "" ||
            ingredient.unit.trim() !== "" ||
            ingredient.name.trim() !== ""
    );

    if (filteredStructuredIngredients.length === 0) {
        messages.push("At least one ingredient is required");
    }

    return {
        valid: messages.length === 0,
        messages,
        filteredIngredients: filteredStructuredIngredients,
    };
}