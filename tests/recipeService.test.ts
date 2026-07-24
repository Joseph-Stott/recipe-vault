import { describe, expect, it } from "vitest";
import {
    buildHomeRecipeCollections,
    filterRecipesBySearch,
    getAllRecipes,
    getFavoriteRecipes,
    getGroceryRecipes,
    getMainRecipes,
    sortRecipesByIngredientMatches,
} from "@/lib/recipeService";
import { recipes } from "@/data/recipes";

describe("getAllRecipes", () => {
    it("places saved recipes before built-in recipes", () => {
        const savedRecipe = {
            slug: "custom-recipe",
            title: "Custom Recipe",
            timeCategory: "fast" as const,
            structuredIngredients: [],
        };

        const allRecipes = getAllRecipes([savedRecipe]);

        expect(allRecipes[0]).toEqual(savedRecipe);
    });

    it("keeps the saved recipe when a built-in recipe has the same slug", () => {
        const builtInRecipe = recipes[0];

        const savedRecipe = {
            ...builtInRecipe,
            title: "Edited Recipe Title",
        };

        const allRecipes = getAllRecipes([savedRecipe]);

        const matchingRecipes = allRecipes.filter(
            (recipe) => recipe.slug === builtInRecipe.slug
        );

        expect(matchingRecipes).toHaveLength(1);
        expect(matchingRecipes[0].title).toBe("Edited Recipe Title");
    });
});

describe("filterRecipesBySearch", () => {
    const testRecipes = [
        {
            slug: "chicken-rice",
            title: "Chicken Rice",
            timeCategory: "medium" as const,
            structuredIngredients: [
                { amount: 1, unit: "lb", name: "chicken" },
                { amount: 2, unit: "cups", name: "rice" },
            ],
        },
        {
            slug: "quick-salad",
            title: "Garden Salad",
            timeCategory: "fast" as const,
            structuredIngredients: [
                { amount: 1, unit: "head", name: "lettuce" },
            ],
        },
    ];

    it("filters recipes by title", () => {
        const filteredRecipes = filterRecipesBySearch(
            testRecipes,
            "Chicken"
        );

        expect(filteredRecipes).toEqual([testRecipes[0]]);
    });

    it("matches recipe titles regardless of capitalization", () => {
        const filteredRecipes = filterRecipesBySearch(
            testRecipes,
            "cHiCkEn"
        );

        expect(filteredRecipes).toEqual([testRecipes[0]]);
    });

    it("ignores leading and trailing spaces in the search text", () => {
        const filteredRecipes = filterRecipesBySearch(
            testRecipes,
            "  Chicken  "
        );

        expect(filteredRecipes).toEqual([testRecipes[0]]);
    });

    it("filters recipes by time category", () => {
        const filteredRecipes = filterRecipesBySearch(
            testRecipes,
            "fast"
        );

        expect(filteredRecipes).toEqual([testRecipes[1]]);
    });

    it("filters recipes by ingredient name", () => {
        const filteredRecipes = filterRecipesBySearch(
            testRecipes,
            "lettuce"
        );

        expect(filteredRecipes).toEqual([testRecipes[1]]);
    });

    it("returns an empty array when no recipes match the search", () => {
        const filteredRecipes = filterRecipesBySearch(
            testRecipes,
            "beef"
        );

        expect(filteredRecipes).toEqual([]);
    });
});

describe("getFavoriteRecipes", () => {
    const testRecipes = [
        {
            slug: "recipe-1",
            title: "Recipe 1",
            timeCategory: "fast" as const,
            structuredIngredients: [],
        },
        {
            slug: "recipe-2",
            title: "Recipe 2",
            timeCategory: "medium" as const,
            structuredIngredients: [],
        },
    ];

    it("returns recipes marked as favorites", () => {
        const favoriteRecipes = getFavoriteRecipes(
            testRecipes,
            ["recipe-1"],
            []
        );

        expect(favoriteRecipes).toEqual([testRecipes[0]]);
    });

    it("does not return favorite recipes already in the grocery section", () => {
        const favoriteRecipes = getFavoriteRecipes(
            testRecipes,
            ["recipe-1"],
            ["recipe-1"]
        );

        expect(favoriteRecipes).toEqual([]);
    });
});

