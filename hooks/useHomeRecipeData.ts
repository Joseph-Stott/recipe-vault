"use client";

import { 
    useEffect,
    useState, 
    useSyncExternalStore,
} from "react";

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
import {
    getDatabaseRecipes,
    importDatabaseRecipes,
} from "@/lib/recipeApi";

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

    const [databaseRecipes, setDatabaseRecipes] = useState<Recipe[]>([]);
    const [isImportingRecipes, setIsImportingRecipes] = useState(false);
    const [importRecipeMessage, setImportRecipeMessage] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        getDatabaseRecipes()
            .then((recipes) => {
                if (!cancelled) {
                    setDatabaseRecipes(recipes);
                }
            })
            .catch((error) => {
                console.error("Failed to load database recipes", error);
            });

        return () => {
            cancelled = true;
        };
    }, []);

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
        if (localRecipesToImport.length === 0 || isImportingRecipes) {
            return;
        }

        setIsImportingRecipes(true);
        setImportRecipeMessage(null);

        try {
            const result = await importDatabaseRecipes(localRecipesToImport);

            setDatabaseRecipes((currentRecipes) =>
                Array.from(
                    new Map(
                        [
                            ...currentRecipes,
                            ...result.recipes,
                        ].map((recipe) => [
                            recipe.slug,
                            recipe,
                        ])
                    ).values()
                )
            );

            setImportRecipeMessage(
                result.importedCount === 1
                    ? "Imported 1 recipe."
                    : `Imported ${result.importedCount} recipes.`
            );
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
        localRecipesToImport,
        isImportingRecipes,
        importRecipeMessage,
        importLocalRecipes,
        removeGroceryRecipe,
    };
}
