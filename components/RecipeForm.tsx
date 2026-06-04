import { Recipe, Ingredient } from "@/types/recipe";
import BackButton from "./BackButton";

type RecipeFormProps = {
    title: string;
    setTitle: (title: string) => void;
    timeCategory: Recipe["timeCategory"];
    setTimeCategory: (timeCategory: Recipe["timeCategory"]) => void;
    structuredIngredients: Ingredient[];
    setStructuredIngredients: (structuredIngredients: Ingredient[]) => void;
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
    structuredIngredients,
    setStructuredIngredients,
    cookInstructionsText,
    setCookInstructionsText,
    cookBook,
    setCookBook,
    pageNumber,
    setPageNumber,
    submitButtonText,
    onSubmit
}: RecipeFormProps) {
    function updateStructuredIngredient(
        index: number,
        field: keyof Ingredient,
        value: string
    ) {
        const updatedIngredients = [...structuredIngredients];

        updatedIngredients[index] = {
            ...updatedIngredients[index],
            [field]: value
        };

        setStructuredIngredients(updatedIngredients);
    }

    function removeStructuredIngredient (
        index: number
    ) {
        const updatedIngredients = structuredIngredients.filter(
            (_, ingredientIndex) => ingredientIndex !== index
        );

        setStructuredIngredients(updatedIngredients);
    }

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
            <section className="flex flex-col gap-2">
                <h2 className="text-sm font-semibold text-zinc-300">
                    Structured Ingredients
                </h2>

                <button
                    className="cursor-pointer rounded-lg border border-zinc-600 px-3 py-2 text-sm font-medium hover:bg-zinc-800"
                    onClick={() => {
                        setStructuredIngredients([
                            ...structuredIngredients,
                            { amount: "", unit: "", name: "" }
                        ]);
                    }}
                >
                    Add Ingredient
                </button>
                {structuredIngredients.map((ingredient, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <input
                            className="w-16 rounded-lg border border-zinc-600 bg-zinc-900 p-2 text-sm"
                            type="text"
                            placeholder="Amt"
                            value={ingredient.amount}
                            onChange={(event) =>
                                updateStructuredIngredient(index, "amount", event.target.value)
                            }
                        />

                        <input
                            className="w-20 rounded-lg border border-zinc-600 bg-zinc-900 p-2 text-sm"
                            type="text"
                            placeholder="Unit"
                            value={ingredient.unit}
                            onChange={(event) =>
                                updateStructuredIngredient(index, "unit", event.target.value)
                            }
                        />

                        <input
                            className="w-40 rounded-lg border border-zinc-600 bg-zinc-900 p-2 text-sm"
                            type="text"
                            placeholder="Ingredient"
                            value={ingredient.name}
                            onChange={(event) =>
                                updateStructuredIngredient(index, "name", event.target.value)
                            }
                        />

                        <button
                            className="w-10 rounded-lg border border-red-600 text-red-400 hover:bg-red-950 disabled:cursor-not-allowed disabled:opacity-40"
                            disabled={structuredIngredients.length === 1}
                            onClick={() => removeStructuredIngredient(index)}
                        >
                            X
                        </button>
                    </div>
                ))}
            </section>
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