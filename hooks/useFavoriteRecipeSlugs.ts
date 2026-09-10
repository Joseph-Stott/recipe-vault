"use client";

import {
    useEffect,
    useMemo,
    useState,
    useSyncExternalStore,
} from "react";
import {
    getFavoriteRecipeSlugs,
    removeFavoriteRecipe,
    subscribeToFavoriteRecipeSlugs,
} from "@/lib/favorites";
import {
    getDatabaseFavoriteRecipeSlugs,
    importDatabaseFavoriteRecipeSlugs,
    toggleDatabaseFavoriteRecipe,
} from "@/lib/favoriteApi";

const EMPTY_SLUGS: string[] = [];

export function useFavoriteRecipeSlugs() {
    const localFavoriteRecipeSlugs = useSyncExternalStore(
        subscribeToFavoriteRecipeSlugs,
        getFavoriteRecipeSlugs,
        () => EMPTY_SLUGS
    );

    const [databaseFavoriteRecipeSlugs, setDatabaseFavoriteRecipeSlugs] =
        useState<string[]>([]);

    const [databaseFavoritesLoaded, setDatabaseFavoritesLoaded] =
        useState(false);

    const [isUpdatingFavorite, setIsUpdatingFavorite] = useState(false);
    const [favoriteRecipeLoadError, setFavoriteRecipeLoadError] =
        useState<string | null>(null);
    const [favoriteRecipeImportError, setFavoriteRecipeImportError] =
        useState<string | null>(null);
    const [favoriteRecipeUpdateError, setFavoriteRecipeUpdateError] =
        useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        getDatabaseFavoriteRecipeSlugs()
            .then((favoriteRecipeSlugs) => {
                if (!cancelled) {
                    setDatabaseFavoriteRecipeSlugs(favoriteRecipeSlugs);
                    setFavoriteRecipeLoadError(null);
                }
            })
            .catch((error) => {
                console.error("Failed to load database favorites", error);
                if (!cancelled) {
                    setFavoriteRecipeLoadError(
                        "Favorites could not be loaded from the database."
                    );
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setDatabaseFavoritesLoaded(true);
                }
            });

        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        if (
            !databaseFavoritesLoaded ||
            localFavoriteRecipeSlugs.length === 0
        ) {
            return;
        }

        const missingFavoriteSlugs = localFavoriteRecipeSlugs.filter(
            (recipeSlug) =>
                !databaseFavoriteRecipeSlugs.includes(recipeSlug)
        );

        if (missingFavoriteSlugs.length === 0) {
            return;
        }

        let cancelled = false;

        importDatabaseFavoriteRecipeSlugs(missingFavoriteSlugs)
            .then((favoriteRecipeSlugs) => {
                if (!cancelled) {
                    setDatabaseFavoriteRecipeSlugs(favoriteRecipeSlugs);
                    setFavoriteRecipeImportError(null);
                }
            })
            .catch((error) => {
                console.error("Failed to import local favorites", error);
                if (!cancelled) {
                    setFavoriteRecipeImportError(
                        "Local favorites could not be copied into the database."
                    );
                }
            });

        return () => {
            cancelled = true;
        };
    }, [
        databaseFavoriteRecipeSlugs,
        databaseFavoritesLoaded,
        localFavoriteRecipeSlugs,
    ]);

    const favoriteRecipeSlugs = useMemo(
        () =>
            Array.from(
                new Set([
                    ...localFavoriteRecipeSlugs,
                    ...databaseFavoriteRecipeSlugs,
                ])
            ),
        [
            databaseFavoriteRecipeSlugs,
            localFavoriteRecipeSlugs,
        ]
    );

    async function toggleFavoriteRecipe(recipeSlug: string) {
        if (isUpdatingFavorite) {
            return;
        }

        setIsUpdatingFavorite(true);
        setFavoriteRecipeUpdateError(null);

        try {
            const favoriteRecipeSlugs =
                await toggleDatabaseFavoriteRecipe(recipeSlug);

            if (localFavoriteRecipeSlugs.includes(recipeSlug)) {
                removeFavoriteRecipe(recipeSlug);
            }

            setDatabaseFavoriteRecipeSlugs(favoriteRecipeSlugs);
        } catch (error) {
            console.error("Failed to update database favorite", error);
            setFavoriteRecipeUpdateError(
                "Favorite could not be updated. Please try again."
            );
        } finally {
            setIsUpdatingFavorite(false);
        }
    }

    return {
        favoriteRecipeSlugs,
        favoriteRecipeLoadError,
        favoriteRecipeImportError,
        favoriteRecipeUpdateError,
        isUpdatingFavorite,
        toggleFavoriteRecipe,
    };
}
