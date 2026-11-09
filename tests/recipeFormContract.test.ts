import { describe, expect, it } from "vitest";
import { validateRecipeForm } from "@/lib/recipeValidation";
import { buildRecipeFromForm } from "@/lib/recipeService";
import { parseCreateRecipeRequest } from "@/lib/recipeRequest";

describe("recipe form to API contract", () => {
    it.each(["1", "0.5", " 2.25 "])("converts typed amount %s to an API-compatible number", (amount) => {
        const draft = [{ amount, unit: "cup", name: "rice" }];
        const validation = validateRecipeForm({ title: "Rice", structuredIngredients: draft });
        expect(validation.valid).toBe(true);
        const recipe = buildRecipeFromForm({
            slug: "rice", title: "Rice", timeCategory: "fast",
            structuredIngredients: validation.filteredIngredients,
            cookInstructionsText: "Cook rice", cookBook: "", pageNumber: " ",
        });
        expect(recipe.structuredIngredients[0].amount).toBe(Number(amount));
        expect(recipe.pageNumber).toBeUndefined();
        expect(parseCreateRecipeRequest(JSON.parse(JSON.stringify(recipe))).error).toBeUndefined();
        expect(draft[0].amount).toBe(amount);
    });

    it.each(["abc", "1/2", "-1", "Infinity", "1e999", " "])("rejects invalid typed amount %s", (amount) => {
        expect(validateRecipeForm({ title: "Rice", structuredIngredients: [{ amount, unit: "cup", name: "rice" }] }).valid).toBe(false);
    });

    it.each(["-1", "0", "1.5", "no", "2147483648"])("rejects invalid cookbook page %s", (pageNumber) => {
        expect(validateRecipeForm({ title: "Rice", pageNumber,
            structuredIngredients: [{ amount: 1, unit: "cup", name: "rice" }] }).valid).toBe(false);
    });
});
