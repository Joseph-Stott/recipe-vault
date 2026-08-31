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

export async function updateDatabaseRecipe(
    recipe: Recipe
): Promise<Recipe> {
    const response = await fetch(`/api/recipes/${recipe.slug}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(recipe),
    });

    if (!response.ok) {
        throw new Error("Failed to update recipe");
    }

    const updatedRecipe: DatabaseRecipe = await response.json();

    return mapDatabaseRecipeToRecipe(updatedRecipe);
}

export async function deleteDatabaseRecipe(slug: string): Promise<void> {
    const response = await fetch(`/api/recipes/${slug}`, {
        method: "DELETE",
    });

    if (!response.ok) {
        throw new Error("Failed to delete recipe");
    }
}
