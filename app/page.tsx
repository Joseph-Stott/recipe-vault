"use client";
import RecipeCard from "@/components/RecipeCard";
import SearchBar from "@/components/SearchBar";
import Link from "next/link";
import { useState, useEffect } from "react";
import { getSavedRecipes } from "@/lib/recipeStorage";
import { Recipe } from "@/types/recipe";
import { getFavoriteRecipeSlugs } from "@/lib/favorites";
import { getGroceryList, getGroceryRecipeSlugs, removeRecipeFromGroceryList } from "@/lib/groceryList";
import { getIngredientNames } from "@/lib/recipeUtils";
import { getAllRecipes } from "@/lib/recipeService";

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

  const allRecipes = getAllRecipes(savedRecipes);

  const filteredRecipes = allRecipes.filter((recipe) => (
    recipe.title.toLowerCase().includes(normalizedSearch) ||
    recipe.timeCategory.toLowerCase().includes(normalizedSearch) ||
    getIngredientNames(recipe).some((ingredient) => ingredient.toLowerCase().includes(normalizedSearch)
    )
  ));

  const groceryRecipes = filteredRecipes.filter((recipe) => 
    groceryRecipeSlugs.includes(recipe.slug)
  );

  const favoriteRecipes = filteredRecipes.filter(
    (recipe) =>
        favoriteRecipeSlugs.includes(recipe.slug) &&
        !groceryRecipeSlugs.includes(recipe.slug)
  );

  const sortedFavoriteRecipes = [...favoriteRecipes].sort((a, b) => {
    const aIngredientMatches = getIngredientMatchCount(
      getIngredientNames(a),
      groceryList
    );

    const bIngredientMatches = getIngredientMatchCount(
      getIngredientNames(b),
      groceryList
    );

    return bIngredientMatches - aIngredientMatches;
  });

  const nonSectionFilteredRecipes = filteredRecipes.filter(
    (recipe) =>
        !groceryRecipeSlugs.includes(recipe.slug) &&
        !favoriteRecipeSlugs.includes(recipe.slug)
  );

  const sortedRecipes = [...nonSectionFilteredRecipes].sort((a, b) => {
    
    const aIngredientMatches = getIngredientMatchCount(
      getIngredientNames(a),
      groceryList
    );

    const bIngredientMatches = getIngredientMatchCount(
      getIngredientNames(b),
      groceryList
    );

    return bIngredientMatches - aIngredientMatches;
  });

  return (
    <main className="flex min-h-screen flex-col items-center justify-start py-16 bg-zinc-50 px-6 font-sans dark:bg-black">
      <section className="mb-8 w-full max-w-6xl rounded-2xl border border-zinc-800 bg-zinc-950/40 p-4">
        <h2 className="mb-3 text-center text-sm font-semibold text-zinc-400">
          🛒 Recipes in Grocery List ({groceryRecipes.length})
        </h2>
        <div className="flex flex-wrap justify-center gap-4">
          {groceryRecipes.length === 0 ? (
            <p className="text-center text-sm italic text-zinc-500">
              No recipes added to grocery list
            </p>
          ) : (
            groceryRecipes.map((recipe) => {
              return(
                <RecipeCard
                  key={recipe.slug} 
                  slug={recipe.slug}
                  title={recipe.title}
                  timeCategory={recipe.timeCategory}
                  actionButton={
                    <button
                    title="Remove from grocery list"
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
            })
          )}
        </div>
      </section>
      <section className="mb-8 w-full max-w-6xl rounded-2xl border border-zinc-800 bg-zinc-950/40 p-4">
        <h2 className="mb-3 text-center text-sm font-semibold text-zinc-400">
          ⭐ Favorite Recipes ({favoriteRecipes.length})
        </h2>
        <div className="flex flex-wrap justify-center gap-4">
          {favoriteRecipes.length === 0 ? (
            <p className="text-center text-sm italic text-zinc-500">
              No favorite recipes yet
            </p>
          ) : (
            sortedFavoriteRecipes.map((recipe) => {
              const matchCount = getIngredientMatchCount(
                getIngredientNames(recipe),
                groceryList
              );

              return (
                <RecipeCard
                  key={recipe.slug}
                  slug={recipe.slug}
                  title={recipe.title}
                  timeCategory={recipe.timeCategory}
                  isFavorite={true}
                  matchCount={matchCount}
                />
              );
            })
          )}
        </div>
      </section>
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl text-center font-semibold tracking-tight text-black dark:text-zinc-50">
          Recipe Vault
        </h1>
        <p className="mt-4 max-w-md text-center text-lg leading-8 text-zinc-600 dark:text-zinc-400">
          Store, organize, and search your favorite recipes
        </p>
        <p className="text-center text-sm text-zinc-500">
          {allRecipes.length} recipe{allRecipes.length === 1 ? "" : "s"} available
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
        <p className="text-center text-sm text-zinc-500">
          {!searchText
            ? `${filteredRecipes.length} recipe${filteredRecipes.length === 1 ? "" : "s"} found`
            : `${filteredRecipes.length} recipe${filteredRecipes.length === 1 ? "" : "s"} found for "${searchText}"`
          }
        </p>
        {
          filteredRecipes.length === 0 ? (
            <p className="text-center text-xl text-zinc-400">
              {!searchText ? "No recipes found" : `No recipes match "${searchText}"`}
            </p>
          ) : (
            sortedRecipes.map((recipe) => {
              const matchCount = getIngredientMatchCount(
                getIngredientNames(recipe),
                groceryList
              );

              return(
                <RecipeCard
                  slug={recipe.slug}
                  key={recipe.slug}
                  title={recipe.title}
                  timeCategory={recipe.timeCategory}
                  matchCount={matchCount}
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
