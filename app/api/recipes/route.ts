import prisma from "@/lib/prisma";
import { Ingredient, Recipe } from "@/types/recipe";

type CreateRecipeRequest = {
    slug: string;
    title: string;
    timeCategory: Recipe["timeCategory"];
    structuredIngredients: Ingredient[];
    cookInstructions?: string[];
    cookBook?: string;
    pageNumber?: number;
};

export async function GET() {
    const recipes = await prisma.recipe.findMany({
        include: {
            ingredients: true,
        },
    });

    return Response.json(recipes);
}

export async function POST(request: Request) {
    const body: CreateRecipeRequest = await request.json();

    if (!body.title?.trim()) {
        return Response.json(
            { error: "Recipe title is required" },
            { status: 400 }
        );
    }

    if (!body.slug?.trim()) {
        return Response.json(
            { error: "Recipe slug is required" },
            { status: 400 }
        );
    }

    if (!["fast", "medium", "slow"].includes(body.timeCategory)) {
        return Response.json(
            { error: "Invalid time category" },
            { status: 400 }
        );
    }

    if (
        !Array.isArray(body.structuredIngredients) ||
        body.structuredIngredients.length === 0
    ) {
        return Response.json(
            { error: "At least one ingredient is required" },
            { status: 400 }
        );
    }

    const recipe = await prisma.recipe.create({
        data: {
            slug: body.slug,
            title: body.title.trim(),
            timeCategory: body.timeCategory,
            cookBook: body.cookBook,
            pageNumber: body.pageNumber,
            cookInstructions: body.cookInstructions ?? [],
            ingredients: {
                create: body.structuredIngredients.map((ingredient) => ({
                    amount:
                        ingredient.amount === ""
                            ? null
                            : ingredient.amount,
                    unit: ingredient.unit,
                    name: ingredient.name,
                })),
            },
        },
        include: {
            ingredients: true,
        },
    });

    return Response.json(recipe, {
        status: 201,
    });
}