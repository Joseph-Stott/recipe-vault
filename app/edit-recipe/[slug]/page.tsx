"use client";

import {
    useEffect,
    useState,
    useSyncExternalStore,
} from "react";
import { Ingredient, Recipe } from "@/types/recipe";
import { useParams, useRouter } from "next/navigation";
import {
    deleteSavedRecipe,
    getSavedRecipes,
    subscribeToSavedRecipes,
    updateSavedRecipe,
} from "@/lib/recipeStorage";
import RecipeForm from "@/components/RecipeForm";
import {
    buildRecipeFromForm,
    getAllRecipes,
} from "@/lib/recipeService";
import { validateRecipeForm } from "@/lib/recipeValidation";
import { getDatabaseRecipes } from "@/lib/recipeApi";

const EMPTY_SAVED_RECIPES: ReturnType<typeof getSavedRecipes> = [];

type EditRecipeFormProps = {
    recipe: Recipe;
    allRecipes: Recipe[];
};

export default function EditRecipePage() {
    const params = useParams();

    const savedRecipes = useSyncExternalStore(
        subscribeToSavedRecipes,
        getSavedRecipes,
        () => EMPTY_SAVED_RECIPES
    );

    const [databaseRecipes, setDatabaseRecipes] = useState<Recipe[]>([]);
    const [databaseRecipesLoaded, setDatabaseRecipesLoaded] =
        useState(false);

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

    const combinedSavedRecipes = Array.from(
        new Map(
            [...savedRecipes, ...databaseRecipes].map((recipe) => [
                recipe.slug,
                recipe,
            ])
        ).values()
    );

    const allRecipes = getAllRecipes(combinedSavedRecipes);

    const recipe = allRecipes.find(
        (recipe) => recipe.slug === params.slug
    );

    if (!recipe && !databaseRecipesLoaded) {
        return (
            <p className="text-center text-xl text-zinc-400">
                Loading recipe...
            </p>
        );
    }

    if (!recipe) {
        return (
            <p className="text-center text-xl text-zinc-400">
                Recipe not found
            </p>
        );
    }

    return (
        <EditRecipeForm
            key={recipe.slug}
            recipe={recipe}
            allRecipes={allRecipes}
        />
    );
}

function EditRecipeForm({
    recipe,
    allRecipes,
}: EditRecipeFormProps) {
    const router = useRouter();

    const [title, setTitle] = useState(recipe.title);

    const [timeCategory, setTimeCategory] =
        useState<Recipe["timeCategory"]>(recipe.timeCategory);

    const [structuredIngredients, setStructuredIngredients] =
        useState<Ingredient[]>(
            recipe.structuredIngredients || []
        );

    const [cookInstructionsText, setCookInstructionsText] =
        useState(
            recipe.cookInstructions
                ? recipe.cookInstructions.join("\n")
                : ""
        );

    const [cookBook, setCookBook] = useState(
        recipe.cookBook || ""
    );

    const [pageNumber, setPageNumber] = useState(
        recipe.pageNumber
            ? recipe.pageNumber.toString()
            : ""
    );

    const [errorMessages, setErrorMessages] =
        useState<string[]>([]);

    return (
        <main className="flex min-h-screen flex-col items-center justify-start bg-zinc-50 px-6 py-16 font-sans dark:bg-black">
            <div className="relative flex w-full max-w-sm flex-col gap-4 rounded-2xl border border-zinc-700 bg-zinc-900 p-4 text-center">
                <h1 className="flex items-center justify-center">
                    Edit a Recipe
                </h1>

                <button
                    title="Delete recipe"
                    aria-label="Delete recipe"
                    className={`
                        absolute right-4 top-4 cursor-pointer text-base
                        transition-all duration-300
                        hover:scale-125
                    `}
                    onClick={() => {
                        const confirmed = confirm(
                            "Delete this recipe? This action cannot be undone."
                        );

                        if (!confirmed) {
                            return;
                        }

                        deleteSavedRecipe(recipe.slug);
                        router.refresh();
                        router.push("/");
                    }}
                >
                    🗑️
                </button>

                <RecipeForm
                    title={title}
                    setTitle={setTitle}
                    timeCategory={timeCategory}
                    setTimeCategory={setTimeCategory}
                    structuredIngredients={structuredIngredients}
                    setStructuredIngredients={
                        setStructuredIngredients
                    }
                    cookInstructionsText={cookInstructionsText}
                    setCookInstructionsText={
                        setCookInstructionsText
                    }
                    cookBook={cookBook}
                    setCookBook={setCookBook}
                    pageNumber={pageNumber}
                    setPageNumber={setPageNumber}
                    submitButtonText="Update Recipe"
                    onSubmit={() => {
                        const existingSlugs = allRecipes.map(
                            (recipe) => recipe.slug
                        );

                        const validation = validateRecipeForm({
                            title,
                            structuredIngredients,
                            existingSlugs,
                            currentSlug: recipe.slug,
                        });

                        if (!validation.valid) {
                            setErrorMessages(
                                validation.messages
                            );
                            return;
                        }

                        const newRecipe = buildRecipeFromForm({
                            slug: recipe.slug,
                            title,
                            timeCategory,
                            structuredIngredients:
                                validation.filteredIngredients,
                            cookInstructionsText,
                            cookBook,
                            pageNumber,
                        });

                        const confirmed = confirm(
                            "Save changes to this recipe?"
                        );

                        if (!confirmed) {
                            return;
                        }

                        updateSavedRecipe(newRecipe);
                        router.refresh();
                        router.push("/");
                    }}
                    errorMessages={errorMessages}
                    setErrorMessages={setErrorMessages}
                />
            </div>
        </main>
    );
}
