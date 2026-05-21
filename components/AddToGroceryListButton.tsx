"use client";
import { addIngredientsToGroceryList } from "@/lib/groceryList";
import { addRecipeSlugToGroceryList } from "@/lib/groceryList";
import { useRouter } from "next/navigation";

type AddToGroceryListButtonProps = {
    slug: string;
    ingredients: string[];
}

export default function AddToGroceryListButton(props: AddToGroceryListButtonProps) {
    const router  = useRouter();
    return (
        <button
            className="cursor-pointer rounded-lg border border-zinc-600 px-3 py-2 text-sm font-medium hover:bg-zinc-800"
            onClick={() => {
                const confirmed = confirm("Add to Grocery List?");
                if (!confirmed) {
                    return;
                } 
                addIngredientsToGroceryList(props.ingredients);
                addRecipeSlugToGroceryList(props.slug);
                router.push("/");
            }}
        >
            Add to Grocery List
        </button>
    )
}