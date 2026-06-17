"use client";
import { useEffect, useState } from "react";
import { Recipe, Ingredient } from "@/types/recipe";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { getSavedRecipes, updateSavedRecipe, deleteSavedRecipe } from "@/lib/recipeStorage";
import RecipeForm from "@/components/RecipeForm";
import { getAllRecipes, buildRecipeFromForm } from "@/lib/recipeService";
import { validateRecipeForm } from "@/lib/recipeValidation";

export default function EditRecipePage() {
    const params = useParams();

    const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);
    const [title, setTitle] = useState("");
    const [timeCategory, setTimeCategory] = useState<Recipe["timeCategory"]>("medium");
    const [structuredIngredients, setStructuredIngredients] = useState<Ingredient[]>([]);
    const [cookInstructionsText, setCookInstructionsText] = useState("");
    const [cookBook, setCookBook] = useState("");
    const [pageNumber, setPageNumber] = useState("");
    const [errorMessages, setErrorMessages] = useState<string[]>([]);

    const allRecipes = getAllRecipes(savedRecipes);

    const recipe = allRecipes.find((recipe) => recipe.slug === params.slug);

    const router = useRouter();

    useEffect(() => {
        setSavedRecipes(getSavedRecipes());
    }, []);

    useEffect(() => {
        if (recipe) {
            setTitle(recipe.title);
            setTimeCategory(recipe.timeCategory);
            setStructuredIngredients(recipe.structuredIngredients || []);
            setCookInstructionsText(
            recipe.cookInstructions
                ? recipe.cookInstructions.join("\n")
                : ""
            );
            setCookBook(recipe.cookBook || "");
            setPageNumber(
            recipe.pageNumber
                ? recipe.pageNumber.toString()
                : ""
            );
        }
    }, [recipe]);

    return(
        <main className="flex min-h-screen flex-col items-center justify-start py-16 bg-zinc-50 px-6 font-sans dark:bg-black">
            <div className=" relative w-full max-w-sm flex flex-col gap-4 rounded-2xl text-center border border-zinc-700 bg-zinc-900 p-4">
                <h1 className="flex items-center justify-center">
                    Edit a Recipe
                </h1>
                <button
                    className={`
                        absolute right-4 top-4 cursor-pointer text-base
                        transition-all duration-300
                        hover:scale-125
                    `}
                    onClick={() => {
                        if (!recipe) {
                            setErrorMessages(["Recipe not found"]);
                            return;
                        }
                        const confirmed = confirm("Are you sure you want to delete this recipe?");
                        if (!confirmed){
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
                    setStructuredIngredients={setStructuredIngredients}
                    cookInstructionsText={cookInstructionsText}
                    setCookInstructionsText={setCookInstructionsText}
                    cookBook={cookBook}
                    setCookBook={setCookBook}
                    pageNumber={pageNumber}
                    setPageNumber={setPageNumber}
                    submitButtonText="Update Recipe"
                    onSubmit= {() => {
                        if (!recipe) {
                            setErrorMessages(["Recipe not found"]);
                            return;
                        }

                        const existingSlugs = allRecipes.map((recipe) => recipe.slug);
                        
                        const validation = validateRecipeForm({
                            title,
                            structuredIngredients,
                            existingSlugs,
                            currentSlug: recipe.slug,
                        });

                        if (!validation.valid) {
                            setErrorMessages(validation.messages);
                            return;
                        }

                        const newRecipe = buildRecipeFromForm({
                            slug: recipe.slug,
                            title,
                            timeCategory,
                            structuredIngredients: validation.filteredIngredients,
                            cookInstructionsText,
                            cookBook,
                            pageNumber,
                        });

                        const confirmed = confirm("Are you sure you want to update recipe?");
                        if(!confirmed) {
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
    )
}