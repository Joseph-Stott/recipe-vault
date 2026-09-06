export async function getDatabaseFavoriteRecipeSlugs(): Promise<string[]> {
    const response = await fetch("/api/favorites");

    if (!response.ok) {
        throw new Error("Failed to load favorites");
    }

    const result: {
        favoriteRecipeSlugs: string[];
    } = await response.json();

    return result.favoriteRecipeSlugs;
}

export async function toggleDatabaseFavoriteRecipe(
    recipeSlug: string
): Promise<string[]> {
    const response = await fetch("/api/favorites", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            recipeSlug,
        }),
    });

    if (!response.ok) {
        throw new Error("Failed to update favorite");
    }

    const result: {
        favoriteRecipeSlugs: string[];
    } = await response.json();

    return result.favoriteRecipeSlugs;
}

export async function importDatabaseFavoriteRecipeSlugs(
    recipeSlugs: string[]
): Promise<string[]> {
    const response = await fetch("/api/favorites/import", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            recipeSlugs,
        }),
    });

    if (!response.ok) {
        throw new Error("Failed to import favorites");
    }

    const result: {
        favoriteRecipeSlugs: string[];
    } = await response.json();

    return result.favoriteRecipeSlugs;
}
