import { Ingredient, IngredientDraft } from "@/types/recipe";
import { createSlug } from "@/lib/recipeUtils";

type RecipeValidationInput = {
    title: string;
    structuredIngredients: IngredientDraft[];
    pageNumber?: string;
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

    const ingredients: Ingredient[] = input.structuredIngredients.map((ingredient) => ({
        ...ingredient,
        amount: typeof ingredient.amount === "string" && !ingredient.amount.trim()
            ? ""
            : Number(ingredient.amount),
    }));

    if (ingredients.some(({ amount }) => amount !== "" && (!Number.isFinite(amount) || amount < 0))) {
        messages.push("Ingredient amounts must be non-negative numbers (use decimals, such as 0.5)");
    }

    if (input.pageNumber?.trim()) {
        const page = Number(input.pageNumber);
        if (!Number.isInteger(page) || page < 1 || page > 2_147_483_647) {
            messages.push("Page number must be an integer between 1 and 2147483647");
        }
    }

    const completeIngredients = ingredients.filter(
        (ingredient) =>
            ingredient.amount !== "" &&
            ingredient.unit.trim() !== "" &&
            ingredient.name.trim() !== ""
    );

    const partialIngredients = ingredients.filter((ingredient) => {
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
