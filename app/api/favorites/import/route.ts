import prisma from "@/lib/prisma";

type ImportFavoritesRequest = {
    recipeSlugs?: unknown[];
};

async function getFavoriteRecipeSlugs() {
    const favorites = await prisma.favoriteRecipe.findMany({
        orderBy: {
            id: "asc",
        },
        select: {
            recipeSlug: true,
        },
    });

    return favorites.map((favorite) => favorite.recipeSlug);
}

export async function POST(request: Request) {
    const body: ImportFavoritesRequest = await request.json();

    if (!Array.isArray(body.recipeSlugs)) {
        return Response.json(
            { error: "Favorite recipe slugs are required" },
            { status: 400 }
        );
    }

    const uniqueRecipeSlugs = Array.from(
        new Set(
            body.recipeSlugs
                .filter((recipeSlug): recipeSlug is string =>
                    typeof recipeSlug === "string" &&
                    recipeSlug.trim() !== ""
                )
                .map((recipeSlug) => recipeSlug.trim())
        )
    );

    const [recipes, favorites] = await prisma.$transaction([
        prisma.recipe.findMany({
            where: {
                slug: {
                    in: uniqueRecipeSlugs,
                },
            },
            select: {
                slug: true,
            },
        }),
        prisma.favoriteRecipe.findMany({
            where: {
                recipeSlug: {
                    in: uniqueRecipeSlugs,
                },
            },
            select: {
                recipeSlug: true,
            },
        }),
    ]);

    const existingRecipeSlugs = new Set(
        recipes.map((recipe) => recipe.slug)
    );

    const existingFavoriteSlugs = new Set(
        favorites.map((favorite) => favorite.recipeSlug)
    );

    const favoriteSlugsToImport = uniqueRecipeSlugs.filter(
        (recipeSlug) =>
            existingRecipeSlugs.has(recipeSlug) &&
            !existingFavoriteSlugs.has(recipeSlug)
    );

    if (favoriteSlugsToImport.length > 0) {
        await prisma.favoriteRecipe.createMany({
            data: favoriteSlugsToImport.map((recipeSlug) => ({
                recipeSlug,
            })),
        });
    }

    return Response.json({
        favoriteRecipeSlugs: await getFavoriteRecipeSlugs(),
    });
}
