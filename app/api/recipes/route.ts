import prisma from "@/lib/prisma";

export async function GET() {
    const recipes = await prisma.recipe.findMany({
        include: {
            ingredients: true,
        },
    });

    return Response.json(recipes);
}