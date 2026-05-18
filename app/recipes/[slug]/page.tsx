import AddToGroceryListButton from "@/components/AddToGroceryListButton";
import { recipes } from "@/data/recipes";
import { addIngredientsToGroceryList } from "@/lib/groceryList";
import Link from "next/link";

type DetailPageProps = {
    params: Promise<{
        slug: string;
    }>;
};

const timeCategoryStyles = {
    fast: "bg-green-600 text-white",
    medium: "bg-yellow-500 text-white",
    slow: "bg-red-600 text-white"
};

export default async function DetailPage(props: DetailPageProps) {

    const params = await props.params;

    const recipe = recipes.find((recipe) => recipe.slug === params.slug);

    if (!recipe) {
        return <p className="text-center text-xl text-zinc-400">No recipe found </p>;
    }

    return (
        <main className="flex min-h-screen flex-col items-center justify-start py-16 bg-zinc-50 px-6 font-sans dark:bg-black">
            <div className="relative w-full max-w-sm overflow-hidden rounded-2xl text-center border border-zinc-700 bg-zinc-900 p-4">
                <div className="flex flex-col gap-4">
                    <h1 className="flex items-center justify-center">
                        <span 
                        className={`absolute left-[-34px] top-4 w-32 rotate-315 text-center text-xs font-semibold ${timeCategoryStyles[recipe.timeCategory]}`}
                        style={{
                            textShadow: `
                            -1px -1px 0 black,
                            1px -1px 0 black,
                            -1px  1px 0 black,
                            1px  1px 0 black
                            `
                        }}
                        >
                            {recipe.timeCategory.charAt(0).toUpperCase() + recipe.timeCategory.slice(1)}
                        </span>
                        <span>{recipe.title}</span>
                    </h1>
                    {recipe.ingredientsList && (
                        <section>
                            <h2>Ingredients:</h2>
                            <ul className="list-disc list-inside text-left text-sm">
                                {recipe.ingredientsList?.map((ingredient) => (<li key={ingredient}>{ingredient}</li>))}
                            </ul>
                        </section>
                    )}
                    {recipe.cookInstructions && (
                        <section>
                            <h2>Cook Instructions:</h2>
                            <ol className="list-decimal list-inside text-left text-sm">
                                {recipe.cookInstructions?.map((instruction) => (<li key={instruction}>{instruction}</li>))}
                            </ol>
                        </section>
                    )}
                    {(recipe.cookBook || recipe.pageNumber) && (
                        <section className="flex justify-center gap-2">
                            {recipe.cookBook && (
                                <span>{recipe.cookBook}</span>
                            )}

                            {recipe.pageNumber && (
                                <span>page {recipe.pageNumber}</span>
                            )}
                        </section>
                    )}
                    <section className="flex items-center justify-between">
                        <AddToGroceryListButton
                            ingredients={recipe.ingredientsList}
                        />
                        <Link
                            href="/grocery-list"
                            className="cursor-pointer rounded-lg border border-zinc-600 px-3 py-2 text-sm font-medium hover:bg-zinc-800"
                        >
                            View Grocery List
                        </Link>
                    </section>
                    <Link 
                        href="/"
                        className="cursor-pointer rounded-lg border border-zinc-600 px-3 py-2 text-sm font-medium hover:bg-zinc-800"
                    >
                        Back to Recipes
                    </Link>
                </div>
            </div>
        </main>
    )
}