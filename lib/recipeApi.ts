import { Recipe } from "@/types/recipe";
import { mapDatabaseRecipeToRecipe } from "@/lib/databaseRecipe";

type DatabaseRecipe = Parameters<
    typeof mapDatabaseRecipeToRecipe
>[0];

export async function getDatabaseRecipes(): Promise<Recipe[]> {
    const response = await fetch("/api/recipes");

    if (!response.ok) {
        throw new Error("Failed to load recipes");
    }

    const recipes: DatabaseRecipe[] = await response.json();

    return recipes.map(mapDatabaseRecipeToRecipe);
}