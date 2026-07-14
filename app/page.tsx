"use client";
import SearchBar from "@/components/SearchBar";
import Link from "next/link";
import { useState, useEffect } from "react";
import { getSavedRecipes } from "@/lib/recipeStorage";
import { Recipe } from "@/types/recipe";
import { getFavoriteRecipeSlugs } from "@/lib/favorites";
import { getGroceryList, getGroceryRecipeSlugs, removeRecipeFromGroceryList } from "@/lib/groceryList";
import { filterRecipesBySearch, getAllRecipes, getFavoriteRecipes, getGroceryRecipes, sortRecipesByIngredientMatches, getMainRecipes } from "@/lib/recipeService";
import FavoriteRecipesSection from "@/components/FavoriteRecipesSection";
import GroceryRecipesSection from "@/components/GroceryRecipesSection";
import RecipeList from "@/components/RecipeList";

export default function Home() {
  
  const [searchText, setSearchText] = useState("");

  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);

  const [favoriteRecipeSlugs, setFavoriteRecipeSlugs] = useState<string[]>([]);

  const [groceryList, setGroceryList] = useState<string[]>([]);

  const [groceryRecipeSlugs, setGroceryRecipeSlugs] = useState<string[]>([]);

  // Loads saved recipes, favorites, and grocery list data
  // when the homepage is first displayed.
  useEffect(() => {
    setSavedRecipes(getSavedRecipes());
    setFavoriteRecipeSlugs(getFavoriteRecipeSlugs());
    setGroceryList(
      getGroceryList().map((ingredient) => ingredient.name)
    );
    setGroceryRecipeSlugs(getGroceryRecipeSlugs());
  }, []);

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

    setGroceryRecipeSlugs(getGroceryRecipeSlugs());

    setGroceryList(
      getGroceryList().map((ingredient) => ingredient.name)
    );
  }

  const allRecipes = getAllRecipes(savedRecipes);

  const filteredRecipes = filterRecipesBySearch(allRecipes, searchText);

  const groceryRecipes = getGroceryRecipes(
    filteredRecipes,
    groceryRecipeSlugs
  );

  const favoriteRecipes = getFavoriteRecipes(
    filteredRecipes,
    favoriteRecipeSlugs,
    groceryRecipeSlugs
  );

  const sortedFavoriteRecipes = sortRecipesByIngredientMatches(
    favoriteRecipes,
    groceryList
  );

  const mainRecipes = getMainRecipes(
    filteredRecipes,
    favoriteRecipeSlugs,
    groceryRecipeSlugs
  );

  const sortedRecipes = sortRecipesByIngredientMatches(
    mainRecipes,
    groceryList
  );

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
