import { beforeEach, describe, expect, it, vi } from "vitest";
import {
    addIngredientsToGroceryList,
    addRecipeSlugToGroceryList,
    clearCheckedGroceryItems,
    clearGroceryRecipeSlugs,
    getGroceryList,
    getGroceryRecipeSlugs,
    removeIngredientsFromGroceryList,
    removeRecipeFromGroceryList,
    removeRecipeSlugFromGroceryList,
    toggleGroceryItemChecked,
    toggleGroceryItemsChecked,
} from "@/lib/groceryList";

const storage = new Map<string, string>();

vi.stubGlobal("localStorage", {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => {
        storage.set(key, value);
    },
    removeItem: (key: string) => {
        storage.delete(key);
    },
    clear: () => {
        storage.clear();
    },
});

describe("groceryList", () => {
    beforeEach(() => {
        storage.clear();
    });

    it("adds new grocery items as unchecked", () => {
        addIngredientsToGroceryList([
            {
                amount: 1,
                unit: "cup",
                name: "rice",
            },
        ]);

        expect(getGroceryList()).toEqual([
            expect.objectContaining({
                amount: 1,
                unit: "cup",
                name: "rice",
                checked: false,
            }),
        ]);
    });

    it("returns an empty grocery list when nothing is stored", () => {
        expect(getGroceryList()).toEqual([]);
    });

    it("adds missing fields to grocery items from older storage data", () => {
        storage.set(
            "grocery-list",
            JSON.stringify([
                {
                    amount: 1,
                    unit: "cup",
                    name: "rice",
                },
            ])
        );

        const groceryList = getGroceryList();

        expect(groceryList).toEqual([
            {
                amount: 1,
                unit: "cup",
                name: "rice",
                id: "1-cup-rice-0",
                checked: false,
            },
        ]);
    });

    it("adds multiple grocery items", () => {
        addIngredientsToGroceryList([
            {
                amount: 1,
                unit: "cup",
                name: "rice",
            },
            {
                amount: 2,
                unit: "tbsp",
                name: "soy sauce",
            },
        ]);

        const groceryList = getGroceryList();

        expect(groceryList).toHaveLength(2);

        expect(groceryList).toEqual([
            expect.objectContaining({
                amount: 1,
                unit: "cup",
                name: "rice",
                checked: false,
            }),
            expect.objectContaining({
                amount: 2,
                unit: "tbsp",
                name: "soy sauce",
                checked: false,
            }),
        ]);
    });

    it("marks a grocery item as checked", () => {
        addIngredientsToGroceryList([
            {
                amount: 1,
                unit: "cup",
                name: "rice",
            },
        ]);

        const [groceryItem] = getGroceryList();

        const updatedGroceryList = toggleGroceryItemChecked(
            groceryItem.id
        );

        expect(updatedGroceryList[0].checked).toBe(true);
        expect(getGroceryList()[0].checked).toBe(true);
    });

    it("marks a checked grocery item as unchecked", () => {
        addIngredientsToGroceryList([
            {
                amount: 1,
                unit: "cup",
                name: "rice",
            },
        ]);

        const [groceryItem] = getGroceryList();

        toggleGroceryItemChecked(groceryItem.id);

        const updatedGroceryList = toggleGroceryItemChecked(
            groceryItem.id
        );

        expect(updatedGroceryList[0].checked).toBe(false);
        expect(getGroceryList()[0].checked).toBe(false);
    });

    it("marks multiple grocery items as checked", () => {
        addIngredientsToGroceryList([
            {
                amount: 1,
                unit: "cup",
                name: "rice",
            },
            {
                amount: 2,
                unit: "cups",
                name: "rice",
            },
        ]);

        const groceryList = getGroceryList();
        const itemIds = groceryList.map((item) => item.id);

        const updatedGroceryList = toggleGroceryItemsChecked(itemIds);

        expect(
            updatedGroceryList.every((item) => item.checked)
        ).toBe(true);

        expect(
            getGroceryList().every((item) => item.checked)
        ).toBe(true);
    });

    it("marks multiple checked grocery items as unchecked", () => {
        addIngredientsToGroceryList([
            {
                amount: 1,
                unit: "cup",
                name: "rice",
            },
            {
                amount: 2,
                unit: "cups",
                name: "rice",
            },
        ]);

        const groceryList = getGroceryList();
        const itemIds = groceryList.map((item) => item.id);

        toggleGroceryItemsChecked(itemIds);

        const updatedGroceryList = toggleGroceryItemsChecked(itemIds);

        expect(
            updatedGroceryList.every((item) => !item.checked)
        ).toBe(true);

        expect(
            getGroceryList().every((item) => !item.checked)
        ).toBe(true);
    });

    it("does not change grocery items whose ids are not selected", () => {
        addIngredientsToGroceryList([
            {
                amount: 1,
                unit: "cup",
                name: "rice",
            },
            {
                amount: 2,
                unit: "cups",
                name: "milk",
            },
        ]);

        const groceryList = getGroceryList();
        const riceItem = groceryList[0];
        const milkItem = groceryList[1];

        const updatedGroceryList = toggleGroceryItemsChecked([
            riceItem.id,
        ]);

        expect(updatedGroceryList[0].checked).toBe(true);
        expect(updatedGroceryList[1].checked).toBe(false);

        expect(
            updatedGroceryList[1].id
        ).toBe(milkItem.id);
    });

    it("removes checked grocery items", () => {
        addIngredientsToGroceryList([
            {
                amount: 1,
                unit: "cup",
                name: "rice",
            },
            {
                amount: 2,
                unit: "cups",
                name: "milk",
            },
        ]);

        const groceryList = getGroceryList();

        toggleGroceryItemChecked(groceryList[0].id);

        const updatedGroceryList = clearCheckedGroceryItems();

        expect(updatedGroceryList).toHaveLength(1);
        expect(updatedGroceryList[0]).toEqual(
            expect.objectContaining({
                amount: 2,
                unit: "cups",
                name: "milk",
                checked: false,
            })
        );
    });

    it("persists the grocery list after clearing checked items", () => {
        addIngredientsToGroceryList([
            {
                amount: 1,
                unit: "cup",
                name: "rice",
            },
            {
                amount: 2,
                unit: "cups",
                name: "milk",
            },
        ]);

        const groceryList = getGroceryList();

        toggleGroceryItemChecked(groceryList[0].id);
        clearCheckedGroceryItems();

        expect(getGroceryList()).toEqual([
            expect.objectContaining({
                amount: 2,
                unit: "cups",
                name: "milk",
                checked: false,
            }),
        ]);
    });

    it("leaves the grocery list unchanged when no items are checked", () => {
        addIngredientsToGroceryList([
            {
                amount: 1,
                unit: "cup",
                name: "rice",
            },
        ]);

        const originalGroceryList = getGroceryList();

        const updatedGroceryList = clearCheckedGroceryItems();

        expect(updatedGroceryList).toEqual(originalGroceryList);
        expect(getGroceryList()).toEqual(originalGroceryList);
    });

    it("returns an empty recipe slug list when nothing is stored", () => {
        expect(getGroceryRecipeSlugs()).toEqual([]);
    });

    it("adds a recipe slug to grocery storage", () => {
        addRecipeSlugToGroceryList("chicken-rice");

        expect(getGroceryRecipeSlugs()).toEqual([
            "chicken-rice",
        ]);
    });

    it("does not add a duplicate grocery recipe slug", () => {
        addRecipeSlugToGroceryList("chicken-rice");
        addRecipeSlugToGroceryList("chicken-rice");

        expect(getGroceryRecipeSlugs()).toEqual([
            "chicken-rice",
        ]);
    });

    it("removes a recipe slug from grocery storage", () => {
        addRecipeSlugToGroceryList("chicken-rice");
        addRecipeSlugToGroceryList("garden-salad");

        removeRecipeSlugFromGroceryList("chicken-rice");

        expect(getGroceryRecipeSlugs()).toEqual([
            "garden-salad",
        ]);
    });

    it("clears all grocery recipe slugs", () => {
        addRecipeSlugToGroceryList("chicken-rice");
        addRecipeSlugToGroceryList("garden-salad");

        clearGroceryRecipeSlugs();

        expect(getGroceryRecipeSlugs()).toEqual([]);
    });

    it("removes only one matching occurrence of a shared ingredient", () => {
        const sharedIngredient = {
            amount: 1,
            unit: "cup",
            name: "rice",
        };

        addIngredientsToGroceryList([
            sharedIngredient,
            sharedIngredient,
            {
                amount: 2,
                unit: "cups",
                name: "milk",
            },
        ]);

        removeIngredientsFromGroceryList([
            sharedIngredient,
        ]);

        const groceryList = getGroceryList();

        expect(groceryList).toHaveLength(2);

        expect(
            groceryList.filter((item) => item.name === "rice")
        ).toHaveLength(1);

        expect(groceryList).toContainEqual(
            expect.objectContaining({
                amount: 2,
                unit: "cups",
                name: "milk",
            })
        );
    });

    it("removes a recipe's ingredients and grocery slug together", () => {
        const chickenIngredients = [
            {
                amount: 1,
                unit: "lb",
                name: "chicken",
            },
        ];

        const saladIngredients = [
            {
                amount: 1,
                unit: "head",
                name: "lettuce",
            },
        ];

        addIngredientsToGroceryList([
            ...chickenIngredients,
            ...saladIngredients,
        ]);

        addRecipeSlugToGroceryList("chicken-recipe");
        addRecipeSlugToGroceryList("salad-recipe");

        removeRecipeFromGroceryList(
            "chicken-recipe",
            chickenIngredients
        );

        expect(getGroceryList()).toEqual([
            expect.objectContaining({
                amount: 1,
                unit: "head",
                name: "lettuce",
            }),
        ]);

        expect(getGroceryRecipeSlugs()).toEqual([
            "salad-recipe",
        ]);
    });
});