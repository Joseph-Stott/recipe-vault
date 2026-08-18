import { Recipe } from "@/types/recipe";

type DatabaseRecipe = {
    slug: string;
    title: string;
    timeCategory: Recipe["timeCategory"];
    cookBook: string | null;
    pageNumber: number | null;
    cookInstructions: string[];
    ingredients: {
        amount: string | null;
        unit: string;
        name: string;
    }[];
};

export function mapDatabaseRecipeToRecipe(
    recipe: DatabaseRecipe
): Recipe {
    return {
        slug: recipe.slug,
        title: recipe.title,
        timeCategory: recipe.timeCategory,
        structuredIngredients: recipe.ingredients.map((ingredient) => ({
            amount:
                ingredient.amount === null
                    ? ""
                    : Number(ingredient.amount),
            unit: ingredient.unit,
            name: ingredient.name,
        })),
        cookInstructions:
            recipe.cookInstructions.length > 0
                ? recipe.cookInstructions
                : undefined,
        cookBook: recipe.cookBook ?? undefined,
        pageNumber: recipe.pageNumber ?? undefined,
    };
}