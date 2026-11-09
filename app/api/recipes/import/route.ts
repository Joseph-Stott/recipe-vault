import prisma from "@/lib/prisma";
import { parseImportedRecipeRequest } from "@/lib/recipeRequest";
import { Recipe } from "@/types/recipe";

export async function POST(request: Request) {
    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return Response.json(
            { error: "Request body must be valid JSON" },
            { status: 400 }
        );
    }

    if (typeof body !== "object" || body === null || Array.isArray(body) ||
        !("recipes" in body) || !Array.isArray(body.recipes)) {
        return Response.json(
            { error: "Recipes are required" },
            { status: 400 }
        );
    }

    const recipesBySlug = new Map<string, Recipe>();
    for (const candidate of body.recipes) {
        // Preserve the migration bridge's skip policy for records without an identity.
        if (typeof candidate !== "object" || candidate === null ||
            !("slug" in candidate) || typeof candidate.slug !== "string" || !candidate.slug.trim()) continue;
        const validation = parseImportedRecipeRequest(candidate);
        if (validation.error !== undefined) {
            return Response.json(
                { error: `Invalid recipe "${candidate.slug}": ${validation.error}` },
                { status: 400 }
            );
        }
        recipesBySlug.set(validation.recipe.slug, validation.recipe);
    }
    const uniqueRecipes = [...recipesBySlug.values()];

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
                return tx.recipe.create({
                    data: {
                        slug: recipe.slug,
                        title: recipe.title.trim(),
                        timeCategory: recipe.timeCategory,
                        cookBook: recipe.cookBook?.trim() || null,
                        pageNumber: recipe.pageNumber ?? null,
                        cookInstructions: recipe.cookInstructions ?? [],
                        ingredients: {
                            create: recipe.structuredIngredients.map((ingredient) => ({
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
