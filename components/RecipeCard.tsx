import type { Recipe } from "@/types/recipe"
import Link from "next/link"

export default function RecipeCard(props: Recipe) {
    return (
        <div className="w-full max-w-sm rounded-2xl text-center border border-zinc-700 bg-zinc-900 p-4">
            <div className="flex items-center justify-between gap-4">
                <span>{props.title}</span>
                <span>{props.timeCategory.charAt(0).toUpperCase() + props.timeCategory.slice(1)}</span>
                <Link href={`/recipes/${props.slug}`}>View recipe</Link>
            </div>
        </div>
    )
}