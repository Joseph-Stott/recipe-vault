"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import {
    getFavoriteRecipeSlugs, retireFavoriteRecipes, subscribeToFavoriteRecipeSlugs,
} from "@/lib/favorites";
import { preserveLegacyData } from "@/lib/legacyRecovery";
import {
    getDatabaseFavoriteRecipeSlugs, importDatabaseFavoriteRecipeSlugs, toggleDatabaseFavoriteRecipe,
} from "@/lib/favoriteApi";

const EMPTY_SLUGS: string[] = [];
const CLEANUP_ERROR = "Favorites are in the database, but browser cleanup could not finish. Your local copies were retained. Check browser storage and reload before changing favorites.";

export function useFavoriteRecipeSlugs() {
    const localFavoriteRecipeSlugs = useSyncExternalStore(
        subscribeToFavoriteRecipeSlugs, getFavoriteRecipeSlugs, () => EMPTY_SLUGS
    );
    const [databaseFavoriteRecipeSlugs, setDatabaseFavoriteRecipeSlugs] = useState<string[]>([]);
    const [databaseFavoritesLoaded, setDatabaseFavoritesLoaded] = useState(false);
    const [isUpdatingFavorite, setIsUpdatingFavorite] = useState(false);
    const updateInFlight = useRef(false);
    const [favoriteRecipeLoadError, setFavoriteRecipeLoadError] = useState<string | null>(null);
    const [favoriteRecipeImportError, setFavoriteRecipeImportError] = useState<string | null>(null);
    const [favoriteRecipeUpdateError, setFavoriteRecipeUpdateError] = useState<string | null>(null);
    const [cleanupFailed, setCleanupFailed] = useState(false);

    useEffect(() => {
        let cancelled = false;

        function acceptConfirmedFavorites(slugs: string[]) {
            setDatabaseFavoriteRecipeSlugs(slugs);
            try {
                retireFavoriteRecipes(slugs);
                return true;
            } catch (error) {
                console.error("Failed to retire migrated browser favorites", error);
                setFavoriteRecipeImportError(CLEANUP_ERROR);
                setCleanupFailed(true);
                return false;
            }
        }

        async function loadAndMigrate() {
            try {
                const favorites = await getDatabaseFavoriteRecipeSlugs();
                if (cancelled || !acceptConfirmedFavorites(favorites)) return;

                // Read the current store after retiring confirmed favorites. This also
                // respects cleanup performed by another tab while the request was pending.
                const missing = getFavoriteRecipeSlugs().filter((slug) => !favorites.includes(slug.trim()));
                if (missing.length === 0) return;
                try {
                    const imported = await importDatabaseFavoriteRecipeSlugs(missing);
                    if (!cancelled) acceptConfirmedFavorites(imported);
                } catch (error) {
                    console.error("Failed to import local favorites", error);
                    if (!cancelled) setFavoriteRecipeImportError(
                        "Local favorites could not be copied into the database. Reload to retry before changing favorites."
                    );
                }
            } catch (error) {
                console.error("Failed to load database favorites", error);
                if (!cancelled) setFavoriteRecipeLoadError("Favorites could not be loaded from the database.");
            } finally {
                if (!cancelled) setDatabaseFavoritesLoaded(true);
            }
        }

        // One migration attempt per visit. Missing recipes remain pending until a
        // later visit; state updates from the response cannot trigger request loops.
        void loadAndMigrate();
        return () => { cancelled = true; };
    }, []);

    const favoriteRecipeSlugs = useMemo(
        () => [...new Set([...localFavoriteRecipeSlugs.map((slug) => slug.trim()), ...databaseFavoriteRecipeSlugs])],
        [databaseFavoriteRecipeSlugs, localFavoriteRecipeSlugs]
    );

    const actionsBlocked = !databaseFavoritesLoaded || cleanupFailed ||
        Boolean(favoriteRecipeLoadError || favoriteRecipeImportError);

    async function toggleFavoriteRecipe(recipeSlug: string) {
        if (actionsBlocked || updateInFlight.current) return;
        updateInFlight.current = true;
        setIsUpdatingFavorite(true);
        setFavoriteRecipeUpdateError(null);

        try {
            const pending = getFavoriteRecipeSlugs().filter((slug) => slug.trim() === recipeSlug);
            // Preserve a pending local choice before either a server toggle or its
            // explicit removal. A failed request leaves the active copy untouched.
            preserveLegacyData([], pending);
            if (pending.length > 0 && !databaseFavoriteRecipeSlugs.includes(recipeSlug)) {
                retireFavoriteRecipes([recipeSlug]);
                return;
            }

            const favorites = await toggleDatabaseFavoriteRecipe(recipeSlug);
            setDatabaseFavoriteRecipeSlugs(favorites);
            try {
                retireFavoriteRecipes([...favorites, recipeSlug]);
            } catch (error) {
                console.error("Failed to finish browser favorite cleanup", error);
                setCleanupFailed(true);
                setFavoriteRecipeUpdateError("Favorite changed in the database, but browser cleanup could not finish. Check browser storage and reload.");
            }
        } catch (error) {
            console.error("Failed to update database favorite", error);
            setFavoriteRecipeUpdateError("Favorite could not be updated. Please try again.");
        } finally {
            updateInFlight.current = false;
            setIsUpdatingFavorite(false);
        }
    }

    return {
        favoriteRecipeSlugs, favoriteRecipeLoadError, favoriteRecipeImportError,
        favoriteRecipeUpdateError,
        isUpdatingFavorite: isUpdatingFavorite || actionsBlocked,
        toggleFavoriteRecipe,
    };
}
