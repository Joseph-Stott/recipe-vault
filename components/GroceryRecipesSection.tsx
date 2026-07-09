import RecipeCard from "@/components/RecipeCard";
import { Recipe } from "@/types/recipe";

type GroceryRecipesSectionProps = {
    recipes: Recipe[];
    onRemoveRecipe: (recipe: Recipe) => void;
};

export default function GroceryRecipesSection({
    recipes,
    onRemoveRecipe
}: GroceryRecipesSectionProps) {
    return (
        <section className="mb-8 w-full max-w-6xl rounded-2xl border border-zinc-800 bg-zinc-950/40 p-4">
            <h2 className="mb-3 text-center text-sm font-semibold text-zinc-400">
                🛒 Recipes in Grocery List ({recipes.length})
            </h2>
            <div className="flex flex-wrap justify-center gap-4">
                {recipes.length === 0 ? (
                    <p className="text-center text-sm italic text-zinc-500">
                        No recipes added to grocery list
                    </p>
                ) : (
                    recipes.map((recipe) => {
                        return (
                            <RecipeCard
                                key={recipe.slug}
                                slug={recipe.slug}
                                title={recipe.title}
                                timeCategory={recipe.timeCategory}
                                actionButton={
                                    <button
                                        title="Remove from grocery list"
                                        aria-label="Remove from grocery list"
                                        className="text-zinc-400 hover:text-zinc-100"
                                        onClick={(event) => {
                                            event.preventDefault();
                                            event.stopPropagation();
                                            onRemoveRecipe(recipe);
                                        }}
                                    >
                                        ✕
                                    </button>
                                }
                            />
                        );
                    })
                )}
            </div>
        </section>
    );
}