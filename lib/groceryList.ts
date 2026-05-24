export function getGroceryList(): string[] {
    const storedGroceryList = localStorage.getItem("grocery-list");
    if (!storedGroceryList) {
        return [];
    }
    const parsedGroceryList = JSON.parse(storedGroceryList);
    return parsedGroceryList
};

export function addIngredientsToGroceryList(ingredients: string[]) {
    const currentGroceryList = getGroceryList();
    const updatedGroceryList = [...currentGroceryList, ...ingredients];
    localStorage.setItem("grocery-list", JSON.stringify(updatedGroceryList))
};

export function clearGroceryList () {
    localStorage.removeItem("grocery-list");
};

export function getGroceryRecipeSlugs(): string[] {
    const storedGroceryList = localStorage.getItem("grocery-recipe-slugs");
    if (!storedGroceryList) {
        return [];
    }
    const parsedGroceryList = JSON.parse(storedGroceryList);
    return parsedGroceryList;
}

export function addRecipeSlugToGroceryList(slug: string) {
    const currentGroceryList = getGroceryRecipeSlugs();

    const inGroceryList = currentGroceryList.includes(slug);

    if (inGroceryList) {
        return;
    }

    const updatedGroceryList = [...currentGroceryList, slug];

    localStorage.setItem("grocery-recipe-slugs", JSON.stringify(updatedGroceryList));
}

export function clearGroceryRecipeSlugs() {
    localStorage.removeItem("grocery-recipe-slugs");
}

export function removeIngredientsFromGroceryList(ingredientsToRemove: string[]) {
    const currentGroceryList = getGroceryList();
    
    const updatedGroceryList = [...currentGroceryList];

    ingredientsToRemove.forEach((ingredientToRemove) => {
        const indexToRemove = updatedGroceryList.findIndex(
            (ingredient) => ingredient === ingredientToRemove
        );

        if (indexToRemove !== -1) {
            updatedGroceryList.splice(indexToRemove, 1);
        }
    });

    localStorage.setItem("grocery-list", JSON.stringify(updatedGroceryList));
}

export function removeRecipeSlugFromGroceryList(slug: string) {
    const currentGroceryRecipeSlugs = getGroceryRecipeSlugs();

    const updatedGroceryRecipeSlugs = currentGroceryRecipeSlugs.filter(
        (recipeSlug) => recipeSlug !== slug
    );

    localStorage.setItem(
        "grocery-recipe-slugs",
        JSON.stringify(updatedGroceryRecipeSlugs)
    );
}