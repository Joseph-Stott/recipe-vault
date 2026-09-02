import prisma from "@/lib/prisma";
import { validateRecipeForm } from "@/lib/recipeValidation";
import { Recipe } from "@/types/recipe";

type ImportRecipesRequest = {
    recipes?: unknown[];
};

export async function POST(request: Request) {
    const body: ImportRecipesRequest = await request.json();

    if (!Array.isArray(body.recipes)) {
        return Response.json(
            { error: "Recipes are required" },
            { status: 400 }
        );
    }

    const uniqueRecipes = Array.from(
        new Map(
            body.recipes
                .filter((recipe): recipe is Recipe => {
                    const candidate = recipe as Partial<Recipe> | null;

                    return (
                        !!candidate &&
                        typeof candidate.slug === "string" &&
                        candidate.slug.trim() !== ""
                    );
                })
                .map((recipe) => [
                    recipe.slug,
                    recipe,
                ])
        ).values()
    );

    for (const recipe of uniqueRecipes) {
        const validation = validateRecipeForm({
            title: recipe.title ?? "",
            structuredIngredients: recipe.structuredIngredients ?? [],
        });

        if (!validation.valid) {
            const recipeLabel = recipe.title?.trim() || recipe.slug;

            return Response.json(
                {
                    error: `Invalid recipe "${recipeLabel}": ${validation.messages.join(" ")}`,
                },
                { status: 400 }
            );
        }

        if (!["fast", "medium", "slow"].includes(recipe.timeCategory)) {
            return Response.json(
                {
                    error: `Invalid recipe "${recipe.title}": Invalid time category`,
                },
                { status: 400 }
            );
        }
    }

    const createdRecipes = await prisma.$transaction(async (tx) => {
        const existingRecipes = await tx.recipe.findMany({
            where: {
                slug: {
                    in: uniqueRecipes.map((recipe) => recipe.slug),
                },
            },
            select: {
                slug: true,
            },
        });

        const existingSlugs = new Set(
            existingRecipes.map((recipe) => recipe.slug)
        );

        const recipesToImport = uniqueRecipes.filter(
            (recipe) => !existingSlugs.has(recipe.slug)
        );

        return Promise.all(
            recipesToImport.map((recipe) => {
                const validation = validateRecipeForm({
                    title: recipe.title,
                    structuredIngredients: recipe.structuredIngredients,
                });

                return tx.recipe.create({
                    data: {
                        slug: recipe.slug,
                        title: recipe.title.trim(),
                        timeCategory: recipe.timeCategory,
                        cookBook: recipe.cookBook?.trim() || null,
                        pageNumber: recipe.pageNumber ?? null,
                        cookInstructions: recipe.cookInstructions ?? [],
                        ingredients: {
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
            })
        );
    });

    return Response.json({
        importedCount: createdRecipes.length,
        skippedCount: uniqueRecipes.length - createdRecipes.length,
        recipes: createdRecipes,
    });
}
