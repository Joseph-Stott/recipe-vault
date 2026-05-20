export function getFavoriteRecipeSlugs(): string[] {
    const storedFavoriteList = localStorage.getItem("favorite-list");
    if (!storedFavoriteList) {
        return [];
    }
    const parsedFavoriteList = JSON.parse(storedFavoriteList);
    return parsedFavoriteList
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
}

export function isFavoriteRecipe(slug: string) {
    const favoriteSlugs = getFavoriteRecipeSlugs();
    
    return favoriteSlugs.includes(slug);
}