import type { Recipe } from "@/types/recipe"
import Link from "next/link"

const timeCategoryStyles = {
    fast: "bg-green-600 text-white",
    medium: "bg-yellow-500 text-white",
    slow: "bg-red-600 text-white"
};

export default function RecipeCard(props: Recipe) {
    return (
        <Link href={`/recipes/${props.slug}`} className="relative w-full max-w-sm  overflow-hidden hover:border-zinc-500 hover:bg-zinc-800 transition-colors duration-200 rounded-2xl text-center border border-zinc-700 bg-zinc-900 p-4">
            <span 
                className={`absolute right-[-34px] top-4 w-32 rotate-45 text-center text-xs font-semibold ${timeCategoryStyles[props.timeCategory]}`}
                style={{
                    textShadow: `
                    -1px -1px 0 black,
                    1px -1px 0 black,
                    -1px  1px 0 black,
                    1px  1px 0 black
                    `
                }}
            >
                {props.timeCategory.charAt(0).toUpperCase() + props.timeCategory.slice(1)}
            </span>

            <div className="flex items-center justify-between gap-4">
                <span>{props.title}</span>
            </div>
        </Link>
    )
}