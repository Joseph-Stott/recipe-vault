import prisma from "@/lib/prisma";
import { parseUpdateRecipeRequest } from "@/lib/recipeRequest";

type RecipeRouteContext = {
    params: Promise<{
        slug: string;
    }>;
};

export async function PUT(
    request: Request,
    context: RecipeRouteContext
) {
    const { slug } = await context.params;
    let input: unknown;
    try {
        input = await request.json();
    } catch {
        return Response.json(
            { error: "Request body must be valid JSON" },
            { status: 400 }
        );
    }

    const validation = parseUpdateRecipeRequest(input, slug);
    if (validation.error !== undefined) {
        return Response.json(
            { error: validation.error },
            { status: 400 }
        );
    }

    const body = validation.recipe;

    const existingRecipe = await prisma.recipe.findUnique({
        where: {
            slug,
        },
        select: {
            id: true,
        },
    });

    if (!existingRecipe) {
        return Response.json(
            { error: "Recipe not found" },
            { status: 404 }
        );
    }

    const recipe = await prisma.recipe.update({
        where: {
            slug,
        },
        data: {
            title: body.title.trim(),
            timeCategory: body.timeCategory,
            cookBook: body.cookBook?.trim() || null,
            pageNumber: body.pageNumber ?? null,
            cookInstructions: body.cookInstructions ?? [],
            ingredients: {
                deleteMany: {},
                create: body.structuredIngredients.map((ingredient) => ({
                    amount:
                        ingredient.amount === ""
                            ? null
                            : ingredient.amount,
                    unit: ingredient.unit.trim(),
                    name: ingredient.name.trim(),
                })),
            },
        },
        include: {
            ingredients: true,
        },
    });

    return Response.json(recipe);
}

export async function DELETE(
    _request: Request,
    context: RecipeRouteContext
) {
    const { slug } = await context.params;

    const existingRecipe = await prisma.recipe.findUnique({
        where: {
            slug,
        },
        select: {
            id: true,
        },
    });

    if (!existingRecipe) {
        return Response.json(
            { error: "Recipe not found" },
            { status: 404 }
        );
    }

    await prisma.recipe.delete({
        where: {
            slug,
        },
    });

    return Response.json({
        success: true,
    });
}
