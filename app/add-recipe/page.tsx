"use client";
import { useState } from "react";
import { getSavedRecipes } from "@/lib/recipeStorage";
import { Recipe, IngredientDraft } from "@/types/recipe";
import { useRouter } from "next/navigation";
import RecipeForm from "@/components/RecipeForm";
import { validateRecipeForm } from "@/lib/recipeValidation";
import { createSlug } from "@/lib/recipeUtils";
import { buildRecipeFromForm, getAllRecipes } from "@/lib/recipeService";
import {
    createDatabaseRecipe,
} from "@/lib/recipeApi";
import StatusPanel from "@/components/StatusPanel";
import { useDatabaseRecipes } from "@/hooks/useDatabaseRecipes";

export default function AddRecipePage() {
    const [title, setTitle] = useState("");
    const [timeCategory, setTimeCategory] = useState<Recipe["timeCategory"]>("medium");
    const [structuredIngredients, setStructuredIngredients] = useState<IngredientDraft[]>([
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
    const {
        databaseRecipes, databaseRecipesLoaded, databaseRecipeLoadError, recipeMigrationError,
    } = useDatabaseRecipes();
    const [isSaving, setIsSaving] = useState(false);

    const router = useRouter();



    return(
        <main className="flex min-h-screen flex-col items-center justify-start bg-black px-6 py-16 font-sans text-zinc-100">
            <div className="flex w-full max-w-sm flex-col gap-4 rounded-2xl border border-zinc-700 bg-zinc-900 p-4 text-center text-zinc-100">
                <h1 className="flex items-center justify-center">
                    Add a Recipe
                </h1>
                {!databaseRecipesLoaded && (
                    <StatusPanel title="Checking recipes">
                        Loading existing recipes before saving is enabled...
                    </StatusPanel>
                )}
                {databaseRecipeLoadError && (
                    <StatusPanel title="Cannot save yet" tone="error">
                        {databaseRecipeLoadError}
                    </StatusPanel>
                )}
                {recipeMigrationError && (
                    <StatusPanel title="Browser cleanup needs attention" tone="warning">
                        {recipeMigrationError}
                    </StatusPanel>
                )}
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
                        if (databaseRecipeLoadError) {
                            setErrorMessages([
                                "Recipes must load before a new recipe can be saved.",
                            ]);
                            return;
                        }

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
                            pageNumber,
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
                    submitDisabled={
                        isSaving ||
                        !databaseRecipesLoaded ||
                        Boolean(databaseRecipeLoadError)
                    }
                />
            </div>
        </main>
    )
}
