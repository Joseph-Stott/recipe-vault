"use client";

import SearchBar from "@/components/SearchBar";
import Link from "next/link";
import { useState } from "react";
import { Recipe } from "@/types/recipe";
import { removeRecipeFromGroceryList } from "@/lib/groceryList";
import FavoriteRecipesSection from "@/components/FavoriteRecipesSection";
import GroceryRecipesSection from "@/components/GroceryRecipesSection";
import RecipeList from "@/components/RecipeList";
import { useRecipeData } from "@/hooks/useRecipeData";

export default function Home() {
  
  const [searchText, setSearchText] = useState("");

  const {
    allRecipes,
    filteredRecipes,
    groceryRecipes,
    sortedFavoriteRecipes,
    sortedRecipes,
    groceryList,
    refreshGroceryData,
  } = useRecipeData(searchText);

  // Removes a recipe from the grocery list after user confirmation.
  function handleRemoveGroceryRecipe(recipe: Recipe) {
    const confirmed = confirm(
      `Remove "${recipe.title}" from grocery list?`
    );

    if (!confirmed) {
      return;
    }

    removeRecipeFromGroceryList(
      recipe.slug,
      recipe.structuredIngredients
    );

    refreshGroceryData();
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-start py-16 bg-zinc-50 px-6 font-sans dark:bg-black">
      <GroceryRecipesSection
        recipes={groceryRecipes}
        onRemoveRecipe={handleRemoveGroceryRecipe}
      />
      <FavoriteRecipesSection
        recipes={sortedFavoriteRecipes}
        groceryList={groceryList}
      />
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl text-center font-semibold tracking-tight text-black dark:text-zinc-50">
          Recipe Vault
        </h1>
        <p className="mt-4 max-w-md text-center text-lg leading-8 text-zinc-600 dark:text-zinc-400">
          Store, organize, and search your favorite recipes
        </p>
        <p 
          title="Total recipes available"
          className="text-center text-sm text-zinc-500"
        >
          {allRecipes.length} recipe{allRecipes.length === 1 ? "" : "s"} available
        </p>
        <Link 
          title="View grocery list"
          className="w-full max-w-sm rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-center font-medium hover:border-zinc-500 hover:bg-zinc-800 transition-colors duration-200"
          href="/grocery-list"
        >
          View Grocery List
        </Link>
        <SearchBar
          searchText={searchText}
          setSearchText={setSearchText}
        />
        <RecipeList
          recipes={sortedRecipes}
          groceryList={groceryList}
          searchText={searchText}
          filteredRecipeCount={filteredRecipes.length}
        />
        <Link 
          title="Create a new recipe"
          href="/add-recipe"
          className="cursor-pointer text-center fixed bottom-6 right-6 rounded-lg border border-zinc-600 px-3 py-2 text-sm font-medium hover:bg-zinc-800"
        >
          Add Recipe
        </Link>
      </div>
    </main>
  );
}
