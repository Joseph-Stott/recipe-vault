import { Recipe } from "@/types/recipe";
import BackButton from "./BackButton";

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

export default function RecipeForm({
    title,
    setTitle,
    timeCategory,
    setTimeCategory,
    ingredientsText,
    setIngredientsText,
    cookInstructionsText,
    setCookInstructionsText,
    cookBook,
    setCookBook,
    pageNumber,
    setPageNumber,
    submitButtonText,
    onSubmit
}: RecipeFormProps) {
    return(
        <>
            <input 
                className="w-full max-w-sm p-2 bg-zinc-900 border border-zinc-400 rounded-lg placeholder:text-center"
                type="text"
                placeholder="Add Title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
            />
            <section className="flex flex-row justify-center gap-2">
                <button
                    className={`cursor-pointer rounded-lg border px-3 py-2 text-sm font-medium ${
                        timeCategory === "fast"
                            ? "bg-green-600 border-green-500"
                            : "border-zinc-600 hover:bg-zinc-800"
                    }`}
                    onClick={() => {
                        setTimeCategory("fast");
                    }}
                >
                    Fast
                </button>
                <button
                    className={`cursor-pointer rounded-lg border px-3 py-2 text-sm font-medium ${
                        timeCategory === "medium"
                            ? "bg-yellow-600 border-yellow-500"
                            : "border-zinc-600 hover:bg-zinc-800"
                    }`}
                    onClick={() => {
                        setTimeCategory("medium");
                    }}
                >
                    Medium
                </button>
                <button
                    className={`cursor-pointer rounded-lg border px-3 py-2 text-sm font-medium ${
                        timeCategory === "slow"
                            ? "bg-red-600 border-red-500"
                            : "border-zinc-600 hover:bg-zinc-800"
                    }`}
                    onClick={() => {
                        setTimeCategory("slow");
                    }}
                >
                    Slow
                </button>
            </section>
            <textarea
                className="w-full max-w-sm p-2 bg-zinc-900 border border-zinc-400 rounded-lg placeholder:text-center"
                placeholder="Ingredients List"
                value={ingredientsText}
                onChange={(event) => setIngredientsText(event.target.value)}
            />
            <textarea
                className="w-full max-w-sm p-2 bg-zinc-900 border border-zinc-400 rounded-lg placeholder:text-center"
                placeholder="Cook Instructions"
                value={cookInstructionsText}
                onChange={(event) => setCookInstructionsText(event.target.value)}
            />
            <input 
                className="w-full max-w-sm p-2 bg-zinc-900 border border-zinc-400 rounded-lg placeholder:text-center"
                type="text"
                placeholder="Book title"
                value={cookBook}
                onChange={(event) => setCookBook(event.target.value)}
            />
            <input 
                className="w-full max-w-sm p-2 bg-zinc-900 border border-zinc-400 rounded-lg placeholder:text-center"
                type="text"
                placeholder="Page number"
                value={pageNumber}
                onChange={(event) => setPageNumber(event.target.value)}
            />
            <button
                className="cursor-pointer rounded-lg border border-zinc-600 px-3 py-2 text-sm font-medium hover:bg-zinc-800"
                onClick={onSubmit}
            >
                {submitButtonText}
            </button>
            <BackButton />
        </>
    )
}