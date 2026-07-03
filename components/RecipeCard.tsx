import Link from "next/link"
import type { ReactNode } from "react";

const timeCategoryStyles = {
    fast: "bg-green-600 text-white",
    medium: "bg-yellow-500 text-white",
    slow: "bg-red-600 text-white"
};

type RecipeCardProps = {
    slug: string;
    title: string;
    timeCategory: "fast" | "medium" | "slow";
    matchCount?: number;
    isFavorite?: boolean;
    actionButton?: ReactNode;
};

export default function RecipeCard(props: RecipeCardProps) {
    return (
        <Link href={`/recipes/${props.slug}`} className="cursor-pointer relative w-full max-w-sm overflow-hidden hover:border-zinc-500 hover:bg-zinc-800 transition-colors duration-200 rounded-2xl text-center border border-zinc-700 bg-zinc-900 p-4">
            <span 
            className={`absolute left-[-34px] top-4 w-32 rotate-315 text-center text-xs font-semibold ${timeCategoryStyles[props.timeCategory]}`}
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
            <div className="flex flex-col gap-2">
                <div className="relative flex items-center justify-center">
                    <span>{props.title}</span>

                    {props.isFavorite && (
                        <span className="absolute right-4 text-xl leading-none text-zinc-100">
                            ★
                        </span>
                    )}

                    {props.actionButton && (
                        <span className="absolute right-4 text-lg leading-none">
                            {props.actionButton}
                        </span>
                    )}
                </div>

                {props.matchCount !== undefined && props.matchCount > 0 && (
                    <span className="text-sm text-zinc-400">
                        {props.matchCount} grocery {props.matchCount === 1 ? "match" : "matches"}
                    </span>
                )}
            </div>
        </Link>
    )
}