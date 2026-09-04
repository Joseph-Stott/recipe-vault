import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";
import { recipes } from "../data/recipes";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error("DATABASE_URL is not defined");
}

const prisma = new PrismaClient({
    adapter: new PrismaPg({
        connectionString,
    }),
});

async function main() {
    const existingRecipes = await prisma.recipe.findMany({
        where: {
            slug: {
                in: recipes.map((recipe) => recipe.slug),
            },
        },
        select: {
            slug: true,
        },
    });

    const existingSlugs = new Set(
        existingRecipes.map((recipe) => recipe.slug)
    );

    const recipesToSeed = recipes.filter(
        (recipe) => !existingSlugs.has(recipe.slug)
    );

    if (recipesToSeed.length === 0) {
        console.log("Seeded 0 starter recipes.");
        return;
    }

    await prisma.$transaction(
        recipesToSeed.map((recipe) =>
            prisma.recipe.create({
                data: {
                    slug: recipe.slug,
                    title: recipe.title,
                    timeCategory: recipe.timeCategory,
                    cookBook: recipe.cookBook ?? null,
                    pageNumber: recipe.pageNumber ?? null,
                    cookInstructions: recipe.cookInstructions ?? [],
                    ingredients: {
                        create: recipe.structuredIngredients.map((ingredient) => ({
                            amount:
                                ingredient.amount === ""
                                    ? null
                                    : ingredient.amount,
                            unit: ingredient.unit,
                            name: ingredient.name,
                        })),
                    },
                },
            })
        )
    );

    console.log(
        `Seeded ${recipesToSeed.length} starter recipe${recipesToSeed.length === 1 ? "" : "s"}.`
    );
}

main()
    .finally(async () => {
        await prisma.$disconnect();
    });
