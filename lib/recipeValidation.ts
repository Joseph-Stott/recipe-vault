import { Ingredient } from "@/types/recipe";

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

    const slug = input.title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");

    const slugAlreadyExists = input.existingSlugs?.some(
        (existingSlug) =>
            existingSlug === slug &&
            existingSlug !== input.currentSlug
    );

    if (slugAlreadyExists) {
        messages.push("A recipe with this title already exists");
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