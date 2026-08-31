"use client";
import { useEffect, useState } from "react";
import { getSavedRecipes } from "@/lib/recipeStorage";
import { Recipe, Ingredient } from "@/types/recipe";
import { useRouter } from "next/navigation";
import RecipeForm from "@/components/RecipeForm";
import { validateRecipeForm } from "@/lib/recipeValidation";
import { createSlug } from "@/lib/recipeUtils";
import { buildRecipeFromForm, getAllRecipes } from "@/lib/recipeService";
import {
    createDatabaseRecipe,
    getDatabaseRecipes,
} from "@/lib/recipeApi";

export default function AddRecipePage() {
    const [title, setTitle] = useState("");
    const [timeCategory, setTimeCategory] = useState<Recipe["timeCategory"]>("medium");
    const [structuredIngredients, setStructuredIngredients] = useState<Ingredient[]>([
        {
            amount: "",
            unit: "",
            name: ""
        },
    ]);
    const [cookInstructionsText, setCookInstructionsText] = useState("");
    const [cookBook, setCookBook] = useState("");
    const [pageNumber, setPageNumber] = useState("");
    const [errorMessages, setErrorMessages] = useState<string[]>([]);
    const [databaseRecipes, setDatabaseRecipes] = useState<Recipe[]>([]);
    const [databaseRecipesLoaded, setDatabaseRecipesLoaded] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const router = useRouter();

    useEffect(() => {
        let cancelled = false;

        getDatabaseRecipes()
            .then((recipes) => {
                if (!cancelled) {
                    setDatabaseRecipes(recipes);
                }
            })
            .catch((error) => {
                console.error("Failed to load database recipes", error);
            })
            .finally(() => {
                if (!cancelled) {
                    setDatabaseRecipesLoaded(true);
                }
            });

        return () => {
            cancelled = true;
        };
    }, []);

    return(
        <main className="flex min-h-screen flex-col items-center justify-start bg-black px-6 py-16 font-sans text-zinc-100">
            <div className="flex w-full max-w-sm flex-col gap-4 rounded-2xl border border-zinc-700 bg-zinc-900 p-4 text-center text-zinc-100">
                <h1 className="flex items-center justify-center">
                    Add a Recipe
                </h1>
                <RecipeForm
                    title={title}
                    setTitle={setTitle}
                    timeCategory={timeCategory}
                    setTimeCategory={setTimeCategory}
                    structuredIngredients={structuredIngredients}
                    setStructuredIngredients={setStructuredIngredients}
                    cookInstructionsText={cookInstructionsText}
                    setCookInstructionsText={setCookInstructionsText}
                    cookBook={cookBook}
                    setCookBook={setCookBook}
                    pageNumber={pageNumber}
                    setPageNumber={setPageNumber}
                    submitButtonText="Add Recipe"
                    onSubmit={async () => {
                        const combinedSavedRecipes = Array.from(
                            new Map(
                                [
                                    ...getSavedRecipes(),
                                    ...databaseRecipes,
                                ].map((recipe) => [
                                    recipe.slug,
                                    recipe,
                                ])
                            ).values()
                        );

                        const existingSlugs = getAllRecipes(
                            combinedSavedRecipes
                        ).map(
                            (recipe) => recipe.slug
                        );

                        const validation = validateRecipeForm({
                            title,
                            structuredIngredients,
                            existingSlugs,
                        });

                        if (!validation.valid) {
                            setErrorMessages(validation.messages);
                            return;
                        }

                        const newSlug = createSlug(title);

                        const newRecipe = buildRecipeFromForm({
                            slug: newSlug,
                            title,
                            timeCategory,
                            structuredIngredients: validation.filteredIngredients,
                            cookInstructionsText,
                            cookBook,
                            pageNumber,
                        });

                        const confirmed = confirm("Add this recipe to your collection?");
                        if(!confirmed) {
                            return;
                        }

                        setIsSaving(true);
                        setErrorMessages([]);

                        try {
                            await createDatabaseRecipe(newRecipe);
                            router.push("/");
                        } catch (error) {
                            console.error(
                                "Failed to create recipe",
                                error
                            );
                            setErrorMessages([
                                "Failed to create recipe. Please try again.",
                            ]);
                        } finally {
                            setIsSaving(false);
                        }
                    }}
                    errorMessages={errorMessages}
                    setErrorMessages={setErrorMessages}
                    submitDisabled={isSaving || !databaseRecipesLoaded}
                />
            </div>
        </main>
    )
}