describe("getGroceryRecipes", () => {
    const testRecipes = [
        {
            slug: "recipe-1",
            title: "Recipe 1",
            timeCategory: "fast" as const,
            structuredIngredients: [],
        },
        {
            slug: "recipe-2",
            title: "Recipe 2",
            timeCategory: "medium" as const,
            structuredIngredients: [],
        },
    ];

    it("returns recipes that have been added to the grocery section", () => {
        const groceryRecipes = getGroceryRecipes(
            testRecipes,
            ["recipe-2"]
        );

        expect(groceryRecipes).toEqual([testRecipes[1]]);
    });

    it("returns an empty array when no grocery recipe slugs match", () => {
        const groceryRecipes = getGroceryRecipes(
            testRecipes,
            ["recipe-3"]
        );

        expect(groceryRecipes).toEqual([]);
    });
});

describe("getMainRecipes", () => {
    const testRecipes = [
        {
            slug: "recipe-1",
            title: "Recipe 1",
            timeCategory: "fast" as const,
            structuredIngredients: [],
        },
        {
            slug: "recipe-2",
            title: "Recipe 2",
            timeCategory: "medium" as const,
            structuredIngredients: [],
        },
    ];

    it("excludes favorite recipes", () => {
        const mainRecipes = getMainRecipes(
            testRecipes,
            ["recipe-1"],
            []
        );

        expect(mainRecipes).toEqual([testRecipes[1]]);
    });

    it("excludes grocery recipes", () => {
        const mainRecipes = getMainRecipes(
            testRecipes,
            [],
            ["recipe-2"]
        );

        expect(mainRecipes).toEqual([testRecipes[0]]);
    });

    it("returns only recipes that are not favorites or grocery recipes", () => {
        const recipesWithMainRecipe = [
            ...testRecipes,
            {
                slug: "recipe-3",
                title: "Recipe 3",
                timeCategory: "slow" as const,
                structuredIngredients: [],
            },
        ];

        const mainRecipes = getMainRecipes(
            recipesWithMainRecipe,
            ["recipe-1"],
            ["recipe-2"]
        );

        expect(mainRecipes).toEqual([recipesWithMainRecipe[2]]);
    });
});

describe("sortRecipesByIngredientMatches", () => {
    it("sorts recipes from most ingredient matches to fewest", () => {
        const testRecipes = [
            {
                slug: "recipe-1",
                title: "Recipe 1",
                timeCategory: "fast" as const,
                structuredIngredients: [
                    { amount: 1, unit: "", name: "chicken" },
                ],
            },
            {
                slug: "recipe-2",
                title: "Recipe 2",
                timeCategory: "medium" as const,
                structuredIngredients: [
                    { amount: 1, unit: "", name: "chicken" },
                    { amount: 1, unit: "", name: "rice" },
                ],
            },
        ];

        const sortedRecipes = sortRecipesByIngredientMatches(
            testRecipes,
            ["chicken", "rice"]
        );

        expect(sortedRecipes).toEqual([
            testRecipes[1],
            testRecipes[0],
        ]);
    });

    it("does not modify the original recipe array", () => {
        const testRecipes = [
            {
                slug: "recipe-1",
                title: "Recipe 1",
                timeCategory: "fast" as const,
                structuredIngredients: [
                    { amount: 1, unit: "", name: "chicken" },
                ],
            },
            {
                slug: "recipe-2",
                title: "Recipe 2",
                timeCategory: "medium" as const,
                structuredIngredients: [
                    { amount: 1, unit: "", name: "chicken" },
                    { amount: 1, unit: "", name: "rice" },
                ],
            },
        ];

        const originalOrder = [...testRecipes];

        sortRecipesByIngredientMatches(
            testRecipes,
            ["chicken", "rice"]
        );

        expect(testRecipes).toEqual(originalOrder);
    });

    it("places recipes with no ingredient matches after recipes with matches", () => {
        const testRecipes = [
            {
                slug: "recipe-1",
                title: "Recipe 1",
                timeCategory: "fast" as const,
                structuredIngredients: [
                    { amount: 1, unit: "", name: "chicken" },
                ],
            },
            {
                slug: "recipe-2",
                title: "Recipe 2",
                timeCategory: "medium" as const,
                structuredIngredients: [
                    { amount: 1, unit: "", name: "beef" },
                ],
            },
        ];

        const sortedRecipes = sortRecipesByIngredientMatches(
            testRecipes,
            ["chicken"]
        );

        expect(sortedRecipes).toEqual([
            testRecipes[0],
            testRecipes[1],
        ]);
    });
});

