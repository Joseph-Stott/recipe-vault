import RecipeCard from "./RecipeCard";
import { Recipe } from "@/types/recipe";
import { getIngredientNames } from "@/lib/recipeUtils";

type RecipeListProps = {
    recipes: Recipe[];
    groceryList: string[];
    searchText: string;
    filteredRecipeCount: number;
};

function getIngredientMatchCount(recipeIngredients: string[], groceryIngredients: string[]) {
    return recipeIngredients.filter((ingredient) =>
        groceryIngredients.includes(ingredient)
    ).length;
}

export default function RecipeList({
    recipes,
    groceryList,
    searchText,
    filteredRecipeCount
}: RecipeListProps) {
    return (
        <>
            <p
                title="Recipes matching the current search"
                className="text-center text-sm text-zinc-500"
            >
                {!searchText
                    ? `${filteredRecipeCount} recipe${filteredRecipeCount === 1 ? "" : "s"} found`
                    : `${filteredRecipeCount} recipe${filteredRecipeCount === 1 ? "" : "s"} found for "${searchText}"`
                }
            </p>

            {filteredRecipeCount === 0 ? (
                <p className="text-center text-xl text-zinc-400">
                    {!searchText ? "No recipes found" : `No recipes match "${searchText}"`}
                </p>
            ) : (
                recipes.map((recipe) => {
                    const matchCount = getIngredientMatchCount(
                        getIngredientNames(recipe),
                        groceryList
                    );

                    return (
                        <RecipeCard
                            slug={recipe.slug}
                            key={recipe.slug}
                            title={recipe.title}
                            timeCategory={recipe.timeCategory}
                            matchCount={matchCount}
                        />
                    );
                })
            )}
        </>
    );

}