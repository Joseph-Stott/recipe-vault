import prisma from "@/lib/prisma";
import { Ingredient, Recipe } from "@/types/recipe";
import { validateRecipeForm } from "@/lib/recipeValidation";

type UpdateRecipeRequest = {
    title: string;
    timeCategory: Recipe["timeCategory"];
    structuredIngredients: Ingredient[];
    cookInstructions?: string[];
    cookBook?: string;
    pageNumber?: number;
};

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
    const body: UpdateRecipeRequest = await request.json();

    const validation = validateRecipeForm({
        title: body.title ?? "",
        structuredIngredients: body.structuredIngredients ?? [],
        currentSlug: slug,
    });

    if (!validation.valid) {
        return Response.json(
            { error: validation.messages.join(" ") },
            { status: 400 }
        );
    }

    if (!["fast", "medium", "slow"].includes(body.timeCategory)) {
        return Response.json(
            { error: "Invalid time category" },
            { status: 400 }
        );
    }

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
                create: validation.filteredIngredients.map((ingredient) => ({
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
