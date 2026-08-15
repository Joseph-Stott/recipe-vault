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

    const recipe = await prisma.recipe.create({
        data: {
            slug: body.slug,
            title: body.title,
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