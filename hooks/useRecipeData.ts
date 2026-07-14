"use client";

import { useEffect, useState } from "react";
import { getFavoriteRecipeSlugs } from "@/lib/favorites";
import { getGroceryList, getGroceryRecipeSlugs } from "@/lib/groceryList";
import { getSavedRecipes } from "@/lib/recipeStorage";
import { Recipe } from "@/types/recipe";

export function useRecipeData() {
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

    return {
        savedRecipes,
        favoriteRecipeSlugs,
        groceryList,
        groceryRecipeSlugs,
        refreshGroceryData,
    };
}