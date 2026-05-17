"use client";
import RecipeCard from "@/components/RecipeCard";
import SearchBar from "@/components/SearchBar";
import { recipes } from "@/data/recipes";
import { useState } from "react";

export default function Home() {
  
  const [searchText, setSearchText] = useState("");

  const normalizedSearch = searchText.toLowerCase();

  const filteredRecipes = recipes.filter((recipe) => (
    recipe.title.toLowerCase().includes(normalizedSearch) || 
    recipe.cuisine.toLowerCase().includes(normalizedSearch) || 
    recipe.description.toLowerCase().includes(normalizedSearch))
  );



  return (
    <main className="flex min-h-screen flex-col items-center justify-start py-16 bg-zinc-50 px-6 font-sans dark:bg-black">
      <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
        Recipe Vault
      </h1>
      <p className="mt-4 max-w-md text-center text-lg leading-8 text-zinc-600 dark:text-zinc-400">
        Store, organize, and search your favorite recipes
      </p>
      <div className="flex flex-col gap-4">
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
                key={recipe.title}
                title={recipe.title}
                cuisine={recipe.cuisine}
                cookTime={recipe.cookTime}
                description={recipe.description}
              />
            ))
          )
        }
      </div>
    </main>
  );
}
