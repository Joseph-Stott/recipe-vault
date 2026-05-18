import { recipes } from "@/data/recipes";
import Link from "next/link";

type DetailPageProps = {
    params: Promise<{
        slug: string;
    }>;
};

export default async function DetailPage(props: DetailPageProps) {

    const params = await props.params;

    const recipe = recipes.find((recipe) => recipe.slug === params.slug);

    if (!recipe) {
        return <p className="text-center text-xl text-zinc-400">No recipe found </p>;
    }

    return(
        <main className="flex min-h-screen flex-col items-center justify-start py-16 bg-zinc-50 px-6 font-sans dark:bg-black">
            <div className="w-full max-w-sm rounded-2xl text-center border border-zinc-700 bg-zinc-900 p-4">
                <div className="flex flex-col gap-4">
                    <h1 className="flex items-center justify-between">
                        <span>{recipe.title}</span>
                        <span>{recipe.timeCategory.charAt(0).toUpperCase() + recipe.timeCategory.slice(1) + " cook time"}</span>
                    </h1>
                    {recipe.ingredientsList && (
                        <section>
                            <h2>Ingredients:</h2>
                            <ul className="list-disc list-inside text-left text-sm">
                                {recipe.ingredientsList?.map((ingredient) => (<li>{ingredient}</li>))}
                            </ul>
                        </section>
                    )}
                    {recipe.cookInstructions && (
                        <section>
                            <h2>Cook Instructions:</h2>
                            <ol className="list-decimal list-inside text-left text-sm">
                                {recipe.cookInstructions?.map((instruction) => (<li>{instruction}</li>))}
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
                
                    <Link href="/">Back to Recipes</Link>
                </div>
            </div>
        </main>
    )
}