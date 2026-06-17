"use client";
import { useState } from "react";
import { addSavedRecipe, getSavedRecipes } from "@/lib/recipeStorage";
import { Recipe, Ingredient } from "@/types/recipe";
import { useRouter } from "next/navigation";
import { recipes } from "@/data/recipes";
import RecipeForm from "@/components/RecipeForm";
import { validateRecipeForm } from "@/lib/recipeValidation";

function createSlug (title: string) {
    return title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
}

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

    const router = useRouter();

    return(
        <main className="flex min-h-screen flex-col items-center justify-start py-16 bg-zinc-50 px-6 font-sans dark:bg-black">
            <div className="w-full max-w-sm flex flex-col gap-4 rounded-2xl text-center border border-zinc-700 bg-zinc-900 p-4">
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
                    onSubmit={() => {
                        const existingSlugs = [...getSavedRecipes(), ...recipes].map(
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

                        const newRecipe = {
                            slug: newSlug,
                            title: title,
                            timeCategory: timeCategory,
                            structuredIngredients: validation.filteredIngredients,
                            cookInstructions: cookInstructionsText.trim()
                                ? cookInstructionsText
                                    .split("\n")
                                    .map((instruction) => instruction.trim())
                                    .filter((instruction) => instruction !== "")
                                : undefined,
                            cookBook: cookBook,
                            pageNumber: pageNumber ? Number(pageNumber) : undefined
                        };

                        const confirmed = confirm("Add to recipe list?");
                        if(!confirmed) {
                            return;
                        }
                        addSavedRecipe(newRecipe);
                        router.push("/");
                    }}
                    errorMessages={errorMessages}
                    setErrorMessages={setErrorMessages}
                />
            </div>
        </main>
    )
}