"use client";

import { useSyncExternalStore } from "react";
import { 
    getFavoriteRecipeSlugs,
    subscribeToFavoriteRecipeSlugs,
} from "@/lib/favorites";
import { 
    getGroceryList,
    getGroceryRecipeSlugs,
    removeRecipeFromGroceryList,
    subscribeToGroceryList,
    subscribeToGroceryRecipeSlugs,
} from "@/lib/groceryList";
import {
    getSavedRecipes,
    subscribeToSavedRecipes,
} from "@/lib/recipeStorage";
import { Recipe } from "@/types/recipe";
import { buildHomeRecipeCollections } from "@/lib/recipeService";

const EMPTY_RECIPES: Recipe[] = [];
const EMPTY_SLUGS: string[] = [];
const EMPTY_GROCERY_ITEMS: ReturnType<typeof getGroceryList> = [];

// Provides the homepage with stored recipe data and derived recipe groups.
export function useHomeRecipeData(searchText: string) {
    const savedRecipes = useSyncExternalStore(
        subscribeToSavedRecipes,
        getSavedRecipes,
        () => EMPTY_RECIPES
    );

    const favoriteRecipeSlugs = useSyncExternalStore(
        subscribeToFavoriteRecipeSlugs,
        getFavoriteRecipeSlugs,
        () => EMPTY_SLUGS
    );

    const groceryItems = useSyncExternalStore(
        subscribeToGroceryList,
        getGroceryList,
        () => EMPTY_GROCERY_ITEMS
    );

    const groceryRecipeSlugs = useSyncExternalStore(
        subscribeToGroceryRecipeSlugs,
        getGroceryRecipeSlugs,
        () => EMPTY_SLUGS
    );

    const groceryList = groceryItems.map(
        (ingredient) => ingredient.name
    );

    // Removes a recipe and its contributed ingredients from grocery storage.
    function removeGroceryRecipe(recipe: Recipe) {
        removeRecipeFromGroceryList(
            recipe.slug,
            recipe.structuredIngredients
        );
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
        removeGroceryRecipe,
    };
}