import { describe, expect, it } from "vitest";
import { 
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