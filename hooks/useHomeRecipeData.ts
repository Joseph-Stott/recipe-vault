"use client";

import { 
    useState, 
    useSyncExternalStore,
} from "react";

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
import {
    getDatabaseRecipes,
    importDatabaseRecipes,
} from "@/lib/recipeApi";
import { useFavoriteRecipeSlugs } from "@/hooks/useFavoriteRecipeSlugs";
import { useDatabaseRecipes } from "@/hooks/useDatabaseRecipes";

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

    const {
        databaseRecipes, databaseRecipesLoaded, databaseRecipeLoadError,
        recipeMigrationError, acceptDatabaseRecipes,
    } = useDatabaseRecipes();
    const [isImportingRecipes, setIsImportingRecipes] = useState(false);
    const [importRecipeMessage, setImportRecipeMessage] = useState<string | null>(null);

    const {
        favoriteRecipeSlugs,
        favoriteRecipeLoadError,
        favoriteRecipeImportError,
        favoriteRecipeUpdateError,
    } = useFavoriteRecipeSlugs();

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

    const combinedSavedRecipes = Array.from(
        new Map(
            [...savedRecipes, ...databaseRecipes].map((recipe) => [
                recipe.slug,
                recipe,
            ])
        ).values()
    );

    const databaseRecipeSlugs = new Set(
        databaseRecipes.map((recipe) => recipe.slug)
    );

    const localRecipesToImport = savedRecipes.filter(
        (recipe) => !databaseRecipeSlugs.has(recipe.slug)
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

    async function importLocalRecipes() {
        if (localRecipesToImport.length === 0 || isImportingRecipes ||
            !databaseRecipesLoaded || databaseRecipeLoadError || recipeMigrationError) {
            return;
        }

        setIsImportingRecipes(true);
        setImportRecipeMessage(null);

        try {
            const result = await importDatabaseRecipes(localRecipesToImport);

            acceptDatabaseRecipes(
                Array.from(
                    new Map(
                        [
                            ...databaseRecipes,
                            ...result.recipes,
                        ].map((recipe) => [
                            recipe.slug,
                            recipe,
                        ])
                    ).values()
                )
            );

            let message = (
                result.importedCount === 1
                    ? "Imported 1 recipe."
                    : `Imported ${result.importedCount} recipes.`
            );
            if (result.skippedCount > 0) {
                message += ` ${result.skippedCount} already in the database.`;
                // Skipped records are not returned by import. Confirm them with a read
                // before retiring their local copies or replacing the displayed data.
                try {
                    acceptDatabaseRecipes(await getDatabaseRecipes());
                } catch {
                    message += " Reload to confirm existing recipes and finish browser cleanup.";
                }
            }
            setImportRecipeMessage(message);
        } catch (error) {
            console.error("Failed to import local recipes", error);
            setImportRecipeMessage(
                "Failed to import local recipes. Please try again."
            );
        } finally {
            setIsImportingRecipes(false);
        }
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
        savedRecipes: combinedSavedRecipes,
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
        databaseRecipesLoaded,
        databaseRecipeLoadError,
        recipeMigrationError,
        favoriteRecipeLoadError,
        favoriteRecipeImportError,
        favoriteRecipeUpdateError,
        localRecipesToImport,
        isImportingRecipes,
        importRecipeMessage,
        importLocalRecipes,
        removeGroceryRecipe,
    };
}
