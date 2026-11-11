"use client";

import { useCallback, useEffect, useState } from "react";
import { getDatabaseRecipes } from "@/lib/recipeApi";
import { retireSavedRecipes } from "@/lib/recipeStorage";
import type { Recipe } from "@/types/recipe";

export function useDatabaseRecipes() {
    const [databaseRecipes, setDatabaseRecipes] = useState<Recipe[]>([]);
    const [databaseRecipesLoaded, setDatabaseRecipesLoaded] = useState(false);
    const [databaseRecipeLoadError, setDatabaseRecipeLoadError] = useState<string | null>(null);
    const [recipeMigrationError, setRecipeMigrationError] = useState<string | null>(null);

    const acceptDatabaseRecipes = useCallback((recipes: Recipe[]) => {
        setDatabaseRecipes(recipes);
        setDatabaseRecipeLoadError(null);
        try {
            retireSavedRecipes(recipes.map((recipe) => recipe.slug));
            setRecipeMigrationError(null);
        } catch (error) {
            console.error("Failed to retire migrated browser recipes", error);
            setRecipeMigrationError(
                "Recipes are in the database, but browser cleanup could not finish. Your local copies were retained. Download any legacy recovery copy, check browser storage, and reload before editing or deleting."
            );
        }
    }, []);

    useEffect(() => {
        let cancelled = false;
        getDatabaseRecipes()
            .then((recipes) => {
                if (!cancelled) acceptDatabaseRecipes(recipes);
            })
            .catch((error) => {
                console.error("Failed to load database recipes", error);
                if (!cancelled) setDatabaseRecipeLoadError("Recipes could not be loaded from the database.");
            })
            .finally(() => {
                if (!cancelled) setDatabaseRecipesLoaded(true);
            });
        return () => { cancelled = true; };
    }, [acceptDatabaseRecipes]);

    return {
        databaseRecipes, databaseRecipesLoaded, databaseRecipeLoadError,
        recipeMigrationError, acceptDatabaseRecipes,
    };
}
