"use client";
import RecipeCard from "@/components/RecipeCard";
import SearchBar from "@/components/SearchBar";
import { recipes } from "@/data/recipes";
import Link from "next/link";
import { useState, useEffect } from "react";
import { getSavedRecipes } from "@/lib/recipeStorage";
import { Recipe } from "@/types/recipe";
import { getFavoriteRecipeSlugs } from "@/lib/favorites";
import { getGroceryList, getGroceryRecipeSlugs, removeRecipeFromGroceryList } from "@/lib/groceryList";
import { getIngredientNames } from "@/lib/recipeUtils";

function getIngredientMatchCount(recipeIngredients: string[], groceryIngredients: string[]) {
  return recipeIngredients.filter((ingredient) =>
    groceryIngredients.includes(ingredient)
  ).length;
}

export default function Home() {
  
  const [searchText, setSearchText] = useState("");

  const normalizedSearch = searchText.toLowerCase();

  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);

  const [favoriteRecipeSlugs, setFavoriteRecipeSlugs] = useState<string[]>([]);

  const [groceryList, setGroceryList] = useState<string[]>([]);

  const [groceryRecipeSlugs, setGroceryRecipeSlugs] = useState<string[]>([]);

  useEffect(() => {
    setSavedRecipes(getSavedRecipes());
    setFavoriteRecipeSlugs(getFavoriteRecipeSlugs());
    setGroceryList(
      getGroceryList().map((ingredient) => ingredient.name)
    );
    setGroceryRecipeSlugs(getGroceryRecipeSlugs());
  }, []);

  // Saved recipes are placed first so edited recipes override
  // built-in recipes with matching slugs
  const allRecipesWithDuplicates = [...savedRecipes, ...recipes];

  // Remove duplicate recipe slugs while keeping the saved override version
  const allRecipes = allRecipesWithDuplicates.filter((recipe, index, array) =>
    array.findIndex((currentRecipe) => currentRecipe.slug === recipe.slug) === index
  );

  const filteredRecipes = allRecipes.filter((recipe) => (
    recipe.title.toLowerCase().includes(normalizedSearch) ||
    recipe.timeCategory.toLowerCase().includes(normalizedSearch) ||
    getIngredientNames(recipe).some((ingredient) => ingredient.toLowerCase().includes(normalizedSearch)
    )
  ));

  const groceryRecipes = allRecipes.filter((recipe) => groceryRecipeSlugs.includes(recipe.slug));

  const nonGroceryFilteredRecipes = filteredRecipes.filter((recipe) => !groceryRecipeSlugs.includes(recipe.slug));
  
  const sortedRecipes = [...nonGroceryFilteredRecipes].sort((a, b) => {
    const aIsFavorite = favoriteRecipeSlugs.includes(a.slug);
    const bIsFavorite = favoriteRecipeSlugs.includes(b.slug);

    const aInGroceryList = groceryRecipeSlugs.includes(a.slug);
    const bInGroceryList = groceryRecipeSlugs.includes(b.slug);

    const aIngredientMatches = getIngredientMatchCount(
      getIngredientNames(a),
      groceryList
    );

    const bIngredientMatches = getIngredientMatchCount(
      getIngredientNames(b),
      groceryList
    );

    if (aInGroceryList && !bInGroceryList) {
      return -1;
    }

    if (!aInGroceryList && bInGroceryList) {
      return 1;
    }

    if (aIsFavorite && !bIsFavorite) {
      return -1;
    }

    if (!aIsFavorite && bIsFavorite) {
      return 1;
    }

    return bIngredientMatches - aIngredientMatches;
  });

  return (
    <main className="flex min-h-screen flex-col items-center justify-start py-16 bg-zinc-50 px-6 font-sans dark:bg-black">
      {groceryRecipes.length > 0 && (
        <section className="mb-8 w-full max-w-6xl rounded-2xl border border-zinc-800 bg-zinc-950/40 p-4">
          <h2 className="mb-3 text-center text-sm font-semibold text-zinc-400">
            🛒 Recipes in Grocery List
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            {groceryRecipes.map((recipe) => {
              return(
                <RecipeCard
                  key={recipe.slug} 
                  slug={recipe.slug}
                  title={recipe.title}
                  timeCategory={recipe.timeCategory}
                  actionButton={
                    <button
                      className="text-zinc-400 hover:text-zinc-100"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();

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
                          getGroceryList().map(
                            (ingredient) => ingredient.name
                          )
                        );
                      }}
                    >
                      ✕
                    </button>
                  }
                />
              );
            })}
          </div>
        </section>
      )}

      <div className="mb-8 w-full max-w-6xl border-b border-zinc-800" />

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
              No recipes match your search
            </p>
          ) : (
            sortedRecipes.map((recipe) => {
              const matchCount = getIngredientMatchCount(
                getIngredientNames(recipe),
                groceryList
              );

              const isFavorite = favoriteRecipeSlugs.includes(recipe.slug);

              return(
                <RecipeCard
                  slug={recipe.slug}
                  key={recipe.slug}
                  title={recipe.title}
                  timeCategory={recipe.timeCategory}
                  matchCount={matchCount}
                  isFavorite={isFavorite}
                />
              );
            })
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
