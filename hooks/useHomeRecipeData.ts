"use client";

import { useEffect, useState } from "react";
import { getFavoriteRecipeSlugs } from "@/lib/favorites";
import { 
    getGroceryList,
    getGroceryRecipeSlugs,
    removeRecipeFromGroceryList,
} from "@/lib/groceryList";
import { getSavedRecipes } from "@/lib/recipeStorage";
import { Recipe } from "@/types/recipe";
import { buildHomeRecipeCollections } from "@/lib/recipeService";

// Provides the homepage with stored recipe data, derived recipe groups,
// and grocery refresh behavior.
export function useHomeRecipeData(searchText: string) {
    const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);
    const [favoriteRecipeSlugs, setFavoriteRecipeSlugs] = useState<string[]>([]);
    const [groceryList, setGroceryList] = useState<string[]>([]);
    const [groceryRecipeSlugs, setGroceryRecipeSlugs] = useState<string[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Loads browser-stored recipe data once when the component using
    // this hook is first mounted.
    useEffect(() => {
        setSavedRecipes(getSavedRecipes());
        setFavoriteRecipeSlugs(getFavoriteRecipeSlugs());
        setGroceryList(
            getGroceryList().map((ingredient) => ingredient.name)
        );
        setGroceryRecipeSlugs(getGroceryRecipeSlugs());

        setIsLoaded(true);
    }, []);

    // Refreshes grocery-related state after the grocery list changes.
    function refreshGroceryData() {
        setGroceryList(
            getGroceryList().map((ingredient) => ingredient.name)
        );
        setGroceryRecipeSlugs(getGroceryRecipeSlugs());
    }

    // Removes a recipe and its contributed ingredients from grocery storage,
    // then refreshes the related React state so the homepage updates immediately.
    function removeGroceryRecipe(recipe: Recipe) {
        removeRecipeFromGroceryList(
            recipe.slug,
            recipe.structuredIngredients
        );

        refreshGroceryData();
    }

    // Delegates homepage filtering, grouping, and sorting rules
    // to the service layer.
    const {
        allRecipes,
        filteredRecipes,
        groceryRecipes,
        sortedFavoriteRecipes,
        sortedRecipes,
    } = buildHomeRecipeCollections({
        savedRecipes,
        searchText,
        favoriteRecipeSlugs,
        groceryRecipeSlugs,
        groceryIngredients: groceryList,
    });

    return {
        allRecipes,
        filteredRecipes,
        groceryRecipes,
        sortedFavoriteRecipes,
        sortedRecipes,
        groceryList,
        isLoaded,
        removeGroceryRecipe,
    };
}