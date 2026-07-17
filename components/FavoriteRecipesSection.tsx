import RecipeCard from "@/components/RecipeCard";
import { Recipe } from "@/types/recipe";
import { getRecipeIngredientMatchCount } from "@/lib/recipeUtils";

type FavoriteRecipesSectionProps = {
    recipes: Recipe[];
    groceryList: string[];
};

export default function FavoriteRecipesSection({
    recipes,
    groceryList
}: FavoriteRecipesSectionProps) {
    return (
        <section className="mb-8 w-full max-w-6xl rounded-2xl border border-zinc-800 bg-zinc-950/40 p-4">
            <h2 className="mb-3 text-center text-sm font-semibold text-zinc-400">
                ⭐ Favorite Recipes ({recipes.length})
            </h2>
            <div className="flex flex-wrap justify-center gap-4">
                {recipes.length === 0 ? (
                    <p className="text-center text-sm italic text-zinc-500">
                        No favorite recipes yet
                    </p>
                ) : (
                    recipes.map((recipe) => {
                        const matchCount = getRecipeIngredientMatchCount(
                            recipe,
                            groceryList
                        );

                        return (
                            <RecipeCard
                                key={recipe.slug}
                                slug={recipe.slug}
                                title={recipe.title}
                                timeCategory={recipe.timeCategory}
                                isFavorite={true}
                                matchCount={matchCount}
                            />
                        );
                    })
                )}
            </div>
        </section>
    );
}