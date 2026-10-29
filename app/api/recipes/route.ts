import prisma from "@/lib/prisma";
import { parseCreateRecipeRequest } from "@/lib/recipeRequest";
import { Prisma } from "@/lib/generated/prisma/client";

export async function GET() {
    const recipes = await prisma.recipe.findMany({
        include: {
            ingredients: true,
        },
    });

    return Response.json(recipes);
}

export async function POST(request: Request) {
    let input: unknown;
    try {
        input = await request.json();
    } catch {
        return Response.json({ error: "Request body must be valid JSON" }, { status: 400 });
    }
    const validation = parseCreateRecipeRequest(input);
    if (validation.error !== undefined) {
        return Response.json({ error: validation.error }, { status: 400 });
    }
    const body = validation.recipe;

    try {
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

        return Response.json(recipe, { status: 201 });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
            return Response.json({ error: "A recipe with this slug already exists" }, { status: 409 });
        }
        console.error("Failed to create recipe", error);
        return Response.json({ error: "Failed to create recipe" }, { status: 500 });
    }
}
