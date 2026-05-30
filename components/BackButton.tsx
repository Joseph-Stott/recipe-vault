import Link from "next/link";

export default function BackButton() {
    return (
        <Link 
            href="/"
            className="cursor-pointer rounded-lg border border-zinc-600 px-3 py-2 text-sm font-medium hover:bg-zinc-800"
        >
            Back to Recipes
        </Link>
    );
}