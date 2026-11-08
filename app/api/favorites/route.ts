import prisma from "@/lib/prisma";

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
    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return Response.json({ error: "Request body must be valid JSON" }, { status: 400 });
    }
    const recipeSlug = typeof body === "object" && body !== null && !Array.isArray(body) &&
        "recipeSlug" in body && typeof body.recipeSlug === "string"
        ? body.recipeSlug.trim()
        : "";

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
