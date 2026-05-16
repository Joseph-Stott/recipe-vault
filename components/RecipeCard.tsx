import type { Recipe } from "@/types/recipe"

export default function RecipeCard(props: Recipe) {
    return (
        <div className="w-full max-w-sm rounded-2xl text-center border border-zinc-700 bg-zinc-900 p-6">
            <h2 className="text-xl font-semibold">
                {props.title}
            </h2>
            <div className="mt-4 flex justify-between">
                <span>{props.cuisine}</span>
                <span>{props.cookTime}</span>
            </div>
            <p className="text-sm p-2 text-zinc-400">
                {props.description}
            </p>
        </div>
    )
}