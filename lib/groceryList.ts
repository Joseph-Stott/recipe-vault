import { Ingredient } from "@/types/recipe";

export type GroceryListItem = Ingredient & {
    id: string;
    checked: boolean;
};

const EMPTY_GROCERY_LIST: GroceryListItem[] = [];

let cachedGroceryListJson: string | null | undefined;
let cachedGroceryList: GroceryListItem[] = EMPTY_GROCERY_LIST;

const EMPTY_GROCERY_RECIPE_SLUGS: string[] = [];

let cachedGroceryRecipeSlugsJson: string | null | undefined;
let cachedGroceryRecipeSlugs: string[] = EMPTY_GROCERY_RECIPE_SLUGS;

type GroceryListListener = () => void;

const groceryListListeners = new Set<GroceryListListener>();

export function subscribeToGroceryList(
    listener: GroceryListListener
) {
    groceryListListeners.add(listener);

    return () => {
        groceryListListeners.delete(listener);
    };
}

function notifyGroceryListListeners() {
    groceryListListeners.forEach((listener) => listener());
}

type GroceryRecipeListener = () => void;

const groceryRecipeListeners = new Set<GroceryRecipeListener>();

export function subscribeToGroceryRecipeSlugs(
    listener: GroceryRecipeListener
) {
    groceryRecipeListeners.add(listener);

    return () => {
        groceryRecipeListeners.delete(listener);
    };
}

function notifyGroceryRecipeListeners() {
    groceryRecipeListeners.forEach((listener) => listener());
}

export function getGroceryList(): GroceryListItem[] {
    const storedGroceryList = localStorage.getItem("grocery-list");

    // Reuse the previous snapshot until the stored data actually changes.
    if (storedGroceryList === cachedGroceryListJson) {
        return cachedGroceryList;
    }

    cachedGroceryListJson = storedGroceryList;

    if (!storedGroceryList) {
        cachedGroceryList = EMPTY_GROCERY_LIST;
        return cachedGroceryList;
    }

    const parsedGroceryList = JSON.parse(storedGroceryList);

    cachedGroceryList = parsedGroceryList.map(
        (
            ingredient: Ingredient & {
                id?: string;
                checked?: boolean;
            },
            index: number
        ) => ({
            ...ingredient,
            id:
                ingredient.id ??
                `${ingredient.amount}-${ingredient.unit}-${ingredient.name}-${index}`,
            checked: ingredient.checked ?? false,
        })
    );

    return cachedGroceryList;
}

export function addIngredientsToGroceryList(ingredients: Ingredient[]) {
    const currentGroceryList = getGroceryList();

    const newGroceryItems: GroceryListItem[] = ingredients.map((ingredient) => ({
        ...ingredient,
        id: crypto.randomUUID(),
        checked: false,
    }));

    const updatedGroceryList = [...currentGroceryList, ...newGroceryItems];

    localStorage.setItem("grocery-list", JSON.stringify(updatedGroceryList));
    notifyGroceryListListeners();
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
    notifyGroceryListListeners();

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
    notifyGroceryListListeners();

    return updatedGroceryList;
}

export function clearGroceryList () {
    localStorage.removeItem("grocery-list");
    notifyGroceryListListeners();
};

export function getGroceryRecipeSlugs(): string[] {
    const storedGroceryList = localStorage.getItem("grocery-recipe-slugs");

    if (storedGroceryList === cachedGroceryRecipeSlugsJson) {
        return cachedGroceryRecipeSlugs;
    }

    cachedGroceryRecipeSlugsJson = storedGroceryList;

    if (!storedGroceryList) {
        cachedGroceryRecipeSlugs = EMPTY_GROCERY_RECIPE_SLUGS;
        return cachedGroceryRecipeSlugs;
    }

    cachedGroceryRecipeSlugs = JSON.parse(storedGroceryList);

    return cachedGroceryRecipeSlugs;
}

export function isRecipeInGroceryList(slug: string) {
    return getGroceryRecipeSlugs().includes(slug);
}

export function addRecipeSlugToGroceryList(slug: string) {
    const currentGroceryList = getGroceryRecipeSlugs();

    const inGroceryList = currentGroceryList.includes(slug);

    if (inGroceryList) {
        return;
    }

    const updatedGroceryList = [...currentGroceryList, slug];

    localStorage.setItem("grocery-recipe-slugs", JSON.stringify(updatedGroceryList));
    notifyGroceryRecipeListeners();
}

export function clearGroceryRecipeSlugs() {
    localStorage.removeItem("grocery-recipe-slugs");
    notifyGroceryRecipeListeners();
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
    notifyGroceryListListeners();
}

export function removeRecipeSlugFromGroceryList(slug: string) {
    const currentGroceryRecipeSlugs = getGroceryRecipeSlugs();

    const updatedGroceryRecipeSlugs = currentGroceryRecipeSlugs.filter(
        (recipeSlug) => recipeSlug !== slug
    );

    localStorage.setItem("grocery-recipe-slugs", JSON.stringify(updatedGroceryRecipeSlugs));
    notifyGroceryRecipeListeners();
}

export function removeRecipeFromGroceryList(slug: string, ingredients: Ingredient[]) {
    removeIngredientsFromGroceryList(ingredients);
    removeRecipeSlugFromGroceryList(slug);
}

export function clearCheckedGroceryItems() {
    const currentGroceryList = getGroceryList();

    const updatedGroceryList = currentGroceryList.filter(
        (ingredient) => !ingredient.checked
    );

    localStorage.setItem("grocery-list", JSON.stringify(updatedGroceryList));
    notifyGroceryListListeners();

    return updatedGroceryList;
}