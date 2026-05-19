"use client";
import RecipeCard from "@/components/RecipeCard";
import SearchBar from "@/components/SearchBar";
import { recipes } from "@/data/recipes";
import Link from "next/link";
import { useState, useEffect } from "react";
import { getSavedRecipes } from "@/lib/recipeStorage";
import { Recipe } from "@/types/recipe";

export default function Home() {
  
  const [searchText, setSearchText] = useState("");

  const normalizedSearch = searchText.toLowerCase();

  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);

  useEffect(() => {
    setSavedRecipes(getSavedRecipes());
  }, []);

  const allRecipes = [...recipes, ...savedRecipes];

  const filteredRecipes = allRecipes.filter((recipe) => (
    recipe.title.toLowerCase().includes(normalizedSearch) ||
    recipe.timeCategory.toLowerCase().includes(normalizedSearch) ||
    recipe.ingredientsList.some((ingredient) => ingredient.toLowerCase().includes(normalizedSearch)
    )
  ));

  return (
    <main className="flex min-h-screen flex-col items-center justify-start py-16 bg-zinc-50 px-6 font-sans dark:bg-black">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl text-center font-semibold tracking-tight text-black dark:text-zinc-50">
          Recipe Vault
        </h1>
        <p className="mt-4 max-w-md text-center text-lg leading-8 text-zinc-600 dark:text-zinc-400">
          Store, organize, and search your favorite recipes
        </p>
        <Link 
          className="w-full max-w-sm rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-center font-medium hover:border-zinc-500 hover:bg-zinc-800 transition-colors duration-200"
          href="/grocery-list">
            View Grocery List
        </Link>
        <SearchBar
          searchText={searchText}
          setSearchText={setSearchText}
        />
        {
          filteredRecipes.length === 0 ? (
            <p className="text-center text-xl text-zinc-400">
              No recipe found
            </p>
          ) : (
            filteredRecipes.map((recipe) => (
              <RecipeCard
                slug={recipe.slug}
                key={recipe.slug}
                title={recipe.title}
                timeCategory={recipe.timeCategory}
                ingredientsList={recipe.ingredientsList}
                cookInstructions={recipe.cookInstructions}
              />
            ))
          )
        }
        <Link 
          href="/add-recipe"
          className="cursor-pointer text-center fixed bottom-6 right-6 rounded-lg border border-zinc-600 px-3 py-2 text-sm font-medium hover:bg-zinc-800"
        >
            Add Recipe
        </Link>
      </div>
    </main>
  );
}
