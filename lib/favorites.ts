import { preserveLegacyData } from "@/lib/legacyRecovery";
import { isStoredSlugList, parseBrowserValue, readBrowserValue } from "@/lib/browserStorage";

const EMPTY_FAVORITE_RECIPE_SLUGS: string[] = [];

let cachedFavoriteRecipeSlugsJson: string | null | undefined;
let cachedFavoriteRecipeSlugs: string[] = EMPTY_FAVORITE_RECIPE_SLUGS;

type FavoriteRecipeListener = () => void;

const favoriteRecipeListeners = new Set<FavoriteRecipeListener>();

export function subscribeToFavoriteRecipeSlugs(
    listener: FavoriteRecipeListener
) {
    favoriteRecipeListeners.add(listener);
    const onStorage = (event: StorageEvent) => {
        if (event.storageArea === localStorage &&
            (event.key === "favorite-list" || event.key === null)) listener();
    };
    if (typeof window !== "undefined") window.addEventListener("storage", onStorage);

    return () => {
        favoriteRecipeListeners.delete(listener);
        if (typeof window !== "undefined") window.removeEventListener("storage", onStorage);
    };
}

function notifyFavoriteRecipeListeners() {
    favoriteRecipeListeners.forEach((listener) => listener());
}

export function getFavoriteRecipeSlugs(): string[] {
    const storedFavoriteList = readBrowserValue("favorite-list");

    if (storedFavoriteList === cachedFavoriteRecipeSlugsJson) {
        return cachedFavoriteRecipeSlugs;
    }

    if (storedFavoriteList === null) {
        cachedFavoriteRecipeSlugs = EMPTY_FAVORITE_RECIPE_SLUGS;
        cachedFavoriteRecipeSlugsJson = storedFavoriteList;
        return cachedFavoriteRecipeSlugs;
    }

    cachedFavoriteRecipeSlugs = parseBrowserValue<string[]>("favorite-list", storedFavoriteList, isStoredSlugList);
    cachedFavoriteRecipeSlugsJson = storedFavoriteList;

    return cachedFavoriteRecipeSlugs;
}

export function toggleFavoriteRecipe(slug: string) {
    const currentFavoriteList = getFavoriteRecipeSlugs();

    const isFavorite = currentFavoriteList.includes(slug);

    let updatedFavoriteList: string[];

    if (isFavorite) {
        updatedFavoriteList = currentFavoriteList.filter(
            (favoriteSlug) => favoriteSlug !== slug
        );
    } else {
        updatedFavoriteList = [...currentFavoriteList, slug];
    }
    localStorage.setItem("favorite-list", JSON.stringify(updatedFavoriteList));
    notifyFavoriteRecipeListeners();
}

export function removeFavoriteRecipe(slug: string) {
    const currentFavoriteList = getFavoriteRecipeSlugs();

    if (!currentFavoriteList.includes(slug)) {
        return;
    }

    const updatedFavoriteList = currentFavoriteList.filter(
        (favoriteSlug) => favoriteSlug !== slug
    );

    localStorage.setItem("favorite-list", JSON.stringify(updatedFavoriteList));
    notifyFavoriteRecipeListeners();
}

export function isFavoriteRecipe(slug: string) {
    const favoriteSlugs = getFavoriteRecipeSlugs();
    
    return favoriteSlugs.includes(slug);
}

export function retireFavoriteRecipes(confirmedSlugs: readonly string[]) {
    const confirmed = new Set(confirmedSlugs);
    const current = getFavoriteRecipeSlugs();
    const migrated = current.filter((slug) => confirmed.has(slug.trim()));
    if (migrated.length === 0) return;

    preserveLegacyData([], migrated);
    localStorage.setItem("favorite-list", JSON.stringify(
        current.filter((slug) => !confirmed.has(slug.trim()))
    ));
    notifyFavoriteRecipeListeners();
}
