import prisma from "@/lib/prisma";

type ToggleFavoriteRequest = {
    recipeSlug?: string;
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

export async function GET() {
    return Response.json({
        favoriteRecipeSlugs: await getFavoriteRecipeSlugs(),
    });
}

export async function POST(request: Request) {
    const body: ToggleFavoriteRequest = await request.json();
    const recipeSlug = body.recipeSlug?.trim();

    if (!recipeSlug) {
        return Response.json(
            { error: "Recipe slug is required" },
            { status: 400 }
        );
    }

    const recipe = await prisma.recipe.findUnique({
        where: {
            slug: recipeSlug,
        },
        select: {
            slug: true,
        },
    });

    if (!recipe) {
        return Response.json(
            { error: "Recipe not found" },
            { status: 404 }
        );
    }

    const favorite = await prisma.favoriteRecipe.findUnique({
        where: {
            recipeSlug,
        },
        select: {
            id: true,
        },
    });

    if (favorite) {
        await prisma.favoriteRecipe.delete({
            where: {
                recipeSlug,
            },
        });
    } else {
        await prisma.favoriteRecipe.create({
            data: {
                recipeSlug,
            },
        });
    }

    return Response.json({
        favoriteRecipeSlugs: await getFavoriteRecipeSlugs(),
    });
}
