"use client";

import { useEffect, useState } from "react";
import { getFavoriteRecipeSlugs } from "@/lib/favorites";
import { getGroceryList, getGroceryRecipeSlugs } from "@/lib/groceryList";
import { getSavedRecipes } from "@/lib/recipeStorage";
import { Recipe } from "@/types/recipe";
import {
  filterRecipesBySearch,
  getAllRecipes,
  getFavoriteRecipes,
  getGroceryRecipes,
  getMainRecipes,
  sortRecipesByIngredientMatches,
} from "@/lib/recipeService";

export function useRecipeData(searchText: string) {
    const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);
    const [favoriteRecipeSlugs, setFavoriteRecipeSlugs] = useState<string[]>([]);
    const [groceryList, setGroceryList] = useState<string[]>([]);
    const [groceryRecipeSlugs, setGroceryRecipeSlugs] = useState<string[]>([]);

    // Loads browser-stored recipe data once when the component using
    // this hook is first mounted.
    useEffect(() => {
        setSavedRecipes(getSavedRecipes());
        setFavoriteRecipeSlugs(getFavoriteRecipeSlugs());
        setGroceryList(
            getGroceryList().map((ingredient) => ingredient.name)
        );
        setGroceryRecipeSlugs(getGroceryRecipeSlugs());
    }, []);

    // Refreshes grocery-related state after the grocery list changes.
    function refreshGroceryData() {
        setGroceryList(
            getGroceryList().map((ingredient) => ingredient.name)
        );
        setGroceryRecipeSlugs(getGroceryRecipeSlugs());
    }

    // Builds the recipe groups used by the homepage from the stored data
    // and current search text.
    const allRecipes = getAllRecipes(savedRecipes);

    const filteredRecipes = filterRecipesBySearch(
        allRecipes,
        searchText
    );

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

    return {
        allRecipes,
        filteredRecipes,
        groceryRecipes,
        sortedFavoriteRecipes,
        sortedRecipes,
        groceryList,
        refreshGroceryData,
    };
}