const EMPTY_FAVORITE_RECIPE_SLUGS: string[] = [];

let cachedFavoriteRecipeSlugsJson: string | null | undefined;
let cachedFavoriteRecipeSlugs: string[] = EMPTY_FAVORITE_RECIPE_SLUGS;

type FavoriteRecipeListener = () => void;

const favoriteRecipeListeners = new Set<FavoriteRecipeListener>();

export function subscribeToFavoriteRecipeSlugs(
    listener: FavoriteRecipeListener
) {
    favoriteRecipeListeners.add(listener);

    return () => {
        favoriteRecipeListeners.delete(listener);
    };
}

function notifyFavoriteRecipeListeners() {
    favoriteRecipeListeners.forEach((listener) => listener());
}

export function getFavoriteRecipeSlugs(): string[] {
    const storedFavoriteList = localStorage.getItem("favorite-list");

    if (storedFavoriteList === cachedFavoriteRecipeSlugsJson) {
        return cachedFavoriteRecipeSlugs;
    }

    cachedFavoriteRecipeSlugsJson = storedFavoriteList;

    if (!storedFavoriteList) {
        cachedFavoriteRecipeSlugs = EMPTY_FAVORITE_RECIPE_SLUGS;
        return cachedFavoriteRecipeSlugs;
    }

    cachedFavoriteRecipeSlugs = JSON.parse(storedFavoriteList);

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

export function isFavoriteRecipe(slug: string) {
    const favoriteSlugs = getFavoriteRecipeSlugs();
    
    return favoriteSlugs.includes(slug);
}