describe("buildHomeRecipeCollections", () => {
    it("separates grocery, favorite, and main recipes", () => {
        const savedRecipes = [
            {
                slug: "grocery-recipe",
                title: "Grocery Recipe",
                timeCategory: "fast" as const,
                structuredIngredients: [],
            },
            {
                slug: "favorite-recipe",
                title: "Favorite Recipe",
                timeCategory: "medium" as const,
                structuredIngredients: [],
            },
            {
                slug: "main-recipe",
                title: "Main Recipe",
                timeCategory: "slow" as const,
                structuredIngredients: [],
            },
        ];

        const collections = buildHomeRecipeCollections({
            savedRecipes,
            searchText: "",
            favoriteRecipeSlugs: ["favorite-recipe"],
            groceryRecipeSlugs: ["grocery-recipe"],
            groceryIngredients: [],
        });

        expect(collections.groceryRecipes).toEqual([
            savedRecipes[0],
        ]);

        expect(collections.sortedFavoriteRecipes).toEqual([
            savedRecipes[1],
        ]);

        expect(collections.sortedRecipes).toContainEqual(
            savedRecipes[2]
        );
    });

    it("applies the search filter before building recipe collections", () => {
        const savedRecipes = [
            {
                slug: "chicken-recipe",
                title: "Chicken Recipe",
                timeCategory: "fast" as const,
                structuredIngredients: [],
            },
            {
                slug: "beef-recipe",
                title: "Beef Recipe",
                timeCategory: "medium" as const,
                structuredIngredients: [],
            },
        ];

        const collections = buildHomeRecipeCollections({
            savedRecipes,
            searchText: "Chicken",
            favoriteRecipeSlugs: [],
            groceryRecipeSlugs: [],
            groceryIngredients: [],
        });

        expect(collections.filteredRecipes).toContainEqual(
            savedRecipes[0]
        );

        expect(collections.filteredRecipes).not.toContainEqual(
            savedRecipes[1]
        );

        expect(collections.sortedRecipes).toContainEqual(
            savedRecipes[0]
        );

        expect(collections.sortedRecipes).not.toContainEqual(
            savedRecipes[1]
        );
    });

    it("sorts favorite and main recipes by grocery ingredient matches", () => {
        const savedRecipes = [
            {
                slug: "favorite-one-match",
                title: "Favorite One Match",
                timeCategory: "fast" as const,
                structuredIngredients: [
                    { amount: 1, unit: "", name: "chicken" },
                ],
            },
            {
                slug: "favorite-two-matches",
                title: "Favorite Two Matches",
                timeCategory: "medium" as const,
                structuredIngredients: [
                    { amount: 1, unit: "", name: "chicken" },
                    { amount: 1, unit: "", name: "rice" },
                ],
            },
            {
                slug: "main-one-match",
                title: "Main One Match",
                timeCategory: "fast" as const,
                structuredIngredients: [
                    { amount: 1, unit: "", name: "chicken" },
                ],
            },
            {
                slug: "main-two-matches",
                title: "Main Two Matches",
                timeCategory: "medium" as const,
                structuredIngredients: [
                    { amount: 1, unit: "", name: "chicken" },
                    { amount: 1, unit: "", name: "rice" },
                ],
            },
        ];

        const collections = buildHomeRecipeCollections({
            savedRecipes,
            searchText: "",
            favoriteRecipeSlugs: [
                "favorite-one-match",
                "favorite-two-matches",
            ],
            groceryRecipeSlugs: [],
            groceryIngredients: ["chicken", "rice"],
        });

        expect(collections.sortedFavoriteRecipes.slice(0, 2)).toEqual([
            savedRecipes[1],
            savedRecipes[0],
        ]);

        const mainSavedRecipes = collections.sortedRecipes.filter(
            (recipe) =>
                recipe.slug === "main-one-match" ||
                recipe.slug === "main-two-matches"
        );

        expect(mainSavedRecipes).toEqual([
            savedRecipes[3],
            savedRecipes[2],
        ]);
    });
});