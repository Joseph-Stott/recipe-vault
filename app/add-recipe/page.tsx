"use client";
import Link from "next/link";
import { useState } from "react";
import { addSavedRecipe } from "@/lib/recipeStorage";
import { time } from "console";
import { Recipe } from "@/types/recipe";

function createSlug (title: string) {
    return title.toLowerCase().trim().replaceAll(" ", "-");
}

export default function AddRecipePage() {
    const [title, setTitle] = useState("");
    const [timeCategory, setTimeCategory] = useState<Recipe["timeCategory"]>("fast");
    const [ingredientsText, setIngredientsText] = useState("");
    const [cookInstructionsText, setCookInstructionsText] = useState("");
    const [cookBook, setCookBook] = useState("");
    const [pageNumber, setPageNumber] = useState("");

    return(
        <main className="flex min-h-screen flex-col items-center justify-start py-16 bg-zinc-50 px-6 font-sans dark:bg-black">
            <div className="w-full max-w-sm flex flex-col gap-4 rounded-2xl text-center border border-zinc-700 bg-zinc-900 p-4">
                <h1 className="flex items-center justify-center">
                    Add Recipe Page
                </h1>
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
                <input 
                    className="w-full max-w-sm p-2 bg-zinc-900 border border-zinc-400 rounded-lg placeholder:text-center"
                    type="text"
                    placeholder="Ingredients List"
                    value={ingredientsText}
                    onChange={(event) => setIngredientsText(event.target.value)}
                />
                <input 
                    className="w-full max-w-sm p-2 bg-zinc-900 border border-zinc-400 rounded-lg placeholder:text-center"
                    type="text"
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
                        const newRecipe = {
                            slug: createSlug(title),
                            title: title,
                            timeCategory: timeCategory,
                            ingredientsList: ingredientsText.split(",").map((ingredient) => ingredient.trim()),
                            cookInstructions: cookInstructionsText.split(",").map((cookInstructions) => cookInstructions.trim()),
                            cookBook: cookBook,
                            pageNumber: pageNumber ? Number(pageNumber) : undefined
                        };
                        addSavedRecipe(newRecipe);
                        alert("Added to Recipe");
                    }}
                >
                    Add Recipe
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