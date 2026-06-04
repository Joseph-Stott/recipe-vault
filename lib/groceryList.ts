import { Ingredient } from "@/types/recipe";

export type GroceryListItem = Ingredient & {
    id: string;
    checked: boolean;
};

export function getGroceryList(): GroceryListItem[] {
    const storedGroceryList = localStorage.getItem("grocery-list");
    if (!storedGroceryList) {
        return [];
    }
    const parsedGroceryList = JSON.parse(storedGroceryList);

    return parsedGroceryList.map((ingredient: Ingredient & { id?: string; checked?: boolean}, index: number) => ({
        ...ingredient,
        id: ingredient.id ?? `${ingredient.amount}-${ingredient.unit}-${ingredient.name}-${index}`,
        checked: ingredient.checked ?? false,
    }));
};

export function addIngredientsToGroceryList(ingredients: Ingredient[]) {
    const currentGroceryList = getGroceryList();

    const newGroceryItems: GroceryListItem[] = ingredients.map((ingredient) => ({
        ...ingredient,
        id: crypto.randomUUID(),
        checked: false,
    }));

    const updatedGroceryList = [...currentGroceryList, ...newGroceryItems];

    localStorage.setItem("grocery-list", JSON.stringify(updatedGroceryList))
};

export function toggleGroceryItemChecked(id: string) {
    const currentGroceryList = getGroceryList();

    const updatedGroceryList = currentGroceryList.map((ingredient) => {
        if (ingredient.id !== id) {
            return ingredient;
        }

        return {
            ...ingredient,
            checked: !ingredient.checked,
        };
    });

    localStorage.setItem("grocery-list", JSON.stringify(updatedGroceryList));

    return updatedGroceryList;
}

export function toggleGroceryItemsChecked(ids: string[]) {
    const currentGroceryList = getGroceryList();

    const shouldCheckItems = currentGroceryList.some(
        (ingredient) => ids.includes(ingredient.id) && !ingredient.checked
    );

    const updatedGroceryList = currentGroceryList.map((ingredient) => {
        if (!ids.includes(ingredient.id)) {
            return ingredient;
        }

        return {
            ...ingredient,
            checked: shouldCheckItems,
        };
    });

    localStorage.setItem("grocery-list", JSON.stringify(updatedGroceryList));

    return updatedGroceryList;
}

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

export function removeIngredientsFromGroceryList(ingredientsToRemove: Ingredient[]) {
    const currentGroceryList = getGroceryList();
    
    const updatedGroceryList = [...currentGroceryList];

    // Remove only the first matching occurrence so shared ingredients
    // from other recipes remain in the grocery list
    ingredientsToRemove.forEach((ingredientToRemove) => {
        const indexToRemove = updatedGroceryList.findIndex(
            (ingredient) =>
                ingredient.amount === ingredientToRemove.amount &&
                ingredient.unit === ingredientToRemove.unit &&
                ingredient.name === ingredientToRemove.name
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

export function clearCheckedGroceryItems() {
    const currentGroceryList = getGroceryList();

    const updatedGroceryList = currentGroceryList.filter(
        (ingredient) => !ingredient.checked
    );

    localStorage.setItem("grocery-list", JSON.stringify(updatedGroceryList));

    return updatedGroceryList;
}