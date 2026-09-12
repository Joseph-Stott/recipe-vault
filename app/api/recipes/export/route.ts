import prisma from "@/lib/prisma";
import { mapDatabaseRecipeToRecipe } from "@/lib/databaseRecipe";

export async function GET() {
    const [databaseRecipes, favorites] = await Promise.all([
        prisma.recipe.findMany({
            orderBy: {
                title: "asc",
            },
            include: {
                ingredients: true,
            },
        }),
        prisma.favoriteRecipe.findMany({
            orderBy: {
                id: "asc",
            },
            select: {
                recipeSlug: true,
            },
        }),
    ]);

    const recipes = databaseRecipes.map((recipe) =>
        mapDatabaseRecipeToRecipe({
            ...recipe,
            ingredients: recipe.ingredients.map((ingredient) => ({
                amount: ingredient.amount?.toString() ?? null,
                unit: ingredient.unit,
                name: ingredient.name,
            })),
        })
    );

    const backup = {
        app: "recipe-vault",
        exportedAt: new Date().toISOString(),
        recipeCount: recipes.length,
        favoriteRecipeSlugs: favorites.map(
            (favorite) => favorite.recipeSlug
        ),
        recipes,
    };

    const filenameDate = new Date()
        .toISOString()
        .slice(0, 10);

    return Response.json(backup, {
        headers: {
            "Content-Disposition":
                `attachment; filename="recipe-vault-backup-${filenameDate}.json"`,
        },
    });
}
