"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Recipe } from "@/types/recipe";
import { useParams } from "next/navigation";
import { recipes } from "@/data/recipes";
import { getSavedRecipes, updateSavedRecipe, deleteSavedRecipe } from "@/lib/recipeStorage";
import { useRouter } from "next/navigation";

export default function EditRecipePage() {
    const params = useParams();

    const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);

    const [title, setTitle] = useState("");
    const [timeCategory, setTimeCategory] = useState<Recipe["timeCategory"]>("medium");
    const [ingredientsText, setIngredientsText] = useState("");
    const [cookInstructionsText, setCookInstructionsText] = useState("");
    const [cookBook, setCookBook] = useState("");
    const [pageNumber, setPageNumber] = useState("");

    const allRecipesWithDuplicates = [...savedRecipes, ...recipes];

    const allRecipes = allRecipesWithDuplicates.filter((recipe, index, array) =>
        array.findIndex((currentRecipe) => currentRecipe.slug === recipe.slug) === index
    );

    const recipe = allRecipes.find((recipe) => recipe.slug === params.slug);

    const router = useRouter();

    useEffect(() => {
        setSavedRecipes(getSavedRecipes());
    }, []);

    useEffect(() => {
        if (recipe) {
            setTitle(recipe.title);
            setTimeCategory(recipe.timeCategory);
            setIngredientsText(recipe.ingredientsList.join("\n"));
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
                            alert("Recipe not found");
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
                <input 
                    className="w-full max-w-sm p-2 bg-zinc-900 border border-zinc-400 rounded-lg placeholder:text-center"
                    type="text"
                    placeholder="Add Title"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                />
                <section className="flex flex-row justify-center gap-2">
                    <button
                        className={`cursor-pointer rounded-lg border px-3 py-2 text-sm font-medium ${
                            timeCategory === "fast"
                                ? "bg-green-600 border-green-500"
                                : "border-zinc-600 hover:bg-zinc-800"
                        }`}
                        onClick={() => {
                            setTimeCategory("fast");
                        }}
                    >
                        Fast
                    </button>
                    <button
                        className={`cursor-pointer rounded-lg border px-3 py-2 text-sm font-medium ${
                            timeCategory === "medium"
                                ? "bg-yellow-600 border-yellow-500"
                                : "border-zinc-600 hover:bg-zinc-800"
                        }`}
                        onClick={() => {
                            setTimeCategory("medium");
                        }}
                    >
                        Medium
                    </button>
                    <button
                        className={`cursor-pointer rounded-lg border px-3 py-2 text-sm font-medium ${
                            timeCategory === "slow"
                                ? "bg-red-600 border-red-500"
                                : "border-zinc-600 hover:bg-zinc-800"
                        }`}
                        onClick={() => {
                            setTimeCategory("slow");
                        }}
                    >
                        Slow
                    </button>
                </section>
                <textarea
                    className="w-full max-w-sm p-2 bg-zinc-900 border border-zinc-400 rounded-lg placeholder:text-center"
                    placeholder="Ingredients List"
                    value={ingredientsText}
                    onChange={(event) => setIngredientsText(event.target.value)}
                />
                <textarea
                    className="w-full max-w-sm p-2 bg-zinc-900 border border-zinc-400 rounded-lg placeholder:text-center"
                    placeholder="Cook Instructions"
                    value={cookInstructionsText}
                    onChange={(event) => setCookInstructionsText(event.target.value)}
                />
                <input 
                    className="w-full max-w-sm p-2 bg-zinc-900 border border-zinc-400 rounded-lg placeholder:text-center"
                    type="text"
                    placeholder="Book title"
                    value={cookBook}
                    onChange={(event) => setCookBook(event.target.value)}
                />
                <input 
                    className="w-full max-w-sm p-2 bg-zinc-900 border border-zinc-400 rounded-lg placeholder:text-center"
                    type="text"
                    placeholder="Page number"
                    value={pageNumber}
                    onChange={(event) => setPageNumber(event.target.value)}
                />
                <button
                    className="cursor-pointer rounded-lg border border-zinc-600 px-3 py-2 text-sm font-medium hover:bg-zinc-800"
                    onClick={() => {
                        if (!recipe) {
                            alert("Recipe not found");
                            return;
                        }
                        if (!title.trim()) {
                            alert("Recipe title is required");
                            return;
                        }
                        if (!ingredientsText.trim()) {
                            alert("Recipe ingredients are required");
                            return;
                        }
                        const newRecipe = {
                            slug: recipe.slug,
                            title: title,
                            timeCategory: timeCategory,
                            ingredientsList: ingredientsText.split("\n").map((ingredient) => ingredient.trim()),
                            cookInstructions: cookInstructionsText.trim()
                                ? cookInstructionsText
                                    .split("\n")
                                    .map((instruction) => instruction.trim())
                                    .filter((instruction) => instruction !== "")
                                : undefined,
                            cookBook: cookBook,
                            pageNumber: pageNumber ? Number(pageNumber) : undefined
                        };
                        const confirmed = confirm("Are you sure you want to update recipe?");
                        if(!confirmed) {
                            return;
                        }
                        updateSavedRecipe(newRecipe);
                        router.refresh();
                        router.push("/");
                        
                    }}
                >
                    Update Recipe
                </button>
                <Link 
                    href="/"
                    className="cursor-pointer rounded-lg border border-zinc-600 px-3 py-2 text-sm font-medium hover:bg-zinc-800"
                >
                    Back to recipes
                </Link>
            </div>
        </main>
    )
}