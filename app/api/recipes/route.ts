import prisma from "@/lib/prisma";
import { parseCreateRecipeRequest } from "@/lib/recipeRequest";

export async function GET() {
    const recipes = await prisma.recipe.findMany({
        include: {
            ingredients: true,
        },
    });

    return Response.json(recipes);
}

export async function POST(request: Request) {
    const input: unknown = await request.json();
    const validation = parseCreateRecipeRequest(input);
    if (validation.error !== undefined) {
        return Response.json({ error: validation.error }, { status: 400 });
    }
    const body = validation.recipe;

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
