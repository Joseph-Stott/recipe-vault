import { Recipe } from "@/types/recipe";
import Link from "next/link";

type RecipeFormProps = {
    title: string;
    setTitle: (title: string) => void;
    timeCategory: Recipe["timeCategory"];
    setTimeCategory: (timeCategory: Recipe["timeCategory"]) => void;
    ingredientsText: string;
    setIngredientsText: (ingredientsText: string) => void;
    cookInstructionsText: string;
    setCookInstructionsText: (cookInstructionsText: string) => void;
    cookBook: string;
    setCookBook: (cookBook: string) => void;
    pageNumber: string;
    setPageNumber: (pageNumber: string) => void;
    submitButtonText: string;
    onSubmit: () => void;
};

export default function RecipeForm(props: RecipeFormProps) {
    return(
        <>
            <input 
                className="w-full max-w-sm p-2 bg-zinc-900 border border-zinc-400 rounded-lg placeholder:text-center"
                type="text"
                placeholder="Add Title"
                value={props.title}
                onChange={(event) => props.setTitle(event.target.value)}
            />
            <section className="flex flex-row justify-center gap-2">
                <button
                    className={`cursor-pointer rounded-lg border px-3 py-2 text-sm font-medium ${
                        props.timeCategory === "fast"
                            ? "bg-green-600 border-green-500"
                            : "border-zinc-600 hover:bg-zinc-800"
                    }`}
                    onClick={() => {
                        props.setTimeCategory("fast");
                    }}
                >
                    Fast
                </button>
                <button
                    className={`cursor-pointer rounded-lg border px-3 py-2 text-sm font-medium ${
                        props.timeCategory === "medium"
                            ? "bg-yellow-600 border-yellow-500"
                            : "border-zinc-600 hover:bg-zinc-800"
                    }`}
                    onClick={() => {
                        props.setTimeCategory("medium");
                    }}
                >
                    Medium
                </button>
                <button
                    className={`cursor-pointer rounded-lg border px-3 py-2 text-sm font-medium ${
                        props.timeCategory === "slow"
                            ? "bg-red-600 border-red-500"
                            : "border-zinc-600 hover:bg-zinc-800"
                    }`}
                    onClick={() => {
                        props.setTimeCategory("slow");
                    }}
                >
                    Slow
                </button>
            </section>
            <textarea
                className="w-full max-w-sm p-2 bg-zinc-900 border border-zinc-400 rounded-lg placeholder:text-center"
                placeholder="Ingredients List"
                value={props.ingredientsText}
                onChange={(event) => props.setIngredientsText(event.target.value)}
            />
            <textarea
                className="w-full max-w-sm p-2 bg-zinc-900 border border-zinc-400 rounded-lg placeholder:text-center"
                placeholder="Cook Instructions"
                value={props.cookInstructionsText}
                onChange={(event) => props.setCookInstructionsText(event.target.value)}
            />
            <input 
                className="w-full max-w-sm p-2 bg-zinc-900 border border-zinc-400 rounded-lg placeholder:text-center"
                type="text"
                placeholder="Book title"
                value={props.cookBook}
                onChange={(event) => props.setCookBook(event.target.value)}
            />
            <input 
                className="w-full max-w-sm p-2 bg-zinc-900 border border-zinc-400 rounded-lg placeholder:text-center"
                type="text"
                placeholder="Page number"
                value={props.pageNumber}
                onChange={(event) => props.setPageNumber(event.target.value)}
            />
            <button
                className="cursor-pointer rounded-lg border border-zinc-600 px-3 py-2 text-sm font-medium hover:bg-zinc-800"
                onClick={props.onSubmit}
            >
                {props.submitButtonText}
            </button>
            <Link 
                href="/"
                className="cursor-pointer rounded-lg border border-zinc-600 px-3 py-2 text-sm font-medium hover:bg-zinc-800"
            >
                Back to recipes
            </Link>
        </>
    )
}